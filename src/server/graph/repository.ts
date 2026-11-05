import { getNeo4jDriver } from './neo4j';
import {
  DomainHierarchyResponse,
  TopicDetailResponse,
  BaseQuestionNode
} from './types';

/**
 * Universal Knowledge Graph Repository
 * Reusable data access layer across all domains (System Design, Coding, AI, DevOps)
 */
export class KnowledgeGraphRepository {
  /**
   * Fetches the complete navigation hierarchy for any domain
   */
  public static async fetchDomainHierarchy(
    domainSlug: string
  ): Promise<DomainHierarchyResponse | null> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH (d:Domain {slug: $domainSlug})
        OPTIONAL MATCH (d)-[:CONTAINS]->(c:Category)
        OPTIONAL MATCH (c)-[:HAS_TOPIC]->(t:Topic)
        WITH d, c, t
        ORDER BY c.sortOrder, t.priority, t.title
        WITH d, c, collect(CASE WHEN t IS NOT NULL THEN {
          slug: t.slug,
          topicId: t.topicId,
          title: t.title,
          priority: t.priority,
          difficulty: t.difficulty,
          durationMin: t.durationMin,
          frequency: t.frequency,
          trend: t.trend
        } ELSE null END) AS rawTopics
        WITH d, c, [top IN rawTopics WHERE top IS NOT NULL] AS topics
        ORDER BY c.sortOrder
        WITH d, collect(CASE WHEN c IS NOT NULL THEN {
          slug: c.slug,
          name: c.name,
          pillar: c.pillar,
          sortOrder: c.sortOrder,
          topics: topics
        } ELSE null END) AS rawCategories
        RETURN {
          domainSlug: d.slug,
          domainName: d.name,
          description: d.description,
          version: d.version,
          totalTopics: d.topicCount,
          totalQuestions: d.questionCount,
          categories: [cat IN rawCategories WHERE cat IS NOT NULL]
        } AS domainHierarchy
      `;

      const result = await session.run(cypher, { domainSlug });
      if (result.records.length === 0) return null;

      return result.records[0].get('domainHierarchy') as DomainHierarchyResponse;
    } finally {
      await session.close();
    }
  }

  /**
   * Fetches complete 8-layer detail for any topic across any domain,
   * including questions and domain-specific graph relationships.
   */
  public static async fetchTopicDetail(
    topicSlug: string
  ): Promise<TopicDetailResponse | null> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH (t:Topic {slug: $topicSlug})
        MATCH (c:Category)-[:HAS_TOPIC]->(t)
        MATCH (d:Domain)-[:CONTAINS]->(c)

        // Inbound Prerequisites
        OPTIONAL MATCH (prereq:Topic)-[:PREREQUISITE_OF]->(t)

        // Outbound Dependents
        OPTIONAL MATCH (t)-[:PREREQUISITE_OF]->(dependent:Topic)

        // Domain-Specific Cross Edges
        OPTIONAL MATCH (t)-[:USES_COMPONENT]->(component:Topic)
        OPTIONAL MATCH (t)-[:FOUNDED_ON]->(principle:Topic)
        OPTIONAL MATCH (t)-[:USES_PATTERN]->(pattern)

        // Questions
        OPTIONAL MATCH (t)-[:HAS_QUESTION]->(q:Question)

        WITH d, c, t,
             collect(DISTINCT {slug: prereq.slug, title: prereq.title, topicId: prereq.topicId}) AS rawPrereqs,
             collect(DISTINCT {slug: dependent.slug, title: dependent.title, topicId: dependent.topicId}) AS rawDependents,
             collect(DISTINCT {slug: component.slug, title: component.title}) AS rawComponents,
             collect(DISTINCT {slug: principle.slug, title: principle.title}) AS rawPrinciples,
             collect(DISTINCT {slug: pattern.slug, name: pattern.name}) AS rawPatterns,
             collect(DISTINCT {
               id: q.id,
               title: q.title,
               difficulty: q.difficulty,
               learningLevel: q.learningLevel,
               archetype: q.archetype,
               prompt: q.prompt,
               scaleAnchor: q.scaleAnchor,
               rubricGuide: q.rubricGuide,
               rubricAtoms: q.rubricAtoms,
               hints: q.hints,
               followUpProbes: q.followUpProbes,
               expectedKeywords: q.expectedKeywords,
               antiPatterns: q.antiPatterns
             }) AS rawQuestions

        RETURN {
          domain: { slug: d.slug, name: d.name },
          category: { slug: c.slug, name: c.name, pillar: c.pillar },
          topic: {
            slug: t.slug,
            topicId: t.topicId,
            title: t.title,
            pillar: t.pillar,
            priority: t.priority,
            difficulty: t.difficulty,
            durationMin: t.durationMin,
            frequency: t.frequency,
            weight: t.weight,
            trend: t.trend,
            description: t.description,
            rubricAtoms: t.rubricAtoms
          },
          graphRelationships: {
            prerequisites: [p IN rawPrereqs WHERE p.slug IS NOT NULL],
            dependents: [dep IN rawDependents WHERE dep.slug IS NOT NULL],
            usedComponents: [uc IN rawComponents WHERE uc.slug IS NOT NULL],
            foundedOn: [fo IN rawPrinciples WHERE fo.slug IS NOT NULL],
            algorithmPatterns: [ap IN rawPatterns WHERE ap.slug IS NOT NULL]
          },
          questions: [qn IN rawQuestions WHERE qn.id IS NOT NULL]
        } AS topicDetail
      `;

      const result = await session.run(cypher, { topicSlug });
      if (result.records.length === 0) return null;

      return result.records[0].get('topicDetail') as TopicDetailResponse;
    } finally {
      await session.close();
    }
  }

  /**
   * Fetches an adaptive question feed for a candidate taking a live interview or practice session
   */
  public static async fetchAdaptiveQuestions(
    topicSlug: string,
    options: {
      targetLevel?: string;
      difficulty?: string;
      limit?: number;
    } = {}
  ): Promise<BaseQuestionNode[]> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH (t:Topic {slug: $topicSlug})-[:HAS_QUESTION]->(q:Question)
        WHERE ($targetLevel IS NULL OR q.learningLevel = $targetLevel)
          AND ($difficulty IS NULL OR q.difficulty = $difficulty)
        RETURN q.id AS id,
               q.title AS title,
               q.difficulty AS difficulty,
               q.learningLevel AS learningLevel,
               q.archetype AS archetype,
               q.prompt AS prompt,
               q.scaleAnchor AS scaleAnchor,
               q.rubricGuide AS rubricGuide,
               q.rubricAtoms AS rubricAtoms,
               q.hints AS hints,
               q.followUpProbes AS followUpProbes,
               q.expectedKeywords AS expectedKeywords,
               q.antiPatterns AS antiPatterns
        ORDER BY q.learningLevel, q.id
        LIMIT toInteger($limit)
      `;

      const result = await session.run(cypher, {
        topicSlug,
        targetLevel: options.targetLevel || null,
        difficulty: options.difficulty || null,
        limit: options.limit || 10
      });

      return result.records.map(record => ({
        id: record.get('id'),
        title: record.get('title'),
        difficulty: record.get('difficulty'),
        learningLevel: record.get('learningLevel'),
        archetype: record.get('archetype'),
        prompt: record.get('prompt'),
        scaleAnchor: record.get('scaleAnchor'),
        rubricGuide: record.get('rubricGuide'),
        rubricAtoms: record.get('rubricAtoms'),
        hints: record.get('hints'),
        followUpProbes: record.get('followUpProbes'),
        expectedKeywords: record.get('expectedKeywords'),
        antiPatterns: record.get('antiPatterns')
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Calculates the topological DAG prerequisite learning path to reach a target topic
   */
  public static async fetchLearningPath(goalTopicSlug: string): Promise<any[]> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      const cypher = `
        MATCH path = (prereq:Topic)-[:PREREQUISITE_OF*1..6]->(target:Topic {slug: $goalTopicSlug})
        WITH nodes(path) AS topicNodes
        UNWIND topicNodes AS node
        WITH DISTINCT node
        RETURN node.slug AS slug,
               node.topicId AS topicId,
               node.title AS title,
               node.priority AS priority,
               node.difficulty AS difficulty,
               node.durationMin AS durationMin
        ORDER BY node.priority, node.difficulty
      `;

      const result = await session.run(cypher, { goalTopicSlug });
      return result.records.map(r => ({
        slug: r.get('slug'),
        topicId: r.get('topicId'),
        title: r.get('title'),
        priority: r.get('priority'),
        difficulty: r.get('difficulty'),
        durationMin: r.get('durationMin')
      }));
    } finally {
      await session.close();
    }
  }
}
