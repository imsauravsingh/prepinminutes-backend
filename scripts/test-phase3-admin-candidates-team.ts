/**
 * PrepInMinutes — Phase 3 & 6 Automated Test Suite:
 * Candidate Directory & Subscriptions + HOD Team Management
 */

import "dotenv/config";
import { db } from "../src/server/db/client";

const API_BASE = "http://localhost:8787";

async function runCandidateAndTeamTests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Candidate Directory & HOD Team Test Suite    ");
  console.log("=================================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
      testFailed++;
    }
  }

  try {
    // 1. Authenticate as Root HOD
    console.log("1. Authenticating as Root HOD...");
    const loginRes = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "imsauravsingh@gmail.com", password: "Saurav@3063" }),
    });

    const cookie = loginRes.headers.get("set-cookie") || "";
    assert(loginRes.status === 200, "Root HOD login 200 OK");
    const authHeaders = { Cookie: cookie, "Content-Type": "application/json" };

    // 2. Candidate Directory (GET /api/admin/candidates)
    console.log("\n2. Testing GET /api/admin/candidates...");
    const candRes = await fetch(`${API_BASE}/api/admin/candidates`, { headers: authHeaders });
    const candData = await candRes.json();
    assert(candRes.status === 200 && Array.isArray(candData.candidates), "Candidate directory returned 200 OK with candidates list");
    assert(candData.metrics && typeof candData.metrics.totalCandidates === "number", "Metrics object returned with totalCandidates");

    const testCand = candData.candidates[0];
    assert(!!testCand, `Found test candidate: ${testCand?.email}`);

    if (testCand) {
      // 3. Update Candidate Subscription (PATCH /api/admin/candidates/:id/subscription)
      console.log(`\n3. Modifying subscription for candidate ${testCand.email}...`);
      const subRes = await fetch(`${API_BASE}/api/admin/candidates/${testCand.id}/subscription`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          tier: "PRO_MONTHLY",
          isPlanOpted: true,
          voiceMinutesLimit: 300,
          extendDays: 30,
        }),
      });
      const subData = await subRes.json();
      assert(subRes.status === 200 && subData.subscription?.isPlanOpted === true, "Subscription upgraded to PRO_MONTHLY with isPlanOpted = true");

      // 4. Block Candidate (POST /api/admin/candidates/:id/block)
      console.log(`\n4. Testing candidate universal block for ${testCand.email}...`);
      const blockRes = await fetch(`${API_BASE}/api/admin/candidates/${testCand.id}/block`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ reason: "Automated integration test suspension" }),
      });
      const blockData = await blockRes.json();
      assert(blockRes.status === 200 && blockData.candidate?.isBlocked === true, "Candidate isBlocked flipped to true with reason");

      // 5. Unblock Candidate (POST /api/admin/candidates/:id/unblock)
      console.log(`\n5. Testing candidate unblock for ${testCand.email}...`);
      const unblockRes = await fetch(`${API_BASE}/api/admin/candidates/${testCand.id}/unblock`, {
        method: "POST",
        headers: authHeaders,
      });
      const unblockData = await unblockRes.json();
      assert(unblockRes.status === 200 && unblockData.candidate?.isBlocked === false, "Candidate successfully unblocked");
    }

    // 6. HOD Team Registry (GET /api/admin/team)
    console.log("\n6. Testing GET /api/admin/team...");
    const teamRes = await fetch(`${API_BASE}/api/admin/team`, { headers: authHeaders });
    const teamData = await teamRes.json();
    assert(teamRes.status === 200 && Array.isArray(teamData.staff), "Team registry returned 200 OK");
    const hodMember = teamData.staff.find((s: any) => s.email === "imsauravsingh@gmail.com");
    assert(!!hodMember && hodMember.isRootHod === true, "Root HOD verified in team registry");

    // 7. Create Dummy Staff Access Request with Reason Text
    console.log("\n7. Submitting dummy staff access request with written justification...");
    const dummyApplicantEmail = `test_staff_${Date.now().toString(36)}@prepinminutes.test`;
    const dummyUser = await db.user.create({
      data: {
        email: dummyApplicantEmail,
        fullName: "Test Staff Applicant",
        role: "CANDIDATE",
        adminApprovalStatus: "PENDING",
        requestedRole: "CURRICULUM_MANAGER",
        requestReason: "I have 6 years experience conducting System Design interviews and want to author benchmark questions.",
        requestedAt: new Date(),
      },
    });

    // 8. HOD Pending Access Queue (GET /api/admin/team/pending)
    console.log("\n8. Testing GET /api/admin/team/pending...");
    const pendingRes = await fetch(`${API_BASE}/api/admin/team/pending`, { headers: authHeaders });
    const pendingData = await pendingRes.json();
    assert(pendingRes.status === 200, "Pending queue returned 200 OK");
    const foundPending = pendingData.requests?.find((r: any) => r.id === dummyUser.id);
    assert(!!foundPending, `Found dummy applicant in pending queue: ${foundPending?.email}`);
    assert(foundPending?.requestReason.includes("6 years experience"), "Exact written justification reason returned in pending queue");

    // 9. HOD Approves Staff Member (PATCH /api/admin/team/:id/approve)
    console.log("\n9. Testing HOD approval of staff applicant...");
    const approveRes = await fetch(`${API_BASE}/api/admin/team/${dummyUser.id}/approve`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ role: "CURRICULUM_MANAGER" }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.user?.role === "CURRICULUM_MANAGER", "Staff applicant approved as CURRICULUM_MANAGER");

    // 10. HOD Blocks Staff Member (POST /api/admin/team/:id/block)
    console.log("\n10. Testing HOD universal staff block...");
    const blockStaffRes = await fetch(`${API_BASE}/api/admin/team/${dummyUser.id}/block`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ reason: "Staff security audit temporary lock" }),
    });
    const blockStaffData = await blockStaffRes.json();
    assert(blockStaffRes.status === 200 && blockStaffData.user?.isBlocked === true, "Staff member blocked and administrative session suspended");

    // 11. HOD Unblocks Staff Member
    console.log("\n11. Testing HOD unblocking staff member...");
    const unblockStaffRes = await fetch(`${API_BASE}/api/admin/team/${dummyUser.id}/unblock`, {
      method: "POST",
      headers: authHeaders,
    });
    const unblockStaffData = await unblockStaffRes.json();
    assert(unblockStaffRes.status === 200 && unblockStaffData.user?.isBlocked === false, "Staff member unblocked");

    // 12. Audit Logs History (GET /api/admin/team/audit-logs)
    console.log("\n12. Testing GET /api/admin/team/audit-logs...");
    const logsRes = await fetch(`${API_BASE}/api/admin/team/audit-logs`, { headers: authHeaders });
    const logsData = await logsRes.json();
    assert(logsRes.status === 200 && Array.isArray(logsData.logs), "Audit logs history returned 200 OK");
    assert(logsData.logs.length >= 2, `Audit logs recorded for actions (count: ${logsData.logs.length})`);

    // 13. Clean up dummy user
    console.log("\n13. Cleaning up test dummy user...");
    await db.user.delete({ where: { id: dummyUser.id } });
    console.log("  ✓ Dummy staff account cleaned up.");

    console.log("\n=================================================================");
    console.log(`   CANDIDATE & HOD TEAM TEST SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log("=================================================================\n");

    if (testFailed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution threw error:", err);
    process.exit(1);
  }
}

runCandidateAndTeamTests();

