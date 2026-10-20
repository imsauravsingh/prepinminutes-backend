/**
 * PrepInMinutes — Admin Candidate Directory & Subscription Management API
 *
 * Implements:
 * GET   /api/admin/candidates                 — List candidates, filter by subscription opted status, tier, blocked
 * GET   /api/admin/candidates/:id             — View full candidate prep profile & subscription stats
 * PATCH /api/admin/candidates/:id/subscription — Modify candidate subscription tier, quota, or extension
 * POST  /api/admin/candidates/:id/block       — Universal candidate block with written reason
 * POST  /api/admin/candidates/:id/unblock     — Unblock candidate
 * POST  /api/admin/candidates/:id/reset-quota — Reset candidate voice minutes & mock quota
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { requireAdminRole } from "../server/auth/admin-auth";
import { AdminRole, SubscriptionTier, SubscriptionStatus } from "@prisma/client";

const CANDIDATE_VIEW_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
  "STAFF_ENGINEER",
  "CONTENT_REVIEWER",
];

const CANDIDATE_MANAGE_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
];

/**
 * GET /api/admin/candidates
 * Supports search, tier, isPlanOpted, isBlocked, pagination.
 */
export async function handleGetAdminCandidates(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_VIEW_ROLES);
  if (!auth.allowed) return auth.response;

  const url = req.nextUrl;
  const search = url.searchParams.get("search")?.trim() || "";
  const tierParam = url.searchParams.get("tier") || "";
  const isPlanOptedParam = url.searchParams.get("isPlanOpted");
  const isBlockedParam = url.searchParams.get("isBlocked");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  // Build where conditions
  const where: any = {
    role: "CANDIDATE",
  };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isBlockedParam !== null && isBlockedParam !== undefined && isBlockedParam !== "") {
    where.isBlocked = isBlockedParam === "true";
  }

  const subWhere: any = {};
  if (tierParam && Object.values(SubscriptionTier).includes(tierParam as any)) {
    subWhere.tier = tierParam as SubscriptionTier;
  }
  if (isPlanOptedParam !== null && isPlanOptedParam !== undefined && isPlanOptedParam !== "") {
    subWhere.isPlanOpted = isPlanOptedParam === "true";
  }

  if (Object.keys(subWhere).length > 0) {
    where.subscription = subWhere;
  }

  // Fetch metrics and records in parallel
  const [candidates, totalCount, totalOptedCount, totalBlockedCount, totalFreeCount] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isBlocked: true,
        blockedReason: true,
        blockedAt: true,
        blockedBy: true,
        createdAt: true,
        profile: {
          select: {
            targetRole: true,
            experienceLevel: true,
            readinessScore: true,
            isOnboardingDone: true,
          },
        },
        subscription: {
          select: {
            tier: true,
            status: true,
            planName: true,
            isPlanOpted: true,
            pricePaid: true,
            voiceMinutesUsed: true,
            voiceMinutesLimit: true,
            mockInterviewsUsed: true,
            mockInterviewsLimit: true,
            currentPeriodEnd: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
    db.subscription.count({
      where: { isPlanOpted: true, user: { role: "CANDIDATE" } },
    }),
    db.user.count({
      where: { role: "CANDIDATE", isBlocked: true },
    }),
    db.user.count({
      where: {
        role: "CANDIDATE",
        OR: [{ subscription: null }, { subscription: { isPlanOpted: false } }],
      },
    }),
  ]);

  return ApiResponse.json({
    success: true,
    page,
    limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    metrics: {
      totalCandidates: totalCount,
      subscribedCandidates: totalOptedCount,
      freeTierCandidates: totalFreeCount,
      blockedCandidates: totalBlockedCount,
    },
    candidates: candidates.map((c) => ({
      id: c.id,
      email: c.email,
      fullName: c.fullName || "Unnamed Candidate",
      avatarUrl: c.avatarUrl,
      isBlocked: c.isBlocked,
      blockedReason: c.blockedReason,
      blockedAt: c.blockedAt ? c.blockedAt.toISOString() : null,
      blockedBy: c.blockedBy,
      createdAt: c.createdAt.toISOString(),
      targetRole: c.profile?.targetRole || "Software Engineer",
      experienceLevel: c.profile?.experienceLevel || "Mid",
      readinessScore: c.profile?.readinessScore ?? 45,
      isOnboardingDone: c.profile?.isOnboardingDone ?? false,
      subscription: c.subscription
        ? {
            tier: c.subscription.tier,
            status: c.subscription.status,
            planName: c.subscription.planName,
            isPlanOpted: c.subscription.isPlanOpted,
            pricePaid: c.subscription.pricePaid,
            voiceMinutesUsed: c.subscription.voiceMinutesUsed,
            voiceMinutesLimit: c.subscription.voiceMinutesLimit,
            mockInterviewsUsed: c.subscription.mockInterviewsUsed,
            mockInterviewsLimit: c.subscription.mockInterviewsLimit,
            currentPeriodEnd: c.subscription.currentPeriodEnd
              ? c.subscription.currentPeriodEnd.toISOString()
              : null,
          }
        : {
            tier: "FREE" as const,
            status: "INACTIVE" as const,
            planName: "Free Starter",
            isPlanOpted: false,
            pricePaid: 0.0,
            voiceMinutesUsed: 0.0,
            voiceMinutesLimit: 30.0,
            mockInterviewsUsed: 0,
            mockInterviewsLimit: 1,
            currentPeriodEnd: null,
          },
    })),
  });
}

/**
 * GET /api/admin/candidates/:id
 */
export async function handleGetAdminCandidateDetail(
  req: ApiRequest,
  candidateId: string
): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_VIEW_ROLES);
  if (!auth.allowed) return auth.response;

  const candidate = await db.user.findFirst({
    where: { id: candidateId, role: "CANDIDATE" },
    include: {
      profile: true,
      subscription: true,
    },
  });

  if (!candidate) {
    return ApiResponse.json(
      { error: "NOT_FOUND", message: "Candidate not found." },
      { status: 404 }
    );
  }

  return ApiResponse.json({
    success: true,
    candidate,
  });
}

/**
 * PATCH /api/admin/candidates/:id/subscription
 * Modify subscription tier, manual quota limits, or plan extension.
 */
export async function handlePatchAdminCandidateSubscription(
  req: ApiRequest,
  candidateId: string
): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_MANAGE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    tier?: SubscriptionTier;
    status?: SubscriptionStatus;
    isPlanOpted?: boolean;
    voiceMinutesLimit?: number;
    mockInterviewsLimit?: number;
    extendDays?: number;
  };

  const candidate = await db.user.findFirst({
    where: { id: candidateId, role: "CANDIDATE" },
  });

  if (!candidate) {
    return ApiResponse.json(
      { error: "NOT_FOUND", message: "Candidate not found." },
      { status: 404 }
    );
  }

  // Calculate new expiration date if extending
  let currentPeriodEnd: Date | undefined;
  if (body.extendDays && body.extendDays > 0) {
    currentPeriodEnd = new Date(Date.now() + body.extendDays * 24 * 60 * 60 * 1000);
  }

  const updatedSubscription = await db.subscription.upsert({
    where: { userId: candidateId },
    create: {
      userId: candidateId,
      tier: body.tier || SubscriptionTier.PRO_MONTHLY,
      status: body.status || SubscriptionStatus.ACTIVE,
      planName: body.tier === SubscriptionTier.LIFETIME ? "Lifetime Unlimited" : "Pro Monthly",
      isPlanOpted: body.isPlanOpted !== undefined ? body.isPlanOpted : true,
      voiceMinutesLimit: body.voiceMinutesLimit || 300,
      mockInterviewsLimit: body.mockInterviewsLimit || 10,
      paymentProvider: "manual_admin",
      currentPeriodEnd,
    },
    update: {
      tier: body.tier,
      status: body.status,
      isPlanOpted: body.isPlanOpted,
      voiceMinutesLimit: body.voiceMinutesLimit,
      mockInterviewsLimit: body.mockInterviewsLimit,
      currentPeriodEnd,
    },
  });

  // Log admin audit
  await db.adminAuditLog.create({
    data: {
      userId: admin.id,
      action: "UPDATE_CANDIDATE_SUBSCRIPTION",
      targetType: "Subscription",
      targetId: candidateId,
      changeDiff: {
        candidateEmail: candidate.email,
        updatedTier: body.tier,
        isPlanOpted: body.isPlanOpted,
        extendDays: body.extendDays,
      },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Subscription updated for ${candidate.email}.`,
    subscription: updatedSubscription,
  });
}

/**
 * POST /api/admin/candidates/:id/block
 * Universally blocks candidate and records written reason.
 */
export async function handlePostAdminBlockCandidate(
  req: ApiRequest,
  candidateId: string
): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_MANAGE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    reason?: string;
  };

  const reason = body.reason?.trim() || "Administrative block due to policy violation.";

  const candidate = await db.user.findFirst({
    where: { id: candidateId, role: "CANDIDATE" },
  });

  if (!candidate) {
    return ApiResponse.json(
      { error: "NOT_FOUND", message: "Candidate not found." },
      { status: 404 }
    );
  }

  const updatedCandidate = await db.user.update({
    where: { id: candidateId },
    data: {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date(),
      blockedBy: admin.email,
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: admin.id,
      action: "BLOCK_CANDIDATE",
      targetType: "User",
      targetId: candidateId,
      changeDiff: {
        candidateEmail: candidate.email,
        reason,
        blockedBy: admin.email,
      },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Candidate ${candidate.email} has been blocked.`,
    candidate: {
      id: updatedCandidate.id,
      email: updatedCandidate.email,
      isBlocked: updatedCandidate.isBlocked,
      blockedReason: updatedCandidate.blockedReason,
    },
  });
}

/**
 * POST /api/admin/candidates/:id/unblock
 */
export async function handlePostAdminUnblockCandidate(
  req: ApiRequest,
  candidateId: string
): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_MANAGE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const candidate = await db.user.findFirst({
    where: { id: candidateId, role: "CANDIDATE" },
  });

  if (!candidate) {
    return ApiResponse.json(
      { error: "NOT_FOUND", message: "Candidate not found." },
      { status: 404 }
    );
  }

  const updatedCandidate = await db.user.update({
    where: { id: candidateId },
    data: {
      isBlocked: false,
      blockedReason: null,
      blockedAt: null,
      blockedBy: null,
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: admin.id,
      action: "UNBLOCK_CANDIDATE",
      targetType: "User",
      targetId: candidateId,
      changeDiff: { candidateEmail: candidate.email },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Candidate ${candidate.email} has been unblocked.`,
    candidate: {
      id: updatedCandidate.id,
      email: updatedCandidate.email,
      isBlocked: false,
    },
  });
}

/**
 * POST /api/admin/candidates/:id/reset-quota
 */
export async function handlePostAdminResetQuota(
  req: ApiRequest,
  candidateId: string
): Promise<Response> {
  const auth = await requireAdminRole(req, CANDIDATE_MANAGE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const sub = await db.subscription.findUnique({
    where: { userId: candidateId },
  });

  if (!sub) {
    return ApiResponse.json(
      { error: "NO_SUBSCRIPTION", message: "Candidate does not have an active subscription." },
      { status: 404 }
    );
  }

  const updatedSub = await db.subscription.update({
    where: { userId: candidateId },
    data: {
      voiceMinutesUsed: 0.0,
      mockInterviewsUsed: 0,
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: admin.id,
      action: "RESET_CANDIDATE_QUOTA",
      targetType: "Subscription",
      targetId: candidateId,
    },
  });

  return ApiResponse.json({
    success: true,
    message: "Candidate voice and mock interview quotas have been reset to zero.",
    subscription: updatedSub,
  });
}
