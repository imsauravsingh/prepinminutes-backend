/**
 * PrepInMinutes — Admin Staging & Approval Gate Routes
 *
 * Implements:
 * GET  /api/admin/neo4j/pending — Lists all Categories, Topics, and Questions in DRAFT / IN_REVIEW / isLive=false
 * POST /api/admin/neo4j/approve — Approves node, flips status to PUBLISHED and isLive to true, logs audit trail
 * POST /api/admin/neo4j/reject  — Rejects node with feedback, sets status to REJECTED, logs audit trail
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { getNeo4jDriver } from "../server/graph/neo4j";
import { db } from "../server/db/client";
import { requireAdminRole } from "../server/auth/admin-auth";
import { AdminRole } from "@prisma/client";

const APPROVAL_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "HOD",
  "CURRICULUM_MANAGER",
  "STAFF_ENGINEER",
];

type ItemType = "Category" | "Topic" | "Question";

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

/**
 * GET /api/admin/neo4j/pending
 * Returns staging queues for unapproved Categories, Topics, and Questions.
 */
export async function handleGetNeo4jPending(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, APPROVAL_ROLES);
  if (!auth.allowed) return auth.response;

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 1. Pending Categories
    const catRes = await session.run(`
      MATCH (d:Domain)-[:CONTAINS]->(c:Category)
      WHERE c.status IN ['DRAFT', 'IN_REVIEW'] OR coalesce(c.isLive, false) = false
      RETURN 
        c.slug AS slug,
        c.name AS name,
        c.description AS description,
        c.status AS status,
        coalesce(c.isLive, false) AS isLive,
        c.createdBy AS createdBy,
        c.createdAt AS createdAt,
        c.rejectionFeedback AS rejectionFeedback,
        d.slug AS domainSlug,
        d.name AS domainName
      ORDER BY c.createdAt DESC
    `);

    const pendingCategories = catRes.records.map((r) => ({
      itemType: "Category" as const,
      identifier: r.get("slug"),
      name: r.get("name"),
      description: r.get("description"),
      status: r.get("status") || "DRAFT",
      isLive: r.get("isLive"),
      createdBy: r.get("createdBy") || null,
      createdAt: sanitizeNeo4jValue(r.get("createdAt")),
      rejectionFeedback: r.get("rejectionFeedback") || null,
      parentContext: `${r.get("domainName")} (${r.get("domainSlug")})`,
    }));

    // 2. Pending Topics
    const topicRes = await session.run(`
      MATCH (d:Domain)-[:CONTAINS]->(c:Category)-[:HAS_TOPIC]->(t:Topic)
      WHERE t.status IN ['DRAFT', 'IN_REVIEW'] OR coalesce(t.isLive, false) = false
      RETURN 
        t.slug AS slug,
        t.title AS title,
        t.description AS description,
        t.difficulty AS difficulty,
        t.rubricAtoms AS rubricAtoms,
        t.status AS status,
        coalesce(t.isLive, false) AS isLive,
        t.createdBy AS createdBy,
        t.createdAt AS createdAt,
        t.rejectionFeedback AS rejectionFeedback,
        c.name AS categoryName,
        c.slug AS categorySlug
      ORDER BY t.createdAt DESC
    `);

    const pendingTopics = topicRes.records.map((r) => ({
      itemType: "Topic" as const,
      identifier: r.get("slug"),
      name: r.get("title"),
      description: r.get("description"),
      difficulty: r.get("difficulty"),
      rubricAtoms: r.get("rubricAtoms") || [],
      status: r.get("status") || "DRAFT",
      isLive: r.get("isLive"),
      createdBy: r.get("createdBy") || null,
      createdAt: sanitizeNeo4jValue(r.get("createdAt")),
      rejectionFeedback: r.get("rejectionFeedback") || null,
      parentContext: `${r.get("categoryName")} (${r.get("categorySlug")})`,
    }));

    // 3. Pending Questions
    const qRes = await session.run(`
      MATCH (c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      WHERE q.status IN ['DRAFT', 'IN_REVIEW'] OR coalesce(q.isLive, false) = false
      RETURN 
        q.id AS id,
        q.title AS title,
        q.prompt AS prompt,
        q.difficulty AS difficulty,
        q.rubricGuide AS rubricGuide,
        q.hints AS hints,
        q.status AS status,
        coalesce(q.isLive, false) AS isLive,
        q.createdBy AS createdBy,
        q.createdAt AS createdAt,
        q.rejectionFeedback AS rejectionFeedback,
        t.title AS topicTitle,
        t.slug AS topicSlug
      ORDER BY q.createdAt DESC
    `);

    const pendingQuestions = qRes.records.map((r) => ({
      itemType: "Question" as const,
      identifier: r.get("id"),
      name: r.get("title"),
      prompt: r.get("prompt"),
      difficulty: r.get("difficulty"),
      rubricGuide: r.get("rubricGuide"),
      hints: r.get("hints") || [],
      status: r.get("status") || "DRAFT",
      isLive: r.get("isLive"),
      createdBy: r.get("createdBy") || null,
      createdAt: sanitizeNeo4jValue(r.get("createdAt")),
      rejectionFeedback: r.get("rejectionFeedback") || null,
      parentContext: `${r.get("topicTitle")} (${r.get("topicSlug")})`,
    }));

    const totalCount = pendingCategories.length + pendingTopics.length + pendingQuestions.length;

    return ApiResponse.json({
      success: true,
      totalPending: totalCount,
      categories: pendingCategories,
      topics: pendingTopics,
      questions: pendingQuestions,
    });
  } finally {
    await session.close();
  }
}

/**
 * POST /api/admin/neo4j/approve
 * Approves a Category, Topic, or Question into PUBLISHED & isLive=true.
 */
export async function handlePostNeo4jApprove(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, APPROVAL_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    itemType?: ItemType;
    identifier?: string;
  };

  const itemType = body.itemType;
  const identifier = body.identifier?.trim();

  if (!itemType || !identifier || !["Category", "Topic", "Question"].includes(itemType)) {
    return ApiResponse.json(
      { error: "VALIDATION_FAILED", message: "Valid itemType (Category, Topic, Question) and identifier are required." },
      { status: 400 }
    );
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    let cypher = "";
    if (itemType === "Category") {
      cypher = `
        MATCH (c:Category {slug: $identifier})
        SET c.status = 'PUBLISHED',
            c.isLive = true,
            c.approvedBy = $adminEmail,
            c.approvedAt = datetime(),
            c.rejectionFeedback = null
        RETURN c.slug AS id, c.name AS name
      `;
    } else if (itemType === "Topic") {
      cypher = `
        MATCH (t:Topic {slug: $identifier})
        SET t.status = 'PUBLISHED',
            t.isLive = true,
            t.approvedBy = $adminEmail,
            t.approvedAt = datetime(),
            t.rejectionFeedback = null
        RETURN t.slug AS id, t.title AS name
      `;
    } else if (itemType === "Question") {
      cypher = `
        MATCH (q:Question {id: $identifier})
        SET q.status = 'PUBLISHED',
            q.isLive = true,
            q.approvedBy = $adminEmail,
            q.approvedAt = datetime(),
            q.rejectionFeedback = null
        RETURN q.id AS id, q.title AS name
      `;
    }

    const res = await session.run(cypher, { identifier, adminEmail: admin.email });

    if (res.records.length === 0) {
      return ApiResponse.json(
        { error: "NOT_FOUND", message: `${itemType} "${identifier}" was not found.` },
        { status: 404 }
      );
    }

    const itemName = res.records[0].get("name");

    // Write audit log in PostgreSQL
    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: `APPROVE_${itemType.toUpperCase()}`,
        targetType: itemType,
        targetId: identifier,
        changeDiff: { approvedBy: admin.email, name: itemName },
      },
    });

    return ApiResponse.json({
      success: true,
      message: `Successfully approved and published ${itemType} "${itemName || identifier}".`,
      itemType,
      identifier,
      status: "PUBLISHED",
      isLive: true,
    });
  } finally {
    await session.close();
  }
}

/**
 * POST /api/admin/neo4j/reject
 * Rejects a draft with written feedback reason.
 */
export async function handlePostNeo4jReject(req: ApiRequest): Promise<Response> {
  const auth = await requireAdminRole(req, APPROVAL_ROLES);
  if (!auth.allowed) return auth.response;

  const admin = auth.context.user;

  const body = (await req.json().catch(() => ({}))) as {
    itemType?: ItemType;
    identifier?: string;
    feedbackReason?: string;
  };

  const itemType = body.itemType;
  const identifier = body.identifier?.trim();
  const feedbackReason = body.feedbackReason?.trim();

  if (!itemType || !identifier || !feedbackReason || !["Category", "Topic", "Question"].includes(itemType)) {
    return ApiResponse.json(
      {
        error: "VALIDATION_FAILED",
        message: "Valid itemType, identifier, and a non-empty feedbackReason are required.",
      },
      { status: 400 }
    );
  }

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    let cypher = "";
    if (itemType === "Category") {
      cypher = `
        MATCH (c:Category {slug: $identifier})
        SET c.status = 'REJECTED',
            c.isLive = false,
            c.rejectionFeedback = $feedbackReason,
            c.rejectedBy = $adminEmail,
            c.rejectedAt = datetime()
        RETURN c.slug AS id, c.name AS name
      `;
    } else if (itemType === "Topic") {
      cypher = `
        MATCH (t:Topic {slug: $identifier})
        SET t.status = 'REJECTED',
            t.isLive = false,
            t.rejectionFeedback = $feedbackReason,
            t.rejectedBy = $adminEmail,
            t.rejectedAt = datetime()
        RETURN t.slug AS id, t.title AS name
      `;
    } else if (itemType === "Question") {
      cypher = `
        MATCH (q:Question {id: $identifier})
        SET q.status = 'REJECTED',
            q.isLive = false,
            q.rejectionFeedback = $feedbackReason,
            q.rejectedBy = $adminEmail,
            q.rejectedAt = datetime()
        RETURN q.id AS id, q.title AS name
      `;
    }

    const res = await session.run(cypher, { identifier, feedbackReason, adminEmail: admin.email });

    if (res.records.length === 0) {
      return ApiResponse.json(
        { error: "NOT_FOUND", message: `${itemType} "${identifier}" was not found.` },
        { status: 404 }
      );
    }

    const itemName = res.records[0].get("name");

    // Write audit log in PostgreSQL
    await db.adminAuditLog.create({
      data: {
        userId: admin.id,
        action: `REJECT_${itemType.toUpperCase()}`,
        targetType: itemType,
        targetId: identifier,
        changeDiff: { rejectedBy: admin.email, feedbackReason, name: itemName },
      },
    });

    return ApiResponse.json({
      success: true,
      message: `${itemType} "${itemName || identifier}" marked as REJECTED with feedback.`,
      itemType,
      identifier,
      status: "REJECTED",
      isLive: false,
      feedbackReason,
    });
  } finally {
    await session.close();
  }
}

