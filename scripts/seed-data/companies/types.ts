/**
 * PrepInMinutes — Companies, Stages & Formats Seed Types
 * 
 * Governed by:
 * - CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 3: Companies, Section 4: Stages, Section 5: Formats)
 * - TASK_EXECUTION_SEQUENCE.md (TASK-P2-02)
 */

export type MarketTier = "TIER_1_FAANG" | "TIER_1_UNICORN" | "ENTERPRISE";

export interface CompanyStageMapping {
  stageSlug: string;
  roundOrder: number;
  isEliminationRound: boolean;
  stageWeight: number; // 1 to 100
}

export interface CompanySeed {
  slug: string;
  name: string;
  tier: MarketTier;
  culturePhilosophy: string;
  primaryPillars: string[];
  websiteUrl: string;
  hiringStages: CompanyStageMapping[];
}

export interface InterviewStageSeed {
  slug: string;
  name: string;
  defaultTimeboxMin: number;
  evaluativeFocus: string;
  targetDomains: string[];
  formats: {
    formatSlug: string;
    isDefault: boolean;
    pacingNotes: string;
  }[];
}

export interface InterviewFormatSeed {
  slug: string;
  name: string;
  defaultTimeboxMin: number;
  toolingAndPacing: string;
}

export interface TopicFrequencyRequirement {
  topicSlug: string;
  companySlug: string;
  frequencyScore: number; // 0 to 100
  confidenceScore: number; // 0.0 to 1.0
  sampleSize: number; // e.g. 45 verified debriefs
  sourceType: "VERIFIED_DEBRIEFS" | "CURATED_CURRICULUM" | "COMMUNITY_REPORTED";
  primaryStage: string;
  weight: number; // 1 to 100
}

