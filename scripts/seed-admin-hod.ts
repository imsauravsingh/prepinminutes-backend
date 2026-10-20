/**
 * PrepInMinutes — Seed Root HOD Super-Admin Account
 * 
 * Seeds/Upserts the root HOD account:
 * Email: imsauravsingh@gmail.com
 * Password: Saurav@3063
 * Role: SUPER_ADMIN
 * Admin Approval Status: APPROVED
 * Full Name: Saurav Singh
 */

import "dotenv/config";
import { db } from "../src/server/db/client";
import { hashPassword } from "../src/server/auth/credentials";

async function seedAdminHod() {
  const email = "imsauravsingh@gmail.com";
  const plainPassword = "Saurav@3063";
  const fullName = "Saurav Singh";

  console.log("=================================================");
  console.log("  PrepInMinutes — Seeding Root HOD Administrator ");
  console.log("=================================================\n");

  const passwordHash = hashPassword(plainPassword);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    user = await db.user.update({
      where: { email },
      data: {
        passwordHash,
        fullName: fullName || existingUser.fullName,
        role: "SUPER_ADMIN",
        adminApprovalStatus: "APPROVED",
        emailVerified: true,
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        approvedBy: email,
        approvedAt: new Date(),
      },
    });
    console.log(`✓ Updated existing account for ${email} with SUPER_ADMIN privileges.`);
  } else {
    user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        authProvider: "credentials",
        role: "SUPER_ADMIN",
        adminApprovalStatus: "APPROVED",
        emailVerified: true,
        isBlocked: false,
        approvedBy: email,
        approvedAt: new Date(),
      },
    });
    console.log(`✓ Created new root HOD account for ${email}.`);
  }

  // Ensure Subscription record exists for HOD with unlimited access
  const existingSub = await db.subscription.findUnique({
    where: { userId: user.id },
  });

  if (existingSub) {
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        tier: "LIFETIME",
        status: "ACTIVE",
        planName: "Super Admin Lifetime Pass",
        isPlanOpted: true,
        voiceMinutesLimit: 999999,
        mockInterviewsLimit: 999999,
      },
    });
  } else {
    await db.subscription.create({
      data: {
        userId: user.id,
        tier: "LIFETIME",
        status: "ACTIVE",
        planName: "Super Admin Lifetime Pass",
        isPlanOpted: true,
        voiceMinutesLimit: 999999,
        mockInterviewsLimit: 999999,
      },
    });
  }

  console.log(`✓ Super-admin subscription record active (Unlimited quotas).`);
  console.log(`\n🎉 Root HOD Account Ready:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Approval Status: ${user.adminApprovalStatus}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`=================================================\n`);
}

seedAdminHod()
  .catch((err) => {
    console.error("Failed to seed HOD account:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

