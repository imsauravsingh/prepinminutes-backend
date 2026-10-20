/**
 * PrepInMinutes — Admin Neo4j Knowledge Graph Curriculum Management
 *
 * Implements:
 * 1. Overview Metrics: GET /api/admin/neo4j/overview
 * 2. Domains: GET /api/admin/neo4j/domains
 * 3. Categories:
 *    - GET    /api/admin/neo4j/categories
 *    - POST   /api/admin/neo4j/categories
 *    - PUT    /api/admin/neo4j/categories/:slug
 *    - DELETE /api/admin/neo4j/categories/:slug
 * 4. Topics:
 *    - GET    /api/admin/neo4j/topics
 *    - POST   /api/admin/neo4j/topics
 *    - PUT    /api/admin/neo4j/topics/:slug
 *    - DELETE /api/admin/neo4j/topics/:slug
 * 5. Questions:
 *    - GET    /api/admin/neo4j/questions
 *    - POST   /api/admin/neo4j/questions
 *    - PUT    /api/admin/neo4j/questions/:id
 *    - DELETE /api/admin/neo4j/questions/:id
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { getNeo4jDriver } from "../server/graph/neo4j";
import { db } from "../server/db/client";
import { requireAdminRole, ROOT_HOD_EMAIL } from "../server/auth/admin-auth";
import { AdminRole } from "@prisma/client";

const ALL_STAFF_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
  "STAFF_ENGINEER",
  "CONTENT_REVIEWER",
];

const CURRICULUM_EDIT_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
  "STAFF_ENGINEER",
];

const CURRICULUM_DELETE_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
];

// Helper: Convert Neo4j integers / datetimes to serializable JS values
function sanitizeNeo4jValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  if (typeof val === "object" && val.year && val.month && val.day) {
    return new Date(val.toString()).toISOString();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeNeo4jValue);
  }
  return val;
}

// -------------------------------------------------------------
// 1. OVERVIEW & DOMAINS
// -------------------------------------------------------------

/**
 * GET /api/admin/neo4j/overview
 * Returns graph taxonomy metrics, live vs draft counts, and pending review counts.
 */
export async function handleGetNeo4jOverview(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, ALL_STAFF_ROLES);
  if (!auth.allowed) return auth.response;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(`
      MATCH (d:Domain) WITH count(d) AS domainsCount
      MATCH (c:Category) WITH domainsCount, count(c) AS categoriesCount
      MATCH (t:Topic) WITH domainsCount, categoriesCount, count(t) AS topicsCount,
        count(CASE WHEN t.isLive = true THEN 1 END) AS liveTopics,
        count(CASE WHEN t.isLive = false OR t.status = 'DRAFT' OR t.status = 'IN_REVIEW' THEN 1 END) AS draftTopics
      MATCH (q:Question) WITH domainsCount, categoriesCount, topicsCount, liveTopics, draftTopics, count(q) AS questionsCount,
        count(CASE WHEN q.isLive = true THEN 1 END) AS liveQuestions,
        count(CASE WHEN q.isLive = false OR q.status = 'DRAFT' OR q.status = 'IN_REVIEW' THEN 1 END) AS draftQuestions
      RETURN 
        domainsCount,
        categoriesCount,
        topicsCount,
        liveTopics,
        draftTopics,
        questionsCount,
        liveQuestions,
        draftQuestions
    `);

    const r = res.records[0];
    const pendingRequestsCount = await db.user.count({
      where: { adminApprovalStatus: "PENDING" },
    });

    return ApiResponse.json({
      success: true,
      stats: {
        domains: sanitizeNeo4jValue(r?.get("domainsCount") || 0),
        categories: sanitizeNeo4jValue(r?.get("categoriesCount") || 0),
        topics: {
          total: sanitizeNeo4jValue(r?.get("topicsCount") || 0),
          live: sanitizeNeo4jValue(r?.get("liveTopics") || 0),
          draft: sanitizeNeo4jValue(r?.get("draftTopics") || 0),
        },
        questions: {
          total: sanitizeNeo4jValue(r?.get("questionsCount") || 0),
          live: sanitizeNeo4jValue(r?.get("liveQuestions") || 0),
          draft: sanitizeNeo4jValue(r?.get("draftQuestions") || 0),
        },
        pendingTeamRequests: pendingRequestsCount,
      },
    });
  } finally {
    await session.close();
  }
}

/**
 * GET /api/admin/neo4j/domains
 * Lists all root domains with their linked categories.
 */
export async function handleGetNeo4jDomains(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, ALL_STAFF_ROLES);
  if (!auth.allowed) return auth.response;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(`
      MATCH (d:Domain)
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
      RETURN d.slug AS slug, d.name AS name, d.description AS description, count(c) AS categoryCount
      ORDER BY d.name ASC
    `);

    const domains = res.records.map((r) => ({
      slug: r.get("slug"),
      name: r.get("name"),
      description: r.get("description"),
      categoryCount: sanitizeNeo4jValue(r.get("categoryCount")),
    }));

    return ApiResponse.json({ success: true, domains });
  } finally {
    await session.close();
  }
}

// -------------------------------------------------------------
// 2. CATEGORIES CRUD
// -------------------------------------------------------------

/**
 * GET /api/admin/neo4j/categories
 * Supports optional ?domainSlug=... and ?status=...
 */
export async function handleGetNeo4jCategories(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, ALL_STAFF_ROLES);
  if (!auth.allowed) return auth.response;

  const domainSlug = req.nextUrl.searchParams.get("domainSlug") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    let cypher = `
      MATCH (d:Domain)-[:CONTAINS]->(c:Category)
      WHERE 1=1
    `;
    const params: Record<string, any> = {};

    if (domainSlug) {
      cypher += ` AND d.slug = $domainSlug `;
      params.domainSlug = domainSlug;
    }
    if (status) {
      cypher += ` AND c.status = $status `;
      params.status = status;
    }

    cypher += `
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      RETURN 
        c.slug AS slug,
        c.name AS name,
        c.description AS description,
        c.status AS status,
        coalesce(c.isLive, true) AS isLive,
        d.slug AS domainSlug,
        d.name AS domainName,
        count(t) AS topicCount
      ORDER BY d.name, c.name ASC
    `;

    const res = await session.run(cypher, params);
    const categories = res.records.map((r) => ({
      slug: r.get("slug"),
      name: r.get("name"),
      description: r.get("description"),
      status: r.get("status") || "PUBLISHED",
      isLive: r.get("isLive"),
      domainSlug: r.get("domainSlug"),
      domainName: r.get("domainName"),
      topicCount: sanitizeNeo4jValue(r.get("topicCount")),
    }));

    return ApiResponse.json({ success: true, categories });
  } finally {
    await session.close();
  }
}

/**
 * POST /api/admin/neo4j/categories
 * Create new category linked to Domain.
 * Super Admin / HOD creation defaults to PUBLISHED; other roles default to DRAFT.
 */
export async function handlePostNeo4jCategory(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    domainSlug?: string;
    slug?: string;
    name?: string;
    description?: string;
    publishImmediately?: boolean;
  };

  const domainSlug = body.domainSlug?.trim();
  const slug = body.slug?.trim().toLowerCase();
  const name = body.name?.trim();
  const description = body.description?.trim() || "";

  if (!domainSlug || !slug || !name) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "domainSlug, slug, and name are required." },
      { status: 400 }
    );
  }

  const isHod = admin.email === ROOT_HOD_EMAIL || admin.role === "SUPER_ADMIN";
  const status = (isHod && body.publishImmediately) ? "PUBLISHED" : "DRAFT";
  const isLive = status === "PUBLISHED";

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (d:Domain {slug: $domainSlug})
      MERGE (c:Category {slug: $slug})
      ON CREATE SET 
        c.name = $name,
        c.description = $description,
        c.status = $status,
        c.isLive = $isLive,
        c.createdBy = $adminEmail,
        c.createdAt = datetime()
      ON MATCH SET 
        c.name = $name,
        c.description = $description
      MERGE (d)-[:CONTAINS]->(c)
      RETURN c.slug AS slug, c.name AS name, c.status AS status, c.isLive AS isLive, d.slug AS domainSlug
      `,
      { domainSlug, slug, name, description, status, isLive, adminEmail: admin.email }
    );

    if (res.records.length === 0) {
      return ApiResponse.json(
        { error: "DOMAIN_NOT_FOUND", message: `Domain "${domainSlug}" does not exist.` },
        { status: 404 }
      );
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "CREATE_CATEGORY",
        targetType: "Category",
        targetId: slug,
        changeDiff: { domainSlug, name, status, isLive },
      },
    });

    return ApiResponse.json({
      success: true,
      message: `Category "${name}" created with status ${status}.`,
      category: {
        slug,
        name,
        description,
        status,
        isLive,
        domainSlug,
      },
    });
  } finally {
    await session.close();
  }
}

/**
 * PUT /api/admin/neo4j/categories/:slug
 */
export async function handlePutNeo4jCategory(req: ApiRequest, slug: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    description?: string;
    domainSlug?: string;
  };

  const name = body.name?.trim();
  const description = body.description?.trim();

  if (!name) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "name is required." },
      { status: 400 }
    );
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (c:Category {slug: $slug})
      SET c.name = $name,
          c.description = coalesce($description, c.description),
          c.updatedAt = datetime(),
          c.updatedBy = $adminEmail
      RETURN c.slug AS slug, c.name AS name, c.description AS description, c.status AS status, c.isLive AS isLive
      `,
      { slug, name, description, adminEmail: admin.email }
    );

    if (res.records.length === 0) {
      return ApiResponse.json({ error: "NOT_FOUND", message: `Category "${slug}" not found.` }, { status: 404 });
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_CATEGORY",
        targetType: "Category",
        targetId: slug,
        changeDiff: { name, description },
      },
    });

    return ApiResponse.json({ success: true, message: `Category "${slug}" updated.` });
  } finally {
    await session.close();
  }
}

/**
 * DELETE /api/admin/neo4j/categories/:slug
 */
export async function handleDeleteNeo4jCategory(req: ApiRequest, slug: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_DELETE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // Check if category has active topics
    const checkRes = await session.run(
      `
      MATCH (c:Category {slug: $slug})
      OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
      RETURN c.slug AS slug, count(t) AS topicCount
      `,
      { slug }
    );

    if (checkRes.records.length === 0) {
      return ApiResponse.json({ error: "NOT_FOUND", message: `Category "${slug}" not found.` }, { status: 404 });
    }

    const topicCount = sanitizeNeo4jValue(checkRes.records[0].get("topicCount"));
    if (topicCount > 0) {
      return ApiResponse.json(
        {
          error: "CATEGORY_HAS_CHILDREN",
          message: `Cannot delete category "${slug}" because it contains ${topicCount} topic(s). Remove or reassign topics first.`,
        },
        { status: 400 }
      );
    }

    await session.run(
      `
      MATCH (c:Category {slug: $slug})
      DETACH DELETE c
      `,
      { slug }
    );

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "DELETE_CATEGORY",
        targetType: "Category",
        targetId: slug,
      },
    });

    return ApiResponse.json({ success: true, message: `Category "${slug}" removed.` });
  } finally {
    await session.close();
  }
}

// -------------------------------------------------------------
// 3. TOPICS CRUD & RUBRIC ATOMS
// -------------------------------------------------------------

/**
 * GET /api/admin/neo4j/topics
 * Supports ?categorySlug=..., ?domainSlug=..., ?difficulty=..., ?status=...
 */
export async function handleGetNeo4jTopics(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, ALL_STAFF_ROLES);
  if (!auth.allowed) return auth.response;

  const categorySlug = req.nextUrl.searchParams.get("categorySlug") || undefined;
  const domainSlug = req.nextUrl.searchParams.get("domainSlug") || undefined;
  const difficulty = req.nextUrl.searchParams.get("difficulty") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    let cypher = `
      MATCH (d:Domain)-[:CONTAINS]->(c:Category)-[:HAS_TOPIC]->(t:Topic)
      WHERE 1=1
    `;
    const params: Record<string, any> = {};

    if (categorySlug) {
      cypher += ` AND c.slug = $categorySlug `;
      params.categorySlug = categorySlug;
    }
    if (domainSlug) {
      cypher += ` AND d.slug = $domainSlug `;
      params.domainSlug = domainSlug;
    }
    if (difficulty) {
      cypher += ` AND t.difficulty = $difficulty `;
      params.difficulty = difficulty;
    }
    if (status) {
      cypher += ` AND t.status = $status `;
      params.status = status;
    }

    cypher += `
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      OPTIONAL MATCH (t)-[:PREREQUISITE_FOR]->(nextTopic:Topic)
      RETURN 
        t.slug AS slug,
        t.title AS title,
        t.description AS description,
        t.difficulty AS difficulty,
        t.rubricAtoms AS rubricAtoms,
        t.durationMin AS durationMin,
        coalesce(t.status, 'PUBLISHED') AS status,
        coalesce(t.isLive, true) AS isLive,
        c.slug AS categorySlug,
        c.name AS categoryName,
        d.slug AS domainSlug,
        d.name AS domainName,
        count(DISTINCT q) AS questionCount,
        collect(DISTINCT nextTopic.slug) AS prerequisiteFor
      ORDER BY c.name, t.title ASC
    `;

    const res = await session.run(cypher, params);
    const topics = res.records.map((r) => ({
      slug: r.get("slug"),
      title: r.get("title"),
      description: r.get("description"),
      difficulty: r.get("difficulty"),
      rubricAtoms: r.get("rubricAtoms") || [],
      durationMin: sanitizeNeo4jValue(r.get("durationMin")),
      status: r.get("status"),
      isLive: r.get("isLive"),
      categorySlug: r.get("categorySlug"),
      categoryName: r.get("categoryName"),
      domainSlug: r.get("domainSlug"),
      domainName: r.get("domainName"),
      questionCount: sanitizeNeo4jValue(r.get("questionCount")),
      prerequisiteFor: r.get("prerequisiteFor"),
    }));

    return ApiResponse.json({ success: true, topics });
  } finally {
    await session.close();
  }
}

/**
 * POST /api/admin/neo4j/topics
 * Creates topic linked to category. Default status: DRAFT, isLive: false (unless HOD publishImmediately).
 */
export async function handlePostNeo4jTopic(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    categorySlug?: string;
    slug?: string;
    title?: string;
    description?: string;
    difficulty?: string;
    rubricAtoms?: string[];
    durationMin?: number;
    publishImmediately?: boolean;
    prerequisites?: string[]; // topic slugs that must precede this
  };

  const categorySlug = body.categorySlug?.trim();
  const slug = body.slug?.trim().toLowerCase();
  const title = body.title?.trim();
  const description = body.description?.trim() || "";
  const difficulty = body.difficulty?.toUpperCase() || "INTERMEDIATE";
  const rubricAtoms = Array.isArray(body.rubricAtoms) ? body.rubricAtoms.filter(Boolean) : [];
  const durationMin = Number(body.durationMin) || 30;

  if (!categorySlug || !slug || !title) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "categorySlug, slug, and title are required." },
      { status: 400 }
    );
  }

  const isHod = admin.email === ROOT_HOD_EMAIL || admin.role === "SUPER_ADMIN";
  const status = (isHod && body.publishImmediately) ? "PUBLISHED" : "DRAFT";
  const isLive = status === "PUBLISHED";

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (c:Category {slug: $categorySlug})
      MERGE (t:Topic {slug: $slug})
      ON CREATE SET 
        t.title = $title,
        t.description = $description,
        t.difficulty = $difficulty,
        t.rubricAtoms = $rubricAtoms,
        t.durationMin = $durationMin,
        t.status = $status,
        t.isLive = $isLive,
        t.createdBy = $adminEmail,
        t.createdAt = datetime()
      ON MATCH SET 
        t.title = $title,
        t.description = $description,
        t.difficulty = $difficulty,
        t.rubricAtoms = $rubricAtoms,
        t.durationMin = $durationMin
      MERGE (c)-[:HAS_TOPIC]->(t)
      RETURN t.slug AS slug, t.title AS title, t.status AS status, t.isLive AS isLive
      `,
      {
        categorySlug,
        slug,
        title,
        description,
        difficulty,
        rubricAtoms,
        durationMin,
        status,
        isLive,
        adminEmail: admin.email,
      }
    );

    if (res.records.length === 0) {
      return ApiResponse.json(
        { error: "CATEGORY_NOT_FOUND", message: `Category "${categorySlug}" does not exist.` },
        { status: 404 }
      );
    }

    // Link optional prerequisites
    if (Array.isArray(body.prerequisites) && body.prerequisites.length > 0) {
      for (const prereqSlug of body.prerequisites) {
        await session.run(
          `
          MATCH (prereq:Topic {slug: $prereqSlug})
          MATCH (t:Topic {slug: $slug})
          MERGE (prereq)-[:PREREQUISITE_FOR]->(t)
          `,
          { prereqSlug, slug }
        );
      }
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "CREATE_TOPIC",
        targetType: "Topic",
        targetId: slug,
        changeDiff: { categorySlug, title, difficulty, status, isLive },
      },
    });

    return ApiResponse.json({
      success: true,
      message: `Topic "${title}" created with status ${status}.`,
      topic: { slug, title, status, isLive, categorySlug },
    });
  } finally {
    await session.close();
  }
}

/**
 * PUT /api/admin/neo4j/topics/:slug
 */
export async function handlePutNeo4jTopic(req: ApiRequest, slug: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    difficulty?: string;
    rubricAtoms?: string[];
    durationMin?: number;
    status?: string;
    isLive?: boolean;
    categorySlug?: string;
  };

  const title = body.title?.trim();
  const description = body.description?.trim();
  const difficulty = body.difficulty?.toUpperCase();
  const rubricAtoms = Array.isArray(body.rubricAtoms) ? body.rubricAtoms.filter(Boolean) : undefined;
  const durationMin = body.durationMin !== undefined ? Number(body.durationMin) : undefined;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (t:Topic {slug: $slug})
      SET t.title = coalesce($title, t.title),
          t.description = coalesce($description, t.description),
          t.difficulty = coalesce($difficulty, t.difficulty),
          t.rubricAtoms = coalesce($rubricAtoms, t.rubricAtoms),
          t.durationMin = coalesce($durationMin, t.durationMin),
          t.updatedAt = datetime(),
          t.updatedBy = $adminEmail
      RETURN t.slug AS slug, t.title AS title
      `,
      {
        slug,
        title: title || null,
        description: description || null,
        difficulty: difficulty || null,
        rubricAtoms: rubricAtoms || null,
        durationMin: durationMin !== undefined ? durationMin : null,
        adminEmail: admin.email,
      }
    );

    if (res.records.length === 0) {
      return ApiResponse.json({ error: "NOT_FOUND", message: `Topic "${slug}" not found.` }, { status: 404 });
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_TOPIC",
        targetType: "Topic",
        targetId: slug,
        changeDiff: { title, difficulty, rubricAtoms },
      },
    });

    return ApiResponse.json({ success: true, message: `Topic "${slug}" updated.` });
  } finally {
    await session.close();
  }
}

/**
 * DELETE /api/admin/neo4j/topics/:slug
 */
export async function handleDeleteNeo4jTopic(req: ApiRequest, slug: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_DELETE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const checkRes = await session.run(
      `
      MATCH (t:Topic {slug: $slug})
      OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)
      RETURN t.slug AS slug, count(q) AS questionCount
      `,
      { slug }
    );

    if (checkRes.records.length === 0) {
      return ApiResponse.json({ error: "NOT_FOUND", message: `Topic "${slug}" not found.` }, { status: 404 });
    }

    const questionCount = sanitizeNeo4jValue(checkRes.records[0].get("questionCount"));
    if (questionCount > 0) {
      return ApiResponse.json(
        {
          error: "TOPIC_HAS_QUESTIONS",
          message: `Cannot delete topic "${slug}" because it contains ${questionCount} question(s). Delete questions first.`,
        },
        { status: 400 }
      );
    }

    await session.run(
      `
      MATCH (t:Topic {slug: $slug})
      DETACH DELETE t
      `,
      { slug }
    );

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "DELETE_TOPIC",
        targetType: "Topic",
        targetId: slug,
      },
    });

    return ApiResponse.json({ success: true, message: `Topic "${slug}" removed.` });
  } finally {
    await session.close();
  }
}

// -------------------------------------------------------------
// 4. QUESTIONS CRUD
// -------------------------------------------------------------

/**
 * GET /api/admin/neo4j/questions
 * Supports ?topicSlug=..., ?difficulty=..., ?status=...
 */
export async function handleGetNeo4jQuestions(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, ALL_STAFF_ROLES);
  if (!auth.allowed) return auth.response;

  const topicSlug = req.nextUrl.searchParams.get("topicSlug") || undefined;
  const difficulty = req.nextUrl.searchParams.get("difficulty") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    let cypher = `
      MATCH (c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      WHERE 1=1
    `;
    const params: Record<string, any> = {};

    if (topicSlug) {
      cypher += ` AND t.slug = $topicSlug `;
      params.topicSlug = topicSlug;
    }
    if (difficulty) {
      cypher += ` AND q.difficulty = $difficulty `;
      params.difficulty = difficulty;
    }
    if (status) {
      cypher += ` AND q.status = $status `;
      params.status = status;
    }

    cypher += `
      RETURN 
        q.id AS id,
        q.title AS title,
        q.prompt AS prompt,
        q.difficulty AS difficulty,
        q.rubricGuide AS rubricGuide,
        q.hints AS hints,
        coalesce(q.status, 'PUBLISHED') AS status,
        coalesce(q.isLive, true) AS isLive,
        coalesce(q.version, 1) AS version,
        t.slug AS topicSlug,
        t.title AS topicTitle,
        c.slug AS categorySlug,
        c.name AS categoryName
      ORDER BY t.title, q.difficulty, q.title ASC
    `;

    const res = await session.run(cypher, params);
    const questions = res.records.map((r) => ({
      id: r.get("id"),
      title: r.get("title"),
      prompt: r.get("prompt"),
      difficulty: r.get("difficulty"),
      rubricGuide: r.get("rubricGuide") || "",
      hints: r.get("hints") || [],
      status: r.get("status"),
      isLive: r.get("isLive"),
      version: sanitizeNeo4jValue(r.get("version")),
      topicSlug: r.get("topicSlug"),
      topicTitle: r.get("topicTitle"),
      categorySlug: r.get("categorySlug"),
      categoryName: r.get("categoryName"),
    }));

    return ApiResponse.json({ success: true, questions });
  } finally {
    await session.close();
  }
}

/**
 * POST /api/admin/neo4j/questions
 * Creates question linked to Topic.
 * Default status: DRAFT, isLive: false (unless HOD publishImmediately).
 */
export async function handlePostNeo4jQuestion(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    topicSlug?: string;
    id?: string;
    title?: string;
    prompt?: string;
    difficulty?: string;
    rubricGuide?: string;
    hints?: string[];
    publishImmediately?: boolean;
  };

  const topicSlug = body.topicSlug?.trim();
  const title = body.title?.trim();
  const prompt = body.prompt?.trim();
  const difficulty = body.difficulty?.toUpperCase() || "INTERMEDIATE";
  const rubricGuide = body.rubricGuide?.trim() || "";
  const hints = Array.isArray(body.hints) ? body.hints.filter(Boolean) : [];

  if (!topicSlug || !title || !prompt) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "topicSlug, title, and prompt are required." },
      { status: 400 }
    );
  }

  const id = body.id?.trim() || `q_${topicSlug}_${Date.now().toString(36)}`;
  const isHod = admin.email === ROOT_HOD_EMAIL || admin.role === "SUPER_ADMIN";
  const status = (isHod && body.publishImmediately) ? "PUBLISHED" : "DRAFT";
  const isLive = status === "PUBLISHED";

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (t:Topic {slug: $topicSlug})
      MERGE (q:Question {id: $id})
      ON CREATE SET 
        q.title = $title,
        q.prompt = $prompt,
        q.difficulty = $difficulty,
        q.rubricGuide = $rubricGuide,
        q.hints = $hints,
        q.status = $status,
        q.isLive = $isLive,
        q.version = 1,
        q.createdBy = $adminEmail,
        q.createdAt = datetime()
      ON MATCH SET 
        q.title = $title,
        q.prompt = $prompt,
        q.difficulty = $difficulty,
        q.rubricGuide = $rubricGuide,
        q.hints = $hints
      MERGE (t)-[:HAS_QUESTION]->(q)
      RETURN q.id AS id, q.title AS title, q.status AS status, q.isLive AS isLive
      `,
      {
        topicSlug,
        id,
        title,
        prompt,
        difficulty,
        rubricGuide,
        hints,
        status,
        isLive,
        adminEmail: admin.email,
      }
    );

    if (res.records.length === 0) {
      return ApiResponse.json(
        { error: "TOPIC_NOT_FOUND", message: `Topic "${topicSlug}" does not exist.` },
        { status: 404 }
      );
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "CREATE_QUESTION",
        targetType: "Question",
        targetId: id,
        changeDiff: { topicSlug, title, difficulty, status, isLive },
      },
    });

    return ApiResponse.json({
      success: true,
      message: `Question "${title}" created with status ${status}.`,
      question: { id, title, status, isLive, topicSlug },
    });
  } finally {
    await session.close();
  }
}

/**
 * PUT /api/admin/neo4j/questions/:id
 */
export async function handlePutNeo4jQuestion(req: ApiRequest, id: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_EDIT_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    prompt?: string;
    difficulty?: string;
    rubricGuide?: string;
    hints?: string[];
  };

  const title = body.title?.trim();
  const prompt = body.prompt?.trim();
  const difficulty = body.difficulty?.toUpperCase();
  const rubricGuide = body.rubricGuide?.trim();
  const hints = Array.isArray(body.hints) ? body.hints.filter(Boolean) : undefined;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    const res = await session.run(
      `
      MATCH (q:Question {id: $id})
      SET q.title = coalesce($title, q.title),
          q.prompt = coalesce($prompt, q.prompt),
          q.difficulty = coalesce($difficulty, q.difficulty),
          q.rubricGuide = coalesce($rubricGuide, q.rubricGuide),
          q.hints = coalesce($hints, q.hints),
          q.version = coalesce(q.version, 1) + 1,
          q.updatedAt = datetime(),
          q.updatedBy = $adminEmail
      RETURN q.id AS id, q.title AS title, q.version AS version
      `,
      {
        id,
        title: title || null,
        prompt: prompt || null,
        difficulty: difficulty || null,
        rubricGuide: rubricGuide || null,
        hints: hints || null,
        adminEmail: admin.email,
      }
    );

    if (res.records.length === 0) {
      return ApiResponse.json({ error: "NOT_FOUND", message: `Question "${id}" not found.` }, { status: 404 });
    }

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "UPDATE_QUESTION",
        targetType: "Question",
        targetId: id,
        changeDiff: { title, difficulty },
      },
    });

    return ApiResponse.json({ success: true, message: `Question "${id}" updated.` });
  } finally {
    await session.close();
  }
}

/**
 * DELETE /api/admin/neo4j/questions/:id
 */
export async function handleDeleteNeo4jQuestion(req: ApiRequest, id: string): Promise<Response> {
  const auth = await requireAdminRole(req, CURRICULUM_DELETE_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    await session.run(
      `
      MATCH (q:Question {id: $id})
      DETACH DELETE q
      `,
      { id }
    );

    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: "DELETE_QUESTION",
        targetType: "Question",
        targetId: id,
      },
    });

    return ApiResponse.json({ success: true, message: `Question "${id}" removed.` });
  } finally {
    await session.close();
  }
}

