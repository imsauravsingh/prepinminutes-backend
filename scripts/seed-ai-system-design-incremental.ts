import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { AI_SYSTEM_DESIGN_CATEGORIES } from './seed-data/ai-system-design/categories';
import { PILLAR_1_PRINCIPLES } from './seed-data/ai-system-design/pillar-1-principles';
import { PILLAR_2_COMPONENTS } from './seed-data/ai-system-design/pillar-2-components';
import { PILLAR_3_CASE_STUDIES } from './seed-data/ai-system-design/pillar-3-case-studies';
import { buildComplete20QuestionsForAITopic } from './seed-data/ai-system-design/question-generator';
import { TopicSeed, QuestionSeed } from './seed-data/ai-system-design/types';

export async function seedAISystemDesignDomain() {
  const startTime = Date.now();
  console.log('🚀 Starting Incremental Neo4j Sync for AI System Design (ai-system-design)...');

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const allTopics: TopicSeed[] = [
      ...PILLAR_1_PRINCIPLES,
      ...PILLAR_2_COMPONENTS,
      ...PILLAR_3_CASE_STUDIES
    ];

    console.log(`📦 Loaded ${allTopics.length} AI System Design topics across 3 pillars.`);

    // 1. Merge Domain Root Node
    console.log('🌱 Step 1: Merging Domain Node (:Domain {slug: "ai-system-design"})...');
    await session.run(`
      MERGE (d:Domain {slug: "ai-system-design"})
      SET d.name = "AI System Design & Generative Infrastructure",
          d.description = "Generative AI infrastructure, high-throughput LLM serving, vector databases, GraphRAG, autonomous agents, and AI safety.",
          d.version = "2.0.0",
          d.pillarCount = 3,
          d.categoryCount = ${AI_SYSTEM_DESIGN_CATEGORIES.length},
          d.topicCount = ${allTopics.length},
          d.questionCount = ${allTopics.length * 20},
          d.updatedAt = datetime()
    `);

    // 2. Merge Categories
    console.log('🌱 Step 2: Merging Category Nodes & (Domain)-[:CONTAINS]->(Category)...');
    const categoryParams = AI_SYSTEM_DESIGN_CATEGORIES.map(c => ({
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
          c.status = 'PUBLISHED',
          c.isLive = true,
          c.updatedAt = datetime()
      WITH c, cat
      MATCH (d:Domain {slug: "ai-system-design"})
      MERGE (d)-[:CONTAINS]->(c)
      `,
      { categories: categoryParams }
    );

    // 3. Merge Topics
    console.log('🌱 Step 3: Merging 28 Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...');
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

    // 4. Merge Questions (20 per topic = 560 total)
    console.log('🌱 Step 4: Generating & Merging 560 Questions (20 per topic)...');
    const allQuestions: Array<{ topicSlug: string; question: QuestionSeed }> = [];

    for (const topic of allTopics) {
      const qs = buildComplete20QuestionsForAITopic(topic);
      for (const q of qs) {
        allQuestions.push({
          topicSlug: topic.slug,
          question: q
        });
      }
    }

    console.log(`📝 Total questions prepared: ${allQuestions.length}. Batching into Neo4j in chunks...`);
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
    console.log('🌱 Step 6: Connecting Case Study Cross-Edges ([:USES_COMPONENT], [:FOUNDED_ON])...');
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

    // 7. Verify Graph Metrics
    console.log('🔍 Step 7: Verifying Graph State in Neo4j...');
    const verifyRes = await session.run(`
      MATCH (d:Domain)
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN d.slug AS domain,
             count(DISTINCT c) AS categories,
             count(DISTINCT t) AS topics,
             count(DISTINCT q) AS questions
      ORDER BY d.slug
    `);

    console.log('\n📊 Domain Summary in Neo4j AuraDB:');
    verifyRes.records.forEach(r => {
      console.log(`   Domain: ${r.get('domain').padEnd(20)} | Categories: ${String(r.get('categories')).padStart(2)} | Topics: ${String(r.get('topics')).padStart(2)} | Questions: ${String(r.get('questions')).padStart(4)}`);
    });

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Incremental sync completed cleanly in ${durationSec}s!`);

  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

// Allow direct CLI execution if run directly
if (require.main === module) {
  seedAISystemDesignDomain().catch(err => {
    console.error('❌ Error during AI System Design sync:', err);
    process.exit(1);
  });
}

