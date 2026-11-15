/**
 * PrepInMinutes — Live Practice Session Interviewer Turn Route
 *
 * POST /api/practice/session/turn
 * Processes a candidate response turn using the calibrated AiInterviewAgent,
 * returning the agent's response, rubric atoms coverage, and targeted follow-up probes.
 */

import { ApiRequest, ApiResponse } from "../lib/http";
import { executeAiInterviewAgentTurn, PracticeTurnInput } from "../server/ai/ai-interview-agent";

export async function handlePostPracticeSessionTurn(req: ApiRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      topicSlug,
      questionId,
      candidateMessage,
      transcriptHistory = [],
      candidateTargetLevel = "L3",
      agentConfig,
      questionOverride,
    } = body;

    if (!topicSlug) {
      return ApiResponse.json(
        { error: "VALIDATION_FAILED", message: "topicSlug is required." },
        { status: 400 }
      );
    }

    if (!candidateMessage || typeof candidateMessage !== "string" || !candidateMessage.trim()) {
      return ApiResponse.json(
        { error: "VALIDATION_FAILED", message: "candidateMessage must be a non-empty string." },
        { status: 400 }
      );
    }

    const input: PracticeTurnInput = {
      topicSlug,
      questionId,
      candidateMessage: candidateMessage.trim(),
      transcriptHistory: Array.isArray(transcriptHistory) ? transcriptHistory : [],
      candidateTargetLevel,
      agentConfig,
      questionOverride,
    };

    const result = await executeAiInterviewAgentTurn(input);
    return ApiResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Practice session turn processing failed:", error);
    return ApiResponse.json(
      {
        error: "INTERVIEW_TURN_FAILED",
        message: error instanceof Error ? error.message : "Unknown error during practice session turn.",
      },
      { status: 500 }
    );
  }
}
