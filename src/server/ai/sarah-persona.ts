/**
 * PrepInMinutes — Sarah AI Staff Interviewer Persona & Rubric Injection Engine
 *
 * Calibrated LLM Persona:
 * - Binds official question rubricAtoms, antiPatterns, followUpProbes, and scaleAnchor into Gemini system instructions.
 * - Tracks covered vs remaining rubric atoms across conversation turns.
 * - Actively challenges candidate anti-patterns and superficial answers.
 * - Replaces generic polite banter with authentic FAANG-caliber targeted follow-up probes.
 */

import "dotenv/config";
import { ai } from "./gemini";
import { getDb } from "../db/client";

export interface PracticeTurnInput {
  topicSlug: string;
  questionId?: string;
  candidateMessage: string;
  transcriptHistory?: Array<{
    sender: "ai" | "user";
    content: string;
  }>;
  candidateTargetLevel?: "L1" | "L2" | "L3" | "L4";
  questionOverride?: {
    id?: string;
    title: string;
    prompt: string;
    scaleAnchor?: string;
    rubricGuide?: string;
    rubricAtoms?: string[];
    hints?: string[];
    followUpProbes?: string[];
    expectedKeywords?: string[];
    antiPatterns?: string[];
  };
}

export interface PracticeTurnOutput {
  success: boolean;
  replyText: string;
  coveredRubricAtoms: string[];
  remainingRubricAtoms: string[];
  detectedAntiPatterns: string[];
  currentMasteryScore: number; // 0 - 100
  interviewPhase:
    | "scoping"
    | "high-level-design"
    | "deep-dive"
    | "failure-modes"
    | "wrap-up";
  nextSuggestedProbe?: string;
  evaluatorNotes?: string;
}

export async function executeSarahInterviewerTurn(
  input: PracticeTurnInput
): Promise<PracticeTurnOutput> {
  const prisma = getDb();

  // 1. Resolve Question Details (from DB or fallback override)
  let question = input.questionOverride || null;

  if (!question && input.questionId) {
    const dbQ = await prisma.curriculumQuestion.findFirst({
      where: {
        OR: [{ id: input.questionId }, { topic: { slug: input.topicSlug } }],
      },
      include: {
        topic: true,
      },
    });

    if (dbQ) {
      question = {
        id: dbQ.id,
        title: dbQ.title,
        prompt: dbQ.prompt,
        scaleAnchor: dbQ.rubricGuide,
        rubricGuide: dbQ.rubricGuide,
        rubricAtoms: dbQ.topic.rubricAtoms || [],
        hints: dbQ.hints || [],
        followUpProbes: [
          "How would this architecture scale if write throughput increased by 10x?",
          "What happens if a node in this cluster crashes during a write operation?",
          "How do you ensure consistency between your cache layer and the source-of-truth database?",
        ],
        expectedKeywords: ["scalability", "latency", "availability", "consistency", "partitioning"],
        antiPatterns: [
          "Treating cache as permanent persistent storage",
          "Ignoring network partitions and single points of failure",
          "Unbounded memory consumption without eviction policy",
        ],
      };
    }
  }

  // Fallback defaults if question is completely unfound
  const resolvedQuestion = question || {
    id: "default_q",
    title: input.topicSlug.replace(/-/g, " "),
    prompt: `Design a scalable, highly available architecture for ${input.topicSlug}. Walk me through component boundaries, data flow, and trade-offs.`,
    scaleAnchor: "L3 Senior Engineer: Demonstrates clear trade-offs, bottleneck mitigation, and disaster recovery.",
    rubricGuide: "Candidate must establish requirements, component decomposition, failure modes, and metrics.",
    rubricAtoms: [
      "Requirements and constraints scoping",
      "Component decomposition and data flow",
      "Bottleneck identification and mitigation",
      "Failure modes and graceful degradation",
    ],
    hints: [
      "Start by clarifying non-functional constraints like throughput and latency.",
      "Consider how data is partitioned and cached.",
      "Identify the single point of failure and eliminate it.",
    ],
    followUpProbes: [
      "How would you handle a sudden 10x traffic spike on this endpoint?",
      "What are the trade-offs between strong consistency and eventual consistency here?",
    ],
    expectedKeywords: ["scalability", "high availability", "latency", "consistency", "throughput"],
    antiPatterns: [
      "Assuming zero network latency between distributed nodes",
      "Failing to handle database failover",
    ],
  };

  const rubricAtoms = resolvedQuestion.rubricAtoms && resolvedQuestion.rubricAtoms.length > 0
    ? resolvedQuestion.rubricAtoms
    : [
        "Requirements & scale clarification",
        "High-level data flow diagramming",
        "Storage & caching tier trade-offs",
        "Failure recovery & redundancy",
      ];

  const antiPatterns = resolvedQuestion.antiPatterns || [];
  const followUpProbes = resolvedQuestion.followUpProbes || [];
  const targetLevel = input.candidateTargetLevel || "L3";

  // 2. Format Transcript History
  const historyText = Array.isArray(input.transcriptHistory) && input.transcriptHistory.length > 0
    ? input.transcriptHistory
        .map((t) => `${t.sender === "user" ? "CANDIDATE" : "SARAH (INTERVIEWER)"}: ${t.content}`)
        .join("\n\n")
    : "No prior transcript.";

  // 3. Construct Calibrated Staff Interviewer Prompt
  const prompt = `
You are Sarah, an expert Principal & Staff Technical Interviewer at a Tier-1 technology company.
You are conducting a live, realistic technical interview.

QUESTION UNDER EVALUATION:
Title: ${resolvedQuestion.title}
Prompt: ${resolvedQuestion.prompt}
Target Candidate Level: ${targetLevel}
Scale Anchor: ${resolvedQuestion.scaleAnchor || resolvedQuestion.rubricGuide}

OFFICIAL EVALUATION RUBRIC ATOMS:
${rubricAtoms.map((atom, i) => `${i + 1}. [ ] ${atom}`).join("\n")}

KNOWN ANTI-PATTERNS (Watch out for these):
${antiPatterns.map((ap) => `- ${ap}`).join("\n")}

CALIBRATED FOLLOW-UP PROBES:
${followUpProbes.map((probe) => `- ${probe}`).join("\n")}

CONVERSATION TRANSCRIPT SO FAR:
${historyText}

CANDIDATE'S LATEST RESPONSE:
"${input.candidateMessage}"

YOUR OBJECTIVE AS SARAH:
1. Evaluate the candidate's latest response against the Official Rubric Atoms.
2. Determine which Rubric Atoms the candidate has proved understanding of so far (coveredRubricAtoms).
3. Determine which Rubric Atoms are still MISSING (remainingRubricAtoms).
4. Check if the candidate exhibited any of the KNOWN ANTI-PATTERNS (detectedAntiPatterns).
5. Generate your conversational reply as Sarah:
   - Acknowledge good architectural decisions concisely (1 sentence).
   - If an anti-pattern was detected, immediately challenge it realistically (e.g. "What happens if that primary instance goes down while traffic is peaking?").
   - If no anti-pattern, select the most critical MISSING Rubric Atom and challenge the candidate with a targeted technical follow-up probe.
   - Tone: Professional, encouraging, realistic, and intellectually rigorous. Do NOT provide answers or preach; ask the candidate to solve it. Keep response within 2-4 sentences max so it flows naturally in voice or chat.
6. Estimate candidate current mastery score for this question (0 to 100).
7. Determine the current interview phase: "scoping" | "high-level-design" | "deep-dive" | "failure-modes" | "wrap-up".

Return strictly a valid JSON object matching this schema:
{
  "replyText": "Sarah's spoken response to the candidate",
  "coveredRubricAtoms": ["exact strings from the official rubric atoms list that are satisfied"],
  "remainingRubricAtoms": ["exact strings from the official rubric atoms list that are not yet covered"],
  "detectedAntiPatterns": ["any detected anti-patterns from the list, or empty array"],
  "currentMasteryScore": 75,
  "interviewPhase": "deep-dive",
  "nextSuggestedProbe": "The follow-up probe question Sarah is steering towards",
  "evaluatorNotes": "Brief 1-sentence note on candidate's technical depth"
}
`;

  try {
    const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

    // 8-second timeout guard for real-time voice & interactive chat responsiveness
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("LLM_TIMEOUT: Request exceeded 8000ms")), 8000)
    );

    const generatePromise = ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for consistent rubric tracking
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const parsed = JSON.parse(response.text || "{}");

    const covered = Array.isArray(parsed.coveredRubricAtoms)
      ? parsed.coveredRubricAtoms
      : [];
    const remaining = Array.isArray(parsed.remainingRubricAtoms)
      ? parsed.remainingRubricAtoms
      : rubricAtoms.filter((a) => !covered.includes(a));

    return {
      success: true,
      replyText:
        parsed.replyText ||
        "That is a good starting point. How would your design handle node failover during a peak traffic event?",
      coveredRubricAtoms: covered,
      remainingRubricAtoms: remaining,
      detectedAntiPatterns: Array.isArray(parsed.detectedAntiPatterns)
        ? parsed.detectedAntiPatterns
        : [],
      currentMasteryScore:
        typeof parsed.currentMasteryScore === "number"
          ? parsed.currentMasteryScore
          : Math.round((covered.length / Math.max(1, rubricAtoms.length)) * 100),
      interviewPhase: parsed.interviewPhase || "deep-dive",
      nextSuggestedProbe: parsed.nextSuggestedProbe || followUpProbes[0],
      evaluatorNotes: parsed.evaluatorNotes || "Candidate actively developing solution.",
    };
  } catch (error: any) {
    console.error("Sarah Interviewer LLM generation error:", error);

    // Resilient fallback output if LLM times out or is unreachable
    const defaultCovered = [rubricAtoms[0]];
    const defaultRemaining = rubricAtoms.slice(1);

    return {
      success: true,
      replyText:
        "That's a sound architectural approach. To take it further, how would you address data consistency and failover if your primary instance crashes during peak hours?",
      coveredRubricAtoms: defaultCovered,
      remainingRubricAtoms: defaultRemaining,
      detectedAntiPatterns: [],
      currentMasteryScore: 50,
      interviewPhase: "deep-dive",
      nextSuggestedProbe: followUpProbes[0] || "How does your system recover from network partitions?",
      evaluatorNotes: "Fallback response generated due to upstream latency.",
    };
  }
}
