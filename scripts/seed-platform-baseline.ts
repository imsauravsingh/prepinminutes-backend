/**
 * PrepInMinutes — Baseline Platform Seed Script
 * 
 * Populates:
 * 1. Root Administrator Account (imsauravsingh@gmail.com) with SUPER_ADMIN privileges
 * 2. Canonical Subscription Plans (FREE, PRO_MONTHLY, PRO_QUARTERLY, LIFETIME)
 * 3. Platform Configurations (AI model toggles, system settings, feature flags)
 * 4. Company Intelligence Refresh Configuration (twice monthly, batch size 50, Asia/Kolkata)
 * 5. System Initialization Audit Log
 * 
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import "dotenv/config";
import { getDb } from "../src/server/db/client";
import { hashPassword } from "../src/server/auth/credentials";
import {
  CANONICAL_SUBSCRIPTION_PLANS,
  CANONICAL_PLATFORM_CONFIGS,
  CANONICAL_REFRESH_CONFIG,
} from "./seed-data/platform-schema";

async function seedPlatformBaseline() {
  const startTime = Date.now();
  console.log("==================================================================");
  console.log("🚀 Starting PrepInMinutes Baseline Platform Seeding");
  console.log("==================================================================\n");

  const prisma = getDb();

  // -------------------------------------------------------------
  // 1. Root Administrator Account (HOD / SUPER_ADMIN)
  // -------------------------------------------------------------
  const adminEmail = "imsauravsingh@gmail.com";
  const plainPassword = "Saurav@3063";
  const fullName = "Saurav Singh";
  const passwordHash = hashPassword(plainPassword);

  console.log("👤 Step 1: Seeding Root Administrator Account...");
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: fullName,
      role: "SUPER_ADMIN",
      adminApprovalStatus: "APPROVED",
      emailVerified: true,
      isBlocked: false,
      approvedBy: adminEmail,
      approvedAt: new Date(),
    },
    create: {
      email: adminEmail,
      fullName: fullName,
      passwordHash: passwordHash,
      authProvider: "credentials",
      role: "SUPER_ADMIN",
      adminApprovalStatus: "APPROVED",
      emailVerified: true,
      isBlocked: false,
      approvedBy: adminEmail,
      approvedAt: new Date(),
    },
  });

  // Ensure Admin Subscription has LIFETIME unlimited access
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {
      tier: "LIFETIME",
      status: "ACTIVE",
      planName: "Super-Admin Executive Pass",
      isPlanOpted: true,
      voiceMinutesLimit: 9999.0,
      mockInterviewsLimit: 999,
    },
    create: {
      userId: adminUser.id,
      tier: "LIFETIME",
      status: "ACTIVE",
      planName: "Super-Admin Executive Pass",
      isPlanOpted: true,
      voiceMinutesLimit: 9999.0,
      mockInterviewsLimit: 999,
    },
  });
  console.log(`   ✓ Root Administrator: ${adminUser.email} (Role: ${adminUser.role}, Status: APPROVED)`);

  // -------------------------------------------------------------
  // 2. Canonical Subscription Plans
  // -------------------------------------------------------------
  console.log("\n💳 Step 2: Seeding Canonical Subscription Plans Catalog...");
  let plansCount = 0;
  for (const plan of CANONICAL_SUBSCRIPTION_PLANS) {
    const upsertedPlan = await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        voiceMinutesLimit: plan.voiceMinutesLimit,
        mockInterviewsLimit: plan.mockInterviewsLimit,
        features: plan.features,
        isActive: plan.isActive,
      },
      create: {
        tier: plan.tier,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        voiceMinutesLimit: plan.voiceMinutesLimit,
        mockInterviewsLimit: plan.mockInterviewsLimit,
        features: plan.features,
        isActive: plan.isActive,
      },
    });
    plansCount++;
    console.log(`   ✓ Tier: [${upsertedPlan.tier}] ${upsertedPlan.name} ($${upsertedPlan.price}/${upsertedPlan.billingInterval})`);
  }

  // -------------------------------------------------------------
  // 3. Platform Configurations & Feature Flags
  // -------------------------------------------------------------
  console.log("\n⚙️  Step 3: Seeding Platform Configurations & Settings...");
  let configsCount = 0;
  for (const config of CANONICAL_PLATFORM_CONFIGS) {
    const upsertedConfig = await prisma.platformConfig.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        description: config.description,
        isPublic: config.isPublic,
      },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        isPublic: config.isPublic,
      },
    });
    configsCount++;
    console.log(`   ✓ Config: ${upsertedConfig.key} = "${upsertedConfig.value}" (Public: ${upsertedConfig.isPublic})`);
  }

  // -------------------------------------------------------------
  // 4. Company Intelligence Refresh Configuration
  // -------------------------------------------------------------
  console.log("\n🔄 Step 4: Seeding Company Intelligence Refresh Configuration...");
  const refreshConfig = await prisma.intelligenceRefreshConfig.upsert({
    where: { jobName: CANONICAL_REFRESH_CONFIG.jobName },
    update: {
      enabled: CANONICAL_REFRESH_CONFIG.enabled,
      cronExpression: CANONICAL_REFRESH_CONFIG.cronExpression,
      timezone: CANONICAL_REFRESH_CONFIG.timezone,
      batchSize: CANONICAL_REFRESH_CONFIG.batchSize,
      maxRetries: CANONICAL_REFRESH_CONFIG.maxRetries,
      refreshIntervalDays: CANONICAL_REFRESH_CONFIG.refreshIntervalDays,
      strategy: CANONICAL_REFRESH_CONFIG.strategy,
    },
    create: {
      jobName: CANONICAL_REFRESH_CONFIG.jobName,
      enabled: CANONICAL_REFRESH_CONFIG.enabled,
      cronExpression: CANONICAL_REFRESH_CONFIG.cronExpression,
      timezone: CANONICAL_REFRESH_CONFIG.timezone,
      batchSize: CANONICAL_REFRESH_CONFIG.batchSize,
      maxRetries: CANONICAL_REFRESH_CONFIG.maxRetries,
      refreshIntervalDays: CANONICAL_REFRESH_CONFIG.refreshIntervalDays,
      strategy: CANONICAL_REFRESH_CONFIG.strategy,
    },
  });
  console.log(`   ✓ Job: ${refreshConfig.jobName} (Cron: "${refreshConfig.cronExpression}", Batch: ${refreshConfig.batchSize}, Timezone: ${refreshConfig.timezone})`);

  // -------------------------------------------------------------
  // 5. System Initialization Audit Log
  // -------------------------------------------------------------
  console.log("\n📋 Step 5: Logging System Initialization Audit Record...");
  await prisma.adminAuditLog.create({
    data: {
      userId: adminUser.id,
      action: "PLATFORM_INITIALIZATION",
      targetType: "PlatformConfig",
      targetId: "SYSTEM_INIT",
      changeDiff: {
        seededAt: new Date().toISOString(),
        subscriptionPlansCount: plansCount,
        platformConfigsCount: configsCount,
        refreshJob: refreshConfig.jobName,
      },
      ipAddress: "127.0.0.1",
    },
  });
  console.log("   ✓ Audit log recorded.");

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  // -------------------------------------------------------------
  // 6. Verification Summary
  // -------------------------------------------------------------
  const dbPlans = await prisma.subscriptionPlan.count();
  const dbConfigs = await prisma.platformConfig.count();
  const dbRefresh = await prisma.intelligenceRefreshConfig.count();
  const dbAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });

  console.log("\n==================================================================");
  console.log(`🎉 BASELINE PLATFORM SEED COMPLETED IN ${durationSec}s!`);
  console.log("==================================================================");
  console.log(`👑 Root Administrator:      ${dbAdmin?.email} (APPROVED)`);
  console.log(`💳 Subscription Plans:      ${dbPlans} (Target: 4)`);
  console.log(`⚙️  Platform Configurations: ${dbConfigs} (Target: 10)`);
  console.log(`🔄 Refresh Engine Jobs:     ${dbRefresh} (Target: 1)`);
  console.log("==================================================================\n");

  if (dbPlans !== 4 || dbConfigs !== 10 || dbRefresh !== 1 || !dbAdmin) {
    throw new Error("Audit verification failed for baseline platform seed!");
  }

  console.log("✅ BASELINE PLATFORM DATA FULLY INITIALIZED AND VERIFIED!\n");
}

seedPlatformBaseline().catch((err) => {
  console.error("❌ Fatal Error during baseline platform seeding:", err);
  process.exit(1);
});

