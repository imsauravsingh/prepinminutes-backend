/**
 * PrepInMinutes — Candidate Technical Stack & Level Analyzer Engine
 *
 * Implements Section 3 & 8 of the Specification:
 * - Separates Career Level, Specialization, and Categories
 * - Ingests Step 1 Setup Data (Role, Experience, Timeline, Companies, Resume text, JD)
 * - Queries Neo4j Knowledge Graph for high-signal diagnostic questions
 * - Formulates human-friendly, supportive opening greeting for Sarah (AI Interviewer)
 */

import { getNeo4jDriver } from "../graph/neo4j";

export type CareerLevel = "ENTRY" | "MID" | "SENIOR" | "STAFF" | "ARCHITECT";
export type Specialization = "FRONTEND" | "BACKEND" | "FULLSTACK" | "DEVOPS_CLOUD" | "SYSTEMS_ARCHITECT";

export interface CandidateAnalysisInput {
  candidateName?: string | null;
  targetRole: string;
  experienceLevel: string;
  timelineLabel?: string;
  targetCompanies?: string[];
  jobDescriptionText?: string | null;
  resumeText?: string | null;
}

export interface DiagnosticQuestion {
  id: string;
  category: string;
  title: string;
  prompt: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rubricGuide?: string;
  hints?: string[];
}

export interface CandidateAnalysisBlueprint {
  careerLevel: CareerLevel;
  specialization: Specialization;
  primaryLanguage: string;
  detectedTechnologies: string[];
  targetCategories: {
    name: string;
    description: string;
    expectedDepth: string;
  }[];
  openingGreeting: string;
  diagnosticQuestions: DiagnosticQuestion[];
}

function resolveCareerLevel(role: string, exp: string): CareerLevel {
  const r = role.toLowerCase();
  const e = exp.toLowerCase();

  if (r.includes("architect") || r.includes("fellow") || e.includes("15+") || e.includes("12+")) {
    return "ARCHITECT";
  }
  if (r.includes("staff") || r.includes("principal") || r.includes("lead") || e.includes("8+") || e.includes("10+")) {
    return "STAFF";
  }
  if (r.includes("senior") || r.includes("sde 3") || r.includes("sde iii") || e.includes("4-5") || e.includes("6-8")) {
    return "SENIOR";
  }
  if (r.includes("junior") || r.includes("entry") || r.includes("intern") || e.includes("0-1") || e.includes("0-2")) {
    return "ENTRY";
  }
  return "MID";
}

function resolveSpecialization(role: string, contextText: string): Specialization {
  const combined = `${role} ${contextText}`.toLowerCase();
  if (combined.includes("frontend") || combined.includes("react") || combined.includes("ui engineer")) {
    return "FRONTEND";
  }
  if (combined.includes("fullstack") || combined.includes("full stack") || (combined.includes("react") && combined.includes("node"))) {
    return "FULLSTACK";
  }
  if (combined.includes("devops") || combined.includes("sre") || combined.includes("infrastructure") || combined.includes("platform")) {
    return "DEVOPS_CLOUD";
  }
  if (combined.includes("architect")) {
    return "SYSTEMS_ARCHITECT";
  }
  return "BACKEND";
}

function detectTechStack(combinedText: string): { primaryLanguage: string; technologies: string[] } {
  const text = combinedText.toLowerCase();
  const techMap: Record<string, string> = {
    java: "Java",
    spring: "Spring Boot",
    python: "Python",
    django: "Django",
    fastapi: "FastAPI",
    javascript: "JavaScript",
    typescript: "TypeScript",
    react: "React",
    "next.js": "Next.js",
    node: "Node.js",
    express: "Express",
    "c#": "C#",
    ".net": ".NET",
    golang: "Go",
    go: "Go",
    php: "PHP",
    laravel: "Laravel",
    redis: "Redis",
    kafka: "Kafka",
    postgresql: "PostgreSQL",
    postgres: "PostgreSQL",
    mysql: "MySQL",
    mongodb: "MongoDB",
    elasticsearch: "Elasticsearch",
    docker: "Docker",
    kubernetes: "Kubernetes",
    aws: "AWS",
  };

  const detected: string[] = [];
  for (const [needle, formalName] of Object.entries(techMap)) {
    if (text.includes(needle) && !detected.includes(formalName)) {
      detected.push(formalName);
    }
  }

  // Detect primary language
  let primary = "TypeScript";
  if (text.includes("java") && !text.includes("javascript")) primary = "Java";
  else if (text.includes("python")) primary = "Python";
  else if (text.includes("golang") || text.includes(" go ")) primary = "Go";
  else if (text.includes("c#") || text.includes(".net")) primary = "C#";
  else if (text.includes("php")) primary = "PHP";
  else if (text.includes("react") || text.includes("node") || text.includes("typescript")) primary = "TypeScript";

  return {
    primaryLanguage: primary,
    technologies: detected.length > 0 ? detected : [primary, "PostgreSQL", "Redis", "Distributed Systems"],
  };
}

export async function analyzeCandidate(input: CandidateAnalysisInput): Promise<CandidateAnalysisBlueprint> {
  const combinedContext = `${input.targetRole} ${input.experienceLevel} ${input.jobDescriptionText || ""} ${input.resumeText || ""}`;
  const careerLevel = resolveCareerLevel(input.targetRole, input.experienceLevel);
  const specialization = resolveSpecialization(input.targetRole, combinedContext);
  const { primaryLanguage, technologies } = detectTechStack(combinedContext);

  const targetCategories = [
    {
      name: `${primaryLanguage} Internals & Concurrency`,
      description: `Language execution runtime, memory model, and concurrency primitives for ${primaryLanguage}.`,
      expectedDepth: careerLevel === "SENIOR" || careerLevel === "STAFF" || careerLevel === "ARCHITECT" ? "ADVANCED" : "INTERMEDIATE",
    },
    {
      name: "Data Modeling & Caching Trade-offs",
      description: "Database indexing, schema normalization, caching layers (Redis), and read/write scaling.",
      expectedDepth: "INTERMEDIATE",
    },
    {
      name: "System Architecture & Scalability",
      description: "High-level distributed architecture, rate limiting, and failure recovery trade-offs.",
      expectedDepth: careerLevel === "ARCHITECT" ? "EXPERT" : "ADVANCED",
    },
  ];

  // Formulate human-friendly opening greeting from Sarah
  const firstName = input.candidateName ? input.candidateName.split(" ")[0] : "there";
  const companyPhrase = input.targetCompanies && input.targetCompanies.length > 0
    ? `targeting companies like ${input.targetCompanies.join(", ")}`
    : `focusing on ${input.targetRole}`;

  const openingGreeting = `Hi ${firstName}! Welcome to your technical assessment. I see you're preparing for a ${input.targetRole} role with a background in ${technologies.slice(0, 3).join(", ")}, ${companyPhrase}. Today isn't a high-pressure exam—it's a friendly 15-minute diagnostic across 3 core topics so we can skip what you already know and customize your preparation plan.`;

  // Query Neo4j Knowledge Graph for 3 high-signal diagnostic questions
  let diagnosticQuestions: DiagnosticQuestion[] = [];
  try {
    const driver = getNeo4jDriver();
    const session = driver.session();

    const allowedDifficulties = careerLevel === "ENTRY" ? ["BEGINNER", "INTERMEDIATE"] : ["INTERMEDIATE", "ADVANCED"];

    // 1. Pillar 1: Language Internals Question
    const langSlugMap: Record<string, string> = {
      Java: "java",
      Go: "go-",
      Python: "python",
      TypeScript: "nodejs",
      JavaScript: "nodejs",
      "C#": "csharp",
      PHP: "php",
    };
    const langPrefix = langSlugMap[primaryLanguage] || primaryLanguage.toLowerCase();

    const langRes = await session.run(
      `
      MATCH (c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      WHERE q.status = 'PUBLISHED'
        AND coalesce(q.isLive, false) = true
        AND coalesce(t.isLive, false) = true
        AND coalesce(c.isLive, false) = true
        AND (toLower(c.slug) STARTS WITH $langPrefix OR toLower(t.slug) STARTS WITH $langPrefix)
        AND q.difficulty IN $allowedDifficulties
      RETURN c.name AS category, q.id AS id, q.title AS title, q.prompt AS prompt, q.difficulty AS difficulty, q.rubricGuide AS rubricGuide, q.hints AS hints
      LIMIT 1
      `,
      { langPrefix, allowedDifficulties }
    );

    // 2. Pillar 2: Data Modeling & Caching Question
    const dataRes = await session.run(
      `
      MATCH (c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      WHERE q.status = 'PUBLISHED'
        AND coalesce(q.isLive, false) = true
        AND coalesce(t.isLive, false) = true
        AND coalesce(c.isLive, false) = true
        AND t.slug IN ['distributed-cache', 'database-sharding', 'b-tree-indexing', 'database-transactions', 'lru-cache-design']
        AND q.difficulty IN $allowedDifficulties
      RETURN c.name AS category, q.id AS id, q.title AS title, q.prompt AS prompt, q.difficulty AS difficulty, q.rubricGuide AS rubricGuide, q.hints AS hints
      LIMIT 1
      `,
      { allowedDifficulties }
    );

    // 3. Pillar 3: Distributed System Architecture & Scale Question
    const systemRes = await session.run(
      `
      MATCH (c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      WHERE q.status = 'PUBLISHED'
        AND coalesce(q.isLive, false) = true
        AND coalesce(t.isLive, false) = true
        AND coalesce(c.isLive, false) = true
        AND t.slug IN ['url-shortener', 'rate-limiter', 'circuit-breakers', 'message-queues']
        AND q.difficulty IN $allowedDifficulties
      RETURN c.name AS category, q.id AS id, q.title AS title, q.prompt AS prompt, q.difficulty AS difficulty, q.rubricGuide AS rubricGuide, q.hints AS hints
      LIMIT 1
      `,
      { allowedDifficulties }
    );

    const mapRecord = (r: any): DiagnosticQuestion => ({
      id: r.get("id"),
      category: r.get("category"),
      title: r.get("title"),
      prompt: r.get("prompt"),
      difficulty: r.get("difficulty"),
      rubricGuide: r.get("rubricGuide") || undefined,
      hints: r.get("hints") || undefined,
    });

    if (langRes.records.length > 0) diagnosticQuestions.push(mapRecord(langRes.records[0]));
    if (dataRes.records.length > 0) diagnosticQuestions.push(mapRecord(dataRes.records[0]));
    if (systemRes.records.length > 0) diagnosticQuestions.push(mapRecord(systemRes.records[0]));

    await session.close();
  } catch (neo4jError) {
    console.warn("Neo4j query warning in analyzer (using resilient fallback questions):", neo4jError);
  }

  // Fallback diagnostic questions if Neo4j returned fewer than 3
  if (diagnosticQuestions.length < 3) {
    diagnosticQuestions = [
      {
        id: "q_diag_lang_internals",
        category: `${primaryLanguage} Internals`,
        title: `${primaryLanguage} Concurrency & Runtime Behavior`,
        difficulty: "INTERMEDIATE",
        prompt: `In ${primaryLanguage}, how do you safely manage shared mutable state under concurrent multi-threaded or asynchronous load? Walk through memory visibility and race condition prevention.`,
      },
      {
        id: "q_diag_data_modeling",
        category: "Data Modeling & Caching",
        title: "Relational Indexing & Distributed Caching",
        difficulty: "INTERMEDIATE",
        prompt: "When designing a high-traffic read-heavy service, how do you structure your database indexes and caching tier with Redis to avoid cache stampede and stale reads?",
      },
      {
        id: "q_diag_system_design",
        category: "System Design & Scalability",
        title: "Rate Limiting & High-Throughput Ingress",
        difficulty: "ADVANCED",
        prompt: "How would you architect a distributed rate-limiting tier to handle 200,000 API requests per second across multiple regional data centers?",
      },
    ];
  }

  return {
    careerLevel,
    specialization,
    primaryLanguage,
    detectedTechnologies: technologies,
    targetCategories,
    openingGreeting,
    diagnosticQuestions,
  };
}

