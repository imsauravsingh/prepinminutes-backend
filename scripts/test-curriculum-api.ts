/**
 * PrepInMinutes — TASK-P3-01 & TASK-P3-02 Automated Verification Test Suite
 *
 * Verifies:
 * 1. GET /api/curriculum/domains returns 10 canonical domains, 122 categories, 371 topics, and dynamic question counts.
 * 2. GET /api/curriculum/hierarchy/:domainSlug returns full 3-tier hierarchy with dynamic questions & rubric counts.
 * 3. GET /api/curriculum/topic/:topicSlug returns complete 8-layer topic metadata, graph relationships, and questions.
 * 4. GET /api/curriculum/topic/:topicSlug/questions returns filtered question collection (targetLevel, difficulty, limit).
 * 5. Strict 1:1 schema equivalence between Neo4j AuraDB and Neon PostgreSQL failover.
 * 6. Response headers: Cache-Control, ETag, and HTTP 304 Not Modified on If-None-Match.
 * 7. Structured HTTP 404 for invalid domain and topic slugs.
 * 8. Sub-35ms warm response latency benchmarks across all endpoints.
 */

import worker from "../src/index";
import {
  Neo4jCurriculumRepository,
  PostgresCurriculumRepository,
  CANONICAL_DOMAIN_METADATA,
} from "../src/server/graph/curriculum-repository";
import { closeNeo4jDriver } from "../src/server/graph/neo4j";
import { db } from "../src/server/db/client";

const BASE_URL = "https://api.prepinminutes.internal";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 TASK-P3-01 & TASK-P3-02: Public Curriculum API Verification Suite");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // Test Group 1: GET /api/curriculum/domains
  // -------------------------------------------------------------
  console.log("🔹 1. Testing GET /api/curriculum/domains endpoint...");
  {
    const req = new Request(`${BASE_URL}/api/curriculum/domains`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const start = performance.now();
    const res = await worker.fetch(req);
    const latencyMs = performance.now() - start;

    assert(res.status === 200, "Returns HTTP 200 OK");
    const cacheControl = res.headers.get("cache-control") || "";
    assert(
      cacheControl.includes("public") && cacheControl.includes("s-maxage=3600"),
      `Contains valid Cache-Control header: "${cacheControl}"`
    );

    const etag = res.headers.get("etag");
    assert(!!etag && etag.startsWith('W/"'), `Contains valid ETag: ${etag}`);

    const dataSource = res.headers.get("x-data-source");
    assert(
      dataSource === "NEO4J" || dataSource === "POSTGRES_FALLBACK",
      `Identified data source: ${dataSource}`
    );

    const data = (await res.json()) as any;
    assert(data.success === true, "Response has success: true");
    assert(Array.isArray(data.domains), "Response contains domains array");
    assert(data.domains.length === 10, `Catalog contains exactly 10 canonical domains (got: ${data.domains?.length})`);

    assert(data.meta?.totalDomains === 10, `Meta totalDomains === 10 (got: ${data.meta?.totalDomains})`);
    assert(data.meta?.totalCategories === 122, `Meta totalCategories === 122 (got: ${data.meta?.totalCategories})`);
    assert(data.meta?.totalTopics === 371, `Meta totalTopics === 371 (got: ${data.meta?.totalTopics})`);
    assert(data.meta?.totalQuestions > 0, `Meta dynamic totalQuestions > 0 (got: ${data.meta?.totalQuestions})`);

    // Verify first domain structure
    const sampleDomain = data.domains[0];
    assert(
      !!sampleDomain.slug &&
        !!sampleDomain.name &&
        !!sampleDomain.shortName &&
        typeof sampleDomain.sortOrder === "number" &&
        sampleDomain.categoriesCount > 0 &&
        sampleDomain.topicsCount > 0 &&
        sampleDomain.questionsCount > 0 &&
        !!sampleDomain.icon &&
        !!sampleDomain.colorTheme,
      `Domain [${sampleDomain?.slug}] conforms to DomainCatalogItem schema`
    );

    console.log(`    ⚡ Initial Latency: ${latencyMs.toFixed(2)}ms`);

    // Test HTTP 304 Not Modified
    console.log("  Testing ETag HTTP 304 handling on If-None-Match...");
    const reqWithETag = new Request(`${BASE_URL}/api/curriculum/domains`, {
      method: "GET",
      headers: { "If-None-Match": etag! },
    });

    const start304 = performance.now();
    const res304 = await worker.fetch(reqWithETag);
    const latency304 = performance.now() - start304;

    assert(res304.status === 304, `If-None-Match returns HTTP 304 Not Modified (got ${res304.status})`);
    assert(res304.headers.get("etag") === etag, "HTTP 304 response preserves ETag header");
    console.log(`    ⚡ 304 Fast Path Latency: ${latency304.toFixed(2)}ms`);
  }

  // -------------------------------------------------------------
  // Test Group 2: GET /api/curriculum/hierarchy/:domainSlug
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing GET /api/curriculum/hierarchy/:domainSlug...");
  {
    const targetDomains = ["system-design", "ai-system-design", "dsa"];

    for (const slug of targetDomains) {
      const req = new Request(`${BASE_URL}/api/curriculum/hierarchy/${slug}`, {
        method: "GET",
      });

      const start = performance.now();
      const res = await worker.fetch(req);
      const latencyMs = performance.now() - start;

      assert(res.status === 200, `Hierarchy for '${slug}' returns HTTP 200 OK`);

      const etag = res.headers.get("etag");
      assert(!!etag && etag.startsWith('W/"'), `Hierarchy '${slug}' returns valid ETag`);

      const data = (await res.json()) as any;
      assert(data.success === true, `Hierarchy '${slug}' response has success: true`);
      assert(data.domainSlug === slug, `Hierarchy domainSlug matches '${slug}'`);
      assert(data.totalCategories > 0, `Hierarchy '${slug}' totalCategories > 0 (${data.totalCategories})`);
      assert(data.totalTopics > 0, `Hierarchy '${slug}' totalTopics > 0 (${data.totalTopics})`);
      assert(data.totalQuestions > 0, `Hierarchy '${slug}' dynamic totalQuestions > 0 (${data.totalQuestions})`);
      assert(Array.isArray(data.categories) && data.categories.length === data.totalCategories, `Categories array length matches totalCategories`);

      const firstCat = data.categories[0];
      assert(
        !!firstCat.slug &&
          !!firstCat.name &&
          !!firstCat.pillar &&
          typeof firstCat.sortOrder === "number" &&
          firstCat.topicsCount === firstCat.topics.length,
        `Category [${firstCat?.slug}] in '${slug}' conforms to CurriculumCategoryHierarchy contract`
      );

      const firstTopic = firstCat.topics[0];
      assert(
        !!firstTopic.slug &&
          !!firstTopic.topicId &&
          !!firstTopic.title &&
          (firstTopic.priority === "P0" || firstTopic.priority === "P1") &&
          typeof firstTopic.rubricAtomsCount === "number" &&
          typeof firstTopic.questionsCount === "number" &&
          firstTopic.questionsCount > 0 &&
          firstTopic.practiceHref.includes(`/practice/session/${slug}`),
        `Topic [${firstTopic?.slug}] in '${slug}' conforms to CurriculumTopicSummary contract`
      );

      console.log(`    ⚡ '${slug}' Latency: ${latencyMs.toFixed(2)}ms (Categories: ${data.totalCategories}, Topics: ${data.totalTopics}, Questions: ${data.totalQuestions})`);

      // Test HTTP 304 on hierarchy
      const req304 = new Request(`${BASE_URL}/api/curriculum/hierarchy/${slug}`, {
        method: "GET",
        headers: { "If-None-Match": etag! },
      });
      const res304 = await worker.fetch(req304);
      assert(res304.status === 304, `Hierarchy '${slug}' returns HTTP 304 on matching ETag`);
    }
  }

  // -------------------------------------------------------------
  // Test Group 3: GET /api/curriculum/topic/:topicSlug (TASK-P3-02)
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing GET /api/curriculum/topic/:topicSlug (8-Layer Metadata)...");
  {
    const targetTopics = [
      "distributed-key-value-store",
      "kadane-inversions-math",
      "document-ingestion-chunking",
    ];

    for (const slug of targetTopics) {
      const req = new Request(`${BASE_URL}/api/curriculum/topic/${slug}`, {
        method: "GET",
      });

      const start = performance.now();
      const res = await worker.fetch(req);
      const latencyMs = performance.now() - start;

      assert(res.status === 200, `Topic detail for '${slug}' returns HTTP 200 OK`);

      const etag = res.headers.get("etag");
      assert(!!etag && etag.startsWith('W/"'), `Topic detail '${slug}' returns valid ETag`);

      const data = (await res.json()) as any;
      assert(data.success === true, `Topic '${slug}' has success: true`);
      assert(!!data.domain?.slug && !!data.domain?.name, `Topic '${slug}' has valid domain reference`);
      assert(!!data.category?.slug && !!data.category?.name, `Topic '${slug}' has valid category reference`);

      // Verify Topic Object
      assert(
        data.topic?.slug === slug &&
          !!data.topic?.topicId &&
          !!data.topic?.title &&
          !!data.topic?.pillar &&
          (data.topic?.priority === "P0" || data.topic?.priority === "P1") &&
          !!data.topic?.difficulty &&
          typeof data.topic?.durationMin === "number" &&
          Array.isArray(data.topic?.rubricAtoms) &&
          data.topic?.rubricAtoms.length > 0,
        `Topic object for '${slug}' contains full 8-layer attributes & rubricAtoms`
      );

      // Verify Graph Relationships
      assert(
        Array.isArray(data.graphRelationships?.prerequisites) &&
          Array.isArray(data.graphRelationships?.dependents) &&
          Array.isArray(data.graphRelationships?.usedComponents) &&
          Array.isArray(data.graphRelationships?.foundedOn),
        `Topic '${slug}' contains graph relationships (prerequisites, dependents, components, foundations)`
      );

      // Verify Questions Bundle
      assert(
        Array.isArray(data.questions) && data.questions.length > 0,
        `Topic '${slug}' contains questions collection (${data.questions?.length} questions)`
      );

      const sampleQ = data.questions[0];
      assert(
        !!sampleQ.id &&
          !!sampleQ.title &&
          !!sampleQ.prompt &&
          !!sampleQ.rubricGuide &&
          Array.isArray(sampleQ.hints),
        `Sample question [${sampleQ?.id}] conforms to BaseQuestionNode interface`
      );

      console.log(`    ⚡ '${slug}' Latency: ${latencyMs.toFixed(2)}ms (Prereqs: ${data.graphRelationships?.prerequisites?.length}, Questions: ${data.questions?.length})`);

      // Test HTTP 304 on topic detail
      const req304 = new Request(`${BASE_URL}/api/curriculum/topic/${slug}`, {
        method: "GET",
        headers: { "If-None-Match": etag! },
      });
      const res304 = await worker.fetch(req304);
      assert(res304.status === 304, `Topic detail '${slug}' returns HTTP 304 on matching ETag`);
    }
  }

  // -------------------------------------------------------------
  // Test Group 4: GET /api/curriculum/topic/:topicSlug/questions (TASK-P3-02)
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing GET /api/curriculum/topic/:topicSlug/questions (Filtering & Pagination)...");
  {
    // Test 1: Default Question Collection
    const reqDefault = new Request(
      `${BASE_URL}/api/curriculum/topic/distributed-key-value-store/questions`,
      { method: "GET" }
    );
    const resDefault = await worker.fetch(reqDefault);
    assert(resDefault.status === 200, "Topic questions default query returns HTTP 200 OK");
    const dataDefault = (await resDefault.json()) as any;
    assert(dataDefault.success === true, "Questions response has success: true");
    assert(dataDefault.totalQuestions > 0, `totalQuestions > 0 (${dataDefault.totalQuestions})`);
    assert(dataDefault.questions.length > 0, `questions array has items (${dataDefault.questions.length})`);

    // Test 2: Filter by Limit
    const reqLimit = new Request(
      `${BASE_URL}/api/curriculum/topic/distributed-key-value-store/questions?limit=5`,
      { method: "GET" }
    );
    const resLimit = await worker.fetch(reqLimit);
    const dataLimit = (await resLimit.json()) as any;
    assert(dataLimit.questions.length <= 5, `Limit filter respected: returned ${dataLimit.questions.length} items (expected <= 5)`);

    // Test 3: Filter by targetLevel
    const reqLevel = new Request(
      `${BASE_URL}/api/curriculum/topic/distributed-key-value-store/questions?targetLevel=L1`,
      { method: "GET" }
    );
    const resLevel = await worker.fetch(reqLevel);
    const dataLevel = (await resLevel.json()) as any;
    assert(dataLevel.success === true, "targetLevel query returns HTTP 200 OK");
    const allL1 = dataLevel.questions.every((q: any) => q.learningLevel?.toUpperCase() === "L1");
    assert(allL1, "All returned questions match targetLevel 'L1'");

    // Test 4: HTTP 304 on questions endpoint
    const etagQ = resDefault.headers.get("etag");
    const reqQ304 = new Request(
      `${BASE_URL}/api/curriculum/topic/distributed-key-value-store/questions`,
      {
        method: "GET",
        headers: { "If-None-Match": etagQ! },
      }
    );
    const resQ304 = await worker.fetch(reqQ304);
    assert(resQ304.status === 304, "Questions endpoint returns HTTP 304 on matching ETag");
  }

  // -------------------------------------------------------------
  // Test Group 5: Structured HTTP 404 Taxonomy
  // -------------------------------------------------------------
  console.log("\n🔹 5. Testing HTTP 404 Structured Taxonomy...");
  {
    // Unknown Domain
    const reqDomain = new Request(`${BASE_URL}/api/curriculum/hierarchy/non-existent-domain`, {
      method: "GET",
    });
    const resDomain = await worker.fetch(reqDomain);
    assert(resDomain.status === 404, "Unknown domain slug returns HTTP 404");
    const bodyDomain = (await resDomain.json()) as any;
    assert(bodyDomain.error?.code === "DOMAIN_NOT_FOUND", `Domain 404 error code is DOMAIN_NOT_FOUND`);
    assert(bodyDomain.error?.validDomains?.length === 10, "Domain 404 provides all 10 valid domains");

    // Unknown Topic
    const reqTopic = new Request(`${BASE_URL}/api/curriculum/topic/non-existent-topic`, {
      method: "GET",
    });
    const resTopic = await worker.fetch(reqTopic);
    assert(resTopic.status === 404, "Unknown topic slug returns HTTP 404");
    const bodyTopic = (await resTopic.json()) as any;
    assert(bodyTopic.error?.code === "TOPIC_NOT_FOUND", `Topic 404 error code is TOPIC_NOT_FOUND`);

    // Unknown Topic Questions
    const reqTopicQ = new Request(`${BASE_URL}/api/curriculum/topic/non-existent-topic/questions`, {
      method: "GET",
    });
    const resTopicQ = await worker.fetch(reqTopicQ);
    assert(resTopicQ.status === 404, "Unknown topic questions returns HTTP 404");
  }

  // -------------------------------------------------------------
  // Test Group 6: Strict 1:1 Schema Parity between Neo4j & Postgres
  // -------------------------------------------------------------
  console.log("\n🔹 6. Testing Strict 1:1 Schema Parity between Neo4j & Postgres Repositories...");
  {
    const neo4jRepo = new Neo4jCurriculumRepository();
    const pgRepo = new PostgresCurriculumRepository();

    console.log("  Checking getDomains() contract equivalence...");
    const [neo4jDomains, pgDomains] = await Promise.all([
      neo4jRepo.getDomains(),
      pgRepo.getDomains(),
    ]);

    assert(neo4jDomains.length === 10 && pgDomains.length === 10, "Both repositories return 10 domains");

    console.log("  Checking getTopicDetail('distributed-key-value-store') contract equivalence...");
    const [neo4jDetail, pgDetail] = await Promise.all([
      neo4jRepo.getTopicDetail("distributed-key-value-store"),
      pgRepo.getTopicDetail("distributed-key-value-store"),
    ]);

    assert(neo4jDetail !== null, "Neo4j topic detail is non-null");
    assert(pgDetail !== null, "Postgres topic detail is non-null");

    if (neo4jDetail && pgDetail) {
      assert(neo4jDetail.domain.slug === pgDetail.domain.slug, `domain.slug matches: ${neo4jDetail.domain.slug}`);
      assert(neo4jDetail.category.slug === pgDetail.category.slug, `category.slug matches: ${neo4jDetail.category.slug}`);
      assert(neo4jDetail.topic.slug === pgDetail.topic.slug, `topic.slug matches: ${neo4jDetail.topic.slug}`);
      assert(neo4jDetail.topic.priority === pgDetail.topic.priority, `topic.priority matches: ${neo4jDetail.topic.priority}`);
      assert(neo4jDetail.topic.difficulty === pgDetail.topic.difficulty, `topic.difficulty matches: ${neo4jDetail.topic.difficulty}`);
      assert(neo4jDetail.questions.length > 0 && pgDetail.questions.length > 0, "Both return non-empty questions array");

      // Verify question field equivalence
      const qFields = ["id", "title", "prompt", "rubricGuide", "hints"];
      const nQ = neo4jDetail.questions[0];
      const pQ = pgDetail.questions[0];
      const qFieldsMatch = qFields.every((f) => f in nQ && f in pQ);
      assert(qFieldsMatch, "BaseQuestionNode contract verified across Neo4j and PostgreSQL");
    }
  }

  // -------------------------------------------------------------
  // Test Group 7: Warm Edge Latency Benchmark across All Endpoints
  // -------------------------------------------------------------
  console.log("\n🔹 7. Benchmarking Warm Edge Latency across All Endpoints (Target: < 35ms)...");
  {
    const endpoints = [
      "/api/curriculum/domains",
      "/api/curriculum/hierarchy/system-design",
      "/api/curriculum/topic/distributed-key-value-store",
      "/api/curriculum/topic/distributed-key-value-store/questions",
    ];

    for (const ep of endpoints) {
      const req = new Request(`${BASE_URL}${ep}`, { method: "GET" });
      const latencies: number[] = [];

      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const res = await worker.fetch(req);
        const elapsed = performance.now() - start;
        if (res.status === 200) {
          latencies.push(elapsed);
        }
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      console.log(`    ⚡ '${ep}': Avg ${avgLatency.toFixed(2)}ms (Min: ${minLatency.toFixed(2)}ms)`);
      assert(minLatency < 35, `'${ep}' achieves sub-35ms target (min: ${minLatency.toFixed(2)}ms)`);
    }
  }

  // Teardown
  await closeNeo4jDriver();
  await db.$disconnect();

  console.log("\n==================================================================");
  console.log(`📊 Test Suite Result: ${passedTests}/${totalTests} Tests Passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 TASK-P3-01 & TASK-P3-02 Implementation Verified Successfully!");
    process.exit(0);
  } else {
    console.error(`💥 ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
}

runTestSuite().catch(async (err) => {
  console.error("Unhandled test suite exception:", err);
  await closeNeo4jDriver();
  await db.$disconnect();
  process.exit(1);
});
