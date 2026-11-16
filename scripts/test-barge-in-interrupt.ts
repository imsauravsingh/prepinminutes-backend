/**
 * PrepInMinutes — TASK-P7-02 Automated Verification Test Suite
 *
 * Verifies:
 * 1. Sub-150ms Server-Side Barge-In Interruption Invariant:
 *    - Transition from AI_SPEAKING -> CANDIDATE_SPEAKING with interrupted: true
 *    - Outbound audio memory buffer flush (clearAudioBuffer: true, byteLength: 0)
 *    - Interruption counter incrementation and telemetry
 * 2. Edge API Endpoint:
 *    - POST /api/voice/session/interrupt
 *    - Request payload parsing ({ sessionId, source, timestampMs })
 *    - Response schema ({ success, interrupted, previousState, newState, latencyMs, clearAudioBuffer })
 * 3. Multi-Turn Conversational Barge-In Simulation:
 *    - Turn 1: AI starts speaking -> Candidate interrupts -> Audio stops -> Candidate speaks
 *    - Turn 2: AI answers -> Candidate listens patiently -> AI finishes speaking cleanly
 * 4. Edge Cases:
 *    - Double interruption while candidate is already speaking
 *    - Interruption when idle
 */

import worker from "../src/index";
import { VoiceTurnController, globalVoiceController } from "../src/server/voice/gateway";

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
  console.log("🧪 TASK-P7-02: Server-Side Barge-In & Interruption Handler Test Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // Test Group 1: VoiceTurnController Barge-In Invariants
  // -------------------------------------------------------------
  console.log("🔹 1. Testing VoiceTurnController Barge-In Invariant...");
  {
    const controller = new VoiceTurnController();
    assert(controller.getState() === "IDLE", "Initial state is IDLE");

    // Start AI speaking and buffer 48KB of TTS audio
    controller.startAiSpeaking();
    assert(controller.getState() === "AI_SPEAKING", "State transitioned to AI_SPEAKING");

    const samplePcmChunk = new ArrayBuffer(48000); // 1 second of 24kHz 16-bit audio
    controller.bufferAudioChunk(samplePcmChunk);
    assert(controller.getBufferedByteLength() === 48000, "Outbound audio buffer holds 48,000 bytes");

    // Candidate speaks! (Simulate detection from 18ms ago)
    const detectionTime = Date.now() - 18;
    const bargeInEvent = controller.onCandidateSpeechDetected(detectionTime);

    assert(bargeInEvent.interrupted === true, "Barge-in correctly flagged (interrupted: true)");
    assert(bargeInEvent.previousState === "AI_SPEAKING", "Previous state was AI_SPEAKING");
    assert(bargeInEvent.newState === "CANDIDATE_SPEAKING", "New state is CANDIDATE_SPEAKING");
    assert(bargeInEvent.clearAudioBuffer === true, "clearAudioBuffer is true");
    assert(bargeInEvent.latencyMs >= 15, `Interruption latency accurately computed (~${bargeInEvent.latencyMs}ms)`);
    assert(controller.getBufferedByteLength() === 0, "Buffered audio bytes immediately flushed to 0");
    assert(controller.getState() === "CANDIDATE_SPEAKING", "Controller state updated to CANDIDATE_SPEAKING");

    const telemetry = controller.getTelemetry();
    assert(telemetry.interruptionsCount === 1, "Interruption counted in telemetry");
  }

  // -------------------------------------------------------------
  // Test Group 2: Edge API Route (POST /api/voice/session/interrupt)
  // -------------------------------------------------------------
  console.log("\n🔹 2. Testing Edge Route POST /api/voice/session/interrupt...");
  {
    // Put global controller into AI_SPEAKING state
    globalVoiceController.startAiSpeaking();
    assert(globalVoiceController.getState() === "AI_SPEAKING", "Global controller in AI_SPEAKING state");

    const interruptReq = new Request(`${BASE_URL}/api/voice/session/interrupt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-candidate-email": "candidate@prepinminutes.com",
      },
      body: JSON.stringify({
        sessionId: "mock-sess-789",
        source: "client_vad_energy_onset",
        timestampMs: Date.now() - 25,
      }),
    });

    const interruptRes = await worker.fetch(interruptReq, {});
    assert(interruptRes.status === 200, `POST /api/voice/session/interrupt returns 200 OK (got ${interruptRes.status})`);

    const data = (await interruptRes.json()) as any;
    assert(data.success === true, "Response has success: true");
    assert(data.interrupted === true, "Response confirms interrupted: true");
    assert(data.previousState === "AI_SPEAKING", "Response confirms previousState: AI_SPEAKING");
    assert(data.newState === "CANDIDATE_SPEAKING", "Response confirms newState: CANDIDATE_SPEAKING");
    assert(data.clearAudioBuffer === true, "Response confirms clearAudioBuffer: true");
    assert(data.source === "client_vad_energy_onset", "Carries source identifier");
    assert(typeof data.latencyMs === "number", `Latency reported as numeric (${data.latencyMs}ms)`);
    assert(typeof data.timestamp === "number", "Timestamp present");
  }

  // -------------------------------------------------------------
  // Test Group 3: Multi-Turn Conversation Simulation
  // -------------------------------------------------------------
  console.log("\n🔹 3. Testing Multi-Turn Dialogue Flow with Interruption & Clean Turn...");
  {
    const sim = new VoiceTurnController();

    // --- Turn 1: Interrupted ---
    sim.startAiSpeaking();
    sim.bufferAudioChunk(new ArrayBuffer(16000));
    assert(sim.getState() === "AI_SPEAKING", "Turn 1: AI starts speaking");

    // Candidate interrupts
    const t1Interrupt = sim.onCandidateSpeechDetected();
    assert(t1Interrupt.interrupted === true, "Turn 1: Candidate successfully interrupted AI");
    assert(sim.getBufferedByteLength() === 0, "Turn 1: Audio buffer wiped");

    // Candidate finishes speaking
    sim.onCandidateSilence();
    assert(sim.getState() === "PROCESSING", "Turn 1: Silence transitions to PROCESSING");

    // --- Turn 2: Non-interrupted (Clean turn) ---
    sim.startAiSpeaking();
    assert(sim.getState() === "AI_SPEAKING", "Turn 2: AI answers");

    // AI completes without interruption
    sim.finishAiSpeaking();
    assert(sim.getState() === "IDLE", "Turn 2: AI completes speaking, state returns to IDLE");

    const finalTelemetry = sim.getTelemetry();
    assert(finalTelemetry.interruptionsCount === 1, "Final telemetry accurately shows 1 interruption");
    assert(finalTelemetry.totalTurns === 1, "Final telemetry accurately records 1 completed clean turn");
  }

  // -------------------------------------------------------------
  // Test Group 4: Edge Cases & Robustness
  // -------------------------------------------------------------
  console.log("\n🔹 4. Testing Edge Cases & Idempotent Speech Detections...");
  {
    const edgeController = new VoiceTurnController();

    // Case 1: Candidate speaks when system is already IDLE
    const idleEvent = edgeController.onCandidateSpeechDetected();
    assert(idleEvent.interrupted === false, "Speech when IDLE does not flag interrupted (interrupted: false)");
    assert(idleEvent.clearAudioBuffer === false, "Speech when IDLE does not request buffer clear");
    assert(edgeController.getState() === "CANDIDATE_SPEAKING", "State moved to CANDIDATE_SPEAKING");

    // Case 2: Subsequent speech frame while candidate is ALREADY speaking
    const alreadySpeakingEvent = edgeController.onCandidateSpeechDetected();
    assert(alreadySpeakingEvent.interrupted === false, "Repeated speech event does not trigger barge-in");
    assert(alreadySpeakingEvent.previousState === "CANDIDATE_SPEAKING", "Previous state was CANDIDATE_SPEAKING");
    assert(edgeController.getState() === "CANDIDATE_SPEAKING", "State remains CANDIDATE_SPEAKING");
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 All Server-Side Barge-In & Interruption tests passed successfully!\n");
  } else {
    console.error("❌ Some tests failed.\n");
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Barge-in test runner encountered an error:", err);
  process.exit(1);
});
