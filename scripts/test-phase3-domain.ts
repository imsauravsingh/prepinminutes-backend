import { computeRubricScore } from "../src/server/domain/scoring";
import { calculateReadinessUpdate } from "../src/server/domain/readiness";
import { computeSM2 } from "../src/server/domain/spaced-repetition";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runPhase3Tests() {
  console.log("=== PHASE 3 DOMAIN MATHEMATICAL SERVICES TEST SUITE ===\\n");

  // 1. Scoring Engine Tests
  console.log("1. Testing 5-Dimension Rubric Scoring Engine...");
  const maxScore = computeRubricScore({
    technical_depth: 10,
    tradeoffs_reasoning: 10,
    communication_structure: 10,
    scalability_failure_modes: 10,
    code_diagram_quality: 10,
  });
  console.log("  Max score evaluation:", maxScore);
  assert(maxScore.overallScore === 100.0, "Max score must equal 100.0");
  assert(maxScore.verdict === "Strong Hire", "Max score must yield 'Strong Hire'");

  const minScore = computeRubricScore({
    technical_depth: 1,
    tradeoffs_reasoning: 1,
    communication_structure: 1,
    scalability_failure_modes: 1,
    code_diagram_quality: 1,
  });
  console.log("  Min score evaluation:", minScore);
  assert(minScore.overallScore === 10.0, "Min score must equal 10.0");
  assert(minScore.verdict === "Needs Practice", "Min score must yield 'Needs Practice'");

  // Boundary check: 85.0
  const hireBoundary = computeRubricScore({
    technical_depth: 8.5,
    tradeoffs_reasoning: 8.5,
    communication_structure: 8.5,
    scalability_failure_modes: 8.5,
    code_diagram_quality: 8.5,
  });
  assert(hireBoundary.overallScore === 85.0, "Boundary must equal 85.0");
  assert(hireBoundary.verdict === "Strong Hire", "85.0 must yield 'Strong Hire'");

  // Boundary check: 70.0
  const practiceBoundary = computeRubricScore({
    technical_depth: 7.0,
    tradeoffs_reasoning: 7.0,
    communication_structure: 7.0,
    scalability_failure_modes: 7.0,
    code_diagram_quality: 7.0,
  });
  assert(practiceBoundary.overallScore === 70.0, "Boundary must equal 70.0");
  assert(practiceBoundary.verdict === "Hire", "70.0 must yield 'Hire'");
  console.log("  ✓ All Rubric Scoring assertions passed!");

  // 2. Bayesian Readiness Engine Tests
  console.log("\\n2. Testing Bayesian Candidate Readiness Engine...");
  // Cold start (N <= 3): alpha = 0.40
  const coldStart = calculateReadinessUpdate(50.0, 90.0, 1);
  // Expected: 0.4 * 90 + 0.6 * 50 = 36 + 30 = 66.0, delta = +16.0
  console.log("  Cold start update (alpha 0.4):", coldStart);
  assert(coldStart.newReadiness === 66.0, "Cold start new readiness must equal 66.0");
  assert(coldStart.readinessDelta === 16.0, "Cold start delta must equal +16.0");

  // Converged (N > 3): alpha = 0.15
  const converged = calculateReadinessUpdate(50.0, 90.0, 5);
  // Expected: 0.15 * 90 + 0.85 * 50 = 13.5 + 42.5 = 56.0, delta = +6.0
  console.log("  Converged update (alpha 0.15):", converged);
  assert(converged.newReadiness === 56.0, "Converged new readiness must equal 56.0");
  assert(converged.readinessDelta === 6.0, "Converged delta must equal +6.0");

  // Clamping test: should not exceed 100
  const clampedMax = calculateReadinessUpdate(95.0, 120.0, 1);
  assert(clampedMax.newReadiness <= 100.0, "Readiness must clamp at 100.0");
  console.log("  ✓ All Bayesian Readiness assertions passed!");

  // 3. SuperMemo-2 Spaced Repetition Tests
  console.log("\\n3. Testing SuperMemo-2 Spaced Repetition Engine...");
  // Repetition 0 -> 1 on good score (q = 5)
  const sm2Step1 = computeSM2({
    repetitions: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    sessionScore: 90,
  });
  console.log("  SM-2 Step 1 (q=5):", sm2Step1);
  assert(sm2Step1.repetitions === 1, "Repetitions must advance to 1");
  assert(sm2Step1.intervalDays === 1, "Interval 1 must equal 1 day");
  assert(sm2Step1.easeFactor === 2.6, "EF must increase to 2.6");
  assert(sm2Step1.nextReviewDate > new Date(), "nextReviewDate must be in the future");

  // Repetition 1 -> 2 (interval = 6 days)
  const sm2Step2 = computeSM2({
    repetitions: 1,
    intervalDays: 1,
    easeFactor: 2.6,
    sessionScore: 90,
  });
  console.log("  SM-2 Step 2 (q=5):", sm2Step2);
  assert(sm2Step2.repetitions === 2, "Repetitions must advance to 2");
  assert(sm2Step2.intervalDays === 6, "Interval 2 must equal 6 days");

  // Repetition 2 -> 3 (interval = round(6 * EF))
  const sm2Step3 = computeSM2({
    repetitions: 2,
    intervalDays: 6,
    easeFactor: 2.7,
    sessionScore: 90,
  });
  console.log("  SM-2 Step 3 (q=5):", sm2Step3);
  assert(sm2Step3.repetitions === 3, "Repetitions must advance to 3");
  assert(sm2Step3.intervalDays === Math.round(6 * 2.8), "Interval 3 must equal round(6 * EF)");

  // Failure reset (score < 55 -> q < 3)
  const sm2Fail = computeSM2({
    repetitions: 4,
    intervalDays: 15,
    easeFactor: 1.35,
    sessionScore: 40,
  });
  console.log("  SM-2 Failure reset:", sm2Fail);
  assert(sm2Fail.repetitions === 0, "Failed recall must reset repetitions to 0");
  assert(sm2Fail.intervalDays === 1, "Failed recall must reset interval to 1 day");
  assert(sm2Fail.easeFactor === 1.3, "Ease factor must not drop below 1.3 floor");
  console.log("  ✓ All SuperMemo-2 Spaced Repetition assertions passed!");

  console.log("\\n🎉 100% OF PHASE 3 DOMAIN MATHEMATICAL SERVICES TESTS PASSED!");
}

try {
  runPhase3Tests();
} catch (e) {
  console.error("❌ Test suite failed:", e);
  process.exit(1);
}
