# ADR-008: Schema Evolution Approach

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-17 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

The physical data model will evolve as implementation proceeds. A Flyway/Liquibase-style schema evolution approach is needed in the TypeScript/PWA ecosystem. The project has no backend — all data lives in the browser (ADR-003). The storage technology choice (Dexie.js vs SQLite-WASM) is still pending, and the migration approach differs meaningfully between them.

## Decision

Adopt a versioned migration convention with one file per migration, sequential integer prefix, and descriptive name. The implementation depends on the storage path chosen in the pending storage ADR:

### Path A — Dexie.js (IndexedDB): built-in versioning

Dexie's versioning system **is** the migration system — no third-party tool needed. Use `db.version(N).stores({...}).upgrade(fn)` for each schema change.

**File layout:**

```
src/infrastructure/db/
  schema.ts                  ← CoordinateDb extends Dexie; chains version(N) in order
  migrations/
    v001-initial-schema.ts   ← exported upgrade fn (if data migration needed)
    v002-add-foo-index.ts
  index.ts                   ← exports db singleton
```

**Convention:** All version blocks remain in the schema file permanently; they form the upgrade chain for users on old versions. Only indexed properties appear in the schema string; embedded JSON sub-entities (Submissions, PlanMemberships, etc.) need no schema entry.

### Path B — SQLite-WASM (wa-sqlite): custom lightweight runner

No established browser-compatible migration library exists for wa-sqlite. Use a ~80-line TypeScript migration runner with SQLite's `PRAGMA user_version`.

**File layout:**

```
src/infrastructure/db/
  schema.ts                       ← MigrationRunner class
  migrations/
    v001-initial-schema.sql.ts    ← exports { sql: string }
    v002-add-foo-index.sql.ts
  index.ts                        ← runs migrations on startup, exports db
```

**Convention:** Each migration exports a single SQL string. The runner reads `PRAGMA user_version`, executes pending migrations in order, and updates `user_version` after each.

## File Naming Convention

- One migration per file.
- Sequential integer prefix: `v001`, `v002`, etc.
- Descriptive suffix: `v001-initial-schema`, `v002-add-expense-category-index`.
- Extension: `.ts` for Dexie (upgrade fn) or `.sql.ts` for SQLite (SQL string export).

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Drizzle ORM migrations | Browser migration support is an open feature request; the standard migrate function depends on Node.js `fs` and `crypto`. Not stable for local-first PWA. |
| Liquibase / Flyway | JVM tools; no native TypeScript/browser support. |
| Schema-less (no migrations) | IndexedDB allows flexible keys, but structural changes (new indexes, new stores) still require explicit version bumps. SQLite requires DDL for schema changes. |

## Consequences

### Positive

- Version history is explicit and reviewable (Git).
- Both paths avoid external migration dependencies.
- Convention survives into implementation phase; storage ADR can reference this ADR.

### Negative

- SQLite path requires ~80 lines of custom migration runner code.
- Dexie path: all version blocks must stay in the schema file forever (no "pruning" of old versions).

### Neutral

- ADR-009 selects IndexedDB via Dexie.js; implement Path A.
- Data model changes that only affect embedded JSON (e.g., adding a field to Submission) may not require a migration — depends on whether the storage adapter validates structure.
