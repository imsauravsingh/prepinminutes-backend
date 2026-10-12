import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { ai } from "../server/ai/gemini";
import { computeRubricScore } from "../server/domain/scoring";
import { calculateReadinessUpdate } from "../server/domain/readiness";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handlePostMockInterviewEnd(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
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
        { error: "PROFILE_REQUIRED", message: "Candidate profile required." },
        { status: 400 }
      );
    }

    const { sessionId, transcript, durationMinutes = 30 } = await req.json();

    if (!sessionId) {
      return ApiResponse.json(
        { error: "SESSION_ID_REQUIRED", message: "sessionId is required." },
        { status: 400 }
      );
    }

    const session = await db.mockInterviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.candidateId !== profile.id) {
      return ApiResponse.json(
        { error: "NOT_FOUND", message: "Mock interview session not found or unauthorized." },
        { status: 404 }
      );
    }

    const transcriptText = Array.isArray(transcript)
      ? transcript
          .map(
            (t: { speaker?: string; text?: string }) =>
              `${t.speaker?.toUpperCase() || "CANDIDATE"}: ${t.text}`
          )
          .join("\n")
      : typeof transcript === "string"
      ? transcript
      : "Multi-turn technical interview session concluded.";

    const prompt = `
You are the PrepInMinutes Senior Bar Raiser conducting post-interview debrief for:
- Role: ${session.targetRole} (${session.difficulty} difficulty)
- Type: ${session.interviewType}

Transcript:
${transcriptText}

Evaluate strictly across 5 dimensions (1.0 to 10.0 scale):
- technical_depth
- tradeoffs_reasoning
- communication_structure
- scalability_failure_modes
- code_diagram_quality

Return ONLY a valid JSON object matching this schema:
{
  "technical_depth": 8.0,
  "tradeoffs_reasoning": 7.5,
  "communication_structure": 8.5,
  "scalability_failure_modes": 7.0,
  "code_diagram_quality": 6.5,
  "evaluatorNotes": "Comprehensive architectural mastery exhibited.",
  "strengths": ["Clear communication", "Structured breakdown"],
  "improvements": ["Deepen failure mode analysis"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const llmFeedback = JSON.parse(response.text || "{}");

    const evaluation = computeRubricScore({
      technical_depth: Number(llmFeedback.technical_depth) || 5.0,
      tradeoffs_reasoning: Number(llmFeedback.tradeoffs_reasoning) || 5.0,
      communication_structure: Number(llmFeedback.communication_structure) || 5.0,
      scalability_failure_modes: Number(llmFeedback.scalability_failure_modes) || 5.0,
      code_diagram_quality: Number(llmFeedback.code_diagram_quality) || 5.0,
    });

    const totalSessions = await db.mockInterviewSession.count({
      where: { candidateId: profile.id, status: "COMPLETED" },
    });

    const { newReadiness, readinessDelta } = calculateReadinessUpdate(
      profile.readinessScore,
      evaluation.overallScore,
      totalSessions
    );

    await db.candidateProfile.update({
      where: { id: profile.id },
      data: { readinessScore: newReadiness },
    });

    await db.mockInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        durationMinutes: Number(durationMinutes) || session.durationMinutes,
        transcript: transcript || session.transcript,
      },
    });

    const evaluationReport = await db.evaluationReport.create({
      data: {
        candidateId: profile.id,
        mockId: sessionId,
        overallScore: evaluation.overallScore,
        verdict: evaluation.verdict,
        readinessDelta: Math.round(readinessDelta),
        evaluatorNotes:
          llmFeedback.evaluatorNotes || "Comprehensive mock interview debrief completed.",
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
              missingAtoms: [],
            })
          ),
        },
      },
      include: {
        rubricScores: true,
      },
    });

    return ApiResponse.json({
      success: true,
      sessionId,
      reportId: evaluationReport.id,
      overallScore: evaluationReport.overallScore,
      verdict: evaluationReport.verdict,
      readinessDelta: evaluationReport.readinessDelta,
      newReadiness,
      report: evaluationReport,
    });
  } catch (error) {
    console.error("Mock interview conclusion failed:", error);
    return ApiResponse.json(
      {
        error: "MOCK_EVALUATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
