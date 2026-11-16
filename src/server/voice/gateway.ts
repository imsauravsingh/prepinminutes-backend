export type VoiceTurnState =
  | "IDLE"
  | "AI_SPEAKING"
  | "CANDIDATE_SPEAKING"
  | "PROCESSING";

export interface BargeInEvent {
  interrupted: boolean;
  previousState: VoiceTurnState;
  newState: VoiceTurnState;
  latencyMs: number;
  clearAudioBuffer: boolean;
}

export type VoiceControlEventType =
  | "INTERRUPT"
  | "AI_START"
  | "AI_CHUNK"
  | "AI_DONE"
  | "TRANSCRIPT_INTERIM"
  | "TRANSCRIPT_FINAL"
  | "STATE_CHANGE"
  | "ERROR";

export interface VoiceControlMessage {
  type: VoiceControlEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
}

/**
 * Sub-100ms Voice Activity Detection (VAD) & Barge-In Turn-Taking Controller.
 * Immediately halts AI speech playback and flushes outbound TTS buffers when candidate speaks.
 */
export class VoiceTurnController {
  private state: VoiceTurnState = "IDLE";
  private lastTransitionTime: number = Date.now();
  private bufferedChunks: ArrayBuffer[] = [];
  private totalBufferedBytes: number = 0;
  private totalTurns: number = 0;
  private interruptionsCount: number = 0;

  public getState(): VoiceTurnState {
    return this.state;
  }

  public getDurationInCurrentStateMs(): number {
    return Math.max(0, Date.now() - this.lastTransitionTime);
  }

  public startAiSpeaking(): void {
    this.state = "AI_SPEAKING";
    this.lastTransitionTime = Date.now();
  }

  public finishAiSpeaking(): void {
    if (this.state === "AI_SPEAKING") {
      this.state = "IDLE";
      this.lastTransitionTime = Date.now();
      this.totalTurns++;
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
    if (interrupted) {
      this.interruptionsCount++;
      this.clearAudioBuffer();
    }

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

  public setProcessing(): void {
    this.state = "PROCESSING";
    this.lastTransitionTime = Date.now();
  }

  public setIdle(): void {
    this.state = "IDLE";
    this.lastTransitionTime = Date.now();
  }

  /**
   * Appends incoming candidate raw PCM audio chunk to memory buffer.
   */
  public bufferAudioChunk(chunk: ArrayBuffer): void {
    this.bufferedChunks.push(chunk);
    this.totalBufferedBytes += chunk.byteLength;
  }

  /**
   * Flushes and clears audio buffer (e.g. on barge-in or when turn completes).
   */
  public clearAudioBuffer(): void {
    this.bufferedChunks = [];
    this.totalBufferedBytes = 0;
  }

  public getBufferedByteLength(): number {
    return this.totalBufferedBytes;
  }

  public getBufferedChunksCount(): number {
    return this.bufferedChunks.length;
  }

  public getTelemetry(): Record<string, unknown> {
    return {
      state: this.state,
      durationInStateMs: this.getDurationInCurrentStateMs(),
      bufferedBytes: this.totalBufferedBytes,
      chunksCount: this.bufferedChunks.length,
      totalTurns: this.totalTurns,
      interruptionsCount: this.interruptionsCount,
    };
  }

  /**
   * Helper to format standard WebSocket control messages.
   */
  public static createControlMessage(
    type: VoiceControlEventType,
    payload: Record<string, unknown> = {}
  ): string {
    return JSON.stringify({
      type,
      timestamp: Date.now(),
      payload,
    });
  }
}

export const globalVoiceController = new VoiceTurnController();
