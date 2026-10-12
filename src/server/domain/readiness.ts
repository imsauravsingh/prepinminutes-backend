export interface ReadinessUpdateResult {
  newReadiness: number;
  readinessDelta: number;
}

/**
 * Calculates a candidate's readiness score using an adaptive exponential moving average (EMA)
 * that weighs recent performance against historical confidence.
 *
 * @param currentReadiness - Prior aggregate readiness score (0.0 - 100.0)
 * @param sessionScore - Performance score on the completed session (0.0 - 100.0)
 * @param completedSessionsCount - Total previous sessions completed by the candidate
 */
export function calculateReadinessUpdate(
  currentReadiness: number,
  sessionScore: number,
  completedSessionsCount: number
): ReadinessUpdateResult {
  // Rapid calibration for new candidates (N <= 3), stable Bayesian convergence thereafter (N > 3)
  const alpha = completedSessionsCount <= 3 ? 0.4 : 0.15;
  const newReadinessRaw = alpha * sessionScore + (1 - alpha) * currentReadiness;

  const newReadiness =
    Math.round(Math.max(0, Math.min(100, newReadinessRaw)) * 10) / 10;
  const readinessDelta =
    Math.round((newReadiness - currentReadiness) * 10) / 10;

  return { newReadiness, readinessDelta };
}
