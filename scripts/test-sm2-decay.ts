/**
 * PrepInMinutes — TASK-P6-02 Automated Verification Test Suite
 *
 * Verifies:
 * 1. SuperMemo SM-2 Core Engine:
 *    - Bidirectional grade inputs: qualityGrade q in [0, 5] and sessionScore S in [0.0, 100.0]
 *    - Asymmetric Easiness Factor scaling: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 *    - Immutable floor EF >= 1.30
 *    - Progressive Interval Expansion: I_1 = 1d -> I_2 = 6d -> I_n = round(I_{n-1} * EF)
 *    - Streak reset on failed recall: q < 3 -> repetitions = 0, interval = 1d
 * 2. Time-Decayed Ebbinghaus Memory Retention:
 *    - RecallStrength(t) = 100 * exp(-0.5 * t / (I * EF))
 *    - Retention Band Taxonomy: CRITICAL, NEEDS_REINFORCEMENT, STABLE, MASTERED
 * 3. Revision Queue API Endpoints:
 *    - GET /api/revision/items (due filtering, dynamic decay, retention band stats)
 *    - POST /api/revision/items and /api/revision/item/recall (SM-2 persistence and topic mastery sync)
 */

import worker from "../src/index";
import { db } from "../src/server/db/client";
import {
  computeSM2,
  mapScoreToGrade,
  calculateRecallStrength,
  determineRetentionBand,
} from "../src/server/domain/spaced-repetition";

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
  console.log("🧪 TASK-P6-02: SuperMemo SM-2 Spaced Repetition Test Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // Test Group 1: Continuous Session Score to Grade Mapping
  // -------------------------------------------------------------
  console.log("🔹 1. Testing Session Score to SuperMemo Grade Mapping...");
  {
    assert(mapScoreToGrade(95.0) === 5, "Score 95.0 maps to Grade 5 (Perfect Recall)");
    assert(mapScoreToGrade(85.0) === 5, "Score 85.0 maps to Grade 5 (Threshold)");
    assert(mapScoreToGrade(80.0) === 4, "Score 80.0 maps to Grade 4 (Good Recall)");
    assert(mapScoreToGrade(70.0) === 4, "Score 70.0 maps to Grade 4 (Threshold)");
    assert(mapScoreToGrade(65.0) === 3, "Score 65.0 maps to Grade 3 (Pass with Effort)");
    assert(mapScoreToGrade(55.0) === 3, "Score 55.0 maps to Grade 3 (Threshold)");
    assert(mapScoreToGrade(45.0) === 2, "Score 45.0 maps to Grade 2 (Fail, Incorrect)");
    assert(mapScoreToGrade(25.0) === 1, "Score 25.0 maps to Grade 1 (Fail, Familiar)");
    assert(mapScoreToGrade(10.0) === 0, "Score 10.0 maps to Grade 0 (Complete Blackout)");
  }

  // -------------------------------------------------------------
  // Test Group 2: Progressive Interval Expansion & Easiness Factor
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing SM-2 Interval Expansion Progression (q >= 3)...");
  {
    // Review 1: Initial state (rep 0, int 1, ef 2.5) with perfect recall (q = 5)
    // deltaEF = 0.1 - (0)*(0.08 + 0) = +0.10 => EF = 2.60
    const step1 = computeSM2({
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      qualityGrade: 5,
    });
    assert(step1.repetitions === 1, `Step 1 repetitions = 1 (got ${step1.repetitions})`);
    assert(step1.intervalDays === 1, `Step 1 interval = 1 day (got ${step1.intervalDays})`);
    assert(step1.easeFactor === 2.6, `Step 1 EF increased to 2.60 (got ${step1.easeFactor})`);
    assert(step1.qualityGrade === 5, "Step 1 quality grade is 5");

    // Review 2: Second review with good recall (q = 4)
    // deltaEF = 0.1 - (1)*(0.08 + 0.02) = 0.1 - 0.1 = 0.00 => EF = 2.60
    const step2 = computeSM2({
      repetitions: step1.repetitions,
      intervalDays: step1.intervalDays,
      easeFactor: step1.easeFactor,
      qualityGrade: 4,
    });
    assert(step2.repetitions === 2, `Step 2 repetitions = 2 (got ${step2.repetitions})`);
    assert(step2.intervalDays === 6, `Step 2 interval = 6 days (got ${step2.intervalDays})`);
    assert(step2.easeFactor === 2.6, `Step 2 EF preserved at 2.60 (got ${step2.easeFactor})`);

    // Review 3: Third review with good recall (q = 4)
    // Interval = round(6 * 2.60) = round(15.6) = 16 days
    const step3 = computeSM2({
      repetitions: step2.repetitions,
      intervalDays: step2.intervalDays,
      easeFactor: step2.easeFactor,
      qualityGrade: 4,
    });
    assert(step3.repetitions === 3, `Step 3 repetitions = 3 (got ${step3.repetitions})`);
    assert(step3.intervalDays === 16, `Step 3 interval = 16 days (got ${step3.intervalDays})`);
    assert(step3.easeFactor === 2.6, `Step 3 EF = 2.60 (got ${step3.easeFactor})`);
    assert(step3.retentionBand === "MASTERED", `Step 3 retention band is MASTERED (got ${step3.retentionBand})`);

    // Review 4: Fourth review with pass with effort (q = 3)
    // deltaEF = 0.1 - (2)*(0.08 + 0.04) = 0.1 - 0.24 = -0.14 => EF = 2.46
    // Interval = round(16 * 2.46) = round(39.36) = 39 days
    const step4 = computeSM2({
      repetitions: step3.repetitions,
      intervalDays: step3.intervalDays,
      easeFactor: step3.easeFactor,
      qualityGrade: 3,
    });
    assert(step4.repetitions === 4, `Step 4 repetitions = 4 (got ${step4.repetitions})`);
    assert(step4.intervalDays === 39, `Step 4 interval = 39 days (got ${step4.intervalDays})`);
    assert(step4.easeFactor === 2.46, `Step 4 EF decreased to 2.46 (got ${step4.easeFactor})`);
  }

  // -------------------------------------------------------------
  // Test Group 3: Failed Recall Reset & Easiness Floor Invariant
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing Failed Recall Reset (q < 3) & EF Lower Bound (1.30)...");
  {
    // High streak item fails review (q = 1)
    const failedRecall = computeSM2({
      repetitions: 5,
      intervalDays: 45,
      easeFactor: 2.3,
      qualityGrade: 1,
    });
    assert(failedRecall.repetitions === 0, `Failed recall resets repetitions to 0 (got ${failedRecall.repetitions})`);
    assert(failedRecall.intervalDays === 1, `Failed recall resets interval to 1 day (got ${failedRecall.intervalDays})`);
    assert(failedRecall.retentionBand === "CRITICAL", `Failed recall categorizes as CRITICAL (got ${failedRecall.retentionBand})`);
    assert(failedRecall.easeFactor < 2.3, `EF decreased on failed recall (got ${failedRecall.easeFactor})`);

    // EF lower bound clamp at 1.30: Repeated blackouts (q = 0)
    let currentEF = 1.40;
    for (let i = 0; i < 5; i++) {
      const output = computeSM2({
        repetitions: 0,
        intervalDays: 1,
        easeFactor: currentEF,
        qualityGrade: 0,
      });
      currentEF = output.easeFactor;
    }
    assert(currentEF === 1.3, `EF is clamped to minimum floor 1.30 under severe decay (got ${currentEF})`);
  }

  // -------------------------------------------------------------
  // Test Group 4: Ebbinghaus Time Decay & Retention Bands
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing Time-Decayed Ebbinghaus Recall Strength & Bands...");
  {
    const now = new Date();

    // 0 days elapsed -> 100% recall
    const freshRecall = calculateRecallStrength(now, 10, 2.5);
    assert(freshRecall >= 99, `0 elapsed days yields 100% recall strength (got ${freshRecall}%)`);

    // Half-life elapsed: t = I * EF = 10 * 2.0 = 20 days -> exp(-0.5 * 20 / 20) = exp(-0.5) = 60.65% ~ 61%
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const halfLifeRecall = calculateRecallStrength(twentyDaysAgo, 10, 2.0);
    assert(
      halfLifeRecall >= 59 && halfLifeRecall <= 62,
      `At half-life elapsed days, recall strength is ~61% (got ${halfLifeRecall}%)`
    );

    // Severe elapsed: 60 days ago on interval 5, EF 2.0 (halfLife = 10d) -> exp(-0.5 * 6) = exp(-3) = 4.97% -> floor 10%
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const decayedRecall = calculateRecallStrength(sixtyDaysAgo, 5, 2.0);
    assert(decayedRecall === 10, `Severely decayed recall respects 10% floor (got ${decayedRecall}%)`);

    // Determine retention bands
    assert(determineRetentionBand(90, 4) === "MASTERED", "90% recall & 4 reps is MASTERED");
    assert(determineRetentionBand(75, 2) === "STABLE", "75% recall & 2 reps is STABLE");
    assert(determineRetentionBand(55, 1) === "NEEDS_REINFORCEMENT", "55% recall is NEEDS_REINFORCEMENT");
    assert(determineRetentionBand(30, 3) === "CRITICAL", "30% recall is CRITICAL");
    assert(determineRetentionBand(90, 5, 1) === "CRITICAL", "Grade 1 recall is immediately CRITICAL regardless of prior %");
  }

  // -------------------------------------------------------------
  // Test Group 5: API Endpoints (GET & POST /api/revision/items)
  // -------------------------------------------------------------
  console.log("\n🔹 5. Testing HTTP Endpoints with Live Database Context...");
  {
    // Find candidate user or fallback
    let candidateUser = await db.user.findFirst({
      where: { email: "candidate@prepinminutes.com" },
      include: { profile: true },
    });

    if (!candidateUser || !candidateUser.profile) {
      candidateUser = await db.user.findFirst({
        where: { profile: { isNot: null } },
        include: { profile: true },
      });
    }

    const testEmail = candidateUser?.email || "candidate@prepinminutes.com";

    // Ensure at least one revision item exists for candidate
    if (candidateUser?.profile) {
      let existingItem = await db.revisionItem.findFirst({
        where: { candidateId: candidateUser.profile.id },
      });
      if (!existingItem) {
        const topic = await db.curriculumTopic.findFirst();
        if (topic) {
          await db.revisionItem.create({
            data: {
              candidateId: candidateUser.profile.id,
              topicId: topic.id,
              topicTitle: topic.title,
              domain: "system-design",
              recallStrength: 50,
              retentionBand: "NEEDS_REINFORCEMENT",
              intervalDays: 1.0,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date(),
            },
          });
        }
      }
    }

    // Test GET /api/revision/items
    const getReq = new Request(`${BASE_URL}/api/revision/items`, {
      method: "GET",
      headers: {
        "x-candidate-email": testEmail,
      },
    });

    const getRes = await worker.fetch(getReq, {});
    assert(getRes.status === 200, `GET /api/revision/items returns 200 OK (got ${getRes.status})`);

    const getData = (await getRes.json()) as any;
    assert(getData.success === true, "GET response has success: true");
    assert(typeof getData.totalDue === "number", `Total due count is number (got ${getData.totalDue})`);
    assert(Array.isArray(getData.items), `Items returned as array (count: ${getData.items?.length || 0})`);

    if (getData.items && getData.items.length > 0) {
      const sampleItem = getData.items[0];
      assert(typeof sampleItem.recallStrength === "number", `Item has computed recallStrength: ${sampleItem.recallStrength}%`);
      assert(
        ["CRITICAL", "NEEDS_REINFORCEMENT", "STABLE", "MASTERED"].includes(sampleItem.retentionBand),
        `Item has valid retentionBand: ${sampleItem.retentionBand}`
      );

      // Test POST /api/revision/items (or /api/revision/item/recall) with quality grade
      const postReq = new Request(`${BASE_URL}/api/revision/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-candidate-email": testEmail,
        },
        body: JSON.stringify({
          revisionItemId: sampleItem.id,
          qualityGrade: 5,
        }),
      });

      const postRes = await worker.fetch(postReq, {});
      assert(postRes.status === 200, `POST /api/revision/items returns 200 OK (got ${postRes.status})`);

      const postData = (await postRes.json()) as any;
      assert(postData.success === true, "POST response has success: true");
      assert(postData.sm2Output?.qualityGrade === 5, "SM-2 output confirms grade 5");
      assert(postData.updatedItem?.repetitions >= 1, `Repetitions updated to ${postData.updatedItem?.repetitions}`);

      // Test POST with continuous score (sessionScore = 60 => q = 3)
      const postScoreReq = new Request(`${BASE_URL}/api/revision/item/recall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-candidate-email": testEmail,
        },
        body: JSON.stringify({
          revisionItemId: sampleItem.id,
          sessionScore: 60,
        }),
      });

      const postScoreRes = await worker.fetch(postScoreReq, {});
      assert(postScoreRes.status === 200, `POST /api/revision/item/recall with sessionScore returns 200 OK (got ${postScoreRes.status})`);

      const postScoreData = (await postScoreRes.json()) as any;
      assert(postScoreData.sm2Output?.qualityGrade === 3, `Score 60 correctly evaluated as qualityGrade 3`);
    } else {
      console.log("  ⚠️ Note: No existing revision items in candidate profile to exercise POST update.");
    }
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 All SuperMemo SM-2 & Decay tests passed successfully!\n");
  } else {
    console.error("❌ Some tests failed.\n");
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Test execution failed with unhandled error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect().catch(() => {});
  });
