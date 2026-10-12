#!/usr/bin/env bash
# Hermes Kanban Auto-Populate Script for PrepInMinutes
# Usage: ./hermes/populate-kanban.sh [--board <slug>]

BOARD="${1:-prepinminutes}"

echo "🚀 Synchronizing Hermes Kanban Board: ${BOARD}..."

# TASK-P1-01 (database-architect)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P1-01: Database Schema Design (prisma/schema.prisma)" \
    --body "Phase: phase-1 | Priority: HIGH | Role: database-architect\n\nScope:\nAuthor the full production schema in prisma/schema.prisma with Neon dual connection (DATABASE_URL, DIRECT_URL), pgvector(1536) extension, and 15 relational models covering: (1) User, CandidateProfile, PreparationPlan, (2) Knowledge Graph: CurriculumDomain, CurriculumCategory, CurriculumTopic, CurriculumQuestion, TopicEmbedding, (3) Candidate Understanding: CandidateTopicMastery (cognitive stages, SM-2 decay timestamps, rubric running averages), and (4) Multimodal Sessions: PracticeSession, MockInterviewSession, EvaluationReport, RubricScore, RevisionItem, DocumentEmbedding.\n\nDeliverables: prisma/schema.prisma\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: Not Required\n- Integration Tests: Not Required\n- Static Validation: npx prisma validate\n- Feature Validation: Schema audit against docs/architecture/layers/06-persistence-storage-layer.md (15 models + pgvector)\n\nCommands: npx prisma validate" \
    --assignee "database-architect" || true
fi

# TASK-P1-02 (infrastructure-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P1-02: Dual Connection Configuration & Prisma Adapters" \
    --body "Phase: phase-1 | Priority: HIGH | Role: infrastructure-engineer\n\nScope:\nConfigure Neon pooled connection (DATABASE_URL) with @prisma/adapter-neon and direct connection (DIRECT_URL) for advisory lock migration safety.\n\nDeliverables: src/server/db/client.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: Not Required\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Neon pooled vs direct compute connection switching verified via live timestamp query\n\nCommands: npm run typecheck && npx tsx scripts/verify-infra.ts" \
    --assignee "infrastructure-engineer" || true
fi

# TASK-P1-03 (database-architect)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P1-03: Database Migration Push to Neon PostgreSQL" \
    --body "Phase: phase-1 | Priority: HIGH | Role: database-architect\n\nScope:\nExecute `npx prisma db push` to synchronize 10 tables and vector extension with live Neon cloud instance.\n\nDeliverables: Neon schema public tables\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: Not Required\n- Integration Tests: REQUIRED\n- Static Validation: PostgreSQL pgvector extension loaded in catalog\n- Feature Validation: Neon public schema table verification (15 tables present)\n\nCommands: npx prisma db push" \
    --assignee "database-architect" || true
fi

# TASK-P1-04 (content-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P1-04: Curriculum Catalog Seeding (prisma/seed.ts)" \
    --body "Phase: phase-1 | Priority: MEDIUM | Role: content-engineer\n\nScope:\nSeed 135+ topics across System Design (40+), Algorithms (50+), Behavioral (20+), and Cloud (25+).\n\nDeliverables: prisma/seed.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: Not Required\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Seed script populates >135 topics across 4 domains without foreign key constraint errors\n\nCommands: npm run typecheck && npx prisma db seed" \
    --assignee "content-engineer" || true
fi

# TASK-P2-01 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P2-01: Prisma Client Singleton with Tenant Isolation" \
    --body "Phase: phase-2 | Priority: HIGH | Role: backend-developer\n\nScope:\nBuild withCandidateContext(clerkUserId) helper ensuring all queries are tenant-scoped.\n\nDeliverables: src/server/db/client.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck && npm run lint\n- Feature Validation: Tenant isolation wrapper: Tenant A queries strictly blocked from Tenant B data\n\nCommands: npm test tests/unit/db-tenant.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P2-02 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P2-02: Upstash Redis Client Singleton" \
    --body "Phase: phase-2 | Priority: HIGH | Role: backend-developer\n\nScope:\nCentralized REST client with automatic retry and rate-limiting wrapper.\n\nDeliverables: src/server/redis/client.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Upstash Redis REST ping roundtrip <50ms with automatic retry logic\n\nCommands: npm test tests/unit/redis.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P2-03 (storage-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P2-03: Cloudflare R2 Object Storage S3 Client" \
    --body "Phase: phase-2 | Priority: MEDIUM | Role: storage-engineer\n\nScope:\nPresigned URL generator and multipart upload handler for whiteboard PNGs and audio.\n\nDeliverables: src/server/storage/r2.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Presigned PUT URL generated for Cloudflare R2; test 1-byte buffer uploaded and verified\n\nCommands: npm test tests/unit/r2-storage.test.ts" \
    --assignee "storage-engineer" || true
fi

# TASK-P2-04 (ai-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P2-04: Google Gemini SDK Singleton" \
    --body "Phase: phase-2 | Priority: HIGH | Role: ai-engineer\n\nScope:\nClient wrapper for gemini-2.0-flash / gemini-3.1-flash-lite and text-embedding-004.\n\nDeliverables: src/server/ai/gemini.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Google Gemini 2.0 Flash returns structured JSON conforming to schema without markdown backticks\n\nCommands: npm test tests/unit/gemini.test.ts" \
    --assignee "ai-engineer" || true
fi

# TASK-P3-01 (math-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P3-01: 5-Dimension Rubric Scoring Engine" \
    --body "Phase: phase-3 | Priority: HIGH | Role: math-engineer\n\nScope:\nPure mathematical calculation of 0–100 overall score using weighted harmonic mean.\n\nDeliverables: src/server/domain/scoring.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: Not Required\n- Static Validation: npm run typecheck\n- Feature Validation: 100% boundary assertions for 5-dimension rubric scoring; harmonic mean and verdict boundaries verified\n\nCommands: npm test tests/unit/scoring.test.ts" \
    --assignee "math-engineer" || true
fi

# TASK-P3-02 (math-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P3-02: Bayesian Candidate Readiness Engine" \
    --body "Phase: phase-3 | Priority: HIGH | Role: math-engineer\n\nScope:\nPrior readiness score updated via Bayesian evidence weighting per completed session.\n\nDeliverables: src/server/domain/readiness.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: Not Required\n- Static Validation: npm run typecheck\n- Feature Validation: Bayesian readiness momentum: cold-start alpha (0.40) vs converged alpha (0.15) verified over 20 iterations\n\nCommands: npm test tests/unit/readiness.test.ts" \
    --assignee "math-engineer" || true
fi

# TASK-P3-03 (math-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P3-03: SuperMemo-2 Spaced Repetition Engine" \
    --body "Phase: phase-3 | Priority: HIGH | Role: math-engineer\n\nScope:\nCalculates next review intervals and ease factor decay based on candidate grade.\n\nDeliverables: src/server/domain/spaced-repetition.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: Not Required\n- Static Validation: npm run typecheck\n- Feature Validation: SuperMemo-2 interval decay: EF floor (1.30) and future UTC nextReviewDate timestamps verified\n\nCommands: npm test tests/unit/spaced-repetition.test.ts" \
    --assignee "math-engineer" || true
fi

# TASK-P4-01 (security-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P4-01: Clerk Edge Authentication Route Guard" \
    --body "Phase: phase-4 | Priority: HIGH | Role: security-engineer\n\nScope:\nSub-10ms edge middleware enforcing authentication on private routes.\n\nDeliverables: src/middleware.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Edge middleware route guard: public routes bypass, protected routes enforce Clerk token in <10ms\n\nCommands: npm test tests/unit/middleware-auth.test.ts" \
    --assignee "security-engineer" || true
fi

# TASK-P4-02 (security-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P4-02: Upstash Sliding Window Rate Limiter" \
    --body "Phase: phase-4 | Priority: HIGH | Role: security-engineer\n\nScope:\nSliding window rate limits: 60 req/min general, 10 req/min heavy LLM endpoints.\n\nDeliverables: src/server/edge/rate-limiter.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Sliding window rate limiter: trips at 60 req/min general and 10 req/min AI endpoints with Retry-After header\n\nCommands: npm test tests/unit/rate-limiter.test.ts" \
    --assignee "security-engineer" || true
fi

# TASK-P4-03 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P4-03: Idempotency Key Interceptor" \
    --body "Phase: phase-4 | Priority: MEDIUM | Role: backend-developer\n\nScope:\nPrevent duplicate LLM calls on double clicks using Redis key idempotency:{sessionId}:{attempt} with 24h TTL.\n\nDeliverables: src/server/edge/idempotency.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Submission idempotency: repeated request within 24h short-circuits LLM call in <10ms\n\nCommands: npm test tests/unit/idempotency.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P5-01 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P5-01: Candidate Profile API (/api/onboarding/profile)" \
    --body "Phase: phase-5 | Priority: HIGH | Role: backend-developer\n\nScope:\nSave target role, seniority level, target companies, and weekly goal hours.\n\nDeliverables: src/app/api/onboarding/profile/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck && npm run lint\n- Feature Validation: POST /api/onboarding/profile validates payload via Zod, saves to Neon DB, returns 201 Created\n\nCommands: npm test tests/integration/api-profile.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P5-02 (ai-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P5-02: Resume PDF Parser & 1536-dim Embedding Pipeline" \
    --body "Phase: phase-5 | Priority: HIGH | Role: ai-engineer\n\nScope:\nParse resume PDF, chunk text into 500-word segments, compute 1536-dim embeddings via Gemini, and insert into DocumentEmbedding.\n\nDeliverables: src/app/api/onboarding/resume/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Resume PDF parser chunks text into 500-word segments and inserts 1536-dim vector into pgvector\n\nCommands: npm test tests/integration/api-resume-embedding.test.ts" \
    --assignee "ai-engineer" || true
fi

# TASK-P5-03 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P5-03: Personalized Prep Roadmap Synthesis API" \
    --body "Phase: phase-5 | Priority: HIGH | Role: backend-developer\n\nScope:\nSynthesize adaptive multi-week syllabus mapped to target timeline and weak areas.\n\nDeliverables: src/app/api/plan/generate/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: POST /api/plan/generate synthesizes personalized multi-week syllabus matching domain weighting rules\n\nCommands: npm test tests/integration/api-plan-generate.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P6-01 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P6-01: Practice Session Submit & Evaluate API" \
    --body "Phase: phase-6 | Priority: HIGH | Role: backend-developer\n\nScope:\nEvaluate code or whiteboard submission, generate structured EvaluationReport, save RubricScores, and update candidate readiness.\n\nDeliverables: src/app/api/practice/session/submit/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: POST /api/practice/session/submit generates EvaluationReport, updates CandidateTopicMastery, returns readinessDelta\n\nCommands: npm test tests/integration/api-practice-submit.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P6-02 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P6-02: Mock Interview Session End & Grading API" \
    --body "Phase: phase-6 | Priority: HIGH | Role: backend-developer\n\nScope:\nIngest full conversational transcript, score 5 dimensions, and produce overall interview report.\n\nDeliverables: src/app/api/mock-interview/session/end/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: POST /api/mock-interview/session/end ingests multi-turn transcript, computes 6 rubric scores, outputs hiring verdict\n\nCommands: npm test tests/integration/api-mock-end.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P6-03 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P6-03: Evaluation Report Retrieval API" \
    --body "Phase: phase-6 | Priority: MEDIUM | Role: backend-developer\n\nScope:\nFetch candidate-scoped evaluation report with rubric breakdowns.\n\nDeliverables: src/app/api/evaluation/[reportId]/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: GET /api/evaluation/[reportId] returns tenant-scoped report; strictly returns 403 Forbidden for unauthorized user\n\nCommands: npm test tests/integration/api-evaluation-report.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P6-04 (backend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P6-04: Revision Queue Synchronization API" \
    --body "Phase: phase-6 | Priority: MEDIUM | Role: backend-developer\n\nScope:\nFetch overdue revision topics (nextReviewDate <= NOW()) and update candidate review history.\n\nDeliverables: src/app/api/revision/items/route.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: GET /api/revision/items returns overdue items (nextReviewDate <= NOW()); POST recalculates intervals\n\nCommands: npm test tests/integration/api-revision-sync.test.ts" \
    --assignee "backend-developer" || true
fi

# TASK-P7-01 (voice-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P7-01: Deepgram Nova-2 Streaming STT Bridge" \
    --body "Phase: phase-7 | Priority: HIGH | Role: voice-engineer\n\nScope:\nBidirectional streaming microphone audio transcription with Nova-2 model (<80ms latency).\n\nDeliverables: src/server/voice/stt.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Deepgram Nova-2 streaming STT bridge outputs interim and final transcripts with <80ms latency\n\nCommands: npm test tests/integration/voice-stt.test.ts" \
    --assignee "voice-engineer" || true
fi

# TASK-P7-02 (voice-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P7-02: Cartesia Sonic Streaming TTS Bridge" \
    --body "Phase: phase-7 | Priority: HIGH | Role: voice-engineer\n\nScope:\nUltra-low-latency voice synthesis with Sonic model (<50ms TTFB).\n\nDeliverables: src/server/voice/tts.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Cartesia Sonic streaming TTS bridge outputs PCM audio chunks with <50ms first-byte latency\n\nCommands: npm test tests/integration/voice-tts.test.ts" \
    --assignee "voice-engineer" || true
fi

# TASK-P7-03 (voice-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P7-03: Voice Turn-Taking & Barge-In Controller" \
    --body "Phase: phase-7 | Priority: HIGH | Role: voice-engineer\n\nScope:\nCut AI speech output within 100ms when candidate starts speaking (Voice Activity Detection barge-in).\n\nDeliverables: src/server/voice/gateway.ts\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run typecheck\n- Feature Validation: Voice turn-taking controller cuts AI speech output within 100ms upon candidate speech detection (VAD barge-in)\n\nCommands: npm test tests/integration/voice-bargein.test.ts" \
    --assignee "voice-engineer" || true
fi

# TASK-P8-01 (frontend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P8-01: Wire Onboarding & Preparation Plan Screens" \
    --body "Phase: phase-8 | Priority: HIGH | Role: frontend-developer\n\nScope:\nConnect /onboarding/* and /preparation-plan to live backend APIs.\n\nDeliverables: src/app/dashboard/*, src/app/preparation-plan/*\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run lint && npm run typecheck\n- Feature Validation: Wire /onboarding/* and /preparation-plan: form submission hydrates live profile and loads synthesized plan\n\nCommands: npm test tests/e2e/onboarding-flow.test.ts" \
    --assignee "frontend-developer" || true
fi

# TASK-P8-02 (frontend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P8-02: Wire Practice, Whiteboard & Coding Workspaces" \
    --body "Phase: phase-8 | Priority: HIGH | Role: frontend-developer\n\nScope:\nConnect /practice/* and interactive canvas components to live submission endpoints.\n\nDeliverables: src/app/practice/*\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run lint && npm run typecheck\n- Feature Validation: Wire /practice/*: submit confirmation modal triggers /api/practice/session/submit and redirects to evaluation report\n\nCommands: npm test tests/e2e/practice-flow.test.ts" \
    --assignee "frontend-developer" || true
fi

# TASK-P8-03 (frontend-developer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P8-03: Wire Evaluation & Revision Hubs" \
    --body "Phase: phase-8 | Priority: HIGH | Role: frontend-developer\n\nScope:\nConnect /evaluation and /revision to live report and queue APIs.\n\nDeliverables: src/app/evaluation/*, src/app/revision/*\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run lint && npm run typecheck\n- Feature Validation: Wire /evaluation and /revision: dynamic gauges render live score; recall drill modal updates spaced intervals\n\nCommands: npm test tests/e2e/evaluation-revision.test.ts" \
    --assignee "frontend-developer" || true
fi

# TASK-P8-04 (qa-engineer)
if command -v hermes &> /dev/null; then
  hermes kanban --board "${BOARD}" create "TASK-P8-04: Full Platform End-to-End Verification" \
    --body "Phase: phase-8 | Priority: HIGH | Role: qa-engineer\n\nScope:\nCompile 100% clean Turbopack build across all 43 static routes with zero errors and verify automated smoke tests.\n\nDeliverables: Test report, Production build bundle\n\nREQUIRED VERIFICATION PIPELINE:\n- Unit Tests: REQUIRED\n- Integration Tests: REQUIRED\n- Static Validation: npm run lint && npm run typecheck\n- Feature Validation: Full production build verification: npm run build passes with 0 errors across all 43 static routes; all smoke tests 100% green\n\nCommands: npm run lint && npm run typecheck && npm test && npm run build" \
    --assignee "qa-engineer" || true
fi

echo "✅ Tasks synchronized in Hermes Kanban board ${BOARD}."
