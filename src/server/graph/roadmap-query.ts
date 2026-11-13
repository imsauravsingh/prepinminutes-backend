/**
 * PrepInMinutes — 5-Factor Personalized Roadmap Generation Engine
 * 
 * Implements:
 * 1. Multi-dimensional scoring formula:
 *    P(t) = 0.30 R(t) + 0.20 C(t) + 0.10 M(t) + 0.25 SkillGap(t) + 0.15 S(t)
 * 2. Transitive prerequisite dependency closure over Neo4j [:PREREQUISITE_OF*1..6]
 * 3. Kahn's algorithm topological sorting with max-heap priority scheduling
 * 4. Cycle detection guard and weekly milestone bucketing
 * 
 * Governed by:
 * - docs/CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 7)
 * - docs/TASK_EXECUTION_SEQUENCE.md (TASK-P2-03)
 */

import { getNeo4jDriver } from "./neo4j";

export interface CandidateProficiencyInput {
  topicSlug: string;
  currentProficiency: "UNKNOWN" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  confidenceScore?: number;
}

export interface RoadmapGenerationInput {
  targetRoleSlug: string;
  targetCompanySlug?: string;
  timelineWeeks?: number;
  weeklyGoalHours?: number;
  currentStageSlug?: string;
  candidateProficiencies?: CandidateProficiencyInput[];
}

export interface ScoredTopic {
  slug: string;
  title: string;
  domainSlug: string;
  durationMin: number;
  difficulty: string;
  priorityScore: number;
  roleScore: number;
  companyScore: number;
  marketScore: number;
  skillGapScore: number;
  stageScore: number;
  isCore: boolean;
  prerequisites: string[];
}

export interface WeeklyMilestone {
  weekNumber: number;
  title: string;
  focus: string;
  topicSlugs: string[];
  topics: Array<{
    slug: string;
    title: string;
    difficulty: string;
    durationMin: number;
  }>;
  totalDurationMin: number;
  isCompleted: boolean;
}

export interface GeneratedRoadmap {
  title: string;
  targetRole: string;
  targetCompany?: string;
  timelineWeeks: number;
  weeklyGoalHours: number;
  totalTopics: number;
  weeklyMilestones: WeeklyMilestone[];
  domainWeights: Record<string, number>;
  closureTopicsAdded: number;
}

const PROFICIENCY_SCORES: Record<string, number> = {
  UNKNOWN: 0.0,
  BEGINNER: 0.25,
  INTERMEDIATE: 0.5,
  ADVANCED: 0.75,
  EXPERT: 1.0,
};

const ROLE_LEVEL_TARGET: Record<string, number> = {
  L1: 0.4, // Beginner to Intermediate
  L2: 0.6, // Solid Intermediate
  L3: 0.75, // Advanced
  L4: 0.9, // Very Advanced
  L5: 1.0, // Expert
};

const MARKET_TREND_SCORES: Record<string, number> = {
  SURGING: 100,
  HOT: 85,
  STABLE: 65,
  COOLING: 40,
};

export class RoadmapEngine {
  /**
   * Generates a fully personalized, prerequisite-closed, topologically sorted roadmap.
   */
  public static async generateRoadmap(input: RoadmapGenerationInput): Promise<GeneratedRoadmap> {
    const timelineWeeks = Math.max(1, Math.min(16, input.timelineWeeks ?? 4));
    const weeklyGoalHours = Math.max(2, Math.min(40, input.weeklyGoalHours ?? 8.0));
    const totalAvailableHours = timelineWeeks * weeklyGoalHours;

    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
      // -------------------------------------------------------------
      // 1. Fetch Candidate Topics with Graph Factor Attributes
      // -------------------------------------------------------------
      const topicQuery = `
        MATCH (r:Role {slug: $roleSlug})
        OPTIONAL MATCH (r)-[req:REQUIRES_TOPIC]->(t:Topic)
        WITH r, t, req
        WHERE t IS NOT NULL

        // Domain context
        MATCH (d:Domain)-[:CONTAINS]->(:Category)-[:HAS_TOPIC]->(t)

        // Company frequency factor
        OPTIONAL MATCH (t)-[freq:FREQUENTLY_ASKED_AT]->(c:Company {slug: $companySlug})

        // Stage alignment factor
        OPTIONAL MATCH (t)-[:TESTED_IN_STAGE]->(s:InterviewStage {slug: $stageSlug})

        RETURN t.slug AS slug,
               t.title AS title,
               d.slug AS domainSlug,
               coalesce(t.durationMin, 15) AS durationMin,
               coalesce(t.difficulty, 'INTERMEDIATE') AS difficulty,
               coalesce(t.trend, 'STABLE') AS trend,
               coalesce(req.priorityScore, 70) AS rolePriority,
               coalesce(req.isCore, false) AS isCore,
               coalesce(r.minProficiency, 'L3') AS roleTargetLevel,
               freq.frequencyScore AS companyFrequency,
               freq.confidenceScore AS companyConfidence,
               s IS NOT NULL AS isTestedInCurrentStage
      `;

      const topicResult = await session.run(topicQuery, {
        roleSlug: input.targetRoleSlug,
        companySlug: input.targetCompanySlug ?? "",
        stageSlug: input.currentStageSlug ?? "",
      });

      if (topicResult.records.length === 0) {
        throw new Error(`No curriculum topics found for target role '${input.targetRoleSlug}'.`);
      }

      // Map candidate proficiencies
      const profMap = new Map<string, number>();
      if (input.candidateProficiencies) {
        for (const p of input.candidateProficiencies) {
          profMap.set(p.topicSlug, PROFICIENCY_SCORES[p.currentProficiency] ?? 0.0);
        }
      }

      // -------------------------------------------------------------
      // 2. Compute 5-Factor Prioritization Score P(t)
      // -------------------------------------------------------------
      const scoredTopics: ScoredTopic[] = [];

      for (const rec of topicResult.records) {
        const slug = rec.get("slug");
        const title = rec.get("title");
        const domainSlug = rec.get("domainSlug");
        const durationMin = rec.get("durationMin").toInt ? rec.get("durationMin").toInt() : Number(rec.get("durationMin"));
        const difficulty = rec.get("difficulty");
        const trend = rec.get("trend");
        const rolePriority = Number(rec.get("rolePriority"));
        const isCore = rec.get("isCore");
        const roleTargetLevel = rec.get("roleTargetLevel");
        const companyFreq = rec.get("companyFrequency");
        const companyConf = rec.get("companyConfidence");
        const isTestedInStage = rec.get("isTestedInCurrentStage");

        // Factor 1: R(t) Role Relevance (30%)
        const R = Math.min(100, Math.max(0, rolePriority));

        // Factor 2: C(t) Company Relevance (20%)
        let C = 50.0;
        if (companyFreq !== null && companyConf !== null) {
          C = Number(companyFreq) * Number(companyConf);
        }

        // Factor 3: M(t) Market Relevance (10%)
        const M = MARKET_TREND_SCORES[trend] ?? 65.0;

        // Factor 4: G(t) Candidate Skill Gap (25%)
        const targetNumeric = ROLE_LEVEL_TARGET[roleTargetLevel] ?? 0.75;
        const currentNumeric = profMap.get(slug) ?? 0.0;
        const skillGapRaw = Math.max(0, targetNumeric - currentNumeric);
        const G = skillGapRaw * 100.0;

        // Factor 5: S(t) Stage Relevance (15%)
        let S = 60.0;
        if (input.currentStageSlug) {
          S = isTestedInStage ? 100.0 : 40.0;
        }

        // 5-Factor Weighted Composite:
        // P(t) = 0.30 R + 0.20 C + 0.10 M + 0.25 G + 0.15 S
        const compositeScore = 0.3 * R + 0.2 * C + 0.1 * M + 0.25 * G + 0.15 * S;

        scoredTopics.push({
          slug,
          title,
          domainSlug,
          durationMin,
          difficulty,
          priorityScore: Math.round(compositeScore * 10) / 10,
          roleScore: R,
          companyScore: Math.round(C),
          marketScore: Math.round(M),
          skillGapScore: Math.round(G),
          stageScore: Math.round(S),
          isCore,
          prerequisites: [],
        });
      }

      // -------------------------------------------------------------
      // 3. Candidate Budget Sizing & Initial Top-K Selection
      // -------------------------------------------------------------
      // Rule of thumb: ~45 min deep practice + review per topic = ~1 topic per hour
      const targetTopicCount = Math.min(
        scoredTopics.length,
        Math.max(6, Math.floor(totalAvailableHours * 1.2))
      );

      // Sort candidate topics by composite score DESC (with core topics breaking ties)
      scoredTopics.sort((a, b) => {
        if (a.isCore !== b.isCore) return a.isCore ? -1 : 1;
        return b.priorityScore - a.priorityScore;
      });

      const selectedSeedTopics = scoredTopics.slice(0, targetTopicCount);
      const selectedSlugs = selectedSeedTopics.map((t) => t.slug);

      // -------------------------------------------------------------
      // 4. Recursive Transitive Prerequisite Closure Traversal
      // -------------------------------------------------------------
      const closureQuery = `
        MATCH (target:Topic) WHERE target.slug IN $selectedSlugs
        OPTIONAL MATCH (prereq:Topic)-[:PREREQUISITE_OF*1..6]->(target)
        WITH collect(DISTINCT target) + collect(DISTINCT prereq) AS fullClosure
        UNWIND fullClosure AS t
        OPTIONAL MATCH (p:Topic)-[:PREREQUISITE_OF]->(t)
        RETURN DISTINCT t.slug AS slug,
               t.title AS title,
               coalesce(t.durationMin, 15) AS durationMin,
               coalesce(t.difficulty, 'INTERMEDIATE') AS difficulty,
               collect(DISTINCT p.slug) AS prerequisites
      `;

      const closureResult = await session.run(closureQuery, { selectedSlugs });

      const scoredMap = new Map<string, ScoredTopic>();
      for (const t of scoredTopics) {
        scoredMap.set(t.slug, t);
      }

      const allClosureTopics: ScoredTopic[] = [];
      let closureTopicsAdded = 0;

      for (const rec of closureResult.records) {
        const slug = rec.get("slug");
        const title = rec.get("title");
        const durationMin = rec.get("durationMin").toInt ? rec.get("durationMin").toInt() : Number(rec.get("durationMin"));
        const difficulty = rec.get("difficulty");
        const rawPrereqs: string[] = rec.get("prerequisites") || [];
        const cleanPrereqs = rawPrereqs.filter((p) => Boolean(p));

        if (scoredMap.has(slug)) {
          const existing = scoredMap.get(slug)!;
          existing.prerequisites = cleanPrereqs;
          allClosureTopics.push(existing);
        } else {
          // Topic introduced via transitive prerequisite closure
          closureTopicsAdded++;
          allClosureTopics.push({
            slug,
            title,
            domainSlug: "prerequisite-foundation",
            durationMin,
            difficulty,
            priorityScore: 85.0, // Prerequisite foundations inherit high baseline scheduling priority
            roleScore: 80,
            companyScore: 50,
            marketScore: 70,
            skillGapScore: 80,
            stageScore: 60,
            isCore: true,
            prerequisites: cleanPrereqs,
          });
        }
      }

      // -------------------------------------------------------------
      // 5. Kahn's Algorithm: Topological Sort with Max-Heap Priority
      // -------------------------------------------------------------
      const sortedTopics = this.topologicalSortWithMaxHeap(allClosureTopics);

      // -------------------------------------------------------------
      // 6. Bucket into Weekly Milestones matching Candidate Budget
      // -------------------------------------------------------------
      const weeklyMilestones = this.bucketIntoWeeklyMilestones(sortedTopics, timelineWeeks);

      // Calculate domain weights
      const domainCount: Record<string, number> = {};
      for (const t of sortedTopics) {
        domainCount[t.domainSlug] = (domainCount[t.domainSlug] || 0) + 1;
      }
      const totalCount = sortedTopics.length;
      const domainWeights: Record<string, number> = {};
      for (const [dom, count] of Object.entries(domainCount)) {
        domainWeights[dom] = Math.round((count / totalCount) * 100) / 100;
      }

      const roleName = input.targetRoleSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        title: `${timelineWeeks}-Week ${roleName} Preparation Roadmap`,
        targetRole: input.targetRoleSlug,
        targetCompany: input.targetCompanySlug,
        timelineWeeks,
        weeklyGoalHours,
        totalTopics: sortedTopics.length,
        weeklyMilestones,
        domainWeights,
        closureTopicsAdded,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Performs Kahn's algorithm using a priority queue (max-heap by priorityScore)
   * while filtering prerequisites strictly within the closure set.
   */
  private static topologicalSortWithMaxHeap(topics: ScoredTopic[]): ScoredTopic[] {
    const topicMap = new Map<string, ScoredTopic>();
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const t of topics) {
      topicMap.set(t.slug, t);
      inDegree.set(t.slug, 0);
      adj.set(t.slug, []);
    }

    // Only count prerequisites that actually exist within our closure
    for (const t of topics) {
      for (const prereq of t.prerequisites) {
        if (topicMap.has(prereq)) {
          adj.get(prereq)!.push(t.slug);
          inDegree.set(t.slug, (inDegree.get(t.slug) || 0) + 1);
        }
      }
    }

    // Max-heap queue of zero in-degree nodes
    const queue: string[] = [];
    for (const [slug, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(slug);
    }

    const scoreOf = (slug: string) => topicMap.get(slug)?.priorityScore ?? 0;
    queue.sort((a, b) => scoreOf(b) - scoreOf(a));

    const sorted: ScoredTopic[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(topicMap.get(current)!);

      for (const neighbor of adj.get(current) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
          queue.sort((a, b) => scoreOf(b) - scoreOf(a));
        }
      }
    }

    // Cycle detection guard
    if (sorted.length !== topics.length) {
      console.warn(
        `⚠️ Warning: Dependency cycle detected in prerequisite closure! Sorted ${sorted.length}/${topics.length}. Falling back with cycle breaker.`
      );
      // Append any unvisited nodes sorted by priorityScore
      const visited = new Set(sorted.map((s) => s.slug));
      const remaining = topics.filter((t) => !visited.has(t.slug));
      remaining.sort((a, b) => b.priorityScore - a.priorityScore);
      sorted.push(...remaining);
    }

    return sorted;
  }

  /**
   * Distributes topologically sorted topics across weekly milestones.
   */
  private static bucketIntoWeeklyMilestones(
    sortedTopics: ScoredTopic[],
    timelineWeeks: number
  ): WeeklyMilestone[] {
    const milestones: WeeklyMilestone[] = [];
    const topicsPerWeek = Math.ceil(sortedTopics.length / timelineWeeks);

    const weekTitles = [
      "Foundations, Core Data Structures & Architectural Principles",
      "System Building Blocks, Caching & Data Modeling",
      "Distributed Coordination, Concurrency & High Throughput",
      "Fault Tolerance, Resilience & Multi-Region Topologies",
      "Advanced Domain Deep-Dives & Runtime Optimization",
      "Large-Scale System Design & RFC Synthesis",
      "Production Incidents, Blameless RCAs & Operational Health",
      "Executive Communication, Leadership & Final Mock Loops",
    ];

    for (let w = 0; w < timelineWeeks; w++) {
      const weekIndex = w + 1;
      const startIdx = w * topicsPerWeek;
      const weekTopics = sortedTopics.slice(startIdx, startIdx + topicsPerWeek);

      if (weekTopics.length === 0) continue;

      const totalDurationMin = weekTopics.reduce((sum, t) => sum + t.durationMin, 0);
      const title = weekTitles[w % weekTitles.length] || `Week ${weekIndex} Deep Dives`;
      const focus = weekTopics.map((t) => t.title).slice(0, 3).join(", ");

      milestones.push({
        weekNumber: weekIndex,
        title: `Week ${weekIndex}: ${title}`,
        focus: `Focus on: ${focus}${weekTopics.length > 3 ? ` and ${weekTopics.length - 3} more` : ""}`,
        topicSlugs: weekTopics.map((t) => t.slug),
        topics: weekTopics.map((t) => ({
          slug: t.slug,
          title: t.title,
          difficulty: t.difficulty,
          durationMin: t.durationMin,
        })),
        totalDurationMin,
        isCompleted: false,
      });
    }

    return milestones;
  }
}
