# Voice AI Agent Architecture — Deepgram Nova-2 & Cartesia Sonic-3.6

This document specifies the backend voice services in `prepinminutes-backend`.

---

## 1. Credentials & Environment

```env
# Real-Time Voice Streaming
DEEPGRAM_PROJECT_ID="93a7057e-3816-4945-9fda-8f3b1952e5ef"
DEEPGRAM_API_KEY="4452c8677bef88f7d3c0209d41df69b7fbf90d7f"
CARTESIA_API_KEY="sk_car_ByefNJfCjUnqdGZzyxwZkm"
```

---

## 2. Implemented Services & Endpoints

1. **`src/server/voice/tts.ts`**:
   - Model: `sonic-3.6` (ultra-low latency, natural prosody).
   - Voice ID: `694f9389-aac1-45b6-b726-9d9369183238` (Sarah - Mindful Woman).
   - Format: `container: "wav"`, `sample_rate: 24000`, `encoding: "pcm_s16le"`.
   - Function: `synthesizeInterviewerSpeech(text, config)`.

2. **`src/server/voice/stt.ts`**:
   - Model: `nova-2`.
   - WebSocket streaming URL: `buildDeepgramStreamingTarget()`.
   - REST audio transcription: `transcribeAudioBuffer(buffer, mimeType)`.

3. **`src/server/voice/gateway.ts`**:
   - `VoiceTurnController`: Barge-in state machine transitioning from `AI_SPEAKING` to `CANDIDATE_SPEAKING` with buffer flushing in $<15$ms.

4. **API Endpoints**:
   - `POST /api/voice/synthesize`: Body `{ text, voiceId? }` -> Returns `audio/wav` binary stream.
   - `POST /api/voice/transcribe`: Body binary audio buffer or multipart -> Returns `{ success: true, transcript, confidence }`.

---

## 3. Autonomous Hands-Free Voice Protocol

1. **Echo Cancellation**: Configured via Web Audio API `echoCancellation: true` to prevent candidate's microphone from re-transcribing Sarah's speech.
2. **Turn-Taking Sequence**:
   - `AI_SPEAKING`: Spoken by Cartesia Sonic-3.6.
   - `LISTENING_WAITING`: Automatically activated on `audio.onended`.
   - `CANDIDATE_SPEAKING`: Activated when RMS volume exceeds threshold ($0.035$).
   - `PROCESSING`: Activated when silence exceeds $1.8$s, triggering Deepgram Nova-2 transcription.
   - `AI_SPEAKING`: Sarah evaluates and speaks the next diagnostic question.


