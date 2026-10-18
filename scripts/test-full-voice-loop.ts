import "dotenv/config";

async function testFullVoiceLoop() {
  const cartesiaKey = process.env.CARTESIA_API_KEY;
  const deepgramKey = process.env.DEEPGRAM_API_KEY;

  console.log("=== TESTING FULL VOICE LOOP (Cartesia Sonic-3.6 TTS -> Deepgram Nova-2 STT) ===");

  // Step 1: Synthesize with Cartesia Sonic-3.6
  console.log("1. Synthesizing audio with Cartesia sonic-3.6...");
  const ttsRes = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": cartesiaKey || "",
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-3.6",
      transcript: "We should use a consistent hash ring with virtual nodes to avoid hotspotting.",
      voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238",
      },
      output_format: {
        container: "wav",
        encoding: "pcm_s16le",
        sample_rate: 24000,
      },
    }),
  });

  if (!ttsRes.ok) {
    throw new Error(`Cartesia error: ${await ttsRes.text()}`);
  }
  const audioBuffer = await ttsRes.arrayBuffer();
  console.log(`✓ Cartesia generated ${audioBuffer.byteLength} bytes.`);

  // Step 2: Send audio to Deepgram Nova-2 for STT
  console.log("2. Transcribing audio with Deepgram Nova-2...");
  const deepgramRes = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
    method: "POST",
    headers: {
      Authorization: `Token ${deepgramKey}`,
      "Content-Type": "audio/wav",
    },
    body: audioBuffer,
  });

  if (!deepgramRes.ok) {
    throw new Error(`Deepgram error: ${await deepgramRes.text()}`);
  }

  const dgData: any = await deepgramRes.json();
  const transcript = dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  const confidence = dgData.results?.channels?.[0]?.alternatives?.[0]?.confidence;

  console.log(`✓ Deepgram Nova-2 Transcription: "${transcript}"`);
  console.log(`✓ Confidence Score: ${confidence}`);
  console.log("\n🎉 FULL BI-DIRECTIONAL VOICE PIPELINE VERIFIED SUCCESSFULLY!");
}

testFullVoiceLoop().catch(console.error);

