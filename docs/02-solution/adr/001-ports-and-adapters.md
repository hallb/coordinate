# ADR-001: Onion / Ports-and-Adapters Architecture

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

Coordinate's core domain — COB routing (FR-010 through FR-015), the claim state machine (FR-030 through FR-033), and balance tracking (FR-050 through FR-053) — contains non-trivial business logic encoding Canadian insurance coordination rules (CON-005). This logic must be:

- **Testable in isolation** without databases, UI, or external services (NFR-030).
- **Reusable across deployment models** — the same routing engine must work whether the app runs as a local-first PWA, a desktop app, or a hosted service (NFR-020).
- **Maintainable by a single developer** over the long term (CON-004, NFR-032).

The deployment model is not yet fixed for all phases — MVP is a local-first PWA (ADR-003), but future phases may introduce sync services, a companion browser extension (ADR-005), or alternative frontends. The domain logic must not be coupled to any of these.

## Decision

Adopt an **onion / ports-and-adapters** (hexagonal) architecture with three layers:

### Core Domain (`src/domain/`)

Entities, value objects, domain services, and **port interfaces** — all in pure TypeScript with zero external dependencies. Key domain services include:

- **RoutingEngine**: determines the next applicable plan for an expense (GLO-030)
- **ClaimStateMachine**: manages claim state transitions and guards
- **BalanceTracker**: tracks annual maximums and HCSA balances

Repository interfaces (e.g., `ExpenseRepository`, `PlanRepository`) and integration boundaries (e.g., `DocumentStore`, `InsurerPortalAdapter`) are defined here as TypeScript interfaces (ports).

### Application Layer (`src/application/`)

Use cases and application services that orchestrate domain objects. This layer depends on the domain layer only. Examples: `SubmitExpenseUseCase`, `RecordOutcomeUseCase`, `GetRoutingRecommendationUseCase`.

### Adapter Layer (`src/adapters/`)

Concrete implementations of domain ports. Adapters depend on the domain (and may depend on the application layer) but never the reverse. Examples:

- `IndexedDbExpenseRepository` implements `ExpenseRepository`
- `BrowserExtensionInsurerAdapter` implements `InsurerPortalAdapter`
- UI components consume application services

A **composition root** (`src/main.ts` or `src/bootstrap.ts`) wires adapters to ports via dependency injection.

### Dependency direction

```
adapters/ → application/ → domain/
```

No layer may import from a layer outside (further from center) than itself.

## Consequences

### Positive

- Core domain logic is testable with plain unit tests — no mocking of databases, network, or UI.
- Deployment model can change (PWA → hosted, add Tauri wrapper, add sync service) without touching domain code.
- Browser extension, AI adapters, and alternative storage backends plug in without modifying existing code.
- Aligns with the single-maintainer constraint: clear boundaries reduce cognitive load.

### Negative

- More files and indirection than a simpler layered architecture. Port interfaces and adapter classes add structural overhead.
- Dependency injection must be wired manually or with a lightweight DI container — adds a small amount of boilerplate.

### Neutral

- The pattern is well-documented and widely understood; no novelty risk.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Simple layered architecture (UI → Service → Data) | Couples domain logic to the data access layer. Harder to swap storage or deployment model without ripple effects. |
| Framework-driven architecture (e.g., Next.js conventions) | Ties domain logic to framework lifecycle. Violates the reusability requirement across deployment models. |
| Microservices | Massive operational overhead for a single-maintainer product with single-digit users. Solves a distribution problem we don't have. |
