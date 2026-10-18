/**
 * PrepInMinutes — Step 1 (Setup Phase & Multi-Plan) Integration Test Suite
 *
 * Verifies:
 * 1. Initial profile fetch for authenticated candidate.
 * 2. Saving setup details via POST /api/onboarding/profile.
 * 3. PostgreSQL persistence in candidate_profiles and preparation_plans.
 * 4. Multi-plan readiness: 1:N relationship with is_active flag and active_plan_id.
 * 5. Hydration: GET /api/onboarding/profile returns profile and activePlan.
 */

import { db } from "../src/server/db/client";
import { handlePostProfile, handleGetProfile } from "../src/routes/onboarding-profile";
import { signSessionJwt } from "../src/server/auth/google-sso";
import { ApiRequest } from "../src/lib/http";

async function runSetupPhaseTests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Setup Phase (Step 1) Integration Tests        ");
  console.log("=================================================================\n");

  const testId = `setup_test_${Date.now()}`;
  const testEmail = `${testId}@prepinminutes.test`;

  // 1. Create a test candidate in PostgreSQL
  console.log("1. Creating test candidate...");
  const user = await db.user.create({
    data: {
      email: testEmail,
      username: testId,
      fullName: "Jane Candidate",
      authProvider: "credentials",
      emailVerified: true,
    },
  });
  console.log(`  ✓ Candidate created: ${user.email} (ID: ${user.id})`);

  const token = signSessionJwt({
    sub: user.id,
    userId: user.id,
    email: user.email,
    provider: "credentials",
  });

  try {
    // 2. Test initial GET /api/onboarding/profile before setup
    console.log("\nTEST 1: Fetching initial profile before setup...");
    const getReq1 = new Request("http://localhost/api/onboarding/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) as ApiRequest;

    const res1 = await handleGetProfile(getReq1);
    const body1 = (await res1.json()) as any;

    if (res1.status !== 200 || body1.profile !== null) {
      throw new Error(`Expected status 200 with profile: null, got ${res1.status} - ${JSON.stringify(body1)}`);
    }
    console.log("  ✓ Initial profile fetch returned clean null state without throwing.");

    // 3. Test POST /api/onboarding/profile
    console.log("\nTEST 2: Submitting Step 1 setup form...");
    const postPayload = {
      targetRole: "Senior Distributed Systems Engineer",
      experienceLevel: "6-8 years",
      timelineLabel: "2-3 months",
      targetCompanies: ["Google", "Stripe", "Netflix"],
      jobDescriptionText: "We are seeking a Senior Distributed Systems Engineer to scale our global event pipeline.",
      weeklyGoalHours: 8,
    };

    const postReq = new Request("http://localhost/api/onboarding/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postPayload),
    }) as ApiRequest;

    const res2 = await handlePostProfile(postReq);
    const body2 = (await res2.json()) as any;

    if (res2.status !== 200 || !body2.success) {
      throw new Error(`Expected status 200 with success: true, got ${res2.status} - ${JSON.stringify(body2)}`);
    }

    if (!body2.profile || !body2.activePlan) {
      throw new Error(`Expected both profile and activePlan in response: ${JSON.stringify(body2)}`);
    }

    console.log(`  ✓ Setup profile saved! Profile ID: ${body2.profile.id}`);
    console.log(`  ✓ Active preparation plan created! Plan ID: ${body2.activePlan.id}`);
    console.log(`  ✓ Plan title: "${body2.activePlan.title}" | Target Role: "${body2.activePlan.targetRole}"`);

    // 4. Verify PostgreSQL Direct Records
    console.log("\nTEST 3: Verifying PostgreSQL database state directly...");
    const dbProfile = await db.candidateProfile.findUnique({
      where: { userId: user.id },
      include: { plans: true },
    });

    if (!dbProfile) throw new Error("Candidate profile not found in PostgreSQL!");
    if (dbProfile.onboardingStep !== 2) {
      throw new Error(`Expected onboarding_step to be 2, got ${dbProfile.onboardingStep}`);
    }
    if (dbProfile.plans.length !== 1) {
      throw new Error(`Expected exactly 1 preparation plan, found ${dbProfile.plans.length}`);
    }

    const dbPlan = dbProfile.plans[0];
    if (!dbPlan.isActive) {
      throw new Error("Expected plan to have is_active = true");
    }
    if (dbProfile.activePlanId !== dbPlan.id) {
      throw new Error(`Expected profile.active_plan_id (${dbProfile.activePlanId}) to match plan.id (${dbPlan.id})`);
    }
    if (dbPlan.targetCompanies.length !== 3) {
      throw new Error(`Expected 3 target companies, found ${dbPlan.targetCompanies.length}`);
    }
    console.log("  ✓ Database record verified: candidate_profiles.onboarding_step = 2");
    console.log("  ✓ Database record verified: preparation_plans 1:N link with is_active = true");
    console.log(`  ✓ Database record verified: target_companies = [${dbPlan.targetCompanies.join(", ")}]`);

    // 5. Test Hydration (GET /api/onboarding/profile after setup)
    console.log("\nTEST 4: Testing draft hydration on returning visits...");
    const getReq2 = new Request("http://localhost/api/onboarding/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) as ApiRequest;

    const res3 = await handleGetProfile(getReq2);
    const body3 = (await res3.json()) as any;

    if (res3.status !== 200 || !body3.profile || !body3.activePlan) {
      throw new Error(`Failed to hydrate profile: ${JSON.stringify(body3)}`);
    }

    if (body3.profile.targetRole !== "Senior Distributed Systems Engineer") {
      throw new Error(`Target role mismatch: ${body3.profile.targetRole}`);
    }
    console.log("  ✓ Hydration succeeded: retrieved candidate profile and active plan matching saved inputs.");

    console.log("\n=================================================================");
    console.log("   ALL SETUP PHASE (STEP 1) TESTS PASSED! (4/4)                 ");
    console.log("=================================================================\n");
  } finally {
    // Cleanup
    console.log("Cleaning up test candidate from database...");
    await db.user.deleteMany({
      where: { id: user.id },
    });
    console.log("  ✓ Test candidate cleaned up.\n");
  }
}

runSetupPhaseTests()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
