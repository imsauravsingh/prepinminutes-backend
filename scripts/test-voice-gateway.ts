/**
 * PrepInMinutes — TASK-P7-01 Automated Verification Test Suite
 *
 * Verifies:
 * 1. Voice Turn Controller & Barge-In Invariant:
 *    - Turn state transitions (IDLE -> AI_SPEAKING -> CANDIDATE_SPEAKING -> PROCESSING)
 *    - Low-latency barge-in interruption detection (interrupted: true, clearAudioBuffer: true)
 *    - Audio buffer accumulation and clearance
 *    - Standard control packet serialization (INTERRUPT, STATE_CHANGE, etc.)
 * 2. Speech-to-Text (Deepgram Nova-2) Engine:
 *    - WebSocket target URL and configuration parameters (model, linear16, 16kHz, endpointing 300ms)
 *    - Normalization of raw Deepgram message frames to TranscriptSegment
 * 3. Text-to-Speech (Cartesia Sonic-3.6 / ElevenLabs) Engine:
 *    - 44-byte standard RIFF/WAVE PCM header generator
 *    - High-fidelity speech synthesis audio buffer output
 * 4. HTTP Voice Gateway Endpoints:
 *    - GET /api/voice/session/config
 *    - POST /api/voice/synthesize
 *    - POST /api/voice/transcribe
 *    - POST /api/mock-interview/session/start
 */

import worker from "../src/index";
import { db } from "../src/server/db/client";
import { VoiceTurnController } from "../src/server/voice/gateway";
import { buildDeepgramStreamingTarget, parseDeepgramFrame } from "../src/server/voice/stt";
import {
  createWavHeader,
  generateMockWavBuffer,
  synthesizeInterviewerSpeech,
  VOICES,
} from "../src/server/voice/tts";

const BASE_URL = "https://api.prepinminutes.internal";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 TASK-P7-01: Real-Time Voice AI Gateway Test Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // Test Group 1: VoiceTurnController & Barge-In Invariant
  // -------------------------------------------------------------
  console.log("🔹 1. Testing VoiceTurnController & Barge-In Logic...");
  {
    const controller = new VoiceTurnController();
    assert(controller.getState() === "IDLE", "Initial controller state is IDLE");

    // AI starts speaking
    controller.startAiSpeaking();
    assert(controller.getState() === "AI_SPEAKING", "State transitioned to AI_SPEAKING");

    // Buffer mock audio chunk
    const mockChunk = new ArrayBuffer(1024);
    controller.bufferAudioChunk(mockChunk);
    assert(controller.getBufferedByteLength() === 1024, "Audio chunk buffered (1024 bytes)");
    assert(controller.getBufferedChunksCount() === 1, "Buffered chunks count is 1");

    // Candidate speaks while AI is speaking -> Immediate Barge-In!
    const bargeIn = controller.onCandidateSpeechDetected();
    assert(bargeIn.interrupted === true, "Barge-in correctly flagged (interrupted: true)");
    assert(bargeIn.previousState === "AI_SPEAKING", "Previous state captured as AI_SPEAKING");
    assert(bargeIn.newState === "CANDIDATE_SPEAKING", "New state updated to CANDIDATE_SPEAKING");
    assert(bargeIn.clearAudioBuffer === true, "Barge-in triggered buffer clear request");
    assert(controller.getBufferedByteLength() === 0, "Outbound audio buffer immediately flushed on barge-in");

    // Candidate stops speaking (silence detected)
    controller.onCandidateSilence();
    assert(controller.getState() === "PROCESSING", "State transitioned to PROCESSING upon candidate silence");

    // Telemetry inspection
    const telemetry = controller.getTelemetry();
    assert(telemetry.interruptionsCount === 1, "Telemetry tracks exactly 1 interruption");

    // Standard control message formatting
    const interruptMsg = JSON.parse(
      VoiceTurnController.createControlMessage("INTERRUPT", { reason: "VAD_SPEECH_ONSET" })
    );
    assert(interruptMsg.type === "INTERRUPT", "Control message type is INTERRUPT");
    assert(interruptMsg.payload?.reason === "VAD_SPEECH_ONSET", "Control message carries payload");
  }

  // -------------------------------------------------------------
  // Test Group 2: Deepgram Nova-2 STT Streaming Configuration & Parsing
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing Deepgram Nova-2 STT Configuration & Frame Parsing...");
  {
    const target = buildDeepgramStreamingTarget();
    assert(target.url.startsWith("wss://api.deepgram.com"), "Target URL uses secure WebSocket (wss://)");
    assert(target.url.includes("model=nova-2"), "Target URL specifies model=nova-2");
    assert(target.url.includes("encoding=linear16"), "Target URL specifies encoding=linear16");
    assert(target.url.includes("sample_rate=16000"), "Target URL specifies sample_rate=16000");
    assert(target.url.includes("endpointing=300"), "Target URL enforces 300ms endpointing");
    assert(target.url.includes("vad_events=true"), "Target URL requests VAD events");
    assert(Boolean(target.headers.Authorization), "Target includes Authorization header");

    // Mock Deepgram Results message frame
    const mockDeepgramFrame = JSON.stringify({
      type: "Results",
      channel_index: [0],
      duration: 1.25,
      start: 0.0,
      is_final: true,
      channel: {
        alternatives: [
          {
            transcript: "We should use a consistent hash ring with virtual nodes.",
            confidence: 0.985,
          },
        ],
      },
    });

    const parsed = parseDeepgramFrame(mockDeepgramFrame);
    assert(parsed !== null, "Deepgram frame parsed successfully");
    assert(parsed?.text === "We should use a consistent hash ring with virtual nodes.", "Extracted transcript text matches");
    assert(parsed?.isFinal === true, "Segment marked isFinal: true");
    assert(parsed?.confidence === 0.985, "Confidence score accurately parsed");

    // Non-results frame should return null cleanly
    const nonResultFrame = JSON.stringify({ type: "Metadata", request_id: "req-123" });
    assert(parseDeepgramFrame(nonResultFrame) === null, "Metadata frame ignored cleanly");
  }

  // -------------------------------------------------------------
  // Test Group 3: Cartesia Sonic-3.6 TTS Audio Generation & WAV Header
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing TTS PCM Audio Synthesis & WAV Header Generation...");
  {
    const wavHeader = createWavHeader(48000, 24000, 1);
    assert(wavHeader.byteLength === 44, "Standard WAV header is exactly 44 bytes");

    const headerView = new DataView(wavHeader);
    const riffTag = String.fromCharCode(
      headerView.getUint8(0),
      headerView.getUint8(1),
      headerView.getUint8(2),
      headerView.getUint8(3)
    );
    assert(riffTag === "RIFF", `Header starts with RIFF magic bytes (got "${riffTag}")`);

    const waveTag = String.fromCharCode(
      headerView.getUint8(8),
      headerView.getUint8(9),
      headerView.getUint8(10),
      headerView.getUint8(11)
    );
    assert(waveTag === "WAVE", `Format tag is WAVE (got "${waveTag}")`);

    // Verify mock WAV generator
    const mockWav = generateMockWavBuffer(0.5, 24000);
    assert(mockWav.byteLength > 44, `Mock WAV generated ${mockWav.byteLength} bytes`);

    // Verify speech synthesis function (with fallback or live keys)
    const synthesized = await synthesizeInterviewerSpeech("Hello, welcome to your system design interview.");
    assert(synthesized.byteLength > 44, `Speech synthesis returned ${synthesized.byteLength} playable bytes`);
  }

  // -------------------------------------------------------------
  // Test Group 4: HTTP Voice Gateway Endpoints (via worker.fetch)
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing HTTP Voice Endpoints on Edge Gateway...");
  {
    // Test 1: GET /api/voice/session/config
    const configReq = new Request(`${BASE_URL}/api/voice/session/config`, {
      method: "GET",
    });
    const configRes = await worker.fetch(configReq, {});
    assert(configRes.status === 200, `GET /api/voice/session/config returns 200 OK (got ${configRes.status})`);

    const configData = (await configRes.json()) as any;
    assert(configData.success === true, "Session config response has success: true");
    assert(configData.sttModel === "nova-2", "STT model is nova-2");
    assert(configData.ttsModel === "sonic-3.6", "TTS model is sonic-3.6");
    assert(configData.preferredVoice === "sarah", "Preferred voice persona is Sarah");
    assert(typeof configData.sampleRate === "number", `Sample rate is numeric (${configData.sampleRate}Hz)`);
    assert(Array.isArray(configData.availableVoices), "Available voices returned as list");

    // Test 2: POST /api/voice/synthesize
    const synthReq = new Request(`${BASE_URL}/api/voice/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: JSON.stringify({
        text: "Tell me how you would design a scalable URL shortener.",
      }),
    });
    const synthRes = await worker.fetch(synthReq, {});
    assert(synthRes.status === 200, `POST /api/voice/synthesize returns 200 OK (got ${synthRes.status})`);
    assert(synthRes.headers.get("content-type") === "audio/wav", "Returns Content-Type: audio/wav");

    const synthBytes = await synthRes.arrayBuffer();
    assert(synthBytes.byteLength > 44, `Synthesized audio has valid length (${synthBytes.byteLength} bytes)`);

    // Test 3: POST /api/voice/transcribe (with synthetic audio)
    const sampleAudio = generateMockWavBuffer(0.2, 16000);
    const transcribeReq = new Request(`${BASE_URL}/api/voice/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: sampleAudio,
    });
    const transcribeRes = await worker.fetch(transcribeReq, {});
    assert(transcribeRes.status === 200, `POST /api/voice/transcribe returns 200 OK (got ${transcribeRes.status})`);

    const transcribeData = (await transcribeRes.json()) as any;
    assert(transcribeData.success === true, "Transcription response indicates success");
    assert(typeof transcribeData.confidence === "number", `Confidence score returned (${transcribeData.confidence})`);

    // Test 4: POST /api/mock-interview/session/start
    const startReq = new Request(`${BASE_URL}/api/mock-interview/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: JSON.stringify({
        interviewType: "system-design",
        targetRole: "Senior Staff Engineer",
        difficulty: "senior",
        durationMinutes: 45,
      }),
    });
    const startRes = await worker.fetch(startReq, {});
    assert(startRes.status === 200, `POST /api/mock-interview/session/start returns 200 OK (got ${startRes.status})`);

    const startData = (await startRes.json()) as any;
    assert(startData.success === true, "Mock interview start indicates success");
    assert(Boolean(startData.session?.id), `Created MockInterviewSession ID: ${startData.session?.id}`);
    assert(startData.voiceConfig?.ttsModel === "sonic-3.6", "Session voice config configured with Sonic-3.6");
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 All Real-Time Voice Gateway tests passed successfully!\n");
  } else {
    console.error("❌ Some tests failed.\n");
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Voice test runner encountered an error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect().catch(() => {});
  });
