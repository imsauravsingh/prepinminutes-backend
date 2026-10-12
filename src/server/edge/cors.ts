/**
 * Edge CORS & Authentication Helper for Frontend -> Backend Communication
 */

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
      "Content-Type, Authorization, x-candidate-clerk-id, idempotency-key",
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

/**
 * Extracts verified Clerk candidate ID from either:
 * 1. `x-candidate-clerk-id` header
 * 2. `Authorization: Bearer <jwt>` token payload (`sub` claim)
 */
export function resolveCandidateClerkId(req: Request): string | null {
  const directHeader = req.headers.get("x-candidate-clerk-id");
  if (directHeader && directHeader.trim().length > 0) {
    return directHeader.trim();
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
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
        return null;
      }
    }
  }

  return null;
}
