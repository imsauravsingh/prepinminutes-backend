# PrepInMinutes — Database Architecture & Candidate Progress Tracking Specification
## Relational State Modeling, Polyglot Parity & Progress Tracking Engine

> **Document Version:** 1.0.0  
> **Target Database Engines:** PostgreSQL 16+ (Local `localhost:5432` & Neon Cloud) with `pgvector` & Prisma ORM  
> **Graph Counterpart:** Neo4j AuraDB (Cypher 5.x) — 10 Domains | 122 Categories | 371 Topics | 7,420 Questions  
> **Status:** 🟢 **CANONICAL ARCHITECTURAL SPECIFICATION**  
> **Governing Standards:** [`docs/GENERIC_KNOWLEDGE_GRAPH_SCHEMA_SPEC.md`](./GENERIC_KNOWLEDGE_GRAPH_SCHEMA_SPEC.md), [`docs/CROSS_CUTTING_INTELLIGENCE_SPEC.md`](./CROSS_CUTTING_INTELLIGENCE_SPEC.md), [`docs/TASK_EXECUTION_SEQUENCE.md`](./TASK_EXECUTION_SEQUENCE.md)

---

## 1. Executive Summary & The Polyglot Architecture

PrepInMinutes operates on a **strictly bifurcated polyglot database architecture**:

1. **The Graph Engine (Neo4j AuraDB)**:
   - Stores the immutable technical curriculum knowledge: 10 Domains, 122 Categories, 371 Topics, 7,420 Master Questions, 9 Archetypes, Prerequisite DAGs (`[:PREREQUISITE_OF]`), Roles (`:Role`), Companies (`:Company`), and Stages (`:InterviewStage`).
   - Optimized for sub-10ms graph traversals, topological sorting, dependency closure, and cross-cutting roadmap queries.
   - **Zero Candidate PII or private user state** is stored in Neo4j.

2. **The Relational Engine (PostgreSQL / Prisma)**:
   - Stores all private, stateful candidate data: User accounts, authentication credentials, candidate profiles, subscriptions, preparation plans, daily tasks, practice session submissions, evaluation reports, rubric scores, spaced repetition decay schedules, and admin audit logs.
   - Optimized for ACID transactional integrity, relational foreign keys, row-level tenant security, and high-concurrency writes.

```mermaid
flowchart TD
  subgraph GRAPH_LAYER["Neo4j AuraDB (Curriculum Graph & Taxonomy)"]
    D["(:Domain) [10 Domains]"]
    C["(:Category) [122 Categories]"]
    T["(:Topic) [371 Topics]"]
    Q["(:Question) [7,420 Questions]"]
    D --> C --> T --> Q
    T -.->|"[:PREREQUISITE_OF]"| T
  end

  subgraph RELATIONAL_LAYER["PostgreSQL (Localhost & Neon Cloud)"]
    subgraph CURRICULUM_MIRROR["1. Relational Curriculum Spine (1:1 Slugs)"]
      RD["curriculum_domains (10)"]
      RC["curriculum_categories (122)"]
      RT["curriculum_topics (371)"]
      RD --> RC --> RT
    end

    subgraph PROGRESS_ENGINE["2. Candidate Progress Tracking Engine"]
      U["users (Auth, RBAC, Blocking)"]
      CP["candidate_profiles (Readiness, Streaks)"]
      PLAN["preparation_plans (Roadmap Milestones)"]
      TASK["daily_plan_tasks (Daily Checklist)"]
      MASTERY["candidate_topic_masteries (Cognitive Stage, Mastery %)"]
      PROF["candidate_topic_proficiency (Skill Gaps)"]
      PRACTICE["practice_sessions (Code, Whiteboard)"]
      EVAL["evaluation_reports (Scores, Sarah Rubrics)"]
      REV["revision_items (SuperMemo SM-2 Decay)"]
    end
  end

  T ===|"Foreign Key Sync (slug)"| RT
  RT -->|"FK topic_id"| MASTERY
  RT -->|"FK topic_id"| TASK
  RT -->|"FK topic_id"| PRACTICE
  RT -->|"FK topic_id"| REV
  U --> CP --> PLAN --> TASK
  CP --> MASTERY
  CP --> PROF
  TASK --> PRACTICE --> EVAL --> MASTERY
  EVAL -->|"If score < 60%"| REV
```

### The Fundamental Gap Identified:
Prior to this specification, **PostgreSQL only contained 4 legacy domains and 135 topics**, while Neo4j had all **10 domains and 371 topics**. 

If a candidate practiced a topic from AI System Design, Low-Level Design, Backend Engineering, Frontend Architecture, Data Engineering, or Mobile Engineering, **relational progress tracking failed** because foreign key references (`topic_id`) in `candidate_topic_masteries`, `daily_plan_tasks`, and `practice_sessions` could not resolve.

This document establishes the relational data schema, candidate progress tracking engines, admin governance, and the local-to-production synchronization protocol.

---

## 2. Priority Ladder & Execution Roadmap

To ensure zero downtime, deterministic database migrations, and clean environment parity, all database tasks are organized into **three strict priority levels**:

```mermaid
graph TD
  P0["P0: Blocking Data Foundations<br/>(Catalog Sync, Prisma Schema Update, Local DB Migration)"]
  P1["P1: Core Tracking & API Wiring<br/>(Mastery Updates, Daily Task Engine, SM-2 Decay Sync)"]
  P2["P2: Cloud Parity & Admin Governance<br/>(Neon Cloud DB Parity Sync, Intelligence Maintenance Worker)"]

  P0 --> P1 --> P2
```

| Priority | Code | Task Name | Description & Target | Status |
| :---: | :---: | :--- | :--- | :---: |
| **P0** | **`DATA-P0-01`** | **Prisma Schema Update** | Add `candidate_topic_proficiency`, `intelligence_refresh_*` tables, and align relations in `prisma/schema.prisma`. | ⚪ Ready |
| **P0** | **`DATA-P0-02`** | **Local Database Schema Migration** | Push schema to `localhost:5432` using Prisma and verify table creation with 0 errors. | ⚪ Ready |
| **P0** | **`DATA-P0-03`** | **10-Domain Curriculum Sync** | Seed all 10 domains, 122 categories, and 371 topics into PostgreSQL `curriculum_*` tables matching Neo4j. | ⚪ Ready |
| **P1** | **`DATA-P1-01`** | **Candidate Topic Mastery Engine** | Implement atomic progress update logic: evaluation completion $\to$ `CandidateTopicMastery` recalculation. | ⚪ Pending |
| **P1** | **`DATA-P1-02`** | **Daily Task Scheduling & Streak Engine** | Wire `DailyPlanTask` completion tracking and daily candidate activity streak increments. | ⚪ Pending |
| **P1** | **`DATA-P1-03`** | **Spaced Repetition Decay Pipeline** | Wire automatic insertion into `RevisionItem` when session score $< 60\%$ or retention band degrades. | ⚪ Pending |
| **P2** | **`DATA-P2-01`** | **Neon Cloud DB Parity Sync (Gated)** | Reset and push identical schema/seeds to remote Neon Cloud database upon user confirmation. | ⚪ Gated |
| **P2** | **`DATA-P2-02`** | **Data Maintenance Batch Engine** | Implement the 3-table company intelligence refresh worker with round-robin state cursor. | ⚪ Pending |
| **P2** | **`DATA-P2-03`** | **Admin Governance & Audit Log API** | Implement admin endpoints for staff role approvals, user blocking, and subscription quota resets. | ⚪ Pending |

---

## 3. Pillar 1: Relational Curriculum Catalog Parity (10 Domains & 371 Topics)

PostgreSQL mirrors the canonical curriculum hierarchy to provide referential integrity for candidate progress tracking:

```prisma
model CurriculumDomain {
  id          String               @id @default(cuid())
  slug        String               @unique(map: "uq_curriculum_domains_slug")
  name        String
  description String
  categories  CurriculumCategory[]
  topics      CurriculumTopic[]
  createdAt   DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("curriculum_domains")
}

model CurriculumCategory {
  id          String           @id @default(cuid())
  domainId    String           @map("domain_id")
  domain      CurriculumDomain @relation(fields: [domainId], references: [id], onDelete: Cascade, map: "fk_curriculum_categories_domain_id")
  slug        String
  name        String
  description String
  order       Int              @default(0)
  topics      CurriculumTopic[]

  @@unique([domainId, slug], map: "uq_curriculum_categories_domain_id_slug")
  @@map("curriculum_categories")
}

model CurriculumTopic {
  id           String             @id @default(cuid())
  domainId     String             @map("domain_id")
  domain       CurriculumDomain   @relation(fields: [domainId], references: [id], onDelete: Cascade, map: "fk_curriculum_topics_domain_id")
  categoryId   String             @map("category_id")
  category     CurriculumCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade, map: "fk_curriculum_topics_category_id")
  slug         String             @unique(map: "uq_curriculum_topics_slug")
  topicId      String             @map("topic_id") // Canonical ID: e.g. "FND001", "MOB15", "DSA01"
  title        String
  description  String
  durationMin  Int                @default(15) @map("duration_min")
  difficulty   String             // "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
  priority     String             @default("P0") // "P0" | "P1" | "P2"
  rubricAtoms  String[]           @map("rubric_atoms")
  practiceHref String             @map("practice_href")
  iconName     String?            @map("icon_name")

  masteries        CandidateTopicMastery[]
  proficiencies    CandidateTopicProficiency[]
  questions        CurriculumQuestion[]
  embeddings       TopicEmbedding[]
  revisionItems    RevisionItem[]
  practiceSessions PracticeSession[]
  dailyTasks       DailyPlanTask[]

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([domainId, difficulty], map: "idx_curriculum_topics_domain_id_difficulty")
  @@index([topicId], map: "idx_curriculum_topics_topic_id")
  @@map("curriculum_topics")
}
```

### The 10 Canonical Slugs in PostgreSQL:
1. `system-design` (System Design & Distributed Systems)
2. `ai-system-design` (AI System Design & GenAI Infra)
3. `low-level-design` (Low-Level Design & Machine Coding)
4. `dsa` (Data Structures & Algorithms)
5. `backend-engineering` (Backend & Runtime Engineering)
6. `frontend-engineering` (Frontend & Web Architecture)
7. `cloud-devops` (Cloud, DevOps & SRE)
8. `behavioral-leadership` (Behavioral, Leadership & Management)
9. `data-engineering` (Data Engineering & Big Data Systems)
10. `mobile-engineering` (Mobile Engineering: iOS, Android, Cross-Platform)

---

## 4. Pillar 2: The 5 Candidate Progress Tracking Loops

### Loop 1: Candidate Profile & Global Readiness
- **Model**: `CandidateProfile`
- **Purpose**: High-level telemetry shown on candidate dashboard (`/dashboard`).
- **Key Attributes**:
  - `readinessScore` ($0\text{–}100\%$): Weighted readiness gauge.
  - `weeklyGoalHours` & `completedHours`: Progress bar against weekly study budget.
  - `streakDays`: Daily consecutive practice activity counter.
  - `resumeFileName`, `resumeFileUrl`, `jobDescriptionText`: Used for vector RAG retrieval during AI interview sessions.

### Loop 2: Personalized Preparation Plan & Daily Checklist
- **Models**: `PreparationPlan` and `DailyPlanTask`
- **Purpose**: Step-by-step roadmap displayed in `/preparation-plan` and dashboard daily cards.
- **Key Attributes**:
  - `PreparationPlan.weeklyMilestones` (JSON): Ordered weekly phases containing scheduled topic slugs.
  - `PreparationPlan.domainWeights` (JSON): e.g. `{"system-design": 0.40, "dsa": 0.35, "behavioral": 0.15, "cloud-devops": 0.10}`.
  - `DailyPlanTask`: Explicit scheduled tasks for each day (`scheduledDate`, `durationMin`, `isCompleted`, `completedAt`).

### Loop 3: Granular Topic Mastery & Cognitive Depth
- **Model**: `CandidateTopicMastery`
- **Purpose**: Tracks deep skill level across each of the 371 topics.
- **Key Attributes**:
  - `masteryScore` ($0.0\text{–}100.0\%$): Running mastery percentage.
  - `status`: `NOT_STARTED` $\to$ `NEEDS_PRACTICE` $\to$ `PRACTICED` $\to$ `MASTERED`.
  - `cognitiveStage`: `RECALL` $\to$ `APPLICATION` $\to$ `TRADEOFFS` $\to$ `EXPERT` (Bloom's taxonomy).
  - `totalAttempts` & `lastPracticedAt`: Recency and repetition counter.
  - **4-Dimension Running Averages**:
    - `avgTechnicalDepth` ($1.0\text{–}10.0$)
    - `avgTradeoffs` ($1.0\text{–}10.0$)
    - `avgDataModeling` ($1.0\text{–}10.0$)
    - `avgScalability` ($1.0\text{–}10.0$)

### Loop 4: Practice & Mock Interview Submissions with AI Evaluation
- **Models**: `PracticeSession`, `MockInterviewSession`, `EvaluationReport`, `RubricScore`
- **Purpose**: Captures every interactive interview attempt and Sarah's rubric evaluation.
- **Key Attributes**:
  - `whiteboardUrl` & `diagramJson`: Canvas diagram snapshot stored in Cloudflare R2.
  - `codeSubmission`, `codeLanguage`, `testCasesPassed`: IDE code submission state.
  - `transcript` (JSON): Full timestamped dialogue between candidate and Sarah AI.
  - `EvaluationReport`: `overallScore` ($0\text{–}100$), `verdict` (*Strong Hire / Hire / Needs Practice*), `readinessDelta` (e.g. $+6\%$), `strengths`, `improvements`.
  - `RubricScore`: Granular dimension rating ($1.0\text{–}10.0$) and `missingAtoms` (specific concepts candidate missed).

### Loop 5: Memory Decay & Spaced Repetition (SuperMemo SM-2)
- **Model**: `RevisionItem`
- **Purpose**: Powers the `/revision` knowledge health queue based on the Ebbinghaus forgetting curve.
- **Trigger**: Automatically creates or updates an item whenever an evaluation scores $< 60\%$ or when a user flags a topic.
- **Key Attributes**:
  - `intervalDays`: Days until next review.
  - `easeFactor` ($EF \ge 1.3$): SuperMemo difficulty multiplier.
  - `nextReviewDate`: Indexed timestamp indicating when the topic must resurface.
  - `retentionBand`: `CRITICAL_DECAY` $\to$ `NEEDS_REINFORCEMENT` $\to$ `STABLE` $\to$ `PERMANENT_MEMORY`.

### Candidate Skill Gap Bridge (Phase 2 Roadmap Driver):
- **Model**: `CandidateTopicProficiency`
- **Purpose**: Injected into the 5-factor roadmap formula to compute $G(t)$.
```prisma
model CandidateTopicProficiency {
  id                 String           @id @default(cuid())
  candidateId        String           @map("candidate_id")
  candidate          CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  topicId            String           @map("topic_id")
  topic              CurriculumTopic  @relation(fields: [topicId], references: [id], onDelete: Cascade)
  topicSlug          String           @map("topic_slug")
  currentProficiency String           @default("UNKNOWN") // "UNKNOWN", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"
  targetProficiency  String           @default("ADVANCED")
  confidenceScore    Decimal          @default(0.50) @db.Decimal(3, 2)
  lastAssessedAt     DateTime?        @db.Timestamptz(6)
  assessmentSource   String           @default("RESUME_ANALYSIS")
  createdAt          DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@unique([candidateId, topicSlug], map: "uq_candidate_topic_proficiency")
  @@index([candidateId, topicSlug])
  @@map("candidate_topic_proficiencies")
}
```

---

## 5. Pillar 3: Candidate & Admin Authentication & Governance Schema

### 5.1 The `User` Model
```prisma
model User {
  id                  String               @id @default(cuid())
  clerkId             String?              @unique(map: "uq_users_clerk_id") @map("clerk_id")
  googleId            String?              @unique(map: "uq_users_google_id") @map("google_id")
  username            String?              @unique(map: "uq_users_username") @map("username")
  passwordHash        String?              @map("password_hash")
  email               String               @unique(map: "uq_users_email")
  emailVerified       Boolean              @default(false) @map("is_email_verified")
  fullName            String?              @map("full_name")
  avatarUrl           String?              @map("avatar_url")
  authProvider        String               @default("google") @map("auth_provider") // "google" | "credentials" | "clerk"
  role                AdminRole            @default(CANDIDATE) @map("role")
  adminApprovalStatus AdminApprovalStatus  @default(NONE) @map("admin_approval_status")

  // Account Safety & Universal Blocking
  isBlocked           Boolean              @default(false) @map("is_blocked")
  blockedReason       String?              @map("blocked_reason")
  blockedAt           DateTime?            @map("blocked_at") @db.Timestamptz(6)
  blockedBy           String?              @map("blocked_by")

  // Internal Staff Access Requests
  requestedRole       String?              @map("requested_role") // "CURRICULUM_MANAGER" | "STAFF_ENGINEER" | "CONTENT_REVIEWER"
  requestReason       String?              @db.Text @map("request_reason")
  requestedAt         DateTime?            @map("requested_at") @db.Timestamptz(6)
  approvedBy          String?              @map("approved_by")
  approvedAt          DateTime?            @map("approved_at") @db.Timestamptz(6)

  createdAt           DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime             @updatedAt @map("updated_at") @db.Timestamptz(6)

  profile             CandidateProfile?
  subscription        Subscription?
  auditLogs           AdminAuditLog[]

  @@index([role])
  @@index([adminApprovalStatus])
  @@index([isBlocked])
  @@map("users")
}
```

### 5.2 Subscription & Usage Quota Guardrails
```prisma
model Subscription {
  id                  String             @id @default(cuid())
  userId              String             @unique @map("user_id")
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier                SubscriptionTier   @default(FREE)
  status              SubscriptionStatus @default(INACTIVE)
  planName            String             @default("Free Plan") @map("plan_name")
  isPlanOpted         Boolean            @default(false) @map("is_plan_opted")
  
  // Real-Time Quota Tracking
  voiceMinutesUsed    Float              @default(0.0) @map("voice_minutes_used")
  voiceMinutesLimit   Float              @default(30.0) @map("voice_minutes_limit")
  mockInterviewsUsed  Int                @default(0) @map("mock_interviews_used")
  mockInterviewsLimit Int                @default(1) @map("mock_interviews_limit")

  createdAt           DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime           @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@map("subscriptions")
}
```

### 5.3 Immutable Admin Audit Trail
```prisma
model AdminAuditLog {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String    // "APPROVE_STAFF" | "ASSIGN_ROLE" | "BLOCK_USER" | "UPDATE_TOPIC" | "TRIGGER_REFRESH"
  targetType  String    // "User" | "CurriculumTopic" | "CompanyIntelligence" | "Subscription"
  targetId    String    @map("target_id")
  changeDiff  Json?     @map("change_diff") // Before/After state JSON
  ipAddress   String?   @map("ip_address")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@map("admin_audit_logs")
}
```

---

## 6. Pillar 4: Local Database $\leftrightarrow$ Production (Neon Cloud) Parity Protocol

To allow switching between **Local Development** and **Production Cloud** with zero code modifications or schema drift:

### 6.1 The Single-Toggle Environment Configuration

Both repositories share identical `.env` configurations:

```env
# ── Local Development (Active) ──
DATABASE_URL="postgresql://postgres:admin@localhost:5432/prepinminutes?schema=public"
DIRECT_URL="postgresql://postgres:admin@localhost:5432/prepinminutes?schema=public"

# ── Neon Cloud Production (Pending Confirmation Gate) ──
# DATABASE_URL="postgresql://prepinminutes_owner:...@ep-mute-water-pooler.c-6.us-east-2.aws.neon.tech/prepinminutes?sslmode=require"
# DIRECT_URL="postgresql://prepinminutes_owner:...@ep-mute-water.c-6.us-east-2.aws.neon.tech/prepinminutes?sslmode=require"
```

### 6.2 The Parity Execution Contract

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Modify Prisma Schema in prepinminutes-backend            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Push & Test on Local PostgreSQL (localhost:5432)         │
│    Command: npx prisma db push (against local)              │
│    Result: Verified against local tests & API               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Review & Explicit Confirmation Gate                 │
│    (User approves pushing changes to Production Neon)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Execute Gated Neon Cloud Sync (TASK-P2-05)               │
│    Command: Reset Neon DB -> Push Schema -> Run Seed Script │
│    Result: 100% Exact Clone with Zero Schema Drift          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Checklist & Verification Standard

When executing the P0 tasks:
1. **Schema Integrity**: Run `prisma validate` — 0 errors.
2. **Local Push**: Run `prisma db push` on local database — all 23 tables created cleanly.
3. **Curriculum Sync**: Run `sync-curriculum-postgres.ts` — verify:
   - 10 domains in `curriculum_domains`.
   - 122 categories in `curriculum_categories`.
   - 371 topics in `curriculum_topics` (0 missing slugs compared to Neo4j).
4. **Relational Constraints**: Verify foreign keys between `candidate_topic_masteries.topic_id` and `curriculum_topics.id`.
