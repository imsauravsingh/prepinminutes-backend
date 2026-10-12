import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { ai } from "../server/ai/gemini";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";

export async function handlePostPlanGenerate(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const rl = await checkRateLimit(clerkId, "ai_eval");
    if (!rl.allowed) {
      return ApiResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
        { status: 429 }
      );
    }

    const context = await withCandidateContext(clerkId);
    const profile = context.profile;

    if (!profile) {
      return ApiResponse.json(
        {
          error: "PROFILE_NOT_CONFIGURED",
          message: "Please complete your candidate profile before generating a plan.",
        },
        { status: 400 }
      );
    }

    const domains = await db.curriculumDomain.findMany({
      include: {
        categories: {
          take: 3,
          include: {
            topics: {
              take: 5,
              select: { id: true, title: true, slug: true, difficulty: true },
            },
          },
        },
      },
    });

    const topicCatalog = domains.map((d) => ({
      domain: d.name,
      sampleTopics: d.categories.flatMap((c) => c.topics.map((t) => t.title)),
    }));

    const prompt = `
You are the PrepInMinutes Principal Interview Architect. Generate a realistic, rigorous ${profile.timelineWeeks}-week preparation plan tailored to the candidate profile below.

CANDIDATE TARGET:
- Target Role: ${profile.targetRole}
- Experience Level: ${profile.experienceLevel}
- Target Companies: ${profile.targetCompanies.length > 0 ? profile.targetCompanies.join(", ") : "Top Tech / FAANG"}
- Timeline: ${profile.timelineWeeks} weeks
- Weekly Commitment: ${profile.weeklyGoalHours} hours/week

AVAILABLE CURRICULUM TOPICS IN REPOSITORY:
${JSON.stringify(topicCatalog, null, 2)}

Produce a valid JSON object matching the exact schema:
{
  "domainWeights": {
    "system-design": 0.40,
    "coding": 0.35,
    "behavioral": 0.15,
    "cloud": 0.10
  },
  "weeklyMilestones": [
    {
      "weekNumber": 1,
      "title": "Core Foundations & Systems Architecture",
      "focusDomain": "System Design",
      "targetHours": ${profile.weeklyGoalHours},
      "goals": ["Master distributed consensus", "Design high-throughput rate limiters"],
      "recommendedTopics": ["Distributed Caching", "Sliding Window Rate Limiter"]
    }
  ]
}

Ensure there are exactly ${profile.timelineWeeks} milestones (one per week). Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const planJson = JSON.parse(response.text || "{}");

    const plan = await db.preparationPlan.upsert({
      where: { candidateId: profile.id },
      update: {
        targetRole: profile.targetRole,
        targetSeniority: profile.experienceLevel,
        timelineWeeks: profile.timelineWeeks,
        weeklyMilestones: planJson.weeklyMilestones || [],
        domainWeights: planJson.domainWeights || {
          "system-design": 0.35,
          coding: 0.35,
          behavioral: 0.15,
          cloud: 0.15,
        },
      },
      create: {
        candidateId: profile.id,
        targetRole: profile.targetRole,
        targetSeniority: profile.experienceLevel,
        timelineWeeks: profile.timelineWeeks,
        weeklyMilestones: planJson.weeklyMilestones || [],
        domainWeights: planJson.domainWeights || {
          "system-design": 0.35,
          coding: 0.35,
          behavioral: 0.15,
          cloud: 0.15,
        },
      },
    });

    return ApiResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Preparation plan generation failed:", error);
    return ApiResponse.json(
      {
        error: "PLAN_GENERATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
