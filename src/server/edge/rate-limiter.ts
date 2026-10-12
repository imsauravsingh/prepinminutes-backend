import { redis, RedisKeys } from "../redis/client";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  currentCount: number;
}

export type RateLimitTier = "general" | "ai_eval";

export const RATE_LIMIT_CONFIGS: Record<
  RateLimitTier,
  { limit: number; windowSeconds: number }
> = {
  general: { limit: 60, windowSeconds: 60 },
  ai_eval: { limit: 10, windowSeconds: 60 },
};

/**
 * Checks sliding-window rate limit using Redis Sorted Sets (ZSET).
 * Ensures atomic eviction of expired timestamps and counting of current requests.
 */
export async function checkRateLimit(
  userId: string,
  tier: RateLimitTier = "general",
  overrideLimit?: number,
  overrideWindowSeconds?: number
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[tier];
  const limit = overrideLimit ?? config.limit;
  const windowSeconds = overrideWindowSeconds ?? config.windowSeconds;

  const key = RedisKeys.rateLimit(userId, tier);
  const now = Date.now();
  const clearBefore = now - windowSeconds * 1000;

  const pipeline = redis.pipeline();
  // 1. Remove expired timestamps outside the sliding window
  pipeline.zremrangebyscore(key, 0, clearBefore);
  // 2. Add current request timestamp
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random().toString(36).substring(2, 9)}` });
  // 3. Count total active requests in the current window
  pipeline.zcard(key);
  // 4. Reset TTL on the sorted set
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = (results[2] as number) || 0;

  if (requestCount > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: windowSeconds,
      currentCount: requestCount,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - requestCount),
    resetSeconds: windowSeconds,
    currentCount: requestCount,
  };
}
