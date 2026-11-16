# TASK-P8-03 Specification: Security Hardening, Rate Limiting & Admin Auditing

## 1. Executive Summary & Objective
The goal of **TASK-P8-03** is to verify platform security boundaries, request rate limiting, idempotent mutation handling, and immutable administrative audit logs across all multi-domain candidate and admin interactions.

---

## 2. Security Guardrails & Verification Specifications

### 2.1 Upstash Sliding-Window Rate Limiting
- **General Endpoints**: Burst limit enforced at 60 req/min.
- **AI Evaluation Endpoints (`ai_eval`)**: Strict limit of 10 evaluations per minute per candidate.
- **Fail-Open Strategy**: If edge Redis partitioning occurs, the platform gracefully fails open to protect candidate UX without service outage.
- **Trip Verification**: Rapid burst (e.g., 4 requests on a 3-request window) returns HTTP 429 (`RATE_LIMIT_EXCEEDED`) with structured `retryAfter` metadata.

### 2.2 Mutation Idempotency via `Idempotency-Key`
- For practice submissions and voice turn synthesis, duplicate rapid retries (network reconnections, client double-clicks) must never trigger duplicate AI evaluation runs or double-decrement candidate quota.
- Header: `X-Session-Attempt-Id` or `Idempotency-Key`.
- Cached response payload returned with 60-second TTL on exact key match.

### 2.3 Strict Candidate Tenant Isolation
- Resolves tenant context via `withCandidateContext(identifier)`.
- Rejects unauthenticated attempts to alter another candidate's plan, practice session, or revision intervals.
- Enforces relational foreign key cascades (`onDelete: Cascade` on candidate profile deletions).

### 2.4 Immutable Admin Audit Logging
- All administrative mutations (user block, role approval, curriculum topic updates, subscription tier tier overrides) append an immutable entry to PostgreSQL `admin_audit_logs`.
- Records `adminId`, `actionType`, `targetEntity`, `targetEntityId`, `changesPayload`, and `timestamp`.

---

## 3. Test Verification
- Executed `scripts/test-phase4-security.ts`:
  - [x] Sliding window rate limiting trips on excessive bursts (HTTP 429).
  - [x] Submission idempotency intercepts duplicate submissions and serves cached result with 0 duplicate AI compute.
  - [x] Redis cache key sanitization and TTL validation.
