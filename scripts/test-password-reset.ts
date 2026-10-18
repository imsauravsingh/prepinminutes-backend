import assert from "assert";
import { ApiRequest } from "../src/lib/http";
import { db } from "../src/server/db/client";
import {
  handlePostRegister,
  handlePostLogin,
  handlePostForgotPassword,
  handlePostVerifyResetCode,
  handlePostResetPassword,
} from "../src/routes/auth";
import { redis, RedisKeys } from "../src/server/redis/client";

async function runPasswordResetTests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Candidate Password Reset Test Suite           ");
  console.log("=================================================================\n");

  const testRunId = Math.random().toString(36).substring(2, 10);
  const candidateEmail = `reset_cand_${testRunId}@prepinminutes.test`;
  const candidateUsername = `resetcand_${testRunId}`;
  const initialPassword = `InitialP@ss123!`;
  const newPassword = `BrandNewR3setPass999!`;

  console.log("1. Creating test candidate account...");
  const regRes = await handlePostRegister(
    new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: candidateUsername,
        email: candidateEmail,
        password: initialPassword,
        confirmPassword: initialPassword,
      }),
    })
  );
  assert(regRes.status === 201, "Candidate registration must succeed");

  // Verify candidate exists in db
  const user = await db.user.findFirst({ where: { email: candidateEmail } });
  assert(user, "Candidate must exist in DB");
  console.log(`  ✓ Candidate registered: ${candidateEmail} (@${candidateUsername})\n`);

  // Clear any existing redis keys for test isolation
  await redis.del(RedisKeys.passwordResetOtp(candidateEmail));
  await redis.del(RedisKeys.passwordResetCooldown(candidateEmail));

  // TEST 1: Forgot Password for non-existent email
  console.log("TEST 1: Forgot password for unknown email (Account enumeration protection)...");
  const unknownEmailRes = await handlePostForgotPassword(
    new ApiRequest("http://localhost:8787/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `nonexistent_${testRunId}@prepinminutes.test` }),
    })
  );
  assert(unknownEmailRes.status === 200, "Must return HTTP 200 for security");
  const unknownData = await unknownEmailRes.json();
  assert(unknownData.success === true, "Must report success to prevent probing");
  console.log("  ✓ Generic success response returned to protect account enumeration.\n");

  // TEST 2: Request Password Reset for real candidate
  console.log("TEST 2: Requesting password reset OTP for real candidate...");
  const forgotRes = await handlePostForgotPassword(
    new ApiRequest("http://localhost:8787/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidateEmail }),
    })
  );
  assert(forgotRes.status === 200, "Forgot password request must return HTTP 200");
  const forgotData = await forgotRes.json();
  assert(forgotData.success === true, "success must be true");
  const resetOtp = forgotData.devCode;
  assert(resetOtp && resetOtp.length === 6, "Must provide 6-digit OTP code in dev mode");
  console.log(`  ✓ Password reset code generated & dispatched: ${resetOtp}\n`);

  // TEST 3: Rate Limiting / Cooldown
  console.log("TEST 3: Testing resend rate limit / cooldown window...");
  const spamRes = await handlePostForgotPassword(
    new ApiRequest("http://localhost:8787/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidateEmail }),
    })
  );
  assert(spamRes.status === 429, "Immediate repeat request must be rate-limited (HTTP 429)");
  console.log("  ✓ Cooldown rate-limit enforced with HTTP 429 Too Many Requests.\n");

  // TEST 4: Verify OTP Code Endpoint
  console.log("TEST 4: Testing verify-reset-code endpoint...");
  // 4a. Wrong code
  const wrongCodeRes = await handlePostVerifyResetCode(
    new ApiRequest("http://localhost:8787/api/auth/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidateEmail, code: "000000" }),
    })
  );
  assert(wrongCodeRes.status === 400, "Wrong code must be rejected with HTTP 400");
  console.log("  ✓ Wrong reset code rejected with HTTP 400.");

  // 4b. Valid code
  const validCodeRes = await handlePostVerifyResetCode(
    new ApiRequest("http://localhost:8787/api/auth/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidateEmail, code: resetOtp }),
    })
  );
  assert(validCodeRes.status === 200, "Valid code must return HTTP 200");
  console.log("  ✓ Valid reset code verified successfully.\n");

  // TEST 5: Reset Password Validations
  console.log("TEST 5: Testing reset password validations...");
  // 5a. Password mismatch
  const mismatchRes = await handlePostResetPassword(
    new ApiRequest("http://localhost:8787/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: candidateEmail,
        code: resetOtp,
        newPassword: newPassword,
        confirmPassword: "MismatchPassword123!",
      }),
    })
  );
  assert(mismatchRes.status === 400, "Mismatched passwords must be rejected");
  console.log("  ✓ Password confirmation mismatch rejected with HTTP 400.");

  // 5b. Too weak password
  const weakRes = await handlePostResetPassword(
    new ApiRequest("http://localhost:8787/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: candidateEmail,
        code: resetOtp,
        newPassword: "short",
        confirmPassword: "short",
      }),
    })
  );
  assert(weakRes.status === 400, "Weak password must be rejected");
  console.log("  ✓ Weak password rejected with HTTP 400.\n");

  // TEST 6: Successful Password Reset
  console.log("TEST 6: Executing successful Password Reset...");
  const resetSuccessRes = await handlePostResetPassword(
    new ApiRequest("http://localhost:8787/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: candidateEmail,
        code: resetOtp,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    })
  );
  assert(resetSuccessRes.status === 200, "Password reset must return HTTP 200");
  const resetData = await resetSuccessRes.json();
  assert(resetData.success === true, "success must be true");
  assert(resetData.token, "Must issue session JWT token upon reset");
  assert(resetData.user.email === candidateEmail, "User email must match");
  console.log("  ✓ Password reset successfully! Session JWT issued.\n");

  // TEST 7: Verify Login with Old Password Fails
  console.log("TEST 7: Verifying login with OLD password fails...");
  const oldLoginRes = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: candidateEmail,
        password: initialPassword,
      }),
    })
  );
  assert(oldLoginRes.status === 401, "Old password must be rejected with HTTP 401");
  console.log("  ✓ Login with old password rejected with HTTP 401.\n");

  // TEST 8: Verify Login with NEW Password Succeeds
  console.log("TEST 8: Verifying login with NEW password succeeds...");
  const newLoginRes = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: candidateEmail,
        password: newPassword,
      }),
    })
  );
  assert(newLoginRes.status === 200, "Login with new password must succeed");
  const newLoginData = await newLoginRes.json();
  assert(newLoginData.token, "New login must return valid session token");
  console.log("  ✓ Login with new password succeeded!\n");

  // Cleanup
  console.log("Cleaning up test candidate from database...");
  await db.user.delete({ where: { id: user.id } });
  await redis.del(RedisKeys.passwordResetOtp(candidateEmail));
  await redis.del(RedisKeys.passwordResetCooldown(candidateEmail));
  console.log("  ✓ Cleaned up test data.\n");

  console.log("=================================================================");
  console.log("   ALL PASSWORD RESET TESTS PASSED! (8/8)                        ");
  console.log("=================================================================\n");
}

runPasswordResetTests().catch((err) => {
  console.error("Password reset test suite failed:", err);
  process.exit(1);
});

