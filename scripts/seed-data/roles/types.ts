/**
 * PrepInMinutes — Canonical Roles & Career Bands Seed Types
 * 
 * Governed by:
 * - CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 2: Layer 1: Roles, Career Bands & Fresher Architecture)
 * - TASK_EXECUTION_SEQUENCE.md (TASK-P2-01)
 */

export type CareerBand =
  | "STUDENT_FRESHER"
  | "ASSOCIATE"
  | "MID_LEVEL"
  | "SENIOR"
  | "STAFF"
  | "PRINCIPAL"
  | "MANAGEMENT";

export type RoleTrack =
  | "general"
  | "backend"
  | "frontend"
  | "mobile"
  | "cloud"
  | "data"
  | "ai"
  | "leadership"
  | "fullstack";

export type BloomLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export type TopicDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface RoleTopicRequirement {
  topicSlug: string;
  isCore: boolean;
  priorityScore: number; // 1 to 100
  targetLevel: BloomLevel;
  minimumDifficulty: TopicDifficulty;
}

export interface RoleSeed {
  slug: string;
  name: string;
  careerBand: CareerBand;
  track: RoleTrack;
  description: string;
  minProficiency: BloomLevel;
  minExperienceYears: number;
  maxExperienceYears: number;
  companyEquivalents: Record<string, string>;
  requiredTopics: RoleTopicRequirement[];
}
