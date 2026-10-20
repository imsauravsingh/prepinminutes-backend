/**
 * PrepInMinutes — Admin HOD Team & Staff Management API
 *
 * RESTRICTED EXCLUSIVELY TO ROOT HOD (imsauravsingh@gmail.com)
 *
 * Implements:
 * GET   /api/admin/team               — Active staff directory (roles, status, blocking state)
 * GET   /api/admin/team/pending       — Pending access requests with applicant written reason text
 * PATCH /api/admin/team/:id/approve   — HOD approves staff applicant and assigns official role
 * PATCH /api/admin/team/:id/reject    — HOD rejects staff access request
 * PATCH /api/admin/team/:id/role      — HOD promotes or reassigns staff role
 * POST  /api/admin/team/:id/block     — Universal staff blocking (suspends admin permissions immediately)
 * POST  /api/admin/team/:id/unblock   — Unblock staff member
 * GET   /api/admin/team/audit-logs    — System-wide administrative audit trail
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { requireRootHOD, ROOT_HOD_EMAIL } from "../server/auth/admin-auth";
import { AdminRole, AdminApprovalStatus } from "@prisma/client";

/**
 * GET /api/admin/team
 * Returns all active administrative staff.
 */
export async function handleGetAdminTeam(req: ApiRequest): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const staff = await db.user.findMany({
    where: {
      role: {
        in: [
          "SUPER_ADMIN",
          "HOD",
          "CURRICULUM_MANAGER",
          "STAFF_ENGINEER",
          "CONTENT_REVIEWER",
        ],
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      adminApprovalStatus: true,
      isBlocked: true,
      blockedReason: true,
      blockedAt: true,
      blockedBy: true,
      approvedAt: true,
      approvedBy: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return ApiResponse.json({
    success: true,
    staff: staff.map((s) => ({
      ...s,
      isRootHod: s.email === ROOT_HOD_EMAIL,
      createdAt: s.createdAt.toISOString(),
      approvedAt: s.approvedAt ? s.approvedAt.toISOString() : null,
      blockedAt: s.blockedAt ? s.blockedAt.toISOString() : null,
    })),
  });
}

/**
 * GET /api/admin/team/pending
 * Returns all pending staff access requests with their submitted reason text.
 */
export async function handleGetAdminTeamPending(req: ApiRequest): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const pendingRequests = await db.user.findMany({
    where: {
      adminApprovalStatus: "PENDING",
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      requestedRole: true,
      requestReason: true,
      requestedAt: true,
      createdAt: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  return ApiResponse.json({
    success: true,
    totalPending: pendingRequests.length,
    requests: pendingRequests.map((r) => ({
      id: r.id,
      email: r.email,
      fullName: r.fullName || "Applicant",
      avatarUrl: r.avatarUrl,
      requestedRole: r.requestedRole || "CONTENT_REVIEWER",
      requestReason: r.requestReason || "No written justification provided.",
      requestedAt: r.requestedAt ? r.requestedAt.toISOString() : r.createdAt.toISOString(),
    })),
  });
}

/**
 * PATCH /api/admin/team/:id/approve
 * HOD approves staff applicant and assigns official role.
 */
export async function handlePatchAdminTeamApprove(
  req: ApiRequest,
  userId: string
): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const hod = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    role?: AdminRole;
  };

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  // Determine official role
  const assignedRole: AdminRole =
    body.role ||
    (user.requestedRole as AdminRole) ||
    "CONTENT_REVIEWER";

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      role: assignedRole,
      adminApprovalStatus: "APPROVED",
      approvedBy: hod.email,
      approvedAt: new Date(),
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: hod.id,
      action: "APPROVE_STAFF_ACCESS",
      targetType: "User",
      targetId: userId,
      changeDiff: {
        staffEmail: user.email,
        assignedRole,
        writtenReason: user.requestReason,
      },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Staff applicant ${user.email} approved as ${assignedRole}.`,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      adminApprovalStatus: updatedUser.adminApprovalStatus,
    },
  });
}

/**
 * PATCH /api/admin/team/:id/reject
 */
export async function handlePatchAdminTeamReject(
  req: ApiRequest,
  userId: string
): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const hod = auth.context.user;

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      adminApprovalStatus: "REJECTED",
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: hod.id,
      action: "REJECT_STAFF_ACCESS",
      targetType: "User",
      targetId: userId,
      changeDiff: { staffEmail: user.email },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Access request for ${user.email} was rejected.`,
  });
}

/**
 * PATCH /api/admin/team/:id/role
 * HOD modifies an existing staff member's administrative role.
 */
export async function handlePatchAdminTeamRole(
  req: ApiRequest,
  userId: string
): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const hod = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    role?: AdminRole;
  };

  const newRole = body.role;
  if (!newRole || !Object.values(AdminRole).includes(newRole)) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "A valid AdminRole is required." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  if (user.email === ROOT_HOD_EMAIL) {
    return ApiResponse.json(
      { error: "FORBIDDEN", message: "Cannot modify role of Root HOD." },
      { status: 403 }
    );
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await db.adminAuditLog.create({
    data: {
      userId: hod.id,
      action: "MODIFY_STAFF_ROLE",
      targetType: "User",
      targetId: userId,
      changeDiff: {
        staffEmail: user.email,
        oldRole: user.role,
        newRole,
      },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Role for ${user.email} updated to ${newRole}.`,
    user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
  });
}

/**
 * POST /api/admin/team/:id/block
 * Universally blocks a staff member and revokes admin control plane access.
 */
export async function handlePostAdminTeamBlock(
  req: ApiRequest,
  userId: string
): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const hod = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    reason?: string;
  };

  const reason = body.reason?.trim() || "Administrative access suspended by Head of Department.";

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  if (user.email === ROOT_HOD_EMAIL) {
    return ApiResponse.json(
      { error: "FORBIDDEN", message: "Root HOD cannot be blocked." },
      { status: 403 }
    );
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date(),
      blockedBy: hod.email,
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: hod.id,
      action: "BLOCK_STAFF_MEMBER",
      targetType: "User",
      targetId: userId,
      changeDiff: {
        staffEmail: user.email,
        reason,
        blockedBy: hod.email,
      },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Staff member ${user.email} has been blocked and suspended from the admin panel.`,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      isBlocked: true,
      blockedReason: updatedUser.blockedReason,
    },
  });
}

/**
 * POST /api/admin/team/:id/unblock
 */
export async function handlePostAdminTeamUnblock(
  req: ApiRequest,
  userId: string
): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const hod = auth.context.user;

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ApiResponse.json({ error: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
      blockedReason: null,
      blockedAt: null,
      blockedBy: null,
    },
  });

  await db.adminAuditLog.create({
    data: {
      userId: hod.id,
      action: "UNBLOCK_STAFF_MEMBER",
      targetType: "User",
      targetId: userId,
      changeDiff: { staffEmail: user.email },
    },
  });

  return ApiResponse.json({
    success: true,
    message: `Staff member ${user.email} has been unblocked.`,
    user: { id: updatedUser.id, email: updatedUser.email, isBlocked: false },
  });
}

/**
 * GET /api/admin/team/audit-logs
 * Retrieves the global audit log history.
 */
export async function handleGetAdminAuditLogs(req: ApiRequest): Promise<Response> {
  const auth = await requireRootHOD(req);
  if (!auth.allowed) return auth.response;

  const logs = await db.adminAuditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  return ApiResponse.json({
    success: true,
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      changeDiff: l.changeDiff,
      performedBy: l.user.email,
      performedByName: l.user.fullName || "Admin",
      createdAt: l.createdAt.toISOString(),
    })),
  });
}

