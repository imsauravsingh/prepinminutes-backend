import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handleGetEvaluationReport(
  req: ApiRequest,
  reportId: string
): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!reportId) {
      return ApiResponse.json({ error: "REPORT_ID_REQUIRED" }, { status: 400 });
    }

    const context = await withCandidateContext(clerkId);
    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const report = await db.evaluationReport.findUnique({
      where: { id: reportId },
      include: {
        rubricScores: true,
        practiceSession: true,
        mockSession: true,
      },
    });

    if (!report) {
      return ApiResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
    }

    const isOwner =
      report.candidateId === profile.id ||
      report.practiceSession?.candidateId === profile.id ||
      report.mockSession?.candidateId === profile.id;

    if (!isOwner) {
      return ApiResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    return ApiResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Evaluation report retrieval failed:", error);
    return ApiResponse.json(
      {
        error: "FETCH_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
