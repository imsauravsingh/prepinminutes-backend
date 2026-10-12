import "dotenv/config";

export interface DeepgramStreamConfig {
  model: "nova-2";
  language: "en-US";
  smartFormat: boolean;
  interimResults: boolean;
  endpointingMs: number;
  vadEvents: boolean;
}

export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestampMs: number;
}

export const DEFAULT_DEEPGRAM_CONFIG: DeepgramStreamConfig = {
  model: "nova-2",
  language: "en-US",
  smartFormat: true,
  interimResults: true,
  endpointingMs: 300,
  vadEvents: true,
};

/**
 * Builds the authenticated Deepgram Nova-2 WebSocket URL and headers for <80ms streaming STT.
 */
export function buildDeepgramStreamingTarget(
  customConfig: Partial<DeepgramStreamConfig> = {}
): { url: string; headers: Record<string, string> } {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_CONFIG: DEEPGRAM_API_KEY is not defined.");
  }

  const cfg = { ...DEFAULT_DEEPGRAM_CONFIG, ...customConfig };
  const params = new URLSearchParams({
    model: cfg.model,
    language: cfg.language,
    smart_format: String(cfg.smartFormat),
    interim_results: String(cfg.interimResults),
    endpointing: String(cfg.endpointingMs),
    vad_events: String(cfg.vadEvents),
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
  });

  return {
    url: `wss://api.deepgram.com/v1/listen?${params.toString()}`,
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  };
}

/**
 * Parses a raw Deepgram Nova-2 WebSocket message frame into a normalized TranscriptSegment.
 */
export function parseDeepgramFrame(rawJson: string): TranscriptSegment | null {
  try {
    const data = JSON.parse(rawJson);
    if (data.type !== "Results") return null;

    const alternative = data.channel?.alternatives?.[0];
    if (!alternative || typeof alternative.transcript !== "string") {
      return null;
    }

    const text = alternative.transcript.trim();
    if (!text) return null;

    return {
      text,
      isFinal: Boolean(data.is_final),
      confidence: Number(alternative.confidence ?? 1.0),
      timestampMs: Date.now(),
    };
  } catch {
    return null;
  }
}
