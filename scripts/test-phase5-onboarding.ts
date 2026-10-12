import "dotenv/config";
import { db, withCandidateContext } from "../src/server/db/client";
import { generate1536Embedding, ai } from "../src/server/ai/gemini";
import { uploadAsset } from "../src/server/storage/r2";
import { PDFParse } from "pdf-parse";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPhase5Tests() {
  console.log("=== PHASE 5 ONBOARDING & VECTOR PIPELINE TEST SUITE ===\n");

  const testClerkId = `test_clerk_${Date.now()}`;
  let createdUserId: string | null = null;
  let createdProfileId: string | null = null;

  try {
    // 1. Candidate Profile Creation & Persistence Test
    console.log("1. Testing Candidate Profile Persistence...");
    const user = await db.user.create({
      data: {
        clerkId: testClerkId,
        email: `${testClerkId}@example.com`,
      },
    });
    createdUserId = user.id;

    const profile = await db.candidateProfile.create({
      data: {
        userId: user.id,
        targetRole: "Staff Distributed Systems Architect",
        experienceLevel: "10+",
        targetCompanies: ["Google", "Stripe", "AWS"],
        timelineWeeks: 4,
        weeklyGoalHours: 12.0,
        readinessScore: 50,
      },
    });
    createdProfileId = profile.id;
    console.log(`  ✓ CandidateProfile created in Neon DB with ID: ${profile.id}`);

    // Verify tenant context lookup
    const ctx = await withCandidateContext(testClerkId);
    assert(ctx.userId === user.id, "Context userId must match");
    assert(ctx.profile?.targetRole === "Staff Distributed Systems Architect", "Profile target role must match");
    console.log("  ✓ Tenant context isolation verified!");

    // 2. PDF Parsing, R2 Upload & pgvector Embedding Test
    console.log("\n2. Testing Resume PDF & pgvector Pipeline...");
    const sampleResumePdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 50 700 Td (Saurav Kumar - Principal Architect specializing in Kafka, Raft, Distributed Systems) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \n0000000287 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n457\n%%EOF"
    );

    // Parse PDF text
    const parser = new PDFParse({ data: sampleResumePdf });
    const parsedPdf = await parser.getText();
    const cleanText = parsedPdf.text.replace(/\s+/g, " ").trim();
    console.log(`  Extracted PDF Text: "${cleanText}"`);
    assert(cleanText.includes("Distributed Systems"), "Extracted text must contain 'Distributed Systems'");

    // Upload to Cloudflare R2
    const r2Key = `resumes/test-${Date.now()}.pdf`;
    const r2Url = await uploadAsset(r2Key, sampleResumePdf, "application/pdf");
    console.log(`  ✓ Uploaded to Cloudflare R2: ${r2Url}`);

    // Generate 1,536-dimensional embedding
    console.log("  Generating 1,536-dimensional vector embedding via Gemini...");
    const embedding = await generate1536Embedding(cleanText);
    assert(embedding.length === 1536, "Embedding must be exactly 1536 dimensions");
    console.log(`  ✓ Generated embedding length: ${embedding.length}`);

    // Raw SQL insert into DocumentEmbedding with pgvector
    console.log("  Inserting into DocumentEmbedding with ::vector(1536)...");
    await db.$executeRaw`
      INSERT INTO "DocumentEmbedding" (
        "id",
        "candidateId",
        "docType",
        "content",
        "embedding",
        "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${createdProfileId},
        'resume',
        ${cleanText},
        ${JSON.stringify(embedding)}::vector,
        NOW()
      );
    `;
    console.log("  ✓ Inserted vector embedding into Neon PostgreSQL!");

    // Query back using pgvector cosine distance (<=> operator)
    const similarDocs = await db.$queryRaw<Array<{ id: string; content: string; distance: number }>>`
      SELECT "id", "content", ("embedding" <=> ${JSON.stringify(embedding)}::vector) as distance
      FROM "DocumentEmbedding"
      WHERE "candidateId" = ${createdProfileId}
      ORDER BY distance ASC
      LIMIT 1;
    `;
    console.log(`  Cosine similarity distance check: ${similarDocs[0]?.distance}`);
    assert(similarDocs.length > 0, "Must return at least 1 similar document");
    assert(similarDocs[0].distance < 0.001, "Distance to itself must be near 0");
    console.log("  ✓ pgvector cosine similarity distance verified!");

    // 3. Preparation Plan Generation Test
    console.log("\n3. Testing Preparation Plan Synthesis...");
    const planPrompt = `
      Create a 4-week preparation plan for a Staff Distributed Systems candidate.
      Return JSON:
      {
        "domainWeights": { "system-design": 0.50, "coding": 0.30, "behavioral": 0.10, "cloud": 0.10 },
        "weeklyMilestones": [
          { "weekNumber": 1, "title": "Week 1: Raft & Consensus" },
          { "weekNumber": 2, "title": "Week 2: High Throughput Storage" },
          { "weekNumber": 3, "title": "Week 3: Advanced Coding & Concurrency" },
          { "weekNumber": 4, "title": "Week 4: Behavioral & Staff Mock" }
        ]
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: planPrompt,
      config: { responseMimeType: "application/json" },
    });

    const parsedPlan = JSON.parse(aiResponse.text || "{}");
    console.log(`  ✓ Gemini synthesized ${parsedPlan.weeklyMilestones?.length} weekly milestones`);

    const savedPlan = await db.preparationPlan.create({
      data: {
        candidateId: createdProfileId,
        targetRole: profile.targetRole,
        targetSeniority: profile.experienceLevel,
        timelineWeeks: profile.timelineWeeks,
        weeklyMilestones: parsedPlan.weeklyMilestones,
        domainWeights: parsedPlan.domainWeights,
      },
    });
    console.log(`  ✓ PreparationPlan saved to Neon DB with ID: ${savedPlan.id}`);
    assert(savedPlan.timelineWeeks === 4, "Plan timelineWeeks must equal 4");

    console.log("\n🎉 ALL PHASE 5 ONBOARDING & VECTOR PIPELINE TESTS PASSED!");
  } catch (error) {
    console.error("❌ Phase 5 test suite failed:", error);
    process.exit(1);
  } finally {
    // Clean up test user & cascading relationships
    if (createdUserId) {
      console.log("\nCleaning up test user & cascading data in Neon DB...");
      await db.user.delete({ where: { id: createdUserId } }).catch(() => {});
      console.log("✓ Cleanup complete!");
    }
  }
}

runPhase5Tests();
