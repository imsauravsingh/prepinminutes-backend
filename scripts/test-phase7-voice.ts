import "dotenv/config";
import { parseDeepgramFrame, buildDeepgramStreamingTarget } from "../src/server/voice/stt";
import { VoiceTurnController } from "../src/server/voice/gateway";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPhase7Tests() {
  console.log("=== PHASE 7 REAL-TIME VOICE GATEWAY TEST SUITE ===\n");

  // 1. Test Deepgram Nova-2 Streaming Config & Frame Parser
  console.log("1. Testing Deepgram Nova-2 Streaming Frame Parser...");
  if (process.env.DEEPGRAM_API_KEY) {
    const target = buildDeepgramStreamingTarget();
    assert(target.url.includes("model=nova-2"), "Deepgram URL must specify nova-2 model");
    assert(target.headers.Authorization.startsWith("Token "), "Deepgram Auth header must use Token");
  }

  const sampleFrame = JSON.stringify({
    type: "Results",
    is_final: true,
    channel: {
      alternatives: [
        {
          transcript: "We should partition the consistent hash ring across multiple availability zones.",
          confidence: 0.98,
        },
      ],
    },
  });

  const parsed = parseDeepgramFrame(sampleFrame);
  assert(parsed !== null, "Parsed frame should not be null");
  assert(parsed?.isFinal === true, "Frame should be marked final");
  assert(parsed?.confidence === 0.98, "Confidence should match 0.98");
  console.log("  ✓ Deepgram Nova-2 frame parsed accurately.");

  // 2. Test Voice Turn-Taking & Sub-100ms Barge-In Controller
  console.log("2. Testing Sub-100ms VAD Barge-In Interruption Controller...");
  const controller = new VoiceTurnController();
  assert(controller.getState() === "IDLE", "Initial state must be IDLE");

  controller.startAiSpeaking();
  assert(controller.getState() === "AI_SPEAKING", "State must transition to AI_SPEAKING");

  const bargeIn = controller.onCandidateSpeechDetected(Date.now() - 12);
  assert(bargeIn.interrupted === true, "Barge-in must flag interrupted = true when AI was speaking");
  assert(bargeIn.clearAudioBuffer === true, "Barge-in must flush outbound TTS buffer");
  assert(bargeIn.latencyMs < 100, `Barge-in latency (${bargeIn.latencyMs}ms) must be < 100ms`);
  assert(controller.getState() === "CANDIDATE_SPEAKING", "State must transition to CANDIDATE_SPEAKING");
  console.log(`  ✓ VAD Barge-In cut AI speech in ${bargeIn.latencyMs}ms (<100ms threshold).`);

  console.log("\n✅ ALL PHASE 7 VOICE GATEWAY TESTS PASSED!");
}

runPhase7Tests().catch((err) => {
  console.error("❌ Phase 7 Test Failed:", err);
  process.exit(1);
});
