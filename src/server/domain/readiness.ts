import { getDifficultyMultiplier } from "./scoring";

export interface ReadinessUpdateResult {
  newReadiness: number;
  readinessDelta: number;
  learningRate: number;
  difficultyMultiplier: number;
}

/**
 * Calculates a candidate's aggregate readiness score using an adaptive Bayesian
 * Exponential Moving Average (EMA) with sample-size confidence decay.
 *
 * Formula:
 * R_new = round( (1 - alpha_N) * R_old + alpha_N * S_session * beta_difficulty )
 *
 * @param currentReadiness - Prior aggregate readiness score (0 - 100)
 * @param sessionScore - Performance score on the completed session (0 - 100)
 * @param completedSessionsCount - Total previous sessions completed by the candidate (N)
 * @param difficulty - Question difficulty ("BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT")
 */
export function calculateReadinessUpdate(
  currentReadiness: number,
  sessionScore: number,
  completedSessionsCount: number,
  difficulty?: string
): ReadinessUpdateResult {
  // 1. Adaptive learning rate (alpha_N) based on sample size confidence
  let alpha: number;
  if (completedSessionsCount <= 3) {
    alpha = 0.35; // Rapid initial calibration for new candidates
  } else if (completedSessionsCount <= 10) {
    alpha = 0.20; // Moderate adjustment band
  } else {
    alpha = 0.10; // High confidence asymptotic convergence
  }

  // 2. Difficulty multiplier (beta_difficulty)
  const diffMultiplier = getDifficultyMultiplier(difficulty);

  // 3. Calibrated session contribution
  const effectiveSessionScore = sessionScore * diffMultiplier;

  // 4. Bayesian Exponential Moving Average
  const newReadinessRaw = (1 - alpha) * currentReadiness + alpha * effectiveSessionScore;

  // Bound within [0, 100] rounded to 1 decimal place
  const newReadiness = Math.round(Math.max(0, Math.min(100, newReadinessRaw)) * 10) / 10;
  const readinessDelta = Math.round((newReadiness - currentReadiness) * 10) / 10;

  return {
    newReadiness,
    readinessDelta,
    learningRate: alpha,
    difficultyMultiplier: diffMultiplier,
  };
}
