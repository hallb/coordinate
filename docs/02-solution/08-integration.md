# Integration and External Systems

Coordinate MVP has no runtime integrations — no external APIs, no webhooks, no message queues, no server-to-server communication. The application runs entirely in the user's browser with all data on-device (ADR-003). This document maps the integration surfaces that exist today and those planned for future phases.

## Integration Map

| System | Direction | Phase | Pattern | Purpose |
|--------|-----------|-------|---------|---------|
| GitHub Pages | Outbound (deploy) | **MVP** | Static file deploy via GitHub Actions | Serves the PWA bundle over HTTPS |
| User's document storage (local filesystem, Dropbox, iCloud, Google Drive) | Read (by reference) | **MVP** | URI resolution (best-effort) | Document references point to user-controlled storage; Coordinate stores URIs, not bytes (NFR-051) |
| Insurer portals (Sun Life, Manulife, Blue Cross, Great-West Life, etc.) | None (manual) | **MVP** | User navigates portals in a separate browser tab | Coordinate provides routing guidance; the user performs submission manually |
| Insurer portals | Read | Phase 6 | Browser extension content script scrapes status from portal DOM | Automated claim status retrieval (FR-091) |
| Insurer portals | Write | Phase 6 | Browser extension fills and submits portal forms | Automated claim submission (FR-092) |
| Sync relay service | Bidirectional | Phase 4 | TBD (CRDT-based sync or lightweight relay) | Multi-device, multi-user data synchronization |
| AI service (optional) | Outbound | Future | REST API behind a domain port (ADR-006) | Document parsing (receipt OCR), portal navigation assistance |

## Integration Patterns

### MVP: Document reference resolution

The only integration-like behaviour in MVP is the Document Reference Adapter, which checks whether a referenced document URI is accessible.

- **HTTPS URLs** (cloud storage links): A `HEAD` request checks reachability. This is best-effort — no retries, no caching of results. A failed check surfaces a visible broken-reference warning on the affected expense or submission (NFR-051).
- **Local filesystem paths** (`file://` URIs): Browser security restrictions prevent programmatic validation of local file paths. These references are stored as-is; the user is responsible for ensuring the file exists. No reachability check is performed.
- **No proxy or relay**: Coordinate never fetches, caches, or transmits document content. The reference is a pointer; the user opens the document in their own storage application.

### Future: Browser extension messaging (Phase 6)

The browser extension communicates with the PWA via the browser's extension messaging API (`chrome.runtime.sendMessage` / `chrome.runtime.onMessageExternal`). The extension operates in the user's own authenticated insurer portal session — Coordinate never handles insurer credentials (NFR-041, ADR-005). Message types and the contract schema will be defined when the extension is designed.

### Future: Sync protocol (Phase 4)

The sync mechanism (CRDT-based, operational transform, or lightweight relay) is TBD. The choice depends on architectural decisions not yet made (see ADR-010 design debt note). The sync protocol will define conflict resolution, message ordering, and authentication. Integration details will be documented when the sync service is designed.

## Contract / Schema Management

Not applicable for MVP — there are no external contracts. Internal storage schema evolution is handled by Dexie's built-in versioning ([ADR-008](adr/008-schema-evolution.md)).

When external interfaces are introduced:

- **Browser extension messaging API** (Phase 6): Message types will be defined as TypeScript interfaces in a shared package, versioned alongside the extension and PWA.
- **Sync protocol** (Phase 4): Schema versioning for sync messages will follow the same flyway-style approach used for storage migrations (ADR-008).

## Error Handling and Resilience

Not applicable for MVP — the application originates no network calls beyond the best-effort document reference check described above. There are no retries, circuit breakers, or dead-letter queues.

When network-dependent integrations are introduced:

- **Phase 6 (browser extension)**: Portal scraping is inherently fragile (CON-002). The extension must handle DOM changes gracefully — a failed scrape surfaces a user-visible error rather than silently returning stale data. Guided manual submission (FR-090) remains the reliable fallback.
- **Phase 4 (sync)**: The sync layer must handle intermittent connectivity (offline-first by design), conflict resolution, and partial sync failures. Resilience strategy will be defined alongside the sync architecture.
