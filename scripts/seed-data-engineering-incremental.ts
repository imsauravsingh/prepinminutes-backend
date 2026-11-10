import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { DATA_ENGINEERING_CATEGORIES } from './seed-data/data-engineering/categories';
import { DATA_ENGINEERING_TOPICS } from './seed-data/data-engineering/topics';
import { TopicSeed, QuestionSeed } from './seed-data/data-engineering/types';

export async function seedDataEngineeringDomain(dryRun = false) {
  const startTime = Date.now();
  console.log(`🚀 Starting Incremental Neo4j Sync for Data Engineering & Big Data Systems (data-engineering)${dryRun ? ' [DRY RUN]' : ''}...`);

  console.log(`📦 Loaded ${DATA_ENGINEERING_TOPICS.length} Data Engineering topics across ${DATA_ENGINEERING_CATEGORIES.length} categories.`);

  // Category validation
  const categorySlugs = new Set(DATA_ENGINEERING_CATEGORIES.map((c) => c.slug));
  for (const t of DATA_ENGINEERING_TOPICS) {
    if (!categorySlugs.has(t.categorySlug)) {
      throw new Error(`Topic ${t.slug} has invalid categorySlug: "${t.categorySlug}"`);
    }
  }
  console.log(`✅ All ${DATA_ENGINEERING_TOPICS.length} topics mapped to valid category slugs.`);

  // Priority distribution
  const p0Count = DATA_ENGINEERING_TOPICS.filter((t) => t.priority === 'P0').length;
  const p1Count = DATA_ENGINEERING_TOPICS.filter((t) => t.priority === 'P1').length;
  const p2Count = DATA_ENGINEERING_TOPICS.filter((t) => t.priority === 'P2').length;
  console.log(`🎯 Priority distribution: P0=${p0Count}, P1=${p1Count}, P2=${p2Count} (Total=${DATA_ENGINEERING_TOPICS.length})`);

  // Verify graph integrity (Acyclic DAG & Reference validity)
  const allTopicSlugs = new Set(DATA_ENGINEERING_TOPICS.map((t) => t.slug));
  let brokenPrereqs = 0;

  for (const t of DATA_ENGINEERING_TOPICS) {
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
  for (const t of DATA_ENGINEERING_TOPICS) adj.set(t.slug, []);
  for (const t of DATA_ENGINEERING_TOPICS) {
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

  for (const t of DATA_ENGINEERING_TOPICS) visited.set(t.slug, 0);
  let cycleDetected = false;
  for (const t of DATA_ENGINEERING_TOPICS) {
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

  const totalQuestions = DATA_ENGINEERING_TOPICS.reduce((acc, t) => acc + t.questions.length, 0);
  console.log(`📊 Total master questions ready: ${totalQuestions} (${DATA_ENGINEERING_TOPICS.length} topics x 20 questions).`);

  if (dryRun) {
    console.log('✨ Dry run completed successfully! No writes were performed to Neo4j.');
    return;
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 0. Ensure Neo4j Schema Constraints
    console.log('🔒 Step 0: Enforcing Schema Uniqueness Constraints (IF NOT EXISTS)...');
    await session.run(`CREATE CONSTRAINT domain_slug_unique IF NOT EXISTS FOR (d:Domain) REQUIRE d.slug IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT category_slug_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.slug IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT topic_slug_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.slug IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT question_id_unique IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE`);

    // 1. Merge Domain Root Node
    console.log('🌱 Step 1: Merging Domain Node (:Domain {slug: "data-engineering"})...');
    await session.run(`
      MERGE (d:Domain {slug: "data-engineering"})
      SET d.name = "Data Engineering & Big Data Systems",
          d.description = "Parquet/ORC columnar storage, Apache Iceberg/Delta Lake ACID lakehouses, Apache Spark Catalyst & Tungsten optimization, Apache Kafka distributed logs, Apache Flink stateful streaming, Kimball dimensional modeling, Snowflake/BigQuery warehousing, and modern Airflow/dbt orchestration.",
          d.version = "1.0.0",
          d.categoryCount = ${DATA_ENGINEERING_CATEGORIES.length},
          d.topicCount = ${DATA_ENGINEERING_TOPICS.length},
          d.questionCount = ${totalQuestions},
          d.lastVerifiedMonth = "November 2026",
          d.updatedAt = datetime()
    `);

    // 2. Merge Categories
    console.log(`🌱 Step 2: Merging ${DATA_ENGINEERING_CATEGORIES.length} Category Nodes & (Domain)-[:CONTAINS]->(Category)...`);
    const categoryParams = DATA_ENGINEERING_CATEGORIES.map((c) => ({
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
      MATCH (d:Domain {slug: "data-engineering"})
      MERGE (d)-[:CONTAINS]->(c)
      `,
      { categories: categoryParams }
    );

    // 3. Merge Topics
    console.log(`🌱 Step 3: Merging ${DATA_ENGINEERING_TOPICS.length} Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...`);
    const topicParams = DATA_ENGINEERING_TOPICS.map((t) => ({
      slug: t.slug,
      topicId: t.topicId,
      title: t.title,
      categorySlug: t.categorySlug,
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

    // 4. Merge Questions (20 per topic = 600 questions)
    console.log(`🌱 Step 4: Merging ${totalQuestions} Questions in batches...`);
    const allQuestions: Array<{ topicSlug: string; question: QuestionSeed }> = [];
    for (const t of DATA_ENGINEERING_TOPICS) {
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
    for (const t of DATA_ENGINEERING_TOPICS) {
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
      MATCH (d:Domain {slug: "data-engineering"})
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
if (process.argv[1]?.endsWith('seed-data-engineering-incremental.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  seedDataEngineeringDomain(isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during Data Engineering seed:', err);
      process.exit(1);
    });
}

