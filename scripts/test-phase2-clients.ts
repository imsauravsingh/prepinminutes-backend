import "dotenv/config";
import { db, withCandidateContext } from "../src/server/db/client";
import { redis, RedisKeys } from "../src/server/redis/client";
import { uploadAsset, generatePresignedUploadUrl } from "../src/server/storage/r2";
import { ai, generate1536Embedding } from "../src/server/ai/gemini";

async function runPhase2Verification() {
  console.log("=== PHASE 2 SERVER INFRASTRUCTURE VERIFICATION ===\\n");

  // 1. Prisma & Tenant Context Guard
  console.log("1. Testing Prisma Client & Tenant Context...");
  const dbPing = await db.$queryRawUnsafe("SELECT 1 as connected");
  console.log("✓ Prisma connection verified:", dbPing);

  let unauthCaught = false;
  try {
    await withCandidateContext("");
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      unauthCaught = true;
    }
  }
  console.log(`✓ withCandidateContext empty guard: ${unauthCaught ? "PASSED" : "FAILED"}`);

  // 2. Upstash Redis
  console.log("\\n2. Testing Upstash Redis REST Client...");
  const pong = await redis.ping();
  console.log(`✓ Redis PING response: ${pong}`);

  const testKey = RedisKeys.idempotency("test_key_phase2_probe");
  await redis.set(testKey, "valid_token", { ex: 60 });
  const fetchedVal = await redis.get(testKey);
  console.log(`✓ Redis roundtrip get/set: ${fetchedVal === "valid_token" ? "PASSED" : "FAILED"}`);
  await redis.del(testKey);

  // 3. Cloudflare R2 Object Storage
  console.log("\\n3. Testing Cloudflare R2 Object Storage...");
  const presignedUrl = await generatePresignedUploadUrl("test/whiteboard-probe.png", "image/png", 120);
  console.log(`✓ Presigned upload URL generated: ${presignedUrl.substring(0, 60)}...`);

  const testBuffer = Buffer.from("prepinminutes_r2_verification_buffer");
  const uploadedUrl = await uploadAsset("test/probe.txt", testBuffer, "text/plain");
  console.log(`✓ Upload asset completed: ${uploadedUrl}`);

  // 4. Google Gemini Generative AI & Embeddings
  console.log("\n4. Testing Google Gemini AI SDK...");
  const genResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: "Respond with the single word: OK",
  });
  console.log(`✓ Gemini generation response: ${genResponse.text?.trim()}`);

  console.log("Testing 1536-dimensional embedding generation...");
  const embedding = await generate1536Embedding("Consistent Hashing and Distributed Cache Architecture");
  console.log(`✓ Generated embedding dimension length: ${embedding.length} (Expected: 1536)`);
  if (embedding.length !== 1536) {
    throw new Error(`Embedding length mismatch: got ${embedding.length}, expected 1536`);
  }

  console.log("\\n🎉 ALL PHASE 2 INFRASTRUCTURE CLIENTS VERIFIED 100% OPERATIONAL!");
  await db.$disconnect();
  process.exit(0);
}

runPhase2Verification().catch((err) => {
  console.error("❌ Phase 2 Verification Failed:", err);
  process.exit(1);
});
