/**
 * PrepInMinutes — General Software Engineering & Fullstack Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const GENERAL_ROLES: RoleSeed[] = [
  {
    slug: "mid-general-sde",
    name: "Mid-Level Software Engineer (SDE-2)",
    careerBand: "MID_LEVEL",
    track: "general",
    description:
      "Independent feature owner responsible for end-to-end design, implementation, and testing. Evaluated on advanced DSA, comprehensive Low-Level Design (LLD) machine coding, core distributed system fundamentals, and operational troubleshooting.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4",
      amazon: "L5 (SDE-2)",
      meta: "E4",
      microsoft: "61-62",
      apple: "ICT3",
      uber: "L4",
      stripe: "L2",
    },
    requiredTopics: [
      // DSA
      { topicSlug: "arrays-two-pointers", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "sliding-window-fixed-dynamic", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "graph-traversals-islands", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "binary-tree-dfs-traversals", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "dp-1d-arrays-subsequences", isCore: true, priorityScore: 88, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "dp-knapsack-grid-strings-mcm", isCore: false, priorityScore: 80, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "trie-prefix-tree-foundations", isCore: false, priorityScore: 82, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // LLD Machine Coding
      { topicSlug: "thread-safe-lru-lfu-cache", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "parking-lot-system", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "splitwise-expense-sharing", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "in-memory-rate-limiter", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      // System Design Fundamentals
      { topicSlug: "load-balancers-traffic", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "db-replication-sharding", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "distributed-caching-redis", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "kafka-event-streaming", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "url-shortener", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "rate-limiting-admission-control", isCore: true, priorityScore: 91, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // Behavioral
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 88, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-bias-for-action-risk", isCore: true, priorityScore: 86, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "senior-general-sde",
    name: "Senior Software Engineer (SDE-3 / Tech Lead)",
    careerBand: "SENIOR",
    track: "general",
    description:
      "Technical leader driving multi-component architecture, system resilience, and engineering best practices. Evaluated heavily on high-level system design trade-offs, fault tolerance, non-functional requirements, and team mentorship.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 (Senior SWE)",
      amazon: "L6 (Senior SDE)",
      meta: "E5",
      microsoft: "63-64",
      apple: "ICT4",
      uber: "L5b",
      stripe: "L3-L4",
    },
    requiredTopics: [
      // High Level System Design
      { topicSlug: "cap-pacelc-theorems", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-key-value-store", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-caching-redis", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "circuit-breaker-bulkhead", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "leader-election-raft", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-locks-fencing", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "saga-pattern-cqrs", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "payment-gateway-ledger", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "realtime-chat-messaging", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "metrics-observability-platform", isCore: true, priorityScore: 90, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      // LLD & Concurrency
      { topicSlug: "thread-safe-lru-lfu-cache", isCore: true, priorityScore: 90, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "concurrency-thread-safety", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "in-memory-rate-limiter", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      // Behavioral & Leadership
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-mentoring-coaching-senior-growth", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-outages-warrooms-postmortems", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-architectural-governance-tech-debt", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
  {
    slug: "staff-general-sde",
    name: "Staff Software Architect",
    careerBand: "STAFF",
    track: "general",
    description:
      "Organizational-level architect steering multi-year technology directions across several teams or divisions. Evaluated on large-scale multi-datacenter architectures, cross-domain trade-offs, disaster recovery, and cross-functional technical influence.",
    minProficiency: "L5",
    minExperienceYears: 8,
    maxExperienceYears: 12,
    companyEquivalents: {
      google: "L6 (Staff SWE)",
      amazon: "L7 (Principal SDE)",
      meta: "E6 (Staff)",
      microsoft: "65-66 (Partner/Principal)",
      apple: "ICT5",
      uber: "L6 (Staff)",
    },
    requiredTopics: [
      // Multi-System Architecture
      { topicSlug: "distributed-newsql-databases", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "byzantine-fault-tolerance", isCore: true, priorityScore: 90, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "gossip-protocols-membership", isCore: true, priorityScore: 94, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-clocks-ordering", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "massive-live-event-chat", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-workflow-scheduler", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "fraud-risk-detection", isCore: true, priorityScore: 94, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      // Staff Leadership
      { topicSlug: "lead-cross-functional-collaboration", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-executive-communication-managing-up", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
  {
    slug: "principal-software-engineer",
    name: "Principal Engineer / Fellow",
    careerBand: "PRINCIPAL",
    track: "general",
    description:
      "Enterprise technical visionary shaping company-wide platforms, infrastructure investments, and industry standards. Evaluated on multi-year technology roadmaps, deep systems innovation, and executive consensus building.",
    minProficiency: "L5",
    minExperienceYears: 12,
    maxExperienceYears: 20,
    companyEquivalents: {
      google: "L7-L8 (Senior Staff / Principal)",
      amazon: "L8 (Senior Principal / Distinguished)",
      meta: "E7-E8",
      microsoft: "67-68",
      apple: "ICT6 / Fellow",
    },
    requiredTopics: [
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 100, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-workflow-scheduler", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-newsql-databases", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "metrics-observability-platform", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "massive-live-event-chat", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-executive-communication-managing-up", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-cross-functional-collaboration", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
  {
    slug: "fullstack-engineer",
    name: "Full-Stack Product Engineer",
    careerBand: "MID_LEVEL",
    track: "fullstack",
    description:
      "Versatile product engineer delivering user-facing features across modern React/Next.js frontends and Node.js/Go backend services with relational databases and caching.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 6,
    companyEquivalents: {
      google: "L4 Fullstack",
      amazon: "L5 Fullstack",
      meta: "E4 Product SWE",
      stripe: "L2-L3 Fullstack",
      airbnb: "L4 Fullstack",
    },
    requiredTopics: [
      // Frontend
      { topicSlug: "react-fundamentals-components", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "react-hooks-memoization", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "nextjs-app-router-fundamentals", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "browser-event-loop-dom", isCore: true, priorityScore: 88, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // Backend
      { topicSlug: "rest-grpc-protocols", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "db-indexing-query-tuning", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "api-idempotency-webhooks", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "cache-strategies-stampede", isCore: true, priorityScore: 88, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // LLD & System Design
      { topicSlug: "solid-srp-ocp", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "url-shortener", isCore: true, priorityScore: 88, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // Behavioral
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
];
