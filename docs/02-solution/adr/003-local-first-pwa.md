# ADR-003: Local-First PWA Deployment Model

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

The deployment model must balance several competing concerns:

- **Privacy** (NFR-001 through NFR-007): Coordinate handles health, financial, and personal/family information — all high-sensitivity. The NFR architectural implication explicitly states that a local-first design "would substantially reduce the privacy burden" because "the operator never holds personal health or financial information."
- **Approachability** (G2): for general utility beyond the founder, users should not need to install native software.
- **Cost** (CON-004): founder-funded, no external capital. Operational costs must be near zero until G3 (sustainability).
- **Single-maintainer operability** (NFR-032): infrastructure must be minimal.
- **Multi-user support** (FR-044): Sobia (PER-002) as Contributor, Nadia (PER-005) as caregiver, multi-household context switching. This is Phase 4, not MVP.
- **Offline resilience** (NFR-052): in-progress data must survive crashes and unexpected exits.

### Options evaluated

1. **Hosted web app**: most approachable, but Coordinate holds all user data centrally — full privacy compliance burden, hosting costs, infrastructure to manage.
2. **Desktop app (Electron/Tauri)**: strongest privacy (data on device), but requires installation, app store distribution, and native packaging per platform.
3. **Local-first PWA**: app served as static files from a URL (approachable), data stored on-device in IndexedDB or SQLite-WASM (private), installable to home screen (optional), works offline via service worker.

## Decision

Deploy Coordinate as a **local-first Progressive Web App (PWA)**.

### MVP (Phase 1, G1 validation)

- All structured data (expenses, submissions, plan configuration, balance state) stored on-device using IndexedDB or SQLite-WASM (via OPFS for persistence).
- The application is served as static files — no backend server, no database, no API. Hosting is a static file host (e.g., GitHub Pages, Cloudflare Pages, Netlify).
- A service worker provides offline capability and caching.
- Supporting documents are stored by reference (NFR-051) — references point to local files or user's cloud storage.
- Single user, single device. No sync.

### Phase 4 (multi-user, G2)

- Add an optional sync layer for multi-user/multi-device scenarios. The sync mechanism (custom relay, CRDTs, or a light backend) is a future decision.
- Until sync exists, the Contributor receipt handoff (PER-002 scenarios) uses out-of-system channels (e.g., Sobia texts a photo to Ben, who enters it).

### Future optionality

- The same web frontend can be wrapped in Tauri for a native desktop app if needed.
- A hosted backend can be introduced behind the existing domain ports (ADR-001) without changing core logic.

## Consequences

### Positive

- Privacy is satisfied by architecture, not policy. User data never leaves the device. Most of NFR-001 through NFR-007 are satisfied by default.
- Operational cost is near zero — static hosting is free or negligible.
- No backend infrastructure to maintain (NFR-032).
- Offline-first means NFR-052 (crash resilience) is addressed by the storage model.
- Approachable: users visit a URL. Optional PWA install provides an app-like experience without an app store.

### Negative

- Multi-user and multi-device support requires a sync layer that doesn't exist yet. Phase 4 will need additional architectural work.
- Contributor receipt handoff (PER-002) is not directly supported until sync is built. Acceptable: it's a Phase 4 feature, and the out-of-system workaround mirrors the current real-world process.
- Data is on a single device in MVP — no backup unless the user exports (NFR-050). Must ensure export is easy and prominent.
- Browser storage quotas and eviction policies vary. OPFS (Origin Private File System) with SQLite-WASM is more durable than plain IndexedDB but adds complexity.

### Neutral

- PWA install is optional — users who prefer a browser tab get the same experience.
- The local-first architecture is the same architecture that would underpin a Tauri-wrapped desktop app, so no effort is wasted if the deployment model evolves.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Hosted web app | Places full privacy compliance burden on the operator. Requires backend infrastructure, database, and ongoing hosting costs — conflicts with CON-004. Premature for G1 validation. |
| Desktop app (Electron) | Solves privacy but requires installation, which reduces approachability for G2. Electron bundles are large and resource-heavy. Packaging and auto-update add maintainer burden. |
| Desktop app (Tauri) | Better than Electron (smaller, Rust backend), but still requires installation and per-platform builds. Can be added later as a wrapper around the PWA frontend if needed. Not rejected permanently — deferred. |
| Mobile-native app | Requires separate iOS/Android codebases or React Native. App store review adds friction. Overkill when a responsive PWA covers mobile use cases (receipt capture, status checks). |
