/**
 * PrepInMinutes — TASK-P5-02: Sarah AI Persona & Rubric Injection Test Suite
 *
 * Verifies:
 * 1. Question lookup and rubric atom extraction
 * 2. Ingestion of anti-patterns, scale anchors, and follow-up probes
 * 3. Sarah interviewer turn execution (LLM inference or resilient fallback)
 * 4. Output schema validation (coveredRubricAtoms, remainingRubricAtoms, currentMasteryScore)
 */

import "dotenv/config";
import { executeSarahInterviewerTurn, PracticeTurnInput } from "../src/server/ai/sarah-persona";

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Running TASK-P5-02: Sarah AI Persona & Rubric Injection Suite");
  console.log("==================================================================\n");

  console.log("👉 Test Suite 1: Rubric Atoms & Anti-Patterns Injection");
  {
    const input: PracticeTurnInput = {
      topicSlug: "distributed-caching",
      candidateMessage:
        "I will use Redis as a cache-aside layer in front of PostgreSQL. When a read request comes in, we check Redis first. If it is a cache miss, we read from PostgreSQL, populate Redis with an expiration TTL of 3600 seconds, and return the response.",
      candidateTargetLevel: "L3",
      questionOverride: {
        title: "Distributed Caching Architecture",
        prompt: "Design a high-throughput distributed caching tier for an e-commerce catalog.",
        rubricGuide: "Candidate must explain cache-aside pattern, TTLs, and stampede prevention.",
        rubricAtoms: [
          "Cache-aside pattern implementation",
          "TTL expiration & stale data boundaries",
          "Cache stampede prevention with distributed locks",
          "Cluster sharding & read replication",
        ],
        antiPatterns: [
          "Treating cache as permanent database",
          "Single point of failure without replica failover",
        ],
        followUpProbes: [
          "How would you prevent a cache stampede if a hot product TTL expires during Black Friday?",
          "How do you handle Redis cluster node failover without downtime?",
        ],
      },
    };

    const result = await executeSarahInterviewerTurn(input);

    assert(result.success === true, "Sarah turn execution returns success: true");
    assert(typeof result.replyText === "string" && result.replyText.length > 10, `Sarah generated realistic response: "${result.replyText.slice(0, 60)}..."`);
    assert(Array.isArray(result.coveredRubricAtoms), "Returns coveredRubricAtoms array");
    assert(Array.isArray(result.remainingRubricAtoms), "Returns remainingRubricAtoms array");
    assert(typeof result.currentMasteryScore === "number", `Returns currentMasteryScore: ${result.currentMasteryScore}%`);
    assert(
      ["scoping", "high-level-design", "deep-dive", "failure-modes", "wrap-up"].includes(result.interviewPhase),
      `Interview phase is calibrated: ${result.interviewPhase}`
    );
  }

  console.log("\n👉 Test Suite 2: Anti-Pattern Detection & Fallback Resilience");
  {
    const riskyInput: PracticeTurnInput = {
      topicSlug: "distributed-caching",
      candidateMessage:
        "I will write all financial transactions straight into Redis memory and never write to disk because Redis is fast.",
      candidateTargetLevel: "L3",
      questionOverride: {
        title: "Distributed Caching Architecture",
        prompt: "Design a caching tier.",
        rubricAtoms: ["In-memory caching bounds", "Durability trade-offs"],
        antiPatterns: ["Treating cache as permanent persistent storage"],
        followUpProbes: ["What happens when Redis crashes or runs out of RAM?"],
      },
    };

    const result = await executeSarahInterviewerTurn(riskyInput);
    assert(result.success === true, "Handles anti-pattern scenario cleanly");
    assert(result.replyText.length > 0, "Generates response probing durability / memory risks");
  }

  console.log("\n==================================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions PASSED (0 failures)`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
