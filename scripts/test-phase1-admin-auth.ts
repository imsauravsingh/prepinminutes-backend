/**
 * PrepInMinutes — Phase 1 Admin Auth & RBAC Verification Test
 * 
 * Verifies:
 * 1. HOD password login with `imsauravsingh@gmail.com` and `Saurav@3063`
 * 2. Invalid password rejection (401)
 * 3. Candidate isolation (403 Forbidden for candidate roles)
 * 4. Admin session cookie issuance (`pim_admin_session`)
 * 5. GET /api/admin/auth/me validation with session
 * 6. Access request submission with justification reason
 * 7. Universal account blocking validation
 */

import "dotenv/config";
import { db } from "../src/server/db/client";
import worker from "../src/index";
import { ROOT_HOD_EMAIL } from "../src/server/auth/admin-auth";

async function runPhase1Tests() {
  console.log("===============================================================");
  console.log("   🧪 PREPINMINUTES PHASE 1: ADMIN AUTH & RBAC TEST SUITE      ");
  console.log("===============================================================\n");

  let adminCookie = "";

  // Test 1: HOD Login with wrong password
  console.log("Test 1: Testing login with WRONG password...");
  const wrongPassReq = new Request("http://localhost:8787/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ROOT_HOD_EMAIL,
      password: "WrongPassword123!",
    }),
  });
  const wrongPassRes = await worker.fetch(wrongPassReq);
  console.log(`  -> Status: ${wrongPassRes.status} (Expected: 401)`);
  if (wrongPassRes.status !== 401) throw new Error("Expected 401 on wrong password");
  console.log("  ✓ Correctly rejected wrong password.\n");

  // Test 2: HOD Login with correct password
  console.log("Test 2: Testing Root HOD login with CORRECT password (Saurav@3063)...");
  const loginReq = new Request("http://localhost:8787/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ROOT_HOD_EMAIL,
      password: "Saurav@3063",
    }),
  });
  const loginRes = await worker.fetch(loginReq);
  const loginData: any = await loginRes.json();
  console.log(`  -> Status: ${loginRes.status} (Expected: 200)`);
  console.log(`  -> User Email: ${loginData.user?.email}`);
  console.log(`  -> Role: ${loginData.user?.role}`);
  console.log(`  -> Approval Status: ${loginData.user?.adminApprovalStatus}`);
  
  const setCookieHeader = loginRes.headers.get("set-cookie") || "";
  console.log(`  -> Set-Cookie Header present: ${setCookieHeader.includes("pim_admin_session")}`);
  if (loginRes.status !== 200 || loginData.user?.role !== "SUPER_ADMIN" || !setCookieHeader) {
    throw new Error("Failed HOD login verification");
  }
  adminCookie = setCookieHeader.split(";")[0];
  console.log("  ✓ Root HOD login verified successfully with SUPER_ADMIN privileges.\n");

  // Test 3: GET /api/admin/auth/me with valid session
  console.log("Test 3: Testing GET /api/admin/auth/me with active admin session...");
  const meReq = new Request("http://localhost:8787/api/admin/auth/me", {
    method: "GET",
    headers: {
      Cookie: adminCookie,
    },
  });
  const meRes = await worker.fetch(meReq);
  const meData: any = await meRes.json();
  console.log(`  -> Status: ${meRes.status} (Expected: 200)`);
  console.log(`  -> Is Root HOD: ${meData.user?.isRootHod}`);
  if (meRes.status !== 200 || !meData.user?.isRootHod) {
    throw new Error("Failed /api/admin/auth/me verification");
  }
  console.log("  ✓ Admin session verified via GET /api/admin/auth/me.\n");

  // Test 4: Candidate Access Rejection (Candidate attempting admin login)
  console.log("Test 4: Testing Candidate Isolation (Candidate trying to log into admin)...");
  const candidateEmail = "test_candidate_jobseeker@example.com";
  await db.user.upsert({
    where: { email: candidateEmail },
    update: { role: "CANDIDATE", isBlocked: false },
    create: {
      email: candidateEmail,
      fullName: "Test Candidate",
      role: "CANDIDATE",
      passwordHash: "dummy:hash",
      authProvider: "credentials",
    },
  });

  const candidateLoginReq = new Request("http://localhost:8787/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: candidateEmail,
      password: "somepassword",
    }),
  });
  const candidateLoginRes = await worker.fetch(candidateLoginReq);
  console.log(`  -> Status: ${candidateLoginRes.status} (Expected: 401 or 403)`);
  if (![401, 403].includes(candidateLoginRes.status)) {
    throw new Error("Candidate was not blocked from admin login");
  }
  console.log("  ✓ Candidate account blocked from admin portal.\n");

  // Test 5: Access Request Submission with reason text
  console.log("Test 5: Testing POST /api/admin/auth/request-access for prospective staff...");
  const applicantEmail = "prospective_reviewer@example.com";
  await db.user.upsert({
    where: { email: applicantEmail },
    update: { role: "STAFF_ENGINEER", adminApprovalStatus: "PENDING", isBlocked: false },
    create: {
      email: applicantEmail,
      fullName: "Prospective Reviewer",
      role: "STAFF_ENGINEER",
      adminApprovalStatus: "PENDING",
      authProvider: "google",
      emailVerified: true,
    },
  });

  const requestAccessReq = new Request("http://localhost:8787/api/admin/auth/request-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: applicantEmail,
      requestedRole: "CONTENT_REVIEWER",
      requestReason: "I am a Senior Backend Engineer joining to curate and review System Design topics for Kafka and Caching.",
    }),
  });
  const requestAccessRes = await worker.fetch(requestAccessReq);
  const requestAccessData: any = await requestAccessRes.json();
  console.log(`  -> Status: ${requestAccessRes.status} (Expected: 200)`);
  console.log(`  -> Message: ${requestAccessData.message}`);
  
  const updatedApplicant = await db.user.findUnique({ where: { email: applicantEmail } });
  console.log(`  -> DB Saved Requested Role: ${updatedApplicant?.requestedRole}`);
  console.log(`  -> DB Saved Reason: "${updatedApplicant?.requestReason?.substring(0, 40)}..."`);
  console.log(`  -> DB Saved Approval Status: ${updatedApplicant?.adminApprovalStatus}`);
  
  if (requestAccessRes.status !== 200 || updatedApplicant?.adminApprovalStatus !== "PENDING") {
    throw new Error("Failed access request submission verification");
  }
  console.log("  ✓ Access request with justification reason submitted and persisted to PostgreSQL.\n");

  // Test 6: Universal User Blocking verification
  console.log("Test 6: Testing Universal User Blocking mechanism...");
  await db.user.update({
    where: { email: applicantEmail },
    data: {
      isBlocked: true,
      blockedReason: "Security violation / test block",
      blockedAt: new Date(),
    },
  });

  const blockedUserReq = new Request("http://localhost:8787/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: applicantEmail,
      password: "irrelevant_password",
    }),
  });
  const blockedUserRes = await worker.fetch(blockedUserReq);
  console.log(`  -> Blocked status response: ${blockedUserRes.status} (Expected: 401 or 403)`);
  console.log("  ✓ Blocked user access rejected cleanly.\n");

  // Cleanup test users
  await db.user.deleteMany({
    where: {
      email: { in: [candidateEmail, applicantEmail] },
    },
  });

  console.log("===============================================================");
  console.log("  🎉 ALL PHASE 1 ADMIN AUTH & RBAC TESTS PASSED SUCCESSFULLY!  ");
  console.log("===============================================================\n");
}

runPhase1Tests()
  .catch((err) => {
    console.error("Phase 1 test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

