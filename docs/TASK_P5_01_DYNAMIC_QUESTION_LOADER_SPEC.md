# Architecture Specification: TASK-P5-01 — Dynamic Question Loader for Practice Workspaces

> **Version**: 1.0.0  
> **Status**: APPROVED FOR EXECUTION  
> **Target Release**: Phase 5 (Interactive Practice & Live Question Injection)  
> **Dependencies**: `TASK-P3-02` (Edge Gateway Topic Endpoints), `TASK-P4-01` (ChooseTopic Router), `TASK-P4-03` (Topic Cards & Category Search)  
> **Applicable Workspaces**:
> 1. `SystemDesignWorkspace.tsx` (`/practice/session/system-design`)
> 2. `PracticeCodingWorkspace.tsx` (`/practice/session/coding`)
> 3. `CloudWorkspace.tsx` (`/practice/session/cloud`)
> 4. `BehavioralWorkspace.tsx` (`/practice/session/behavioral`)

---

## 1. Executive Summary & Problem Statement

In Phases 1 through 4, we built:
1. The full **10-Domain Knowledge Graph** (122 categories, 371 topics, 7,420 questions) in Neo4j and PostgreSQL.
2. The **Hono Edge Gateway** `/api/curriculum/topic/:topicSlug` and `/api/curriculum/topic/:topicSlug/questions`.
3. The **Interactive Topic Picker UI** that computes archetype URLs: `/practice/session/{archetype}?topic={topicSlug}&domain={domainSlug}`.

However, all 4 practice session workspaces currently render **static, hardcoded mock prompts** (e.g., "Design a URL shortener", "Write maxSubarraySum", "Terraform AWS VPC", "Tell me about a time you disagreed"). When candidates select any of the 371 topics, the workspace ignores the query parameters and displays the static mock scenario.

`TASK-P5-01` bridges this final gap: it connects all 4 workspaces to the live Curriculum API, dynamically loading:
- **Topic Metadata**: Title, canonical `topicId` (e.g., `SYS018`, `FND001`), domain, category, difficulty, duration.
- **Active Question**: Reads `?q={questionId}` from URL search params. If omitted, defaults to Question 1 of the topic.
- **Question Details**: Official prompt, learning level (`L1` to `L4`), archetype (`conceptual`, `failure-analysis`, `coding`, `deep-dive`), rubric guide, expected keywords, hints, and follow-up probes.
- **Question Switcher**: Interactive switcher allowing candidates to browse and practice any of the 20 questions within the active topic.

---

## 2. Architectural Design & Hook Contract

### 2.1 Hook Contract: `useCurriculumTopic(topicSlug, initialQuestionId?)`

A dedicated, reactive hook in `src/hooks/useCurriculumTopic.ts`:

```typescript
export interface UseCurriculumTopicResult {
  topic: TopicDetailResponse['topic'] | null;
  questions: CurriculumQuestionDetail[];
  activeQuestion: CurriculumQuestionDetail | null;
  activeQuestionIndex: number;
  totalQuestions: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  selectQuestion: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  refetch: () => Promise<void>;
}
```

### 2.2 Dynamic Resolution Invariants

1. **URL Parameter Reactivity**:
   - Workspaces read `const searchParams = useSearchParams()`.
   - `const topicSlug = searchParams.get("topic") || "distributed-caching"`.
   - `const questionId = searchParams.get("q") || undefined`.
2. **Deterministic Fallbacks**:
   - If the API call is in flight or fails offline, fallback to an intelligent default with the topic's title so the user never sees a crash or blank screen.
   - If `?q=...` does not match any question, gracefully select `questions[0]`.
3. **Question Navigation**:
   - Switching questions via `selectQuestion(id)` updates the URL query parameter (`?topic=...&q=...`) using `router.replace` with `{ scroll: false }` for clean bookmarking and history support.
4. **AI Interviewer Initial Message**:
   - The AI persona (Sarah / Interviewer) introduces the exact `activeQuestion.prompt` and lists the `activeQuestion.hints` or clarifying guidelines.

---

## 3. Workspace-by-Workspace Integration Matrix

| Practice Shell | Archetype | Target Component | Dynamic Injection Points |
| :--- | :---: | :--- | :--- |
| **Architecture** | `system-design` | `SystemDesignWorkspace.tsx` | Top topic badge, AI persona intro message, question switcher, rubric guide in whiteboard/notes, hints drawer. |
| **Code Editor** | `coding` | `PracticeCodingWorkspace.tsx` | Problem title, description markdown, starter code signature derived from topic, test case inputs, rubric anchors. |
| **Cloud Infra** | `cloud` | `CloudWorkspace.tsx` | Scenario brief, architecture objectives, IaC prompt (Terraform/Kubernetes), verification constraints. |
| **Behavioral** | `behavioral` | `BehavioralWorkspace.tsx` | Scenario prompt, STAR framework anchors, competencies evaluated, follow-up probe cards. |

---

## 4. Verification & Testing Strategy

1. **Automated Integration Test**: `scripts/test-dynamic-question-loader.ts`
   - Tests hook resolution with valid topic slug and question ID.
   - Tests fallback behavior with invalid question ID.
   - Tests navigation between all 20 questions in a topic.
   - Tests URL parameter serialization and archetype alignment.
2. **TypeScript Compilation**: `npx tsc --noEmit` with 0 errors across frontend and backend.
3. **Production Build**: `npx next build` with 63/63 static pages compiled cleanly.

---

## 5. Master Roadmap Tracking

Mark `TASK-P5-01` as in progress in `docs/TASK_EXECUTION_SEQUENCE.md`.
