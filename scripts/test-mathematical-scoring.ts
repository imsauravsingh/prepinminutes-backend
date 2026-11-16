/**
 * PrepInMinutes — TASK-P6-01 Automated Verification Test Suite
 *
 * Verifies:
 * 1. 6-Dimension Mathematical Rubric Scoring Engine (Weights: 25%, 20%, 20%, 15%, 10%, 10%)
 * 2. Difficulty Multipliers (BEGINNER: 0.9, INTERMEDIATE: 1.0, ADVANCED: 1.1, EXPERT: 1.2)
 * 3. Hiring Verdict Thresholds (Strong Hire >= 85, Hire >= 70, Leaning Hire >= 55, Needs Practice < 55)
 * 4. Bayesian Readiness Update Convergence (3-Tier Adaptive Learning Rates: alpha = 0.35, 0.20, 0.10)
 * 5. Dynamic Evaluation Report API (GET /api/evaluation/:reportId)
 */

import worker from "../src/index";
import { db } from "../src/server/db/client";
import { computeRubricScore, getDifficultyMultiplier, RawDimensionScores } from "../src/server/domain/scoring";
import { calculateReadinessUpdate } from "../src/server/domain/readiness";

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
  console.log("🧪 TASK-P6-01: Mathematical Scoring & 6-Dimension Rubric Test Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // Test Group 1: 6-Dimension Weighted Scoring Calculation
  // -------------------------------------------------------------
  console.log("🔹 1. Testing 6-Dimension Rubric Scoring & Weights...");
  {
    // Perfect 10.0 across all dimensions
    const maxScores: RawDimensionScores = {
      technical_depth: 10.0,
      tradeoffs_reasoning: 10.0,
      scalability_failure_modes: 10.0,
      communication_structure: 10.0,
      code_diagram_quality: 10.0,
      edge_case_robustness: 10.0,
    };

    const maxResult = computeRubricScore(maxScores, "INTERMEDIATE");
    assert(maxResult.overallScore === 100.0, `Max scores yield exactly 100.0 (got ${maxResult.overallScore})`);
    assert(maxResult.verdict === "Strong Hire", "Max scores assign 'Strong Hire' verdict");

    // Realistic Staff Engineer Distribution
    // 8.0 * 2.5 + 9.0 * 2.0 + 8.5 * 2.0 + 7.5 * 1.5 + 8.0 * 1.0 + 8.0 * 1.0
    // = 20.0 + 18.0 + 17.0 + 11.25 + 8.0 + 8.0 = 82.25 -> 82.3
    const staffScores: RawDimensionScores = {
      technical_depth: 8.0,
      tradeoffs_reasoning: 9.0,
      scalability_failure_modes: 8.5,
      communication_structure: 7.5,
      code_diagram_quality: 8.0,
      edge_case_robustness: 8.0,
    };

    const staffResult = computeRubricScore(staffScores, "INTERMEDIATE");
    assert(staffResult.overallScore === 82.3, `Staff scores computed to 82.3 (got ${staffResult.overallScore})`);
    assert(staffResult.verdict === "Hire", `Score 82.3 assigns 'Hire' verdict (got ${staffResult.verdict})`);

    // Minimum Floor Check (Inputs clamped to 1.0 minimum)
    const minScores: RawDimensionScores = {
      technical_depth: 0.2, // Below 1.0
      tradeoffs_reasoning: -5.0,
      scalability_failure_modes: 1.0,
      communication_structure: 1.0,
      code_diagram_quality: 1.0,
      edge_case_robustness: 1.0,
    };

    const minResult = computeRubricScore(minScores);
    assert(minResult.overallScore === 10.0, `Clamping floor bounds overall score at 10.0 (got ${minResult.overallScore})`);
    assert(minResult.verdict === "Needs Practice", "Floor scores assign 'Needs Practice' verdict");
  }

  // -------------------------------------------------------------
  // Test Group 2: Difficulty Multipliers
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing Difficulty Multipliers...");
  {
    assert(getDifficultyMultiplier("BEGINNER") === 0.9, "BEGINNER difficulty multiplier is 0.9");
    assert(getDifficultyMultiplier("INTERMEDIATE") === 1.0, "INTERMEDIATE difficulty multiplier is 1.0");
    assert(getDifficultyMultiplier("ADVANCED") === 1.1, "ADVANCED difficulty multiplier is 1.1");
    assert(getDifficultyMultiplier("EXPERT") === 1.2, "EXPERT difficulty multiplier is 1.2");
    assert(getDifficultyMultiplier("unknown") === 1.0, "Unrecognized difficulty falls back cleanly to 1.0");
  }

  // -------------------------------------------------------------
  // Test Group 3: Verdict Classification Boundaries
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing Verdict Boundary Thresholds...");
  {
    // 85.0 -> Strong Hire
    const strongHire = computeRubricScore({
      technical_depth: 8.5,
      tradeoffs_reasoning: 8.5,
      scalability_failure_modes: 8.5,
      communication_structure: 8.5,
      code_diagram_quality: 8.5,
      edge_case_robustness: 8.5,
    });
    assert(strongHire.verdict === "Strong Hire", "Score 85.0 maps to 'Strong Hire'");

    // 70.0 -> Hire
    const hire = computeRubricScore({
      technical_depth: 7.0,
      tradeoffs_reasoning: 7.0,
      scalability_failure_modes: 7.0,
      communication_structure: 7.0,
      code_diagram_quality: 7.0,
      edge_case_robustness: 7.0,
    });
    assert(hire.verdict === "Hire", "Score 70.0 maps to 'Hire'");

    // 55.0 -> Leaning Hire
    const leaningHire = computeRubricScore({
      technical_depth: 5.5,
      tradeoffs_reasoning: 5.5,
      scalability_failure_modes: 5.5,
      communication_structure: 5.5,
      code_diagram_quality: 5.5,
      edge_case_robustness: 5.5,
    });
    assert(leaningHire.verdict === "Leaning Hire", "Score 55.0 maps to 'Leaning Hire'");

    // 54.0 -> Needs Practice
    const needsPractice = computeRubricScore({
      technical_depth: 5.4,
      tradeoffs_reasoning: 5.4,
      scalability_failure_modes: 5.4,
      communication_structure: 5.4,
      code_diagram_quality: 5.4,
      edge_case_robustness: 5.4,
    });
    assert(needsPractice.verdict === "Needs Practice", "Score 54.0 maps to 'Needs Practice'");
  }

  // -------------------------------------------------------------
  // Test Group 4: Bayesian Readiness Convergence Engine
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing Bayesian Readiness Convergence...");
  {
    // Phase A: Rapid Baseline Calibration (N <= 3, alpha = 0.35)
    // R_old = 50.0, S = 80.0, Intermediate (beta = 1.0)
    // R_new = 0.65 * 50.0 + 0.35 * 80.0 = 32.5 + 28.0 = 60.5
    const phaseA = calculateReadinessUpdate(50.0, 80.0, 2, "INTERMEDIATE");
    assert(phaseA.learningRate === 0.35, "Phase A (N <= 3) sets alpha = 0.35");
    assert(phaseA.newReadiness === 60.5, `Phase A computes R_new = 60.5 (got ${phaseA.newReadiness})`);
    assert(phaseA.readinessDelta === 10.5, `Phase A computes delta = +10.5 (got ${phaseA.readinessDelta})`);

    // Phase B: Moderate Adjustment (3 < N <= 10, alpha = 0.20)
    // R_old = 65.0, S = 90.0, Advanced (beta = 1.1 -> effective S = 99.0)
    // R_new = 0.80 * 65.0 + 0.20 * 99.0 = 52.0 + 19.8 = 71.8
    const phaseB = calculateReadinessUpdate(65.0, 90.0, 6, "ADVANCED");
    assert(phaseB.learningRate === 0.20, "Phase B (3 < N <= 10) sets alpha = 0.20");
    assert(phaseB.newReadiness === 71.8, `Phase B computes R_new = 71.8 with difficulty boost (got ${phaseB.newReadiness})`);
    assert(phaseB.readinessDelta === 6.8, `Phase B computes delta = +6.8 (got ${phaseB.readinessDelta})`);

    // Phase C: High Confidence Convergence (N > 10, alpha = 0.10)
    // R_old = 80.0, S = 85.0, Intermediate (beta = 1.0)
    // R_new = 0.90 * 80.0 + 0.10 * 85.0 = 72.0 + 8.5 = 80.5
    const phaseC = calculateReadinessUpdate(80.0, 85.0, 15, "INTERMEDIATE");
    assert(phaseC.learningRate === 0.10, "Phase C (N > 10) sets alpha = 0.10");
    assert(phaseC.newReadiness === 80.5, `Phase C computes stable convergence R_new = 80.5 (got ${phaseC.newReadiness})`);
    assert(phaseC.readinessDelta === 0.5, `Phase C computes delta = +0.5 (got ${phaseC.readinessDelta})`);
  }

  // -------------------------------------------------------------
  // Test Group 5: Live Evaluation Report API Retrieval
  // -------------------------------------------------------------
  console.log("\n🔹 5. Testing Live Evaluation Report API (GET /api/evaluation/:reportId)...");
  {
    // Find any existing evaluation report in the database
    const existingReport = await db.evaluationReport.findFirst({
      include: { rubricScores: true },
    });

    if (existingReport) {
      // Test 1: Direct endpoint /api/evaluation/:id
      const req1 = new Request(`${BASE_URL}/api/evaluation/${existingReport.id}`, {
        method: "GET",
        headers: { "x-candidate-email": "candidate@prepinminutes.com" },
      });
      const res1 = await worker.fetch(req1);
      assert(res1.status === 200, "GET /api/evaluation/:reportId returns HTTP 200 OK");
      const json1 = await res1.json();
      assert(json1.success === true, "Response payload indicates success: true");
      assert(json1.report.id === existingReport.id, "Returned report ID matches requested ID");
      assert(typeof json1.report.overallScore === "number", "Returned report contains numeric overallScore");
      assert(typeof json1.report.percentileRank === "number", "Returned report contains computed percentileRank");

      // Test 2: Sub-path endpoint /api/evaluation/report/:id
      const req2 = new Request(`${BASE_URL}/api/evaluation/report/${existingReport.id}`, {
        method: "GET",
        headers: { "x-candidate-email": "candidate@prepinminutes.com" },
      });
      const res2 = await worker.fetch(req2);
      assert(res2.status === 200, "GET /api/evaluation/report/:reportId returns HTTP 200 OK");
    } else {
      console.log("  ⚠️ [SKIP] No existing evaluation report found to test GET endpoint.");
    }

    // Test 3: Non-existent report returns structured HTTP 404
    const reqNotFound = new Request(`${BASE_URL}/api/evaluation/non_existent_report_id_404`, {
      method: "GET",
      headers: { "x-candidate-email": "candidate@prepinminutes.com" },
    });
    const resNotFound = await worker.fetch(reqNotFound);
    assert(resNotFound.status === 404, "Unknown report ID returns structured HTTP 404");
    const jsonNotFound = await resNotFound.json();
    assert(jsonNotFound.error === "REPORT_NOT_FOUND", "Returns REPORT_NOT_FOUND error code");
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================\n");

  if (passedTests === totalTests) {
    console.log("🌟 All mathematical scoring, readiness convergence, and evaluation report tests passed with 0 failures!");
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
