# Hermes Kanban Board — PrepInMinutes Master Task Plan

> **Hermes Integration Board**: Full lifecycle tracking of PrepInMinutes full-stack implementation across 8 architectural phases.

---

## 📊 Live Visual Kanban Board

| 📋 TODO (Backlog) | 🔄 IN PROGRESS | 🚀 READY FOR REVIEW / PR | ✅ DONE (Merged / Cleared) |
| :--- | :--- | :--- | :--- |
| `TASK-P7-01` to `TASK-P8-04` | *(Awaiting next task kickoff)* | **PR #8 Open**:<br>`TASK-P6-01`: Practice Submit & Eval<br>`TASK-P6-02`: Mock End & Grade<br>`TASK-P6-03`: Report Detail API<br>`TASK-P6-04`: Spaced Revision Sync | **PR #3, #4, #5, #6, #7 Merged**:<br>`TASK-P1-01` to `P1-04`<br>`TASK-P2-01` to `P2-04`<br>`TASK-P3-01` to `P3-03`<br>`TASK-P4-01` to `P4-03`<br>`TASK-P5-01`: Profile API<br>`TASK-P5-02`: Resume RAG Embedding<br>`TASK-P5-03`: Roadmap API |

---

## 🔬 Agent Specialist & Quality Gates Verification Matrix

| Task ID | Title | Specialist Agent | Unit Tests | Integration Tests | Static / Schema Validation | Feature / E2E Verification |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **`TASK-P1-01`** | Database Schema Design (prisma/schema.prisma) | `database-architect` | ❌ No | ❌ No | `npx prisma validate` | Schema audit against docs/architecture/layers/06-persistence-storage-layer.... |
| **`TASK-P1-02`** | Dual Connection Configuration & Prisma Adapters | `infrastructure-engineer` | ❌ No | ✅ Yes | `npm run typecheck` | Neon pooled vs direct compute connection switching verified via live timest... |
| **`TASK-P1-03`** | Database Migration Push to Neon PostgreSQL | `database-architect` | ❌ No | ✅ Yes | `PostgreSQL pgvector extension loaded in catalog` | Neon public schema table verification (15 tables present)... |
| **`TASK-P1-04`** | Curriculum Catalog Seeding (prisma/seed.ts) | `content-engineer` | ❌ No | ✅ Yes | `npm run typecheck` | Seed script populates >135 topics across 4 domains without foreign key cons... |
| **`TASK-P2-01`** | Prisma Client Singleton with Tenant Isolation | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck && npm run lint` | Tenant isolation wrapper: Tenant A queries strictly blocked from Tenant B d... |
| **`TASK-P2-02`** | Upstash Redis Client Singleton | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Upstash Redis REST ping roundtrip <50ms with automatic retry logic... |
| **`TASK-P2-03`** | Cloudflare R2 Object Storage S3 Client | `storage-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Presigned PUT URL generated for Cloudflare R2; test 1-byte buffer uploaded ... |
| **`TASK-P2-04`** | Google Gemini SDK Singleton | `ai-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Google Gemini 2.0 Flash returns structured JSON conforming to schema withou... |
| **`TASK-P3-01`** | 5-Dimension Rubric Scoring Engine | `math-engineer` | ✅ Yes | ❌ No | `npm run typecheck` | 100% boundary assertions for 5-dimension rubric scoring; harmonic mean and ... |
| **`TASK-P3-02`** | Bayesian Candidate Readiness Engine | `math-engineer` | ✅ Yes | ❌ No | `npm run typecheck` | Bayesian readiness momentum: cold-start alpha (0.40) vs converged alpha (0.... |
| **`TASK-P3-03`** | SuperMemo-2 Spaced Repetition Engine | `math-engineer` | ✅ Yes | ❌ No | `npm run typecheck` | SuperMemo-2 interval decay: EF floor (1.30) and future UTC nextReviewDate t... |
| **`TASK-P4-01`** | Clerk Edge Authentication Route Guard | `security-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Edge middleware route guard: public routes bypass, protected routes enforce... |
| **`TASK-P4-02`** | Upstash Sliding Window Rate Limiter | `security-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Sliding window rate limiter: trips at 60 req/min general and 10 req/min AI ... |
| **`TASK-P4-03`** | Idempotency Key Interceptor | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Submission idempotency: repeated request within 24h short-circuits LLM call... |
| **`TASK-P5-01`** | Candidate Profile API (/api/onboarding/profile) | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck && npm run lint` | POST /api/onboarding/profile validates payload via Zod, saves to Neon DB, r... |
| **`TASK-P5-02`** | Resume PDF Parser & 1536-dim Embedding Pipeline | `ai-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Resume PDF parser chunks text into 500-word segments and inserts 1536-dim v... |
| **`TASK-P5-03`** | Personalized Prep Roadmap Synthesis API | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | POST /api/plan/generate synthesizes personalized multi-week syllabus matchi... |
| **`TASK-P6-01`** | Practice Session Submit & Evaluate API | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | POST /api/practice/session/submit generates EvaluationReport, updates Candi... |
| **`TASK-P6-02`** | Mock Interview Session End & Grading API | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | POST /api/mock-interview/session/end ingests multi-turn transcript, compute... |
| **`TASK-P6-03`** | Evaluation Report Retrieval API | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | GET /api/evaluation/[reportId] returns tenant-scoped report; strictly retur... |
| **`TASK-P6-04`** | Revision Queue Synchronization API | `backend-developer` | ✅ Yes | ✅ Yes | `npm run typecheck` | GET /api/revision/items returns overdue items (nextReviewDate <= NOW()); PO... |
| **`TASK-P7-01`** | Deepgram Nova-2 Streaming STT Bridge | `voice-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Deepgram Nova-2 streaming STT bridge outputs interim and final transcripts ... |
| **`TASK-P7-02`** | Cartesia Sonic Streaming TTS Bridge | `voice-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Cartesia Sonic streaming TTS bridge outputs PCM audio chunks with <50ms fir... |
| **`TASK-P7-03`** | Voice Turn-Taking & Barge-In Controller | `voice-engineer` | ✅ Yes | ✅ Yes | `npm run typecheck` | Voice turn-taking controller cuts AI speech output within 100ms upon candid... |
| **`TASK-P8-01`** | Wire Onboarding & Preparation Plan Screens | `frontend-developer` | ✅ Yes | ✅ Yes | `npm run lint && npm run typecheck` | Wire /onboarding/* and /preparation-plan: form submission hydrates live pro... |
| **`TASK-P8-02`** | Wire Practice, Whiteboard & Coding Workspaces | `frontend-developer` | ✅ Yes | ✅ Yes | `npm run lint && npm run typecheck` | Wire /practice/*: submit confirmation modal triggers /api/practice/session/... |
| **`TASK-P8-03`** | Wire Evaluation & Revision Hubs | `frontend-developer` | ✅ Yes | ✅ Yes | `npm run lint && npm run typecheck` | Wire /evaluation and /revision: dynamic gauges render live score; recall dr... |
| **`TASK-P8-04`** | Full Platform End-to-End Verification | `qa-engineer` | ✅ Yes | ✅ Yes | `npm run lint && npm run typecheck` | Full production build verification: npm run build passes with 0 errors acro... |

---

## 🗂️ Task Breakdown by Phase

### Phase 1: Persistence Foundation (Neon PostgreSQL & pgvector)

- [x] **`TASK-P1-01`**: **Database Schema Design (`prisma/schema.prisma`)**
  - **Column**: `Done`
  - **Domain**: Persistence & Storage
  - **Scope**: Author the full production schema in `prisma/schema.prisma` with Neon dual connection (`DATABASE_URL`, `DIRECT_URL`), `pgvector(1536)` extension, and 15 relational models.
  - **Deliverable**: `prisma/schema.prisma`
  - **Clearance**: Passes `npx prisma validate` with zero errors.

- [x] **`TASK-P1-02`**: **Dual Connection Configuration & Prisma Adapters**
  - **Column**: `Done`
  - **Domain**: Infrastructure
  - **Scope**: Configure Neon pooled connection (`DATABASE_URL`) with `@prisma/adapter-neon` HTTP queryable and direct connection (`DIRECT_URL`).
  - **Deliverable**: `src/server/db/client.ts`
  - **Clearance**: Database connection smoke test returns live timestamp from Neon.

- [x] **`TASK-P1-03`**: **Database Migration Push to Neon PostgreSQL**
  - **Column**: `Done`
  - **Domain**: Database Operations
  - **Scope**: Execute `npx prisma db push` to synchronize 15 tables and vector extension with live Neon cloud instance.
  - **Deliverable**: Live tables in Neon schema `public`.
  - **Clearance**: Verified 15 tables and `vector` extension in Neon `public` schema.

- [x] **`TASK-P1-04`**: **Curriculum Catalog Seeding (`prisma/seed.ts`)**
  - **Column**: `Done`
  - **Domain**: Catalog Content
  - **Scope**: Seed 135 topics across System Design (40), Algorithms (50), Behavioral (20), and Cloud (25).
  - **Deliverable**: `prisma/seed.ts`
  - **Clearance**: `npx prisma db seed` inserted 135 records without constraint errors.

---

### Phase 2: Server Infrastructure Clients

- [x] **`TASK-P2-01`**: **Prisma Client Singleton with Tenant Isolation**
  - **Column**: `Done`
  - **Scope**: Build `withCandidateContext(clerkUserId)` helper ensuring all queries are tenant-scoped.
  - **Deliverable**: `src/server/db/client.ts`

- [x] **`TASK-P2-02`**: **Upstash Redis Client Singleton**
  - **Column**: `Done`
  - **Scope**: Centralized REST client with automatic retry and rate-limiting wrapper.
  - **Deliverable**: `src/server/redis/client.ts`

- [x] **`TASK-P2-03`**: **Cloudflare R2 Object Storage S3 Client**
  - **Column**: `Done`
  - **Scope**: Presigned URL generator and multipart upload handler for whiteboard PNGs and audio.
  - **Deliverable**: `src/server/storage/r2.ts`

- [x] **`TASK-P2-04`**: **Google Gemini SDK Singleton**
  - **Column**: `Done`
  - **Scope**: Client wrapper for `gemini-3.1-flash-lite` and `gemini-embedding-001`.
  - **Deliverable**: `src/server/ai/gemini.ts`

---

### Phase 3: Deterministic Domain Core

- [x] **`TASK-P3-01`**: **5-Dimension Rubric Scoring Engine**
  - **Column**: `Done`
  - **Scope**: Mathematical calculation of 0–100 overall score using weighted harmonic mean.
  - **Deliverable**: `src/server/domain/scoring.ts`

- [x] **`TASK-P3-02`**: **Bayesian Candidate Readiness Engine**
  - **Column**: `Done`
  - **Scope**: Prior readiness score updated via Bayesian evidence weighting per completed session.
  - **Deliverable**: `src/server/domain/readiness.ts`

- [x] **`TASK-P3-03`**: **SuperMemo-2 Spaced Repetition Engine**
  - **Column**: `Done`
  - **Scope**: Calculates next review intervals and ease factor decay based on candidate grade.
  - **Deliverable**: `src/server/domain/spaced-repetition.ts`

---

### Phase 4: Edge Security & Middleware

- [x] **`TASK-P4-01`**: **Clerk Edge Authentication Route Guard**
  - **Column**: `Done`
  - **Deliverable**: `src/middleware.ts`

- [x] **`TASK-P4-02`**: **Upstash Sliding Window Rate Limiter**
  - **Column**: `Done`
  - **Deliverable**: `src/server/edge/rate-limiter.ts`

- [x] **`TASK-P4-03`**: **Idempotency Key Interceptor**
  - **Column**: `Done`
  - **Deliverable**: `src/server/edge/idempotency.ts`

---

### Phase 5: Onboarding & Vector Pipeline

- [x] **`TASK-P5-01`**: **Candidate Profile API (`/api/onboarding/profile`)**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/onboarding/profile/route.ts`

- [x] **`TASK-P5-02`**: **Resume PDF Parser & 1536-dim Embedding Pipeline**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/onboarding/resume/route.ts`

- [x] **`TASK-P5-03`**: **Personalized Prep Roadmap Synthesis API**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/plan/generate/route.ts`

---

### Phase 6: Session & Evaluation APIs

- [x] **`TASK-P6-01`**: **Practice Session Submit & Evaluate API**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/practice/session/submit/route.ts`

- [x] **`TASK-P6-02`**: **Mock Interview Session End & Grading API**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/mock-interview/session/end/route.ts`

- [x] **`TASK-P6-03`**: **Evaluation Report Retrieval API**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/evaluation/[reportId]/route.ts`

- [x] **`TASK-P6-04`**: **Revision Queue Synchronization API**
  - **Column**: `Done`
  - **Deliverable**: `src/app/api/revision/items/route.ts`

---

### Phase 7: Real-Time Voice Gateway

- [ ] **`TASK-P7-01`**: **Deepgram Nova-2 Streaming STT Bridge**
  - **Column**: `Backlog`
  - **Deliverable**: `src/server/voice/stt.ts`

- [ ] **`TASK-P7-02`**: **Cartesia Sonic Streaming TTS Bridge**
  - **Column**: `Backlog`
  - **Deliverable**: `src/server/voice/tts.ts`

- [ ] **`TASK-P7-03`**: **Voice Turn-Taking & Sub-100ms Barge-In Controller**
  - **Column**: `Backlog`
  - **Deliverable**: `src/server/voice/gateway.ts`

---

### Phase 8: Frontend-Backend Integration

- [ ] **`TASK-P8-01`**: **Wire Onboarding & Preparation Plan Screens**
  - **Column**: `Backlog`
  - **Scope**: Connect `/onboarding/*` and `/preparation-plan` to live APIs.

- [ ] **`TASK-P8-02`**: **Wire Practice, Whiteboard & Coding Workspaces**
  - **Column**: `Backlog`
  - **Scope**: Connect `/practice/*` and interactive canvas to live submission endpoints.

- [ ] **`TASK-P8-03`**: **Wire Evaluation & Revision Hubs**
  - **Column**: `Backlog`
  - **Scope**: Connect `/evaluation` and `/revision` to live report and queue endpoints.

- [ ] **`TASK-P8-04`**: **Full Platform End-to-End Verification**
  - **Column**: `Backlog`
  - **Scope**: Verify all 43 routes, run end-to-end smoke test, ensure 0 Turbopack errors.
