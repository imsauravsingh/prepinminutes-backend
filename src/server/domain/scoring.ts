export interface RawDimensionScores {
  technical_depth: number; // 1.0 - 10.0
  tradeoffs_reasoning: number; // 1.0 - 10.0
  communication_structure: number; // 1.0 - 10.0
  scalability_failure_modes: number; // 1.0 - 10.0
  code_diagram_quality: number; // 1.0 - 10.0
}

export interface ComputedEvaluation {
  overallScore: number;
  verdict: "Strong Hire" | "Hire" | "Needs Practice";
  normalizedDimensions: Record<string, number>;
}

export function computeRubricScore(
  scores: RawDimensionScores
): ComputedEvaluation {
  const weights: Record<keyof RawDimensionScores, number> = {
    technical_depth: 0.3,
    tradeoffs_reasoning: 0.25,
    communication_structure: 0.2,
    scalability_failure_modes: 0.15,
    code_diagram_quality: 0.1,
  };

  let totalWeightedScore = 0;

  for (const [dimension, weight] of Object.entries(weights) as [
    keyof RawDimensionScores,
    number
  ][]) {
    const raw = Math.max(1.0, Math.min(10.0, scores[dimension] || 1.0));
    totalWeightedScore += raw * weight * 10;
  }

  const overallScore = Math.round(totalWeightedScore * 10) / 10;

  let verdict: "Strong Hire" | "Hire" | "Needs Practice" = "Needs Practice";
  if (overallScore >= 85.0) {
    verdict = "Strong Hire";
  } else if (overallScore >= 70.0) {
    verdict = "Hire";
  }

  return {
    overallScore,
    verdict,
    normalizedDimensions: { ...scores },
  };
}
