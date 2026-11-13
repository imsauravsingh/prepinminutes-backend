/**
 * PrepInMinutes — Backend & Distributed Systems Engineering Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const BACKEND_ROLES: RoleSeed[] = [
  {
    slug: "mid-backend-sde",
    name: "Backend Engineer (SDE-2)",
    careerBand: "MID_LEVEL",
    track: "backend",
    description:
      "Core backend engineer driving service APIs, database schemas, transactional consistency, distributed caching, and microservice integration.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4 Backend",
      amazon: "L5 Backend SDE",
      meta: "E4 Backend",
      microsoft: "61-62",
      uber: "L4 Backend",
      stripe: "L2 Backend",
    },
    requiredTopics: [
      // Core Backend Domain
      { topicSlug: "rest-grpc-protocols", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "api-idempotency-webhooks", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "db-indexing-query-tuning", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "acid-isolation-locking", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "orm-pitfalls-nplusone", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "cache-strategies-stampede", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "distributed-locks-leasing", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "os-threads-concurrency", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "node-async-streams", isCore: true, priorityScore: 91, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "node-v8-libuv-workers", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "go-concurrency-channels", isCore: false, priorityScore: 85, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "java-jvm-jmm-gc", isCore: false, priorityScore: 84, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "python-asyncio-frameworks", isCore: false, priorityScore: 82, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // System Design Components
      { topicSlug: "load-balancers-traffic", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "api-gateway-reverse-proxy", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "db-replication-sharding", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "distributed-caching-redis", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "kafka-event-streaming", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "rate-limiting-admission-control", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // Behavioral
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "senior-backend-sde",
    name: "Senior Backend Engineer",
    careerBand: "SENIOR",
    track: "backend",
    description:
      "Senior backend engineer architecting fault-tolerant distributed platforms, zero-downtime database migrations, resilient asynchronous pipelines, and high-throughput data access layers.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Backend",
      amazon: "L6 Senior Backend SDE",
      meta: "E5 Backend",
      microsoft: "63-64",
      uber: "L5b Backend",
      stripe: "L3-L4 Backend",
      netflix: "Senior Distributed Systems Engineer",
    },
    requiredTopics: [
      // Distributed Systems & Database Engines
      { topicSlug: "distributed-key-value-store", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "storage-engines-lsm-trees", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "leader-election-raft", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-locks-fencing", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "circuit-breaker-bulkhead", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "saga-pattern-cqrs", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "transactional-outbox-cdc", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "gossip-protocols-membership", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "payment-gateway-ledger", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-caching-redis", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      // Backend Core
      { topicSlug: "api-idempotency-webhooks", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "db-indexing-query-tuning", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "acid-isolation-locking", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      // Leadership
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-outages-warrooms-postmortems", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
  {
    slug: "staff-backend-sde",
    name: "Staff Distributed Systems Architect",
    careerBand: "STAFF",
    track: "backend",
    description:
      "Subject matter expert in planet-scale distributed persistence, consensus protocols, multi-region database topologies, and fault-domain boundary architecture.",
    minProficiency: "L5",
    minExperienceYears: 8,
    maxExperienceYears: 12,
    companyEquivalents: {
      google: "L6 Staff Systems Engineer",
      amazon: "L7 Principal SDE",
      meta: "E6 Distributed Systems",
      microsoft: "65-66",
      netflix: "Staff Systems Architect",
    },
    requiredTopics: [
      { topicSlug: "distributed-newsql-databases", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-clocks-ordering", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "byzantine-fault-tolerance", isCore: true, priorityScore: 92, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-key-value-store", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "storage-engines-lsm-trees", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "leader-election-raft", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-workflow-scheduler", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "massive-live-event-chat", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
];
