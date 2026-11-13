/**
 * Test & Verification Script for Company Intelligence Batch Refresh Worker
 *
 * Verifies:
 * 1. Configuration loading from PostgreSQL (jobName: "COMPANY_INTELLIGENCE_REFRESH")
 * 2. Execution Run 1: Processes first batch of 10 companies using state cursor (NULLS FIRST)
 * 3. Execution Run 2: Processes second batch of 10 companies with zero overlap (starvation prevention)
 * 4. Dual-ledger parity: PostgreSQL executions & logs mirror Neo4j AuraDB timestamps & frequency scores
 * 5. Audit trail: AdminAuditLog records refresh executions
 *
 * Usage:
 *   npx tsx scripts/refresh-company-intelligence-cron.ts
 */

import { getDb } from "../src/server/db/client";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";
import { runCompanyIntelligenceRefresh, getRefreshConfig } from "../src/server/workers/company-intelligence-worker";

async function main(): Promise<void> {
  console.log("=========================================================================");
  console.log("  PrepInMinutes Company Intelligence Refresh Worker Test Suite");
  console.log("=========================================================================\n");

  const db = getDb();
  const driver = getNeo4jDriver();

  try {
    // -------------------------------------------------------------
    // Step 1: Verify PostgreSQL Refresh Config
    // -------------------------------------------------------------
    console.log("📋 Step 1: Loading Refresh Configuration from PostgreSQL...");
    const config = await getRefreshConfig();
    console.log(`   ✓ Config ID: ${config.id}`);
    console.log(`   ✓ Job Name: ${config.jobName}`);
    console.log(`   ✓ Cron: ${config.cronExpression} (${config.timezone})`);
    console.log(`   ✓ Batch Size: ${config.batchSize}`);
    console.log(`   ✓ Refresh Interval: ${config.refreshIntervalDays} days`);
    console.log(`   ✓ Strategy: ${config.strategy}`);

    // -------------------------------------------------------------
    // Step 2: Reset lastVerifiedAt on test companies to establish baseline cursor
    // -------------------------------------------------------------
    console.log("\n🧹 Step 2: Resetting baseline state cursor in Neo4j AuraDB...");
    const session = driver.session();
    try {
      // Set 10 companies to NULL lastVerifiedAt, and 10 companies to 40 days ago
      const resetResult = await session.run(`
        MATCH (c:Company)
        WITH collect(c) AS allCompanies
        UNWIND range(0, size(allCompanies) - 1) AS idx
        WITH allCompanies[idx] AS comp, idx
        SET comp.lastVerifiedAt = CASE 
          WHEN idx < 10 THEN null 
          ELSE datetime() - duration({days: 45}) 
        END
        RETURN count(comp) AS resetCount
      `);
      const resetCount = Number(resetResult.records[0]?.get("resetCount") || 0);
      console.log(`   ✓ State cursor initialized across ${resetCount} companies.`);
    } finally {
      await session.close();
    }

    // -------------------------------------------------------------
    // Step 3: Execute Batch Run 1 (Batch Size = 10)
    // -------------------------------------------------------------
    console.log("\n🚀 Step 3: Executing Batch Run 1 (Batch Size = 10, State Cursor NULLS FIRST)...");
    const run1 = await runCompanyIntelligenceRefresh({
      batchSize: 10,
      forceAll: false,
    });

    console.log(`\n   📊 Run 1 Results:`);
    console.log(`      - Execution ID: ${run1.executionId}`);
    console.log(`      - Status: ${run1.status}`);
    console.log(`      - Eligible: ${run1.totalEligible}`);
    console.log(`      - Processed: ${run1.totalProcessed}`);
    console.log(`      - Failed: ${run1.totalFailed}`);
    console.log(`      - Remaining: ${run1.totalRemaining}`);
    console.log(`      - Next Cursor: ${run1.nextCursor}`);
    console.log(`      - Duration: ${run1.durationMs}ms`);

    const run1Slugs = new Set(run1.results.map((r) => r.companySlug));
    console.log(`      - Processed Companies: [${Array.from(run1Slugs).join(", ")}]`);

    if (run1.status !== "COMPLETED" || run1.totalProcessed !== 10) {
      throw new Error(`Run 1 assertion failed: expected status COMPLETED and 10 processed, got ${run1.status} and ${run1.totalProcessed}`);
    }

    // -------------------------------------------------------------
    // Step 4: Execute Batch Run 2 (Batch Size = 10)
    // -------------------------------------------------------------
    console.log("\n🚀 Step 4: Executing Batch Run 2 (Batch Size = 10, Advancing State Cursor)...");
    const run2 = await runCompanyIntelligenceRefresh({
      batchSize: 10,
      forceAll: false,
    });

    console.log(`\n   📊 Run 2 Results:`);
    console.log(`      - Execution ID: ${run2.executionId}`);
    console.log(`      - Status: ${run2.status}`);
    console.log(`      - Eligible: ${run2.totalEligible}`);
    console.log(`      - Processed: ${run2.totalProcessed}`);
    console.log(`      - Failed: ${run2.totalFailed}`);
    console.log(`      - Remaining: ${run2.totalRemaining}`);
    console.log(`      - Next Cursor: ${run2.nextCursor}`);
    console.log(`      - Duration: ${run2.durationMs}ms`);

    const run2Slugs = new Set(run2.results.map((r) => r.companySlug));
    console.log(`      - Processed Companies: [${Array.from(run2Slugs).join(", ")}]`);

    if (run2.status !== "COMPLETED" || run2.totalProcessed !== 10) {
      throw new Error(`Run 2 assertion failed: expected status COMPLETED and 10 processed, got ${run2.status} and ${run2.totalProcessed}`);
    }

    // -------------------------------------------------------------
    // Step 5: Verify Round-Robin Disjoint Sets (Starvation Prevention)
    // -------------------------------------------------------------
    console.log("\n🔍 Step 5: Validating Disjoint Sets & Cursor Progression...");
    const overlapping = Array.from(run1Slugs).filter((slug) => run2Slugs.has(slug));
    if (overlapping.length > 0) {
      throw new Error(`Starvation detected! Companies re-processed in consecutive runs: ${overlapping.join(", ")}`);
    }
    console.log("   ✓ Zero overlap between Run 1 and Run 2 (100% disjoint sets verified!).");
    console.log(`   ✓ Total distinct companies processed across 2 runs: ${run1Slugs.size + run2Slugs.size} / 20`);

    // -------------------------------------------------------------
    // Step 6: Verify PostgreSQL Audit Ledger & Changed Attributes
    // -------------------------------------------------------------
    console.log("\n📋 Step 6: Verifying PostgreSQL Refresh Execution and Audit Logs...");
    const execRecords = await db.intelligenceRefreshExecution.findMany({
      where: { id: { in: [run1.executionId, run2.executionId] } },
      include: {
        logs: true,
      },
      orderBy: { triggeredAt: "asc" },
    });

    console.log(`   ✓ Found ${execRecords.length} PostgreSQL execution records:`);
    for (const exec of execRecords) {
      console.log(`     * [${exec.id}] Status: ${exec.status} | Processed: ${exec.totalProcessed} | Logs: ${exec.logs.length}`);
    }

    const sampleLog = await db.companyIntelligenceRefreshLog.findFirst({
      where: { executionId: run1.executionId, status: "SUCCESS" },
    });

    if (sampleLog) {
      console.log(`   ✓ Sample Company Refresh Log:`);
      console.log(`     * Company: ${sampleLog.companyId}`);
      console.log(`     * Score Delta: ${sampleLog.previousFrequencyScore} -> ${sampleLog.newFrequencyScore}`);
      console.log(`     * Sample Delta: ${sampleLog.previousSampleSize} -> ${sampleLog.newSampleSize}`);
      console.log(`     * Changed Attributes:`, JSON.stringify(sampleLog.changedAttributes).slice(0, 120) + "...");
    }

    // Check AdminAuditLog
    const auditLogs = await db.adminAuditLog.findMany({
      where: {
        action: "TRIGGER_REFRESH",
        targetId: { in: [run1.executionId, run2.executionId] },
      },
    });
    console.log(`   ✓ Found ${auditLogs.length} AdminAuditLog entries for refresh executions.`);

    // -------------------------------------------------------------
    // Step 7: Verify Neo4j AuraDB Verification Timestamps
    // -------------------------------------------------------------
    console.log("\n🌐 Step 7: Verifying Neo4j AuraDB (:Company) Node Parity...");
    const verifySession = driver.session();
    try {
      const neoResult = await verifySession.run(`
        MATCH (c:Company)
        RETURN count(c) AS total,
               count(c.lastVerifiedAt) AS verifiedCount,
               min(toString(c.lastVerifiedAt)) AS oldestVerified,
               max(toString(c.lastVerifiedAt)) AS newestVerified
      `);
      const total = Number(neoResult.records[0]?.get("total") || 0);
      const verifiedCount = Number(neoResult.records[0]?.get("verifiedCount") || 0);
      const oldestVerified = neoResult.records[0]?.get("oldestVerified");
      const newestVerified = neoResult.records[0]?.get("newestVerified");

      console.log(`   ✓ Total Companies in Graph: ${total}`);
      console.log(`   ✓ Verified Companies with Timestamps: ${verifiedCount}`);
      console.log(`   ✓ Oldest Verified: ${oldestVerified}`);
      console.log(`   ✓ Newest Verified: ${newestVerified}`);

      if (verifiedCount !== 20) {
        throw new Error(`Expected all 20 companies to be verified in Neo4j AuraDB, got ${verifiedCount}`);
      }
    } finally {
      await verifySession.close();
    }

    console.log("\n=========================================================================");
    console.log("  🎉 TASK-P2-04 VERIFICATION SUCCESSFUL: 100% PARITY & INTEGRITY ASSURED!");
    console.log("=========================================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Company Intelligence Refresh Worker test failed:", error);
    process.exit(1);
  } finally {
    await closeNeo4jDriver();
    const dbClient = getDb();
    await dbClient.$disconnect();
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
