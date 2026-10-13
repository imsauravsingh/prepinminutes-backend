import "dotenv/config";
import { getSecrets } from "../src/server/config/secrets";
import {
  buildGoogleOAuthAuthorizeUrl,
  createOAuthState,
  verifyOAuthState,
  signSessionJwt,
  verifySessionJwt,
  getSsoConfig,
} from "../src/server/auth/google-sso";
import { db, withCandidateContext } from "../src/server/db/client";
import {
  handleGetAuthConfig,
  handleGetGoogleOAuthRedirect,
  handleGetAuthMe,
  handlePostAuthLogout,
  handlePostRegister,
  handlePostLogin,
  handlePostVerifyEmail,
  handlePostResendVerification,
} from "../src/routes/auth";
import { getStoredOtpForDev } from "../src/server/auth/email-verification";
import { ApiRequest } from "../src/lib/http";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

async function runSsoLoginTests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Google SSO User Login Verification Suite     ");
  console.log("=================================================================\n");

  const secrets = getSecrets();
  const testRunId = Date.now().toString(36);
  const testGoogleId = `google_sub_${testRunId}`;
  const testEmail = `test.candidate.${testRunId}@prepinminutes.test`;
  const testName = `Candidate Tester ${testRunId}`;
  const testAvatar = `https://lh3.googleusercontent.com/a/test-${testRunId}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Environment & Secrets Verification
    // -------------------------------------------------------------------------
    console.log("TEST 1: Verifying Environment Configuration & SSO Flags...");
    console.log(`  AUTH_PROVIDER:       ${secrets.AUTH_PROVIDER}`);
    console.log(`  GOOGLE_SSO_FLOW:     ${secrets.GOOGLE_SSO_FLOW}`);
    console.log(`  GOOGLE_CLIENT_ID:    ${secrets.GOOGLE_CLIENT_ID.slice(0, 24)}...`);
    console.log(`  GOOGLE_REDIRECT_URI: ${secrets.GOOGLE_REDIRECT_URI}`);
    console.log(`  FRONTEND_URL:        ${secrets.FRONTEND_URL}`);

    assert(secrets.AUTH_PROVIDER === "google", "AUTH_PROVIDER must default to 'google'");
    assert(
      secrets.GOOGLE_CLIENT_ID ===
        "899334976103-3g6udfc641v5m638d7n9nhav12h0m0rs.apps.googleusercontent.com",
      "GOOGLE_CLIENT_ID must match credentials JSON"
    );
    assert(
      secrets.GOOGLE_CLIENT_SECRET.startsWith("GOCSPX-"),
      "GOOGLE_CLIENT_SECRET must be loaded from credentials"
    );
    assert(
      secrets.GOOGLE_REDIRECT_URI === "http://localhost:8787/api/auth/google/callback",
      "GOOGLE_REDIRECT_URI must be configured for local callback"
    );
    console.log("  ✓ Test 1 Passed: Environment and credentials successfully validated.\n");

    // -------------------------------------------------------------------------
    // TEST 2: SSO Runtime Config Endpoint (GET /api/auth/config)
    // -------------------------------------------------------------------------
    console.log("TEST 2: Verifying SSO Runtime Configuration API...");
    const configRes = await handleGetAuthConfig();
    assert(configRes.status === 200, "Config endpoint must return HTTP 200");
    const ssoConfig = await configRes.json();
    console.log("  Runtime Config Response:", JSON.stringify(ssoConfig, null, 2));

    assert(ssoConfig.success === true, "Config success flag must be true");
    assert(ssoConfig.activeProvider === "google", "Active provider must be 'google'");
    assert(ssoConfig.googleEnabled === true, "Google SSO must be enabled");
    assert(ssoConfig.clerkEnabled === false, "Clerk must be disabled by default");
    assert(ssoConfig.googleFlow === "both", "Google SSO flow mode must be 'both'");
    assert(ssoConfig.googleClientId === secrets.GOOGLE_CLIENT_ID, "Client ID must match");
    console.log("  ✓ Test 2 Passed: /api/auth/config endpoint correctly configures Google and disables Clerk.\n");

    // -------------------------------------------------------------------------
    // TEST 3: Google OAuth Authorize URL Generation & CSRF Protection (GET /api/auth/google)
    // -------------------------------------------------------------------------
    console.log("TEST 3: Verifying OAuth 2.0 Authorization Endpoint (GET /api/auth/google)...");
    const customReturnTo = "/dashboard?tab=analytics";
    const reqRedirect = new ApiRequest(
      `http://localhost:8787/api/auth/google?redirect_url=${encodeURIComponent(customReturnTo)}`
    );
    const redirectRes = await handleGetGoogleOAuthRedirect(reqRedirect);

    assert(redirectRes.status === 302, "Google redirect endpoint must return HTTP 302");
    const locationHeader = redirectRes.headers.get("Location");
    assert(Boolean(locationHeader), "Location header must be present for 302 redirect");
    console.log(`  HTTP 302 Location: ${locationHeader!.slice(0, 80)}...`);

    const parsedUrl = new URL(locationHeader!);
    assert(parsedUrl.origin === "https://accounts.google.com", "URL must point to accounts.google.com");
    assert(parsedUrl.pathname === "/o/oauth2/v2/auth", "URL must use Google v2 auth endpoint");
    assert(
      parsedUrl.searchParams.get("client_id") === secrets.GOOGLE_CLIENT_ID,
      "URL must contain correct client_id"
    );
    assert(
      parsedUrl.searchParams.get("redirect_uri") === secrets.GOOGLE_REDIRECT_URI,
      "URL must contain correct redirect_uri"
    );
    assert(
      parsedUrl.searchParams.get("response_type") === "code",
      "URL must request response_type=code"
    );
    assert(
      parsedUrl.searchParams.get("scope")?.includes("email") === true,
      "URL scope must include email"
    );

    // Verify HMAC-signed CSRF state
    const stateParam = parsedUrl.searchParams.get("state");
    assert(Boolean(stateParam), "State parameter must be present in Google redirect URL");
    const stateVerification = verifyOAuthState(stateParam);
    assert(stateVerification.valid === true, "State verification must be valid");
    assert(
      stateVerification.redirectPath === customReturnTo,
      `State verification must return original redirectPath '${customReturnTo}' (got '${stateVerification.redirectPath}')`
    );

    // Verify tampered state is rejected
    const tamperedState = stateParam!.slice(0, -6) + "bad123";
    const tamperedResult = verifyOAuthState(tamperedState);
    assert(tamperedResult.valid === false, "Tampered state must be rejected");
    console.log("  ✓ Test 3 Passed: OAuth redirect URL and HMAC-signed CSRF state verified.\n");

    // -------------------------------------------------------------------------
    // TEST 4: Edge-Compatible Session JWT Signing & Verification
    // -------------------------------------------------------------------------
    console.log("TEST 4: Verifying Edge Session JWT Generation & Verification...");
    const testUserId = `usr_${testRunId}`;
    const sessionJwt = signSessionJwt({
      sub: testUserId,
      userId: testUserId,
      googleId: testGoogleId,
      email: testEmail,
      name: testName,
      picture: testAvatar,
      provider: "google",
    });
    console.log(`  Generated Session JWT: ${sessionJwt.slice(0, 45)}...`);

    const decodedSession = verifySessionJwt(sessionJwt);
    assert(decodedSession !== null, "Valid JWT must decode successfully");
    assert(decodedSession!.userId === testUserId, "JWT userId must match");
    assert(decodedSession!.googleId === testGoogleId, "JWT googleId must match");
    assert(decodedSession!.email === testEmail, "JWT email must match");
    assert(decodedSession!.provider === "google", "JWT provider must be 'google'");

    // Verify tampered token is rejected
    const tamperedJwt = sessionJwt.slice(0, -5) + "aaaaa";
    const decodedTampered = verifySessionJwt(tamperedJwt);
    assert(decodedTampered === null, "Tampered JWT must be rejected");
    console.log("  ✓ Test 4 Passed: HMAC-SHA256 JWT signature and tamper protection verified.\n");

    // -------------------------------------------------------------------------
    // TEST 5: Database Candidate Creation & Google SSO Upsert
    // -------------------------------------------------------------------------
    console.log("TEST 5: Testing Neon Database Candidate Creation & Google Login Upsert...");
    
    // Simulate first-time Google sign-in
    console.log(`  Simulating first-time login for Google ID: ${testGoogleId}`);
    const candidateUser1 = await db.user.create({
      data: {
        googleId: testGoogleId,
        email: testEmail,
        fullName: testName,
        avatarUrl: testAvatar,
        authProvider: "google",
        profile: {
          create: {
            targetRole: "Full Stack Engineer",
            experienceLevel: "3-5",
            targetCompanies: ["Google", "Stripe"],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log(`  ✓ Candidate record created! ID: ${candidateUser1.id}`);
    assert(candidateUser1.googleId === testGoogleId, "Candidate googleId must match");
    assert(candidateUser1.email === testEmail, "Candidate email must match");
    assert(candidateUser1.authProvider === "google", "Candidate authProvider must be 'google'");
    assert(candidateUser1.profile !== null, "Candidate onboarding profile created");

    // Simulate subsequent Google sign-in (lookup by Google ID)
    console.log(`  Simulating subsequent login (account resolution) for Google ID: ${testGoogleId}...`);
    const resolvedUser = await db.user.findFirst({
      where: {
        OR: [{ googleId: testGoogleId }, { email: testEmail }],
      },
      include: {
        profile: true,
      },
    });

    assert(resolvedUser !== null, "Existing user must be found on subsequent login");
    assert(resolvedUser!.id === candidateUser1.id, "Must return the same candidate ID");
    console.log(`  ✓ Candidate resolved seamlessly on subsequent login! ID: ${resolvedUser!.id}\n`);

    // -------------------------------------------------------------------------
    // TEST 6: Candidate Context & Tenant Isolation
    // -------------------------------------------------------------------------
    console.log("TEST 6: Testing Candidate Context Isolation with Google SSO...");
    const ctxById = await withCandidateContext(candidateUser1.id);
    assert(ctxById.userId === candidateUser1.id, "Context lookup by ID must resolve candidate");
    console.log(`  ✓ Candidate context lookup by ID: ${ctxById.userId} (${ctxById.email})`);

    const ctxByGoogleId = await withCandidateContext(testGoogleId);
    assert(ctxByGoogleId.userId === candidateUser1.id, "Context lookup by Google ID must resolve candidate");
    console.log(`  ✓ Candidate context lookup by Google ID: ${ctxByGoogleId.userId}\n`);

    // -------------------------------------------------------------------------
    // TEST 7: Authentication Profile Endpoint (GET /api/auth/me) & Logout
    // -------------------------------------------------------------------------
    console.log("TEST 7: Testing User Session Profile (/api/auth/me) & Logout (/api/auth/logout)...");
    
    // 7a. Unauthenticated request to /api/auth/me -> 401
    const unauthReq = new ApiRequest("http://localhost:8787/api/auth/me");
    const unauthRes = await handleGetAuthMe(unauthReq);
    assert(unauthRes.status === 401, "Unauthenticated /api/auth/me request must return HTTP 401");
    console.log("  ✓ Unauthenticated request rejected with HTTP 401.");

    // 7b. Authenticated request with Bearer JWT
    const liveJwt = signSessionJwt({
      sub: candidateUser1.id,
      userId: candidateUser1.id,
      googleId: candidateUser1.googleId,
      email: candidateUser1.email,
      name: candidateUser1.fullName,
      picture: candidateUser1.avatarUrl,
      provider: "google",
    });

    const authReq = new ApiRequest("http://localhost:8787/api/auth/me", {
      headers: {
        Authorization: `Bearer ${liveJwt}`,
      },
    });
    const authRes = await handleGetAuthMe(authReq);
    assert(authRes.status === 200, "Authenticated /api/auth/me request must return HTTP 200");
    const authMeData = await authRes.json();
    assert(authMeData.success === true, "Auth profile response must have success=true");
    assert(authMeData.user.id === candidateUser1.id, "Auth profile user ID must match candidate");
    assert(authMeData.user.googleId === testGoogleId, "Auth profile user googleId must match");
    assert(authMeData.user.email === testEmail, "Auth profile user email must match");
    console.log(`  ✓ Authenticated /api/auth/me returned profile for: ${authMeData.user.email}`);

    // 7c. Logout endpoint (/api/auth/logout)
    const logoutRes = await handlePostAuthLogout();
    assert(logoutRes.status === 200, "Logout must return HTTP 200");
    const setCookie = logoutRes.headers.get("Set-Cookie");
    assert(
      setCookie?.includes("Max-Age=0") === true || setCookie?.includes("Expires=") === true,
      "Logout must clear session cookie"
    );
    console.log("  ✓ /api/auth/logout cleared session cookie successfully.\n");

    // Clean up test Google candidate
    console.log("Cleaning up test Google candidate record from database...");
    await db.user.delete({ where: { id: candidateUser1.id } });
    console.log("  ✓ Test Google candidate cleanly deleted.\n");

    // -------------------------------------------------------------------------
    // TEST 8: Credentials Candidate Registration (Requires Email Validation)
    // -------------------------------------------------------------------------
    console.log("TEST 8: Testing Candidate Registration (Email Validation Required)...");
    const credUsername = `cand_${testRunId}`;
    const credEmail = `cand.${testRunId}@prepinminutes.test`;
    const credPassword = `SecureP@ss_${testRunId}!123`;

    const registerReq = new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credUsername,
        email: credEmail,
        password: credPassword,
        confirmPassword: credPassword,
      }),
    });

    const regRes = await handlePostRegister(registerReq);
    assert(regRes.status === 201, `Registration must return HTTP 201 (got ${regRes.status})`);
    const regData = await regRes.json();
    assert(regData.success === true, "Registration response must have success=true");
    assert(regData.requiresVerification === true, "First-time registration must require email verification");
    assert(regData.email === credEmail, "Registered email must match");
    assert(!regData.token, "Unverified registration must NOT issue an active session token");
    console.log(`  ✓ Registration requested verification for: ${credUsername} (${credEmail})\n`);

    // -------------------------------------------------------------------------
    // TEST 9: Registration Validation & Uniqueness Checks
    // -------------------------------------------------------------------------
    console.log("TEST 9: Testing Registration Validation & Duplicate Rejections...");

    // 9a. Password mismatch rejection (400)
    const mismatchReq = new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `diff_${testRunId}`,
        email: `diff.${testRunId}@test.com`,
        password: "Password123!",
        confirmPassword: "WrongPassword999!",
      }),
    });
    const mismatchRes = await handlePostRegister(mismatchReq);
    assert(mismatchRes.status === 400, "Password mismatch must return HTTP 400");
    console.log("  ✓ Password mismatch correctly rejected with HTTP 400.");

    // 9b. Duplicate email rejection (409)
    const dupEmailReq = new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `newname_${testRunId}`,
        email: credEmail,
        password: credPassword,
        confirmPassword: credPassword,
      }),
    });
    const dupEmailRes = await handlePostRegister(dupEmailReq);
    assert(dupEmailRes.status === 409, "Duplicate email must return HTTP 409");
    console.log("  ✓ Duplicate email correctly rejected with HTTP 409.");

    // 9c. Duplicate username rejection (409)
    const dupUserReq = new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credUsername,
        email: `unique.${testRunId}@test.com`,
        password: credPassword,
        confirmPassword: credPassword,
      }),
    });
    const dupUserRes = await handlePostRegister(dupUserReq);
    assert(dupUserRes.status === 409, "Duplicate username must return HTTP 409");
    console.log("  ✓ Duplicate username correctly rejected with HTTP 409.\n");

    // -------------------------------------------------------------------------
    // TEST 10: Unverified Candidate Login Blocked (HTTP 403 EMAIL_NOT_VERIFIED)
    // -------------------------------------------------------------------------
    console.log("TEST 10: Testing Unverified Login Attempt Blocked...");
    const unverifiedLoginReq = new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: credUsername,
        password: credPassword,
      }),
    });
    const unverifiedLoginRes = await handlePostLogin(unverifiedLoginReq);
    assert(unverifiedLoginRes.status === 403, "Unverified candidate login must be blocked with HTTP 403");
    const unverifiedLoginData = await unverifiedLoginRes.json();
    assert(
      unverifiedLoginData.error === "EMAIL_NOT_VERIFIED",
      "Error code must be 'EMAIL_NOT_VERIFIED'"
    );
    console.log("  ✓ Unverified login blocked with HTTP 403 (EMAIL_NOT_VERIFIED).\n");

    // -------------------------------------------------------------------------
    // TEST 11: Invalid OTP Verification Rejection (HTTP 400)
    // -------------------------------------------------------------------------
    console.log("TEST 11: Testing Invalid OTP Verification Code Rejection...");
    const wrongOtpReq = new ApiRequest("http://localhost:8787/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credEmail,
        code: "000000",
      }),
    });
    const wrongOtpRes = await handlePostVerifyEmail(wrongOtpReq);
    assert(wrongOtpRes.status === 400, "Invalid OTP code must return HTTP 400");
    const wrongOtpData = await wrongOtpRes.json();
    assert(
      wrongOtpData.error === "INVALID_VERIFICATION_CODE",
      "Error code must be 'INVALID_VERIFICATION_CODE'"
    );
    console.log("  ✓ Incorrect OTP code rejected with HTTP 400.\n");

    // -------------------------------------------------------------------------
    // TEST 12: Valid OTP Verification & Account Activation (POST /api/auth/verify-email)
    // -------------------------------------------------------------------------
    console.log("TEST 12: Testing Valid OTP Email Verification & Activation...");
    const activeOtpCode = await getStoredOtpForDev(credEmail);
    assert(Boolean(activeOtpCode), "Valid OTP code must exist in Redis");
    console.log(`  Retrieved active OTP code from Redis: ${activeOtpCode}`);

    const verifyOtpReq = new ApiRequest("http://localhost:8787/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credEmail,
        code: activeOtpCode,
      }),
    });
    const verifyOtpRes = await handlePostVerifyEmail(verifyOtpReq);
    assert(verifyOtpRes.status === 200, "Valid OTP verification must return HTTP 200");
    const verifyOtpData = await verifyOtpRes.json();
    assert(verifyOtpData.success === true, "Verification response must have success=true");
    assert(verifyOtpData.user.emailVerified === true, "Candidate emailVerified must be true");
    assert(Boolean(verifyOtpData.token), "Verification must issue an active session JWT");
    const verifyCookie = verifyOtpRes.headers.get("Set-Cookie");
    assert(verifyCookie?.includes("pim_session=") === true, "Verification must set pim_session cookie");
    console.log(`  ✓ Email verified! Candidate activated: ${verifyOtpData.user.username}\n`);

    // -------------------------------------------------------------------------
    // TEST 13: Candidate Login with Verified Credentials (POST /api/auth/login)
    // -------------------------------------------------------------------------
    console.log("TEST 13: Testing Candidate Login with Username, Email, & Password...");

    // 13a. Login with Username
    const loginByUsernameReq = new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: credUsername,
        password: credPassword,
      }),
    });
    const loginUserRes = await handlePostLogin(loginByUsernameReq);
    assert(loginUserRes.status === 200, "Login by username must return HTTP 200");
    const loginUserData = await loginUserRes.json();
    assert(loginUserData.success === true, "Login response must have success=true");
    assert(loginUserData.user.username === credUsername, "Logged in username must match");
    console.log(`  ✓ Login by username succeeded for: ${loginUserData.user.username}`);

    // 13b. Login with Email
    const loginByEmailReq = new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: credEmail,
        password: credPassword,
      }),
    });
    const loginEmailRes = await handlePostLogin(loginByEmailReq);
    assert(loginEmailRes.status === 200, "Login by email must return HTTP 200");
    const loginEmailData = await loginEmailRes.json();
    assert(loginEmailData.success === true, "Login response must have success=true");
    assert(loginEmailData.user.email === credEmail, "Logged in email must match");
    console.log(`  ✓ Login by email address succeeded for: ${loginEmailData.user.email}`);

    // 13c. Rejection of invalid password
    const wrongPassReq = new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: credUsername,
        password: "IncorrectPassword999!",
      }),
    });
    const wrongPassRes = await handlePostLogin(wrongPassReq);
    assert(wrongPassRes.status === 401, "Invalid password must return HTTP 401");
    console.log("  ✓ Incorrect password rejected with HTTP 401.\n");

    // Clean up test credentials user
    console.log("Cleaning up test credentials candidate from database...");
    const credCandidateInDb = await db.user.findFirst({ where: { email: credEmail } });
    if (credCandidateInDb) {
      await db.user.delete({ where: { id: credCandidateInDb.id } });
    }
    console.log("  ✓ Test credentials candidate cleanly deleted.");

    console.log("\n=================================================================");
    console.log("   ALL AUTH & EMAIL VERIFICATION TESTS PASSED! (13/13)          ");
    console.log("=================================================================");
  } catch (error) {
    console.error("\n❌ SSO TEST SUITE FAILED:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runSsoLoginTests();
