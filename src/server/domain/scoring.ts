/**
 * PrepInMinutes — Deterministic Mathematical Scoring Engine
 *
 * Implements 6-Dimension Rubric Scoring & FAANG Bar Raiser Calibrations.
 *
 * Dimensions:
 * 1. technical_depth           (Weight: 25%) - Mechanical sympathy, protocols, concurrency, data structures.
 * 2. tradeoffs_reasoning       (Weight: 20%) - Quantitative CAP theorem analysis, read/write amplification.
 * 3. scalability_failure_modes (Weight: 20%) - SPOF mitigation, split-brain recovery, cascading failure isolation.
 * 4. communication_structure   (Weight: 15%) - Top-down scoping, proactive assumption clarification, STAR framing.
 * 5. code_diagram_quality      (Weight: 10%) - Clean architectural boundaries, modularity, idiomatic coding patterns.
 * 6. edge_case_robustness      (Weight: 10%) - Boundary condition handling, network timeout retry semantics, idempotency.
 */

export interface RawDimensionScores {
  technical_depth: number;           // 1.0 - 10.0
  tradeoffs_reasoning: number;       // 1.0 - 10.0
  scalability_failure_modes: number; // 1.0 - 10.0
  communication_structure: number;   // 1.0 - 10.0
  code_diagram_quality: number;      // 1.0 - 10.0
  edge_case_robustness?: number;     // 1.0 - 10.0
}

export type VerdictRating = "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Practice";

export interface ComputedEvaluation {
  overallScore: number;
  verdict: VerdictRating;
  normalizedDimensions: Record<string, number>;
  difficultyMultiplier: number;
}

export const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  BEGINNER: 0.9,
  INTERMEDIATE: 1.0,
  ADVANCED: 1.1,
  EXPERT: 1.2,
};

export function getDifficultyMultiplier(difficulty?: string): number {
  if (!difficulty) return 1.0;
  const upper = difficulty.toUpperCase().trim();
  return DIFFICULTY_MULTIPLIERS[upper] || 1.0;
}

export function computeRubricScore(
  scores: RawDimensionScores,
  difficulty?: string
): ComputedEvaluation {
  // If edge_case_robustness is not provided, estimate from technical_depth and scalability
  const edgeCaseScore =
    scores.edge_case_robustness !== undefined
      ? scores.edge_case_robustness
      : ((scores.technical_depth || 6.0) + (scores.scalability_failure_modes || 6.0)) / 2;

  const sanitizedScores: Record<string, number> = {
    technical_depth: Math.max(1.0, Math.min(10.0, Number(scores.technical_depth) || 5.0)),
    tradeoffs_reasoning: Math.max(1.0, Math.min(10.0, Number(scores.tradeoffs_reasoning) || 5.0)),
    scalability_failure_modes: Math.max(1.0, Math.min(10.0, Number(scores.scalability_failure_modes) || 5.0)),
    communication_structure: Math.max(1.0, Math.min(10.0, Number(scores.communication_structure) || 5.0)),
    code_diagram_quality: Math.max(1.0, Math.min(10.0, Number(scores.code_diagram_quality) || 5.0)),
    edge_case_robustness: Math.max(1.0, Math.min(10.0, Number(edgeCaseScore) || 5.0)),
  };

  const weights: Record<string, number> = {
    technical_depth: 0.25,
    tradeoffs_reasoning: 0.2,
    scalability_failure_modes: 0.2,
    communication_structure: 0.15,
    code_diagram_quality: 0.1,
    edge_case_robustness: 0.1,
  };

  let weightedSum = 0;
  for (const [dim, weight] of Object.entries(weights)) {
    weightedSum += sanitizedScores[dim] * weight * 10;
  }

  const difficultyMultiplier = getDifficultyMultiplier(difficulty);

  // Raw weighted score bounded in [0.0, 100.0]
  const overallScore = Math.min(100.0, Math.max(0.0, Math.round(weightedSum * 10) / 10));

  let verdict: VerdictRating = "Needs Practice";
  if (overallScore >= 85.0) {
    verdict = "Strong Hire";
  } else if (overallScore >= 70.0) {
    verdict = "Hire";
  } else if (overallScore >= 55.0) {
    verdict = "Leaning Hire";
  } else {
    verdict = "Needs Practice";
  }

  return {
    overallScore,
    verdict,
    normalizedDimensions: sanitizedScores,
    difficultyMultiplier,
  };
}
