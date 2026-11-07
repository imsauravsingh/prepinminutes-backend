import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';
import { SYSTEM_DESIGN_CATEGORIES } from './seed-data/system-design/categories';
import { PILLAR_1_TOPICS } from './seed-data/system-design/pillar-1-fundamentals';
import { buildComplete20QuestionsForTopic } from './seed-data/system-design/question-generator';
import { TopicSeed, QuestionSeed } from './seed-data/system-design/types';

async function seedIncrementalTopics() {
  const startTime = Date.now();
  console.log('🚀 Starting Incremental Neo4j Sync for System Design v5.0 (FND014–FND021)...');

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 1. Identify the 8 new topics
    const NEW_TOPIC_IDS = ['FND014', 'FND015', 'FND016', 'FND017', 'FND018', 'FND019', 'FND020', 'FND021'];
    const newTopics: TopicSeed[] = PILLAR_1_TOPICS.filter(t => NEW_TOPIC_IDS.includes(t.topicId));

    console.log(`📦 Loaded ${newTopics.length} new topics to incrementally sync: ${newTopics.map(t => t.topicId).join(', ')}`);

    // 2. Update Categories (ensures security-fundamentals is created and sortOrders are aligned)
    console.log('🌱 Step 1: Merging Category Nodes & (Domain)-[:CONTAINS]->(Category)...');
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

    // 3. Merging the 8 new Topics
    console.log('🌱 Step 2: Merging 8 New Topic Nodes & (Category)-[:HAS_TOPIC]->(Topic)...');
    const topicParams = newTopics.map(t => ({
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

    // 4. Generate & Insert 160 Questions (20 per new topic)
    console.log('🌱 Step 3: Generating & Merging 160 Questions (20 per new topic)...');
    const newQuestions: Array<QuestionSeed & { topicSlug: string }> = [];

    for (const topic of newTopics) {
      const questions20 = buildComplete20QuestionsForTopic(topic);
      for (const q of questions20) {
        newQuestions.push({
          ...q,
          topicSlug: topic.slug
        });
      }
    }

    console.log(`📝 Total questions prepared: ${newQuestions.length}. Batching into Neo4j in chunks...`);
    const CHUNK_SIZE = 100;
    for (let i = 0; i < newQuestions.length; i += CHUNK_SIZE) {
      const chunk = newQuestions.slice(i, i + CHUNK_SIZE).map(q => ({
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
      console.log(`   Processed questions ${i + 1} to ${Math.min(i + CHUNK_SIZE, newQuestions.length)}`);
    }

    // 5. Connect Prerequisite Relationships for New Topics
    console.log('🌱 Step 4: Connecting Prerequisite Relationships...');
    const prereqEdges: Array<{ from: string; to: string }> = [];
    newTopics.forEach(t => {
      (t.prerequisites || []).forEach(p => prereqEdges.push({ from: p, to: t.slug }));
    });

    console.log(`   Creating ${prereqEdges.length} new [:PREREQUISITE_OF] edges...`);
    await session.run(
      `
      UNWIND $edges AS edge
      MATCH (from:Topic {slug: edge.from})
      MATCH (to:Topic {slug: edge.to})
      MERGE (from)-[:PREREQUISITE_OF]->(to)
      `,
      { edges: prereqEdges }
    );

    // 6. Update Domain Root Node Counts
    console.log('🌱 Step 5: Updating Domain Root Node Counts (62 topics, 1240 questions)...');
    await session.run(`
      MATCH (d:Domain {slug: "system-design"})
      SET d.categoryCount = 17,
          d.topicCount = 62,
          d.questionCount = 1240,
          d.version = "5.1.0",
          d.updatedAt = datetime()
    `);

    // 7. Graph Verification & Statistics
    console.log('🔍 Step 6: Verifying Seeded Graph Structure in Neo4j...');
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
    console.log(`   Total PREREQUISITE_OF edges: ${relRec.get('prereqs')}`);
    console.log(`   Total USES_COMPONENT edges:   ${relRec.get('uses')}`);
    console.log(`   Total FOUNDED_ON edges:       ${relRec.get('founded')}`);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Incremental sync completed cleanly in ${durationSec}s!`);

  } catch (error) {
    console.error('❌ Failed incremental sync:', error);
    throw error;
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

seedIncrementalTopics()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

