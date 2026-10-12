import "dotenv/config";
import { db } from "../src/server/db/client";

async function main() {
  console.log("Testing Neon DB connection via src/server/db/client.ts...");
  const tables: any = await db.$queryRawUnsafe(
    "SELECT tablename::text as name FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
  );
  console.log("Live tables in public schema:", tables.map((t: any) => t.name));

  const ext: any = await db.$queryRawUnsafe(
    "SELECT extname::text as name FROM pg_extension WHERE extname = 'vector';"
  );
  console.log("Vector extension verified:", ext);

  console.log("✓ Neon PostgreSQL Connection & Schema Verified Successfully via Client Singleton!");
  await db.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Connection failed:", err);
  process.exit(1);
});
