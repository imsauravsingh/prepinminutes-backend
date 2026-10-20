/**
 * PrepInMinutes — Admin RBAC Authentication & Session Service
 * 
 * Provides:
 * 1. Admin JWT token signing & verification (HMAC-SHA256)
 * 2. Dedicated admin session cookie management (`pim_admin_session`)
 * 3. Real-time PostgreSQL database authorization & blocking validation
 * 4. Strict role hierarchy guards (`requireAdminRole`, `requireRootHOD`)
 */

import crypto from "crypto";
import { AdminRole, AdminApprovalStatus, User } from "@prisma/client";
import { getSecrets } from "../config/secrets";
import { db } from "../db/client";
import { ApiRequest, ApiResponse } from "../../lib/http";

export const ROOT_HOD_EMAIL = "imsauravsingh@gmail.com";
export const ADMIN_COOKIE_NAME = "pim_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSessionJwtPayload {
  sub: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  adminApprovalStatus: AdminApprovalStatus;
  isBlocked: boolean;
  iat: number;
  exp: number;
}

export interface AdminAuthContext {
  user: User;
  session: AdminSessionJwtPayload;
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64").toString("utf8");
}

function getAdminJwtSecret(): string {
  const secrets = getSecrets();
  return (
    process.env.ADMIN_JWT_SECRET ||
    secrets.JWT_SECRET ||
    process.env.JWT_SECRET ||
    "prepinminutes-admin-secure-jwt-secret-key-2026"
  );
}

/**
 * Signs a secure Admin JWT session token (valid for 7 days).
 */
export function signAdminSessionJwt(
  user: Pick<User, "id" | "email" | "fullName" | "role" | "adminApprovalStatus" | "isBlocked">,
  maxAgeSeconds = ADMIN_SESSION_MAX_AGE_SECONDS
): string {
  const secret = getAdminJwtSecret();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "HS256", typ: "JWT" };
  const payload: AdminSessionJwtPayload = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    adminApprovalStatus: user.adminApprovalStatus,
    isBlocked: user.isBlocked,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signatureInput)
    .digest();

  return `${signatureInput}.${base64UrlEncode(signature)}`;
}

/**
 * Verifies and decodes an Admin JWT session token.
 */
export function verifyAdminSessionJwt(token: string): AdminSessionJwtPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const secret = getAdminJwtSecret();
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(signatureInput).digest()
  );

  const sigA = Buffer.from(encodedSignature);
  const sigB = Buffer.from(expectedSignature);
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionJwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Builds the Set-Cookie header string for the admin session.
 */
export function buildAdminSessionCookieHeader(
  token: string,
  maxAge = ADMIN_SESSION_MAX_AGE_SECONDS
): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`;
}

/**
 * Builds the Set-Cookie header to clear the admin session cookie upon logout.
 */
export function buildAdminLogoutCookieHeader(): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`;
}

/**
 * Extracts the admin token from either the `pim_admin_session` cookie or `Authorization: Bearer <token>`.
 */
export function extractAdminToken(req: ApiRequest | Request): string | null {
  // 1. Try Cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // 2. Try Authorization Bearer header
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Resolves the authenticated admin user from the database.
 * Enforces real-time checks: user existence, active approval, blocking status, and admin role.
 */
export async function resolveAdminContext(
  req: ApiRequest | Request
): Promise<
  | { success: true; context: AdminAuthContext }
  | { success: false; status: number; error: string; message: string }
> {
  const token = extractAdminToken(req);
  if (!token) {
    return {
      success: false,
      status: 401,
      error: "UNAUTHORIZED",
      message: "Admin authentication required. Please log in at /admin/login.",
    };
  }

  const session = verifyAdminSessionJwt(token);
  if (!session) {
    return {
      success: false,
      status: 401,
      error: "INVALID_SESSION",
      message: "Admin session has expired or is invalid. Please log in again.",
    };
  }

  // Real-time lookup from Neon PostgreSQL to guarantee up-to-date state
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return {
      success: false,
      status: 401,
      error: "USER_NOT_FOUND",
      message: "Administrator account no longer exists.",
    };
  }

  // Real-time block check
  if (user.isBlocked) {
    return {
      success: false,
      status: 403,
      error: "ACCOUNT_BLOCKED",
      message: user.blockedReason
        ? `Your administrative access has been suspended: ${user.blockedReason}`
        : "Your administrative access has been suspended. Contact imsauravsingh@gmail.com.",
    };
  }

  // Candidates are strictly forbidden from the admin control plane
  if (user.role === "CANDIDATE") {
    return {
      success: false,
      status: 403,
      error: "FORBIDDEN",
      message: "Access denied. Candidate accounts cannot access the admin control plane.",
    };
  }

  // Check admin approval status (Root HOD is permanently approved)
  if (user.email !== ROOT_HOD_EMAIL && user.adminApprovalStatus !== "APPROVED") {
    return {
      success: false,
      status: 403,
      error: "PENDING_APPROVAL",
      message: "Your admin account is pending approval by the Head of Department (imsauravsingh@gmail.com).",
    };
  }

  return {
    success: true,
    context: {
      user,
      session,
    },
  };
}

/**
 * Guard that verifies the caller is an authenticated admin with one of the allowed roles.
 */
export async function requireAdminRole(
  req: ApiRequest | Request,
  allowedRoles: AdminRole[] = [
    AdminRole.SUPER_ADMIN,
    AdminRole.HOD,
    AdminRole.CURRICULUM_MANAGER,
    AdminRole.STAFF_ENGINEER,
    AdminRole.CONTENT_REVIEWER,
  ]
): Promise<
  | { allowed: true; context: AdminAuthContext }
  | { allowed: false; response: Response }
> {
  const result = await resolveAdminContext(req);
  if (!result.success) {
    return {
      allowed: false,
      response: ApiResponse.json(
        { error: result.error, message: result.message },
        { status: result.status }
      ),
    };
  }

  const { user } = result.context;

  // Root HOD always has access to all admin operations
  if (user.email === ROOT_HOD_EMAIL || user.role === "SUPER_ADMIN" || user.role === "HOD") {
    return { allowed: true, context: result.context };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      allowed: false,
      response: ApiResponse.json(
        {
          error: "INSUFFICIENT_PERMISSIONS",
          message: `This action requires one of the following roles: ${allowedRoles.join(", ")}. Current role: ${user.role}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, context: result.context };
}

/**
 * Guard that restricts the endpoint strictly and exclusively to the Root HOD (imsauravsingh@gmail.com).
 */
export async function requireRootHOD(
  req: ApiRequest | Request
): Promise<
  | { allowed: true; context: AdminAuthContext }
  | { allowed: false; response: Response }
> {
  const result = await resolveAdminContext(req);
  if (!result.success) {
    return {
      allowed: false,
      response: ApiResponse.json(
        { error: result.error, message: result.message },
        { status: result.status }
      ),
    };
  }

  const { user } = result.context;

  if (user.email !== ROOT_HOD_EMAIL && user.role !== "SUPER_ADMIN") {
    return {
      allowed: false,
      response: ApiResponse.json(
        {
          error: "HOD_EXCLUSIVE",
          message: "Access restricted strictly to the Head of Department (imsauravsingh@gmail.com).",
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, context: result.context };
}
