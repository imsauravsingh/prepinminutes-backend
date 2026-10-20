/**
 * PrepInMinutes — Neo4j Schema Constraints & Admin Status Properties Initializer
 *
 * Enforces:
 * 1. Unique constraints on Domain.slug, Category.slug, Topic.slug, Question.id
 * 2. Backfills status = 'PUBLISHED' and isLive = true on any existing unflagged nodes
 */

import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";

async function setupNeo4jAdminConstraints() {
  console.log("=================================================================");
  console.log("   Neo4j Knowledge Graph Constraints & Status Initializer        ");
  console.log("=================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    console.log("1. Creating unique constraints if not already present...");
    await session.run(`
      CREATE CONSTRAINT domain_slug_unique IF NOT EXISTS
      FOR (d:Domain) REQUIRE d.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT category_slug_unique IF NOT EXISTS
      FOR (c:Category) REQUIRE c.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT topic_slug_unique IF NOT EXISTS
      FOR (t:Topic) REQUIRE t.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT question_id_unique IF NOT EXISTS
      FOR (q:Question) REQUIRE q.id IS UNIQUE
    `);
    console.log("  ✓ Constraints verified on Domain, Category, Topic, and Question.");

    console.log("\n2. Backfilling default status ('PUBLISHED') and isLive (true) on existing nodes...");
    
    // Domain backfill
    const domainRes = await session.run(`
      MATCH (d:Domain)
      WHERE d.status IS NULL OR d.isLive IS NULL
      SET d.status = coalesce(d.status, 'PUBLISHED'),
          d.isLive = coalesce(d.isLive, true)
      RETURN count(d) as updatedCount
    `);
    console.log(`  ✓ Backfilled ${domainRes.records[0]?.get("updatedCount") || 0} Domain nodes.`);

    // Category backfill
    const catRes = await session.run(`
      MATCH (c:Category)
      WHERE c.status IS NULL OR c.isLive IS NULL
      SET c.status = coalesce(c.status, 'PUBLISHED'),
          c.isLive = coalesce(c.isLive, true)
      RETURN count(c) as updatedCount
    `);
    console.log(`  ✓ Backfilled ${catRes.records[0]?.get("updatedCount") || 0} Category nodes.`);

    // Topic backfill
    const topicRes = await session.run(`
      MATCH (t:Topic)
      WHERE t.status IS NULL OR t.isLive IS NULL
      SET t.status = coalesce(t.status, 'PUBLISHED'),
          t.isLive = coalesce(t.isLive, true)
      RETURN count(t) as updatedCount
    `);
    console.log(`  ✓ Backfilled ${topicRes.records[0]?.get("updatedCount") || 0} Topic nodes.`);

    // Question backfill
    const qRes = await session.run(`
      MATCH (q:Question)
      WHERE q.status IS NULL OR q.isLive IS NULL OR q.version IS NULL
      SET q.status = coalesce(q.status, 'PUBLISHED'),
          q.isLive = coalesce(q.isLive, true),
          q.version = coalesce(q.version, 1)
      RETURN count(q) as updatedCount
    `);
    console.log(`  ✓ Backfilled ${qRes.records[0]?.get("updatedCount") || 0} Question nodes.`);

    // Verification summary
    console.log("\n3. Current Graph Node Status Counts:");
    const summaryRes = await session.run(`
      MATCH (n)
      WHERE n:Domain OR n:Category OR n:Topic OR n:Question
      RETURN labels(n)[0] AS nodeType, n.status AS status, n.isLive AS isLive, count(n) AS cnt
      ORDER BY nodeType, status
    `);

    summaryRes.records.forEach((r) => {
      console.log(`  • ${r.get("nodeType")}: status=${r.get("status")}, isLive=${r.get("isLive")} => ${r.get("cnt")} nodes`);
    });

    console.log("\n=================================================================");
    console.log("   ✓ Neo4j Schema Constraints & Backfill Completed Successfully! ");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("Failed to setup Neo4j constraints:", error);
    process.exit(1);
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

setupNeo4jAdminConstraints();

