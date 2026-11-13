/**
 * PrepInMinutes — Frontend & Web Architecture Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const FRONTEND_ROLES: RoleSeed[] = [
  {
    slug: "mid-frontend-sde",
    name: "Frontend Engineer (SDE-2)",
    careerBand: "MID_LEVEL",
    track: "frontend",
    description:
      "Core UI engineer responsible for client applications, complex component trees, state management, API synchronization, responsive layout systems, and Core Web Vitals.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4 Frontend",
      amazon: "L5 Frontend SDE",
      meta: "E4 Frontend",
      microsoft: "61-62 Frontend",
      uber: "L4 Web",
      airbnb: "L4 Frontend",
    },
    requiredTopics: [
      { topicSlug: "browser-rendering-pipeline", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "browser-event-loop-dom", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "network-critical-rendering-path", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "js-fundamentals-core", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "js-async-event-loop", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ts-primitives-generics-ui", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "react-fundamentals-components", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "react-hooks-memoization", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "react-fiber-concurrent", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "nextjs-app-router-fundamentals", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "nextjs-rendering-middleware", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "senior-frontend-sde",
    name: "Senior Web Architect",
    careerBand: "SENIOR",
    track: "frontend",
    description:
      "Senior frontend architect driving web performance budgets, streaming hydration, micro-frontends, accessible design systems, and frontend resilience.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Frontend",
      amazon: "L6 Senior Frontend SDE",
      meta: "E5 Frontend",
      microsoft: "63-64 Web",
      airbnb: "L5 Frontend Architect",
    },
    requiredTopics: [
      { topicSlug: "nextjs-rsc-streaming-hydration", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "core-web-vitals-optimization", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "code-splitting-bundle-optimization", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "virtual-list-windowing", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "accessible-design-systems-aria", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "frontend-security-sandboxing", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "realtime-offline-sync", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "browser-event-loop-dom", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-architectural-governance-tech-debt", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
  {
    slug: "staff-frontend-sde",
    name: "Staff Frontend Platform Architect",
    careerBand: "STAFF",
    track: "frontend",
    description:
      "Enterprise web platform leader establishing organization-wide frontend infrastructure, unified build toolchains, design system governance, and cross-platform web runtimes.",
    minProficiency: "L5",
    minExperienceYears: 8,
    maxExperienceYears: 12,
    companyEquivalents: {
      google: "L6 Staff Frontend",
      amazon: "L7 Principal Frontend",
      meta: "E6 Web Platform",
      microsoft: "65-66 Partner Web Architect",
    },
    requiredTopics: [
      { topicSlug: "core-web-vitals-optimization", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "nextjs-rsc-streaming-hydration", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "frontend-security-sandboxing", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "accessible-design-systems-aria", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "browser-rendering-pipeline", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-cross-functional-collaboration", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
];
