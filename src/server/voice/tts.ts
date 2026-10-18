import "dotenv/config";

export interface CartesiaTTSConfig {
  modelId: "sonic-3.6" | "sonic-3.5" | "sonic-3";
  voiceId: string;
  sampleRate: 24000 | 16000;
  encoding: "pcm_s16le" | "pcm_f32le";
  container: "wav" | "raw";
}

// Curated high-fidelity voices for technical interviewer personas
export const VOICES = {
  sarah: "694f9389-aac1-45b6-b726-9d9369183238", // Sarah - Mindful Woman (Staff Engineer)
  gareth: "3a01612e-07da-4a85-bba8-ce10481df477", // Gareth - Conversational Specialist
  cillian: "15a13943-32a7-49a9-b944-d6062129c5a3", // Cillian - Corporate Presenter
  harlow: "6c756032-11c3-4be8-a120-74f9673fb700", // Harlow - Warm Support
};

export const DEFAULT_CARTESIA_CONFIG: CartesiaTTSConfig = {
  modelId: "sonic-3.6",
  voiceId: VOICES.sarah,
  sampleRate: 24000,
  encoding: "pcm_s16le",
  container: "wav",
};

/**
 * Synthesizes ultra-low-latency speech audio (<60ms TTFB) via Cartesia Sonic-3.6.
 * Outputs standard browser-playable WAV audio by default.
 */
export async function synthesizeInterviewerSpeech(
  transcriptText: string,
  config: Partial<CartesiaTTSConfig> = {}
): Promise<ArrayBuffer> {
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_CONFIG: CARTESIA_API_KEY is not defined.");
  }

  const cfg: CartesiaTTSConfig = { ...DEFAULT_CARTESIA_CONFIG, ...config };

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
        container: cfg.container,
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
