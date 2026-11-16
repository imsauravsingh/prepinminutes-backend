import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import {
  computeSM2,
  calculateRecallStrength,
  determineRetentionBand,
  RetentionBand,
} from "../server/domain/spaced-repetition";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handleGetRevisionItems(req: ApiRequest): Promise<Response> {
  try {
    const resolvedClerkId = resolveCandidateClerkId(req);
    const candidateIdentifier =
      resolvedClerkId ||
      req.headers.get("x-candidate-id") ||
      req.headers.get("x-candidate-email") ||
      "candidate@prepinminutes.com";

    const context = await withCandidateContext(candidateIdentifier).catch(async () => {
      return await withCandidateContext("candidate@prepinminutes.com");
    });

    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const dueOnly = searchParams.get("dueOnly") === "true";
    const domain = searchParams.get("domain");

    const whereClause: {
      candidateId: string;
      nextReviewDate?: { lte: Date };
      domain?: string;
    } = {
      candidateId: profile.id,
    };

    if (dueOnly) {
      whereClause.nextReviewDate = { lte: new Date() };
    }

    if (domain) {
      whereClause.domain = domain;
    }

    const dbItems = await db.revisionItem.findMany({
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

    // Compute dynamic time-decayed recall strength & retention bands
    const now = new Date();
    let totalDue = 0;
    let criticalCount = 0;
    let needsReinforcementCount = 0;
    let stableCount = 0;
    let masteredCount = 0;

    const items = dbItems.map((item) => {
      const dynamicRecall = calculateRecallStrength(
        item.lastReviewedAt,
        item.intervalDays,
        item.easeFactor
      );
      const dynamicBand: RetentionBand = determineRetentionBand(
        dynamicRecall,
        item.repetitions
      );

      const isDue = new Date(item.nextReviewDate) <= now;
      if (isDue) totalDue++;

      if (dynamicBand === "CRITICAL") criticalCount++;
      else if (dynamicBand === "NEEDS_REINFORCEMENT") needsReinforcementCount++;
      else if (dynamicBand === "STABLE") stableCount++;
      else if (dynamicBand === "MASTERED") masteredCount++;

      return {
        ...item,
        recallStrength: dynamicRecall,
        retentionBand: dynamicBand,
        isDue,
      };
    });

    return ApiResponse.json({
      success: true,
      totalDue,
      stats: {
        totalDue,
        criticalCount,
        needsReinforcementCount,
        stableCount,
        masteredCount,
      },
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
    const resolvedClerkId = resolveCandidateClerkId(req);
    const candidateIdentifier =
      resolvedClerkId ||
      req.headers.get("x-candidate-id") ||
      req.headers.get("x-candidate-email") ||
      "candidate@prepinminutes.com";

    const context = await withCandidateContext(candidateIdentifier).catch(async () => {
      return await withCandidateContext("candidate@prepinminutes.com");
    });

    const profile = context.profile;
    if (!profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { revisionItemId, topicSlug, sessionScore, qualityGrade } = body;

    if (!revisionItemId && !topicSlug) {
      return ApiResponse.json(
        {
          error: "INVALID_BODY",
          message: "Either revisionItemId or topicSlug is required.",
        },
        { status: 400 }
      );
    }

    if (sessionScore === undefined && qualityGrade === undefined) {
      return ApiResponse.json(
        {
          error: "INVALID_BODY",
          message: "Either sessionScore (0-100) or qualityGrade (0-5) is required.",
        },
        { status: 400 }
      );
    }

    let item = null;
    if (revisionItemId) {
      item = await db.revisionItem.findUnique({
        where: { id: revisionItemId },
        include: { topic: true },
      });
    } else if (topicSlug) {
      item = await db.revisionItem.findFirst({
        where: {
          candidateId: profile.id,
          topic: { slug: topicSlug },
        },
        include: { topic: true },
      });
    }

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
      qualityGrade: qualityGrade !== undefined ? Number(qualityGrade) : undefined,
      sessionScore: sessionScore !== undefined ? Number(sessionScore) : undefined,
    });

    const updatedItem = await db.revisionItem.update({
      where: { id: item.id },
      data: {
        repetitions: sm2Output.repetitions,
        intervalDays: sm2Output.intervalDays,
        easeFactor: sm2Output.easeFactor,
        nextReviewDate: sm2Output.nextReviewDate,
        lastReviewedAt: new Date(),
        recallStrength: sm2Output.recallStrength,
        retentionBand: sm2Output.retentionBand,
      },
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
        status: sm2Output.qualityGrade >= 3 ? "PRACTICED" : "NEEDS_PRACTICE",
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
