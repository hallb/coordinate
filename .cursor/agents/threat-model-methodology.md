# Threat Modeling Methodology Reference

Reference for the `threat-model` subagent. Read this when performing STRIDE analysis or privacy review.

## STRIDE Categories


| Category                   | Question                                        | Coordinate-Specific Focus                                                                                                             |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Spoofing**               | Can an attacker masquerade as someone else?     | Device/user identity, Household membership, impersonation of Insurance Manager vs Contributor                                         |
| **Tampering**              | Can an attacker modify data or code?            | On-device storage (IndexedDB, SQLite), PWA bundle from static host, document references, browser extension messaging                  |
| **Repudiation**            | Can an attacker deny having done something?     | Audit trail for delegation grants/revocations (NFR-044), claim submission history, who recorded outcomes                              |
| **Information Disclosure** | Can an attacker access data they shouldn't?     | Household data isolation (NFR-045), cross-household leakage, document references, insurer portal session data, extension-scraped data |
| **Denial of Service**      | Can an attacker disrupt availability?           | Local storage exhaustion, service worker lifecycle, PWA offline capacity, static host availability                                    |
| **Elevation of Privilege** | Can an attacker gain privileges they shouldn't? | Contributor escalating to Insurance Manager, cross-household access, extension acting outside Household context                       |


## Trust Boundaries (Coordinate)

- **Browser sandbox** — PWA runs in user's browser; same-origin policy, CSP, IndexedDB isolation
- **Local filesystem** — CLI and PWA read/write storage; document references may point to local paths
- **HTTPS to static host** — PWA bundle served over TLS; no dynamic server-side logic for MVP
- **Insurer portal sessions** — User's authenticated session; extension piggybacks; never through Coordinate
- **Document storage** — Local paths or cloud URLs (Dropbox, iCloud); references only, Coordinate does not store document bytes
- **Extension ↔ PWA** — Messaging boundary; extension and PWA are separate origins for Phase 6

## LINDDUN Privacy Lens

For health and financial data under Canadian privacy law (PIPEDA, PHIPA, Law 25). Use as a secondary pass after STRIDE.


| Category                      | Question                                                           | Coordinate Focus                                                    |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **Linkability**               | Can data from different contexts be linked to the same individual? | Household scoping, Person IDs across aggregates                     |
| **Identifiability**           | Can individuals be identified from the data?                       | Person, Household, plan holder names; EOBs and receipts             |
| **Non-repudiation**           | Can actions be tied to individuals?                                | Delegation logs, submission records                                 |
| **Detectability**             | Can the presence of data be inferred?                              | Storage enumeration, document reference resolution                  |
| **Disclosure of information** | Is sensitive data exposed to unintended parties?                   | NFR-045, cross-household flows                                      |
| **Unawareness**               | Are users unaware of data collection/use?                          | NFR-005, NFR-001; consent and transparency                          |
| **Non-compliance**            | Does handling violate retention or purpose limits?                 | NFR-006 (CRA 6–7 year receipt retention); NFR-002 data minimization |


## Severity Rationale

- **H (High)**: Likely impact on confidentiality, integrity, or availability of health/financial data; violates Must NFRs
- **M (Medium)**: Moderate impact; affects Should NFRs or future phases (e.g., extension, sync)
- **L (Low)**: Minor impact; edge cases, theoretical, or well-mitigated by design

## Reference Documents

- `docs/02-solution/02-architecture.md` — C4 diagrams, containers, components
- `docs/02-solution/03-data-model.md` — Aggregates, Household boundary
- `docs/01-requirements/06-non-functional-requirements.md` — NFR-040 through NFR-045, NFR-001–007
- `docs/02-solution/adr/005-browser-extension-insurer-automation.md` — Extension risks
- `docs/02-solution/adr/006-ai-optional-adapter.md` — AI adapter privacy considerations

