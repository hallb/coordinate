# ADR-002: Claim Lifecycle as Domain State Machine

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

The claim cascade (GLO-031) drives the core workflow: an expense moves through multiple submissions to different insurance plans until the remaining balance reaches zero or no plans remain. The functional requirements define ten claim states (FR claim state table) and explicit transition rules:

- FR-030: partial payment triggers routing to the next plan
- FR-031: fixable rejection holds the cascade at the current plan
- FR-032: no remaining plans closes the expense as out-of-pocket
- FR-033: zero balance closes the expense as fully reimbursed

This is a state machine with well-defined states, events (outcome recorded, resubmitted, etc.), and guards (has remaining balance, has next plan, is fixable). The question is whether to use an off-the-shelf workflow/state machine engine or implement the state machine as a pure domain concept.

### Evaluation criteria

Per ADR-001, the core domain must have zero external dependencies. Per CON-004, operational complexity must be minimal. The claim lifecycle is human-paced (days/weeks between transitions), single-user in MVP, and does not require distributed coordination, durable execution, or retry infrastructure.

## Decision

Implement the claim lifecycle as a **pure domain state machine** in `src/domain/`:

- **States**: a TypeScript union type or enum covering all claim states (`submitted`, `processing`, `paid_full`, `paid_partial`, `rejected_fixable`, `rejected_final`, `audit`, `limit_hit`, `closed_zero`, `closed_oop`).
- **Events**: typed discriminated unions representing things that happen (`OutcomeRecorded`, `Resubmitted`, `AuditResolved`, `CascadeAdvanced`, etc.).
- **Transition function**: a pure function `(currentState, event) → { newState, effects }` that returns the new state and a list of side effects (e.g., "invoke routing engine", "update balance", "emit notification").
- **Guards**: pure predicate functions that check preconditions (e.g., `hasRemainingBalance`, `hasNextApplicablePlan`, `isFixableRejection`).

The state machine definition lives entirely in the domain layer. It has no dependency on any state machine library. Effects returned by the transition function are interpreted by the application layer, which calls the appropriate domain services (routing engine, balance tracker) and adapters (persistence, notifications).

XState or similar libraries may optionally be used in the **application or adapter layer** — for example, to provide visual state machine inspection during development, or to drive UI state in the frontend. But the domain owns the authoritative state machine definition.

## Consequences

### Positive

- The state machine is a pure function — trivially unit-testable with table-driven tests covering every state × event combination.
- Zero external dependencies in the domain, consistent with ADR-001.
- The state machine definition serves as executable documentation of the claim lifecycle.
- Adding new states or transitions (e.g., for PHSP coordination in Phase 5) requires only domain-layer changes.

### Negative

- No built-in persistence, durability, or crash recovery from a workflow engine. The application layer must ensure state transitions are persisted atomically. Given the human-paced, single-user nature of the MVP, this is straightforward.
- No visual editor for the state machine (unlike XState's Stately Studio). Mitigated by optional XState projection in the adapter layer if visual tooling is desired.

### Neutral

- The approach scales naturally: if the system later needs durable execution (e.g., for automated insurer submission retries in Phase 6), a workflow engine can be introduced in the adapter layer without changing the domain state machine.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Temporal.io / Dagu / similar workflow engine | Distributed workflow orchestration solves a problem we don't have. Adds operational infrastructure (server, database) incompatible with CON-004. The claim cascade is human-paced, not a long-running automated process. |
| XState in the core domain | XState is excellent, but placing it in the domain layer introduces an external dependency (violates ADR-001). The claim state machine is simple enough that a hand-rolled pure-function approach is clearer and more testable. XState can still be used outside the domain. |
| No formal state machine (ad-hoc status field updates) | Loses the guarantees of explicit states and transitions. Makes it easy to introduce invalid state transitions. The claim lifecycle is complex enough (10 states, multiple transition paths) that a formal model pays for itself in correctness and testability. |
