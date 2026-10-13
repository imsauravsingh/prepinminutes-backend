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
 * Resolves the candidate User record by internal `id`, `googleId` (Google SSO), or `clerkId` (Clerk).
 */
export async function withCandidateContext(candidateIdentifier: string) {
  if (!candidateIdentifier || candidateIdentifier.trim() === "") {
    throw new Error(
      "UNAUTHORIZED: Candidate context requires a valid user identifier.",
    );
  }

  const trimmed = candidateIdentifier.trim();

  const user = await db.user.findFirst({
    where: {
      OR: [
        { id: trimmed },
        { googleId: trimmed },
        { username: trimmed },
        { clerkId: trimmed },
      ],
    },
    include: { profile: true },
  });

  if (!user) {
    throw new Error(
      `NOT_FOUND: No registered candidate profile found for identifier: ${trimmed}`,
    );
  }

  return {
    userId: user.id,
    googleId: user.googleId ?? null,
    username: user.username ?? null,
    clerkId: user.clerkId,
    email: user.email,
    profile: user.profile,
  };
}

