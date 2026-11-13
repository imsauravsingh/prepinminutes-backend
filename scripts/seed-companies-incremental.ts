/**
 * PrepInMinutes — Incremental Seed Script for 20 Canonical Companies, Stages & Formats (TASK-P2-02)
 * 
 * Creates:
 * 1. Uniqueness constraints for Company, InterviewStage, and InterviewFormat.
 * 2. 6 (:InterviewFormat) nodes with tooling and pacing contracts.
 * 3. 9 (:InterviewStage) nodes with target domains and evaluation focus.
 * 4. 20 (:Company) nodes representing Tier-1 tech employers with culture philosophy.
 * 5. M:N (:Company)-[:USES_STAGE]->(:InterviewStage) verified hiring loops.
 * 6. (:InterviewStage)-[:CONDUCTED_VIA]->(:InterviewFormat) decoupled format bindings.
 * 7. (:Topic)-[:TESTED_IN_STAGE]->(:InterviewStage) curriculum alignments.
 * 8. (:Topic)-[:FREQUENTLY_ASKED_AT]->(:Company) evidence-backed statistical provenance.
 * 
 * Governed by:
 * - docs/CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 3, 4, 5)
 * - docs/TASK_EXECUTION_SEQUENCE.md (TASK-P2-02)
 */

import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";
import {
  CANONICAL_COMPANIES,
  CANONICAL_STAGES,
  CANONICAL_FORMATS,
  CANONICAL_COMPANY_TOPICS,
} from "./seed-data/companies";

async function seedCompaniesIncremental() {
  const startTime = Date.now();
  console.log("==================================================================");
  console.log("🚀 Starting PrepInMinutes Companies & Interview Loops Seeding (TASK-P2-02)");
  console.log("==================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // -------------------------------------------------------------
    // Step 1: Ensure Constraints
    // -------------------------------------------------------------
    console.log("🛡️ Step 1: Ensuring Uniqueness Constraints...");
    await session.run(`
      CREATE CONSTRAINT company_slug_unique IF NOT EXISTS
      FOR (c:Company) REQUIRE c.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT stage_slug_unique IF NOT EXISTS
      FOR (s:InterviewStage) REQUIRE s.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT format_slug_unique IF NOT EXISTS
      FOR (f:InterviewFormat) REQUIRE f.slug IS UNIQUE
    `);
    console.log("   ✅ Constraints active: company_slug_unique, stage_slug_unique, format_slug_unique.");

    // -------------------------------------------------------------
    // Step 2: Merge 6 Interview Formats
    // -------------------------------------------------------------
    console.log(`\n🛠️ Step 2: Merging ${CANONICAL_FORMATS.length} Interview Formats...`);
    const formatParams = CANONICAL_FORMATS.map((f) => ({
      slug: f.slug,
      name: f.name,
      defaultTimeboxMin: f.defaultTimeboxMin,
      toolingAndPacing: f.toolingAndPacing,
    }));

    await session.run(
      `
      UNWIND $formats AS fmt
      MERGE (f:InterviewFormat {slug: fmt.slug})
      SET f.name = fmt.name,
          f.defaultTimeboxMin = fmt.defaultTimeboxMin,
          f.toolingAndPacing = fmt.toolingAndPacing,
          f.updatedAt = datetime()
      `,
      { formats: formatParams }
    );
    console.log(`   ✅ Merged ${CANONICAL_FORMATS.length} (:InterviewFormat) nodes.`);

    // -------------------------------------------------------------
    // Step 3: Merge 9 Interview Stages & Format Connections
    // -------------------------------------------------------------
    console.log(`\n🎯 Step 3: Merging ${CANONICAL_STAGES.length} Interview Stages & Formats...`);
    const stageParams = CANONICAL_STAGES.map((s) => ({
      slug: s.slug,
      name: s.name,
      defaultTimeboxMin: s.defaultTimeboxMin,
      evaluativeFocus: s.evaluativeFocus,
      targetDomains: s.targetDomains,
    }));

    await session.run(
      `
      UNWIND $stages AS stg
      MERGE (s:InterviewStage {slug: stg.slug})
      SET s.name = stg.name,
          s.defaultTimeboxMin = stg.defaultTimeboxMin,
          s.evaluativeFocus = stg.evaluativeFocus,
          s.targetDomains = stg.targetDomains,
          s.updatedAt = datetime()
      `,
      { stages: stageParams }
    );

    // Merge [:CONDUCTED_VIA]
    const stageFormatEdges: {
      stageSlug: string;
      formatSlug: string;
      isDefault: boolean;
      pacingNotes: string;
    }[] = [];

    for (const stage of CANONICAL_STAGES) {
      for (const fmt of stage.formats) {
        stageFormatEdges.push({
          stageSlug: stage.slug,
          formatSlug: fmt.formatSlug,
          isDefault: fmt.isDefault,
          pacingNotes: fmt.pacingNotes,
        });
      }
    }

    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (s:InterviewStage {slug: edge.stageSlug})
      MATCH (f:InterviewFormat {slug: edge.formatSlug})
      MERGE (s)-[rel:CONDUCTED_VIA]->(f)
      SET rel.isDefault = edge.isDefault,
          rel.pacingNotes = edge.pacingNotes,
          rel.updatedAt = datetime()
      `,
      { edges: stageFormatEdges }
    );
    console.log(`   ✅ Merged ${CANONICAL_STAGES.length} (:InterviewStage) nodes and ${stageFormatEdges.length} [:CONDUCTED_VIA] links.`);

    // -------------------------------------------------------------
    // Step 4: Link Topics to Stages: (:Topic)-[:TESTED_IN_STAGE]->(:InterviewStage)
    // -------------------------------------------------------------
    console.log("\n📚 Step 4: Linking Curriculum Topics to Interview Stages...");
    await session.run(`
      MATCH (s:InterviewStage)
      UNWIND s.targetDomains AS domainSlug
      MATCH (d:Domain {slug: domainSlug})-[:CONTAINS]->(:Category)-[:HAS_TOPIC]->(t:Topic)
      MERGE (t)-[rel:TESTED_IN_STAGE]->(s)
      SET rel.updatedAt = datetime()
    `);
    const testedInStageCountRes = await session.run(`MATCH ()-[rel:TESTED_IN_STAGE]->() RETURN count(rel) AS count`);
    console.log(`   ✅ Created ${testedInStageCountRes.records[0].get("count").toInt()} [:TESTED_IN_STAGE] relationships.`);

    // -------------------------------------------------------------
    // Step 5: Merge 20 Companies
    // -------------------------------------------------------------
    console.log(`\n🏢 Step 5: Merging ${CANONICAL_COMPANIES.length} Tier-1 Tech Companies...`);
    const companyParams = CANONICAL_COMPANIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      tier: c.tier,
      culturePhilosophy: c.culturePhilosophy,
      primaryPillars: c.primaryPillars,
      websiteUrl: c.websiteUrl,
    }));

    await session.run(
      `
      UNWIND $companies AS comp
      MERGE (c:Company {slug: comp.slug})
      SET c.name = comp.name,
          c.tier = comp.tier,
          c.culturePhilosophy = comp.culturePhilosophy,
          c.primaryPillars = comp.primaryPillars,
          c.websiteUrl = comp.websiteUrl,
          c.lastVerifiedAt = coalesce(c.lastVerifiedAt, datetime()),
          c.updatedAt = datetime()
      `,
      { companies: companyParams }
    );
    console.log(`   ✅ Merged ${CANONICAL_COMPANIES.length} (:Company) nodes.`);

    // -------------------------------------------------------------
    // Step 6: Connect Companies to Interview Stage Loops: [:USES_STAGE]
    // -------------------------------------------------------------
    console.log("\n🔄 Step 6: Merging Company Interview Loops ([:USES_STAGE])...");
    const companyStageEdges: {
      companySlug: string;
      stageSlug: string;
      roundOrder: number;
      isEliminationRound: boolean;
      stageWeight: number;
    }[] = [];

    for (const comp of CANONICAL_COMPANIES) {
      for (const stg of comp.hiringStages) {
        companyStageEdges.push({
          companySlug: comp.slug,
          stageSlug: stg.stageSlug,
          roundOrder: stg.roundOrder,
          isEliminationRound: stg.isEliminationRound,
          stageWeight: stg.stageWeight,
        });
      }
    }

    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (c:Company {slug: edge.companySlug})
      MATCH (s:InterviewStage {slug: edge.stageSlug})
      MERGE (c)-[rel:USES_STAGE {roundOrder: edge.roundOrder}]->(s)
      SET rel.isEliminationRound = edge.isEliminationRound,
          rel.stageWeight = edge.stageWeight,
          rel.updatedAt = datetime()
      `,
      { edges: companyStageEdges }
    );
    console.log(`   ✅ Merged ${companyStageEdges.length} [:USES_STAGE] hiring loop relationships.`);

    // -------------------------------------------------------------
    // Step 7: Merge High-Frequency Topic Evidence: [:FREQUENTLY_ASKED_AT]
    // -------------------------------------------------------------
    console.log(`\n📈 Step 7: Merging ${CANONICAL_COMPANY_TOPICS.length} Evidence-Backed [:FREQUENTLY_ASKED_AT] Provenance Links...`);
    const topicFreqParams = CANONICAL_COMPANY_TOPICS.map((tf) => ({
      topicSlug: tf.topicSlug,
      companySlug: tf.companySlug,
      frequencyScore: tf.frequencyScore,
      confidenceScore: tf.confidenceScore,
      sampleSize: tf.sampleSize,
      sourceType: tf.sourceType,
      primaryStage: tf.primaryStage,
      weight: tf.weight,
    }));

    await session.run(
      `
      UNWIND $freqs AS tf
      MATCH (t:Topic {slug: tf.topicSlug})
      MATCH (c:Company {slug: tf.companySlug})
      MERGE (t)-[rel:FREQUENTLY_ASKED_AT]->(c)
      SET rel.frequencyScore = tf.frequencyScore,
          rel.confidenceScore = tf.confidenceScore,
          rel.sampleSize = tf.sampleSize,
          rel.sourceType = tf.sourceType,
          rel.primaryStage = tf.primaryStage,
          rel.weight = tf.weight,
          rel.lastVerifiedAt = datetime(),
          rel.updatedAt = datetime()
      `,
      { freqs: topicFreqParams }
    );
    console.log(`   ✅ Merged ${CANONICAL_COMPANY_TOPICS.length} [:FREQUENTLY_ASKED_AT] edges.`);

    // -------------------------------------------------------------
    // Step 8: Post-Seed Verification & Graph Integrity Checks
    // -------------------------------------------------------------
    console.log("\n📊 Step 8: Running Graph Verification Queries...");

    const compCountRes = await session.run(`MATCH (c:Company) RETURN count(c) AS count`);
    const stageCountRes = await session.run(`MATCH (s:InterviewStage) RETURN count(s) AS count`);
    const formatCountRes = await session.run(`MATCH (f:InterviewFormat) RETURN count(f) AS count`);
    const usesStageCountRes = await session.run(`MATCH ()-[rel:USES_STAGE]->() RETURN count(rel) AS count`);
    const conductedViaCountRes = await session.run(`MATCH ()-[rel:CONDUCTED_VIA]->() RETURN count(rel) AS count`);
    const freqCountRes = await session.run(`MATCH ()-[rel:FREQUENTLY_ASKED_AT]->() RETURN count(rel) AS count`);

    const totalCompanies = compCountRes.records[0].get("count").toInt();
    const totalStages = stageCountRes.records[0].get("count").toInt();
    const totalFormats = formatCountRes.records[0].get("count").toInt();
    const totalUsesStage = usesStageCountRes.records[0].get("count").toInt();
    const totalConductedVia = conductedViaCountRes.records[0].get("count").toInt();
    const totalFreq = freqCountRes.records[0].get("count").toInt();

    const sampleLoopRes = await session.run(`
      MATCH (c:Company {slug: 'amazon'})-[u:USES_STAGE]->(s:InterviewStage)-[cv:CONDUCTED_VIA]->(f:InterviewFormat)
      WHERE cv.isDefault = true
      RETURN c.name AS company, u.roundOrder AS round, s.name AS stage, u.isEliminationRound AS elimination, f.name AS format
      ORDER BY round
    `);

    const sampleFreqRes = await session.run(`
      MATCH (t:Topic)-[f:FREQUENTLY_ASKED_AT]->(c:Company)
      RETURN c.name AS company, t.title AS topic, f.frequencyScore AS freq, f.confidenceScore AS conf, f.sampleSize AS sample
      ORDER BY f.frequencyScore DESC
      LIMIT 5
    `);

    console.log("\n==================================================================");
    console.log("📈 Verification Metrics:");
    console.log(`   - Total (:Company) Nodes: ${totalCompanies} (Expected: 20)`);
    console.log(`   - Total (:InterviewStage) Nodes: ${totalStages} (Expected: 9)`);
    console.log(`   - Total (:InterviewFormat) Nodes: ${totalFormats} (Expected: 6)`);
    console.log(`   - Total [:USES_STAGE] Edges: ${totalUsesStage}`);
    console.log(`   - Total [:CONDUCTED_VIA] Edges: ${totalConductedVia}`);
    console.log(`   - Total [:FREQUENTLY_ASKED_AT] Edges: ${totalFreq}`);
    console.log("==================================================================");

    console.log("\nSample Verified Amazon Interview Loop:");
    for (const r of sampleLoopRes.records) {
      console.log(`   Round ${r.get("round")}: ${r.get("stage")} [${r.get("format")}] ${r.get("elimination") ? "(ELIMINATION)" : ""}`);
    }

    console.log("\nSample Verified High-Frequency Company Topics:");
    for (const r of sampleFreqRes.records) {
      console.log(`   • [${r.get("company")}] "${r.get("topic")}" — Freq: ${r.get("freq")}%, Conf: ${r.get("conf")}, Sample: ${r.get("sample")}`);
    }

    if (totalCompanies !== 20 || totalStages !== 9 || totalFormats !== 6) {
      throw new Error(`Integrity check failed: Expected 20 companies, 9 stages, 6 formats.`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ TASK-P2-02 Companies, Stages & Formats Seeding completed successfully in ${elapsed}s!`);
  } catch (err) {
    console.error("\n❌ Error during Companies incremental seeding:", err);
    throw err;
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

seedCompaniesIncremental().catch((err) => {
  console.error(err);
  process.exit(1);
});
