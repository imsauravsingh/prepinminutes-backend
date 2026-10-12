# PrepInMinutes — Backend API Services (`prepinminutes-backend`)

Edge-native backend microservice layer for **PrepInMinutes**, deployed on **Cloudflare Workers** (`api.prepinminutes.com`) and connected to the static Next.js frontend (`prepinminutes.com`).

---

## 🏗️ Architecture & Tech Stack

- **Edge Runtime**: Cloudflare Workers (`nodejs_compat` enabled)
- **Relational & Vector DB**: Neon Serverless PostgreSQL + `pgvector(1536)` via Prisma ORM (`@prisma/adapter-pg`)
- **In-Memory Cache, Rate Limiting & Idempotency**: Upstash Redis (`@upstash/redis`)
- **Blob & Object Storage**: Cloudflare R2 (`@aws-sdk/client-s3`)
- **AI Reasoning & Embeddings**: Google Gemini (`gemini-3.1-flash-lite` & `gemini-embedding-001`)
- **Real-Time Voice Gateway**: Deepgram `nova-2` STT + Cartesia `sonic-english` TTS + Sub-100ms VAD Barge-In
- **Authentication & Tenant Isolation**: Clerk JWT Bearer & `x-candidate-clerk-id` verification

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Rate Limit Tier |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/health` | Edge gateway liveness check | Public |
| `GET` | `/api/onboarding/profile` | Fetch authenticated candidate profile & active plan | General (60/min) |
| `POST` | `/api/onboarding/profile` | Upsert candidate target role, seniority, companies & timeline | General (60/min) |
| `POST` | `/api/onboarding/resume` | Upload PDF resume to R2, extract text & index 1536-dim vectors | AI Eval (10/min) |
| `POST` | `/api/plan/generate` | Synthesize multi-week personalized preparation roadmap | AI Eval (10/min) |
| `POST` | `/api/practice/session/submit` | Grade code/whiteboard submission, update Bayesian readiness & SM-2 | AI Eval (10/min) |
| `POST` | `/api/mock-interview/session/start` | Initialize mock interview session & Deepgram/Cartesia voice config | General (60/min) |
| `POST` | `/api/mock-interview/session/end` | Evaluate multi-turn mock interview transcript & produce report | AI Eval (10/min) |
| `GET` | `/api/evaluation/:reportId` | Retrieve tenant-isolated evaluation report & 5-dim rubric scores | General (60/min) |
| `GET` | `/api/revision/items` | Fetch due SuperMemo-2 spaced repetition items (`nextReviewDate <= NOW()`) | General (60/min) |
| `POST` | `/api/revision/items` | Submit recall score & recalculate SM-2 interval and ease factor | General (60/min) |
| `POST` | `/api/voice/synthesize` | Synthesize low-latency interviewer speech via Cartesia Sonic | AI Eval (10/min) |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure local environment
cp .env.example .env

# 3. Generate Prisma Client & push schema to Neon
npm run db:generate
npm run db:push

# 4. Start Cloudflare Worker locally on http://localhost:8787
npm run dev
```

---

## 🧪 Verification & Test Suites

```bash
npm run typecheck       # TypeScript compilation check
npm run test:db         # Phase 1: Neon PostgreSQL & pgvector connectivity
npm run test:clients    # Phase 2: Redis, R2, Gemini & Tenant Isolation
npm run test:domain     # Phase 3: Deterministic Rubric Scoring, Bayesian Readiness & SM-2
npm run test:security   # Phase 4: Sliding Window Rate Limiter & 24h Idempotency
npm run test:onboarding # Phase 5: Profile, Resume PDF & Roadmap Synthesis
npm run test:eval       # Phase 6: Practice Submit, Mock Debrief & Spaced Revision
```
