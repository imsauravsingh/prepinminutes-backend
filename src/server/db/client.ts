import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = db;
}

/**
 * Enforces candidate tenant isolation on every downstream query.
 * Throws an unauthorized error if clerkUserId is absent or invalid.
 */
export async function withCandidateContext(clerkUserId: string) {
  if (!clerkUserId || clerkUserId.trim() === "") {
    throw new Error(
      "UNAUTHORIZED: Candidate context requires a valid Clerk user ID.",
    );
  }

  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { profile: true },
  });

  if (!user) {
    throw new Error(
      `NOT_FOUND: No registered candidate profile found for Clerk ID: ${clerkUserId}`,
    );
  }

  return {
    userId: user.id,
    clerkId: user.clerkId,
    email: user.email,
    profile: user.profile,
  };
}
