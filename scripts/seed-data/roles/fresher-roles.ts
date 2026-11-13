/**
 * PrepInMinutes — Freshers & Early Career Roles (Career Bands: STUDENT_FRESHER & ASSOCIATE)
 * 
 * Provides calibrated entry points for college campus placements, interns,
 * career switchers, and junior associate engineers.
 */

import { RoleSeed } from "./types";

export const FRESHER_ROLES: RoleSeed[] = [
  {
    slug: "campus-fresher-sde",
    name: "Campus Placement & Graduate SDE",
    careerBand: "STUDENT_FRESHER",
    track: "general",
    description:
      "Targeted at college graduates, final-year campus placements, interns, and career transitioners with 0-1 years of experience. Emphasizes foundational DSA, CS core fundamentals (OS, DBMS, Computer Networks), and standard STAR behavioral project defense.",
    minProficiency: "L1",
    minExperienceYears: 0,
    maxExperienceYears: 1,
    companyEquivalents: {
      google: "L3 (Campus / SDE-1)",
      amazon: "L4 (SDE-1 Graduate)",
      meta: "E3 (Rotational / Graduate)",
      microsoft: "59-60",
      apple: "ICT2",
      uber: "L3 Campus",
      adobe: "Software Engineer 1",
    },
    requiredTopics: [
      // Core DSA
      { topicSlug: "arrays-two-pointers", isCore: true, priorityScore: 98, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "sliding-window-fixed-dynamic", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "prefix-sums-hash-tables", isCore: true, priorityScore: 95, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "kadane-inversions-math", isCore: true, priorityScore: 88, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "matrix-traversal-manipulation", isCore: true, priorityScore: 85, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "strings-palindromes-parsing", isCore: true, priorityScore: 94, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "strings-anagrams-grouping", isCore: true, priorityScore: 93, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "linked-list-reversals-cycles", isCore: true, priorityScore: 96, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "stack-queue-foundations", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "binary-tree-dfs-traversals", isCore: true, priorityScore: 97, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "bst-validation-ordering", isCore: true, priorityScore: 95, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "graph-traversals-islands", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "binary-search-boundaries", isCore: true, priorityScore: 96, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "dp-1d-arrays-subsequences", isCore: false, priorityScore: 82, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // CS Core Fundamentals
      { topicSlug: "networking-protocols", isCore: true, priorityScore: 90, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "sql-vs-nosql-modeling", isCore: true, priorityScore: 86, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "acid-transactions-consistency", isCore: true, priorityScore: 88, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "os-concurrency-primitives", isCore: true, priorityScore: 85, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      // Basic OOP / Clean Code
      { topicSlug: "oop-pillars-production", isCore: true, priorityScore: 88, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "clean-code-refactoring", isCore: true, priorityScore: 84, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "solid-srp-ocp", isCore: false, priorityScore: 78, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      // Campus Behavioral Defense
      { topicSlug: "lead-storytelling-starl-car", isCore: true, priorityScore: 92, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 85, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-googleyness-ambiguity-intellectual-humility", isCore: true, priorityScore: 88, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
    ],
  },
  {
    slug: "fresher-frontend-engineer",
    name: "Entry-Level Frontend Engineer",
    careerBand: "STUDENT_FRESHER",
    track: "frontend",
    description:
      "Entry-level web developer role focusing on core JavaScript, DOM manipulation, HTML/CSS layout engines, responsive design, basic component architectures in React/Vue, and front-end debugging.",
    minProficiency: "L1",
    minExperienceYears: 0,
    maxExperienceYears: 1,
    companyEquivalents: {
      google: "L3 Frontend",
      amazon: "L4 Frontend",
      meta: "E3 UI/Web",
      microsoft: "59 Web Development",
      uber: "L3 Web",
    },
    requiredTopics: [
      // Web Core
      { topicSlug: "html-semantic-layout-engines", isCore: true, priorityScore: 96, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "css-stacking-responsive-systems", isCore: true, priorityScore: 94, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "browser-event-loop-dom", isCore: true, priorityScore: 96, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "browser-rendering-pipeline", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "js-fundamentals-core", isCore: true, priorityScore: 98, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "js-async-event-loop", isCore: true, priorityScore: 97, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "react-fundamentals-components", isCore: true, priorityScore: 95, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "react-hooks-memoization", isCore: true, priorityScore: 96, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ts-primitives-generics-ui", isCore: false, priorityScore: 80, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // Foundational DSA for UI
      { topicSlug: "arrays-two-pointers", isCore: true, priorityScore: 85, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "strings-palindromes-parsing", isCore: true, priorityScore: 82, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "prefix-sums-hash-tables", isCore: true, priorityScore: 84, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      // Behavioral
      { topicSlug: "lead-storytelling-starl-car", isCore: true, priorityScore: 88, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-googleyness-ambiguity-intellectual-humility", isCore: true, priorityScore: 86, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
    ],
  },
  {
    slug: "fresher-backend-engineer",
    name: "Entry-Level Backend Engineer",
    careerBand: "STUDENT_FRESHER",
    track: "backend",
    description:
      "Entry-level backend engineer specializing in RESTful API development, relational databases, query optimization, clean code structure, and foundational microservice principles.",
    minProficiency: "L1",
    minExperienceYears: 0,
    maxExperienceYears: 1,
    companyEquivalents: {
      google: "L3 Backend",
      amazon: "L4 Backend",
      meta: "E3 Backend",
      microsoft: "59 Backend",
      uber: "L3 Backend",
    },
    requiredTopics: [
      // Core Backend
      { topicSlug: "rest-grpc-protocols", isCore: true, priorityScore: 96, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "db-indexing-query-tuning", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "acid-isolation-locking", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "orm-pitfalls-nplusone", isCore: true, priorityScore: 88, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "node-async-streams", isCore: true, priorityScore: 86, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // Foundational System Design
      { topicSlug: "intro-system-design", isCore: true, priorityScore: 90, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "networking-protocols", isCore: true, priorityScore: 94, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "sql-vs-nosql-modeling", isCore: true, priorityScore: 92, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "horizontal-vs-vertical-scaling", isCore: true, priorityScore: 88, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      // Core DSA
      { topicSlug: "arrays-two-pointers", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "prefix-sums-hash-tables", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "binary-search-boundaries", isCore: true, priorityScore: 88, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "binary-tree-dfs-traversals", isCore: true, priorityScore: 86, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // Behavioral
      { topicSlug: "lead-storytelling-starl-car", isCore: true, priorityScore: 90, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-googleyness-ambiguity-intellectual-humility", isCore: true, priorityScore: 86, targetLevel: "L1", minimumDifficulty: "BEGINNER" },
    ],
  },
  {
    slug: "associate-software-engineer",
    name: "Early Career Associate SDE",
    careerBand: "ASSOCIATE",
    track: "general",
    description:
      "Junior software engineer with 6 months to 2 years of professional experience. Evaluated on clean code craftsmanship, intermediate algorithmic problems, standard low-level design patterns (SOLID, Gang of Four), unit/integration testing, and basic cloud deployment.",
    minProficiency: "L2",
    minExperienceYears: 1,
    maxExperienceYears: 2,
    companyEquivalents: {
      google: "L3",
      amazon: "L4",
      meta: "E3",
      microsoft: "60-61",
      apple: "ICT2",
      uber: "L3-L4",
      stripe: "L1-L2",
    },
    requiredTopics: [
      // Intermediate DSA
      { topicSlug: "arrays-two-pointers", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "sliding-window-fixed-dynamic", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "graph-traversals-islands", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "heaps-top-k-elements", isCore: true, priorityScore: 88, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "dp-1d-arrays-subsequences", isCore: true, priorityScore: 85, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      // Low Level Design & Clean Code
      { topicSlug: "solid-srp-ocp", isCore: true, priorityScore: 95, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "solid-lsp-isp", isCore: true, priorityScore: 92, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "solid-dip-ioc", isCore: true, priorityScore: 94, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "creational-patterns", isCore: true, priorityScore: 96, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "structural-patterns", isCore: true, priorityScore: 94, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "behavioral-patterns-events", isCore: true, priorityScore: 95, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "thread-safe-lru-lfu-cache", isCore: false, priorityScore: 82, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      // API & Cloud Fundamentals
      { topicSlug: "api-idempotency-webhooks", isCore: true, priorityScore: 86, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-containers-oci-runtimes", isCore: true, priorityScore: 84, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "ops-containers-dockerfile-security", isCore: true, priorityScore: 82, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
      // Behavioral
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L2", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 84, targetLevel: "L2", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
];
