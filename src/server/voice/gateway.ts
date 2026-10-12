export type VoiceTurnState = "IDLE" | "AI_SPEAKING" | "CANDIDATE_SPEAKING" | "PROCESSING";

export interface BargeInEvent {
  interrupted: boolean;
  previousState: VoiceTurnState;
  newState: VoiceTurnState;
  latencyMs: number;
  clearAudioBuffer: boolean;
}

/**
 * Sub-100ms Voice Activity Detection (VAD) & Barge-In Turn-Taking Controller.
 * Immediately halts AI speech playback and flushes outbound TTS buffers when candidate speaks.
 */
export class VoiceTurnController {
  private state: VoiceTurnState = "IDLE";
  private lastTransitionTime: number = Date.now();

  public getState(): VoiceTurnState {
    return this.state;
  }

  public startAiSpeaking(): void {
    this.state = "AI_SPEAKING";
    this.lastTransitionTime = Date.now();
  }

  public finishAiSpeaking(): void {
    if (this.state === "AI_SPEAKING") {
      this.state = "IDLE";
      this.lastTransitionTime = Date.now();
    }
  }

  /**
   * Invoked when Deepgram VAD or client microphone detects candidate speech onset.
   */
  public onCandidateSpeechDetected(detectionTimestampMs = Date.now()): BargeInEvent {
    const previousState = this.state;
    const now = Date.now();
    const latencyMs = Math.max(1, now - detectionTimestampMs);

    const interrupted = previousState === "AI_SPEAKING";
    this.state = "CANDIDATE_SPEAKING";
    this.lastTransitionTime = now;

    return {
      interrupted,
      previousState,
      newState: this.state,
      latencyMs,
      clearAudioBuffer: interrupted,
    };
  }

  public onCandidateSilence(): void {
    if (this.state === "CANDIDATE_SPEAKING") {
      this.state = "PROCESSING";
      this.lastTransitionTime = Date.now();
    }
  }
}
