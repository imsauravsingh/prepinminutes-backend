import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { computeSM2 } from "../server/domain/spaced-repetition";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handleGetRevisionItems(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const context = await withCandidateContext(clerkId);
    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const dueOnly = searchParams.get("dueOnly") !== "false";

    const whereClause: { candidateId: string; nextReviewDate?: { lte: Date } } = {
      candidateId: profile.id,
    };

    if (dueOnly) {
      whereClause.nextReviewDate = { lte: new Date() };
    }

    const items = await db.revisionItem.findMany({
      where: whereClause,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            practiceHref: true,
          },
        },
      },
      orderBy: { nextReviewDate: "asc" },
    });

    return ApiResponse.json({
      success: true,
      totalDue: items.length,
      items,
    });
  } catch (error) {
    console.error("Revision items fetch error:", error);
    return ApiResponse.json(
      {
        error: "FETCH_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function handlePostRevisionItems(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const context = await withCandidateContext(clerkId);
    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const { revisionItemId, sessionScore } = await req.json();

    if (!revisionItemId || sessionScore === undefined) {
      return ApiResponse.json(
        { error: "INVALID_BODY", message: "revisionItemId and sessionScore are required." },
        { status: 400 }
      );
    }

    const item = await db.revisionItem.findUnique({
      where: { id: revisionItemId },
    });

    if (!item || item.candidateId !== profile.id) {
      return ApiResponse.json(
        { error: "NOT_FOUND", message: "Revision item not found or unauthorized." },
        { status: 404 }
      );
    }

    const sm2Output = computeSM2({
      repetitions: item.repetitions,
      intervalDays: item.intervalDays,
      easeFactor: item.easeFactor,
      sessionScore: Number(sessionScore),
    });

    const updatedItem = await db.revisionItem.update({
      where: { id: revisionItemId },
      data: {
        repetitions: sm2Output.repetitions,
        intervalDays: sm2Output.intervalDays,
        easeFactor: sm2Output.easeFactor,
        nextReviewDate: sm2Output.nextReviewDate,
        lastReviewedAt: new Date(),
      },
    });

    await db.candidateTopicMastery.updateMany({
      where: {
        candidateId: profile.id,
        topicId: item.topicId,
      },
      data: {
        lastPracticedAt: new Date(),
        intervalDays: sm2Output.intervalDays,
        easeFactor: sm2Output.easeFactor,
        nextReviewDate: sm2Output.nextReviewDate,
        status: Number(sessionScore) >= 70 ? "PRACTICED" : "NEEDS_PRACTICE",
      },
    });

    return ApiResponse.json({
      success: true,
      updatedItem,
      sm2Output,
    });
  } catch (error) {
    console.error("Revision item update error:", error);
    return ApiResponse.json(
      {
        error: "UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
