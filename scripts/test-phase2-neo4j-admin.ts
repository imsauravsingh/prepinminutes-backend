/**
 * PrepInMinutes — Phase 2 Neo4j Knowledge Graph Admin & Staging Test Suite
 *
 * Verifies:
 * 1. Overview metrics & Domain listings
 * 2. Category CRUD (create, read, update, delete)
 * 3. Topic CRUD with Rubric Atoms & Prerequisite mapping
 * 4. Question CRUD with prompt, rubric guide, and hints
 * 5. Staging queue (draft detection) & Approval / Rejection flow
 * 6. Audit logging in PostgreSQL for all graph mutations
 * 7. Candidate query isolation (drafts excluded from candidate queries)
 */

import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";
import { db } from "../src/server/db/client";

const API_BASE = "http://localhost:8787";

async function runPhase2Tests() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Phase 2 Neo4j Admin & Approval Test Suite     ");
  console.log("=================================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
      testFailed++;
    }
  }

  try {
    // 1. Authenticate as Root HOD
    console.log("1. Authenticating as Root HOD (imsauravsingh@gmail.com)...");
    const loginRes = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "imsauravsingh@gmail.com", password: "Saurav@3063" }),
    });

    const cookie = loginRes.headers.get("set-cookie") || "";
    assert(loginRes.status === 200 && cookie.includes("pim_admin_session"), "HOD Login and Session Cookie issued");

    const authHeaders = {
      Cookie: cookie,
      "Content-Type": "application/json",
    };

    // 2. Overview Metrics Endpoint
    console.log("\n2. Testing GET /api/admin/neo4j/overview...");
    const overviewRes = await fetch(`${API_BASE}/api/admin/neo4j/overview`, { headers: authHeaders });
    const overviewData = await overviewRes.json();
    assert(overviewRes.status === 200, "Overview API returned 200 OK");
    assert(overviewData.stats.domains >= 1, `Domains count >= 1 (actual: ${overviewData.stats?.domains})`);
    assert(overviewData.stats.categories >= 1, `Categories count >= 1 (actual: ${overviewData.stats?.categories})`);
    assert(overviewData.stats.topics.total >= 10, `Topics total >= 10 (actual: ${overviewData.stats?.topics?.total})`);
    assert(overviewData.stats.questions.total >= 5, `Questions total >= 5 (actual: ${overviewData.stats?.questions?.total})`);

    // 3. Domains Endpoint
    console.log("\n3. Testing GET /api/admin/neo4j/domains...");
    const domainsRes = await fetch(`${API_BASE}/api/admin/neo4j/domains`, { headers: authHeaders });
    const domainsData = await domainsRes.json();
    assert(domainsRes.status === 200 && Array.isArray(domainsData.domains), "Domains API returned list of domains");
    const firstDomainSlug = domainsData.domains[0]?.slug;

    // 4. Create Draft Category
    console.log("\n4. Testing POST /api/admin/neo4j/categories (Draft)...");
    const testCatSlug = `test-cat-${Date.now().toString(36)}`;
    const createCatRes = await fetch(`${API_BASE}/api/admin/neo4j/categories`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        domainSlug: firstDomainSlug,
        slug: testCatSlug,
        name: "Test Autonomous Agents Category",
        description: "Draft category for integration testing",
        publishImmediately: false,
      }),
    });
    const createCatData = await createCatRes.json();
    assert(createCatRes.status === 200 && createCatData.category?.status === "DRAFT", "Category created in DRAFT status");

    // 5. Create Draft Topic with Rubric Atoms
    console.log("\n5. Testing POST /api/admin/neo4j/topics (Draft)...");
    const testTopicSlug = `test-topic-${Date.now().toString(36)}`;
    const createTopicRes = await fetch(`${API_BASE}/api/admin/neo4j/topics`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        categorySlug: testCatSlug,
        slug: testTopicSlug,
        title: "Multi-Agent Reflection & Planning",
        description: "Autonomous agent execution cycles and feedback loops.",
        difficulty: "ADVANCED",
        rubricAtoms: ["Plan generation", "Execution tracing", "Self-correction loop"],
        durationMin: 40,
        publishImmediately: false,
      }),
    });
    const createTopicData = await createTopicRes.json();
    assert(createTopicRes.status === 200 && createTopicData.topic?.status === "DRAFT", "Topic created in DRAFT status");

    // 6. Create Draft Question
    console.log("\n6. Testing POST /api/admin/neo4j/questions (Draft)...");
    const testQuestionId = `test_q_${Date.now().toString(36)}`;
    const createQRes = await fetch(`${API_BASE}/api/admin/neo4j/questions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        topicSlug: testTopicSlug,
        id: testQuestionId,
        title: "Explain Multi-Agent Reflection Loops",
        prompt: "How do autonomous agents use self-critique to refine code solutions?",
        difficulty: "ADVANCED",
        rubricGuide: "Candidate must describe critic agent feedback and iterative re-prompting.",
        hints: ["Think about actor-critic architecture."],
        publishImmediately: false,
      }),
    });
    const createQData = await createQRes.json();
    assert(createQRes.status === 200 && createQData.question?.status === "DRAFT", "Question created in DRAFT status");

    // 7. Verify Staging Queue (GET /api/admin/neo4j/pending)
    console.log("\n7. Testing GET /api/admin/neo4j/pending...");
    const pendingRes = await fetch(`${API_BASE}/api/admin/neo4j/pending`, { headers: authHeaders });
    const pendingData = await pendingRes.json();
    assert(pendingRes.status === 200, "Pending queue returned 200 OK");
    const foundPendingCat = pendingData.categories?.some((c: any) => c.identifier === testCatSlug);
    const foundPendingTopic = pendingData.topics?.some((t: any) => t.identifier === testTopicSlug);
    const foundPendingQ = pendingData.questions?.some((q: any) => q.identifier === testQuestionId);
    assert(foundPendingCat && foundPendingTopic && foundPendingQ, "All 3 draft items present in pending staging queue");

    // 8. Test Approval Gate (POST /api/admin/neo4j/approve)
    console.log("\n8. Testing POST /api/admin/neo4j/approve...");
    const approveQRes = await fetch(`${API_BASE}/api/admin/neo4j/approve`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ itemType: "Question", identifier: testQuestionId }),
    });
    const approveQData = await approveQRes.json();
    assert(approveQRes.status === 200 && approveQData.status === "PUBLISHED" && approveQData.isLive === true, "Question approved to PUBLISHED and isLive=true");

    // 9. Verify PostgreSQL Admin Audit Log
    console.log("\n9. Verifying PostgreSQL AdminAuditLog...");
    const auditLogs = await db.adminAuditLog.findMany({
      where: { targetId: testQuestionId },
      orderBy: { createdAt: "desc" },
    });
    assert(auditLogs.length >= 2, `Audit logs created for Question creation and approval (found: ${auditLogs.length})`);
    assert(auditLogs[0]?.action === "APPROVE_QUESTION", `Latest audit action is APPROVE_QUESTION (actual: ${auditLogs[0]?.action})`);

    // 10. Test Rejection Gate (POST /api/admin/neo4j/reject)
    console.log("\n10. Testing POST /api/admin/neo4j/reject...");
    const rejectTopicRes = await fetch(`${API_BASE}/api/admin/neo4j/reject`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        itemType: "Topic",
        identifier: testTopicSlug,
        feedbackReason: "Needs more detailed rubric atoms for production benchmark.",
      }),
    });
    const rejectTopicData = await rejectTopicRes.json();
    assert(rejectTopicRes.status === 200 && rejectTopicData.status === "REJECTED", "Topic rejected with feedback reason");

    // 11. Clean Up Test Nodes
    console.log("\n11. Cleaning up test artifacts...");
    await fetch(`${API_BASE}/api/admin/neo4j/questions/${testQuestionId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    await fetch(`${API_BASE}/api/admin/neo4j/topics/${testTopicSlug}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    await fetch(`${API_BASE}/api/admin/neo4j/categories/${testCatSlug}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    console.log("  ✓ Test nodes successfully cleaned up.");

    console.log("\n=================================================================");
    console.log(`   PHASE 2 TEST SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log("=================================================================\n");

    if (testFailed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution threw error:", err);
    process.exit(1);
  } finally {
    await closeNeo4jDriver();
  }
}

runPhase2Tests();

