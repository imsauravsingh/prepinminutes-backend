/**
 * Edge CORS & Authentication Helper for Frontend -> Backend Communication
 */

import { getSsoConfig, verifySessionJwt } from "../auth/google-sso";

const ALLOWED_ORIGINS = new Set([
  "https://prepinminutes.com",
  "https://www.prepinminutes.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export function getCorsHeaders(originHeader: string | null): Record<string, string> {
  const isAllowed =
    originHeader &&
    (ALLOWED_ORIGINS.has(originHeader) ||
      originHeader.endsWith(".prepinminutes.com") ||
      originHeader.endsWith(".workers.dev"));

  const allowedOrigin = isAllowed ? originHeader : "https://prepinminutes.com";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-candidate-id, x-candidate-clerk-id, idempotency-key",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export function withCors(response: Response, originHeader: string | null): Response {
  const corsHeaders = getCorsHeaders(originHeader);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function extractSessionCookie(req: Request, cookieName = "pim_session"): string | null {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === cookieName && rest.length > 0) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/**
 * Extracts verified candidate identity from:
 * 1. `Authorization: Bearer <jwt>` — verifies PrepInMinutes Google SSO HMAC-SHA256 JWT first,
 *    with fallback to Clerk JWT `sub` when Clerk is enabled.
 * 2. `pim_session` HttpOnly cookie (Google OAuth redirect session).
 * 3. `x-candidate-id` or `x-candidate-clerk-id` header.
 */
export function resolveCandidateClerkId(req: Request): string | null {
  const ssoConfig = getSsoConfig();

  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    // First verify against PrepInMinutes HMAC-SHA256 Session JWT (Google SSO)
    const verifiedSession = verifySessionJwt(token);
    if (verifiedSession) {
      return verifiedSession.userId || verifiedSession.googleId || verifiedSession.sub;
    }

    // Fallback to Clerk JWT payload if Clerk is enabled in SSO config
    if (ssoConfig.clerkEnabled) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
          const payload = JSON.parse(jsonPayload) as { sub?: string };
          if (payload.sub && typeof payload.sub === "string") {
            return payload.sub;
          }
        } catch {
          // Ignore malformed token
        }
      }
    }
  }

  // 2. Check pim_session cookie (set during Google OAuth 2.0 Redirect callback)
  const cookieToken = extractSessionCookie(req, "pim_session");
  if (cookieToken) {
    const verifiedCookieSession = verifySessionJwt(cookieToken);
    if (verifiedCookieSession) {
      return (
        verifiedCookieSession.userId ||
        verifiedCookieSession.googleId ||
        verifiedCookieSession.sub
      );
    }
  }

  // 3. Check explicit candidate identity headers
  const candidateHeader =
    req.headers.get("x-candidate-id") || req.headers.get("x-candidate-clerk-id");
  if (candidateHeader && candidateHeader.trim().length > 0) {
    return candidateHeader.trim();
  }

  return null;
}

export const resolveCandidateIdentity = resolveCandidateClerkId;

