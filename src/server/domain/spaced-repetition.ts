export interface SM2Input {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  sessionScore: number;
}

export interface SM2Output {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: Date;
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Engine.
 * Schedules future review intervals and updates ease factor based on candidate performance.
 */
export function computeSM2(input: SM2Input): SM2Output {
  const { repetitions, intervalDays, easeFactor, sessionScore } = input;

  // Grade q in [0, 5] mapped from 0-100 score
  let q = 2;
  if (sessionScore >= 85) q = 5;
  else if (sessionScore >= 70) q = 4;
  else if (sessionScore >= 55) q = 3;

  // Ease factor update formula
  let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  // Enforce lower bound floor of 1.30
  if (newEF < 1.3) newEF = 1.3;

  let newRepetitions: number;
  let newInterval: number;

  if (q < 3) {
    // Failed recall: reset repetitions count and schedule 1-day drill
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEF);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    intervalDays: newInterval,
    easeFactor: Math.round(newEF * 100) / 100,
    nextReviewDate,
  };
}
