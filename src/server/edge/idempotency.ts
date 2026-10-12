import { redis, RedisKeys } from "../redis/client";

/**
 * Checks if a payload with the given idempotency key was previously processed.
 * Returns the cached serialized response if present, or null if this is a first-time execution.
 */
export async function checkIdempotency<T = unknown>(
  key: string
): Promise<T | null> {
  const cacheKey = RedisKeys.idempotency(key);
  const cached = await redis.get<string | T>(cacheKey);

  if (!cached) {
    return null;
  }

  if (typeof cached === "string") {
    try {
      return JSON.parse(cached) as T;
    } catch {
      return cached as unknown as T;
    }
  }

  return cached;
}

/**
 * Persists an idempotent response payload in Redis for 24 hours (86,400s default TTL).
 */
export async function saveIdempotency(
  key: string,
  responseData: unknown,
  ttlSeconds = 86400
): Promise<void> {
  const cacheKey = RedisKeys.idempotency(key);
  const serialized =
    typeof responseData === "string"
      ? responseData
      : JSON.stringify(responseData);

  await redis.set(cacheKey, serialized, { ex: ttlSeconds });
}

/**
 * Helper to construct standard idempotency keys for session submissions.
 */
export function buildSessionIdempotencyKey(
  sessionId: string,
  attempt: number | string = 1
): string {
  return `${sessionId}:${attempt}`;
}
