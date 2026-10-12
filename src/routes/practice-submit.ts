import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { ai } from "../server/ai/gemini";
import { computeRubricScore } from "../server/domain/scoring";
import { calculateReadinessUpdate } from "../server/domain/readiness";
import { computeSM2 } from "../server/domain/spaced-repetition";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { checkIdempotency, saveIdempotency } from "../server/edge/idempotency";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handlePostPracticeSubmit(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const idempotencyKey = req.headers.get("idempotency-key");
    if (idempotencyKey) {
      const cached = await checkIdempotency(idempotencyKey);
      if (cached) {
        return ApiResponse.json(cached);
      }
    }

    const rl = await checkRateLimit(clerkId, "ai_eval");
    if (!rl.allowed) {
      return ApiResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
        { status: 429 }
      );
    }

    const context = await withCandidateContext(clerkId);
    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json(
        { error: "PROFILE_REQUIRED", message: "Please complete candidate profile first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      domain = "system-design",
      topicSlug,
      title,
      codeSubmission,
      whiteboardUrl,
      durationSeconds = 0,
    } = body;

    if (!topicSlug) {
      return ApiResponse.json(
        { error: "MISSING_TOPIC", message: "topicSlug is required." },
        { status: 400 }
      );
    }

    const curriculumTopic = await db.curriculumTopic.findUnique({
      where: { slug: topicSlug },
      include: { category: { include: { domain: true } } },
    });

    const topicTitle = curriculumTopic?.title || title || topicSlug;
    const resolvedDomain = curriculumTopic?.category?.domain?.slug || domain;

    const prompt = `
You are the PrepInMinutes Principal Evaluation Architect evaluating a ${resolvedDomain} candidate submission for: "${topicTitle}".

Candidate Solution:
${codeSubmission || "(Candidate provided diagram/whiteboard asset at " + whiteboardUrl + ")"}

Score the candidate strictly on each dimension from 1.0 (Novice) to 10.0 (Staff/Principal Mastery):
- technical_depth
- tradeoffs_reasoning
- communication_structure
- scalability_failure_modes
- code_diagram_quality

Return ONLY a valid JSON object matching this schema:
{
  "technical_depth": 8.0,
  "tradeoffs_reasoning": 7.5,
  "communication_structure": 8.0,
  "scalability_failure_modes": 7.0,
  "code_diagram_quality": 8.5,
  "evaluatorNotes": "Comprehensive solution with thorough partition tolerance analysis.",
  "strengths": ["Clear explanation of consensus protocol", "Addressed network partition handling"],
  "improvements": ["Elaborate on split-brain recovery procedures"],
  "missingAtoms": ["Split-brain fencing tokens"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const llmFeedback = JSON.parse(response.text || "{}");

    const evaluation = computeRubricScore({
      technical_depth: Number(llmFeedback.technical_depth) || 5.0,
      tradeoffs_reasoning: Number(llmFeedback.tradeoffs_reasoning) || 5.0,
      communication_structure: Number(llmFeedback.communication_structure) || 5.0,
      scalability_failure_modes: Number(llmFeedback.scalability_failure_modes) || 5.0,
      code_diagram_quality: Number(llmFeedback.code_diagram_quality) || 5.0,
    });

    const completedSessionCount = await db.practiceSession.count({
      where: { candidateId: profile.id },
    });

    const { newReadiness, readinessDelta } = calculateReadinessUpdate(
      profile.readinessScore,
      evaluation.overallScore,
      completedSessionCount
    );

    await db.candidateProfile.update({
      where: { id: profile.id },
      data: { readinessScore: newReadiness },
    });

    const practiceSession = await db.practiceSession.create({
      data: {
        candidateId: profile.id,
        topicId: curriculumTopic?.id || null,
        domain: resolvedDomain,
        topicSlug,
        title: topicTitle,
        durationSeconds: Number(durationSeconds) || 0,
        status: "COMPLETED",
        whiteboardUrl: whiteboardUrl || null,
        codeSubmission: codeSubmission || null,
      },
    });

    const evaluationReport = await db.evaluationReport.create({
      data: {
        candidateId: profile.id,
        practiceId: practiceSession.id,
        overallScore: evaluation.overallScore,
        verdict: evaluation.verdict,
        readinessDelta: Math.round(readinessDelta),
        evaluatorNotes:
          llmFeedback.evaluatorNotes || "Comprehensive evaluation recorded.",
        strengths: Array.isArray(llmFeedback.strengths) ? llmFeedback.strengths : [],
        improvements: Array.isArray(llmFeedback.improvements)
          ? llmFeedback.improvements
          : [],
        rubricScores: {
          create: Object.entries(evaluation.normalizedDimensions).map(
            ([dimension, score]) => ({
              dimension,
              score,
              assessment: `${dimension} evaluated at score ${score}/10`,
              missingAtoms: Array.isArray(llmFeedback.missingAtoms)
                ? llmFeedback.missingAtoms
                : [],
            })
          ),
        },
      },
      include: {
        rubricScores: true,
      },
    });

    if (curriculumTopic) {
      const existingRevision = await db.revisionItem.findFirst({
        where: {
          candidateId: profile.id,
          topicId: curriculumTopic.id,
        },
      });

      const sm2Output = computeSM2({
        repetitions: existingRevision?.repetitions || 0,
        intervalDays: existingRevision?.intervalDays || 1.0,
        easeFactor: existingRevision?.easeFactor || 2.5,
        sessionScore: evaluation.overallScore,
      });

      if (existingRevision) {
        await db.revisionItem.update({
          where: { id: existingRevision.id },
          data: {
            repetitions: sm2Output.repetitions,
            intervalDays: sm2Output.intervalDays,
            easeFactor: sm2Output.easeFactor,
            nextReviewDate: sm2Output.nextReviewDate,
            lastReviewedAt: new Date(),
          },
        });
      } else {
        await db.revisionItem.create({
          data: {
            candidateId: profile.id,
            topicId: curriculumTopic.id,
            topicTitle: curriculumTopic.title,
            domain: resolvedDomain,
            repetitions: sm2Output.repetitions,
            intervalDays: sm2Output.intervalDays,
            easeFactor: sm2Output.easeFactor,
            nextReviewDate: sm2Output.nextReviewDate,
            lastReviewedAt: new Date(),
          },
        });
      }

      await db.candidateTopicMastery.upsert({
        where: {
          candidateId_topicId: {
            candidateId: profile.id,
            topicId: curriculumTopic.id,
          },
        },
        update: {
          masteryScore: evaluation.overallScore,
          status: evaluation.overallScore >= 70.0 ? "PRACTICED" : "NEEDS_PRACTICE",
          totalAttempts: { increment: 1 },
          lastPracticedAt: new Date(),
          intervalDays: sm2Output.intervalDays,
          easeFactor: sm2Output.easeFactor,
          nextReviewDate: sm2Output.nextReviewDate,
        },
        create: {
          candidateId: profile.id,
          topicId: curriculumTopic.id,
          masteryScore: evaluation.overallScore,
          status: evaluation.overallScore >= 70.0 ? "PRACTICED" : "NEEDS_PRACTICE",
          totalAttempts: 1,
          lastPracticedAt: new Date(),
          intervalDays: sm2Output.intervalDays,
          easeFactor: sm2Output.easeFactor,
          nextReviewDate: sm2Output.nextReviewDate,
        },
      });
    }

    const responsePayload = {
      success: true,
      sessionId: practiceSession.id,
      reportId: evaluationReport.id,
      overallScore: evaluationReport.overallScore,
      verdict: evaluationReport.verdict,
      readinessDelta: evaluationReport.readinessDelta,
      newReadiness,
      report: evaluationReport,
    };

    if (idempotencyKey) {
      await saveIdempotency(idempotencyKey, responsePayload);
    }

    return ApiResponse.json(responsePayload);
  } catch (error) {
    console.error("Practice submission evaluation failed:", error);
    return ApiResponse.json(
      {
        error: "EVALUATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
