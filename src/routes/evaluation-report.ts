/**
 * PrepInMinutes — Dynamic Evaluation Report Retrieval Endpoint
 *
 * GET /api/evaluation/:reportId or GET /api/evaluation/report/:reportId
 * Retrieves complete multimodal evaluation report, rubric dimension breakdown,
 * missing rubric atoms, strengths, improvements, and candidate readiness impact.
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handleGetEvaluationReport(
  req: ApiRequest,
  rawReportId: string
): Promise<Response> {
  try {
    const reportId = (rawReportId || "").replace(/^report\//, "").trim();

    if (!reportId) {
      return ApiResponse.json(
        { error: "REPORT_ID_REQUIRED", message: "reportId is required." },
        { status: 400 }
      );
    }

    // Resolve Candidate Identity (with fallback for demo / test runs)
    const resolvedClerkId = resolveCandidateClerkId(req);
    const candidateIdentifier =
      resolvedClerkId ||
      req.headers.get("x-candidate-id") ||
      req.headers.get("x-candidate-email") ||
      "candidate@prepinminutes.com";

    // Query Evaluation Report with full relational associations
    const report = await db.evaluationReport.findUnique({
      where: { id: reportId },
      include: {
        rubricScores: true,
        practiceSession: {
          include: {
            topic: {
              include: {
                category: { include: { domain: true } },
              },
            },
          },
        },
        mockSession: true,
      },
    });

    if (!report) {
      return ApiResponse.json(
        {
          error: "REPORT_NOT_FOUND",
          message: `Evaluation report '${reportId}' does not exist.`,
        },
        { status: 404 }
      );
    }

    // Verify ownership (allow demo candidate or public view when demo)
    try {
      const context = await withCandidateContext(candidateIdentifier);
      const profile = context.profile;
      if (profile) {
        const isOwner =
          report.candidateId === profile.id ||
          report.practiceSession?.candidateId === profile.id ||
          report.mockSession?.candidateId === profile.id ||
          context.email === "candidate@prepinminutes.com";

        if (!isOwner && candidateIdentifier !== "candidate@prepinminutes.com") {
          return ApiResponse.json({ error: "FORBIDDEN" }, { status: 403 });
        }
      }
    } catch {
      // In guest or preview mode, allow report inspection
    }

    // Dynamic percentile rank calculation if null
    const percentileRank =
      report.percentileRank ??
      Math.min(99, Math.max(1, Math.round(report.overallScore * 0.95)));

    const responsePayload = {
      success: true,
      report: {
        ...report,
        percentileRank,
      },
    };

    return ApiResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60",
      },
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
