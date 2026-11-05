import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";

async function wipeAndInitializeNeo4j() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Neo4j Controlled Wipe & Schema Init          ");
  console.log("=================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    console.log("1. Wiping all existing nodes and relationships...");
    const deleteRes = await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);
    console.log("   ✓ Database completely cleaned.");

    console.log("2. Setting up schema constraints and indexes...");
    await session.run(`
      CREATE CONSTRAINT domain_slug_unique IF NOT EXISTS
      FOR (d:Domain) REQUIRE d.slug IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT category_slug_unique IF NOT EXISTS
      FOR (c:Category) REQUIRE c.slug IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT topic_slug_unique IF NOT EXISTS
      FOR (t:Topic) REQUIRE t.slug IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT question_id_unique IF NOT EXISTS
      FOR (q:Question) REQUIRE q.id IS UNIQUE
    `);

    await session.run(`
      CREATE INDEX topic_priority_idx IF NOT EXISTS
      FOR (t:Topic) ON (t.priority)
    `);

    await session.run(`
      CREATE INDEX topic_pillar_idx IF NOT EXISTS
      FOR (t:Topic) ON (t.pillar)
    `);

    await session.run(`
      CREATE INDEX question_difficulty_idx IF NOT EXISTS
      FOR (q:Question) ON (q.difficulty)
    `);

    console.log("   ✓ Constraints and indexes applied successfully.");

    const countRes = await session.run("MATCH (n) RETURN count(n) AS total");
    console.log(`\nVerified node count after wipe: ${countRes.records[0].get("total")}`);
    console.log("\n✓ Neo4j is now clean, indexed, and ready for fresh System Design feeding.\n");
  } catch (error) {
    console.error("Wipe and init failed:", error);
    process.exit(1);
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

wipeAndInitializeNeo4j();

