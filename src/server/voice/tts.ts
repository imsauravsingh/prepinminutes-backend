import "dotenv/config";

export interface CartesiaTTSConfig {
  modelId: "sonic-english";
  voiceId: string;
  sampleRate: 24000 | 16000;
  encoding: "pcm_s16le" | "pcm_f32le";
}

export const DEFAULT_CARTESIA_CONFIG: CartesiaTTSConfig = {
  modelId: "sonic-english",
  // Default professional technical interviewer voice
  voiceId: "a0e99841-438c-4a64-b679-ae501e7d6091",
  sampleRate: 24000,
  encoding: "pcm_s16le",
};

/**
 * Synthesizes ultra-low-latency PCM audio chunks (<50ms TTFB) via Cartesia Sonic API.
 */
export async function synthesizeInterviewerSpeech(
  transcriptText: string,
  config: Partial<CartesiaTTSConfig> = {}
): Promise<ArrayBuffer> {
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_CONFIG: CARTESIA_API_KEY is not defined.");
  }

  const cfg = { ...DEFAULT_CARTESIA_CONFIG, ...config };

  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: cfg.modelId,
      transcript: transcriptText,
      voice: {
        mode: "id",
        id: cfg.voiceId,
      },
      output_format: {
        container: "raw",
        encoding: cfg.encoding,
        sample_rate: cfg.sampleRate,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown Cartesia error");
    throw new Error(`CARTESIA_TTS_ERROR (${response.status}): ${errText}`);
  }

  return response.arrayBuffer();
}
