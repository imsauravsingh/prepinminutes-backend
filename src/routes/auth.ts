import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import {
  buildGoogleOAuthAuthorizeUrl,
  exchangeGoogleAuthCode,
  getSsoConfig,
  GoogleUserProfile,
  signSessionJwt,
  verifyGoogleIdToken,
  verifyOAuthState,
  verifySessionJwt,
} from "../server/auth/google-sso";
import { resolveCandidateClerkId } from "../server/edge/cors";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "../server/auth/credentials";
import {
  checkOtpCooldown,
  generateVerificationOtp,
  sendVerificationEmail,
  setOtpCooldown,
  storeVerificationOtp,
  verifyVerificationOtp,
} from "../server/auth/email-verification";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function buildSessionCookieHeader(token: string, maxAge = SESSION_MAX_AGE_SECONDS): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `pim_session=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`;
}

/**
 * Upserts a Google-authenticated user into Neon PostgreSQL.
 * Links by `googleId` first, or links an existing account with the same verified `email`.
 */
async function upsertGoogleCandidate(profile: GoogleUserProfile) {
  const existing = await db.user.findFirst({
    where: {
      OR: [{ googleId: profile.googleId }, { email: profile.email }],
    },
    include: {
      profile: true,
    },
  });

  if (existing) {
    return db.user.update({
      where: { id: existing.id },
      data: {
        googleId: profile.googleId,
        email: profile.email,
        emailVerified: true,
        fullName: profile.fullName || existing.fullName,
        avatarUrl: profile.avatarUrl ?? (existing as { avatarUrl?: string | null }).avatarUrl ?? null,
        authProvider: "google",
      },
      include: {
        profile: true,
      },
    });
  }

  return db.user.create({
    data: {
      googleId: profile.googleId,
      email: profile.email,
      emailVerified: true,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      authProvider: "google",
    },
    include: {
      profile: true,
    },
  });
}

/**
 * GET /api/auth/config
 * Returns active SSO provider configuration.
 * Default: Google SSO enabled (`activeProvider: "google"`), Clerk disabled (`clerkEnabled: false`).
 */
export async function handleGetAuthConfig(): Promise<Response> {
  const config = getSsoConfig();
  return ApiResponse.json({
    success: true,
    activeProvider: config.activeProvider,
    googleEnabled: config.googleEnabled,
    clerkEnabled: config.clerkEnabled,
    googleFlow: config.googleFlow,
    googleClientId: config.googleClientId,
  });
}

/**
 * GET /api/auth/google
 * Flow 1: Initiates the Google OAuth 2.0 Authorization Code Redirect flow.
 */
export async function handleGetGoogleOAuthRedirect(req: ApiRequest): Promise<Response> {
  try {
    const config = getSsoConfig();
    if (!config.googleEnabled) {
      return ApiResponse.json(
        { error: "GOOGLE_SSO_DISABLED", message: "Google SSO is currently disabled." },
        { status: 403 }
      );
    }

    const redirectUrl = req.nextUrl.searchParams.get("redirect_url") || "/dashboard";
    const authorizeUrl = buildGoogleOAuthAuthorizeUrl(redirectUrl);

    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizeUrl,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Google OAuth redirect initiation error:", error);
    return ApiResponse.json(
      {
        error: "OAUTH_INIT_FAILED",
        message: error instanceof Error ? error.message : "Failed to initiate Google OAuth.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/google/callback
 * Flow 1 Callback: Exchanges Google OAuth `code`, upserts User in Neon DB,
 * issues a signed HMAC-SHA256 JWT, and redirects back to the frontend.
 */
export async function handleGetGoogleOAuthCallback(req: ApiRequest): Promise<Response> {
  const config = getSsoConfig();
  const frontendBase = config.frontendUrl.replace(/\/$/, "");

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const oauthError = req.nextUrl.searchParams.get("error");

    if (oauthError) {
      const errorRedirect = new URL("/login", frontendBase);
      errorRedirect.searchParams.set("error", oauthError);
      return Response.redirect(errorRedirect.toString(), 302);
    }

    if (!code) {
      return ApiResponse.json(
        { error: "MISSING_AUTH_CODE", message: "Authorization code is missing." },
        { status: 400 }
      );
    }

    const { valid, redirectPath } = verifyOAuthState(state);
    if (!valid) {
      const errorRedirect = new URL("/login", frontendBase);
      errorRedirect.searchParams.set("error", "invalid_oauth_state");
      return Response.redirect(errorRedirect.toString(), 302);
    }

    const googleProfile = await exchangeGoogleAuthCode(code);
    const user = await upsertGoogleCandidate(googleProfile);

    const token = signSessionJwt({
      sub: user.id,
      userId: user.id,
      googleId: profileOrUserGoogleId(user, googleProfile.googleId),
      clerkId: user.clerkId,
      email: user.email,
      name: user.fullName,
      picture: (user as { avatarUrl?: string | null }).avatarUrl ?? googleProfile.avatarUrl,
      provider: "google",
    });

    const destination = new URL("/login", frontendBase);
    destination.searchParams.set("auth_token", token);
    destination.searchParams.set("redirect_url", redirectPath);

    const headers = new Headers({
      Location: destination.toString(),
      "Cache-Control": "no-store",
    });
    headers.append("Set-Cookie", buildSessionCookieHeader(token));

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    const errorRedirect = new URL("/login", frontendBase);
    errorRedirect.searchParams.set(
      "error",
      error instanceof Error ? error.message : "google_oauth_callback_failed"
    );
    return Response.redirect(errorRedirect.toString(), 302);
  }
}

function profileOrUserGoogleId(
  user: { googleId?: string | null },
  fallbackGoogleId: string
): string {
  return user.googleId || fallbackGoogleId;
}

/**
 * POST /api/auth/google/token
 * Flow 2: Verifies a Google Identity Services (GIS) ID Token (`idToken` / `credential`),
 * upserts the candidate User in Neon DB, and returns a signed session JWT + user object.
 */
export async function handlePostGoogleIdToken(req: ApiRequest): Promise<Response> {
  try {
    const config = getSsoConfig();
    if (!config.googleEnabled) {
      return ApiResponse.json(
        { error: "GOOGLE_SSO_DISABLED", message: "Google SSO is currently disabled." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      idToken?: string;
      credential?: string;
    };
    const rawIdToken = body.idToken || body.credential;

    if (!rawIdToken || typeof rawIdToken !== "string") {
      return ApiResponse.json(
        {
          error: "MISSING_ID_TOKEN",
          message: "Provide `idToken` or `credential` in the request body.",
        },
        { status: 400 }
      );
    }

    const googleProfile = await verifyGoogleIdToken(rawIdToken);
    const user = await upsertGoogleCandidate(googleProfile);

    const avatarUrl =
      (user as { avatarUrl?: string | null }).avatarUrl ?? googleProfile.avatarUrl;

    const token = signSessionJwt({
      sub: user.id,
      userId: user.id,
      googleId: profileOrUserGoogleId(user, googleProfile.googleId),
      clerkId: user.clerkId,
      email: user.email,
      name: user.fullName,
      picture: avatarUrl,
      provider: "google",
    });

    return ApiResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          googleId: profileOrUserGoogleId(user, googleProfile.googleId),
          email: user.email,
          emailVerified: (user as { emailVerified?: boolean }).emailVerified ?? true,
          fullName: user.fullName,
          avatarUrl,
          authProvider: "google",
          hasCompletedOnboarding: !!user.profile,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookieHeader(token),
        },
      }
    );
  } catch (error) {
    console.error("Google ID token verification error:", error);
    return ApiResponse.json(
      {
        error: "INVALID_GOOGLE_TOKEN",
        message:
          error instanceof Error ? error.message : "Failed to verify Google ID token.",
      },
      { status: 401 }
    );
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user profile from the session JWT or cookie.
 */
export async function handleGetAuthMe(req: ApiRequest): Promise<Response> {
  try {
    const authHeader = req.headers.get("Authorization");
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const jwtClaims = bearerToken ? verifySessionJwt(bearerToken) : null;

    const candidateId = resolveCandidateClerkId(req);
    if (!candidateId) {
      return ApiResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await db.user
      .findFirst({
        where: {
          OR: [
            { id: candidateId },
            { googleId: candidateId },
            { clerkId: candidateId },
          ],
        },
        include: {
          profile: true,
        },
      })
      .catch(() => null);

    if (user) {
      return ApiResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username ?? null,
          googleId: (user as { googleId?: string | null }).googleId ?? null,
          clerkId: user.clerkId,
          email: user.email,
          emailVerified: (user as { emailVerified?: boolean }).emailVerified ?? true,
          fullName: user.fullName,
          avatarUrl: (user as { avatarUrl?: string | null }).avatarUrl ?? null,
          authProvider:
            (user as { authProvider?: string }).authProvider ?? "google",
        },
        profile: user.profile,
      });
    }

    if (jwtClaims) {
      return ApiResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: jwtClaims.userId || jwtClaims.sub,
          username: jwtClaims.username ?? null,
          googleId: jwtClaims.googleId ?? null,
          clerkId: jwtClaims.clerkId ?? null,
          email: jwtClaims.email,
          emailVerified: true,
          fullName: jwtClaims.name ?? null,
          avatarUrl: jwtClaims.picture ?? null,
          authProvider: jwtClaims.provider,
        },
        profile: null,
      });
    }

    return ApiResponse.json({ authenticated: false, user: null }, { status: 401 });
  } catch (error) {
    console.error("Auth session lookup error:", error);
    return ApiResponse.json(
      {
        authenticated: false,
        error: "SESSION_LOOKUP_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/logout
 * Clears the `pim_session` cookie and terminates the active session.
 */
export async function handlePostAuthLogout(): Promise<Response> {
  return ApiResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": buildSessionCookieHeader("", 0),
      },
    }
  );
}

/**
 * POST /api/auth/register
 * Creates a new candidate account with username, email, password, and confirmPassword.
 */
export async function handlePostRegister(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } | null;

    if (!body) {
      return ApiResponse.json(
        { error: "INVALID_REQUEST", message: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    const { username, email, password, confirmPassword } = body;

    // 1. Validation checks
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return ApiResponse.json(
        { error: "INVALID_USERNAME", message: usernameValidation.error },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.json(
        { error: "INVALID_EMAIL", message: emailValidation.error },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return ApiResponse.json(
        { error: "INVALID_PASSWORD", message: passwordValidation.error },
        { status: 400 }
      );
    }

    if (!confirmPassword || password !== confirmPassword) {
      return ApiResponse.json(
        {
          error: "PASSWORD_MISMATCH",
          message: "Password and Confirm Password do not match.",
        },
        { status: 400 }
      );
    }

    const cleanUsername = (username as string).trim();
    const cleanEmail = (email as string).trim().toLowerCase();

    // 2. Uniqueness checks in database
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === cleanEmail) {
        return ApiResponse.json(
          {
            error: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists. Please sign in instead.",
          },
          { status: 409 }
        );
      }
      if (existing.username && existing.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return ApiResponse.json(
          {
            error: "USERNAME_TAKEN",
            message: "This username is already taken. Please choose another username.",
          },
          { status: 409 }
        );
      }
    }

    // 3. Hash password and persist candidate user with emailVerified = false
    const passwordHash = hashPassword(password as string);

    const newUser = await db.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        emailVerified: false,
        passwordHash,
        fullName: cleanUsername,
        authProvider: "credentials",
        profile: {
          create: {
            targetRole: "Software Engineer",
            experienceLevel: "3-5",
            targetCompanies: ["Google", "Meta"],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 4. Generate & dispatch 6-digit OTP verification code
    const otp = generateVerificationOtp();
    await storeVerificationOtp(cleanEmail, otp);
    await setOtpCooldown(cleanEmail, 60);
    const emailResult = await sendVerificationEmail(cleanEmail, otp, cleanUsername);

    return ApiResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        message: "Account created! A 6-digit verification code has been sent to your email address.",
        ...(emailResult.devCode ? { devCode: emailResult.devCode } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Account registration error:", error);
    return ApiResponse.json(
      {
        error: "REGISTRATION_FAILED",
        message: error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/login
 * Authenticates a candidate with either username or email and password.
 * If candidate has not verified email yet, rejects with 403 EMAIL_NOT_VERIFIED and triggers OTP code.
 */
export async function handlePostLogin(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as {
      identifier?: string;
      password?: string;
    } | null;

    if (!body || !body.identifier || !body.password) {
      return ApiResponse.json(
        {
          error: "MISSING_CREDENTIALS",
          message: "Username or email and password are required.",
        },
        { status: 400 }
      );
    }

    const { identifier, password } = body;
    const cleanIdentifier = identifier.trim();

    // Lookup candidate by email OR username
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier.toLowerCase() },
          { username: cleanIdentifier },
        ],
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      return ApiResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return ApiResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    // Check if email has been verified
    if (!user.emailVerified) {
      const cooldown = await checkOtpCooldown(user.email);
      let devCode: string | undefined;
      if (cooldown.allowed) {
        const otp = generateVerificationOtp();
        await storeVerificationOtp(user.email, otp);
        await setOtpCooldown(user.email, 60);
        const emailResult = await sendVerificationEmail(
          user.email,
          otp,
          user.username ?? undefined
        );
        devCode = emailResult.devCode;
      }

      return ApiResponse.json(
        {
          error: "EMAIL_NOT_VERIFIED",
          email: user.email,
          message:
            "Please verify your email address before logging in. A 6-digit verification code has been sent to your email.",
          ...(devCode ? { devCode } : {}),
        },
        { status: 403 }
      );
    }

    // Issue edge session JWT
    const sessionToken = signSessionJwt({
      sub: user.id,
      userId: user.id,
      googleId: user.googleId,
      username: user.username,
      email: user.email,
      name: user.fullName || user.username,
      picture: user.avatarUrl,
      provider: "credentials",
    });

    return ApiResponse.json(
      {
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          username: user.username,
          googleId: user.googleId,
          email: user.email,
          emailVerified: true,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          hasCompletedOnboarding: Boolean(user.profile),
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookieHeader(sessionToken),
        },
      }
    );
  } catch (error) {
    console.error("Credentials login error:", error);
    return ApiResponse.json(
      {
        error: "LOGIN_FAILED",
        message: error instanceof Error ? error.message : "Sign-in failed.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Verifies a 6-digit OTP code, marks emailVerified=true in Neon DB, and issues edge session JWT.
 */
export async function handlePostVerifyEmail(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as {
      email?: string;
      code?: string;
    } | null;

    if (!body || !body.email || !body.code) {
      return ApiResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "Email and 6-digit verification code are required.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = body.email.trim().toLowerCase();
    const cleanCode = body.code.trim();

    const user = await db.user.findFirst({
      where: { email: cleanEmail },
      include: { profile: true },
    });

    if (!user) {
      return ApiResponse.json(
        {
          error: "USER_NOT_FOUND",
          message: "No account found with this email address.",
        },
        { status: 404 }
      );
    }

    // If already verified, allow login immediately
    if (user.emailVerified) {
      const sessionToken = signSessionJwt({
        sub: user.id,
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.fullName || user.username,
        picture: user.avatarUrl,
        provider: (user.authProvider as "google" | "credentials" | "clerk") || "credentials",
      });

      return ApiResponse.json(
        {
          success: true,
          message: "Email is already verified.",
          token: sessionToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            emailVerified: true,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            authProvider: user.authProvider,
            hasCompletedOnboarding: Boolean(user.profile),
          },
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": buildSessionCookieHeader(sessionToken),
          },
        }
      );
    }

    const verification = await verifyVerificationOtp(cleanEmail, cleanCode);
    if (!verification.valid) {
      return ApiResponse.json(
        {
          error: "INVALID_VERIFICATION_CODE",
          message: verification.error || "Invalid or expired verification code.",
        },
        { status: 400 }
      );
    }

    // Mark emailVerified in database
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      include: { profile: true },
    });

    // Issue edge session JWT
    const sessionToken = signSessionJwt({
      sub: updatedUser.id,
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.fullName || updatedUser.username,
      picture: updatedUser.avatarUrl,
      provider:
        (updatedUser.authProvider as "google" | "credentials" | "clerk") ||
        "credentials",
    });

    return ApiResponse.json(
      {
        success: true,
        message: "Email verified successfully! Welcome to PrepInMinutes.",
        token: sessionToken,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          emailVerified: true,
          fullName: updatedUser.fullName,
          avatarUrl: updatedUser.avatarUrl,
          authProvider: updatedUser.authProvider,
          hasCompletedOnboarding: Boolean(updatedUser.profile),
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookieHeader(sessionToken),
        },
      }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return ApiResponse.json(
      {
        error: "VERIFICATION_FAILED",
        message: error instanceof Error ? error.message : "Email verification failed.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/resend-verification
 * Resends a fresh 6-digit OTP code to the candidate email, respecting the 60-second cooldown.
 */
export async function handlePostResendVerification(req: ApiRequest): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as { email?: string } | null;

    if (!body || !body.email) {
      return ApiResponse.json(
        { error: "INVALID_REQUEST", message: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = body.email.trim().toLowerCase();

    const user = await db.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      return ApiResponse.json(
        { error: "USER_NOT_FOUND", message: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return ApiResponse.json(
        { error: "ALREADY_VERIFIED", message: "This email address is already verified. Please log in." },
        { status: 400 }
      );
    }

    const cooldown = await checkOtpCooldown(cleanEmail);
    if (!cooldown.allowed) {
      return ApiResponse.json(
        {
          error: "RATE_LIMITED",
          retryAfterSeconds: cooldown.retryAfterSeconds,
          message: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting a new code.`,
        },
        { status: 429 }
      );
    }

    const otp = generateVerificationOtp();
    await storeVerificationOtp(cleanEmail, otp);
    await setOtpCooldown(cleanEmail, 60);
    const emailResult = await sendVerificationEmail(
      cleanEmail,
      otp,
      user.username ?? undefined
    );

    return ApiResponse.json(
      {
        success: true,
        message: "A new verification code has been sent to your email address.",
        ...(emailResult.devCode ? { devCode: emailResult.devCode } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification code error:", error);
    return ApiResponse.json(
      {
        error: "RESEND_FAILED",
        message: error instanceof Error ? error.message : "Failed to resend verification code.",
      },
      { status: 500 }
    );
  }
}


