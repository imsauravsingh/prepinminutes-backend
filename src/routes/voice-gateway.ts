import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { buildDeepgramStreamingTarget, transcribeAudioBuffer } from "../server/voice/stt";
import { synthesizeInterviewerSpeech } from "../server/voice/tts";

/**
 * POST /api/mock-interview/session/start
 * Initializes a MockInterviewSession and returns Deepgram Nova-2 & Cartesia Sonic-3.6 voice session metadata.
 */
export async function handlePostMockInterviewStart(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const rl = await checkRateLimit(clerkId, "general");
    if (!rl.allowed) {
      return ApiResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
        { status: 429 }
      );
    }

    const context = await withCandidateContext(clerkId);
    if (!context.profile) {
      return ApiResponse.json(
        { error: "PROFILE_REQUIRED", message: "Complete candidate profile first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      interviewType = "system-design",
      targetRole = context.profile.targetRole,
      difficulty = "senior",
      durationMinutes = 45,
    } = body;

    const session = await db.mockInterviewSession.create({
      data: {
        candidateId: context.profile.id,
        interviewType,
        targetRole,
        difficulty,
        durationMinutes: Number(durationMinutes) || 45,
        status: "ACTIVE",
        transcript: [],
      },
    });

    const deepgramTarget = buildDeepgramStreamingTarget();

    return ApiResponse.json({
      success: true,
      session,
      voiceConfig: {
        sttModel: "nova-2",
        ttsModel: "sonic-3.6",
        deepgramWsUrl: deepgramTarget.url,
      },
    });
  } catch (error) {
    console.error("Mock interview start failed:", error);
    return ApiResponse.json(
      {
        error: "MOCK_START_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice/synthesize
 * Synthesizes interviewer voice audio bytes using Cartesia Sonic-3.6 TTS.
 * Returns standard playable audio/wav bytes.
 */
export async function handlePostVoiceSynthesize(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { text, voiceId } = await req.json();
    if (!text || typeof text !== "string") {
      return ApiResponse.json({ error: "TEXT_REQUIRED" }, { status: 400 });
    }

    const audioBuffer = await synthesizeInterviewerSpeech(
      text,
      voiceId ? { voiceId } : {}
    );

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Voice TTS synthesis failed:", error);
    return ApiResponse.json(
      {
        error: "TTS_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice/transcribe
 * Transcribes candidate speech audio (e.g. webm/wav from MediaRecorder) using Deepgram Nova-2.
 */
export async function handlePostVoiceTranscribe(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "audio/webm";

    let audioBuffer: ArrayBuffer;
    let mimeType = "audio/webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("audio") as File | null;
      if (!file) {
        return ApiResponse.json({ error: "AUDIO_FILE_REQUIRED" }, { status: 400 });
      }
      audioBuffer = await file.arrayBuffer();
      mimeType = file.type || "audio/webm";
    } else {
      audioBuffer = await req.arrayBuffer();
      mimeType = contentType;
    }

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return ApiResponse.json({ error: "EMPTY_AUDIO_PAYLOAD" }, { status: 400 });
    }

    const result = await transcribeAudioBuffer(audioBuffer, mimeType);

    return ApiResponse.json({
      success: true,
      transcript: result.text,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error("Voice transcription failed:", error);
    return ApiResponse.json(
      {
        error: "TRANSCRIPTION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
