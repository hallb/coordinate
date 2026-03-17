# ADR-009: On-Device Storage: IndexedDB via Dexie.js

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-17 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

ADR-003 mandates a local-first PWA with all structured data (expenses, submissions, plan configuration, balance state) stored on-device. The storage technology choice was left open between IndexedDB and SQLite-WASM. ADR-008 defines schema evolution for both paths (Path A for Dexie, Path B for SQLite-WASM). NFR-032 (solo-maintainer operability), NFR-043 (data at rest), and NFR-052 (crash resilience) shape the decision. Data volume is small — hundreds of expenses per year, single household in MVP.

### Options evaluated

| Option | Pros | Cons |
|--------|------|------|
| **IndexedDB (via Dexie.js)** | Native browser API, no WASM overhead, live queries with Dexie, built-in migrations (ADR-008 Path A) | No SQL, limited query expressiveness, async-only |
| **SQLite-WASM (via wa-sqlite / cr-sqlite)** | Full SQL, OPFS durability, relational integrity | WASM bundle size (~1–2 MB), OPFS worker complexity, newer/less battle-tested |

## Decision

Use **IndexedDB via Dexie.js** as the on-device structured data store for Coordinate.

- Implement the storage adapter behind the domain ports (ADR-001) using Dexie.js.
- Use Dexie's built-in versioning for schema evolution (ADR-008 Path A).
- Use Dexie `liveQuery` and compound indexes for reactivity and filtering; aggregations (balance totals, claim roll-ups) will be performed in application logic where data volume is small.

## Consequences

### Positive

- No WASM binary — zero bundle overhead, faster cold start on mobile (NFR-010).
- Native browser API — works identically across Chrome, Firefox, Safari, and mobile without OPFS/Worker setup.
- Dexie's `db.version(N).stores({}).upgrade(fn)` is the entire migration system; no custom migration runner (NFR-032).
- DevTools can inspect stored data directly — useful for debugging and user transparency (NFR-005).
- Phase 4 sync path is well-traveled: Dexie Cloud, ElectricSQL, and CRDT tooling target IndexedDB natively.

### Negative

- No relational integrity enforcement at the DB level — foreign key and cascade semantics must be handled in domain/application code.
- Ad-hoc aggregations require JavaScript scan + reduce instead of SQL; acceptable at current data scale.

### Neutral

- ADR-008 resolves to Path A (Dexie built-in versioning).
- Application-level encryption (NFR-043) would apply equally to either option if added later.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| SQLite-WASM (wa-sqlite + OPFS) | Full SQL and OPFS durability are attractive, but WASM bundle (~1–2 MB), OPFS Worker setup, and custom migration runner add complexity disproportionate to MVP data volume. Phase 4 sync is less mature for SQLite in browsers. Revisit if query complexity grows significantly with multi-household data or if a Tauri wrapper is adopted (Tauri has native SQLite). |
