import { getSecrets } from "../config/secrets";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (global.__prisma) return global.__prisma;
  if (prismaInstance) return prismaInstance;

  const secrets = getSecrets();
  const connectionString = secrets.DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaNeonHttp(connectionString, {});

  prismaInstance = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = prismaInstance;
  }

  return prismaInstance;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const val = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

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

