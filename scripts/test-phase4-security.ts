import "dotenv/config";
import { checkRateLimit, RateLimitResult } from "../src/server/edge/rate-limiter";
import {
  checkIdempotency,
  saveIdempotency,
  buildSessionIdempotencyKey,
} from "../src/server/edge/idempotency";
import { redis, RedisKeys } from "../src/server/redis/client";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPhase4Tests() {
  console.log("=== PHASE 4 EDGE SECURITY & MIDDLEWARE TEST SUITE ===\n");

  const testUserId = `test-candidate-${Date.now()}`;
  const testSessionId = `sess-verification-${Date.now()}`;

  try {
    // 1. Sliding Window Rate Limiter Tests
    console.log("1. Testing Upstash Sliding Window Rate Limiter...");
    
    // Test a custom small window: limit 3 in 10s
    console.log("  Testing burst limit (limit = 3, window = 10s)...");
    const r1 = await checkRateLimit(testUserId, "general", 3, 10);
    console.log(`    Request 1: allowed=${r1.allowed}, remaining=${r1.remaining}, count=${r1.currentCount}`);
    assert(r1.allowed === true, "Request 1 must be allowed");
    assert(r1.remaining === 2, "Request 1 remaining must equal 2");

    const r2 = await checkRateLimit(testUserId, "general", 3, 10);
    console.log(`    Request 2: allowed=${r2.allowed}, remaining=${r2.remaining}, count=${r2.currentCount}`);
    assert(r2.allowed === true, "Request 2 must be allowed");
    assert(r2.remaining === 1, "Request 2 remaining must equal 1");

    const r3 = await checkRateLimit(testUserId, "general", 3, 10);
    console.log(`    Request 3: allowed=${r3.allowed}, remaining=${r3.remaining}, count=${r3.currentCount}`);
    assert(r3.allowed === true, "Request 3 must be allowed");
    assert(r3.remaining === 0, "Request 3 remaining must equal 0");

    // Request 4 should be rejected (HTTP 429 scenario)
    const r4 = await checkRateLimit(testUserId, "general", 3, 10);
    console.log(`    Request 4 (tripped): allowed=${r4.allowed}, remaining=${r4.remaining}, count=${r4.currentCount}`);
    assert(r4.allowed === false, "Request 4 must be BLOCKED (rate limit exceeded)");
    assert(r4.remaining === 0, "Request 4 remaining must equal 0");
    console.log("  ✓ Sliding window rate limit tripping verified!");

    // Clean up test rate limit key
    const rateLimitKey = RedisKeys.rateLimit(testUserId, "general");
    await redis.del(rateLimitKey);

    // 2. Idempotency Interceptor Tests
    console.log("\n2. Testing Submission Idempotency Interceptor...");
    const idempotencyKey = buildSessionIdempotencyKey(testSessionId, 1);
    console.log(`  Constructed Idempotency-Key: ${idempotencyKey}`);

    // Initial check: should be null (miss)
    const initialCheck = await checkIdempotency(idempotencyKey);
    console.log("  Initial cache lookup:", initialCheck);
    assert(initialCheck === null, "Initial cache check must return null");

    // Save evaluation payload
    const mockEvaluationPayload = {
      sessionId: testSessionId,
      overallScore: 88.5,
      verdict: "Strong Hire",
      strengths: ["Strong understanding of Raft consensus", "Clear write-ahead logging explanation"],
      areasForImprovement: ["Discuss boundary conditions in split-brain recovery"],
      timestamp: new Date().toISOString(),
    };
    await saveIdempotency(idempotencyKey, mockEvaluationPayload, 60);
    console.log("  Saved evaluation payload to idempotency store (TTL 60s)");

    // Second check: should return cached payload (hit)
    const cachedHit = await checkIdempotency<typeof mockEvaluationPayload>(idempotencyKey);
    console.log("  Second cache lookup (hit):", cachedHit);
    assert(cachedHit !== null, "Second check must hit the idempotency cache");
    assert(cachedHit?.sessionId === testSessionId, "Cached session ID must match");
    assert(cachedHit?.overallScore === 88.5, "Cached overall score must match");
    assert(cachedHit?.verdict === "Strong Hire", "Cached verdict must match");
    console.log("  ✓ Idempotency cache hit verified without duplicate compute!");

    // Clean up test idempotency key
    const cacheKey = RedisKeys.idempotency(idempotencyKey);
    await redis.del(cacheKey);

    console.log("\n🎉 ALL PHASE 4 EDGE SECURITY & MIDDLEWARE TESTS PASSED!");
  } catch (error) {
    console.error("❌ Phase 4 tests failed:", error);
    process.exit(1);
  }
}

runPhase4Tests();
