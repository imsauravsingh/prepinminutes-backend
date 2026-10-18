import "dotenv/config";
import { verifyNeo4jConnectivity, closeNeo4jDriver } from "../src/server/graph/neo4j";

async function main() {
  console.log("Connecting to Neo4j AuraDB instance...");
  console.log(`URI: ${process.env.NEO4J_URI}`);
  console.log(`User: ${process.env.NEO4J_USERNAME}`);

  try {
    const info = await verifyNeo4jConnectivity();
    console.log("\n✓ Neo4j AuraDB Connected successfully!");
    console.log(`  Address: ${info.address}`);
    console.log(`  Agent: ${info.agent}`);
    console.log(`  Protocol Version: ${info.protocolVersion}`);
  } catch (err) {
    console.error("\n✗ Connection to Neo4j failed:", err);
    process.exit(1);
  } finally {
    await closeNeo4jDriver();
  }
}

main();

