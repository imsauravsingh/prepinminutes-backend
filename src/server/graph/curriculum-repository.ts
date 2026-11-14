import { getNeo4jDriver } from "./neo4j";
import { db } from "../db/client";
import {
  DomainCatalogItem,
  CurriculumHierarchyResponse,
  CurriculumCategoryHierarchy,
  CurriculumTopicSummary,
  ICurriculumRepository,
} from "./types";

// Canonical metadata mapping for all 10 domains
export const CANONICAL_DOMAIN_METADATA: Record<
  string,
  {
    name: string;
    shortName: string;
    sortOrder: number;
    icon: string;
    colorTheme: string;
    defaultVersion: string;
    description: string;
  }
> = {
  "system-design": {
    name: "System Design & Distributed Systems",
    shortName: "System Design",
    sortOrder: 1,
    icon: "Network",
    colorTheme: "blue",
    defaultVersion: "5.1.0",
    description:
      "Classical distributed systems, high-availability architecture, caching, data modeling, and end-to-end production case studies.",
  },
  "ai-system-design": {
    name: "AI System Design & GenAI Infra",
    shortName: "AI System Design",
    sortOrder: 2,
    icon: "Cpu",
    colorTheme: "purple",
    defaultVersion: "2.0.0",
    description:
      "Production LLM inference, embedding pipelines, vector databases, RAG, and AI agent architectures.",
  },
  "low-level-design": {
    name: "Low-Level Design & Machine Coding",
    shortName: "Low-Level Design",
    sortOrder: 3,
    icon: "Boxes",
    colorTheme: "emerald",
    defaultVersion: "1.0.0",
    description:
      "Object-oriented design patterns, SOLID principles, concurrency, UML modeling, and clean code refactoring.",
  },
  dsa: {
    name: "Data Structures & Algorithms",
    shortName: "DSA",
    sortOrder: 4,
    icon: "Binary",
    colorTheme: "amber",
    defaultVersion: "1.0.0",
    description:
      "Algorithmic problem solving, Big-O analysis, dynamic programming, graphs, trees, and advanced data structures.",
  },
  "backend-engineering": {
    name: "Backend & Runtime Engineering",
    shortName: "Backend",
    sortOrder: 5,
    icon: "Server",
    colorTheme: "cyan",
    defaultVersion: "1.0.0",
    description:
      "Runtime internals, high-performance APIs, database indexing, caching strategies, and asynchronous event streaming.",
  },
  "frontend-engineering": {
    name: "Frontend & Web Architecture",
    shortName: "Frontend",
    sortOrder: 6,
    icon: "Layout",
    colorTheme: "rose",
    defaultVersion: "1.0.0",
    description:
      "Modern JavaScript/TypeScript runtimes, browser rendering engines, state management, SSR/SSG, and web performance.",
  },
  "cloud-devops": {
    name: "Cloud, DevOps & SRE",
    shortName: "Cloud & DevOps",
    sortOrder: 7,
    icon: "Cloud",
    colorTheme: "indigo",
    defaultVersion: "1.0.0",
    description:
      "Cloud-native infrastructure, Kubernetes, Infrastructure-as-Code (Terraform), CI/CD pipelines, and SRE incident management.",
  },
  "behavioral-leadership": {
    name: "Behavioral, Leadership & Management",
    shortName: "Behavioral",
    sortOrder: 8,
    icon: "Users",
    colorTheme: "orange",
    defaultVersion: "1.0.0",
    description:
      "STAR framework responses, engineering leadership, executive communication, conflict resolution, and cultural alignment.",
  },
  "data-engineering": {
    name: "Data Engineering & Big Data Systems",
    shortName: "Data Engineering",
    sortOrder: 9,
    icon: "Database",
    colorTheme: "teal",
    defaultVersion: "1.0.0",
    description:
      "Distributed data pipelines, ETL/ELT architectures, Apache Spark/Flink, streaming ingestion, and modern data warehouses.",
  },
  "mobile-engineering": {
    name: "Mobile Engineering",
    shortName: "Mobile",
    sortOrder: 10,
    icon: "Smartphone",
    colorTheme: "violet",
    defaultVersion: "1.0.0",
    description:
      "Native iOS (Swift/SwiftUI), Native Android (Kotlin/Compose), cross-platform architectures (React Native/Flutter), and offline-first mobile sync.",
  },
};

/**
 * Normalizes Neo4j integers and structured objects into standard JavaScript primitives.
 */
function sanitizeNeo4jValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeNeo4jValue);
  }
  if (typeof val === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = sanitizeNeo4jValue(v);
    }
    return res;
  }
  return val;
}

/**
 * Normalizes trend string to contract union: "SURGING" | "HOT" | "STABLE" | "COOLING"
 */
function normalizeTrend(trend?: string): "SURGING" | "HOT" | "STABLE" | "COOLING" {
  if (!trend) return "STABLE";
  const upper = trend.toUpperCase();
  if (upper === "SURGING") return "SURGING";
  if (upper === "HOT" || upper === "RISING") return "HOT";
  if (upper === "COOLING" || upper === "FALLING") return "COOLING";
  return "STABLE";
}

/**
 * Normalizes priority string to contract union: "P0" | "P1"
 */
function normalizePriority(priority?: string): "P0" | "P1" {
  if (!priority) return "P0";
  const upper = priority.toUpperCase();
  return upper === "P1" ? "P1" : "P0";
}

/**
 * Normalizes difficulty string to contract union
 */
function normalizeDifficulty(
  diff?: string
): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" {
  if (!diff) return "INTERMEDIATE";
  const upper = diff.toUpperCase();
  if (upper === "BEGINNER") return "BEGINNER";
  if (upper === "ADVANCED") return "ADVANCED";
  if (upper === "EXPERT") return "EXPERT";
  return "INTERMEDIATE";
}

// ============================================================
// 1. Primary Repository: Neo4j AuraDB (Published Knowledge Graph)
// ============================================================
export class Neo4jCurriculumRepository implements ICurriculumRepository {
  public async getDomains(): Promise<DomainCatalogItem[]> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH (d:Domain)
        OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
        OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
        OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
        WITH d,
             count(DISTINCT c) AS categoriesCount,
             count(DISTINCT t) AS topicsCount,
             count(DISTINCT q) AS questionsCount
        RETURN d.slug AS slug,
               d.name AS name,
               d.description AS description,
               coalesce(d.version, '1.0.0') AS version,
               categoriesCount,
               topicsCount,
               questionsCount
        ORDER BY d.slug ASC
      `;

      const result = await session.run(cypher);

      const items: DomainCatalogItem[] = result.records.map((r) => {
        const slug = r.get("slug") as string;
        const meta = CANONICAL_DOMAIN_METADATA[slug] || {
          name: r.get("name") as string,
          shortName: r.get("name") as string,
          sortOrder: 99,
          icon: "BookOpen",
          colorTheme: "gray",
          defaultVersion: "1.0.0",
          description: r.get("description") as string,
        };

        const categoriesCount = sanitizeNeo4jValue(r.get("categoriesCount")) || 0;
        const topicsCount = sanitizeNeo4jValue(r.get("topicsCount")) || 0;
        const questionsCount = sanitizeNeo4jValue(r.get("questionsCount")) || 0;

        return {
          slug,
          name: meta.name || (r.get("name") as string),
          shortName: meta.shortName,
          description: r.get("description") || meta.description,
          version: (r.get("version") as string) || meta.defaultVersion,
          sortOrder: meta.sortOrder,
          categoriesCount,
          topicsCount,
          questionsCount,
          icon: meta.icon,
          colorTheme: meta.colorTheme,
        };
      });

      return items.sort((a, b) => a.sortOrder - b.sortOrder);
    } finally {
      await session.close();
    }
  }

  public async getDomainHierarchy(
    domainSlug: string
  ): Promise<CurriculumHierarchyResponse | null> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH (d:Domain {slug: $domainSlug})
        OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
        OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
        OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)

        WITH d, c, t, count(q) AS questionCount
        ORDER BY c.sortOrder, t.priority, t.title

        WITH d, c, collect(CASE WHEN t IS NOT NULL THEN {
          slug: t.slug,
          topicId: coalesce(t.topicId, t.slug),
          title: t.title,
          priority: coalesce(t.priority, 'P0'),
          difficulty: coalesce(t.difficulty, 'INTERMEDIATE'),
          durationMin: coalesce(t.durationMin, 15),
          frequency: coalesce(t.frequency, 80),
          trend: coalesce(t.trend, 'STABLE'),
          rubricAtomsCount: size(coalesce(t.rubricAtoms, [])),
          questionsCount: questionCount,
          practiceHref: '/practice/session/' + d.slug + '?topic=' + t.slug
        } ELSE null END) AS rawTopics

        WITH d, c, [top IN rawTopics WHERE top IS NOT NULL] AS topics
        ORDER BY c.sortOrder

        WITH d, collect(CASE WHEN c IS NOT NULL THEN {
          slug: c.slug,
          name: c.name,
          pillar: coalesce(c.pillar, 'Core Curriculum'),
          sortOrder: coalesce(c.sortOrder, 1),
          topicsCount: size(topics),
          topics: topics
        } ELSE null END) AS rawCategories

        WITH d, [cat IN rawCategories WHERE cat IS NOT NULL] AS cleanCategories

        RETURN {
          domainSlug: d.slug,
          domainName: d.name,
          description: d.description,
          version: coalesce(d.version, '1.0.0'),
          totalCategories: size(cleanCategories),
          totalTopics: reduce(total = 0, cat IN cleanCategories | total + size(cat.topics)),
          totalQuestions: reduce(total = 0, cat IN cleanCategories | total + reduce(qCount = 0, top IN cat.topics | qCount + top.questionsCount)),
          categories: cleanCategories
        } AS domainHierarchy
      `;

      const result = await session.run(cypher, { domainSlug });
      if (result.records.length === 0) return null;

      const raw = result.records[0].get("domainHierarchy");
      if (!raw || !raw.domainSlug) return null;

      const sanitized = sanitizeNeo4jValue(raw);

      const meta = CANONICAL_DOMAIN_METADATA[domainSlug];
      const categories: CurriculumCategoryHierarchy[] = (sanitized.categories || []).map(
        (cat: any) => ({
          slug: cat.slug,
          name: cat.name,
          pillar: cat.pillar || "Core Curriculum",
          sortOrder: Number(cat.sortOrder) || 1,
          topicsCount: Number(cat.topicsCount) || (cat.topics ? cat.topics.length : 0),
          topics: (cat.topics || []).map((top: any): CurriculumTopicSummary => ({
            slug: top.slug,
            topicId: top.topicId || top.slug,
            title: top.title,
            priority: normalizePriority(top.priority),
            difficulty: normalizeDifficulty(top.difficulty),
            durationMin: Number(top.durationMin) || 15,
            frequency: typeof top.frequency === "number" ? top.frequency : 80,
            trend: normalizeTrend(top.trend),
            rubricAtomsCount: Number(top.rubricAtomsCount) || 0,
            questionsCount: Number(top.questionsCount) || 0,
            practiceHref:
              top.practiceHref || `/practice/session/${domainSlug}?topic=${top.slug}`,
          })),
        })
      );

      return {
        domainSlug: sanitized.domainSlug,
        domainName: meta?.name || sanitized.domainName,
        description: sanitized.description || meta?.description || "",
        version: sanitized.version || meta?.defaultVersion || "1.0.0",
        totalCategories: Number(sanitized.totalCategories) || categories.length,
        totalTopics:
          Number(sanitized.totalTopics) ||
          categories.reduce((acc, c) => acc + c.topicsCount, 0),
        totalQuestions:
          Number(sanitized.totalQuestions) ||
          categories.reduce(
            (acc, c) =>
              acc + c.topics.reduce((qAcc, t) => qAcc + t.questionsCount, 0),
            0
          ),
        categories,
      };
    } finally {
      await session.close();
    }
  }
}

// ============================================================
// 2. Resilient Failover: Neon PostgreSQL (1:1 Equivalent)
// ============================================================
export class PostgresCurriculumRepository implements ICurriculumRepository {
  public async getDomains(): Promise<DomainCatalogItem[]> {
    const domains = await db.curriculumDomain.findMany({
      include: {
        categories: {
          include: {
            topics: {
              include: {
                _count: { select: { questions: true } },
              },
            },
          },
        },
      },
    });

    const items: DomainCatalogItem[] = domains.map((d) => {
      const meta = CANONICAL_DOMAIN_METADATA[d.slug] || {
        name: d.name,
        shortName: d.name,
        sortOrder: 99,
        icon: "BookOpen",
        colorTheme: "gray",
        defaultVersion: "1.0.0",
        description: d.description,
      };

      const categoriesCount = d.categories.length;
      let topicsCount = 0;
      let questionsCount = 0;

      for (const cat of d.categories) {
        topicsCount += cat.topics.length;
        for (const top of cat.topics) {
          questionsCount += top._count.questions;
        }
      }

      return {
        slug: d.slug,
        name: meta.name || d.name,
        shortName: meta.shortName,
        description: d.description || meta.description,
        version: meta.defaultVersion,
        sortOrder: meta.sortOrder,
        categoriesCount,
        topicsCount,
        questionsCount,
        icon: meta.icon,
        colorTheme: meta.colorTheme,
      };
    });

    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public async getDomainHierarchy(
    domainSlug: string
  ): Promise<CurriculumHierarchyResponse | null> {
    const domain = await db.curriculumDomain.findUnique({
      where: { slug: domainSlug },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: [{ priority: "asc" }, { title: "asc" }],
              include: {
                _count: { select: { questions: true } },
              },
            },
          },
        },
      },
    });

    if (!domain) return null;

    const meta = CANONICAL_DOMAIN_METADATA[domainSlug];
    let totalTopics = 0;
    let totalQuestions = 0;

    const categories: CurriculumCategoryHierarchy[] = domain.categories.map((c) => {
      totalTopics += c.topics.length;
      const catQuestions = c.topics.reduce((sum, t) => sum + t._count.questions, 0);
      totalQuestions += catQuestions;

      return {
        slug: c.slug,
        name: c.name,
        pillar: c.description || "Core Curriculum",
        sortOrder: c.order,
        topicsCount: c.topics.length,
        topics: c.topics.map(
          (t): CurriculumTopicSummary => ({
            slug: t.slug,
            topicId: t.topicId || t.slug,
            title: t.title,
            priority: normalizePriority(t.priority),
            difficulty: normalizeDifficulty(t.difficulty),
            durationMin: t.durationMin || 15,
            frequency: 85,
            trend: "HOT",
            rubricAtomsCount: t.rubricAtoms ? t.rubricAtoms.length : 0,
            questionsCount: t._count.questions,
            practiceHref:
              t.practiceHref || `/practice/session/${domain.slug}?topic=${t.slug}`,
          })
        ),
      };
    });

    return {
      domainSlug: domain.slug,
      domainName: meta?.name || domain.name,
      description: domain.description || meta?.description || "",
      version: meta?.defaultVersion || "1.0.0",
      totalCategories: categories.length,
      totalTopics,
      totalQuestions,
      categories,
    };
  }
}

// ============================================================
// 3. Service Layer with Circuit Breaker & 2500ms Timeout Guard
// ============================================================
export interface CurriculumQueryResult<T> {
  data: T;
  dataSource: "NEO4J" | "POSTGRES_FALLBACK";
  latencyMs: number;
}

export class CurriculumRepositoryService {
  private neo4jRepo = new Neo4jCurriculumRepository();
  private pgRepo = new PostgresCurriculumRepository();

  private circuitOpen = false;
  private lastCircuitTripTime = 0;
  private readonly CIRCUIT_RESET_MS = 30000; // 30s reset window
  private readonly TIMEOUT_MS = 2500; // 2500ms timeout guard

  private shouldAttemptNeo4j(): boolean {
    if (!this.circuitOpen) return true;
    if (Date.now() - this.lastCircuitTripTime > this.CIRCUIT_RESET_MS) {
      console.warn("🔄 [CurriculumRepositoryService] Half-open circuit reset. Retrying Neo4j...");
      this.circuitOpen = false;
      return true;
    }
    return false;
  }

  private tripCircuit(reason: string) {
    this.circuitOpen = true;
    this.lastCircuitTripTime = Date.now();
    console.warn(`⚡ [CurriculumRepositoryService] Tripping circuit to Postgres fallback: ${reason}`);
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMsg: string
  ): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }

  public async getDomains(): Promise<CurriculumQueryResult<DomainCatalogItem[]>> {
    const startTime = Date.now();

    if (this.shouldAttemptNeo4j()) {
      try {
        const data = await this.executeWithTimeout(
          this.neo4jRepo.getDomains(),
          this.TIMEOUT_MS,
          `Neo4j getDomains timed out after ${this.TIMEOUT_MS}ms`
        );
        return {
          data,
          dataSource: "NEO4J",
          latencyMs: Date.now() - startTime,
        };
      } catch (err: any) {
        this.tripCircuit(err?.message || "Neo4j getDomains failure");
      }
    }

    // Postgres Fallback
    const fallbackStart = Date.now();
    const data = await this.pgRepo.getDomains();
    return {
      data,
      dataSource: "POSTGRES_FALLBACK",
      latencyMs: Date.now() - fallbackStart,
    };
  }

  public async getDomainHierarchy(
    domainSlug: string
  ): Promise<CurriculumQueryResult<CurriculumHierarchyResponse | null>> {
    const startTime = Date.now();

    if (this.shouldAttemptNeo4j()) {
      try {
        const data = await this.executeWithTimeout(
          this.neo4jRepo.getDomainHierarchy(domainSlug),
          this.TIMEOUT_MS,
          `Neo4j getDomainHierarchy timed out after ${this.TIMEOUT_MS}ms`
        );
        return {
          data,
          dataSource: "NEO4J",
          latencyMs: Date.now() - startTime,
        };
      } catch (err: any) {
        this.tripCircuit(err?.message || `Neo4j hierarchy failed for ${domainSlug}`);
      }
    }

    // Postgres Fallback
    const fallbackStart = Date.now();
    const data = await this.pgRepo.getDomainHierarchy(domainSlug);
    return {
      data,
      dataSource: "POSTGRES_FALLBACK",
      latencyMs: Date.now() - fallbackStart,
    };
  }
}

export const curriculumRepositoryService = new CurriculumRepositoryService();
