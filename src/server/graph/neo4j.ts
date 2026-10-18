/**
 * Neo4j AuraDB Client & Knowledge Graph Connection Manager
 */
import neo4j, { Driver } from "neo4j-driver";

let driverInstance: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (driverInstance) return driverInstance;

  const uri = process.env.NEO4J_URI || "neo4j+s://22941cc5.databases.neo4j.io";
  const user = process.env.NEO4J_USERNAME || "22941cc5";
  const password = process.env.NEO4J_PASSWORD || "_PkkMISnIYLJoPjtBQne3-ILJgIASxk-CN9ESIc83sU";

  driverInstance = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionLifetime: 3 * 60 * 60 * 1000,
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000,
  });

  return driverInstance;
}

export async function closeNeo4jDriver(): Promise<void> {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}

export async function verifyNeo4jConnectivity(): Promise<{
  connected: boolean;
  address: string;
  protocolVersion: number;
  agent: string;
}> {
  const driver = getNeo4jDriver();
  const serverInfo = await driver.getServerInfo();
  return {
    connected: true,
    address: serverInfo.address || "",
    protocolVersion: serverInfo.protocolVersion ? Number(serverInfo.protocolVersion) : 0,
    agent: serverInfo.agent || "",
  };
}

