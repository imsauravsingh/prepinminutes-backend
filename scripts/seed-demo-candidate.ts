/**
 * PrepInMinutes — Golden Demo Candidate Seed Script
 * 
 * Populates:
 * 1. Demo Candidate User (candidate@prepinminutes.com / Candidate@123)
 * 2. CandidateProfile (Senior Backend Engineer, 68% readiness, 5-day streak)
 * 3. Subscription (PRO_MONTHLY, active, metered usage)
 * 4. PreparationPlan (4-week Senior Distributed Systems roadmap)
 * 5. DailyPlanTasks (4 tasks mapped to curriculum topics)
 * 6. PracticeSession (Consistent Hashing completed session)
 * 7. EvaluationReport & RubricScores (Sarah AI evaluation, 82/100, Hire)
 * 8. CandidateTopicMastery (Trade-offs stage, SM-2 interval)
 * 9. RevisionItems (SM-2 spaced repetition queue)
 * 10. CandidateTopicProficiencies & WeeklyAreaSnapshots
 * 
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import "dotenv/config";
import { getDb } from "../src/server/db/client";
import { hashPassword } from "../src/server/auth/credentials";
import { GOLDEN_DEMO_CANDIDATE } from "./seed-data/platform-schema";

async function seedDemoCandidate() {
  const startTime = Date.now();
  console.log("==================================================================");
  console.log("🚀 Starting PrepInMinutes Golden Demo Candidate Seeding");
  console.log("==================================================================\n");

  const prisma = getDb();
  const demoData = GOLDEN_DEMO_CANDIDATE;

  // -------------------------------------------------------------
  // 1. Demo Candidate User
  // -------------------------------------------------------------
  const candidateEmail = demoData.user.email;
  const plainPassword = "Candidate@123";
  const passwordHash = hashPassword(plainPassword);

  console.log(`👤 Step 1: Seeding Demo Candidate User (${candidateEmail})...`);
  const candidateUser = await prisma.user.upsert({
    where: { email: candidateEmail },
    update: {
      fullName: demoData.user.fullName,
      username: demoData.user.username,
      passwordHash: passwordHash,
      role: demoData.user.role,
      authProvider: demoData.user.authProvider,
      emailVerified: demoData.user.isEmailVerified,
      isBlocked: false,
    },
    create: {
      email: candidateEmail,
      fullName: demoData.user.fullName,
      username: demoData.user.username,
      passwordHash: passwordHash,
      role: demoData.user.role,
      authProvider: demoData.user.authProvider,
      emailVerified: demoData.user.isEmailVerified,
      isBlocked: false,
    },
  });
  console.log(`   ✅ User ready: ${candidateUser.id} (${candidateUser.email})`);

  // -------------------------------------------------------------
  // 2. Candidate Profile
  // -------------------------------------------------------------
  console.log("\n📋 Step 2: Seeding Candidate Profile...");
  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      targetRole: demoData.profile.targetRole,
      experienceLevel: demoData.profile.experienceLevel,
      targetCompanies: demoData.profile.targetCompanies,
      timelineWeeks: demoData.profile.timelineWeeks,
      timelineLabel: demoData.profile.timelineLabel,
      onboardingStep: demoData.profile.onboardingStep,
      isOnboardingDone: demoData.profile.isOnboardingDone,
      readinessScore: demoData.profile.readinessScore,
      weeklyGoalHours: demoData.profile.weeklyGoalHours,
      completedHours: demoData.profile.completedHours,
      streakDays: demoData.profile.streakDays,
      resumeFileName: demoData.profile.resumeFileName,
      resumeFileUrl: demoData.profile.resumeFileUrl,
      jobDescriptionText: demoData.profile.jobDescriptionText,
    },
    create: {
      userId: candidateUser.id,
      targetRole: demoData.profile.targetRole,
      experienceLevel: demoData.profile.experienceLevel,
      targetCompanies: demoData.profile.targetCompanies,
      timelineWeeks: demoData.profile.timelineWeeks,
      timelineLabel: demoData.profile.timelineLabel,
      onboardingStep: demoData.profile.onboardingStep,
      isOnboardingDone: demoData.profile.isOnboardingDone,
      readinessScore: demoData.profile.readinessScore,
      weeklyGoalHours: demoData.profile.weeklyGoalHours,
      completedHours: demoData.profile.completedHours,
      streakDays: demoData.profile.streakDays,
      resumeFileName: demoData.profile.resumeFileName,
      resumeFileUrl: demoData.profile.resumeFileUrl,
      jobDescriptionText: demoData.profile.jobDescriptionText,
    },
  });
  console.log(`   ✅ Profile ready: ${candidateProfile.id} (Score: ${candidateProfile.readinessScore}%, Streak: ${candidateProfile.streakDays}d)`);

  // -------------------------------------------------------------
  // 3. Subscription (Active PRO_MONTHLY with metered usage)
  // -------------------------------------------------------------
  console.log("\n💳 Step 3: Seeding Subscription...");
  const periodStart = new Date();
  const periodEnd = new Date(Date.now() + 30 * 86400 * 1000);

  const subscription = await prisma.subscription.upsert({
    where: { userId: candidateUser.id },
    update: {
      tier: demoData.subscription.tier,
      status: demoData.subscription.status,
      planName: demoData.subscription.planName,
      isPlanOpted: demoData.subscription.isPlanOpted,
      pricePaid: demoData.subscription.pricePaid,
      currency: demoData.subscription.currency,
      paymentProvider: "stripe",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      voiceMinutesUsed: demoData.subscription.voiceMinutesUsed,
      voiceMinutesLimit: demoData.subscription.voiceMinutesLimit,
      mockInterviewsUsed: demoData.subscription.mockInterviewsUsed,
      mockInterviewsLimit: demoData.subscription.mockInterviewsLimit,
    },
    create: {
      userId: candidateUser.id,
      tier: demoData.subscription.tier,
      status: demoData.subscription.status,
      planName: demoData.subscription.planName,
      isPlanOpted: demoData.subscription.isPlanOpted,
      pricePaid: demoData.subscription.pricePaid,
      currency: demoData.subscription.currency,
      paymentProvider: "stripe",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      voiceMinutesUsed: demoData.subscription.voiceMinutesUsed,
      voiceMinutesLimit: demoData.subscription.voiceMinutesLimit,
      mockInterviewsUsed: demoData.subscription.mockInterviewsUsed,
      mockInterviewsLimit: demoData.subscription.mockInterviewsLimit,
    },
  });
  console.log(`   ✅ Subscription ready: ${subscription.tier} (${subscription.status}, Voice: ${subscription.voiceMinutesUsed}/${subscription.voiceMinutesLimit} min)`);

  // -------------------------------------------------------------
  // 4. Preparation Plan
  // -------------------------------------------------------------
  console.log("\n🗺️ Step 4: Seeding Preparation Plan...");
  let preparationPlan = await prisma.preparationPlan.findFirst({
    where: { candidateId: candidateProfile.id, isActive: true },
  });

  if (!preparationPlan) {
    preparationPlan = await prisma.preparationPlan.create({
      data: {
        candidateId: candidateProfile.id,
        title: demoData.plan.title,
        isActive: demoData.plan.isActive,
        status: demoData.plan.status,
        targetRole: demoData.plan.targetRole,
        targetSeniority: demoData.plan.targetSeniority,
        targetCompanies: demoData.plan.targetCompanies,
        timelineWeeks: demoData.plan.timelineWeeks,
        timelineLabel: demoData.plan.timelineLabel,
        readinessScore: demoData.plan.readinessScore,
        activePhaseId: demoData.plan.activePhaseId,
        weeklyMilestones: demoData.plan.weeklyMilestones,
        domainWeights: demoData.plan.domainWeights,
      },
    });
  } else {
    preparationPlan = await prisma.preparationPlan.update({
      where: { id: preparationPlan.id },
      data: {
        title: demoData.plan.title,
        targetRole: demoData.plan.targetRole,
        targetSeniority: demoData.plan.targetSeniority,
        targetCompanies: demoData.plan.targetCompanies,
        readinessScore: demoData.plan.readinessScore,
        activePhaseId: demoData.plan.activePhaseId,
        weeklyMilestones: demoData.plan.weeklyMilestones,
        domainWeights: demoData.plan.domainWeights,
      },
    });
  }

  await prisma.candidateProfile.update({
    where: { id: candidateProfile.id },
    data: { activePlanId: preparationPlan.id },
  });
  console.log(`   ✅ Plan ready: ${preparationPlan.id} ("${preparationPlan.title}")`);

  // -------------------------------------------------------------
  // 5. Daily Plan Tasks
  // -------------------------------------------------------------
  console.log("\n📅 Step 5: Seeding Daily Plan Tasks...");
  await prisma.dailyPlanTask.deleteMany({
    where: { planId: preparationPlan.id },
  });

  for (const task of demoData.dailyTasks) {
    const topic = await prisma.curriculumTopic.findUnique({
      where: { slug: task.topicSlug },
    });

    const scheduledDate = new Date(Date.now() + task.scheduledDateOffsetDays * 86400 * 1000);
    const completedAt = task.isCompleted ? scheduledDate : null;

    await prisma.dailyPlanTask.create({
      data: {
        planId: preparationPlan.id,
        topicId: topic?.id ?? null,
        domainSlug: task.domainSlug,
        title: task.title,
        subtitle: task.subtitle,
        durationMin: task.durationMin,
        practiceHref: task.practiceHref,
        scheduledDate: scheduledDate,
        orderIndex: task.orderIndex,
        isCompleted: task.isCompleted,
        completedAt: completedAt,
      },
    });
    console.log(`   - Task [${task.isCompleted ? "DONE" : "PEND"}] ${task.title} (Topic: ${topic?.slug ?? "unlinked"})`);
  }

  // -------------------------------------------------------------
  // 6. Practice Session (Distributed Key-Value Store)
  // -------------------------------------------------------------
  console.log("\n💻 Step 6: Seeding Practice Session...");
  const kvTopic = await prisma.curriculumTopic.findUnique({
    where: { slug: "distributed-key-value-store" },
  });

  if (!kvTopic) {
    throw new Error("Curriculum topic 'distributed-key-value-store' not found in database!");
  }

  let session = await prisma.practiceSession.findFirst({
    where: {
      candidateId: candidateProfile.id,
      topicSlug: "distributed-key-value-store",
    },
  });

  if (!session) {
    session = await prisma.practiceSession.create({
      data: {
        candidateId: candidateProfile.id,
        topicId: kvTopic.id,
        domain: "system-design",
        topicSlug: "distributed-key-value-store",
        title: "Consistent Hashing & Dynamic Ring Partitioning (Dynamo KV Store)",
        durationSeconds: 840,
        status: "COMPLETED",
        diagramJson: { nodes: 12, ringPartitions: 1024, vnodes: 256 },
        architectureNotes: "Walked through consistent hashing ring, MD5/MurmurHash3 distribution, virtual node scaling factor, cascade failure mitigation.",
        whiteboardUrl: "https://r2.prepinminutes.com/whiteboards/alex_chen_consistent_hashing.png",
        isArModeUsed: false,
      },
    });
  } else {
    session = await prisma.practiceSession.update({
      where: { id: session.id },
      data: {
        topicId: kvTopic.id,
        durationSeconds: 840,
        status: "COMPLETED",
        diagramJson: { nodes: 12, ringPartitions: 1024, vnodes: 256 },
        architectureNotes: "Walked through consistent hashing ring, MD5/MurmurHash3 distribution, virtual node scaling factor, cascade failure mitigation.",
      },
    });
  }
  console.log(`   ✅ Practice Session ready: ${session.id} (${session.status})`);

  // -------------------------------------------------------------
  // 7. Evaluation Report & Rubric Scores
  // -------------------------------------------------------------
  console.log("\n📊 Step 7: Seeding Multimodal Evaluation Report & Rubric Scores...");
  const sampleEval = demoData.sampleEvaluation;

  let report = await prisma.evaluationReport.findUnique({
    where: { practiceId: session.id },
  });

  if (report) {
    await prisma.rubricScore.deleteMany({ where: { reportId: report.id } });
    await prisma.evaluationReport.delete({ where: { id: report.id } });
  }

  report = await prisma.evaluationReport.create({
    data: {
      practiceId: session.id,
      candidateId: candidateProfile.id,
      title: "Sarah AI System Design Evaluation: Consistent Hashing",
      evaluatorName: sampleEval.evaluatorName,
      evaluatorRole: sampleEval.evaluatorRole,
      overallScore: sampleEval.overallScore,
      verdict: sampleEval.verdict,
      percentileRank: sampleEval.percentileRank,
      priorReadinessScore: sampleEval.priorReadinessScore,
      newReadinessScore: sampleEval.newReadinessScore,
      readinessDelta: sampleEval.readinessDelta,
      onsiteRecommendation: sampleEval.onsiteRecommendation,
      targetCompanyTier: sampleEval.targetCompanyTier,
      evaluatorNotes: sampleEval.evaluatorNotes,
      strengths: sampleEval.strengths,
      improvements: sampleEval.improvements,
      rubricScores: {
        create: sampleEval.rubricScores.map((r) => ({
          dimension: r.dimension,
          ratingLabel: r.ratingLabel,
          score: r.score,
          assessment: r.assessment,
          missingAtoms: r.missingAtoms,
        })),
      },
    },
  });
  console.log(`   ✅ Evaluation Report ready: ${report.id} (${report.verdict}, ${report.overallScore}/100, +${report.readinessDelta}%)`);

  // -------------------------------------------------------------
  // 8. Candidate Topic Mastery
  // -------------------------------------------------------------
  console.log("\n🧠 Step 8: Seeding Candidate Topic Mastery...");
  const mastery = await prisma.candidateTopicMastery.upsert({
    where: {
      candidateId_topicId: {
        candidateId: candidateProfile.id,
        topicId: kvTopic.id,
      },
    },
    update: {
      masteryScore: 82.0,
      status: "PRACTICED",
      cognitiveStage: "TRADE_OFFS",
      totalAttempts: 1,
      lastPracticedAt: new Date(Date.now() - 2 * 86400 * 1000),
      intervalDays: 3.0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() + 1 * 86400 * 1000),
      avgTechnicalDepth: 8.5,
      avgTradeoffs: 9.0,
      avgDataModeling: 7.5,
      avgScalability: 8.0,
    },
    create: {
      candidateId: candidateProfile.id,
      topicId: kvTopic.id,
      masteryScore: 82.0,
      status: "PRACTICED",
      cognitiveStage: "TRADE_OFFS",
      totalAttempts: 1,
      lastPracticedAt: new Date(Date.now() - 2 * 86400 * 1000),
      intervalDays: 3.0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() + 1 * 86400 * 1000),
      avgTechnicalDepth: 8.5,
      avgTradeoffs: 9.0,
      avgDataModeling: 7.5,
      avgScalability: 8.0,
    },
  });
  console.log(`   ✅ Topic Mastery ready: Distributed Key-Value Store (Score: ${mastery.masteryScore}%, Stage: ${mastery.cognitiveStage})`);

  // -------------------------------------------------------------
  // 9. Revision Items (SM-2 Spaced Repetition Queue)
  // -------------------------------------------------------------
  console.log("\n🔁 Step 9: Seeding Revision Items (SM-2 Spaced Repetition)...");
  await prisma.revisionItem.deleteMany({
    where: { candidateId: candidateProfile.id },
  });

  for (const item of demoData.revisionItems) {
    const revTopic = await prisma.curriculumTopic.findUnique({
      where: { slug: item.topicSlug },
    });

    if (revTopic) {
      await prisma.revisionItem.create({
        data: {
          candidateId: candidateProfile.id,
          topicId: revTopic.id,
          topicTitle: item.topicTitle,
          domain: item.domain,
          recallStrength: item.recallStrength,
          retentionBand: item.retentionBand,
          relevance: "HIGH",
          recommendedMin: 15,
          intervalDays: item.intervalDays,
          easeFactor: item.easeFactor,
          repetitions: item.repetitions,
          nextReviewDate: new Date(Date.now() + item.intervalDays * 86400 * 1000),
        },
      });
      console.log(`   - Revision item queued: ${item.topicTitle} [${item.retentionBand}] (Recall: ${item.recallStrength}%)`);
    } else {
      console.warn(`   ⚠️ Warning: Revision topic slug not found: ${item.topicSlug}`);
    }
  }

  // -------------------------------------------------------------
  // 10. Candidate Topic Proficiencies & Weekly Snapshot
  // -------------------------------------------------------------
  console.log("\n📈 Step 10: Seeding Candidate Topic Proficiencies & Weekly Snapshot...");
  await prisma.candidateTopicProficiency.upsert({
    where: {
      candidateId_topicSlug: {
        candidateId: candidateProfile.id,
        topicSlug: "distributed-key-value-store",
      },
    },
    update: {
      currentProficiency: "ADVANCED",
      targetProficiency: "EXPERT",
      confidenceScore: 0.82,
      lastAssessedAt: new Date(),
      assessmentSource: "AI_MOCK_INTERVIEW",
    },
    create: {
      candidateId: candidateProfile.id,
      topicId: kvTopic.id,
      topicSlug: "distributed-key-value-store",
      currentProficiency: "ADVANCED",
      targetProficiency: "EXPERT",
      confidenceScore: 0.82,
      lastAssessedAt: new Date(),
      assessmentSource: "AI_MOCK_INTERVIEW",
    },
  });

  const kafkaTopic = await prisma.curriculumTopic.findUnique({
    where: { slug: "kafka-event-streaming" },
  });

  if (kafkaTopic) {
    await prisma.candidateTopicProficiency.upsert({
      where: {
        candidateId_topicSlug: {
          candidateId: candidateProfile.id,
          topicSlug: "kafka-event-streaming",
        },
      },
      update: {
        currentProficiency: "INTERMEDIATE",
        targetProficiency: "ADVANCED",
        confidenceScore: 0.65,
        lastAssessedAt: new Date(),
        assessmentSource: "RESUME_ANALYSIS",
      },
      create: {
        candidateId: candidateProfile.id,
        topicId: kafkaTopic.id,
        topicSlug: "kafka-event-streaming",
        currentProficiency: "INTERMEDIATE",
        targetProficiency: "ADVANCED",
        confidenceScore: 0.65,
        lastAssessedAt: new Date(),
        assessmentSource: "RESUME_ANALYSIS",
      },
    });
  }

  const weekStartDate = new Date(Date.now() - 7 * 86400 * 1000);
  await prisma.weeklyAreaSnapshot.upsert({
    where: {
      candidateId_domainSlug_weekNumber: {
        candidateId: candidateProfile.id,
        domainSlug: "system-design",
        weekNumber: 1,
      },
    },
    update: {
      readinessPercent: 68,
      deltaPercent: 6,
      sessionsCompleted: 2,
      minutesPracticed: 35,
    },
    create: {
      candidateId: candidateProfile.id,
      domainSlug: "system-design",
      weekNumber: 1,
      weekStartDate: weekStartDate,
      readinessPercent: 68,
      deltaPercent: 6,
      sessionsCompleted: 2,
      minutesPracticed: 35,
    },
  });
  console.log("   ✅ Topic proficiencies and Weekly Snapshot seeded.");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n==================================================================");
  console.log(`✨ Golden Demo Candidate Seeding Complete in ${elapsed}s`);
  console.log("==================================================================");
}

seedDemoCandidate()
  .catch((e) => {
    console.error("❌ Golden Demo Candidate Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getDb();
    await prisma.$disconnect();
  });
