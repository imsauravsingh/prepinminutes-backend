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

/**
 * Transcribes an audio buffer or blob directly via Deepgram Nova-2 REST endpoint.
 */
export async function transcribeAudioBuffer(
  audioBuffer: ArrayBuffer | Uint8Array | Buffer,
  mimeType = "audio/webm"
): Promise<{ text: string; confidence: number }> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_CONFIG: DEEPGRAM_API_KEY is not defined.");
  }

  // Convert to Node.js Buffer for accurate byte length and non-chunked HTTP body
  const buffer: Buffer = Buffer.isBuffer(audioBuffer)
    ? audioBuffer
    : Buffer.from(audioBuffer as any);

  // Return empty transcript for ultra-short or empty buffers (under 500 bytes)
  if (buffer.length < 500) {
    return { text: "", confidence: 1.0 };
  }

  // Strip codec parameters for standard MIME type (e.g. "audio/webm" instead of "audio/webm;codecs=opus")
  const cleanMimeType = (mimeType.split(";")[0] || "audio/webm").trim();

  try {
    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": cleanMimeType,
          "Content-Length": String(buffer.length),
        },
        body: buffer as unknown as BodyInit,
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown Deepgram error");
      console.warn(`Deepgram STT warning (${response.status}):`, errText);

      // Gracefully handle slow uploads or client timeouts without crashing session
      if (response.status === 408 || response.status === 400) {
        return { text: "", confidence: 0 };
      }

      throw new Error(`DEEPGRAM_STT_ERROR (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const alt = data.results?.channels?.[0]?.alternatives?.[0];
    return {
      text: alt?.transcript?.trim() || "",
      confidence: Number(alt?.confidence ?? 1.0),
    };
  } catch (error: any) {
    if (error.name === "TimeoutError" || error.message?.includes("408") || error.message?.includes("SLOW_UPLOAD")) {
      console.warn("Deepgram transcription upload timeout (408); recovering gracefully with empty transcript.");
      return { text: "", confidence: 0 };
    }
    throw error;
  }
}
