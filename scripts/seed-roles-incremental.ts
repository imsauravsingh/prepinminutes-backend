/**
 * PrepInMinutes — Incremental Seed Script for 28 Canonical Roles & Career Bands
 * 
 * Creates:
 * 1. Role slug uniqueness constraint in Neo4j AuraDB.
 * 2. 28 (:Role) nodes across 7 standardized career bands (STUDENT_FRESHER to PRINCIPAL & MANAGEMENT).
 * 3. Comprehensive [:REQUIRES_TOPIC] graph edges linking to all 371 curriculum topics with 0 dangling edges.
 * 
 * Governed by:
 * - docs/CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 2)
 * - docs/TASK_EXECUTION_SEQUENCE.md (TASK-P2-01)
 */

import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";
import { CANONICAL_ROLES, DOMAIN_ROLE_AFFINITIES, RoleSeed } from "./seed-data/roles";

interface TopicDbInfo {
  slug: string;
  domainSlug: string;
  difficulty: string;
}

async function seedRolesIncremental() {
  const startTime = Date.now();
  console.log("==================================================================");
  console.log("🚀 Starting PrepInMinutes Roles & Career Bands Seeding (TASK-P2-01)");
  console.log("==================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // -------------------------------------------------------------
    // Step 1: Ensure Role Slug Uniqueness Constraint
    // -------------------------------------------------------------
    console.log("🛡️ Step 1: Ensuring Role uniqueness constraints...");
    await session.run(`
      CREATE CONSTRAINT role_slug_unique IF NOT EXISTS
      FOR (r:Role) REQUIRE r.slug IS UNIQUE
    `);
    console.log("   ✅ Constraint 'role_slug_unique' is active.");

    // -------------------------------------------------------------
    // Step 2: Merge 28 Role Nodes
    // -------------------------------------------------------------
    console.log(`\n👥 Step 2: Merging ${CANONICAL_ROLES.length} Canonical Role nodes...`);
    const roleParams = CANONICAL_ROLES.map((r) => ({
      slug: r.slug,
      name: r.name,
      careerBand: r.careerBand,
      track: r.track,
      description: r.description,
      minProficiency: r.minProficiency,
      minExperienceYears: r.minExperienceYears,
      maxExperienceYears: r.maxExperienceYears,
      companyEquivalents: JSON.stringify(r.companyEquivalents),
    }));

    await session.run(
      `
      UNWIND $roles AS role
      MERGE (r:Role {slug: role.slug})
      SET r.name = role.name,
          r.careerBand = role.careerBand,
          r.track = role.track,
          r.description = role.description,
          r.minProficiency = role.minProficiency,
          r.minExperienceYears = role.minExperienceYears,
          r.maxExperienceYears = role.maxExperienceYears,
          r.companyEquivalents = role.companyEquivalents,
          r.updatedAt = datetime()
      `,
      { roles: roleParams }
    );
    console.log(`   ✅ Successfully merged ${CANONICAL_ROLES.length} Role nodes.`);

    // -------------------------------------------------------------
    // Step 3: Fetch Ground-Truth Topics & Domains from Neo4j AuraDB
    // -------------------------------------------------------------
    console.log("\n🔍 Step 3: Inspecting all curriculum topics in Neo4j AuraDB...");
    const topicQueryResult = await session.run(`
      MATCH (d:Domain)-[:CONTAINS]->(:Category)-[:HAS_TOPIC]->(t:Topic)
      RETURN t.slug AS slug, d.slug AS domainSlug, coalesce(t.difficulty, 'INTERMEDIATE') AS difficulty
    `);

    const dbTopics: TopicDbInfo[] = topicQueryResult.records.map((rec) => ({
      slug: rec.get("slug"),
      domainSlug: rec.get("domainSlug"),
      difficulty: rec.get("difficulty"),
    }));

    const topicMap = new Map<string, TopicDbInfo>();
    for (const t of dbTopics) {
      topicMap.set(t.slug, t);
    }
    console.log(`   ✅ Found ${dbTopics.length} total topics across active domains.`);

    // -------------------------------------------------------------
    // Step 4: Build [:REQUIRES_TOPIC] Relationship Matrix
    // -------------------------------------------------------------
    console.log("\n🔗 Step 4: Generating [:REQUIRES_TOPIC] semantic edges...");

    // Map: roleSlug -> Set of topicSlugs
    const roleTopicEdges: {
      roleSlug: string;
      topicSlug: string;
      isCore: boolean;
      priorityScore: number;
      targetLevel: string;
      minimumDifficulty: string;
    }[] = [];

    const mappedTopicSlugs = new Set<string>();

    // 4.1 Process explicitly defined role requirements
    for (const role of CANONICAL_ROLES) {
      for (const req of role.requiredTopics) {
        if (topicMap.has(req.topicSlug)) {
          roleTopicEdges.push({
            roleSlug: role.slug,
            topicSlug: req.topicSlug,
            isCore: req.isCore,
            priorityScore: req.priorityScore,
            targetLevel: req.targetLevel,
            minimumDifficulty: req.minimumDifficulty,
          });
          mappedTopicSlugs.add(req.topicSlug);
        } else {
          console.warn(`   ⚠️ Warning: Curated topic slug '${req.topicSlug}' not found in Neo4j AuraDB (role: ${role.slug})`);
        }
      }
    }

    console.log(`   - Explicitly mapped topics: ${mappedTopicSlugs.size} / ${dbTopics.length}`);

    // 4.2 Prerequisite Closure: Ensure every unmapped topic is linked to appropriate domain roles
    const unmappedTopics = dbTopics.filter((t) => !mappedTopicSlugs.has(t.slug));
    if (unmappedTopics.length > 0) {
      console.log(`   - Bridging ${unmappedTopics.length} unmapped topics using domain-role affinities...`);
      for (const t of unmappedTopics) {
        const affinities = DOMAIN_ROLE_AFFINITIES[t.domainSlug] || [
          { roleSlug: "senior-general-sde", isCore: false, priority: 75 },
        ];

        for (const aff of affinities) {
          roleTopicEdges.push({
            roleSlug: aff.roleSlug,
            topicSlug: t.slug,
            isCore: aff.isCore,
            priorityScore: aff.priority,
            targetLevel: "L3",
            minimumDifficulty: t.difficulty,
          });
        }
        mappedTopicSlugs.add(t.slug);
      }
    }

    console.log(`   ✅ Total relationships queued: ${roleTopicEdges.length} (Coverage: ${mappedTopicSlugs.size} / ${dbTopics.length} topics)`);

    // -------------------------------------------------------------
    // Step 5: Batch Merge [:REQUIRES_TOPIC] Edges
    // -------------------------------------------------------------
    console.log("\n⚡ Step 5: Merging [:REQUIRES_TOPIC] edges into Neo4j in batches...");
    const BATCH_SIZE = 500;
    for (let i = 0; i < roleTopicEdges.length; i += BATCH_SIZE) {
      const batch = roleTopicEdges.slice(i, i + BATCH_SIZE);
      await session.run(
        `
        UNWIND $batch AS edge
        MATCH (r:Role {slug: edge.roleSlug})
        MATCH (t:Topic {slug: edge.topicSlug})
        MERGE (r)-[rel:REQUIRES_TOPIC]->(t)
        SET rel.isCore = edge.isCore,
            rel.priorityScore = edge.priorityScore,
            rel.targetLevel = edge.targetLevel,
            rel.minimumDifficulty = edge.minimumDifficulty,
            rel.updatedAt = datetime()
        `,
        { batch }
      );
      process.stdout.write(`   - Processed edges ${Math.min(i + BATCH_SIZE, roleTopicEdges.length)} / ${roleTopicEdges.length}\r`);
    }
    console.log(`\n   ✅ All ${roleTopicEdges.length} [:REQUIRES_TOPIC] edges committed.`);

    // -------------------------------------------------------------
    // Step 6: Post-Seed Verification & Graph Integrity Checks
    // -------------------------------------------------------------
    console.log("\n📊 Step 6: Running Graph Integrity Verification Checks...");

    const roleCountRes = await session.run(`MATCH (r:Role) RETURN count(r) AS totalRoles`);
    const totalRoles = roleCountRes.records[0].get("totalRoles").toInt();

    const edgeCountRes = await session.run(`MATCH ()-[rel:REQUIRES_TOPIC]->() RETURN count(rel) AS totalEdges`);
    const totalEdges = edgeCountRes.records[0].get("totalEdges").toInt();

    const bandDistributionRes = await session.run(`
      MATCH (r:Role)
      RETURN r.careerBand AS band, count(r) AS count
      ORDER BY count DESC
    `);
    const bandDist = bandDistributionRes.records.map((r) => `${r.get("band")}: ${r.get("count").toInt()}`).join(", ");

    const trackDistributionRes = await session.run(`
      MATCH (r:Role)
      RETURN r.track AS track, count(r) AS count
      ORDER BY count DESC
    `);
    const trackDist = trackDistributionRes.records.map((r) => `${r.get("track")}: ${r.get("count").toInt()}`).join(", ");

    const unmappedTopicsRes = await session.run(`
      MATCH (t:Topic)
      WHERE NOT ()-[:REQUIRES_TOPIC]->(t)
      RETURN count(t) AS unmappedCount
    `);
    const unmappedCount = unmappedTopicsRes.records[0].get("unmappedCount").toInt();

    const samplePathRes = await session.run(`
      MATCH (r:Role)-[rel:REQUIRES_TOPIC]->(t:Topic)
      WHERE rel.isCore = true
      RETURN r.name AS role, t.title AS topic, rel.priorityScore AS priority, rel.targetLevel AS level
      LIMIT 5
    `);

    console.log("\n==================================================================");
    console.log("📈 Verification Metrics:");
    console.log(`   - Total (:Role) Nodes: ${totalRoles} (Expected: 28)`);
    console.log(`   - Career Bands Breakdown: ${bandDist}`);
    console.log(`   - Tracks Breakdown: ${trackDist}`);
    console.log(`   - Total [:REQUIRES_TOPIC] Edges: ${totalEdges}`);
    console.log(`   - Unmapped Dangling Topics: ${unmappedCount} (Expected: 0)`);
    console.log("==================================================================");

    console.log("\nSample Core Requirements:");
    for (const record of samplePathRes.records) {
      console.log(`   • [${record.get("role")}] -> "${record.get("topic")}" (Priority: ${record.get("priority")}, Level: ${record.get("level")})`);
    }

    if (totalRoles !== 28) {
      throw new Error(`Integrity check failed: Expected 28 roles, found ${totalRoles}`);
    }
    if (unmappedCount !== 0) {
      throw new Error(`Integrity check failed: Found ${unmappedCount} unmapped topics! Zero dangling edges violated.`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ TASK-P2-01 Roles Seeding & Topic Mapping completed successfully in ${elapsed}s!`);
  } catch (error) {
    console.error("\n❌ Error during Roles incremental seeding:", error);
    throw error;
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

seedRolesIncremental().catch((err) => {
  console.error(err);
  process.exit(1);
});
