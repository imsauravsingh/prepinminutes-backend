import 'dotenv/config';
import { getNeo4jDriver, closeNeo4jDriver } from '../src/server/graph/neo4j';

async function audit() {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    console.log('📊 --- AUDITING ALL DOMAINS IN NEO4J AURADB ---');
    const domainsRes = await session.run(`
      MATCH (d:Domain)
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN d.slug AS slug,
             d.name AS name,
             count(DISTINCT c) AS categories,
             count(DISTINCT t) AS topics,
             count(DISTINCT q) AS questions
      ORDER BY slug
    `);

    let totalCats = 0;
    let totalTopics = 0;
    let totalQs = 0;

    console.table(
      domainsRes.records.map((r) => {
        const cats = r.get('categories').toNumber();
        const tops = r.get('topics').toNumber();
        const qs = r.get('questions').toNumber();
        totalCats += cats;
        totalTopics += tops;
        totalQs += qs;
        return {
          slug: r.get('slug'),
          name: r.get('name'),
          categories: cats,
          topics: tops,
          questions: qs,
        };
      })
    );

    console.log(`\n🌟 GRAND TOTALS: ${domainsRes.records.length} Domains | ${totalCats} Categories | ${totalTopics} Topics | ${totalQs} Questions\n`);

    // Check for duplicate slugs/ids globally
    console.log('🔍 Checking for any duplicate Question IDs...');
    const dupQRes = await session.run(`
      MATCH (q:Question)
      WITH q.id AS qid, count(*) AS count
      WHERE count > 1
      RETURN qid, count
    `);
    console.log(`Duplicate Questions: ${dupQRes.records.length}`);

    console.log('🔍 Checking for any duplicate Topic slugs...');
    const dupTRes = await session.run(`
      MATCH (t:Topic)
      WITH t.slug AS slug, count(*) AS count
      WHERE count > 1
      RETURN slug, count
    `);
    console.log(`Duplicate Topics: ${dupTRes.records.length}`);

    // Candidate query: Angular candidate track
    console.log('\n🎯 Testing Personalized Track: Modern Angular Candidate (Universal + Angular + TypeScript)');
    const angularTrackRes = await session.run(`
      MATCH (d:Domain {slug: "frontend-engineering"})-[:CONTAINS]->(c:Category)-[:HAS_TOPIC]->(t:Topic)
      WHERE NOT c.slug STARTS WITH 'fe-framework-' OR c.slug = 'fe-framework-angular'
      RETURN count(DISTINCT t) AS topicCount
    `);
    console.log(`Angular Candidate gets: ${angularTrackRes.records[0].get('topicCount')} Topics (Target: 25 Topics / 500 Qs)`);

  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

audit().catch(console.error);
