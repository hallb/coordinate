# Security Design

This document describes the security posture for the **current implementation target** (MVP, Phase 1). Phase 4 multi-user security (authentication, authorization, delegation) is deferred; see ADR-010.

## Threat Model (MVP)

The MVP is a local-first PWA with no backend. The primary threat is **device-level access**: anyone with access to the device (and thus the browser) has full access to IndexedDB and all stored data. Application-level authentication cannot enforce a security boundary — data is accessible via browser dev tools regardless of any UI gate.

**Implications:**
- Device screen lock (OS-level) is the only access control. This is outside Coordinate's scope.
- Shared devices (e.g. family laptop) mean shared data access. No per-user isolation.
- Stolen or lost devices expose all data until the user exports and deletes, or the browser profile is cleared.

## Authentication (MVP)

No authentication. The Operator (the person using the PWA) has unrestricted access. There is no login flow, no identity provider, no session management. Phase 4 will introduce authentication (NFR-040); the mechanism depends on the sync layer architecture decision.

## Authorization (MVP)

No authorization model. The Operator can view and modify all Household data on the device. Household context switching is UI navigation — selecting which Household's data to display — not an access control decision.

**Household as data scoping boundary.** Coverage data (benefit limits, utilization, claim status, browser-extension-scraped data) is scoped to the Household that owns the Coverage. The UI presents one Household's data at a time; data from one Household is not shown when operating in another context. This is organisational scoping, not enforcement — the Operator can switch contexts and access everything. Cross-household information flows occur only through user-initiated document sharing (EOBs, receipts), not through shared plan data (NFR-045).

**Phase 4.** The requirements describe an ABAC model (Household × User Role, NFR-044, NFR-045). When a sync layer and identity system exist, the Household becomes an access control boundary and the permission matrix (Insurance Manager, Contributor) applies. See the NFR delegated authorization section for the principles.

## Data Protection

### Data at rest (MVP)

IndexedDB data is not encrypted at the application level for MVP. Protection relies on three complementary mechanisms:

1. **Local-first architecture**: All data stays on the user's device (ADR-003). No sensitive data is transmitted to or stored on any server. The attack surface is limited to the physical device and the browser profile.
2. **Browser same-origin policy**: IndexedDB stores are scoped to the application's origin. No other website or application can read or write Coordinate's data through the browser.
3. **OS-level full-disk encryption**: FileVault (macOS), BitLocker (Windows), and LUKS (Linux) encrypt the entire disk at rest, including the browser profile directory that contains IndexedDB files. On mobile, iOS and Android enable device encryption by default.

NFR-043 requires structured data at rest to be protected with key material not co-located with the data. For MVP, OS-level encryption satisfies this — the encryption key is derived from the user's device password and managed by the OS, not stored alongside the database files. This is a known limitation: if OS-level encryption is disabled, IndexedDB data is readable by anyone with filesystem access to the browser profile.

**Application-level encryption** (e.g., AES-GCM via Web Crypto API, applied through a Dexie middleware that encrypts values before storage) is deferred. It adds key-management complexity — where to store the encryption key in a client-side-only app — without meaningfully improving security when the browser profile itself is accessible to anyone with device access. This decision is revisited when a sync layer (Phase 4) introduces data transmission, at which point end-to-end encryption of synced data becomes relevant.

### Data in transit (MVP)

No application data is transmitted over a network for MVP. The only network interaction is serving the PWA bundle itself:

- **PWA bundle**: Served over HTTPS from the static host (GitHub Pages). TLS protects the bundle in transit (NFR-042).
- **Document references**: When a user references documents stored in cloud storage (Dropbox, iCloud, Google Drive), those references resolve via the provider's own HTTPS connections. Coordinate does not proxy or relay document content.
- **Insurer portals**: The user navigates to insurer portals in a separate browser tab. No data flows between Coordinate and insurer portals in MVP.

### Insurer credentials

Coordinate never stores, transmits, or logs insurer or HCSA/PHSP portal credentials — in any phase (NFR-041). When portal automation is introduced (Phase 6), the browser extension operates within the user's own authenticated browser session. Credentials are handled entirely by the browser and the insurer's authentication flow.

### Document references

Coordinate stores document URIs (filesystem paths or cloud URLs), not document bytes. The security of referenced documents — access control, encryption, retention — is the responsibility of the user's chosen storage. This is by design: Coordinate is not a document vault (NFR-051).

### Future (Phase 4+)

When a sync layer introduces data transmission between devices, the data protection posture must be revisited:

- End-to-end encryption of synced data so the relay service cannot read cleartext.
- Key management for multi-device access (key exchange or device-specific keys).
- Application-level encryption of IndexedDB may become warranted if the sync layer stores data in a server-side database.

## Audit and Logging

### MVP

There is no server and therefore no server-side logging. The audit and logging posture for MVP is minimal and development-oriented:

- **Structured console logging**: Domain events (expense created, state transition, outcome recorded) are logged to `console` with structured metadata (aggregate ID, timestamp, event type) during development. These logs are not persisted and are not available in production unless the user opens browser dev tools.
- **No persistent audit log**: There is no on-device audit trail of user actions. All data mutations are reflected in the current state of aggregates in IndexedDB, but there is no append-only event log or change history.

### Error reporting

- **React error boundary**: Unhandled rendering errors are caught by a top-level error boundary that displays a fallback UI and logs the error with a stack trace.
- **Optional opt-in error reporting**: A client-side error reporting service (e.g., Sentry free tier) may be integrated with explicit user consent (NFR-001). Error reports must not contain PII — no expense amounts, person names, insurer names, or document URIs. Only stack traces, component names, and browser metadata are transmitted.
- **Data export for reproduction**: When a user reports an issue, the data export feature (NFR-050) allows them to share a full or sanitized dataset for local reproduction by the maintainer.

### Observability alignment (NFR-031)

NFR-031 requires diagnosing production issues without accessing user data. For a local-first PWA with no server, "production issues" manifest as user-reported bugs. The observability strategy is:

1. Error boundary captures and displays the error context.
2. Optional Sentry reports provide stack traces without PII.
3. Data export enables reproduction with the user's consent.

This satisfies NFR-031 for MVP. Server-side structured logging, health checks, and uptime monitoring become relevant when a sync service exists (Phase 4).

### Future (Phase 4+)

- **Delegation audit log**: All delegation grants and revocations must be logged (NFR-044). This requires a persistent, append-only audit log — likely server-side, co-located with the sync service.
- **Data access logging**: Access to Household data by delegated users should be logged for accountability (NFR-007).
- **Retention**: Audit log retention policy to be defined alongside the sync service architecture.
