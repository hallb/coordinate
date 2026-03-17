# ADR-007: CLI Dropped; PWA Sole Entry Point

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-17 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

NFR-034 (subsequently removed) required a non-interactive command-line interface for scripted workflows, batch data import, and domain validation without a graphical UI. The original architecture (ADR-001, ADR-003) had the CLI as a second entry point with its own SQLite/JSON data store, sharing only the domain and application layers with the PWA.

Having two deployment targets with separate data stores creates divergence: the CLI and PWA data can drift, and reconciling them via import/export (NFR-050, NFR-053) is poor UX. Export/import is acceptable for backup and migration but not as the primary bridge between two operational interfaces.

## Decision

Drop the CLI. The PWA is the sole entry point; IndexedDB via Dexie.js is the sole data store (ADR-009).

## Alternatives Explored and Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| **Shared SQLite via File System Access API** | PWA uses SQLite-WASM with a user-selected directory; CLI reads/writes the same file. Single store, no sync. But: File System Access API is Chrome/Edge only; forces SQLite-WASM (eliminates IndexedDB option); per-session permission friction; PWA and CLI cannot write concurrently (acceptable in practice, but adds constraint). |
| **Local server owns SQLite; PWA and CLI are thin clients** | Node.js server on localhost owns the data; both PWA and CLI connect over HTTP/WebSocket. Single store, headless CLI works. But: requires installation; PWA no longer static-only; violates "no backend" constraint from ADR-003; offline PWA depends on server running. |
| **CLI launches HTTP relay; PWA (IndexedDB) is data owner** | CLI server relays commands via WebSocket to the PWA; PWA executes use cases against IndexedDB and returns results. IndexedDB stays sole store; PWA single mode. But: browser tab must be open for any CLI command to work (IndexedDB is browser-sandboxed; no local IPC to service workers). Rules out unattended/cron automation. |
| **Web Push to wake service worker** | CLI could POST to a push service to wake the service worker, which accesses IndexedDB. But: Web Push routes through Google FCM / Mozilla Autopush; violates local-first privacy principle; adds cloud dependency for local IPC. |

## Consequences

### Positive

- Single data store; no divergence; no import/export as operational bridge.
- Simpler architecture: one entry point, one storage adapter, one deployment model.
- Aligns with ADR-003 (local-first PWA): approachable via URL, no installation required.
- Reduces implementation and maintenance surface.

### Negative

- No scripted workflows or batch import via CLI.
- No headless domain validation (e.g., CI pipeline) without the PWA.
- Power users who want to pipe data must use export (NFR-050) and their own scripts against the exported JSON/CSV.

### Neutral

- Batch data entry: NFR-053 (import) is retained. Users can import via the PWA’s import UI for historical seeding and restore.
- Periodic tasks (alerts, balance checks): Periodic Background Sync (where supported) can run in the service worker without a tab open; timing is browser-controlled, not user-controlled.
- If CLI becomes necessary later, ADR-007 does not preclude revisiting — the options above are documented for future reference.
