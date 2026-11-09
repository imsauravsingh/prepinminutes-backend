import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { LLD_CATEGORIES } from './seed-data/low-level-design/categories';
import { LLD_PILLAR_1_PRINCIPLES } from './seed-data/low-level-design/pillar-1-principles';
import { LLD_PILLAR_2_COMPONENTS } from './seed-data/low-level-design/pillar-2-patterns-components';
import { LLD_PILLAR_3_CASE_STUDIES } from './seed-data/low-level-design/pillar-3-case-studies';
import { TopicSeed, QuestionSeed } from './seed-data/low-level-design/types';

export async function seedLowLevelDesignDomain(dryRun = false) {
  const startTime = Date.now();
  console.log(`🚀 Starting Incremental Neo4j Sync for Low-Level Design (low-level-design)${dryRun ? ' [DRY RUN]' : ''}...`);

  const allTopics: TopicSeed[] = [
    ...LLD_PILLAR_1_PRINCIPLES,
    ...LLD_PILLAR_2_COMPONENTS,
    ...LLD_PILLAR_3_CASE_STUDIES
  ];

  console.log(`📦 Loaded ${allTopics.length} Low-Level Design topics across 3 pillars.`);
  console.log(`   - Pillar 1 (Principles): ${LLD_PILLAR_1_PRINCIPLES.length} topics`);
  console.log(`   - Pillar 2 (Patterns & Components): ${LLD_PILLAR_2_COMPONENTS.length} topics`);
  console.log(`   - Pillar 3 (Case Studies): ${LLD_PILLAR_3_CASE_STUDIES.length} topics`);

  // Count priorities
  const p0Count = allTopics.filter(t => t.priority === 'P0').length;
  const p1Count = allTopics.filter(t => t.priority === 'P1').length;
  const p2Count = allTopics.filter(t => t.priority === 'P2').length;
  console.log(`🎯 Priority distribution: P0=${p0Count}, P1=${p1Count}, P2=${p2Count} (Total=${allTopics.length})`);

  // Verify graph integrity (Acyclic DAG & Reference validity)
  const allTopicSlugs = new Set(allTopics.map(t => t.slug));
  let brokenPrereqs = 0;
  let brokenComponents = 0;
  let brokenPrinciples = 0;

  for (const t of allTopics) {
    for (const p of t.prerequisites || []) {
      if (!allTopicSlugs.has(p)) {
        console.error(`❌ Broken prerequisite: ${t.slug} -> ${p}`);
        brokenPrereqs++;
      }
    }
    for (const c of t.usedComponents || []) {
      if (!allTopicSlugs.has(c)) {
        console.error(`❌ Broken usedComponent: ${t.slug} -> ${c}`);
        brokenComponents++;
      }
    }
    for (const pr of t.foundedOn || []) {
      if (!allTopicSlugs.has(pr)) {
        console.error(`❌ Broken foundedOn: ${t.slug} -> ${pr}`);
        brokenPrinciples++;
      }
    }
  }

  if (brokenPrereqs > 0 || brokenComponents > 0 || brokenPrinciples > 0) {
    throw new Error(`Graph integrity check failed! Broken: prereqs=${brokenPrereqs}, components=${brokenComponents}, principles=${brokenPrinciples}`);
  }
  console.log('✅ Graph integrity check passed: 0 broken cross-references.');

  // Cycle check for PREREQUISITE_OF DAG
  const adj = new Map<string, string[]>();
  for (const t of allTopics) adj.set(t.slug, []);
  for (const t of allTopics) {
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

  for (const t of allTopics) visited.set(t.slug, 0);
  let cycleDetected = false;
  for (const t of allTopics) {
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

  const totalQuestions = allTopics.reduce((acc, t) => acc + t.questions.length, 0);
  console.log(`📊 Total master questions ready: ${totalQuestions} (${allTopics.length} topics x 20 questions).`);

  if (dryRun) {
    console.log('✨ Dry run completed successfully! No writes were performed to Neo4j.');
    return;
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 1. Merge Domain Root Node
    console.log('🌱 Step 1: Merging Domain Node (:Domain {slug: "low-level-design"})...');
    await session.run(`
      MERGE (d:Domain {slug: "low-level-design"})
      SET d.name = "Low-Level Design & Machine Coding",
          d.description = "Object-Oriented Design (OOD), SOLID principles, GoF design patterns, in-process multithreaded concurrency, and machine coding case studies.",
          d.version = "1.0.0",
          d.pillarCount = 3,
          d.categoryCount = ${LLD_CATEGORIES.length},
          d.topicCount = ${allTopics.length},
          d.questionCount = ${totalQuestions},
          d.updatedAt = datetime()
    `);

    // 2. Merge Categories
    console.log(`🌱 Step 2: Merging ${LLD_CATEGORIES.length} Category Nodes & (Domain)-[:CONTAINS]->(Category)...`);
    const categoryParams = LLD_CATEGORIES.map(c => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      order: c.order
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
      MATCH (d:Domain {slug: "low-level-design"})
      MERGE (d)-[:CONTAINS]->(c)
      `,
      { categories: categoryParams }
    );

    // 3. Merge Topics
    console.log(`🌱 Step 3: Merging ${allTopics.length} Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...`);
    const topicParams = allTopics.map(t => ({
      slug: t.slug,
      topicId: t.topicId,
      title: t.title,
      categorySlug: t.categorySlug,
      pillar: t.pillar,
      priority: t.priority,
      difficulty: t.difficulty,
      durationMin: t.durationMin,
      frequency: t.frequency,
      weight: t.weight,
      trend: t.trend,
      description: t.description,
      rubricAtoms: t.rubricAtoms
    }));

    await session.run(
      `
      UNWIND $topics AS top
      MERGE (t:Topic {slug: top.slug})
      SET t.topicId = top.topicId,
          t.title = top.title,
          t.pillar = top.pillar,
          t.priority = top.priority,
          t.difficulty = top.difficulty,
          t.durationMin = top.durationMin,
          t.frequency = top.frequency,
          t.weight = top.weight,
          t.trend = top.trend,
          t.description = top.description,
          t.rubricAtoms = top.rubricAtoms,
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
    for (const t of allTopics) {
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
    for (const t of allTopics) {
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

    // 6. Connect Case Study Cross-Edges (USES_COMPONENT & FOUNDED_ON)
    console.log('🌱 Step 6: Connecting Cross-Edges ([:USES_COMPONENT], [:FOUNDED_ON])...');
    const componentEdges: Array<{ sourceSlug: string; componentSlug: string }> = [];
    const principleEdges: Array<{ sourceSlug: string; principleSlug: string }> = [];

    for (const t of allTopics) {
      for (const c of t.usedComponents || []) {
        componentEdges.push({ sourceSlug: t.slug, componentSlug: c });
      }
      for (const p of t.foundedOn || []) {
        principleEdges.push({ sourceSlug: t.slug, principleSlug: p });
      }
    }

    if (componentEdges.length > 0) {
      await session.run(
        `
        UNWIND $edges AS edge
        MATCH (source:Topic {slug: edge.sourceSlug})
        MATCH (component:Topic {slug: edge.componentSlug})
        MERGE (source)-[:USES_COMPONENT]->(component)
        `,
        { edges: componentEdges }
      );
      console.log(`   Created ${componentEdges.length} [:USES_COMPONENT] edges.`);
    }

    if (principleEdges.length > 0) {
      await session.run(
        `
        UNWIND $edges AS edge
        MATCH (source:Topic {slug: edge.sourceSlug})
        MATCH (principle:Topic {slug: edge.principleSlug})
        MERGE (source)-[:FOUNDED_ON]->(principle)
        `,
        { edges: principleEdges }
      );
      console.log(`   Created ${principleEdges.length} [:FOUNDED_ON] edges.`);
    }

    // 7. Verify Live Stats
    console.log('🔍 Step 7: Verifying Live Graph Counts...');
    const verifyRes = await session.run(`
      MATCH (d:Domain {slug: "low-level-design"})
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN d.name AS domain,
             count(DISTINCT c) AS categories,
             count(DISTINCT t) AS topics,
             count(DISTINCT q) AS questions
    `);

    const r = verifyRes.records[0];
    console.log(`🎉 LIVE AUDIT: Domain "${r.get('domain')}" -> Categories: ${r.get('categories')}, Topics: ${r.get('topics')}, Questions: ${r.get('questions')}`);
    console.log(`⏱️ Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seed-low-level-design-incremental.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  seedLowLevelDesignDomain(isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during Low-Level Design seed:', err);
      process.exit(1);
    });
}

