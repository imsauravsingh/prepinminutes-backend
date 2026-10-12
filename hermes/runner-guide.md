# PrepInMinutes — Developer & Autonomous Agent Workflow Guide

## 1. Purpose

This document defines the mandatory engineering workflow for all developers and autonomous AI agents working on the prepinminutes repository.

These rules apply to:

- Human developers
- Hermes autonomous agents
- Coding agents
- AI-assisted development workflows
- Feature, bug-fix, refactoring, infrastructure, and documentation tasks

The objective is to maintain:

- Clean Git history
- Safe autonomous development
- Reproducible builds
- Verified implementations
- Traceable task execution
- Consistent documentation
- Reliable pull requests
- Clear development status

These rules are mandatory unless an explicit project-level exception is provided.

---

# 2. Core Engineering Principle

> Plan → Inspect → Branch → Implement → Test → Verify → Document → Update Status → PR

An autonomous agent must never jump directly from a task request to implementation.

Every development task must follow the complete workflow.

---

# 3. Task Authorization

Before modifying the repository, the agent MUST identify the source of the task.

Valid sources include:

- Approved Hermes task
- Hermes Kanban task
- Existing development plan
- Explicit developer instruction
- Approved feature specification
- Approved bug/issue

The agent must NOT independently invent product requirements or implement unrelated improvements.

### Rule

> Only implement what is explicitly required by the existing plan, task, specification, or domain context.

If requirements are ambiguous and the ambiguity could materially change the implementation, the agent must stop and request clarification.

---

# 4. Repository Inspection — Mandatory Before Coding

Before making any code changes, the agent MUST inspect the repository.

At minimum, inspect:

```bash
git status
git branch --show-current
git log --oneline -10
```

Then understand the relevant implementation area.

The agent should inspect:

- Existing architecture
- Relevant modules
- Existing patterns
- Existing tests
- Existing scripts
- Package dependencies
- Environment/configuration requirements
- Related features
- Existing documentation

### Important

The agent must prefer extending existing architecture over introducing a parallel implementation.

Do not create duplicate utilities, services, components, or abstractions when an existing implementation can be reused.

---

# 5. Synchronize develop

Before creating any development branch:

```bash
git checkout develop
git pull --ff-only origin develop
```

If the local develop branch contains uncommitted changes, the agent MUST NOT overwrite or discard them.

The agent must stop and safely resolve the situation.

### Never use:

```bash
git reset --hard
git clean -fd
```

unless explicitly authorized.

---

# 6. Branching Rules

All work MUST happen on a dedicated branch.

### Feature

`feature/{feature-name}`

Example:
`feature/phase1-persistence-schema`

### Bug fix

`fix/{issue-name}`

Example:
`fix/clerk-auth-gate-redirect`

### Refactoring

`refactor/{change-name}`

### Chore

`chore/{task-name}`

### Documentation

`docs/{documentation-name}`

### Branch Source

Every branch MUST originate from the latest:

`origin/develop`

Never branch from:

- main
- stale local branches
- another feature branch
- an unverified working tree

---

# 7. Protected Branches

Autonomous agents MUST NEVER directly commit or push to:

- `main`
- `develop`

The agent must always use a task branch.

Forbidden:

```bash
git checkout develop
git commit
git push origin develop
```

The only permitted push is to the agent's dedicated branch.

---

# 8. Implementation Rules

During implementation the agent must:

1. Follow the existing architecture.
2. Reuse existing utilities and abstractions.
3. Avoid unnecessary dependencies.
4. Avoid unrelated refactoring.
5. Avoid modifying unrelated files.
6. Maintain existing API contracts unless the task explicitly requires a change.
7. Preserve backward compatibility where possible.
8. Follow existing TypeScript/React/Next.js conventions.
9. Add appropriate error handling.
10. Add tests for new behavior.

### Dependency Rule

Do not add a new npm dependency unless:

- It is genuinely required, and
- Existing dependencies cannot reasonably solve the problem.

If a new dependency is introduced, the PR must explain why.

---

# 9. Scope Control

The agent must not expand the task unnecessarily.

For example, if the task is:

`Implement interview session persistence`

the agent must NOT independently decide to:

- Redesign the dashboard
- Replace the database layer
- Refactor authentication
- Introduce a new state-management library
- Redesign unrelated APIs

unless those changes are required by the implementation.

### Principle

> Smallest correct change that fully satisfies the requirement.

---

# 10. Testing Requirements

Every implementation must include appropriate verification.

Depending on the change, this may include:

### Unit tests

`npm test` or the repository's configured unit-test command.

### Build verification

`npm run build`

### Lint verification

`npm run lint`

### Type checking

`npm run typecheck` (if configured)

### Phase-specific verification

Run all relevant scripts under:
`scripts/`

### Feature-specific verification

The agent must also test the actual behavior introduced by the task.

Passing a build alone is NOT sufficient evidence that a feature works.

---

# 11. Verification Gate

A task is NOT considered complete until:

- Implementation is complete
- Relevant tests pass
- Build passes
- Lint passes
- Relevant verification scripts pass
- No known blocking errors remain

Minimum verification:

```bash
npm run build
npm run lint
```

Plus all relevant tests/scripts.

---

# 12. Failure Rule

If any required verification fails:

> The task is NOT complete.

The agent must:

1. Investigate the failure.
2. Fix the implementation if the failure is caused by the change.
3. Re-run verification.
4. Continue until verification passes or a genuine blocker is identified.

The agent MUST NOT claim:

`Testing Passed`

when required tests are failing.

If a blocker cannot be resolved, the agent must report:

- Failed command
- Error
- Root cause if known
- What was attempted
- Remaining blocker

---

# 13. Git Diff Review

Before committing, the agent MUST inspect:

```bash
git status
git diff
```

The agent must verify that:

- Only intended files changed
- No secrets were added
- No `.env` files were accidentally committed
- No generated artifacts were accidentally included
- No debugging code remains
- No unrelated changes are present

If necessary:

```bash
git diff --stat
```

---

# 14. Commit Rules

Commits should be small, meaningful, and related to the task.

Recommended format:

- `feat: implement interview session persistence`
- `fix: resolve auth redirect issue`
- `refactor: simplify preparation service`
- `test: add preparation plan coverage`
- `docs: update architecture documentation`

Do not create meaningless commits such as:

- `update`
- `changes`
- `fix stuff`
- `AI changes`
- `WIP`

---

# 15. Documentation Requirement

Any significant feature, architecture change, API change, workflow change, or important technical decision MUST be documented.

Documentation may include:

- Architecture documentation
- Feature documentation
- API documentation
- ADR
- Technical design
- Implementation notes
- Testing/verification notes

Documentation must be stored in the repository's appropriate documentation location.

If the project has an approved external documentation workflow, the agent must follow that workflow as well.

---

# 16. Hermes Task / Kanban Updates

Hermes MUST maintain the task lifecycle in real time.

### Real-Time In-Progress Tracking Rule

> **Mandatory**: Whenever the agent begins progressing or working on a task, it MUST immediately update the status of that task to `IN PROGRESS` in both `hermes/kanban-board.md` and `hermes/tasks.json` before writing code. This allows the user to inspect the exact live task status at any moment.

Recommended status flow:

```
TODO
  ↓
IN PROGRESS (Updated immediately when work begins)
  ↓
IMPLEMENTATION COMPLETE
  ↓
TESTING
  ↓
TEST PASSED
  ↓
PR CREATED
  ↓
READY FOR REVIEW
  ↓
DONE
```

The agent must update the Hermes Kanban/task status when reaching meaningful milestones:

- **Start of Task**: Immediately set to `IN PROGRESS` in `hermes/kanban-board.md` and `hermes/tasks.json`
- **Implementation finished**: `IMPLEMENTATION COMPLETE`
- **Verification started**: `TESTING`
- **Verification passed**: `TEST PASSED`
- **PR created**: `PR CREATED`
- **Ready for review**: `READY FOR REVIEW` (with PR URL recorded)
- **Final completion**: `DONE`

The agent must not mark a task `DONE` merely because the code was written.

---

# 17. Pre-PR Synchronization

Before creating a PR, the agent MUST synchronize with the latest develop:

```bash
git fetch origin develop
git rebase origin/develop
```

If conflicts occur:

1. Resolve them carefully.
2. Re-run tests.
3. Re-run build.
4. Re-run lint.
5. Review the final diff.

After rebase:

```bash
git status
git log --oneline -10
```

---

# 18. Final Verification Before Push

Immediately before pushing:

```bash
npm run lint
npm run build
```

Plus all relevant tests and verification scripts.

Then:

```bash
git status
git diff origin/develop...HEAD
```

The final diff must contain only the intended implementation.

---

# 19. Push Rules

Push only the task branch:

```bash
git push -u origin feature/{feature-name}
```

Never push directly to:

- `main`
- `develop`

---

# 20. Pull Request Rules

Every completed implementation must create a Pull Request targeting:

`base: develop`

The PR must contain:

- **Summary**: What was implemented.
- **Problem**: What problem the change solves.
- **Implementation**: Important technical changes.
- **Testing**: Commands executed and their results.
  ```text
  npm run lint      ✅
  npm run build     ✅
  npm test          ✅
  scripts/verify-x  ✅
  ```
- **Verified Routes / APIs**: List relevant routes, APIs, pages, or workflows verified.
- **Documentation**: Mention documentation added or updated.
- **Risks**: Mention known risks or limitations.
- **Screenshots**: For UI changes, include relevant screenshots when appropriate.

---

# 21. PR Completion Rule

Creating a PR does NOT automatically mean the task is complete.

The task should remain:

`PR CREATED / READY FOR REVIEW`

until the project's defined review/merge process is complete.

If Hermes is explicitly authorized to merge PRs, it may merge only after all configured CI checks pass and repository branch protection rules permit the merge.

---

# 22. Autonomous Agent Safety Rules

Hermes MUST NOT:

- Push directly to `main`
- Push directly to `develop`
- Delete branches without authorization
- Delete user work
- Run destructive Git commands without authorization
- Commit secrets
- Modify production infrastructure without explicit authorization
- Change credentials
- Disable security controls to make tests pass
- Suppress failing tests
- Remove tests to make CI pass
- Modify unrelated functionality
- Claim successful testing when verification failed

---

# 23. Environment and Secrets

The agent must never commit:

- `.env`
- `.env.local`
- Credentials
- API keys
- Private keys
- Tokens
- Passwords
- Cloud credentials

Use environment variables or the project's approved secret-management mechanism.

If credentials are accidentally exposed, the agent must immediately report the issue.

---

# 24. Existing Plan Is the Primary Product Source of Truth

For PrepInMinutes development, Hermes should prioritize information in this order:

1. Explicit developer instruction
2. Approved feature/product specification
3. Existing development plan
4. Existing architecture/documentation
5. Existing code conventions
6. Agent inference

Agent inference must be the last resort.

If the agent must make an assumption that materially affects the product, it must stop and request clarification rather than silently changing product behavior.

---

# 25. Completion Report

After implementation and verification, Hermes must produce a concise completion report containing:

```text
Feature:
Branch:
Task:
Implementation:
Files Changed:
Tests:
Build:
Lint:
Verification Scripts:
Documentation:
PR:
Current Status:
Known Issues:
```

---

# 26. Final Definition of Done

A Hermes task is considered DONE only when:

- [x] Task was authorized
- [x] Repository was inspected
- [x] Latest `develop` was synchronized
- [x] Dedicated branch created
- [x] Implementation completed
- [x] Relevant tests added
- [x] Tests passed
- [x] Lint passed
- [x] Build passed
- [x] Relevant verification scripts passed
- [x] Git diff reviewed
- [x] Documentation updated when required
- [x] Hermes Kanban updated
- [x] Branch rebased with latest `develop`
- [x] Final verification passed
- [x] PR created against `develop`
- [x] PR contains testing evidence
- [x] No known blocking issue remains

---

# 27. Golden Rule

> Hermes must never optimize for "code written."
>
> Hermes must optimize for "feature correctly implemented, tested, verified, documented, tracked, and ready for review."

The expected lifecycle is:

```
PLAN
  ↓
INSPECT
  ↓
SYNC DEVELOP
  ↓
CREATE BRANCH
  ↓
IMPLEMENT
  ↓
TEST
  ↓
BUILD + LINT
  ↓
VERIFY
  ↓
DOCUMENT
  ↓
UPDATE HERMES
  ↓
REBASE DEVELOP
  ↓
FINAL VERIFICATION
  ↓
PUSH
  ↓
CREATE PR
  ↓
READY FOR REVIEW
  ↓
DONE
```
