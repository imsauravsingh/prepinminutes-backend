/**
 * PrepInMinutes — TASK-P3-01 Automated Verification Test Suite
 *
 * Verifies:
 * 1. GET /api/curriculum/domains returns 10 canonical domains, 122 categories, 371 topics, and dynamic question counts.
 * 2. GET /api/curriculum/hierarchy/:domainSlug returns full 3-tier hierarchy with dynamic questions & rubric counts.
 * 3. Strict 1:1 schema equivalence between Neo4j AuraDB and Neon PostgreSQL failover.
 * 4. Response headers: Cache-Control, ETag, and HTTP 304 Not Modified on If-None-Match.
 * 5. Structured HTTP 404 for invalid domain slugs with valid domains list.
 * 6. Sub-35ms warm response latency benchmarks.
 */

import worker from "../src/index";
import {
  Neo4jCurriculumRepository,
  PostgresCurriculumRepository,
  curriculumRepositoryService,
  CANONICAL_DOMAIN_METADATA,
} from "../src/server/graph/curriculum-repository";
import { closeNeo4jDriver } from "../src/server/graph/neo4j";
import { db } from "../src/server/db/client";

const BASE_URL = "https://api.prepinminutes.internal";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 TASK-P3-01: Unified Curriculum API & Edge Gateway Test Suite");
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
  // Test Group 3: Structured HTTP 404 for Unknown Domain
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing HTTP 404 Structured Taxonomy for Invalid Domain...");
  {
    const req = new Request(`${BASE_URL}/api/curriculum/hierarchy/non-existent-domain-slug`, {
      method: "GET",
    });

    const res = await worker.fetch(req);
    assert(res.status === 404, "Unknown domain slug returns HTTP 404");

    const body = (await res.json()) as any;
    assert(body.success === false, "404 response has success: false");
    assert(body.error?.code === "DOMAIN_NOT_FOUND", `404 error code is DOMAIN_NOT_FOUND (got: ${body.error?.code})`);
    assert(Array.isArray(body.error?.validDomains), "404 provides validDomains array");
    assert(
      body.error?.validDomains?.length === 10 && body.error?.validDomains?.includes("system-design"),
      "404 validDomains contains all 10 canonical domains"
    );
    assert(!!body.error?.requestId && !!body.error?.timestamp, "404 includes requestId and timestamp");
  }

  // -------------------------------------------------------------
  // Test Group 4: Strict 1:1 Schema Parity between Neo4j & Postgres
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing Strict 1:1 Schema Parity between Neo4j & Postgres Repositories...");
  {
    const neo4jRepo = new Neo4jCurriculumRepository();
    const pgRepo = new PostgresCurriculumRepository();

    console.log("  Checking getDomains() contract equivalence...");
    const [neo4jDomains, pgDomains] = await Promise.all([
      neo4jRepo.getDomains(),
      pgRepo.getDomains(),
    ]);

    assert(neo4jDomains.length === 10, `Neo4j returns 10 domains (got ${neo4jDomains.length})`);
    assert(pgDomains.length === 10, `Postgres returns 10 domains (got ${pgDomains.length})`);

    const domainKeys = [
      "slug",
      "name",
      "shortName",
      "description",
      "version",
      "sortOrder",
      "categoriesCount",
      "topicsCount",
      "questionsCount",
      "icon",
      "colorTheme",
    ];

    let domainsEquiv = true;
    for (let i = 0; i < 10; i++) {
      const nDomain = neo4jDomains[i];
      const pDomain = pgDomains[i];
      for (const k of domainKeys) {
        if (!(k in nDomain) || !(k in pDomain)) {
          domainsEquiv = false;
          console.error(`Missing key ${k} in domain ${nDomain.slug}`);
        }
      }
      if (nDomain.slug !== pDomain.slug) {
        domainsEquiv = false;
        console.error(`Domain sort order mismatch: ${nDomain.slug} vs ${pDomain.slug}`);
      }
    }
    assert(domainsEquiv, "Neo4j and Postgres getDomains() match key-for-key across all 10 domains");

    console.log("  Checking getDomainHierarchy('system-design') contract equivalence...");
    const [neo4jHierarchy, pgHierarchy] = await Promise.all([
      neo4jRepo.getDomainHierarchy("system-design"),
      pgRepo.getDomainHierarchy("system-design"),
    ]);

    assert(neo4jHierarchy !== null, "Neo4j hierarchy is non-null");
    assert(pgHierarchy !== null, "Postgres hierarchy is non-null");

    if (neo4jHierarchy && pgHierarchy) {
      assert(
        neo4jHierarchy.domainSlug === pgHierarchy.domainSlug,
        `domainSlug matches: ${neo4jHierarchy.domainSlug}`
      );
      assert(
        neo4jHierarchy.totalCategories === pgHierarchy.totalCategories,
        `totalCategories matches: ${neo4jHierarchy.totalCategories}`
      );
      assert(
        neo4jHierarchy.totalTopics === pgHierarchy.totalTopics,
        `totalTopics matches: ${neo4jHierarchy.totalTopics}`
      );
      assert(
        neo4jHierarchy.categories.length === pgHierarchy.categories.length,
        `Category array length matches: ${neo4jHierarchy.categories.length}`
      );

      const catKeys = ["slug", "name", "pillar", "sortOrder", "topicsCount", "topics"];
      const topicKeys = [
        "slug",
        "topicId",
        "title",
        "priority",
        "difficulty",
        "durationMin",
        "frequency",
        "trend",
        "rubricAtomsCount",
        "questionsCount",
        "practiceHref",
      ];

      let catsMatch = true;
      for (let c = 0; c < neo4jHierarchy.categories.length; c++) {
        const nCat = neo4jHierarchy.categories[c];
        const pCat = pgHierarchy.categories[c];
        for (const ck of catKeys) {
          if (!(ck in nCat) || !(ck in pCat)) catsMatch = false;
        }
        for (let t = 0; t < Math.min(nCat.topics.length, pCat.topics.length); t++) {
          const nTop = nCat.topics[t];
          const pTop = pCat.topics[t];
          for (const tk of topicKeys) {
            if (!(tk in nTop) || !(tk in pTop)) catsMatch = false;
          }
        }
      }
      assert(catsMatch, "100% field contract equivalence across categories & topics between Neo4j and PostgreSQL");
    }
  }

  // -------------------------------------------------------------
  // Test Group 5: Warm Cache Latency Benchmark
  // -------------------------------------------------------------
  console.log("\n🔹 5. Benchmarking Warm Edge Latency (Target: < 35ms)...");
  {
    const req = new Request(`${BASE_URL}/api/curriculum/domains`, { method: "GET" });
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
    console.log(`    ⚡ Average Warm Latency: ${avgLatency.toFixed(2)}ms (Min: ${minLatency.toFixed(2)}ms)`);
    assert(minLatency < 35, `Warm response achieves sub-35ms target (got min ${minLatency.toFixed(2)}ms)`);
  }

  // Teardown
  await closeNeo4jDriver();
  await db.$disconnect();

  console.log("\n==================================================================");
  console.log(`📊 Test Suite Result: ${passedTests}/${totalTests} Tests Passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 TASK-P3-01 Implementation & Contracts Verified Successfully!");
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
