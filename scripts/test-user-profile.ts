import assert from "assert";
import { ApiRequest } from "../src/lib/http";
import { db } from "../src/server/db/client";
import { handlePatchUserProfile, handlePostChangePassword } from "../src/routes/user-profile";
import { handlePostRegister, handlePostLogin, handleGetAuthMe } from "../src/routes/auth";

async function runProfileTests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Edit Profile & Password Test Suite            ");
  console.log("=================================================================\n");

  const testRunId = Math.random().toString(36).substring(2, 10);
  const user1Username = `profuser1_${testRunId}`;
  const user1Email = `profuser1.${testRunId}@prepinminutes.test`;
  const user1Password = `InitialP@ss123!`;

  const user2Username = `profuser2_${testRunId}`;
  const user2Email = `profuser2.${testRunId}@prepinminutes.test`;
  const user2Password = `InitialP@ss123!`;

  console.log("Setting up 2 test candidate accounts...");
  // Register candidate 1
  const reg1Res = await handlePostRegister(
    new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user1Username,
        email: user1Email,
        password: user1Password,
        confirmPassword: user1Password,
      }),
    })
  );
  assert(reg1Res.status === 201, "Candidate 1 registration must succeed");

  // Register candidate 2
  const reg2Res = await handlePostRegister(
    new ApiRequest("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user2Username,
        email: user2Email,
        password: user2Password,
        confirmPassword: user2Password,
      }),
    })
  );
  assert(reg2Res.status === 201, "Candidate 2 registration must succeed");

  // Auto-verify candidate 1 and candidate 2 for test execution
  const cand1 = await db.user.findFirst({ where: { email: user1Email } });
  const cand2 = await db.user.findFirst({ where: { email: user2Email } });
  assert(cand1 && cand2, "Candidates must exist in database");

  await db.user.update({ where: { id: cand1.id }, data: { emailVerified: true } });
  await db.user.update({ where: { id: cand2.id }, data: { emailVerified: true } });

  // Log in candidate 1 to get JWT session token
  const login1Res = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: user1Email,
        password: user1Password,
      }),
    })
  );
  const login1Data = await login1Res.json();
  assert(login1Res.status === 200, "Login 1 must succeed");
  const token1 = login1Data.token;
  console.log("  ✓ Test candidate accounts created and authenticated.\n");

  // TEST 1: Update Full Name & Avatar URL
  console.log("TEST 1: Testing Full Name & Avatar update...");
  const updateRes1 = await handlePatchUserProfile(
    new ApiRequest("http://localhost:8787/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        fullName: "Saurav Kumar Developer",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
      }),
    })
  );
  assert(updateRes1.status === 200, "Profile update must return 200");
  const updateData1 = await updateRes1.json();
  assert(updateData1.success === true, "success must be true");
  assert(updateData1.user.fullName === "Saurav Kumar Developer", "fullName must update");
  assert(updateData1.user.avatarUrl === "https://api.dicebear.com/7.x/bottts/svg?seed=Alex", "avatarUrl must update");
  console.log("  ✓ Full name and avatar URL updated successfully.\n");

  // TEST 2: Update Username
  console.log("TEST 2: Testing Username update...");
  const newUsername1 = `updated_${testRunId}`;
  const updateRes2 = await handlePatchUserProfile(
    new ApiRequest("http://localhost:8787/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        username: newUsername1,
      }),
    })
  );
  assert(updateRes2.status === 200, "Username update must return 200");
  const updateData2 = await updateRes2.json();
  assert(updateData2.user.username === newUsername1, "Username must match new value");
  console.log(`  ✓ Username updated to: @${newUsername1}\n`);

  // TEST 3: Username Collision Prevention
  console.log("TEST 3: Testing duplicate username rejection...");
  const collisionRes = await handlePatchUserProfile(
    new ApiRequest("http://localhost:8787/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        username: user2Username, // Already used by Cand 2
      }),
    })
  );
  assert(collisionRes.status === 409, "Duplicate username must return HTTP 409");
  console.log("  ✓ Duplicate username correctly rejected with HTTP 409 Conflict.\n");

  // TEST 4: Invalid Username Format
  console.log("TEST 4: Testing invalid username format rejection...");
  const invalidUserRes = await handlePatchUserProfile(
    new ApiRequest("http://localhost:8787/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        username: "ab", // Too short (min 3)
      }),
    })
  );
  assert(invalidUserRes.status === 400, "Too short username must return HTTP 400");
  console.log("  ✓ Invalid username format correctly rejected with HTTP 400.\n");

  // TEST 5: Password Change - Rejections
  console.log("TEST 5: Testing Password Change validations...");
  // 5a. Wrong current password
  const wrongCurrentRes = await handlePostChangePassword(
    new ApiRequest("http://localhost:8787/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        currentPassword: "WrongPassword999!",
        newPassword: "BrandNewPassword123!",
        confirmPassword: "BrandNewPassword123!",
      }),
    })
  );
  assert(wrongCurrentRes.status === 400, "Wrong current password must return HTTP 400");
  console.log("  ✓ Wrong current password rejected with HTTP 400.");

  // 5b. New password mismatch
  const mismatchPassRes = await handlePostChangePassword(
    new ApiRequest("http://localhost:8787/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        currentPassword: user1Password,
        newPassword: "BrandNewPassword123!",
        confirmPassword: "DifferentPassword999!",
      }),
    })
  );
  assert(mismatchPassRes.status === 400, "Mismatched passwords must return HTTP 400");
  console.log("  ✓ Mismatched new password rejected with HTTP 400.");

  // 5c. New password too short
  const shortPassRes = await handlePostChangePassword(
    new ApiRequest("http://localhost:8787/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        currentPassword: user1Password,
        newPassword: "short",
        confirmPassword: "short",
      }),
    })
  );
  assert(shortPassRes.status === 400, "Short password must return HTTP 400");
  console.log("  ✓ Short new password rejected with HTTP 400.\n");

  // TEST 6: Successful Password Change & Re-Authentication
  console.log("TEST 6: Testing successful Password Change & Login...");
  const brandNewPassword = "BrandNewPassword123!";
  const successPassRes = await handlePostChangePassword(
    new ApiRequest("http://localhost:8787/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        currentPassword: user1Password,
        newPassword: brandNewPassword,
        confirmPassword: brandNewPassword,
      }),
    })
  );
  assert(successPassRes.status === 200, "Valid password change must return HTTP 200");
  console.log("  ✓ Password changed successfully.");

  // Verify login with OLD password fails
  const oldLoginRes = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: user1Email,
        password: user1Password,
      }),
    })
  );
  assert(oldLoginRes.status === 401, "Login with old password must be rejected");
  console.log("  ✓ Login with old password rejected with HTTP 401.");

  // Verify login with NEW password succeeds
  const newLoginRes = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: user1Email,
        password: brandNewPassword,
      }),
    })
  );
  assert(newLoginRes.status === 200, "Login with new password must succeed");
  console.log("  ✓ Login with new password succeeded!\n");

  // TEST 7: Google SSO User Setting Initial Password (No current password required)
  console.log("TEST 7: Testing Google SSO candidate setting password for first time...");
  const googleTestId = `goog_${testRunId}`;
  const googleEmail = `google.${testRunId}@prepinminutes.test`;
  const googleCand = await db.user.create({
    data: {
      googleId: googleTestId,
      username: `goog_${testRunId}`,
      email: googleEmail,
      emailVerified: true,
      fullName: "Google Candidate",
      authProvider: "google",
      passwordHash: null, // Initially has no password
    },
  });

  const { signSessionJwt } = await import("../src/server/auth/google-sso");
  const googleToken = signSessionJwt({
    sub: googleCand.id,
    userId: googleCand.id,
    googleId: googleTestId,
    email: googleEmail,
    name: "Google Candidate",
    provider: "google",
  });

  // Verify /api/auth/me reports hasPassword: false
  const authMeRes = await handleGetAuthMe(
    new ApiRequest("http://localhost:8787/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${googleToken}` },
    })
  );
  const authMeData = await authMeRes.json();
  assert(authMeData.user.hasPassword === false, "Google user initially hasPassword=false");
  console.log("  ✓ Initial Google user correctly reports hasPassword: false.");

  // Set initial password (no currentPassword provided)
  const setGooglePassRes = await handlePostChangePassword(
    new ApiRequest("http://localhost:8787/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${googleToken}`,
      },
      body: JSON.stringify({
        newPassword: "GoogleHybridPass123!",
        confirmPassword: "GoogleHybridPass123!",
      }),
    })
  );
  assert(setGooglePassRes.status === 200, "Google user setting password must succeed with HTTP 200");
  const setGooglePassData = await setGooglePassRes.json();
  assert(setGooglePassData.hasPassword === true, "Response must report hasPassword: true");
  console.log("  ✓ Google user set initial password without needing current password.");

  // Verify Google user can now sign in using username/email + password directly!
  const googleCredLoginRes = await handlePostLogin(
    new ApiRequest("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: googleEmail,
        password: "GoogleHybridPass123!",
      }),
    })
  );
  assert(googleCredLoginRes.status === 200, "Google user credentials login must succeed");
  console.log("  ✓ Hybrid Login verified: Google SSO user successfully logged in with password!");

  // Cleanup test users
  console.log("\nCleaning up test candidates from database...");
  await db.user.delete({ where: { id: cand1.id } });
  await db.user.delete({ where: { id: cand2.id } });
  await db.user.delete({ where: { id: googleCand.id } });
  console.log("  ✓ All test candidates cleanly deleted.\n");

  console.log("=================================================================");
  console.log("   ALL EDIT PROFILE & PASSWORD TESTS PASSED! (7/7)               ");
  console.log("=================================================================\n");
}

runProfileTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

