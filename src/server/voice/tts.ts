import "dotenv/config";

export interface CartesiaTTSConfig {
  modelId: "sonic-3.6" | "sonic-3.5" | "sonic-3";
  voiceId: string;
  sampleRate: 24000 | 16000;
  encoding: "pcm_s16le" | "pcm_f32le";
  container: "wav" | "raw";
}

export interface ElevenLabsTTSConfig {
  modelId: "eleven_turbo_v2_5" | "eleven_monolingual_v1";
  voiceId: string;
  stability: number;
  similarityBoost: number;
}

// Curated high-fidelity voices for technical interviewer personas
export const VOICES = {
  sarah: "694f9389-aac1-45b6-b726-9d9369183238", // Sarah - Mindful Woman (Staff Engineer)
  gareth: "3a01612e-07da-4a85-bba8-ce10481df477", // Gareth - Conversational Specialist
  cillian: "15a13943-32a7-49a9-b944-d6062129c5a3", // Cillian - Corporate Presenter
  harlow: "6c756032-11c3-4be8-a120-74f9673fb700", // Harlow - Warm Support
};

export const ELEVENLABS_VOICES = {
  sarah: "EXAVITQu4vr4xnSDxMaL", // Sarah - Professional Soft
  rachel: "21m00Tcm4TlvDq8ikWAM", // Rachel - Calm interviewer
};

export const DEFAULT_CARTESIA_CONFIG: CartesiaTTSConfig = {
  modelId: "sonic-3.6",
  voiceId: VOICES.sarah,
  sampleRate: 24000,
  encoding: "pcm_s16le",
  container: "wav",
};

/**
 * Creates a standard 44-byte PCM WAV header for synthetic audio generation.
 */
export function createWavHeader(dataLength: number, sampleRate = 24000, channels = 1): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, channels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * channels * 2, true); // ByteRate
  view.setUint16(32, channels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return buffer;
}

/**
 * Generates mock audio bytes for unit tests and local sandbox fallback.
 */
export function generateMockWavBuffer(durationSeconds = 0.5, sampleRate = 24000): ArrayBuffer {
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const pcmBytes = sampleCount * 2;
  const header = createWavHeader(pcmBytes, sampleRate, 1);
  const fullBuffer = new Uint8Array(44 + pcmBytes);
  fullBuffer.set(new Uint8Array(header), 0);

  // Generate a soft tone
  const dataView = new DataView(fullBuffer.buffer, 44);
  for (let i = 0; i < sampleCount; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.25 * 32767;
    dataView.setInt16(i * 2, sample, true);
  }

  return fullBuffer.buffer;
}

/**
 * Synthesizes ultra-low-latency speech audio (<60ms TTFB) via Cartesia Sonic-3.6,
 * with transparent fallback to ElevenLabs Turbo v2.5 or local mock synthesis.
 */
export async function synthesizeInterviewerSpeech(
  transcriptText: string,
  config: Partial<CartesiaTTSConfig> = {}
): Promise<ArrayBuffer> {
  const cartesiaApiKey = process.env.CARTESIA_API_KEY;
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  // 1. Try Primary: Cartesia Sonic-3.6
  if (cartesiaApiKey) {
    try {
      const cfg: CartesiaTTSConfig = { ...DEFAULT_CARTESIA_CONFIG, ...config };

      const response = await fetch("https://api.cartesia.ai/tts/bytes", {
        method: "POST",
        headers: {
          "X-API-Key": cartesiaApiKey,
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

      if (response.ok) {
        return await response.arrayBuffer();
      }

      console.warn(`[TTS] Cartesia API failed (${response.status}), attempting fallback...`);
    } catch (err) {
      console.warn("[TTS] Cartesia fetch exception, attempting fallback:", err);
    }
  }

  // 2. Try Secondary: ElevenLabs Turbo v2.5
  if (elevenLabsApiKey) {
    try {
      const voiceId = ELEVENLABS_VOICES.sarah;
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_24000`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: transcriptText,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        }
      );

      if (response.ok) {
        const rawPcm = await response.arrayBuffer();
        const header = createWavHeader(rawPcm.byteLength, 24000, 1);
        const wavBuffer = new Uint8Array(44 + rawPcm.byteLength);
        wavBuffer.set(new Uint8Array(header), 0);
        wavBuffer.set(new Uint8Array(rawPcm), 44);
        return wavBuffer.buffer;
      }
    } catch (err) {
      console.warn("[TTS] ElevenLabs fetch exception:", err);
    }
  }

  // 3. Fallback: Local Synthetic Buffer (for unit tests / mock mode)
  if (process.env.NODE_ENV === "test" || !cartesiaApiKey) {
    return generateMockWavBuffer(1.0, 24000);
  }

  throw new Error("TTS_UNAVAILABLE: Neither Cartesia nor ElevenLabs credentials are functional.");
}
