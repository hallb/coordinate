---
name: phase-shaper
description: Shape a phase into MDP milestones and issues. Use when creating or refactoring a phased implementation plan, decomposing a Feature Phase into executable work items, or reviewing phase completeness. Invoke explicitly (e.g. "shape Phase 1 into MDP issues").
---

# Phase Shaper

Use this skill when the user asks to **shape a phase** — convert a Feature Phase from the scope document into MDP milestones and issues with the canonical 8-section structure. Planning lives in **~/work/ai-coordinate/coordinate-planner** (MDP). Use the `mdp-issue-manager` and `mdp-milestone-planner` skills for MDP commands.

## Source: Feature Phases

Feature Phases are defined in [docs/01-requirements/07-scope.md](docs/01-requirements/07-scope.md). Each phase has:
- Feature areas with FR mappings (e.g. FR-040, FR-041)
- Dependencies on prior phases
- Priority (Must, Should, Could)

Use these exactly. Never invent, modify, merge, or split FRs — cite them as authored in [05-functional-requirements.md](docs/01-requirements/05-functional-requirements.md).

## Canonical Phase Shape (8 Sections)

Every phase (or phase-sized work unit) must have these sections in order:

### 1. Phase Identity

- **Phase ID**: e.g. P1 (Phase 1), P2.1 (Phase 2 sub-phase)
- **Phase Name**: Descriptive (e.g. "Core Claim Lifecycle (MVP)")
- **FR Mapping**: List exact FR IDs from the requirements doc, or "None (foundational)"

### 2. Goal

Single sentence describing **system state** after completion. Present tense. Not effort.
- Good: "The Operator can enter an expense, route it through the COB cascade, and close it."
- Bad: "Implement expense entry"

### 3. Dependencies

Phase IDs that must complete first. Or "None".

### 4. Plan

Step-by-step **instructions**. Imperative mood. Specific enough for blind execution.
- Good: "Create Person aggregate with id, name, dateOfBirth in domain/"
- Bad: "Set up domain model"

### 5. Outcome

Measurable deliverables. Bullet points. Each verifiable.

### 6. Automated Verification (AI Gate)

Specific test/verification steps with expected results. Executable by `script/test` or CI.
- Good: "Run `script/test` — RoutingEngine tests pass for birthday rule scenarios"
- Bad: "Test routing"

### 7. Human Verification (Human Gate)

2–4 review steps requiring judgment (design alignment, requirement fit).

### 8. Success Criteria

Binary checkboxes (done or not). 4–8 items. Each independently verifiable.

## Representing in MDP

- **Milestone**: Create or use an existing MDP milestone (e.g. M-4) for the phase. Add a description with the 8 sections or link to a doc.
- **Issues**: Create MDP issues under the milestone. Each issue body (content after frontmatter) can contain the 8-section structure for that work unit, or a subset if the issue is small.
- **Titles**: Use `solution: <topic>` or `requirements: <topic>` per mdp-workflow conventions.
- **Dependencies**: Set `--blocked-by ISS-N` when one issue depends on another.

```bash
# Example: create issue for Phase 1 work
mdp issue create -p ~/work/ai-coordinate/coordinate-planner \
  -t "solution: Plan configuration (FR-040, FR-041, FR-042)" \
  --type feature --milestone M-4 \
  --checklist "Implement Household aggregate","Implement InsurancePlan aggregate","Add Dexie schema"
```

## Solution Doc Audit (Phase-Scoping Principle)

Before or when shaping a **new** phase (e.g. transitioning from Phase 1 to Phase 2):

1. **Audit solution docs** ([02-solution/](docs/02-solution/)): Do they describe only the **current** implementation target? Per `doc-phase-scoping.mdc`, solution docs reflect what is being built now.
2. **If the new phase changes the target**: Update data model, architecture, security design to match. Remove concepts that no longer apply. Add forward references for concepts still deferred.
3. **Create deferral ADRs** when consciously not implementing a requirement (e.g. ADR-010 for multi-user).

## Quality Checklist

Before considering a phase "shaped":

- [ ] All 8 sections present and in correct order
- [ ] FR mappings match [05-functional-requirements.md](docs/01-requirements/05-functional-requirements.md) exactly
- [ ] Goal describes system state (not effort)
- [ ] Plan contains step-by-step instructions
- [ ] Outcomes are measurable
- [ ] AI Gate steps are executable (`script/test`, specific test names)
- [ ] Human Gate has 2–4 items
- [ ] Success criteria are binary (4–8 items)
- [ ] Phase represents 1–2 weeks of work (split if larger)
- [ ] Solution docs audited if this is a phase transition

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Goal describes effort | "Implement X" → "The system can X" (present tense, state) |
| Plan is vague | "Set up storage" → "Create Dexie schema for persons, households, insurance_plans, expenses" |
| FR mapping implicit | "Implements plan config" → "FR-040, FR-041, FR-042" (exact IDs) |
| Verification vague | "Test routing" → "Run RoutingEngine.test.ts — birthday rule scenarios pass" |
