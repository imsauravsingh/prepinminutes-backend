import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";

async function backupNeo4jDatabase() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Neo4j Full Database Safety Snapshot          ");
  console.log("=================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    console.log("1. Fetching all Nodes...");
    const nodesRes = await session.run(`
      MATCH (n)
      RETURN id(n) AS id, labels(n) AS labels, properties(n) AS properties
    `);

    const nodes = nodesRes.records.map((r) => ({
      id: r.get("id").toNumber ? r.get("id").toNumber() : r.get("id"),
      labels: r.get("labels"),
      properties: r.get("properties")
    }));
    console.log(`   ✓ Exported ${nodes.length} nodes.`);

    console.log("2. Fetching all Relationships...");
    const relsRes = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN id(r) AS id, type(r) AS type, properties(r) AS properties,
             id(a) AS startNodeId, id(b) AS endNodeId
    `);

    const relationships = relsRes.records.map((r) => ({
      id: r.get("id").toNumber ? r.get("id").toNumber() : r.get("id"),
      type: r.get("type"),
      properties: r.get("properties"),
      startNodeId: r.get("startNodeId").toNumber ? r.get("startNodeId").toNumber() : r.get("startNodeId"),
      endNodeId: r.get("endNodeId").toNumber ? r.get("endNodeId").toNumber() : r.get("endNodeId")
    }));
    console.log(`   ✓ Exported ${relationships.length} relationships.`);

    const backupData = {
      timestamp: new Date().toISOString(),
      nodeCount: nodes.length,
      relationshipCount: relationships.length,
      nodes,
      relationships
    };

    const backupFile = path.resolve(__dirname, "../backups/neo4j-backup-2026-11-05.json");
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2), "utf-8");
    console.log(`\n✓ SUCCESS: Complete Neo4j backup saved to: ${backupFile}\n`);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  } finally {
    await session.close();
    await closeNeo4jDriver();
  }
}

backupNeo4jDatabase();

