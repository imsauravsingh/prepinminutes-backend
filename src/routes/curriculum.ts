/**
 * PrepInMinutes — Public Curriculum Hierarchy, Topic Detail & Question Bundle Endpoints
 *
 * Implements:
 * 1. GET /api/curriculum/domains
 *    - Catalog summary of all 10 canonical domains
 *    - Dynamic category, topic, and question counts
 *    - ETag and Cache-Control headers
 *    - In-Memory L0 Edge Cache (< 5ms warm latency)
 *
 * 2. GET /api/curriculum/hierarchy/:domainSlug
 *    - Full 3-tier hierarchy (Domain -> Categories -> Topics)
 *    - Dynamic question counts and rubric atom counts
 *    - Strict 1:1 schema equivalence between Neo4j and Postgres
 *    - HTTP 304 Not Modified support via ETag
 *    - Structured HTTP 404 for unknown domains
 *
 * 3. GET /api/curriculum/topic/:topicSlug
 *    - Complete 8-layer topic metadata:
 *      - Domain, Category, Topic attributes, Rubric atoms
 *      - Inbound Prerequisites, Outbound Dependents, Component edges, Foundational edges
 *      - Questions collection with hints, rubrics, keywords, and follow-up probes
 *
 * 4. GET /api/curriculum/topic/:topicSlug/questions
 *    - Dynamic question bundle with query filters:
 *      - ?targetLevel=senior|staff|l1..l5
 *      - ?difficulty=BEGINNER|INTERMEDIATE|ADVANCED|EXPERT
 *      - ?limit=1..100
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import {
  curriculumRepositoryService,
  CANONICAL_DOMAIN_METADATA,
} from "../server/graph/curriculum-repository";
import {
  CurriculumDomainsResponse,
  CurriculumHierarchyResponse,
  TopicDetailResponse,
  TopicQuestionsResponse,
} from "../server/graph/types";

/**
 * Fast synchronous DJB2-based 32-bit hash for ETag generation.
 * Compatible across Node.js and Cloudflare Workers runtime.
 */
export function generateETag(version: string, data: any): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const hex = (hash >>> 0).toString(16);
  return `W/"${version}-${hex}"`;
}

const CACHE_CONTROL_VALUE =
  "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400";

// L0 In-Memory Edge Cache for instant sub-10ms warm responses
interface EdgeCacheEntry<T> {
  payload: T;
  etag: string;
  dataSource: string;
  timestamp: number;
}

const MEMORY_CACHE_TTL_MS = 60 * 1000; // 60 seconds L0 Edge Cache
const memoryCache = new Map<string, EdgeCacheEntry<any>>();

export function clearCurriculumMemoryCache(): void {
  memoryCache.clear();
}

/**
 * GET /api/curriculum/domains
 * Returns catalog summary of all domains with dynamic category, topic, and question counts.
 */
export async function handleGetCurriculumDomains(
  req: ApiRequest
): Promise<Response> {
  const curriculumVersion = process.env.CURRICULUM_VERSION || "v42";
  const cacheKey = `curriculum:domains:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // Check L0 Edge Memory Cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cached.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Data-Source": `${cached.dataSource}_EDGE_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === "*")) {
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    return ApiResponse.json(cached.payload, {
      status: 200,
      headers,
    });
  }

  // Cache Miss -> Fetch from repository service
  const startTime = Date.now();
  const result = await curriculumRepositoryService.getDomains();
  const latencyMs = Date.now() - startTime;

  const totalCategories = result.data.reduce(
    (acc, d) => acc + d.categoriesCount,
    0
  );
  const totalTopics = result.data.reduce((acc, d) => acc + d.topicsCount, 0);
  const totalQuestions = result.data.reduce(
    (acc, d) => acc + d.questionsCount,
    0
  );

  const payload: CurriculumDomainsResponse & { success: boolean } = {
    success: true,
    domains: result.data,
    meta: {
      curriculumVersion,
      totalDomains: result.data.length,
      totalCategories,
      totalTopics,
      totalQuestions,
      dataSource: result.dataSource,
    },
  };

  const etag = generateETag(curriculumVersion, payload);

  // Store in L0 Edge Memory Cache
  memoryCache.set(cacheKey, {
    payload,
    etag,
    dataSource: result.dataSource,
    timestamp: now,
  });

  const headers: Record<string, string> = {
    "Cache-Control": CACHE_CONTROL_VALUE,
    ETag: etag,
    "X-Curriculum-Version": curriculumVersion,
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, {
      status: 304,
      headers,
    });
  }

  return ApiResponse.json(payload, {
    status: 200,
    headers,
  });
}

/**
 * GET /api/curriculum/hierarchy/:domainSlug
 * Returns complete 3-tier hierarchy (Domain -> Categories -> Topics)
 */
export async function handleGetCurriculumHierarchy(
  req: ApiRequest,
  domainSlug: string
): Promise<Response> {
  const cleanSlug = (domainSlug || "").trim().toLowerCase();
  const curriculumVersion = process.env.CURRICULUM_VERSION || "v42";
  const cacheKey = `curriculum:hierarchy:${cleanSlug}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // Check L0 Edge Memory Cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cached.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Data-Source": `${cached.dataSource}_EDGE_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === "*")) {
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    return ApiResponse.json(cached.payload, {
      status: 200,
      headers,
    });
  }

  const startTime = Date.now();
  const result = await curriculumRepositoryService.getDomainHierarchy(cleanSlug);
  const latencyMs = Date.now() - startTime;

  if (!result.data) {
    const validDomains = Object.keys(CANONICAL_DOMAIN_METADATA);
    return ApiResponse.json(
      {
        success: false,
        error: {
          code: "DOMAIN_NOT_FOUND",
          message: `The curriculum domain '${domainSlug}' was not found.`,
          validDomains,
          requestId: `req_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
          "X-Data-Source": result.dataSource,
          "X-Response-Time-Ms": latencyMs.toString(),
        },
      }
    );
  }

  const payload: CurriculumHierarchyResponse & { success: boolean } = {
    success: true,
    ...result.data,
  };

  const etag = generateETag(curriculumVersion, payload);

  // Store in L0 Edge Memory Cache
  memoryCache.set(cacheKey, {
    payload,
    etag,
    dataSource: result.dataSource,
    timestamp: now,
  });

  const headers: Record<string, string> = {
    "Cache-Control": CACHE_CONTROL_VALUE,
    ETag: etag,
    "X-Curriculum-Version": curriculumVersion,
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, {
      status: 304,
      headers,
    });
  }

  return ApiResponse.json(payload, {
    status: 200,
    headers,
  });
}

/**
 * GET /api/curriculum/topic/:topicSlug
 * Returns complete 8-layer detail for any topic, including questions and graph relationships.
 */
export async function handleGetCurriculumTopicDetail(
  req: ApiRequest,
  topicSlug: string
): Promise<Response> {
  const cleanSlug = (topicSlug || "").trim().toLowerCase();
  const curriculumVersion = process.env.CURRICULUM_VERSION || "v42";
  const cacheKey = `curriculum:topic:${cleanSlug}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // Check L0 Edge Memory Cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cached.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Data-Source": `${cached.dataSource}_EDGE_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === "*")) {
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    return ApiResponse.json(cached.payload, {
      status: 200,
      headers,
    });
  }

  const startTime = Date.now();
  const result = await curriculumRepositoryService.getTopicDetail(cleanSlug);
  const latencyMs = Date.now() - startTime;

  if (!result.data) {
    return ApiResponse.json(
      {
        success: false,
        error: {
          code: "TOPIC_NOT_FOUND",
          message: `The curriculum topic '${topicSlug}' was not found.`,
          requestId: `req_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
          "X-Data-Source": result.dataSource,
          "X-Response-Time-Ms": latencyMs.toString(),
        },
      }
    );
  }

  const payload: TopicDetailResponse & { success: boolean } = {
    success: true,
    ...result.data,
  };

  const etag = generateETag(curriculumVersion, payload);

  // Store in L0 Edge Memory Cache
  memoryCache.set(cacheKey, {
    payload,
    etag,
    dataSource: result.dataSource,
    timestamp: now,
  });

  const headers: Record<string, string> = {
    "Cache-Control": CACHE_CONTROL_VALUE,
    ETag: etag,
    "X-Curriculum-Version": curriculumVersion,
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, {
      status: 304,
      headers,
    });
  }

  return ApiResponse.json(payload, {
    status: 200,
    headers,
  });
}

/**
 * GET /api/curriculum/topic/:topicSlug/questions
 * Returns dynamic question collection with optional query filtering (targetLevel, difficulty, limit).
 */
export async function handleGetCurriculumTopicQuestions(
  req: ApiRequest,
  topicSlug: string
): Promise<Response> {
  const cleanSlug = (topicSlug || "").trim().toLowerCase();
  const targetLevel = req.nextUrl.searchParams.get("targetLevel") || undefined;
  const difficulty = req.nextUrl.searchParams.get("difficulty") || undefined;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100)
    : 20;

  const curriculumVersion = process.env.CURRICULUM_VERSION || "v42";
  const cacheKey = `curriculum:questions:${cleanSlug}:${targetLevel || "all"}:${
    difficulty || "all"
  }:${limit}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // Check L0 Edge Memory Cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cached.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Data-Source": `${cached.dataSource}_EDGE_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === "*")) {
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    return ApiResponse.json(cached.payload, {
      status: 200,
      headers,
    });
  }

  const startTime = Date.now();
  const result = await curriculumRepositoryService.getTopicQuestions(cleanSlug, {
    targetLevel,
    difficulty,
    limit,
  });
  const latencyMs = Date.now() - startTime;

  if (!result.data) {
    return ApiResponse.json(
      {
        success: false,
        error: {
          code: "TOPIC_NOT_FOUND",
          message: `The curriculum topic '${topicSlug}' was not found.`,
          requestId: `req_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
          "X-Data-Source": result.dataSource,
          "X-Response-Time-Ms": latencyMs.toString(),
        },
      }
    );
  }

  const payload: TopicQuestionsResponse & { success: boolean } = {
    success: true,
    ...result.data,
  };

  const etag = generateETag(curriculumVersion, payload);

  // Store in L0 Edge Memory Cache
  memoryCache.set(cacheKey, {
    payload,
    etag,
    dataSource: result.dataSource,
    timestamp: now,
  });

  const headers: Record<string, string> = {
    "Cache-Control": CACHE_CONTROL_VALUE,
    ETag: etag,
    "X-Curriculum-Version": curriculumVersion,
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, {
      status: 304,
      headers,
    });
  }

  return ApiResponse.json(payload, {
    status: 200,
    headers,
  });
}
