export interface QuestionSeed {
  id: string;
  title: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype:
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
  prompt: string;
  scaleAnchor?: string;
  rubricGuide: string;
  rubricAtoms: string[];
  hints: string[];
  followUpProbes: string[];
  expectedKeywords: string[];
  antiPatterns?: string[];
  // Dynamic Popularity & Curated Sprints
  frequencyScore: number; // 0 to 100
  isTop150: boolean;
  isBlind75: boolean;
  companies: string[];
}

export interface TopicSeed {
  slug: string;
  topicId: string;
  title: string;
  categorySlug: string;
  priority: 'P0' | 'P1' | 'P2';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  durationMin: number;
  frequency: number;
  weight: number;
  trend: 'SURGING' | 'HOT' | 'STABLE' | 'COOLING';
  description: string;
  rubricAtoms: string[];
  prerequisites: string[]; // slugs of prerequisite topics
  anchorProblems?: string[]; // key canonical LeetCode problems
  targetCompanies?: string[]; // primary companies known for this topic
  questions: QuestionSeed[];
}

export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  order: number;
}

