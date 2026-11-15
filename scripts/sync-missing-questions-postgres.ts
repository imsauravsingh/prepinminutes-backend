/**
 * PrepInMinutes — Sync Full 20 Questions for System Design & AI System Design into PostgreSQL
 *
 * Fills the question delta:
 * - System Design: 62 topics * 20 questions = 1,240 questions
 * - AI System Design: 28 topics * 20 questions = 560 questions
 *
 * Target: Brings total PostgreSQL questions from 5,718 to 7,420 (100% Neo4j parity).
 */

import "dotenv/config";
import { getDb } from "../src/server/db/client";

// Import System Design datasets and generator
import { PILLAR_1_TOPICS } from "./seed-data/system-design/pillar-1-fundamentals";
import { PILLAR_2_TOPICS } from "./seed-data/system-design/pillar-2-components";
import { PILLAR_3_TOPICS } from "./seed-data/system-design/pillar-3-case-studies";
import { buildComplete20QuestionsForTopic } from "./seed-data/system-design/question-generator";

// Import AI System Design datasets and generator
import { PILLAR_1_PRINCIPLES } from "./seed-data/ai-system-design/pillar-1-principles";
import { PILLAR_2_COMPONENTS } from "./seed-data/ai-system-design/pillar-2-components";
import { PILLAR_3_CASE_STUDIES } from "./seed-data/ai-system-design/pillar-3-case-studies";
import { buildComplete20QuestionsForAITopic } from "./seed-data/ai-system-design/question-generator";

async function syncQuestions() {
  const prisma = getDb();

  console.log("==================================================================");
  console.log("🚀 SYNCING SYSTEM DESIGN & AI SYSTEM DESIGN 20 QUESTIONS TO POSTGRESQL");
  console.log("==================================================================\n");

  const allSystemDesignTopics = [
    ...PILLAR_1_TOPICS,
    ...PILLAR_2_TOPICS,
    ...PILLAR_3_TOPICS,
  ];

  const allAITopics = [
    ...PILLAR_1_PRINCIPLES,
    ...PILLAR_2_COMPONENTS,
    ...PILLAR_3_CASE_STUDIES,
  ];

  let sdInserted = 0;
  let aiInserted = 0;

  // 1. Sync System Design Topics (62 topics * 20 questions = 1,240 questions)
  console.log(`📦 1. Processing ${allSystemDesignTopics.length} System Design Topics...`);
  for (const topicData of allSystemDesignTopics) {
    const dbTopic = await prisma.curriculumTopic.findUnique({
      where: { slug: topicData.slug },
    });

    if (!dbTopic) {
      console.warn(`   ⚠️ Topic not found in DB: ${topicData.slug}`);
      continue;
    }

    const questions20 = buildComplete20QuestionsForTopic(topicData);
    const batch = questions20.map((q) => ({
      id: q.id,
      topicId: dbTopic.id,
      title: q.title || topicData.title,
      prompt: q.prompt || q.title,
      targetLevel: q.learningLevel
        ? String(q.learningLevel).toLowerCase()
        : q.difficulty
          ? String(q.difficulty).toLowerCase()
          : "senior",
      hints: Array.isArray(q.hints) ? q.hints : [],
      rubricGuide: q.rubricGuide || q.prompt || "Verify architectural correctness and trade-offs.",
    }));

    const result = await prisma.curriculumQuestion.createMany({
      data: batch,
      skipDuplicates: true,
    });
    sdInserted += result.count;
  }
  console.log(`   ✅ System Design questions inserted/confirmed: ${sdInserted}`);

  // 2. Sync AI System Design Topics (28 topics * 20 questions = 560 questions)
  console.log(`\n📦 2. Processing ${allAITopics.length} AI System Design Topics...`);
  for (const topicData of allAITopics) {
    const dbTopic = await prisma.curriculumTopic.findUnique({
      where: { slug: topicData.slug },
    });

    if (!dbTopic) {
      console.warn(`   ⚠️ Topic not found in DB: ${topicData.slug}`);
      continue;
    }

    const questions20 = buildComplete20QuestionsForAITopic(topicData);
    const batch = questions20.map((q: any) => ({
      id: q.id,
      topicId: dbTopic.id,
      title: q.title || topicData.title,
      prompt: q.prompt || q.title,
      targetLevel: q.learningLevel
        ? String(q.learningLevel).toLowerCase()
        : q.difficulty
          ? String(q.difficulty).toLowerCase()
          : "senior",
      hints: Array.isArray(q.hints) ? q.hints : [],
      rubricGuide: q.rubricGuide || q.prompt || "Verify GenAI infra trade-offs.",
    }));

    const result = await prisma.curriculumQuestion.createMany({
      data: batch,
      skipDuplicates: true,
    });
    aiInserted += result.count;
  }
  console.log(`   ✅ AI System Design questions inserted/confirmed: ${aiInserted}`);

  // 3. Final Verification
  const totalQuestions = await prisma.curriculumQuestion.count();
  console.log("\n==================================================================");
  console.log(`📊 Total Curriculum Questions in PostgreSQL: ${totalQuestions} (Target: 7,420)`);
  if (totalQuestions === 7420) {
    console.log("🎉 SUCCESS: EXACT 100% QUESTION PARITY (7,420) ACHIEVED IN POSTGRESQL!");
  } else {
    console.log(`ℹ️ Current question count: ${totalQuestions}`);
  }
  console.log("==================================================================");

  await prisma.$disconnect();
}

syncQuestions().catch((err) => {
  console.error("❌ Sync error:", err);
  process.exit(1);
});
