# Non-Functional Requirements

## Performance

Latency, throughput, and capacity targets.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
|    |             |          |                     |

## Scalability

Growth expectations and scaling strategy.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
|    |             |          |                     |

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
|    |             |          |                     |

### Architectural consideration: delegated authorization

Coordinate's multi-household model introduces a delegation pattern: a System User (e.g., an adult child) may manage a Household they have no insurance relationship with (see PER-005, FR-044). This is structurally similar to the problems addressed by the [User-Managed Access (UMA)](https://en.wikipedia.org/wiki/User-Managed_Access) extension to OAuth 2.0, where a resource owner authorizes a requesting party to act on their behalf across security boundaries.

At the requirements level, the key principles are:

- **Explicit consent**: A Household's existing Insurance Manager must explicitly grant access to another System User. No implicit access.
- **Scoped delegation**: Delegated access is scoped to a specific Household and a specific User Role (Insurance Manager or Contributor). It does not grant access to any other Household the grantor may belong to.
- **Revocability**: Delegated access can be revoked at any time by any Insurance Manager of the Household.
- **Auditability**: All delegation grants and revocations should be logged.

Whether the solution adopts UMA formally, uses a simpler RBAC-with-invitations model, or takes another approach is deferred to the solution phase. The requirement is that the delegation mechanism satisfies the principles above.

## Reliability / Availability

Uptime targets, recovery time objective (RTO), recovery point objective (RPO).

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
|    |             |          |                     |

## Usability / Accessibility

Standards and compliance targets (e.g., WCAG).

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
|    |             |          |                     |

## Maintainability

Code quality, observability, and documentation standards.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
|    |             |          |                     |

## Compliance / Regulatory

Legal, regulatory, and licensing requirements.

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-008 | **No-overclaim invariant** | The total amount reimbursed across all plans and HCSAs for a single expense must never exceed the original expense amount. This is a fundamental COB principle (combined reimbursement ≤ 100% of eligible expenses) and must be enforced as a system invariant. The system must validate this at claim submission time and prevent or warn before recording any amount that would cause the total to exceed the original. See FR-023 for the functional implementation. | Must | No expense record can have total reimbursed > original amount. Attempt to record excess triggers an error or confirmation-required warning. |
