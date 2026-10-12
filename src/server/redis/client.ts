import "dotenv/config";
import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    "MISSING_CONFIG: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing."
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const RedisKeys = {
  rateLimit: (userId: string, scope: string) => `ratelimit:${scope}:${userId}`,
  idempotency: (key: string) => `idempotency:${key}`,
  sessionState: (sessionId: string) => `session:${sessionId}:state`,
  voiceTranscriptBuffer: (sessionId: string) =>
    `session:${sessionId}:transcripts`,
  userReadinessCache: (userId: string) => `candidate:${userId}:readiness`,
} as const;
