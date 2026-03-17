# ADR-010: Single-Operator Model for MVP; Multi-User Deferred

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-17 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

The requirements describe multi-user access: SystemUser (GLO-006), UserRole (InsuranceManager / Contributor), ABAC, delegation principles (NFR-044), and authentication (NFR-040). Personas PER-002 (Sobia) and PER-005 (Nadia/Fatima) describe scenarios where multiple people interact with the same household data.

The local-first PWA architecture (ADR-003) has no backend server, no identity provider, and no sync layer. Data lives in IndexedDB on the user's device. Application-level authorization cannot be enforced in a client-side-only app — anyone with device access has full access to the data via the browser.

This ADR formalises the deferral of multi-user concepts from the MVP solution design.

## Decision

MVP uses a **single-operator model**.

- One person (the **Operator**) uses the PWA on their device with unrestricted access to all data.
- No authentication, no authorization, no roles. Household context switching is UI navigation, not an access control decision.
- The data model does not include SystemUser, UserRole, or identity references. The Operator concept replaces InsuranceManager/Contributor for Phase 1.
- NFR-040 (authentication) and NFR-044 (delegation principles) are Phase 4 requirements; they are not satisfiable in the current architecture.

## Seams Preserved for Phase 4

The current design leaves extension points for multi-user access when Phase 4 is implemented:

- **Person as a separate aggregate** — can accept an identity reference (e.g. `systemUserId`) later without restructuring.
- **HouseholdMembership as a join entity** — can accept a role field when UserRole becomes meaningful.
- **Domain events** from the claim state machine (ADR-002) — provide a hook for sync; effects are already returned by the state machine.
- **Household as data scoping boundary** — in MVP it's a UI/organisation concern; it becomes an access control boundary when enforcement exists (server or sync layer).

## Triggers for Revisiting

- Phase 4 kickoff.
- Sync layer architecture decision (relay, CRDTs, or backend).
- Any decision to introduce a backend or identity provider.

## Consequences

### Positive

- Solution docs (data model, architecture, security) describe only what is being built. No phantom concepts.
- Implementation stays aligned with the local-first architecture. No code paths for authentication or authorization that cannot be enforced.
- Phase 4 design remains open — sync mechanism and identity approach are not pre-committed.

### Negative

- PER-002 (Sobia) and PER-005 (Fatima contributor access) scenarios are not directly supported until Phase 4. Out-of-system workarounds (e.g. Sobia texts a photo to Ben) remain the path.

### Neutral

- Requirements (personas, FR-044, NFR-040, NFR-044) remain aspirational. They describe desired end-state behavior; the mechanism is deferred.
- The Operator concept is explicit in the architecture; future phases add SystemUser/UserRole on top of it.
