import crypto from "crypto";
import { getSecrets } from "../config/secrets";

export type SsoProviderMode = "google" | "clerk" | "both";
export type GoogleFlowMode = "redirect" | "id_token" | "both";

export interface SsoRuntimeConfig {
  activeProvider: SsoProviderMode;
  googleEnabled: boolean;
  clerkEnabled: boolean;
  googleFlow: GoogleFlowMode;
  googleClientId: string;
  googleRedirectUri: string;
  frontendUrl: string;
}

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface SessionJwtPayload {
  sub: string;
  userId: string;
  googleId?: string | null;
  username?: string | null;
  clerkId?: string | null;
  email: string;
  name?: string | null;
  picture?: string | null;
  provider: "google" | "credentials" | "clerk";
  iat: number;
  exp: number;
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

function getJwtSecret(): string {
  const secrets = getSecrets();
  return (
    secrets.JWT_SECRET ||
    process.env.JWT_SECRET ||
    "prepinminutes-dev-jwt-secret-change-in-production"
  );
}

/**
 * Resolves the active SSO provider configuration.
 * Default: Google SSO enabled (`activeProvider: "google"`), Clerk disabled (`clerkEnabled: false`).
 */
export function getSsoConfig(): SsoRuntimeConfig {
  const secrets = getSecrets();
  const rawProvider = (
    process.env.AUTH_PROVIDER ||
    secrets.AUTH_PROVIDER ||
    "google"
  )
    .toLowerCase()
    .trim();

  const activeProvider: SsoProviderMode =
    rawProvider === "clerk" || rawProvider === "both" ? rawProvider : "google";

  const rawFlow = (
    process.env.GOOGLE_SSO_FLOW ||
    secrets.GOOGLE_SSO_FLOW ||
    "both"
  )
    .toLowerCase()
    .trim();

  const googleFlow: GoogleFlowMode =
    rawFlow === "redirect" || rawFlow === "id_token" ? rawFlow : "both";

  const googleEnabled = activeProvider === "google" || activeProvider === "both";
  const clerkEnabled = activeProvider === "clerk" || activeProvider === "both";

  return {
    activeProvider,
    googleEnabled,
    clerkEnabled,
    googleFlow,
    googleClientId:
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      secrets.GOOGLE_CLIENT_ID ||
      "",
    googleRedirectUri:
      process.env.GOOGLE_REDIRECT_URI || secrets.GOOGLE_REDIRECT_URI,
    frontendUrl: process.env.FRONTEND_URL || secrets.FRONTEND_URL,
  };
}

/**
 * Signs an HMAC-SHA256 JWT session token for authenticated PrepInMinutes candidates.
 */
export function signSessionJwt(
  claims: Omit<SessionJwtPayload, "iat" | "exp">,
  expiresInSeconds = 60 * 60 * 24 * 7
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionJwtPayload = {
    ...claims,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(signingInput)
    .digest();

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/**
 * Verifies an HMAC-SHA256 JWT session token and returns the decoded payload if valid and unexpired.
 */
export function verifySessionJwt(token: string): SessionJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSig = base64UrlEncode(
      crypto.createHmac("sha256", getJwtSecret()).update(signingInput).digest()
    );

    const a = Buffer.from(encodedSignature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const payload = JSON.parse(
      base64UrlDecode(encodedPayload)
    ) as SessionJwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates a signed OAuth 2.0 CSRF `state` parameter encoding the target redirect path.
 */
export function createOAuthState(redirectPath = "/dashboard"): string {
  const statePayload = {
    nonce: crypto.randomBytes(12).toString("hex"),
    redirectPath: redirectPath.startsWith("/") ? redirectPath : "/dashboard",
    iat: Math.floor(Date.now() / 1000),
  };
  const encoded = base64UrlEncode(JSON.stringify(statePayload));
  const sig = base64UrlEncode(
    crypto.createHmac("sha256", getJwtSecret()).update(encoded).digest()
  );
  return `${encoded}.${sig}`;
}

/**
 * Verifies an OAuth 2.0 `state` parameter and extracts the target redirect path.
 */
export function verifyOAuthState(stateParam: string | null): {
  valid: boolean;
  redirectPath: string;
} {
  if (!stateParam) {
    return { valid: false, redirectPath: "/dashboard" };
  }
  try {
    const [encoded, sig] = stateParam.split(".");
    if (!encoded || !sig) {
      return { valid: false, redirectPath: "/dashboard" };
    }
    const expectedSig = base64UrlEncode(
      crypto.createHmac("sha256", getJwtSecret()).update(encoded).digest()
    );
    if (sig !== expectedSig) {
      return { valid: false, redirectPath: "/dashboard" };
    }
    const parsed = JSON.parse(base64UrlDecode(encoded)) as {
      redirectPath?: string;
      iat?: number;
    };
    const now = Math.floor(Date.now() / 1000);
    if (parsed.iat && now - parsed.iat > 900) {
      return { valid: false, redirectPath: "/dashboard" };
    }
    const redirectPath =
      parsed.redirectPath && parsed.redirectPath.startsWith("/")
        ? parsed.redirectPath
        : "/dashboard";
    return { valid: true, redirectPath };
  } catch {
    return { valid: false, redirectPath: "/dashboard" };
  }
}

/**
 * Builds the Google OAuth 2.0 Authorization URL (Flow 1: OAuth 2.0 Redirect).
 */
export function buildGoogleOAuthAuthorizeUrl(
  redirectPath = "/dashboard",
  overrideRedirectUri?: string
): string {
  const config = getSsoConfig();
  if (!config.googleClientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured in environment variables."
    );
  }

  const state = createOAuthState(redirectPath);
  const redirectUri = overrideRedirectUri || config.googleRedirectUri;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  return url.toString();
}

/**
 * Exchanges a Google OAuth 2.0 authorization `code` for user profile details.
 */
export async function exchangeGoogleAuthCode(
  code: string,
  overrideRedirectUri?: string
): Promise<GoogleUserProfile> {
  const secrets = getSecrets();
  const config = getSsoConfig();
  const clientId = config.googleClientId;
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET || secrets.GOOGLE_CLIENT_SECRET;
  const redirectUri = overrideRedirectUri || config.googleRedirectUri;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for OAuth code exchange."
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${errBody}`);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    id_token?: string;
  };

  if (tokenData.access_token) {
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (userInfoRes.ok) {
      const info = (await userInfoRes.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      if (info.sub && info.email) {
        return {
          googleId: info.sub,
          email: info.email,
          fullName: info.name || null,
          avatarUrl: info.picture || null,
          emailVerified: info.email_verified !== false,
        };
      }
    }
  }

  if (tokenData.id_token) {
    return verifyGoogleIdToken(tokenData.id_token);
  }

  throw new Error("Failed to retrieve user profile from Google OAuth response.");
}

/**
 * Verifies a Google ID Token (Flow 2: Google Identity Services / One-Tap / Bearer ID Token)
 * against Google's tokeninfo endpoint and returns the verified user profile.
 */
export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleUserProfile> {
  const config = getSsoConfig();
  const verifyUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
  verifyUrl.searchParams.set("id_token", idToken);

  const res = await fetch(verifyUrl.toString(), { method: "GET" });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Invalid Google ID token (${res.status}): ${errText}`);
  }

  const payload = (await res.json()) as {
    sub?: string;
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    exp?: string;
  };

  if (!payload.sub || !payload.email) {
    throw new Error("Google ID token is missing required sub or email claims.");
  }

  if (
    config.googleClientId &&
    payload.aud &&
    payload.aud !== config.googleClientId
  ) {
    throw new Error("Google ID token audience (aud) does not match GOOGLE_CLIENT_ID.");
  }

  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";

  return {
    googleId: payload.sub,
    email: payload.email,
    fullName: payload.name || null,
    avatarUrl: payload.picture || null,
    emailVerified,
  };
}

