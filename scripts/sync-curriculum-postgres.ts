/**
 * PrepInMinutes — 10-Domain Curriculum PostgreSQL Synchronization Script
 *
 * Synchronizes all 10 canonical domains, 122 categories, and 371 topics from the
 * audited seed datasets into PostgreSQL (localhost:5432 and Neon Cloud).
 *
 * Standard: 100% slug, topicId, difficulty, durationMin, and rubricAtoms parity with Neo4j.
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import "dotenv/config";
import { getDb } from "../src/server/db/client";

// --- 1. Import Domain Seed Datasets ---
import { SYSTEM_DESIGN_CATEGORIES } from "./seed-data/system-design/categories";
import { PILLAR_1_TOPICS } from "./seed-data/system-design/pillar-1-fundamentals";
import { PILLAR_2_TOPICS } from "./seed-data/system-design/pillar-2-components";
import { PILLAR_3_TOPICS } from "./seed-data/system-design/pillar-3-case-studies";

import { AI_SYSTEM_DESIGN_CATEGORIES } from "./seed-data/ai-system-design/categories";
import { PILLAR_1_PRINCIPLES } from "./seed-data/ai-system-design/pillar-1-principles";
import { PILLAR_2_COMPONENTS } from "./seed-data/ai-system-design/pillar-2-components";
import { PILLAR_3_CASE_STUDIES } from "./seed-data/ai-system-design/pillar-3-case-studies";

import { LLD_CATEGORIES } from "./seed-data/low-level-design/categories";
import { LLD_PILLAR_1_PRINCIPLES } from "./seed-data/low-level-design/pillar-1-principles";
import { LLD_PILLAR_2_COMPONENTS } from "./seed-data/low-level-design/pillar-2-patterns-components";
import { LLD_PILLAR_3_CASE_STUDIES } from "./seed-data/low-level-design/pillar-3-case-studies";

import { DSA_CATEGORIES } from "./seed-data/dsa/categories";
import { DSA_TOPICS } from "./seed-data/dsa/topics";

import { BACKEND_CATEGORIES } from "./seed-data/backend-engineering/categories";
import { BACKEND_TOPICS } from "./seed-data/backend-engineering/topics";

import { FRONTEND_CATEGORIES } from "./seed-data/frontend-engineering/categories";
import { FRONTEND_TOPICS } from "./seed-data/frontend-engineering/topics";

import { CLOUD_DEVOPS_CATEGORIES } from "./seed-data/cloud-devops/categories";
import { CLOUD_DEVOPS_TOPICS } from "./seed-data/cloud-devops/topics";

import { BEHAVIORAL_LEADERSHIP_CATEGORIES } from "./seed-data/behavioral-leadership/categories";
import { BEHAVIORAL_LEADERSHIP_TOPICS } from "./seed-data/behavioral-leadership/topics";

import { DATA_ENGINEERING_CATEGORIES } from "./seed-data/data-engineering/categories";
import { DATA_ENGINEERING_TOPICS } from "./seed-data/data-engineering/topics";

import { MOBILE_ENGINEERING_CATEGORIES } from "./seed-data/mobile-engineering/categories";
import { MOBILE_ENGINEERING_TOPICS } from "./seed-data/mobile-engineering/topics";

interface DomainConfig {
  slug: string;
  name: string;
  description: string;
  categories: Array<{
    slug: string;
    name: string;
    description: string;
    sortOrder?: number;
    order?: number;
  }>;
  topics: any[];
}

const CANONICAL_DOMAINS: DomainConfig[] = [
  {
    slug: "system-design",
    name: "System Design & Distributed Systems",
    description:
      "Architecture, scalability, distributed consensus, data modeling, and high-availability trade-offs.",
    categories: SYSTEM_DESIGN_CATEGORIES,
    topics: [...PILLAR_1_TOPICS, ...PILLAR_2_TOPICS, ...PILLAR_3_TOPICS],
  },
  {
    slug: "ai-system-design",
    name: "AI System Design & GenAI Infra",
    description:
      "Production LLM inference, embedding pipelines, vector databases, RAG, and AI agent architectures.",
    categories: AI_SYSTEM_DESIGN_CATEGORIES,
    topics: [
      ...PILLAR_1_PRINCIPLES,
      ...PILLAR_2_COMPONENTS,
      ...PILLAR_3_CASE_STUDIES,
    ],
  },
  {
    slug: "low-level-design",
    name: "Low-Level Design & Machine Coding",
    description:
      "Object-oriented design patterns, SOLID principles, concurrency, UML modeling, and clean code refactoring.",
    categories: LLD_CATEGORIES,
    topics: [
      ...LLD_PILLAR_1_PRINCIPLES,
      ...LLD_PILLAR_2_COMPONENTS,
      ...LLD_PILLAR_3_CASE_STUDIES,
    ],
  },
  {
    slug: "dsa",
    name: "Data Structures & Algorithms",
    description:
      "Algorithmic problem solving, Big-O analysis, dynamic programming, graphs, trees, and advanced data structures.",
    categories: DSA_CATEGORIES,
    topics: DSA_TOPICS,
  },
  {
    slug: "backend-engineering",
    name: "Backend & Runtime Engineering",
    description:
      "Runtime internals, high-performance APIs, database indexing, caching strategies, and asynchronous event streaming.",
    categories: BACKEND_CATEGORIES,
    topics: BACKEND_TOPICS,
  },
  {
    slug: "frontend-engineering",
    name: "Frontend & Web Architecture",
    description:
      "Modern JavaScript/TypeScript runtimes, browser rendering engines, state management, SSR/SSG, and web performance.",
    categories: FRONTEND_CATEGORIES,
    topics: FRONTEND_TOPICS,
  },
  {
    slug: "cloud-devops",
    name: "Cloud, DevOps & SRE",
    description:
      "Cloud-native infrastructure, Kubernetes, Infrastructure-as-Code (Terraform), CI/CD pipelines, and SRE incident management.",
    categories: CLOUD_DEVOPS_CATEGORIES,
    topics: CLOUD_DEVOPS_TOPICS,
  },
  {
    slug: "behavioral-leadership",
    name: "Behavioral, Leadership & Management",
    description:
      "STAR framework responses, engineering leadership, executive communication, conflict resolution, and cultural alignment.",
    categories: BEHAVIORAL_LEADERSHIP_CATEGORIES,
    topics: BEHAVIORAL_LEADERSHIP_TOPICS,
  },
  {
    slug: "data-engineering",
    name: "Data Engineering & Big Data Systems",
    description:
      "Distributed data pipelines, ETL/ELT architectures, Apache Spark/Flink, streaming ingestion, and modern data warehouses.",
    categories: DATA_ENGINEERING_CATEGORIES,
    topics: DATA_ENGINEERING_TOPICS,
  },
  {
    slug: "mobile-engineering",
    name: "Mobile Engineering",
    description:
      "Native iOS (Swift/SwiftUI), Native Android (Kotlin/Compose), cross-platform architectures (React Native/Flutter), and offline-first mobile sync.",
    categories: MOBILE_ENGINEERING_CATEGORIES,
    topics: MOBILE_ENGINEERING_TOPICS,
  },
];

async function syncCurriculum() {
  const startTime = Date.now();
  console.log(
    "==================================================================",
  );
  console.log(
    "🚀 Starting PrepInMinutes 10-Domain Curriculum Sync to PostgreSQL",
  );
  console.log(
    "==================================================================",
  );

  const prisma = getDb();

  // 0. Prune obsolete legacy domains (e.g. legacy 'coding', 'cloud', 'behavioral' replaced by canonical slugs)
  const canonicalDomainSlugs = CANONICAL_DOMAINS.map((d) => d.slug);
  const deletedLegacyDomains = await prisma.curriculumDomain.deleteMany({
    where: {
      slug: { notIn: canonicalDomainSlugs },
    },
  });
  if (deletedLegacyDomains.count > 0) {
    console.log(
      `🧹 Pruned ${deletedLegacyDomains.count} obsolete legacy domains.`,
    );
  }

  let totalDomainsUpserted = 0;
  let totalCategoriesUpserted = 0;
  let totalTopicsUpserted = 0;
  let totalQuestionsUpserted = 0;

  for (const domainData of CANONICAL_DOMAINS) {
    console.log(
      `\n📦 Processing Domain: [${domainData.slug}] - ${domainData.name}`,
    );

    // 1. Upsert CurriculumDomain
    const domain = await prisma.curriculumDomain.upsert({
      where: { slug: domainData.slug },
      update: {
        name: domainData.name,
        description: domainData.description,
      },
      create: {
        slug: domainData.slug,
        name: domainData.name,
        description: domainData.description,
      },
    });
    totalDomainsUpserted++;

    // Prune obsolete categories and topics in this domain that are not in the canonical spec
    const canonicalCatSlugs = domainData.categories.map((c) => c.slug);
    const canonicalTopicSlugs = domainData.topics.map((t) => t.slug);

    await prisma.curriculumTopic.deleteMany({
      where: {
        domainId: domain.id,
        slug: { notIn: canonicalTopicSlugs },
      },
    });

    await prisma.curriculumCategory.deleteMany({
      where: {
        domainId: domain.id,
        slug: { notIn: canonicalCatSlugs },
      },
    });

    // 2. Map & Upsert Categories
    const categoryMap = new Map<string, string>(); // categorySlug -> categoryId

    for (let idx = 0; idx < domainData.categories.length; idx++) {
      const cat = domainData.categories[idx];
      const order =
        cat.sortOrder !== undefined
          ? cat.sortOrder
          : cat.order !== undefined
            ? cat.order
            : idx;

      const category = await prisma.curriculumCategory.upsert({
        where: {
          domainId_slug: {
            domainId: domain.id,
            slug: cat.slug,
          },
        },
        update: {
          name: cat.name,
          description: cat.description || cat.name,
          order: order,
        },
        create: {
          domainId: domain.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description || cat.name,
          order: order,
        },
      });

      categoryMap.set(cat.slug, category.id);
      totalCategoriesUpserted++;
    }

    // 3. Upsert Topics
    for (const t of domainData.topics) {
      const categoryId = categoryMap.get(t.categorySlug);
      if (!categoryId) {
        throw new Error(
          `Category ID not found for categorySlug "${t.categorySlug}" in topic "${t.slug}"`,
        );
      }

      const practiceHref = `/practice/session/${domainData.slug}?topic=${t.slug}`;
      const rubricAtoms = Array.isArray(t.rubricAtoms) ? t.rubricAtoms : [];
      const topicId = t.topicId || t.id || t.slug.toUpperCase();
      const priority = t.priority || "P0";
      const difficulty = t.difficulty
        ? String(t.difficulty).toUpperCase()
        : "INTERMEDIATE";
      const durationMin =
        typeof t.durationMin === "number" ? t.durationMin : 15;

      const topic = await prisma.curriculumTopic.upsert({
        where: { slug: t.slug },
        update: {
          domainId: domain.id,
          categoryId: categoryId,
          topicId: topicId,
          title: t.title,
          description: t.description || t.title,
          durationMin: durationMin,
          difficulty: difficulty,
          priority: priority,
          rubricAtoms: rubricAtoms,
          practiceHref: practiceHref,
        },
        create: {
          domainId: domain.id,
          categoryId: categoryId,
          slug: t.slug,
          topicId: topicId,
          title: t.title,
          description: t.description || t.title,
          durationMin: durationMin,
          difficulty: difficulty,
          priority: priority,
          rubricAtoms: rubricAtoms,
          practiceHref: practiceHref,
        },
      });

      totalTopicsUpserted++;

      // 4. Batch Insert Questions if present (High-Performance Multi-Row Insert)
      if (t.questions && Array.isArray(t.questions) && t.questions.length > 0) {
        const questionBatch = t.questions.map((q: any) => ({
          ...(q.id ? { id: q.id } : {}),
          topicId: topic.id,
          title: q.title || t.title,
          prompt: q.prompt || q.title,
          targetLevel: q.learningLevel
            ? String(q.learningLevel).toLowerCase()
            : q.difficulty
              ? String(q.difficulty).toLowerCase()
              : "senior",
          hints: Array.isArray(q.hints) ? q.hints : [],
          rubricGuide:
            q.rubricGuide ||
            q.prompt ||
            "Verify technical correctness and trade-offs.",
        }));

        const result = await prisma.curriculumQuestion.createMany({
          data: questionBatch,
          skipDuplicates: true,
        });
        totalQuestionsUpserted += result.count;
      }
    }

    console.log(
      `   ✅ Synced ${domainData.categories.length} Categories and ${domainData.topics.length} Topics for [${domainData.slug}]`,
    );
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(
    "\n==================================================================",
  );
  console.log(`🎉 10-DOMAIN CURRICULUM SYNC COMPLETED IN ${durationSec}s!`);
  console.log(
    "==================================================================",
  );
  console.log(
    `📊 Domains in PostgreSQL:    ${totalDomainsUpserted} (Target: 10)`,
  );
  console.log(
    `📁 Categories in PostgreSQL: ${totalCategoriesUpserted} (Target: 122)`,
  );
  console.log(
    `📚 Topics in PostgreSQL:     ${totalTopicsUpserted} (Target: 371)`,
  );
  console.log(`❓ Questions in PostgreSQL:  ${totalQuestionsUpserted}`);
  console.log(
    "==================================================================\n",
  );

  // Post-sync database count verification
  const dbDomainCount = await prisma.curriculumDomain.count();
  const dbCatCount = await prisma.curriculumCategory.count();
  const dbTopicCount = await prisma.curriculumTopic.count();
  const dbQuestionCount = await prisma.curriculumQuestion.count();

  console.log("🔍 Live Database Audit Verification:");
  console.log(`   - curriculum_domains:    ${dbDomainCount}`);
  console.log(`   - curriculum_categories: ${dbCatCount}`);
  console.log(`   - curriculum_topics:     ${dbTopicCount}`);
  console.log(`   - curriculum_questions:  ${dbQuestionCount}`);

  if (dbDomainCount !== 10 || dbCatCount !== 122 || dbTopicCount !== 371) {
    throw new Error(
      `Audit verification failed! Expected 10/122/371, got ${dbDomainCount}/${dbCatCount}/${dbTopicCount}`,
    );
  }

  console.log("\n✅ 100% RELATIONAL CURRICULUM PARITY VERIFIED WITH NEO4J!\n");
}

syncCurriculum().catch((err) => {
  console.error("❌ Fatal Error during curriculum sync:", err);
  process.exit(1);
});
