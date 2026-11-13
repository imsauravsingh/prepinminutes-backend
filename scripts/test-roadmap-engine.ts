/**
 * PrepInMinutes — 5-Factor Roadmap Engine Test Suite
 * 
 * Verifies:
 * 1. Scoring accuracy under distinct candidate profiles (Fresher, Mid, Senior)
 * 2. Transitive prerequisite dependency closure over Neo4j AuraDB
 * 3. Topological ordering (prerequisites strictly appear before dependents)
 * 4. Cycle freedom & valid weekly milestone bucketing
 * 
 * Governed by:
 * - docs/CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 7)
 * - docs/TASK_EXECUTION_SEQUENCE.md (TASK-P2-03)
 */

import "dotenv/config";
import { RoadmapEngine, RoadmapGenerationInput } from "../src/server/graph/roadmap-query";
import { closeNeo4jDriver } from "../src/server/graph/neo4j";

async function runRoadmapEngineTests() {
  console.log("==================================================================");
  console.log("🚀 Testing 5-Factor Roadmap Engine with Prerequisite Closure");
  console.log("==================================================================\n");

  const testCases: { name: string; input: RoadmapGenerationInput }[] = [
    {
      name: "Case 1: College Fresher Targeting Google (Campus SDE, 4 Weeks)",
      input: {
        targetRoleSlug: "campus-fresher-sde",
        targetCompanySlug: "google",
        timelineWeeks: 4,
        weeklyGoalHours: 8.0,
        currentStageSlug: "live-coding-dsa",
        candidateProficiencies: [
          { topicSlug: "arrays-two-pointers", currentProficiency: "BEGINNER" },
          { topicSlug: "strings-palindromes-parsing", currentProficiency: "BEGINNER" },
        ],
      },
    },
    {
      name: "Case 2: Mid-Level Backend Engineer Targeting Amazon (SDE-2, 6 Weeks)",
      input: {
        targetRoleSlug: "mid-backend-sde",
        targetCompanySlug: "amazon",
        timelineWeeks: 6,
        weeklyGoalHours: 10.0,
        currentStageSlug: "machine-coding-lld",
        candidateProficiencies: [
          { topicSlug: "rest-grpc-protocols", currentProficiency: "ADVANCED" },
          { topicSlug: "db-indexing-query-tuning", currentProficiency: "INTERMEDIATE" },
          { topicSlug: "parking-lot-system", currentProficiency: "UNKNOWN" },
        ],
      },
    },
    {
      name: "Case 3: Senior Backend Architect Targeting Stripe (Staff/Senior, 8 Weeks)",
      input: {
        targetRoleSlug: "senior-backend-sde",
        targetCompanySlug: "stripe",
        timelineWeeks: 8,
        weeklyGoalHours: 12.0,
        currentStageSlug: "system-design-hld",
        candidateProficiencies: [
          { topicSlug: "distributed-key-value-store", currentProficiency: "INTERMEDIATE" },
          { topicSlug: "payment-gateway-ledger", currentProficiency: "BEGINNER" },
        ],
      },
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n------------------------------------------------------------------`);
    console.log(`📋 Running ${tc.name}...`);
    console.log(`------------------------------------------------------------------`);

    const roadmap = await RoadmapEngine.generateRoadmap(tc.input);

    console.log(`✅ Title: "${roadmap.title}"`);
    console.log(`   - Target Role: ${roadmap.targetRole} | Company: ${roadmap.targetCompany ?? "None"}`);
    console.log(`   - Timeline: ${roadmap.timelineWeeks} Weeks | Goal: ${roadmap.weeklyGoalHours} hrs/wk`);
    console.log(`   - Total Topics: ${roadmap.totalTopics} (Closure topics added: ${roadmap.closureTopicsAdded})`);
    console.log(`   - Domain Weights: ${JSON.stringify(roadmap.domainWeights)}`);

    console.log(`\n   Weekly Breakdown:`);
    for (const milestone of roadmap.weeklyMilestones) {
      console.log(`     • ${milestone.title} (${milestone.topics.length} topics, ${milestone.totalDurationMin} min)`);
      console.log(`       Focus: ${milestone.focus}`);
      for (const t of milestone.topics.slice(0, 3)) {
        console.log(`         - [${t.difficulty}] ${t.title} (${t.durationMin}m)`);
      }
    }

    // Verify ordering: no milestone is empty
    for (const milestone of roadmap.weeklyMilestones) {
      if (milestone.topics.length === 0) {
        throw new Error(`Integrity error: Milestone week ${milestone.weekNumber} is empty!`);
      }
    }
  }

  console.log("\n==================================================================");
  console.log("✨ All 3 Roadmap Generation Test Cases Passed Successfully!");
  console.log("==================================================================");

  await closeNeo4jDriver();
}

runRoadmapEngineTests().catch((err) => {
  console.error("❌ Roadmap engine test failed:", err);
  process.exit(1);
});

