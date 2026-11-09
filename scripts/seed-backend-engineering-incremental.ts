import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { BACKEND_CATEGORIES } from './seed-data/backend-engineering/categories';
import { BACKEND_TOPICS } from './seed-data/backend-engineering/topics';
import { TopicSeed, QuestionSeed } from './seed-data/backend-engineering/types';

export async function seedBackendEngineeringDomain(dryRun = false) {
  const startTime = Date.now();
  console.log(`🚀 Starting Incremental Neo4j Sync for Backend & Runtime Engineering (backend-engineering)${dryRun ? ' [DRY RUN]' : ''}...`);

  console.log(`📦 Loaded ${BACKEND_TOPICS.length} Backend topics across ${BACKEND_CATEGORIES.length} categories.`);

  // Category validation
  const categorySlugs = new Set(BACKEND_CATEGORIES.map((c) => c.slug));
  for (const t of BACKEND_TOPICS) {
    if (!categorySlugs.has(t.categorySlug)) {
      throw new Error(`Topic ${t.slug} has invalid categorySlug: "${t.categorySlug}"`);
    }
  }
  console.log(`✅ All ${BACKEND_TOPICS.length} topics mapped to valid category slugs.`);

  // Priority distribution
  const p0Count = BACKEND_TOPICS.filter((t) => t.priority === 'P0').length;
  const p1Count = BACKEND_TOPICS.filter((t) => t.priority === 'P1').length;
  const p2Count = BACKEND_TOPICS.filter((t) => t.priority === 'P2').length;
  console.log(`🎯 Priority distribution: P0=${p0Count}, P1=${p1Count}, P2=${p2Count} (Total=${BACKEND_TOPICS.length})`);

  // Language & Tier distribution
  const langCounts = new Map<string, number>();
  for (const t of BACKEND_TOPICS) {
    langCounts.set(t.lang, (langCounts.get(t.lang) || 0) + 1);
  }
  console.log(`🌐 Language breakdown:`);
  for (const [lang, count] of langCounts.entries()) {
    console.log(`   - ${lang}: ${count} topics`);
  }

  // Verify graph integrity (Acyclic DAG & Reference validity)
  const allTopicSlugs = new Set(BACKEND_TOPICS.map((t) => t.slug));
  let brokenPrereqs = 0;

  for (const t of BACKEND_TOPICS) {
    for (const p of t.prerequisites || []) {
      if (!allTopicSlugs.has(p)) {
        console.error(`❌ Broken prerequisite: ${t.slug} -> ${p}`);
        brokenPrereqs++;
      }
    }
  }

  if (brokenPrereqs > 0) {
    throw new Error(`Graph integrity check failed! Broken prereqs=${brokenPrereqs}`);
  }
  console.log('✅ Graph integrity check passed: 0 broken cross-references.');

  // Cycle check for PREREQUISITE_OF DAG
  const adj = new Map<string, string[]>();
  for (const t of BACKEND_TOPICS) adj.set(t.slug, []);
  for (const t of BACKEND_TOPICS) {
    for (const p of t.prerequisites || []) {
      adj.get(p)?.push(t.slug);
    }
  }

  const visited = new Map<string, number>(); // 0=unvisited, 1=visiting, 2=visited
  function hasCycle(node: string): boolean {
    visited.set(node, 1);
    for (const neighbor of adj.get(node) || []) {
      if (visited.get(neighbor) === 1) return true;
      if (visited.get(neighbor) === 0 && hasCycle(neighbor)) return true;
    }
    visited.set(node, 2);
    return false;
  }

  for (const t of BACKEND_TOPICS) visited.set(t.slug, 0);
  let cycleDetected = false;
  for (const t of BACKEND_TOPICS) {
    if (visited.get(t.slug) === 0 && hasCycle(t.slug)) {
      cycleDetected = true;
      console.error(`❌ Cycle detected starting at node: ${t.slug}`);
      break;
    }
  }

  if (cycleDetected) {
    throw new Error('Graph cycle check failed! Prerequisite graph must be a strict DAG.');
  }
  console.log('✅ Prerequisite DAG verified: 0 cycles detected.');

  const totalQuestions = BACKEND_TOPICS.reduce((acc, t) => acc + t.questions.length, 0);
  console.log(`📊 Total master questions ready: ${totalQuestions} (${BACKEND_TOPICS.length} topics x 20 questions).`);

  if (dryRun) {
    console.log('✨ Dry run completed successfully! No writes were performed to Neo4j.');
    return;
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 1. Merge Domain Root Node
    console.log('🌱 Step 1: Merging Domain Node (:Domain {slug: "backend-engineering"})...');
    await session.run(`
      MERGE (d:Domain {slug: "backend-engineering"})
      SET d.name = "Backend & Runtime Engineering",
          d.description = "Universal server-side systems architecture, database transaction concurrency, in-memory caching, OS multiplexing, security, and plug-and-play language runtime ecosystems.",
          d.version = "1.0.0",
          d.categoryCount = ${BACKEND_CATEGORIES.length},
          d.topicCount = ${BACKEND_TOPICS.length},
          d.questionCount = ${totalQuestions},
          d.lastVerifiedMonth = "November 2026",
          d.updatedAt = datetime()
    `);

    // 2. Merge Categories
    console.log(`🌱 Step 2: Merging ${BACKEND_CATEGORIES.length} Category Nodes & (Domain)-[:CONTAINS]->(Category)...`);
    const categoryParams = BACKEND_CATEGORIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      order: c.order,
    }));

    await session.run(
      `
      UNWIND $categories AS cat
      MERGE (c:Category {slug: cat.slug})
      SET c.name = cat.name,
          c.description = cat.description,
          c.sortOrder = cat.order,
          c.status = 'PUBLISHED',
          c.isLive = true,
          c.updatedAt = datetime()
      WITH c, cat
      MATCH (d:Domain {slug: "backend-engineering"})
      MERGE (d)-[:CONTAINS]->(c)
      `,
      { categories: categoryParams }
    );

    // 3. Merge Topics
    console.log(`🌱 Step 3: Merging ${BACKEND_TOPICS.length} Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...`);
    const topicParams = BACKEND_TOPICS.map((t) => ({
      slug: t.slug,
      topicId: t.topicId,
      title: t.title,
      categorySlug: t.categorySlug,
      lang: t.lang,
      tier: t.tier,
      stack: t.stack,
      priority: t.priority,
      difficulty: t.difficulty,
      durationMin: t.durationMin,
      frequency: t.frequency,
      weight: t.weight,
      trend: t.trend,
      description: t.description,
      rubricAtoms: t.rubricAtoms,
      targetCompanies: t.targetCompanies || [],
    }));

    await session.run(
      `
      UNWIND $topics AS top
      MERGE (t:Topic {slug: top.slug})
      SET t.topicId = top.topicId,
          t.title = top.title,
          t.lang = top.lang,
          t.tier = top.tier,
          t.stack = top.stack,
          t.priority = top.priority,
          t.difficulty = top.difficulty,
          t.durationMin = top.durationMin,
          t.frequency = top.frequency,
          t.weight = top.weight,
          t.trend = top.trend,
          t.description = top.description,
          t.rubricAtoms = top.rubricAtoms,
          t.targetCompanies = top.targetCompanies,
          t.status = 'PUBLISHED',
          t.isLive = true,
          t.updatedAt = datetime()
      WITH t, top
      MATCH (c:Category {slug: top.categorySlug})
      MERGE (c)-[:HAS_TOPIC]->(t)
      `,
      { topics: topicParams }
    );

    // 4. Merge Questions (20 per topic)
    console.log(`🌱 Step 4: Merging ${totalQuestions} Questions in batches...`);
    const allQuestions: Array<{ topicSlug: string; question: QuestionSeed }> = [];
    for (const t of BACKEND_TOPICS) {
      for (const q of t.questions) {
        allQuestions.push({ topicSlug: t.slug, question: q });
      }
    }

    const CHUNK_SIZE = 100;
    for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
      const chunk = allQuestions.slice(i, i + CHUNK_SIZE);
      await session.run(
        `
        UNWIND $chunk AS item
        MERGE (q:Question {id: item.question.id})
        SET q.title = item.question.title,
            q.lang = item.question.lang,
            q.tier = item.question.tier,
            q.difficulty = item.question.difficulty,
            q.learningLevel = item.question.learningLevel,
            q.archetype = item.question.archetype,
            q.prompt = item.question.prompt,
            q.scaleAnchor = item.question.scaleAnchor,
            q.rubricGuide = item.question.rubricGuide,
            q.rubricAtoms = item.question.rubricAtoms,
            q.hints = item.question.hints,
            q.followUpProbes = item.question.followUpProbes,
            q.expectedKeywords = item.question.expectedKeywords,
            q.antiPatterns = item.question.antiPatterns,
            q.frequencyScore = item.question.frequencyScore,
            q.companies = item.question.companies,
            q.status = 'PUBLISHED',
            q.isLive = true,
            q.updatedAt = datetime()
        WITH q, item
        MATCH (t:Topic {slug: item.topicSlug})
        MERGE (t)-[:HAS_QUESTION]->(q)
        `,
        { chunk }
      );
      console.log(`   Processed questions ${i + 1} to ${Math.min(i + CHUNK_SIZE, allQuestions.length)}`);
    }

    // 5. Connect Prerequisite Relationships
    console.log('🌱 Step 5: Connecting Prerequisite Relationships ([:PREREQUISITE_OF])...');
    const prereqEdges: Array<{ prereqSlug: string; targetSlug: string }> = [];
    for (const t of BACKEND_TOPICS) {
      for (const p of t.prerequisites || []) {
        prereqEdges.push({ prereqSlug: p, targetSlug: t.slug });
      }
    }

    if (prereqEdges.length > 0) {
      await session.run(
        `
        UNWIND $edges AS edge
        MATCH (prereq:Topic {slug: edge.prereqSlug})
        MATCH (target:Topic {slug: edge.targetSlug})
        MERGE (prereq)-[:PREREQUISITE_OF]->(target)
        `,
        { edges: prereqEdges }
      );
      console.log(`   Created ${prereqEdges.length} [:PREREQUISITE_OF] edges.`);
    }

    // 6. Verify Live Stats
    console.log('🔍 Step 6: Verifying Live Graph Counts...');
    const verifyRes = await session.run(`
      MATCH (d:Domain {slug: "backend-engineering"})
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN d.name AS domain,
             count(DISTINCT c) AS categories,
             count(DISTINCT t) AS topics,
             count(DISTINCT q) AS questions
    `);

    const r = verifyRes.records[0];
    console.log(
      `🎉 LIVE AUDIT: Domain "${r.get('domain')}" -> Categories: ${r.get('categories')}, Topics: ${r.get('topics')}, Questions: ${r.get('questions')}`
    );
    console.log(`⏱️ Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seed-backend-engineering-incremental.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  seedBackendEngineeringDomain(isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during Backend Engineering seed:', err);
      process.exit(1);
    });
}

