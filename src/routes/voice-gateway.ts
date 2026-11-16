import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { buildDeepgramStreamingTarget, transcribeAudioBuffer } from "../server/voice/stt";
import { synthesizeInterviewerSpeech, VOICES, ELEVENLABS_VOICES } from "../server/voice/tts";
import { globalVoiceController } from "../server/voice/gateway";

/**
 * GET /api/voice/session/config
 * Returns active voice AI providers, supported models, preferred persona, and streaming configuration.
 */
export async function handleGetVoiceSessionConfig(req: ApiRequest): Promise<Response> {
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  const cartesiaKey = process.env.CARTESIA_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  let deepgramWsUrl = "";
  try {
    deepgramWsUrl = buildDeepgramStreamingTarget().url;
  } catch {
    deepgramWsUrl = "wss://api.deepgram.com/v1/listen?model=nova-2";
  }

  return ApiResponse.json({
    success: true,
    deepgramAvailable: Boolean(deepgramKey),
    cartesiaAvailable: Boolean(cartesiaKey),
    elevenLabsAvailable: Boolean(elevenLabsKey),
    sttModel: "nova-2",
    ttsModel: "sonic-3.6",
    preferredVoice: "sarah",
    voiceId: VOICES.sarah,
    sampleRate: 24000,
    turnBudgetMs: 800,
    streamingSupported: true,
    deepgramWsUrl,
    availableVoices: [
      { id: VOICES.sarah, name: "Sarah", role: "AI Staff Infrastructure Engineer (Mindful/Direct)" },
      { id: VOICES.gareth, name: "Gareth", role: "Conversational System Specialist" },
      { id: VOICES.cillian, name: "Cillian", role: "Corporate Principal Reviewer" },
      { id: VOICES.harlow, name: "Harlow", role: "Warm Empathetic Guide" },
    ],
  });
}

/**
 * POST /api/mock-interview/session/start
 * Initializes a MockInterviewSession and returns Deepgram Nova-2 & Cartesia Sonic-3.6 voice session metadata.
 */
export async function handlePostMockInterviewStart(req: ApiRequest): Promise<Response> {
  try {
    const resolvedClerkId = resolveCandidateClerkId(req);
    const candidateIdentifier =
      resolvedClerkId ||
      req.headers.get("x-candidate-id") ||
      req.headers.get("x-candidate-email") ||
      "candidate@prepinminutes.com";

    // Rate Limit Check (fail-open in demo/dev mode)
    try {
      const rl = await checkRateLimit(candidateIdentifier, "general");
      if (!rl.allowed) {
        return ApiResponse.json(
          { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
          { status: 429 }
        );
      }
    } catch {
      // Redis rate limiter partitioned
    }

    const context = await withCandidateContext(candidateIdentifier).catch(async () => {
      return await withCandidateContext("candidate@prepinminutes.com");
    });

    if (!context.profile) {
      return ApiResponse.json(
        { error: "PROFILE_REQUIRED", message: "Complete candidate profile first." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      interviewType = "system-design",
      targetRole = context.profile.targetRole || "Senior Software Engineer",
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

    let deepgramTargetUrl = "";
    try {
      deepgramTargetUrl = buildDeepgramStreamingTarget().url;
    } catch {
      deepgramTargetUrl = "wss://api.deepgram.com/v1/listen?model=nova-2";
    }

    return ApiResponse.json({
      success: true,
      session,
      voiceConfig: {
        sttModel: "nova-2",
        ttsModel: "sonic-3.6",
        voiceId: VOICES.sarah,
        sampleRate: 24000,
        deepgramWsUrl: deepgramTargetUrl,
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
 * Synthesizes interviewer voice audio bytes using Cartesia Sonic-3.6 TTS (with ElevenLabs fallback).
 * Returns standard playable audio/wav bytes.
 */
export async function handlePostVoiceSynthesize(req: ApiRequest): Promise<Response> {
  try {
    const resolvedClerkId = resolveCandidateClerkId(req);
    const candidateIdentifier =
      resolvedClerkId ||
      req.headers.get("x-candidate-id") ||
      req.headers.get("x-candidate-email") ||
      "candidate@prepinminutes.com";

    // Rate Limit Check (fail-open in demo/dev mode)
    try {
      const rl = await checkRateLimit(candidateIdentifier, "general");
      if (!rl.allowed) {
        return ApiResponse.json(
          { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
          { status: 429 }
        );
      }
    } catch {}

    const body = await req.json().catch(() => ({}));
    const { text, voiceId } = body;
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

    if (!audioBuffer || audioBuffer.byteLength < 500) {
      return ApiResponse.json({
        success: true,
        transcript: "",
        confidence: 1.0,
      });
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
        success: false,
        transcript: "",
        error: "TRANSCRIPTION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice/session/interrupt
 * Handles low-latency candidate barge-in interruptions (<150ms).
 * Halts AI speech playback, flushes audio buffers, and transitions state to CANDIDATE_SPEAKING.
 */
export async function handlePostVoiceInterrupt(req: ApiRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, source = "client_vad", timestampMs = Date.now() } = body;

    // Trigger state machine transition and buffer clearance
    const event = globalVoiceController.onCandidateSpeechDetected(
      Number(timestampMs) || Date.now()
    );

    return ApiResponse.json({
      success: true,
      sessionId,
      source,
      interrupted: event.interrupted,
      previousState: event.previousState,
      newState: event.newState,
      latencyMs: event.latencyMs,
      clearAudioBuffer: event.clearAudioBuffer,
      timestamp: Date.now(),
      telemetry: globalVoiceController.getTelemetry(),
    });
  } catch (error) {
    console.error("Voice interrupt error:", error);
    return ApiResponse.json(
      {
        error: "INTERRUPT_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
