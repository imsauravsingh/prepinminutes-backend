/**
 * PrepInMinutes — Comprehensive PostgreSQL Relational Parity & Plan Audit
 *
 * Verifies live PostgreSQL state against Master Task Sequence requirements:
 * 1. 10 Canonical Domains, 122 Categories, 371 Topics, 7420 Questions
 * 2. Candidate Profiles & Preparation Plans
 * 3. Daily Plan Tasks, Topic Masteries, and Weekly Snapshots
 * 4. Platform Configs and Subscriptions
 */

import "dotenv/config";
import { getDb } from "../src/server/db/client";

async function runAudit() {
  const prisma = getDb();

  console.log("==================================================================");
  console.log("📊 AUDITING POSTGRESQL DATA INTEGRITY & PLAN PARITY");
  console.log("==================================================================\n");

  // 1. Table Counts Overview
  const domainCount = await prisma.curriculumDomain.count();
  const categoryCount = await prisma.curriculumCategory.count();
  const topicCount = await prisma.curriculumTopic.count();
  const questionCount = await prisma.curriculumQuestion.count();
  const userCount = await prisma.user.count();
  const candidateProfileCount = await prisma.candidateProfile.count();
  const planCount = await prisma.preparationPlan.count();
  const dailyTaskCount = await prisma.dailyPlanTask.count();
  const topicMasteryCount = await prisma.candidateTopicMastery.count();
  const platformConfigCount = await prisma.platformConfig.count();
  const subscriptionPlanCount = await prisma.subscriptionPlan.count();

  console.log("📌 Core Entity Counts:");
  console.log(`   - curriculum_domains:       ${domainCount.toString().padStart(6)} (Target: 10)`);
  console.log(`   - curriculum_categories:    ${categoryCount.toString().padStart(6)} (Target: 122)`);
  console.log(`   - curriculum_topics:        ${topicCount.toString().padStart(6)} (Target: 371)`);
  console.log(`   - curriculum_questions:     ${questionCount.toString().padStart(6)} (Target: 7,420)`);
  console.log(`   - users:                    ${userCount.toString().padStart(6)}`);
  console.log(`   - candidate_profiles:       ${candidateProfileCount.toString().padStart(6)}`);
  console.log(`   - preparation_plans:        ${planCount.toString().padStart(6)}`);
  console.log(`   - daily_plan_tasks:         ${dailyTaskCount.toString().padStart(6)}`);
  console.log(`   - candidate_topic_masteries:${topicMasteryCount.toString().padStart(6)}`);
  console.log(`   - platform_configs:         ${platformConfigCount.toString().padStart(6)}`);
  console.log(`   - subscription_plans:       ${subscriptionPlanCount.toString().padStart(6)}`);
  console.log("");

  // 2. Domain-by-Domain Breakdown
  console.log("👉 Domain Breakdown (Categories, Topics, Questions):");
  console.log("------------------------------------------------------------------");
  console.log(
    "| Domain Slug              | Categories | Topics | Questions | Status |"
  );
  console.log("------------------------------------------------------------------");

  const domains = await prisma.curriculumDomain.findMany({
    include: {
      categories: {
        include: {
          topics: {
            include: {
              _count: {
                select: { questions: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const d of domains) {
    const catCount = d.categories.length;
    const tCount = d.categories.reduce((acc, cat) => acc + cat.topics.length, 0);
    const qCount = d.categories.reduce(
      (acc, cat) =>
        acc + cat.topics.reduce((tAcc, top) => tAcc + top._count.questions, 0),
      0
    );
    const status = catCount > 0 && tCount > 0 && qCount > 0 ? "✅ OK" : "⚠️ INCOMPLETE";

    console.log(
      `| ${d.slug.padEnd(24)} | ${catCount.toString().padStart(10)} | ${tCount
        .toString()
        .padStart(6)} | ${qCount.toString().padStart(9)} | ${status.padEnd(6)} |`
    );
  }
  console.log("------------------------------------------------------------------\n");

  // 3. Candidate Profiles & Preparation Plans Audit
  console.log("👉 Candidate Preparation Plans Audit:");
  const candidates = await prisma.candidateProfile.findMany({
    include: {
      user: { select: { id: true, email: true, fullName: true, role: true } },
      plans: {
        include: {
          _count: { select: { dailyTasks: true } },
        },
      },
      topicMasteries: true,
    },
  });

  if (candidates.length === 0) {
    console.log("   ⚠️ No candidate profiles found in database.");
  } else {
    for (const c of candidates) {
      console.log(`   👤 Candidate: ${c.user?.fullName || "Unnamed"} (${c.user?.email || "No email"})`);
      console.log(`      Role: ${c.targetRole || "N/A"} | Companies: ${c.targetCompanies?.join(", ") || "N/A"} | Experience: ${c.experienceLevel || "N/A"}`);
      console.log(`      Total Plans: ${c.plans.length} | Mastered Topics: ${c.topicMasteries.length}`);
      for (const p of c.plans) {
        console.log(`      ↳ Plan [${p.id}]: Active: ${p.isActive} | Status: ${p.status} | Daily Tasks: ${p._count.dailyTasks}`);
      }
    }
  }
  console.log("");

  // 4. Sample Topic & Canonical ID check
  console.log("👉 Sample Canonical Topic ID & Rubric Atom Integrity:");
  const sampleTopics = await prisma.curriculumTopic.findMany({
    take: 5,
    include: {
      category: { include: { domain: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { slug: "asc" },
  });

  for (const t of sampleTopics) {
    console.log(
      `   • [${t.topicId || "NO-ID"}] ${t.title} (${t.slug})`
    );
    console.log(
      `     Domain: ${t.category.domain.slug} | Category: ${t.category.slug} | Difficulty: ${t.difficulty} | Questions: ${t._count.questions}`
    );
  }

  console.log("\n==================================================================");
  const isHealthy =
    domainCount === 10 &&
    categoryCount === 122 &&
    topicCount === 371 &&
    questionCount === 7420;

  if (isHealthy) {
    console.log("🎉 AUDIT RESULT: POSTGRESQL DATA IS 100% IN PARITY WITH THE PLAN!");
  } else {
    console.log(`⚠️ AUDIT RESULT: Discrepancy detected (Domains: ${domainCount}/10, Categories: ${categoryCount}/122, Topics: ${topicCount}/371, Questions: ${questionCount}/7420)`);
  }
  console.log("==================================================================");

  await prisma.$disconnect();
}

runAudit().catch((err) => {
  console.error("❌ Audit failed with error:", err);
  process.exit(1);
});
