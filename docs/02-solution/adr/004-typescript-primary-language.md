# ADR-004: TypeScript as Primary Language

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

Coordinate needs a language for three execution contexts:

1. **Core domain and application logic** — routing engine, state machine, balance tracking (runs in the browser for a local-first PWA per ADR-003).
2. **PWA frontend** — UI components, service worker, IndexedDB/SQLite-WASM interaction.
3. **Browser extension** (Phase 6, ADR-005) — content scripts, service worker, messaging.

The project is maintained by a single developer (CON-004). Minimizing language count reduces cognitive overhead, tooling surface, and the risk of context-switching errors.

## Decision

Use **TypeScript** as the sole programming language across all layers and execution contexts.

- **Core domain** (`src/domain/`): pure TypeScript with no framework or runtime dependencies. TypeScript's type system (discriminated unions, generics, branded types) is well-suited for modeling the domain: claim states, COB rules, plan configurations.
- **PWA frontend**: TypeScript with a UI framework (specific framework choice deferred — React, Svelte, and Solid are candidates).
- **Browser extension**: TypeScript compiled to Manifest V3 content scripts and service worker.
- **Build tooling**: Vite for the PWA (fast builds, native ESM, good TypeScript support). Extension build tooling TBD.
- **Runtime**: browser-native. No Node.js server for MVP. If a sync server is needed in Phase 4, TypeScript on Node.js/Bun is the natural choice.

## Consequences

### Positive

- One language across all contexts — domain, frontend, extension, and eventual server. Single dependency tree, single test runner, shared types.
- TypeScript's type system catches domain modeling errors at compile time (e.g., invalid state transitions, missing plan fields, type-narrowing on claim states).
- The domain layer runs natively in the browser — no serialization boundary between domain logic and the PWA frontend.
- Large ecosystem for web development; strong community support; extensive tooling.

### Negative

- TypeScript's type system is structural and unsound in some edge cases (e.g., type assertions, `any` leakage). Requires discipline to maintain type safety in the domain layer.
- Browser-only runtime for MVP means no access to Node.js-specific APIs (filesystem, native modules). Not a problem for the local-first PWA model, but worth noting.

### Neutral

- TypeScript is the founder's primary language — no ramp-up cost.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Python | Strong ecosystem, but requires a separate language for the frontend and browser extension. Introduces a serialization boundary between backend and frontend. No browser-native execution for the local-first PWA model. |
| Go | Fast, single-binary deployment, but no browser-native execution. Poor fit for a PWA frontend and browser extension. Would require TypeScript anyway for the UI layer. |
| Rust | Excellent type system and performance. Compiles to WASM for browser execution. But steep learning curve, slower iteration speed, and still needs TypeScript for the UI layer and browser extension. Could be revisited for performance-critical components. |
| Kotlin Multiplatform | Targets JVM, JS, and native. Less mature JS target, smaller ecosystem for web development, adds build complexity. |
