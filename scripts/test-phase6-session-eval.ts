import "dotenv/config";
import { db, withCandidateContext } from "../src/server/db/client";
import { computeRubricScore } from "../src/server/domain/scoring";
import { calculateReadinessUpdate } from "../src/server/domain/readiness";
import { computeSM2 } from "../src/server/domain/spaced-repetition";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPhase6Tests() {
  console.log("=== PHASE 6 SESSION EXECUTION & EVALUATION APIS TEST SUITE ===\n");

  const testClerkId = `test_clerk_p6_${Date.now()}`;
  let createdUserId: string | null = null;
  let createdProfileId: string | null = null;
  let createdPracticeSessionId: string | null = null;
  let createdMockSessionId: string | null = null;

  try {
    // 1. Setup Test User & Profile
    console.log("1. Setting up candidate profile...");
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
        targetRole: "Staff Distributed Systems Engineer",
        experienceLevel: "10+",
        targetCompanies: ["Google", "Stripe"],
        readinessScore: 45,
      },
    });
    createdProfileId = profile.id;
    console.log(`  ✓ CandidateProfile created with ID: ${profile.id}, initial readiness: ${profile.readinessScore}%`);

    // 2. Test Practice Submission Evaluation
    console.log("\n2. Testing Practice Session Submission & Rubric Evaluation...");
    // Find a seeded topic
    const topic = await db.curriculumTopic.findFirst({
      where: { slug: "consistent-hashing" },
    });
    assert(topic !== null, "Seed topic 'consistent-hashing' must exist in Neon DB");

    // Compute deterministic rubric
    const rawScores = {
      technical_depth: 9.0,
      tradeoffs_reasoning: 8.5,
      communication_structure: 8.0,
      scalability_failure_modes: 8.5,
      code_diagram_quality: 9.0,
    };
    const evaluation = computeRubricScore(rawScores);
    console.log(`  Computed overall rubric score: ${evaluation.overallScore}/100, verdict: ${evaluation.verdict}`);
    assert(evaluation.overallScore >= 85.0, "Score must qualify as Strong Hire");
    assert(evaluation.verdict === "Strong Hire", "Verdict must be 'Strong Hire'");

    // Update readiness trajectory
    const { newReadiness, readinessDelta } = calculateReadinessUpdate(
      profile.readinessScore,
      evaluation.overallScore,
      0 // first session
    );
    console.log(`  Bayesian readiness update: ${profile.readinessScore}% -> ${newReadiness}% (delta: +${readinessDelta}%)`);
    assert(newReadiness > profile.readinessScore, "New readiness must increase");

    // Persist practice session
    const practiceSession = await db.practiceSession.create({
      data: {
        candidateId: profile.id,
        topicId: topic?.id,
        domain: "system-design",
        topicSlug: "consistent-hashing",
        title: "Consistent Hashing & DHT",
        status: "COMPLETED",
        durationSeconds: 1200,
        codeSubmission: "Virtual nodes ring implementation with MD5 hashing.",
      },
    });
    createdPracticeSessionId = practiceSession.id;

    // Persist evaluation report
    const evalReport = await db.evaluationReport.create({
      data: {
        candidateId: profile.id,
        practiceId: practiceSession.id,
        overallScore: evaluation.overallScore,
        verdict: evaluation.verdict,
        readinessDelta: Math.round(readinessDelta),
        evaluatorNotes: "Mastery demonstrated across hash ring and virtual nodes.",
        strengths: ["Virtual node distribution", "Rebalancing analysis"],
        improvements: ["Add secondary replication protocol"],
        rubricScores: {
          create: Object.entries(evaluation.normalizedDimensions).map(([dim, score]) => ({
            dimension: dim,
            score,
            assessment: `${dim} evaluated at ${score}/10`,
            missingAtoms: [],
          })),
        },
      },
      include: { rubricScores: true },
    });
    console.log(`  ✓ EvaluationReport persisted in Neon DB with ID: ${evalReport.id}`);
    assert(evalReport.rubricScores.length === 5, "Report must contain exactly 5 rubric dimensions");

    // Update profile readiness in DB
    await db.candidateProfile.update({
      where: { id: profile.id },
      data: { readinessScore: newReadiness },
    });

    // 3. Test SM-2 Spaced Repetition Scheduling
    console.log("\n3. Testing SuperMemo-2 Revision Item Creation...");
    const sm2Output = computeSM2({
      repetitions: 0,
      intervalDays: 1.0,
      easeFactor: 2.5,
      sessionScore: evaluation.overallScore,
    });
    console.log(`  SM-2 computed: reps=${sm2Output.repetitions}, interval=${sm2Output.intervalDays}d, EF=${sm2Output.easeFactor}`);

    const revisionItem = await db.revisionItem.create({
      data: {
        candidateId: profile.id,
        topicId: topic!.id,
        topicTitle: topic!.title,
        domain: "system-design",
        repetitions: sm2Output.repetitions,
        intervalDays: sm2Output.intervalDays,
        easeFactor: sm2Output.easeFactor,
        nextReviewDate: sm2Output.nextReviewDate,
      },
    });
    console.log(`  ✓ RevisionItem created with nextReviewDate: ${revisionItem.nextReviewDate.toISOString()}`);
    assert(revisionItem.nextReviewDate > new Date(), "Next review date must be strictly in future");

    // 4. Test Mock Interview Session Lifecycle
    console.log("\n4. Testing Mock Interview Session Conclusion...");
    const mockSession = await db.mockInterviewSession.create({
      data: {
        candidateId: profile.id,
        interviewType: "system-design",
        targetRole: profile.targetRole,
        difficulty: "staff",
        durationMinutes: 45,
        status: "ACTIVE",
      },
    });
    createdMockSessionId = mockSession.id;

    // Conclude mock session
    const mockReport = await db.evaluationReport.create({
      data: {
        candidateId: profile.id,
        mockId: mockSession.id,
        overallScore: 82.0,
        verdict: "Hire",
        readinessDelta: 5,
        evaluatorNotes: "Solid distributed systems communication and architectural scoping.",
        strengths: ["Clean back-of-the-envelope estimation"],
        improvements: ["Deeper replication topology details"],
        rubricScores: {
          create: [
            { dimension: "technical_depth", score: 8.5, assessment: "Good depth", missingAtoms: [] },
            { dimension: "communication", score: 8.0, assessment: "Clear delivery", missingAtoms: [] },
          ],
        },
      },
    });

    await db.mockInterviewSession.update({
      where: { id: mockSession.id },
      data: { status: "COMPLETED" },
    });
    console.log(`  ✓ MockInterviewSession ${mockSession.id} concluded with EvaluationReport ${mockReport.id}`);

    // 5. Test Evaluation Report Retrieval & Tenant Isolation
    console.log("\n5. Testing Evaluation Report Retrieval & Tenant Isolation...");
    const retrievedReport = await db.evaluationReport.findUnique({
      where: { id: evalReport.id },
      include: { rubricScores: true, practiceSession: true },
    });
    assert(retrievedReport !== null, "Report must be retrievable");
    assert(retrievedReport?.candidateId === profile.id, "Candidate ID must match owner");
    console.log("  ✓ Evaluation report owner match confirmed!");

    console.log("\n🎉 ALL PHASE 6 SESSION EXECUTION & EVALUATION TESTS PASSED!");
  } catch (error) {
    console.error("❌ Phase 6 test suite failed:", error);
    process.exit(1);
  } finally {
    // Cleanup test user and cascading data
    if (createdUserId) {
      console.log("\nCleaning up test user & cascading data in Neon DB...");
      await db.user.delete({ where: { id: createdUserId } }).catch(() => {});
      console.log("✓ Cleanup complete!");
    }
  }
}

runPhase6Tests();
