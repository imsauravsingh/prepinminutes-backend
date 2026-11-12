/**
 * Company Intelligence Refresh Engine Configuration
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md & Final Simplified Spec
 */

export interface IntelligenceRefreshConfigSeed {
  jobName: string;
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  batchSize: number;
  maxRetries: number;
  refreshIntervalDays: number;
  strategy: string;
}

export const CANONICAL_REFRESH_CONFIG: IntelligenceRefreshConfigSeed = {
  jobName: "COMPANY_INTELLIGENCE_REFRESH",
  enabled: true,
  cronExpression: "0 2 1,15 * *", // 1st and 15th of every month at 02:00 AM IST
  timezone: "Asia/Kolkata",
  batchSize: 50,
  maxRetries: 3,
  refreshIntervalDays: 30, // Re-refresh eligibility threshold
  strategy: "RESUME_PENDING",
};

