/**
 * Universal Knowledge Graph Types & Data Contracts
 * Supports multi-domain architectures: System Design, Coding, AI System Design, DevOps
 */

export type PriorityLevel = 'P1' | 'P2' | 'P3';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type LearningProgressionLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type TrendDirection = 'SURGING' | 'RISING' | 'STABLE' | 'FALLING';

export type QuestionArchetype =
  | 'conceptual'
  | 'mechanism'
  | 'implementation'
  | 'comparison'
  | 'scenario-based'
  | 'troubleshooting'
  | 'architecture'
  | 'trade-off'
  | 'failure-analysis'
  | 'follow-up-probe';

// ============================================================
// 1. Canonical Core Node Interfaces (Universal across all domains)
// ============================================================

export interface BaseDomainNode {
  slug: string;
  name: string;
  description: string;
  pillarCount?: number;
  categoryCount: number;
  topicCount: number;
  questionCount: number;
  version: string;
  updatedAt: string;
}

export interface BaseCategoryNode {
  slug: string;
  name: string;
  description: string;
  pillar?: string;
  sortOrder: number;
  updatedAt: string;
}

export interface BaseTopicNode {
  slug: string;
  topicId: string;
  title: string;
  pillar?: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  durationMin: number;
  frequency: number;
  weight: number;
  trend: TrendDirection;
  description: string;
  rubricAtoms: string[];
  updatedAt: string;
}

export interface BaseQuestionNode {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  learningLevel: LearningProgressionLevel;
  archetype: QuestionArchetype;
  prompt: string;
  scaleAnchor?: string;
  rubricGuide: string;
  rubricAtoms: string[];
  hints: string[];
  followUpProbes: string[];
  expectedKeywords: string[];
  antiPatterns?: string[];
  updatedAt?: string;
}

// ============================================================
// 2. Query Result Contracts (Normalized for API & Frontend)
// ============================================================

export interface TopicCatalogSummary {
  slug: string;
  topicId: string;
  title: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  durationMin: number;
  frequency: number;
  trend: TrendDirection;
}

export interface CategoryHierarchyResult {
  slug: string;
  name: string;
  pillar?: string;
  sortOrder: number;
  topics: TopicCatalogSummary[];
}

export interface DomainHierarchyResponse {
  domainSlug: string;
  domainName: string;
  description: string;
  version: string;
  totalTopics: number;
  totalQuestions: number;
  categories: CategoryHierarchyResult[];
}

export interface TopicGraphReference {
  slug: string;
  title?: string;
  topicId?: string;
  name?: string;
}

export interface TopicDetailResponse {
  domain: {
    slug: string;
    name: string;
  };
  category: {
    slug: string;
    name: string;
    pillar?: string;
  };
  topic: BaseTopicNode;
  graphRelationships: {
    prerequisites: TopicGraphReference[];
    dependents: TopicGraphReference[];
    usedComponents: TopicGraphReference[];
    foundedOn: TopicGraphReference[];
    algorithmPatterns?: TopicGraphReference[];
    modelFamilies?: TopicGraphReference[];
    optimizationTechniques?: TopicGraphReference[];
  };
  questions: BaseQuestionNode[];
}

