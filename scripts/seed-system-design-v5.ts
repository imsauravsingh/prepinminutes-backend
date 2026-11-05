import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { SYSTEM_DESIGN_CATEGORIES } from './seed-data/system-design/categories';
import { PILLAR_1_TOPICS } from './seed-data/system-design/pillar-1-fundamentals';
import { PILLAR_2_TOPICS } from './seed-data/system-design/pillar-2-components';
import { PILLAR_3_TOPICS } from './seed-data/system-design/pillar-3-case-studies';
import { buildComplete20QuestionsForTopic } from './seed-data/system-design/question-generator';
import { TopicSeed, QuestionSeed } from './seed-data/system-design/types';

async function seedSystemDesignDomain() {
  const startTime = Date.now();
  console.log('🚀 Starting PrepInMinutes System Design Knowledge Graph Seeding (v5)...');

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const allTopics: TopicSeed[] = [
      ...PILLAR_1_TOPICS,
      ...PILLAR_2_TOPICS,
      ...PILLAR_3_TOPICS
    ];

    console.log(`📦 Loaded ${SYSTEM_DESIGN_CATEGORIES.length} Categories and ${allTopics.length} Topics across 3 Pillars.`);

    // 0. Pre-cleaning legacy questions and cross-topic edges to guarantee zero duplicates
    console.log('🧹 Step 0: Cleaning prior questions and cross-topic edges for non-duplicated sync...');
    await session.run(`
      MATCH (q:Question) DETACH DELETE q
    `);
    await session.run(`
      MATCH ()-[r:PREREQUISITE_OF|USES_COMPONENT|FOUNDED_ON]->() DELETE r
    `);

    // 1. Create System Design Domain
    console.log('🌱 Step 1: Merging Domain Node (system-design)...');
    await session.run(`
      MERGE (d:Domain {slug: "system-design"})
      SET d.name = "System Design",
          d.description = "Classical distributed systems, high-availability architecture, caching, data modeling, and end-to-end production case studies.",
          d.pillarCount = 3,
          d.categoryCount = 16,
          d.topicCount = 54,
          d.questionCount = 1080,
          d.version = "5.0.0",
          d.updatedAt = datetime()
    `);

    // 2. Batch Insert Categories
    console.log('🌱 Step 2: Merging 16 Category Nodes & (Domain)-[:CONTAINS]->(Category)...');
    const categoryParams = SYSTEM_DESIGN_CATEGORIES.map(c => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      pillar: c.pillar,
      sortOrder: c.sortOrder
    }));

    await session.run(
      `
      UNWIND $categories AS cat
      MERGE (c:Category {slug: cat.slug})
      SET c.name = cat.name,
          c.description = cat.description,
          c.pillar = cat.pillar,
          c.sortOrder = cat.sortOrder,
          c.updatedAt = datetime()
      WITH c, cat
      MATCH (d:Domain {slug: "system-design"})
      MERGE (d)-[:CONTAINS]->(c)
      `,
      { categories: categoryParams }
    );

    // 3. Batch Insert Topics
    console.log('🌱 Step 3: Merging 50 Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...');
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
          t.updatedAt = datetime()
      WITH t, top
      MATCH (c:Category {slug: top.categorySlug})
      MERGE (c)-[:HAS_TOPIC]->(t)
      `,
      { topics: topicParams }
    );

    // 4. Generate and Batch Insert 1,000 Questions
    console.log('🌱 Step 4: Generating & Merging 1,000 Questions (20 per Topic)...');
    const allQuestions: Array<QuestionSeed & { topicSlug: string }> = [];

    for (const topic of allTopics) {
      const questions20 = buildComplete20QuestionsForTopic(topic);
      for (const q of questions20) {
        allQuestions.push({
          ...q,
          topicSlug: topic.slug
        });
      }
    }

    console.log(`📝 Total questions prepared: ${allQuestions.length}. Batching into Neo4j in chunks of 200...`);
    const CHUNK_SIZE = 200;
    for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
      const chunk = allQuestions.slice(i, i + CHUNK_SIZE).map(q => ({
        id: q.id,
        topicSlug: q.topicSlug,
        title: q.title,
        difficulty: q.difficulty,
        learningLevel: q.learningLevel,
        archetype: q.archetype,
        prompt: q.prompt,
        scaleAnchor: q.scaleAnchor || '',
        rubricGuide: q.rubricGuide,
        rubricAtoms: q.rubricAtoms,
        hints: q.hints,
        followUpProbes: q.followUpProbes,
        expectedKeywords: q.expectedKeywords,
        antiPatterns: q.antiPatterns || []
      }));

      await session.run(
        `
        UNWIND $questions AS q
        MERGE (qn:Question {id: q.id})
        SET qn.title = q.title,
            qn.difficulty = q.difficulty,
            qn.learningLevel = q.learningLevel,
            qn.archetype = q.archetype,
            qn.prompt = q.prompt,
            qn.scaleAnchor = q.scaleAnchor,
            qn.rubricGuide = q.rubricGuide,
            qn.rubricAtoms = q.rubricAtoms,
            qn.hints = q.hints,
            qn.followUpProbes = q.followUpProbes,
            qn.expectedKeywords = q.expectedKeywords,
            qn.antiPatterns = q.antiPatterns,
            qn.updatedAt = datetime()
        WITH qn, q
        MATCH (t:Topic {slug: q.topicSlug})
        MERGE (t)-[:HAS_QUESTION]->(qn)
        `,
        { questions: chunk }
      );
      console.log(`   Processed questions ${i + 1} to ${Math.min(i + CHUNK_SIZE, allQuestions.length)}`);
    }

    // 5. Establish Cross-Topic Relationships
    console.log('🌱 Step 5: Creating Cross-Topic Directed Edges...');

    // 5a. PREREQUISITE_OF
    const prereqEdges: Array<{ from: string; to: string }> = [];
    allTopics.forEach(t => {
      (t.prerequisites || []).forEach(p => prereqEdges.push({ from: p, to: t.slug }));
    });

    console.log(`   Creating ${prereqEdges.length} [:PREREQUISITE_OF] edges...`);
    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (from:Topic {slug: edge.from})
      MATCH (to:Topic {slug: edge.to})
      MERGE (from)-[:PREREQUISITE_OF]->(to)
      `,
      { edges: prereqEdges }
    );

    // 5b. USES_COMPONENT
    const componentEdges: Array<{ from: string; to: string }> = [];
    allTopics.forEach(t => {
      (t.usedComponents || []).forEach(c => componentEdges.push({ from: t.slug, to: c }));
    });

    console.log(`   Creating ${componentEdges.length} [:USES_COMPONENT] edges...`);
    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (system:Topic {slug: edge.from})
      MATCH (component:Topic {slug: edge.to})
      MERGE (system)-[:USES_COMPONENT]->(component)
      `,
      { edges: componentEdges }
    );

    // 5c. FOUNDED_ON
    const foundedEdges: Array<{ from: string; to: string }> = [];
    allTopics.forEach(t => {
      (t.foundedOn || []).forEach(f => foundedEdges.push({ from: t.slug, to: f }));
    });

    console.log(`   Creating ${foundedEdges.length} [:FOUNDED_ON] edges...`);
    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (node:Topic {slug: edge.from})
      MATCH (principle:Topic {slug: edge.to})
      MERGE (node)-[:FOUNDED_ON]->(principle)
      `,
      { edges: foundedEdges }
    );

    // 6. Graph Verification & Statistics
    console.log('🔍 Step 6: Verifying Seeded Graph Structure...');
    const verification = await session.run(`
      MATCH (d:Domain {slug: "system-design"})
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN
        count(DISTINCT d) AS domains,
        count(DISTINCT c) AS categories,
        count(DISTINCT t) AS topics,
        count(DISTINCT q) AS questions
    `);

    const rec = verification.records[0];
    console.log('📊 Verification Summary:');
    console.log(`   Domains:    ${rec.get('domains')}`);
    console.log(`   Categories: ${rec.get('categories')}`);
    console.log(`   Topics:     ${rec.get('topics')}`);
    console.log(`   Questions:  ${rec.get('questions')}`);

    const relCounts = await session.run(`
      MATCH ()-[r:PREREQUISITE_OF]->() WITH count(r) AS prereqs
      MATCH ()-[u:USES_COMPONENT]->() WITH prereqs, count(u) AS uses
      MATCH ()-[f:FOUNDED_ON]->() WITH prereqs, uses, count(f) AS founded
      RETURN prereqs, uses, founded
    `);

    const relRec = relCounts.records[0];
    console.log(`   PREREQUISITE_OF edges: ${relRec.get('prereqs')}`);
    console.log(`   USES_COMPONENT edges:   ${relRec.get('uses')}`);
    console.log(`   FOUNDED_ON edges:       ${relRec.get('founded')}`);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ System Design knowledge graph successfully seeded in ${durationSec}s!`);

  } catch (error) {
    console.error('❌ Failed to seed System Design domain:', error);
    throw error;
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

seedSystemDesignDomain()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

