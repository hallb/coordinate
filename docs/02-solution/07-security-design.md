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

Encryption at rest and in transit; key management. (To be expanded per NFR-043.)

## Audit and Logging

What is logged, retention, and compliance requirements.
