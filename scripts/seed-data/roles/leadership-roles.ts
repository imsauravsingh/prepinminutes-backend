/**
 * PrepInMinutes — Engineering Management & Leadership Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const LEADERSHIP_ROLES: RoleSeed[] = [
  {
    slug: "engineering-manager",
    name: "Engineering Manager (EM)",
    careerBand: "MANAGEMENT",
    track: "leadership",
    description:
      "People and delivery leader responsible for a team of 6-12 engineers. Evaluated on 1-on-1 coaching, hiring loops, managing underperformance, performance calibrations, agile sprint capacity, cross-functional delivery, and high psychological safety.",
    minProficiency: "L4",
    minExperienceYears: 5,
    maxExperienceYears: 10,
    companyEquivalents: {
      google: "L6 Engineering Manager",
      amazon: "L6 Software Development Manager (SDM)",
      meta: "M1 Engineering Manager",
      microsoft: "63-64 Principal / Group Engineering Manager",
      uber: "Engineering Manager",
      stripe: "Engineering Manager",
    },
    requiredTopics: [
      { topicSlug: "lead-1on1s-career-pathing-burnout", isCore: true, priorityScore: 99, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-performance-management-pips-feedback", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-hiring-calibration-structured-loops", isCore: true, priorityScore: 97, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-team-topologies-capacity-planning", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-dora-velocity-vs-vanity-metrics", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-remote-distributed-team-leadership", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-outages-warrooms-postmortems", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-architectural-governance-tech-debt", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-mentoring-coaching-senior-growth", isCore: true, priorityScore: 97, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "director-of-engineering",
    name: "Director of Engineering",
    careerBand: "MANAGEMENT",
    track: "leadership",
    description:
      "Executive engineering leader managing 3-6 engineering managers and 30-80+ engineers across multiple teams. Evaluated on multi-year headcount budgeting, org structure evolution, executive stakeholder communication, cross-org standards, and engineering culture.",
    minProficiency: "L5",
    minExperienceYears: 10,
    maxExperienceYears: 20,
    companyEquivalents: {
      google: "L7-L8 Director of Engineering",
      amazon: "L8 Director of Software Development",
      meta: "M2 Director of Engineering",
      microsoft: "67-68 Partner Director",
      uber: "Director of Engineering",
    },
    requiredTopics: [
      { topicSlug: "lead-executive-communication-managing-up", isCore: true, priorityScore: 100, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-cross-functional-collaboration", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-hiring-calibration-structured-loops", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-performance-management-pips-feedback", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-dora-velocity-vs-vanity-metrics", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-workflow-scheduler", isCore: false, priorityScore: 85, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
];
