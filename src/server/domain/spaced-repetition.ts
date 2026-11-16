/**
 * PrepInMinutes — SuperMemo SM-2 Spaced Repetition & Decay Engine
 *
 * Implements:
 * 1. Bidirectional Quality Inputs: sessionScore (0-100) and direct flashcard qualityGrade (0-5).
 * 2. Asymmetric Easiness Factor scaling with immutable floor EF >= 1.30.
 * 3. Progressive Interval Expansion: I_1 = 1d -> I_2 = 6d -> I_n = round(I_{n-1} * EF).
 * 4. Ebbinghaus Memory Decay: RecallStrength(t) = 100 * exp(-0.5 * t / (I * EF)).
 * 5. Retention Band Taxonomy: CRITICAL, NEEDS_REINFORCEMENT, STABLE, MASTERED.
 */

export type RetentionBand =
  | "CRITICAL"
  | "NEEDS_REINFORCEMENT"
  | "STABLE"
  | "MASTERED";

export interface SM2Input {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  sessionScore?: number; // 0.0 - 100.0
  qualityGrade?: number; // 0 - 5
}

export interface SM2Output {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  qualityGrade: number;
  nextReviewDate: Date;
  retentionBand: RetentionBand;
  recallStrength: number; // 0 - 100%
}

/**
 * Maps a continuous session score (0.0 - 100.0) to an integer SuperMemo grade (0 - 5).
 */
export function mapScoreToGrade(sessionScore: number): number {
  if (sessionScore >= 85.0) return 5;
  if (sessionScore >= 70.0) return 4;
  if (sessionScore >= 55.0) return 3;
  if (sessionScore >= 40.0) return 2;
  if (sessionScore >= 20.0) return 1;
  return 0;
}

/**
 * Calculates time-decayed recall strength based on elapsed days since last review.
 * Formula: R(t) = round( 100 * exp( -0.5 * t / (intervalDays * easeFactor) ) )
 */
export function calculateRecallStrength(
  lastReviewedAt: Date | string | null | undefined,
  intervalDays: number,
  easeFactor: number
): number {
  if (!lastReviewedAt) return 45; // Default uncalibrated retention

  const lastDate = typeof lastReviewedAt === "string" ? new Date(lastReviewedAt) : lastReviewedAt;
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - lastDate.getTime());
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  const safeInterval = Math.max(1, intervalDays || 1);
  const safeEF = Math.max(1.3, easeFactor || 2.5);

  const halfLife = safeInterval * safeEF;
  const decayFraction = Math.exp(-0.5 * (elapsedDays / halfLife));

  const recallStrength = Math.round(decayFraction * 100);
  return Math.max(10, Math.min(100, recallStrength));
}

/**
 * Categorizes a topic into a RetentionBand based on recall strength and repetition depth.
 */
export function determineRetentionBand(
  recallStrength: number,
  repetitions: number,
  qualityGrade?: number
): RetentionBand {
  if (qualityGrade !== undefined && qualityGrade < 3) {
    return "CRITICAL";
  }
  if (recallStrength < 40) {
    return "CRITICAL";
  }
  if (recallStrength < 70) {
    return "NEEDS_REINFORCEMENT";
  }
  if (recallStrength < 85 || repetitions < 3) {
    return "STABLE";
  }
  return "MASTERED";
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Engine.
 * Schedules future review intervals and updates ease factor based on candidate recall.
 */
export function computeSM2(input: SM2Input): SM2Output {
  const { repetitions = 0, intervalDays = 1.0, easeFactor = 2.5 } = input;

  // 1. Resolve Quality Grade q in [0, 5]
  let q: number;
  if (input.qualityGrade !== undefined) {
    q = Math.max(0, Math.min(5, Math.round(Number(input.qualityGrade))));
  } else if (input.sessionScore !== undefined) {
    q = mapScoreToGrade(Number(input.sessionScore));
  } else {
    q = 3; // Default moderate recall
  }

  // 2. Calculate New Easiness Factor EF'
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  let newEF = Math.round((easeFactor + deltaEF) * 100) / 100;

  // Enforce lower bound floor of 1.30
  if (newEF < 1.3) newEF = 1.3;

  // 3. Calculate New Repetitions and Review Interval
  let newRepetitions: number;
  let newInterval: number;

  if (q < 3) {
    // Failed recall: reset repetitions count and schedule 1-day immediate drill
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful recall: increment streak and expand interval
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.max(1, Math.round(intervalDays * newEF));
    }
  }

  // 4. Calculate Scheduled Next Review Date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // 5. Initial recall strength immediately post-review is high
  const recallStrength = q >= 4 ? 98 : q === 3 ? 80 : 35;
  const retentionBand = determineRetentionBand(recallStrength, newRepetitions, q);

  return {
    repetitions: newRepetitions,
    intervalDays: newInterval,
    easeFactor: newEF,
    qualityGrade: q,
    nextReviewDate,
    retentionBand,
    recallStrength,
  };
}
