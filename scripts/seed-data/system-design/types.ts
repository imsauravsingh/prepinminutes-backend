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
}

export interface TopicSeed {
  slug: string;
  topicId: string;
  title: string;
  categorySlug: string;
  pillar: 'principles' | 'components' | 'case-studies';
  priority: 'P1' | 'P2' | 'P3';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  durationMin: number;
  frequency: number;
  weight: number;
  trend: 'SURGING' | 'RISING' | 'STABLE' | 'FALLING';
  description: string;
  rubricAtoms: string[];
  prerequisites: string[]; // slugs of topics that are PREREQUISITE_OF this topic
  usedComponents?: string[]; // slugs of components this case study USES_COMPONENT
  foundedOn?: string[]; // slugs of principles this component/system is FOUNDED_ON
  questions: QuestionSeed[];
}

