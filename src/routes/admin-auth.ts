/**
 * PrepInMinutes — Admin Authentication Routes
 * 
 * Implements:
 * POST /api/admin/auth/login          — Email + Password authentication for Admins
 * POST /api/admin/auth/google         — Google SSO authentication (Auto-approves HOD; sets others to PENDING)
 * POST /api/admin/auth/request-access — Submits requested role and written reason for HOD approval
 * GET  /api/admin/auth/me             — Returns authenticated admin profile and role
 * POST /api/admin/auth/logout         — Clears admin session cookie
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { verifyPassword } from "../server/auth/credentials";
import { verifyGoogleIdToken } from "../server/auth/google-sso";
import {
  AdminRole,
  AdminApprovalStatus,
} from "@prisma/client";
import {
  ROOT_HOD_EMAIL,
  signAdminSessionJwt,
  buildAdminSessionCookieHeader,
  buildAdminLogoutCookieHeader,
  resolveAdminContext,
} from "../server/auth/admin-auth";

/**
 * POST /api/admin/auth/login
 * Validates admin credentials, checks approval & blocking status, issues `pim_admin_session`.
 */
export async function handlePostAdminLogin(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return ApiResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return ApiResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordValid = verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return ApiResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Blocking check
    if (user.isBlocked) {
      return ApiResponse.json(
        {
          error: "ACCOUNT_BLOCKED",
          message: user.blockedReason
            ? `Your administrator account has been suspended: ${user.blockedReason}`
            : "Your administrator account has been suspended. Contact imsauravsingh@gmail.com.",
        },
        { status: 403 }
      );
    }

    // Role check: Candidates cannot log in through the admin portal
    if (user.role === "CANDIDATE") {
      return ApiResponse.json(
        {
          error: "ACCESS_DENIED",
          message: "Candidate accounts cannot access the admin control plane.",
        },
        { status: 403 }
      );
    }

    // Approval status check (Root HOD is permanently approved)
    if (user.email !== ROOT_HOD_EMAIL && user.adminApprovalStatus !== "APPROVED") {
      return ApiResponse.json(
        {
          error: "PENDING_APPROVAL",
          message: "Your admin account is pending approval by the Head of Department (imsauravsingh@gmail.com).",
          approvalStatus: user.adminApprovalStatus,
        },
        { status: 403 }
      );
    }

    const token = signAdminSessionJwt(user);
    const cookieHeader = buildAdminSessionCookieHeader(token);

    return ApiResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          adminApprovalStatus: user.adminApprovalStatus,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (err: any) {
    console.error("Admin login error:", err);
    return ApiResponse.json(
      { error: "INTERNAL_ERROR", message: err.message || "Failed to process admin login." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth/google
 * Handles Google SSO login & registration for the admin portal.
 * Auto-approves Root HOD; registers others with PENDING status.
 */
export async function handlePostAdminGoogle(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      idToken?: string;
      credential?: string;
    };
    const rawIdToken = body.idToken || body.credential;

    if (!rawIdToken || typeof rawIdToken !== "string") {
      return ApiResponse.json(
        { error: "MISSING_ID_TOKEN", message: "Provide `idToken` or `credential` in the body." },
        { status: 400 }
      );
    }

    const googleProfile = await verifyGoogleIdToken(rawIdToken);
    const email = googleProfile.email.toLowerCase().trim();

    // 1. Root HOD Flow: Auto-approved with SUPER_ADMIN
    if (email === ROOT_HOD_EMAIL) {
      const user = await db.user.upsert({
        where: { email },
        update: {
          googleId: googleProfile.googleId,
          fullName: googleProfile.fullName,
          avatarUrl: googleProfile.avatarUrl,
          role: "SUPER_ADMIN",
          adminApprovalStatus: "APPROVED",
          isBlocked: false,
        },
        create: {
          email,
          googleId: googleProfile.googleId,
          fullName: googleProfile.fullName,
          avatarUrl: googleProfile.avatarUrl,
          role: "SUPER_ADMIN",
          adminApprovalStatus: "APPROVED",
          authProvider: "google",
          emailVerified: true,
        },
      });

      const token = signAdminSessionJwt(user);
      const cookieHeader = buildAdminSessionCookieHeader(token);

      return ApiResponse.json(
        {
          success: true,
          isApproved: true,
          redirectTo: "/admin",
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            role: user.role,
            adminApprovalStatus: user.adminApprovalStatus,
          },
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": cookieHeader,
          },
        }
      );
    }

    // 2. All Other Team Members Flow
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isBlocked) {
        return ApiResponse.json(
          {
            error: "ACCOUNT_BLOCKED",
            message: existing.blockedReason
              ? `Your administrative access has been suspended: ${existing.blockedReason}`
              : "Your administrative access has been suspended. Contact imsauravsingh@gmail.com.",
          },
          { status: 403 }
        );
      }

      if (existing.adminApprovalStatus === "APPROVED" && existing.role !== "CANDIDATE") {
        // User was previously approved by HOD
        const token = signAdminSessionJwt(existing);
        const cookieHeader = buildAdminSessionCookieHeader(token);

        return ApiResponse.json(
          {
            success: true,
            isApproved: true,
            redirectTo: "/admin",
            user: {
              id: existing.id,
              email: existing.email,
              fullName: existing.fullName,
              avatarUrl: existing.avatarUrl,
              role: existing.role,
              adminApprovalStatus: existing.adminApprovalStatus,
            },
          },
          {
            status: 200,
            headers: {
              "Set-Cookie": cookieHeader,
            },
          }
        );
      }

      // Existing user but not yet approved or still pending
      const hasSubmittedReason = Boolean(existing.requestReason);
      return ApiResponse.json({
        success: true,
        isApproved: false,
        redirectTo: hasSubmittedReason ? "/admin/pending-approval" : "/admin/request-access",
        user: {
          id: existing.id,
          email: existing.email,
          fullName: existing.fullName,
          avatarUrl: existing.avatarUrl,
          role: existing.role,
          adminApprovalStatus: existing.adminApprovalStatus,
          requestReason: existing.requestReason,
        },
      });
    }

    // 3. Brand New Team Member Registering Via Google
    const newUser = await db.user.create({
      data: {
        email,
        googleId: googleProfile.googleId,
        fullName: googleProfile.fullName,
        avatarUrl: googleProfile.avatarUrl,
        authProvider: "google",
        role: "STAFF_ENGINEER", // Provisional default
        adminApprovalStatus: "PENDING",
        emailVerified: true,
      },
    });

    return ApiResponse.json({
      success: true,
      isApproved: false,
      redirectTo: "/admin/request-access",
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        adminApprovalStatus: newUser.adminApprovalStatus,
      },
    });
  } catch (err: any) {
    console.error("Admin Google SSO error:", err);
    return ApiResponse.json(
      { error: "GOOGLE_AUTH_FAILED", message: err.message || "Failed to process Google authentication." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth/request-access
 * Records an applicant's requested role and required reason text for HOD review.
 */
export async function handlePostAdminRequestAccess(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      requestedRole?: string;
      requestReason?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const requestedRole = body.requestedRole?.trim();
    const requestReason = body.requestReason?.trim();

    if (!email) {
      return ApiResponse.json(
        { error: "EMAIL_REQUIRED", message: "Email is required." },
        { status: 400 }
      );
    }

    if (!requestReason || requestReason.length < 10) {
      return ApiResponse.json(
        {
          error: "REASON_REQUIRED",
          message: "Please write a descriptive reason for access (minimum 10 characters).",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return ApiResponse.json(
        { error: "USER_NOT_FOUND", message: "Account not found. Please sign in with Google first." },
        { status: 404 }
      );
    }

    const updated = await db.user.update({
      where: { email },
      data: {
        requestedRole: requestedRole || "STAFF_ENGINEER",
        requestReason,
        requestedAt: new Date(),
        adminApprovalStatus: "PENDING",
      },
    });

    return ApiResponse.json({
      success: true,
      message: "Your access request has been submitted to the Head of Department (imsauravsingh@gmail.com).",
      user: {
        id: updated.id,
        email: updated.email,
        requestedRole: updated.requestedRole,
        adminApprovalStatus: updated.adminApprovalStatus,
      },
    });
  } catch (err: any) {
    console.error("Request access error:", err);
    return ApiResponse.json(
      { error: "SUBMISSION_FAILED", message: err.message || "Failed to submit request." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth/me
 * Returns the verified profile and role of the currently logged-in administrator.
 */
export async function handleGetAdminMe(req: ApiRequest): Promise<Response> {
  const result = await resolveAdminContext(req);
  if (!result.success) {
    return ApiResponse.json(
      { error: result.error, message: result.message },
      { status: result.status }
    );
  }

  const { user } = result.context;

  return ApiResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      adminApprovalStatus: user.adminApprovalStatus,
      isRootHod: user.email === ROOT_HOD_EMAIL,
    },
  });
}

/**
 * POST /api/admin/auth/logout
 * Clears the `pim_admin_session` cookie.
 */
export async function handlePostAdminLogout(): Promise<Response> {
  return ApiResponse.json(
    { success: true, message: "Logged out successfully." },
    {
      status: 200,
      headers: {
        "Set-Cookie": buildAdminLogoutCookieHeader(),
      },
    }
  );
}

