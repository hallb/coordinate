---
name: phase-executor
description: Execute a phase of the implementation plan. Use when the user says "execute Phase X" or "now run Phase 1". Reads MDP milestone/issues, implements work, runs verification, handles bugs, requests approval, and manages phase transitions.
---

# Phase Executor

Use this skill when the user asks to **execute a phase** (e.g. "now execute Phase 1", "run Phase 2"). Planning lives in **~/work/ai-coordinate/coordinate-planner** (MDP). Use `mdp-issue-manager` and `mdp-milestone-planner` for MDP commands. This repo uses `script/` (scripts-to-rule-them-all).

## Pre-Execution

### 1. Read the phase from MDP

- Identify the phase (e.g. Phase 1 = Core Claim Lifecycle, from [07-scope.md](docs/01-requirements/07-scope.md))
- List the milestone and its issues: `mdp milestone get -p ~/work/ai-coordinate/coordinate-planner --id M-N`
- List issues: `mdp issue list -p ~/work/ai-coordinate/coordinate-planner`
- Read each issue's body for the canonical 8-section structure (Phase Identity, Goal, Plan, etc.)

### 2. Confirm solution docs reflect this phase

Per `doc-phase-scoping.mdc`: solution docs ([02-solution/](docs/02-solution/)) describe the **current** implementation target only. If the phase target differs from what the docs describe, either:

- Update the solution docs first, or
- Proceed only if the user confirms (e.g. docs are intentionally ahead/behind)

### 3. Phase education

Present:

- **What**: Purpose, scope, context
- **How**: Technical approach, architecture, patterns (onion/ports-and-adapters)
- **Dependencies**: Prerequisites, blocking work
- **Deliverables**: Code, config, tests, docs

### 4. Implementation checklist

Create a granular checklist from the phase Plan and issues. Categories: domain, application, adapters, tests, config, docs.

### 5. Definition of Done

- All code follows project conventions (onion-architecture, TypeScript)
- No lint errors; build succeeds; tests pass
- Phase verification gates (AI + Human) satisfied

### 6. Go / No-Go

Ask: "Ready to proceed? Please respond with 'go' or 'no-go'". Wait for explicit "go".

## Execution

### 7. Create branch

```bash
git checkout -b feature/p1-core-claim
# or feature/p2-proactive-guidance, feature/phase-1-mvp, etc.
```

### 8. Implement

- Work through checklist and MDP issues sequentially
- Follow `script/` — use `script/bootstrap`, `script/test`
- Run `script/test` frequently; fix failures before continuing
- Run linters; fix errors

### 9. Quality gates

- [ ] All code written
- [ ] All tests passing
- [ ] No lint errors
- [ ] `script/cibuild` (or `script/test`) passes

### 10. Manual test plan

Provide setup instructions and test scenarios (happy path, error cases, edge cases). For PWA: browser testing, mobile viewport if applicable.

### 11. Bug capture (before approval)

Ask: "Is there any need to track any bugs or issues before moving on to the next phase?"

- If **yes**: Create MDP issues with `--type bug` and label `bug`. Include summary, where it resides, requirements impacted. Link to current phase/milestone.
- No separate bugs log — bugs are MDP issues.

### 12. Request approval

Present summary: features, files created/modified, test results. State: "All implementation is complete. All tests pass. Ready for review." **Do NOT commit** until user says "approved" or "commit".

### 13. Commit (only after explicit approval)

```bash
git add .
git commit -m "feat(P1): Core Claim Lifecycle — [brief description]

- [Key feature 1]
- [Key feature 2]

Traceability: FR-040, FR-041, FR-042, ..."
```

Ask about merge.

## Phase Transition

When closing a phase and moving to the next:

1. **Update MDP**: Set completed issues to "Done"; update milestone status; add log entry.
2. **Solution doc audit**: Does the next phase change the implementation target? Per `doc-phase-scoping.mdc`, solution docs (data model, architecture, security) must reflect what is being built now. If the new phase introduces or removes concepts, update those docs.
3. **Deferral ADRs**: If the next phase consciously defers requirements, create an ADR (see `adr-author` skill).
4. **Shape next phase**: If the next phase isn't yet in MDP, use the `phase-shaper` skill.

## Bug Review Workflow

If the user asks to **review bugs** before proceeding:

1. List MDP issues with `--type bug` (or label bug).
2. For each: summary + "Do you want to fix this bug before proceeding?"
3. If user says fix bug X: treat it as a mini-phase. Create branch `feature/bug-ISS-N-short-name`, implement fix, verify, request approval, commit.
4. Update bug issue status to Done (or equivalent) when fixed.

## What NOT to Do

- Do NOT commit without explicit user approval
- Do NOT skip tests or proceed with failing tests
- Do NOT use a separate bugs-and-issues-log file — use MDP
- Do NOT skip solution doc audit on phase transition

## Example Flow

```
1. User: "Execute Phase 1"
2. AI: [Reads MDP, confirms solution docs, presents education + checklist + DoD]
3. AI: "Ready to proceed? Please respond with 'go' or 'no-go'"
4. User: "go"
5. AI: [Creates branch feature/p1-core-claim, implements]
6. AI: [Manual test plan, asks about bugs]
7. AI: [Requests approval with summary]
8. User: "approved"
9. AI: [Commits, updates MDP, performs phase transition audit]
```
