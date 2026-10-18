import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { z } from "zod";

const ProfileSchema = z.object({
  targetRole: z.string().min(2, "Target role must be at least 2 characters"),
  experienceLevel: z.string().default("3-5 years"),
  targetCompanies: z
    .union([z.array(z.string()), z.string()])
    .transform((val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    })
    .default([]),
  timelineWeeks: z.number().int().min(1).max(52).optional(),
  timelineLabel: z.string().default("1 month"),
  jobDescriptionText: z.string().optional().nullable(),
  weeklyGoalHours: z.number().min(1).max(60).default(6),
});

function deriveWeeksFromLabel(label: string, fallbackWeeks = 4): number {
  const clean = label.toLowerCase();
  if (clean.includes("2 week")) return 2;
  if (clean.includes("1 month") || clean.includes("4 week")) return 4;
  if (clean.includes("2 month") || clean.includes("8 week")) return 8;
  if (clean.includes("3 month") || clean.includes("12 week")) return 12;
  if (clean.includes("6 month") || clean.includes("24 week")) return 24;
  return fallbackWeeks;
}

export async function handlePostProfile(req: ApiRequest): Promise<Response> {
  try {
    const candidateId = resolveCandidateClerkId(req);
    if (!candidateId) {
      return ApiResponse.json({ error: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
    }

    const rl = await checkRateLimit(candidateId, "general");
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
    const computedWeeks = data.timelineWeeks || deriveWeeksFromLabel(data.timelineLabel, 4);

    let user = await db.user.findFirst({
      where: {
        OR: [
          { id: candidateId },
          { googleId: candidateId },
          { clerkId: candidateId },
          { username: candidateId },
          { email: candidateId },
        ],
      },
      include: {
        profile: {
          include: {
            plans: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      const isClerkId = candidateId.startsWith("user_") || candidateId.startsWith("test_clerk");
      user = await db.user.create({
        data: isClerkId
          ? {
              clerkId: candidateId,
              authProvider: "clerk",
              email: `${candidateId}@placeholder.local`,
            }
          : {
              googleId: candidateId,
              authProvider: "google",
              email: `${candidateId}@placeholder.local`,
            },
        include: {
          profile: {
            include: {
              plans: {
                where: { isActive: true },
                take: 1,
              },
            },
          },
        },
      });
    }

    // 1. Upsert candidate profile
    const profile = await db.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        targetCompanies: data.targetCompanies,
        timelineWeeks: computedWeeks,
        timelineLabel: data.timelineLabel,
        jobDescriptionText: data.jobDescriptionText || null,
        weeklyGoalHours: data.weeklyGoalHours,
        onboardingStep: 2,
      },
      create: {
        userId: user.id,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        targetCompanies: data.targetCompanies,
        timelineWeeks: computedWeeks,
        timelineLabel: data.timelineLabel,
        jobDescriptionText: data.jobDescriptionText || null,
        weeklyGoalHours: data.weeklyGoalHours,
        onboardingStep: 2,
        readinessScore: 45,
      },
    });

    // 2. Multi-plan architecture: Upsert or create active preparation plan
    const existingActivePlan = user.profile?.plans?.[0] || null;

    let activePlan;
    if (existingActivePlan) {
      activePlan = await db.preparationPlan.update({
        where: { id: existingActivePlan.id },
        data: {
          targetRole: data.targetRole,
          title: `${data.targetRole} Prep`,
          targetCompanies: data.targetCompanies,
          timelineWeeks: computedWeeks,
          timelineLabel: data.timelineLabel,
          jobDescriptionText: data.jobDescriptionText || null,
          isActive: true,
        },
      });
    } else {
      activePlan = await db.preparationPlan.create({
        data: {
          candidateId: profile.id,
          title: `${data.targetRole} Prep`,
          targetRole: data.targetRole,
          targetCompanies: data.targetCompanies,
          timelineWeeks: computedWeeks,
          timelineLabel: data.timelineLabel,
          jobDescriptionText: data.jobDescriptionText || null,
          isActive: true,
          status: "active",
          readinessScore: 45,
        },
      });

      // Point profile's activePlanId to the newly created plan
      await db.candidateProfile.update({
        where: { id: profile.id },
        data: { activePlanId: activePlan.id },
      });
    }

    return ApiResponse.json({
      success: true,
      profile,
      activePlan,
    });
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
    const candidateId = resolveCandidateClerkId(req);
    if (!candidateId) {
      return ApiResponse.json({ error: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          { id: candidateId },
          { googleId: candidateId },
          { clerkId: candidateId },
          { username: candidateId },
          { email: candidateId },
        ],
      },
      include: {
        profile: {
          include: {
            plans: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      return ApiResponse.json({
        success: true,
        profile: null,
        activePlan: null,
      });
    }

    const activePlan = user.profile.plans?.[0] || null;

    return ApiResponse.json({
      success: true,
      profile: user.profile,
      activePlan,
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
