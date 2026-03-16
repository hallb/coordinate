# Non-Functional Requirements

## Performance

This is a personal/family tool with single-digit concurrent users per household and low data volume. Performance targets are UX quality bars, not SLAs.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-010 | Core interactions (expense entry, dashboard load, search/filter, routing recommendation) must be responsive. Target: < 1 s for local operations; < 3 s for operations involving external services (e.g., insurer status retrieval). | Should | Measured against the stated targets under realistic single-household data volume. |
| NFR-011 | Batch operations (year-end report export, bulk document export) may exceed the targets above but must show visible progress and remain cancellable. | Should | User can cancel any batch operation in progress. Progress is visible throughout. |

## Scalability

Growth expectations and scaling strategy.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-020 | The system must support growth from G1 (single household) to G2 (tens to hundreds of households) without requiring re-architecture. Per-household data volume is small (hundreds of expenses/year, dozens of documents). The scaling strategy -- horizontal, local-first sync, etc. -- is deferred to the solution phase and depends on the architectural model chosen. | Should | Adding new households does not degrade performance for existing households. |

## Privacy

Coordinate handles three categories of sensitive data simultaneously: **health information** (implied by claim types -- dental procedures, prescriptions, paramedical visits), **financial information** (claim amounts, reimbursements, plan balances, HCSA allocations), and **personal/family information** (dependents, relationships, birthdays, employment details).

Rather than targeting specific regulations (PIPEDA, PHIPA, Law 25, etc.), privacy requirements are framed as principles. These principles are consistent across all relevant Canadian federal and provincial privacy legislation. Adherence to them is designed to satisfy regulatory requirements regardless of jurisdiction, while leaving room for architectural decisions (e.g., local-first or self-hosted designs) that can reduce the compliance burden by minimizing the trust surface.

| ID | Principle | Requirement | Priority |
|----|-----------|-------------|----------|
| NFR-001 | **Consent and purpose limitation** | Users must understand exactly what data is collected and why. Data is used solely for claim management and related functions described in the vision (tracking, routing, utilization awareness, unreimbursed expense summaries). No secondary use without explicit consent. | Must |
| NFR-002 | **Data minimization** | Collect only the data necessary to route, track, and manage claims. Do not store information that isn't required for the system's stated purpose. | Must |
| NFR-003 | **User control and portability** | Users can view, export, and delete their data at any time. No lock-in. Users retain ownership of their data regardless of the deployment model. | Must |
| NFR-004 | **Security safeguards** | Technical and organizational measures must be appropriate to the sensitivity of the data (health + financial = high sensitivity). Specific controls are deferred to the Security section and solution design. | Must |
| NFR-005 | **Transparency** | The system must be clear about where data is stored, how it is processed, and who (or what services) can access it. No hidden data flows. | Must |
| NFR-006 | **Retention limits** | Data should not be retained longer than necessary. Note: CRA requires supporting documents (receipts) be kept for 6-7 years, which establishes a practical floor for retention of claim-related records. | Must |
| NFR-007 | **Accountability** | There must be a clear responsible party for data handling. In a self-hosted model, that is the user. In a hosted model, that is the operator. | Must |

### Architectural implication

The privacy principles above intentionally favour architectures that minimize centralized data collection. A local-first or self-hosted design where sensitive data remains on the user's own device or infrastructure would substantially reduce the privacy burden -- the operator never holds personal health or financial information, and most of the principles above are satisfied by default. This should be weighed as a significant factor in architectural decisions during the solution phase.

## Security

Authentication, authorization, and data protection requirements.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-040 | Coordinate must authenticate users before granting access to any Household data. The authentication mechanism (password + MFA, passkeys, OAuth with an identity provider, device-level auth) is deferred to the solution phase and depends on the architectural model. | Must | No Household data is accessible without a successful authentication step. |
| NFR-041 | Coordinate must never store, transmit, or log insurer or HCSA/PHSP portal credentials. When portal interaction is required (FR-091, FR-092), it must occur in a session controlled by the user (e.g., their own browser) or via a mechanism that does not route credentials through Coordinate. | Must | No insurer credential appears in Coordinate's data store, logs, or network traffic. Automated portal interactions operate in the user's own authenticated session. |
| NFR-042 | All data in transit between the user and Coordinate, and between Coordinate and any external service it calls, must be encrypted using current TLS standards. | Must | No plaintext data transmission on any network path. |
| NFR-043 | Structured data at rest (expenses, submissions, plan configuration, balance state) must be protected at rest. The specific mechanism (full-disk encryption, application-level encryption, database encryption) depends on the deployment model and is deferred to the solution phase. | Must | Structured data at rest is encrypted. The key material is not co-located with the data in a way that defeats the protection. |
| NFR-044 | The four delegated authorization principles from the architectural consideration below (explicit consent, scoped delegation, revocability, auditability) are security requirements, not advisory. They apply regardless of implementation mechanism. | Must | Delegation grants and revocations are logged. Access cannot be granted implicitly. Delegated access cannot exceed the scope of the granting Household and role. |

### Architectural consideration: delegated authorization

Coordinate's multi-household model introduces a delegation pattern: a System User (e.g., an adult child) may manage a Household they have no insurance relationship with (see PER-005, FR-044). This is structurally similar to the problems addressed by the [User-Managed Access (UMA)](https://en.wikipedia.org/wiki/User-Managed_Access) extension to OAuth 2.0, where a resource owner authorizes a requesting party to act on their behalf across security boundaries.

At the requirements level, the key principles are:

- **Explicit consent**: A Household's existing Insurance Manager must explicitly grant access to another System User. No implicit access.
- **Scoped delegation**: Delegated access is scoped to a specific Household and a specific User Role (Insurance Manager or Contributor). It does not grant access to any other Household the grantor may belong to.
- **Revocability**: Delegated access can be revoked at any time by any Insurance Manager of the Household.
- **Auditability**: All delegation grants and revocations should be logged.

Whether the solution adopts UMA formally, uses a simpler RBAC-with-invitations model, or takes another approach is deferred to the solution phase. The requirement is that the delegation mechanism satisfies the principles above.

## Reliability / Availability

Coordinate is not the authoritative source for any data it holds. Receipts exist physically, in email, or as photos on device; claim records exist in insurer systems; plan details exist in plan booklets and insurer portals. Structured data held by Coordinate (expenses, submissions, plan configuration, balance state) is reconstructable from those primary sources, though with effort. This shapes the durability posture: data loss is painful but not catastrophic. Brief availability downtime is tolerable in a way that silent data loss is not.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-050 | Structured data must have a documented, user-initiated export path in a portable format. Users must be able to back up, migrate, or reconstruct records without Coordinate being the only copy and without vendor lock-in. | Must | A full data export can be performed by the user at any time. The export format is documented and human-readable (e.g., CSV or JSON). |
| NFR-053 | Coordinate must support importing structured data from the same portable format used for export (NFR-050). Import must validate data integrity, report conflicts or duplicates, and allow the user to resolve them before committing. This enables batch seeding of historical data, migration between deployment models (e.g., CLI to PWA), and restore from backup. | Should | Data exported from one Coordinate instance can be imported into another. Import validates referential integrity and surfaces conflicts. No silent data loss or duplication on import. |
| NFR-051 | Supporting documents are stored by reference (path to a local file, or URL to the user's cloud store such as Dropbox or iCloud). Coordinate must not silently fail when a referenced document is no longer accessible. Broken references must be surfaced as visible warnings on the affected expense or submission. | Should | If a referenced document cannot be accessed, the expense or submission displays a clear warning. No silent failure or data corruption. |
| NFR-052 | In-progress data (an expense being entered, a submission being recorded) must be persisted before the user is asked to perform any external action (e.g., log into an insurer portal). Coordinate must not lose user-entered data due to a crash or unexpected exit during the claim workflow. | Should | Data entered by the user survives an application crash at any point in the expense entry or submission workflow. |

## Usability / Accessibility

The user base spans technically proficient Insurance Managers (Ben), low-engagement Contributors (Sobia), and potentially elderly or less tech-savvy users (Fatima via PER-005). The Contributor flow and caregiver-recipient flow must be as simple as possible. Where a UI can be simple or complex, prefer simple. Progressive disclosure of complexity is preferred over upfront comprehensiveness. The system must explain itself -- no insurance domain expertise should be required.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-060 | The application must conform to [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/). Conformance must be verifiable with automated tools (e.g., axe, Lighthouse, Pa11y) integrated into the CI/CD pipeline (NFR-032). | Must | Automated accessibility scan passes at WCAG 2.1 AA in CI. No known AA violations in production. |
| NFR-061 | The UI must be responsive and designed mobile-first. Receipt capture (FR-002, FR-061) and Contributor interactions are primary mobile use cases. | Must | Core flows (expense entry, receipt capture, claim status check) are fully functional on a mobile viewport without horizontal scrolling or unusably small touch targets. |
| NFR-062 | The application must not obstruct platform-native voice-to-text input on any text field. Users on iOS, Android, macOS, and Windows must be able to use their platform's dictation feature for data entry without interference. | Should | Voice dictation via the platform's native mechanism successfully populates text fields in the application. |
| NFR-063 | User-facing documentation must be structured according to the [Diátaxis framework](https://diataxis.fr/), comprising four clearly distinguished types: **tutorials** (learning-oriented; onboarding new users), **how-to guides** (task-oriented; e.g., "submit a claim for a dependent after the primary pays"), **reference** (information-oriented; e.g., claim states, COB rules, plan types), and **explanation** (understanding-oriented; e.g., "why does the birthday rule exist"). Each documentation artefact must clearly belong to one type. | Must | All published documentation artefacts are tagged with their Diátaxis type. No artefact mixes types (e.g., no tutorial that is also a reference page). |

## Maintainability

Standards for a founder-built product that must remain sustainable for a single maintainer over the long term (G3).

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-030 | Core business logic must have automated regression tests: routing engine, balance tracking, COB priority rules, grace period handling, and the no-overclaim invariant (NFR-008). Coverage percentage is deferred to the solution phase; the requirement is that every critical decision path has at least one test. | Must | No regression in critical paths is introduced without a failing test to catch it. |
| NFR-031 | Observability: structured logging, error tracking, and health checks must be sufficient to diagnose issues in production without accessing user data (consistent with NFR-002 and NFR-005). | Must | A production issue can be reproduced and diagnosed from logs and error reports alone, without querying user records. |
| NFR-032 | Deployment must be repeatable and operable by a single maintainer. CI/CD pipeline with automated build, test, and deploy steps; infrastructure defined as code; no manual deployment steps. | Must | A fresh deployment can be completed from source without manual intervention. |
| NFR-033 | Significant architectural decisions are recorded (ADRs or equivalent). API contracts and the domain model are kept in sync with the glossary. | Should | New contributors can understand key design decisions and the domain model without asking the author. |
| NFR-034 | Core claim lifecycle operations (expense entry, routing, submission recording, outcome recording, balance queries) must be operable via a non-interactive command-line interface, enabling scripted workflows, batch data import, and domain validation without a graphical UI. | Should | All Phase 1 use cases can be executed end-to-end via CLI commands. CLI output is machine-parseable (e.g., JSON). |

## Compliance / Regulatory

Legal, regulatory, and licensing requirements.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-008 | **No-overclaim invariant**: Total reimbursement across all plans and HCSAs for a single expense must never exceed the original expense amount (combined reimbursement ≤ 100% of eligible expenses). This is a system invariant enforced at claim submission time. See FR-023. | Must | No expense record can have total reimbursed > original amount. Attempt to record excess triggers an error or confirmation-required warning. |
