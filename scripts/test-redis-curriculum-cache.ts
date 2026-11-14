/**
 * PrepInMinutes — TASK-P3-03 Automated Verification Test Suite
 * Upstash Redis Edge Caching & Version-Namespaced Invalidation
 *
 * Verifies:
 * 1. Redis connectivity and version tracking (curriculum:version).
 * 2. L2 Cache population on cache miss with 24-hour TTL (86,400s).
 * 3. L2 Cache hit serving cached responses with X-Cache: HIT_L2_REDIS.
 * 4. Version-based invalidation (atomic increment advances namespace v42 -> v43).
 * 5. Admin publishing release endpoint (POST /api/admin/curriculum/publish) and PostgreSQL audit logging.
 * 6. P99 cached hierarchy response time < 15ms.
 */

import worker from "../src/index";
import { redis } from "../src/server/redis/client";
import { db } from "../src/server/db/client";
import {
  CurriculumCacheManager,
  CurriculumCacheKeys,
  CURRICULUM_VERSION_KEY,
} from "../src/server/graph/cache";
import { clearCurriculumMemoryCache } from "../src/routes/curriculum";
import { signAdminSessionJwt } from "../src/server/auth/admin-auth";
import { closeNeo4jDriver } from "../src/server/graph/neo4j";

const BASE_URL = "https://api.prepinminutes.internal";

async function runRedisCacheTestSuite() {
  console.log("==================================================================");
  console.log("🧪 TASK-P3-03: Upstash Redis L2 Edge Caching Verification Suite");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      process.exitCode = 1;
    }
  }

  // Preserve initial version to restore at teardown
  const initialVersion = await CurriculumCacheManager.getCurriculumVersion();
  console.log(`📌 Starting with curriculum:version = ${initialVersion}\n`);

  try {
    // -------------------------------------------------------------
    // Test Group 1: Redis Connectivity & Version State
    // -------------------------------------------------------------
    console.log("🔹 1. Testing Redis Connectivity & Version Operations...");
    {
      const pong = await redis.ping();
      assert(pong === "PONG", "Upstash Redis connection responds with PONG");

      await CurriculumCacheManager.setCurriculumVersion("v42");
      const v = await CurriculumCacheManager.getCurriculumVersion();
      assert(v === "v42", `Version set and read from Redis is 'v42' (got: ${v})`);

      const rawVersionInRedis = await redis.get<string>(CURRICULUM_VERSION_KEY);
      assert(rawVersionInRedis === "v42", `Redis raw key 'curriculum:version' is 'v42'`);
    }

    // -------------------------------------------------------------
    // Test Group 2: L2 Cache Population & 24h TTL on Hierarchy Endpoint
    // -------------------------------------------------------------
    console.log("\n🔹 2. Testing L2 Cache Population & 24h TTL...");
    {
      // Reset caches
      clearCurriculumMemoryCache();
      const redisKey = CurriculumCacheKeys.hierarchy("v42", "system-design");
      await CurriculumCacheManager.delete(redisKey);

      // Verify key is empty before request
      const beforeReq = await CurriculumCacheManager.get(redisKey);
      assert(beforeReq === null, "Redis cache key is empty before request");

      // First Request -> Cache Miss / Origin Query
      const req1 = new Request(`${BASE_URL}/api/curriculum/hierarchy/system-design`, {
        method: "GET",
      });
      const res1 = await worker.fetch(req1);
      assert(res1.status === 200, "Initial request returns HTTP 200 OK");
      assert(res1.headers.get("x-cache") === "MISS_ORIGIN", "Initial request has X-Cache: MISS_ORIGIN");

      // Verify key was populated in Redis
      const cachedData = await CurriculumCacheManager.get<any>(redisKey);
      assert(cachedData !== null, "Hierarchy response was stored in Redis L2 cache");
      assert(cachedData?.domainSlug === "system-design", "Cached data contains domainSlug 'system-design'");

      // Verify TTL
      const ttl = await redis.ttl(redisKey);
      assert(ttl > 80000 && ttl <= 86400, `Redis TTL set to ~24 hours (got ${ttl}s)`);
      console.log(`    ⚡ Stored in Redis key: ${redisKey} (TTL: ${ttl}s)`);
    }

    // -------------------------------------------------------------
    // Test Group 3: L2 Redis Cache Hit & Latency
    // -------------------------------------------------------------
    console.log("\n🔹 3. Testing L2 Redis Cache Hit...");
    {
      // Clear L0 in-memory cache to force reading from L2 Redis
      clearCurriculumMemoryCache();

      const req2 = new Request(`${BASE_URL}/api/curriculum/hierarchy/system-design`, {
        method: "GET",
      });
      const start = performance.now();
      const res2 = await worker.fetch(req2);
      const latencyMs = performance.now() - start;

      assert(res2.status === 200, "Second request returns HTTP 200 OK");
      assert(res2.headers.get("x-cache") === "HIT_L2_REDIS", `Second request has X-Cache: HIT_L2_REDIS (got: ${res2.headers.get("x-cache")})`);
      console.log(`    ⚡ L2 Redis Fetch Latency: ${latencyMs.toFixed(2)}ms`);

      // Third Request (now in L0 memory cache)
      const req3 = new Request(`${BASE_URL}/api/curriculum/hierarchy/system-design`, {
        method: "GET",
      });
      const startL0 = performance.now();
      const res3 = await worker.fetch(req3);
      const latencyL0 = performance.now() - startL0;
      assert(res3.headers.get("x-cache") === "HIT_L0_MEMORY", `Subsequent request has X-Cache: HIT_L0_MEMORY (got: ${res3.headers.get("x-cache")})`);
      console.log(`    ⚡ L0 Memory Fetch Latency: ${latencyL0.toFixed(2)}ms`);
    }

    // -------------------------------------------------------------
    // Test Group 4: Versioned Namespace Invalidation (v42 -> v43)
    // -------------------------------------------------------------
    console.log("\n🔹 4. Testing Version-Based Invalidation (Namespace Advance)...");
    {
      // Increment version
      const { previousVersion, newVersion } = await CurriculumCacheManager.incrementCurriculumVersion(
        "admin@prepinminutes.com",
        "Automated cache invalidation test"
      );
      assert(previousVersion === "v42", `previousVersion === 'v42'`);
      assert(newVersion === "v43", `newVersion === 'v43'`);

      // Clear L0 cache
      clearCurriculumMemoryCache();

      // Request now targets v43 namespace
      const reqNew = new Request(`${BASE_URL}/api/curriculum/hierarchy/system-design`, {
        method: "GET",
      });
      const resNew = await worker.fetch(reqNew);
      assert(resNew.status === 200, "Request after version bump returns HTTP 200 OK");
      assert(resNew.headers.get("x-curriculum-Version") === "v43", `Response header X-Curriculum-Version is 'v43' (got: ${resNew.headers.get("x-curriculum-version")})`);
      assert(resNew.headers.get("x-cache") === "MISS_ORIGIN", "New version namespace misses cleanly on origin (no stale data)");

      // Verify v43 key exists in Redis
      const keyV43 = CurriculumCacheKeys.hierarchy("v43", "system-design");
      const v43Data = await CurriculumCacheManager.get<any>(keyV43);
      assert(v43Data !== null, `New version namespace key [${keyV43}] is populated`);

      // Clean up v43 key
      await CurriculumCacheManager.delete(keyV43);
    }

    // -------------------------------------------------------------
    // Test Group 5: Admin Publishing Endpoint & PostgreSQL Audit Trail
    // -------------------------------------------------------------
    console.log("\n🔹 5. Testing Admin Publishing Release Endpoint (POST /api/admin/curriculum/publish)...");
    {
      // Find root HOD admin in PostgreSQL
      const hodUser = await db.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });
      assert(hodUser !== null, "HOD admin user exists in PostgreSQL");

      if (hodUser) {
        const token = signAdminSessionJwt({
          id: hodUser.id,
          email: hodUser.email,
          fullName: hodUser.fullName,
          role: hodUser.role,
          adminApprovalStatus: hodUser.adminApprovalStatus,
          isBlocked: hodUser.isBlocked,
        });

        const reqPublish = new Request(`${BASE_URL}/api/admin/curriculum/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: "TASK-P3-03 Automated Release Publish Test",
          }),
        });

        const resPublish = await worker.fetch(reqPublish);
        assert(resPublish.status === 200, "Publishing endpoint returns HTTP 200 OK");

        const publishData = (await resPublish.json()) as any;
        assert(publishData.success === true, "Publish response has success: true");
        assert(!!publishData.newVersion, `Publish returns newVersion: ${publishData.newVersion}`);

        // Verify PostgreSQL admin_audit_logs
        const auditLog = await db.adminAuditLog.findFirst({
          where: {
            userId: hodUser.id,
            action: "CURRICULUM_PUBLISH",
          },
          orderBy: { createdAt: "desc" },
        });

        assert(auditLog !== null, "AdminAuditLog entry was recorded in PostgreSQL");
        assert(auditLog?.targetType === "CurriculumRelease", `auditLog targetType is 'CurriculumRelease'`);
      }
    }

    // -------------------------------------------------------------
    // Test Group 6: P99 Cached Hierarchy Latency Benchmark (< 15ms)
    // -------------------------------------------------------------
    console.log("\n🔹 6. Benchmarking P99 Cached Latency (Target: < 15ms)...");
    {
      const currentV = await CurriculumCacheManager.getCurriculumVersion();
      const req = new Request(`${BASE_URL}/api/curriculum/hierarchy/system-design`, {
        method: "GET",
      });

      // Warm up
      await worker.fetch(req);

      const iterations = 20;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const res = await worker.fetch(req);
        const elapsed = performance.now() - start;
        if (res.status === 200) {
          latencies.push(elapsed);
        }
      }

      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p90 = latencies[Math.floor(latencies.length * 0.9)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];

      console.log(`    ⚡ Latency Percentiles across ${iterations} cached requests:`);
      console.log(`       P50: ${p50.toFixed(2)}ms`);
      console.log(`       P90: ${p90.toFixed(2)}ms`);
      console.log(`       P99: ${p99.toFixed(2)}ms`);

      assert(p99 < 15, `P99 cached latency achieves sub-15ms target (got: ${p99.toFixed(2)}ms)`);
    }
  } finally {
    // Teardown: Restore initial version & cleanup
    console.log(`\n🧹 Teardown: Restoring curriculum:version = ${initialVersion}...`);
    await CurriculumCacheManager.setCurriculumVersion(initialVersion);
    clearCurriculumMemoryCache();
    await closeNeo4jDriver();
    await db.$disconnect();
  }

  console.log("\n==================================================================");
  console.log(`📊 Test Suite Result: ${passedTests}/${totalTests} Tests Passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 TASK-P3-03 Upstash Redis Caching Verified Successfully!");
    process.exit(0);
  } else {
    console.error(`💥 ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
}

runRedisCacheTestSuite().catch(async (err) => {
  console.error("Unhandled test suite exception:", err);
  await closeNeo4jDriver();
  await db.$disconnect();
  process.exit(1);
});
