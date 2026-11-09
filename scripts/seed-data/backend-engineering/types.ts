export interface QuestionSeed {
  id: string;
  title: string;
  lang: string;
  tier: 'FUNDAMENTALS' | 'INTERMEDIATE' | 'ADVANCED' | 'CORE';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype:
    | 'mechanism'
    | 'trade-off'
    | 'troubleshooting'
    | 'failure-analysis'
    | 'implementation'
    | 'scenario-based';
  prompt: string;
  scaleAnchor?: string;
  rubricGuide: string;
  rubricAtoms: string[];
  hints: string[];
  followUpProbes: string[];
  expectedKeywords: string[];
  antiPatterns?: string[];
  frequencyScore: number; // 0 to 100
  companies: string[];
}

export interface TopicSeed {
  slug: string;
  topicId: string;
  title: string;
  categorySlug: string;
  lang: string; // "universal" | "java" | "nodejs" | "go" | "python" | "php" | etc.
  tier: 'FUNDAMENTALS' | 'INTERMEDIATE' | 'ADVANCED' | 'CORE';
  stack: string[];
  priority: 'P0' | 'P1' | 'P2';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  durationMin: number;
  frequency: number;
  weight: number;
  trend: 'SURGING' | 'HOT' | 'STABLE' | 'COOLING';
  description: string;
  rubricAtoms: string[];
  prerequisites: string[]; // slugs of prerequisite topics
  targetCompanies?: string[];
  questions: QuestionSeed[];
}

export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  order: number;
}

