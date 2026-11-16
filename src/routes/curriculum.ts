/**
 * PrepInMinutes — Public Curriculum Hierarchy, Topic Detail & Question Bundle Endpoints
 *
 * Implements:
 * 1. GET /api/curriculum/domains
 *    - Catalog summary of all 10 canonical domains
 *    - Dynamic category, topic, and question counts
 *    - ETag and Cache-Control headers
 *    - Multi-Tier Caching: L0 Memory (< 1ms) + L2 Upstash Redis (< 15ms)
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
 *    - Dynamic question bundle with query filtering (targetLevel, difficulty, limit)
 *
 * 5. POST /api/admin/curriculum/publish
 *    - Increments curriculum publishing version (e.g. v42 -> v43)
 *    - Atomically updates cache namespace and clears edge L0 memory
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
import {
  CurriculumCacheManager,
  CurriculumCacheKeys,
} from "../server/graph/cache";
import { requireAdminRole } from "../server/auth/admin-auth";
import { AdminRole } from "@prisma/client";

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

// L0 In-Memory Edge Cache for instant sub-1ms warm responses
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
  const curriculumVersion = await CurriculumCacheManager.getCurriculumVersion();
  const cacheKey = `curriculum:domains:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // 1. Check L0 Edge Memory Cache
  const cachedL0 = memoryCache.get(cacheKey);
  if (cachedL0 && now - cachedL0.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cachedL0.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L0_MEMORY",
      "X-Data-Source": `${cachedL0.dataSource}_L0_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cachedL0.etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL0.payload, { status: 200, headers });
  }

  // 2. Check L2 Upstash Redis Cache
  const redisKey = CurriculumCacheKeys.domains(curriculumVersion);
  const cachedL2 = await CurriculumCacheManager.get<
    CurriculumDomainsResponse & { success: boolean; etag?: string; dataSource?: string }
  >(redisKey);

  if (cachedL2) {
    const etag = cachedL2.etag || generateETag(curriculumVersion, cachedL2);
    const dataSource = cachedL2.dataSource || "REDIS_L2";

    // Populate L0 memory cache
    memoryCache.set(cacheKey, {
      payload: cachedL2,
      etag,
      dataSource,
      timestamp: now,
    });

    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L2_REDIS",
      "X-Data-Source": dataSource,
      "X-Response-Time-Ms": (Date.now() - now).toString(),
    };

    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL2, { status: 200, headers });
  }

  // 3. Cache Miss -> Fetch from repository service (Neo4j / Postgres fallback)
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

  const payload: CurriculumDomainsResponse & {
    success: boolean;
    etag?: string;
    dataSource?: string;
  } = {
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
    dataSource: result.dataSource,
  };

  const etag = generateETag(curriculumVersion, payload);
  payload.etag = etag;

  // Persist to L2 Redis Cache (24h TTL) and L0 Memory Cache
  await CurriculumCacheManager.set(redisKey, payload);
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
    "X-Cache": "MISS_ORIGIN",
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, { status: 304, headers });
  }

  return ApiResponse.json(payload, { status: 200, headers });
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
  const curriculumVersion = await CurriculumCacheManager.getCurriculumVersion();
  const cacheKey = `curriculum:hierarchy:${cleanSlug}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // 1. Check L0 Edge Memory Cache
  const cachedL0 = memoryCache.get(cacheKey);
  if (cachedL0 && now - cachedL0.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cachedL0.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L0_MEMORY",
      "X-Data-Source": `${cachedL0.dataSource}_L0_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cachedL0.etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL0.payload, { status: 200, headers });
  }

  // 2. Check L2 Upstash Redis Cache
  const redisKey = CurriculumCacheKeys.hierarchy(curriculumVersion, cleanSlug);
  const cachedL2 = await CurriculumCacheManager.get<
    CurriculumHierarchyResponse & { success: boolean; etag?: string; dataSource?: string }
  >(redisKey);

  if (cachedL2) {
    const etag = cachedL2.etag || generateETag(curriculumVersion, cachedL2);
    const dataSource = cachedL2.dataSource || "REDIS_L2";

    // Populate L0 memory cache
    memoryCache.set(cacheKey, {
      payload: cachedL2,
      etag,
      dataSource,
      timestamp: now,
    });

    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L2_REDIS",
      "X-Data-Source": dataSource,
      "X-Response-Time-Ms": (Date.now() - now).toString(),
    };

    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL2, { status: 200, headers });
  }

  // 3. Cache Miss -> Query repository service
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

  const payload: CurriculumHierarchyResponse & {
    success: boolean;
    etag?: string;
    dataSource?: string;
  } = {
    success: true,
    ...result.data,
    dataSource: result.dataSource,
  };

  const etag = generateETag(curriculumVersion, payload);
  payload.etag = etag;

  // Persist to L2 Redis Cache (24h TTL) and L0 Memory Cache
  await CurriculumCacheManager.set(redisKey, payload);
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
    "X-Cache": "MISS_ORIGIN",
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, { status: 304, headers });
  }

  return ApiResponse.json(payload, { status: 200, headers });
}

/**
 * GET /api/curriculum/topic/:topicSlug
 * Returns complete 8-layer detail for any topic, including questions and graph relationships.
 */
export async function handleGetCurriculumTopicDetail(
  req: ApiRequest,
  topicSlug: string
): Promise<Response> {
  let decodedSlug = (topicSlug || "").trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}

  const cleanSlug = decodedSlug.toLowerCase();
  const curriculumVersion = await CurriculumCacheManager.getCurriculumVersion();
  const cacheKey = `curriculum:topic:${cleanSlug.replace(/[^a-z0-9]+/g, "-")}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // 1. Check L0 Edge Memory Cache
  const cachedL0 = memoryCache.get(cacheKey);
  if (cachedL0 && now - cachedL0.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cachedL0.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L0_MEMORY",
      "X-Data-Source": `${cachedL0.dataSource}_L0_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cachedL0.etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL0.payload, { status: 200, headers });
  }

  // 2. Check L2 Upstash Redis Cache
  const redisKey = CurriculumCacheKeys.topicDetail(curriculumVersion, cleanSlug);
  const cachedL2 = await CurriculumCacheManager.get<
    TopicDetailResponse & { success: boolean; etag?: string; dataSource?: string }
  >(redisKey);

  if (cachedL2) {
    const etag = cachedL2.etag || generateETag(curriculumVersion, cachedL2);
    const dataSource = cachedL2.dataSource || "REDIS_L2";

    // Populate L0 memory cache
    memoryCache.set(cacheKey, {
      payload: cachedL2,
      etag,
      dataSource,
      timestamp: now,
    });

    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L2_REDIS",
      "X-Data-Source": dataSource,
      "X-Response-Time-Ms": (Date.now() - now).toString(),
    };

    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL2, { status: 200, headers });
  }

  // 3. Cache Miss -> Query repository service
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

  const payload: TopicDetailResponse & {
    success: boolean;
    etag?: string;
    dataSource?: string;
  } = {
    success: true,
    ...result.data,
    dataSource: result.dataSource,
  };

  const etag = generateETag(curriculumVersion, payload);
  payload.etag = etag;

  // Persist to L2 Redis Cache (24h TTL) and L0 Memory Cache
  await CurriculumCacheManager.set(redisKey, payload);
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
    "X-Cache": "MISS_ORIGIN",
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, { status: 304, headers });
  }

  return ApiResponse.json(payload, { status: 200, headers });
}

/**
 * GET /api/curriculum/topic/:topicSlug/questions
 * Returns dynamic question collection with optional query filtering (targetLevel, difficulty, limit).
 */
export async function handleGetCurriculumTopicQuestions(
  req: ApiRequest,
  topicSlug: string
): Promise<Response> {
  let decodedSlug = (topicSlug || "").trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}

  const cleanSlug = decodedSlug.toLowerCase();
  const targetLevel = req.nextUrl.searchParams.get("targetLevel") || undefined;
  const difficulty = req.nextUrl.searchParams.get("difficulty") || undefined;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100)
    : 20;

  const queryHash = `${targetLevel || "all"}_${difficulty || "all"}_${limit}`;
  const curriculumVersion = await CurriculumCacheManager.getCurriculumVersion();
  const cacheKey = `curriculum:questions:${cleanSlug}:${queryHash}:${curriculumVersion}`;
  const now = Date.now();
  const ifNoneMatch =
    req.headers.get("if-none-match") || req.headers.get("If-None-Match");

  // 1. Check L0 Edge Memory Cache
  const cachedL0 = memoryCache.get(cacheKey);
  if (cachedL0 && now - cachedL0.timestamp < MEMORY_CACHE_TTL_MS) {
    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: cachedL0.etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L0_MEMORY",
      "X-Data-Source": `${cachedL0.dataSource}_L0_CACHE`,
      "X-Response-Time-Ms": "0",
    };

    if (ifNoneMatch && (ifNoneMatch === cachedL0.etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL0.payload, { status: 200, headers });
  }

  // 2. Check L2 Upstash Redis Cache
  const redisKey = CurriculumCacheKeys.topicQuestions(
    curriculumVersion,
    cleanSlug,
    queryHash
  );
  const cachedL2 = await CurriculumCacheManager.get<
    TopicQuestionsResponse & { success: boolean; etag?: string; dataSource?: string }
  >(redisKey);

  if (cachedL2) {
    const etag = cachedL2.etag || generateETag(curriculumVersion, cachedL2);
    const dataSource = cachedL2.dataSource || "REDIS_L2";

    // Populate L0 memory cache
    memoryCache.set(cacheKey, {
      payload: cachedL2,
      etag,
      dataSource,
      timestamp: now,
    });

    const headers: Record<string, string> = {
      "Cache-Control": CACHE_CONTROL_VALUE,
      ETag: etag,
      "X-Curriculum-Version": curriculumVersion,
      "X-Cache": "HIT_L2_REDIS",
      "X-Data-Source": dataSource,
      "X-Response-Time-Ms": (Date.now() - now).toString(),
    };

    if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
      return new Response(null, { status: 304, headers });
    }

    return ApiResponse.json(cachedL2, { status: 200, headers });
  }

  // 3. Cache Miss -> Query repository service
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

  const payload: TopicQuestionsResponse & {
    success: boolean;
    etag?: string;
    dataSource?: string;
  } = {
    success: true,
    ...result.data,
    dataSource: result.dataSource,
  };

  const etag = generateETag(curriculumVersion, payload);
  payload.etag = etag;

  // Persist to L2 Redis Cache (24h TTL) and L0 Memory Cache
  await CurriculumCacheManager.set(redisKey, payload);
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
    "X-Cache": "MISS_ORIGIN",
    "X-Data-Source": result.dataSource,
    "X-Response-Time-Ms": latencyMs.toString(),
  };

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === "*")) {
    return new Response(null, { status: 304, headers });
  }

  return ApiResponse.json(payload, { status: 200, headers });
}

/**
 * POST /api/admin/curriculum/publish
 * Increments curriculum publishing version (e.g. v42 -> v43).
 * Atomically updates cache namespace and clears edge L0 memory.
 */
export async function handlePostCurriculumPublish(
  req: ApiRequest
): Promise<Response> {
  const auth = await requireAdminRole(req, [
    "SUPER_ADMIN",
    "HOD",
    "CURRICULUM_MANAGER",
  ]);
  if (!auth.allowed) return auth.response;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      reason?: string;
    };

    const result = await CurriculumCacheManager.incrementCurriculumVersion(
      {
        userId: auth.context.user.id,
        email: auth.context.user.email,
      },
      body.reason || "Manual curriculum release publish"
    );

    // Invalidate L0 memory cache
    clearCurriculumMemoryCache();

    return ApiResponse.json({
      success: true,
      message: `Curriculum release successfully published. Cache namespace advanced: ${result.previousVersion} -> ${result.newVersion}.`,
      previousVersion: result.previousVersion,
      newVersion: result.newVersion,
      publishedBy: auth.context.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return ApiResponse.json(
      {
        success: false,
        error: {
          code: "PUBLISH_FAILED",
          message: error?.message || "Failed to publish curriculum release",
        },
      },
      { status: 500 }
    );
  }
}
