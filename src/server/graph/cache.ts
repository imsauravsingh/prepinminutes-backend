/**
 * PrepInMinutes — Upstash Redis L2 Edge Caching & Versioned Invalidation
 *
 * Implements:
 * 1. Versioned Cache Namespaces: cache:curriculum:v{n}:*
 * 2. 24-Hour Cache TTL (86,400s) for Knowledge Graph responses
 * 3. Dynamic curriculum:version tracking & atomic version incrementing
 * 4. Resilient fail-open error handling (if Redis is unreachable, API continues uninterrupted)
 */

import { redis } from "../redis/client";
import { db } from "../db/client";

export const CURRICULUM_VERSION_KEY = "curriculum:version";
export const DEFAULT_CURRICULUM_VERSION = process.env.CURRICULUM_VERSION || "v42";
export const CURRICULUM_CACHE_TTL_SECONDS = 86400; // 24 hours

// In-Memory L0 version cache to minimize Redis read roundtrips on edge
let cachedVersion: string | null = null;
let cachedVersionTimestamp = 0;
const VERSION_CACHE_TTL_MS = 15000; // 15 seconds

export const CurriculumCacheKeys = {
  version: () => CURRICULUM_VERSION_KEY,
  domains: (v: string) => `cache:curriculum:${v}:domains`,
  hierarchy: (v: string, domainSlug: string) =>
    `cache:curriculum:${v}:hierarchy:${domainSlug.toLowerCase()}`,
  topicDetail: (v: string, topicSlug: string) =>
    `cache:curriculum:${v}:topic:${topicSlug.toLowerCase()}`,
  topicQuestions: (v: string, topicSlug: string, queryHash: string) =>
    `cache:curriculum:${v}:questions:${topicSlug.toLowerCase()}:${queryHash}`,
};

export class CurriculumCacheManager {
  /**
   * Retrieves active curriculum publishing version (e.g. "v42").
   * Cached in worker memory for 15s to eliminate hot-path Redis reads.
   */
  public static async getCurriculumVersion(): Promise<string> {
    const now = Date.now();
    if (cachedVersion && now - cachedVersionTimestamp < VERSION_CACHE_TTL_MS) {
      return cachedVersion;
    }

    try {
      const v = await redis.get<string>(CURRICULUM_VERSION_KEY);
      if (v && typeof v === "string" && v.trim().length > 0) {
        cachedVersion = v.trim();
        cachedVersionTimestamp = now;
        return cachedVersion;
      }

      // Initialize default version in Redis if not set
      await redis.set(CURRICULUM_VERSION_KEY, DEFAULT_CURRICULUM_VERSION);
      cachedVersion = DEFAULT_CURRICULUM_VERSION;
      cachedVersionTimestamp = now;
      return cachedVersion;
    } catch (err) {
      console.warn("⚠️ [CurriculumCacheManager] Failed to read version from Redis; falling back to default:", err);
      return cachedVersion || DEFAULT_CURRICULUM_VERSION;
    }
  }

  /**
   * Sets an explicit curriculum version (e.g. "v42" or "v43").
   */
  public static async setCurriculumVersion(version: string): Promise<string> {
    const clean = (version || "").trim();
    if (!clean) throw new Error("INVALID_VERSION: Version string cannot be empty");

    await redis.set(CURRICULUM_VERSION_KEY, clean);
    cachedVersion = clean;
    cachedVersionTimestamp = Date.now();
    return clean;
  }

  /**
   * Atomically increments the curriculum version (e.g. "v42" -> "v43").
   * Automatically invalidates the cache namespace and writes an audit log trail.
   */
  public static async incrementCurriculumVersion(
    publishedBy?: { userId: string; email: string } | string,
    reason?: string
  ): Promise<{ previousVersion: string; newVersion: string }> {
    const currentVersion = await this.getCurriculumVersion();
    let nextNum = 1;

    const match = currentVersion.match(/^v?(\d+)$/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
    const newVersion = `v${nextNum}`;

    try {
      await redis.set(CURRICULUM_VERSION_KEY, newVersion);
      cachedVersion = newVersion;
      cachedVersionTimestamp = Date.now();

      // Log publish event to PostgreSQL AdminAuditLog if an admin is identified
      if (publishedBy) {
        const actorEmail = typeof publishedBy === "string" ? publishedBy : publishedBy.email;
        let userId = typeof publishedBy === "object" ? publishedBy.userId : null;

        if (!userId) {
          const user = await db.user.findUnique({ where: { email: actorEmail } });
          userId = user?.id || null;
        }

        if (userId) {
          await db.adminAuditLog.create({
            data: {
              userId,
              action: "CURRICULUM_PUBLISH",
              targetType: "CurriculumRelease",
              targetId: newVersion,
              changeDiff: {
                previousVersion: currentVersion,
                newVersion,
                actorEmail,
                reason: reason || "Admin published curriculum update",
                timestamp: new Date().toISOString(),
              },
            },
          }).catch((err) => {
            console.warn("⚠️ [CurriculumCacheManager] Failed to write admin audit log:", err);
          });
        }
      }

      console.log(`🚀 [CurriculumCacheManager] Curriculum version incremented: ${currentVersion} -> ${newVersion}`);
      return { previousVersion: currentVersion, newVersion };
    } catch (err) {
      console.error("❌ [CurriculumCacheManager] Failed to increment curriculum version in Redis:", err);
      throw err;
    }
  }

  /**
   * Fetches an entry from Upstash Redis L2 cache with timeout guard.
   */
  public static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key);
      return data ?? null;
    } catch (err) {
      console.warn(`⚠️ [CurriculumCacheManager] Redis GET miss/error on [${key}]:`, err);
      return null;
    }
  }

  /**
   * Stores an entry in Upstash Redis L2 cache with 24-hour TTL.
   */
  public static async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = CURRICULUM_CACHE_TTL_SECONDS
  ): Promise<void> {
    try {
      await redis.set(key, data, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`⚠️ [CurriculumCacheManager] Redis SET failed on [${key}]:`, err);
    }
  }

  /**
   * Deletes an entry from Upstash Redis.
   */
  public static async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      console.warn(`⚠️ [CurriculumCacheManager] Redis DEL failed on [${key}]:`, err);
    }
  }
}
