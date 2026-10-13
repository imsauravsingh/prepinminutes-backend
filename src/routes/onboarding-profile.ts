import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { z } from "zod";

const ProfileSchema = z.object({
  targetRole: z.string().min(2, "Target role must be at least 2 characters"),
  experienceLevel: z.enum(["0-2", "3-5", "6-9", "10+"]).default("3-5"),
  targetCompanies: z.array(z.string()).default([]),
  timelineWeeks: z.number().int().min(1).max(52).default(8),
  weeklyGoalHours: z.number().min(1).max(60).default(6),
});

export async function handlePostProfile(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const rl = await checkRateLimit(clerkId, "general");
    if (!rl.allowed) {
      return ApiResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = ProfileSchema.safeParse(body);
    if (!validated.success) {
      return ApiResponse.json(
        { error: "VALIDATION_FAILED", details: validated.error.issues },
        { status: 400 }
      );
    }

    const data = validated.data;

    let user = await db.user.findFirst({
      where: {
        OR: [{ id: clerkId }, { googleId: clerkId }, { clerkId }],
      },
    });

    if (!user) {
      const isClerkId = clerkId.startsWith("user_") || clerkId.startsWith("test_clerk");
      user = await db.user.create({
        data: isClerkId
          ? {
              clerkId,
              authProvider: "clerk",
              email: `${clerkId}@placeholder.local`,
            }
          : {
              googleId: clerkId,
              authProvider: "google",
              email: `${clerkId}@placeholder.local`,
            },
      });
    }

    const profile = await db.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        targetCompanies: data.targetCompanies,
        timelineWeeks: data.timelineWeeks,
        weeklyGoalHours: data.weeklyGoalHours,
      },
      create: {
        userId: user.id,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        targetCompanies: data.targetCompanies,
        timelineWeeks: data.timelineWeeks,
        weeklyGoalHours: data.weeklyGoalHours,
        readinessScore: 45,
      },
    });

    return ApiResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return ApiResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function handleGetProfile(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ id: clerkId }, { googleId: clerkId }, { clerkId }],
      },
      include: {
        profile: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return ApiResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    return ApiResponse.json({
      success: true,
      profile: user.profile,
      plan: user.profile.plan,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return ApiResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
