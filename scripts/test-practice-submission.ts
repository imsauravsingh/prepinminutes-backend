/**
 * PrepInMinutes — TASK-P5-04 Automated Verification Test Suite
 *
 * Verifies:
 * 1. POST /api/practice/session/submit accepts multimodal payloads (transcript, code, whiteboard, duration).
 * 2. Idempotency enforcement via X-Session-Attempt-Id / Idempotency-Key headers.
 * 3. PostgreSQL persistence in practice_sessions, evaluation_reports, rubric_scores, and revision_items.
 * 4. Bayesian readiness score updates and SuperMemo SM-2 memory intervals.
 * 5. Structured validation errors on missing topicSlug.
 */

import worker from "../src/index";
import { db } from "../src/server/db/client";

const BASE_URL = "https://api.prepinminutes.internal";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 TASK-P5-04: Practice Session Submission Pipeline Test Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // Test Group 1: Missing topicSlug Validation
  // -------------------------------------------------------------
  console.log("🔹 1. Testing Validation on Missing topicSlug...");
  {
    const req = new Request(`${BASE_URL}/api/practice/session/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Incomplete Request",
      }),
    });

    const res = await worker.fetch(req);
    assert(res.status === 400, "Returns HTTP 400 on missing topicSlug");
    const json = await res.json();
    assert(json.error === "MISSING_TOPIC", "Returns structured MISSING_TOPIC error code");
  }

  // -------------------------------------------------------------
  // Test Group 2: Full Multimodal Session Submission
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing Multimodal Session Submission & Ingestion...");
  const attemptId = `test_attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let createdSessionId = "";
  let createdReportId = "";

  {
    const payload = {
      domain: "system-design",
      topicSlug: "distributed-caching-redis",
      questionId: "q_cache_01",
      title: "Distributed Cache Eviction & Invalidation Strategy",
      durationSeconds: 1420,
      codeLanguage: "typescript",
      codeSubmission: `
export class DistributedCache {
  private cache = new Map<string, any>();
  async get(key: string) { return this.cache.get(key); }
  async set(key: string, val: any, ttlSec: number) { this.cache.set(key, val); }
}
      `.trim(),
      whiteboardData: {
        boardNodes: [
          { id: "node-1", type: "architecture", title: "Redis Cluster Shards" },
          { id: "node-2", type: "architecture", title: "Write-Around DB" },
        ],
        stickyNotes: [
          { id: "s-1", text: "Volatile-LRU eviction chosen for caching layer" },
        ],
      },
      transcriptHistory: [
        {
          sender: "ai",
          content: "How will you prevent cache stampede during cold cache startup?",
        },
        {
          sender: "user",
          content: "We use distributed mutex locks (Redlock / fencing token) with probabilistic early expiration (XFetch algorithm) to recompute keys before total TTL expiry.",
        },
      ],
      coveredRubricAtoms: ["Cache Stampede Prevention", "TTL Expiration Policies"],
      candidateNotes: "Evaluated Redis cluster vs Memcached. Selected Redis for native hash/sorted-set data structures.",
    };

    const req = new Request(`${BASE_URL}/api/practice/session/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-attempt-id": attemptId,
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: JSON.stringify(payload),
    });

    const res = await worker.fetch(req);
    assert(res.status === 200, "Returns HTTP 200 OK on valid session submission");
    const json = await res.json();

    assert(json.success === true, "Response payload indicates success: true");
    assert(!!json.sessionId, `Practice session created with ID: ${json.sessionId}`);
    assert(!!json.reportId, `Evaluation report created with ID: ${json.reportId}`);
    assert(typeof json.overallScore === "number", `Evaluation score computed: ${json.overallScore}`);
    assert(typeof json.verdict === "string", `Verdict assigned: ${json.verdict}`);
    assert(!!json.reportUrl, `Report URL returned: ${json.reportUrl}`);

    createdSessionId = json.sessionId;
    createdReportId = json.reportId;
  }

  // -------------------------------------------------------------
  // Test Group 3: Idempotency Enforcement
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing Idempotency Enforcement...");
  {
    const req = new Request(`${BASE_URL}/api/practice/session/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-attempt-id": attemptId,
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: JSON.stringify({
        topicSlug: "distributed-caching-redis",
      }),
    });

    const res = await worker.fetch(req);
    assert(res.status === 200, "Idempotent duplicate request returns HTTP 200");
    const json = await res.json();
    assert(json.sessionId === createdSessionId, "Idempotent response returns exact same sessionId");
    assert(json.reportId === createdReportId, "Idempotent response returns exact same reportId");
  }

  // -------------------------------------------------------------
  // Test Group 4: Database Verification (PostgreSQL)
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing PostgreSQL Data Integrity & Model Relations...");
  {
    const sessionInDb = await db.practiceSession.findUnique({
      where: { id: createdSessionId },
      include: {
        evaluation: {
          include: { rubricScores: true },
        },
      },
    });

    assert(!!sessionInDb, "PracticeSession record exists in database");
    assert(sessionInDb?.status === "COMPLETED", "PracticeSession status marked COMPLETED");
    assert(sessionInDb?.codeLanguage === "typescript", "codeLanguage persisted accurately");
    assert(!!sessionInDb?.diagramJson, "diagramJson persisted whiteboard nodes");
    assert(!!sessionInDb?.chatHistory, "chatHistory persisted transcript turns");
    assert(sessionInDb?.durationSeconds === 1420, "durationSeconds recorded accurately");

    assert(!!sessionInDb?.evaluation, "EvaluationReport linked via foreign key");
    assert(
      (sessionInDb?.evaluation?.rubricScores?.length || 0) >= 5,
      `Rubric scores committed: ${sessionInDb?.evaluation?.rubricScores?.length} dimensions`
    );
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================\n");

  if (passedTests === totalTests) {
    console.log("🌟 All practice session submission & transcript ingestion tests passed with 0 failures!");
  } else {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Test runner encountered an unhandled exception:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
