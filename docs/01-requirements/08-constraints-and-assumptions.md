# Constraints, Assumptions, and Dependencies

## Constraints

Limitations that bound the solution space.

| ID | Type | Constraint | Impact |
|----|------|-----------|--------|
| CON-001 | Regulatory | Canadian privacy legislation (PIPEDA, PHIPA, Law 25) governs the handling of personal health and financial information. Principles-based NFRs (NFR-001 through NFR-007) are designed to satisfy all applicable frameworks. | Shapes data architecture, storage, and retention. Favours local-first or self-hosted designs that minimise the trust surface. |
| CON-002 | Technical | Major Canadian insurers do not offer public APIs for claim submission or status retrieval. Portal UIs change without notice. | Insurer automation (FR-091, FR-092) feasibility is insurer-specific and fragile. Guided manual submission (FR-090) must be the reliable baseline. |
| CON-003 | Technical | Insurer portals require per-user authentication, often with SMS-based 2FA tied to the plan holder's device. | Coordinate cannot authenticate to insurer portals on the user's behalf (NFR-041). Any automation must operate in the user's own authenticated session. |
| CON-004 | Budget | Founder-built product with no external funding. Development and operational costs must be absorbed personally until G3 (sustainability) is reached. | Favours low-operational-cost architectures. Limits scope of each phase. Single-maintainer operability is a hard requirement (NFR-032). |
| CON-005 | Regulatory | CLHIA Guideline G4 defines COB priority rules for Canadian group plans. Coordinate's routing engine must conform to these rules. | Routing logic is not arbitrary -- it must implement employee-first, birthday rule, and duration-of-coverage tiebreaker as specified by CLHIA. Changes to the guideline require corresponding updates. |
| CON-006 | Regulatory | CRA defines eligible expenses for HCSA and PHSP reimbursement. | Plan configuration and HCSA claim validation must respect CRA-eligible expense categories. Changes to the eligible expense list require updates. |

## Assumptions

Things assumed to be true that could invalidate plans if proven wrong.

| ID | Assumption | Risk if Wrong | Validation Plan |
|----|------------|---------------|-----------------|
| ASM-001 | CLHIA Guideline G4 COB rules are stable and will not change materially during initial development. | Routing engine logic would need to be reworked. | Monitor CLHIA publications. Design routing rules as configurable data, not hard-coded logic. |
| ASM-002 | Families typically have 2-4 insurance plans (including HCSAs). Extreme plan counts (10+) are not a target use case. | UI and routing complexity could exceed design assumptions. | Validate with PER-001 through PER-005 plan configurations. |
| ASM-003 | Users will manually enter expense and submission data for the MVP. Automated data capture (OCR, insurer API) is a future enhancement, not a prerequisite. | If manual data entry is too burdensome, adoption will fail regardless of routing intelligence. | Measure time-on-task during G1 validation. If excessive, prioritise FR-003 (smart suggestions) and FR-091 (status retrieval). |
| ASM-004 | Supporting documents (receipts, EOBs) will continue to exist in their original form (physical, email, photo) outside of Coordinate. Coordinate is not the sole custodian. | If users discard originals after linking in Coordinate and a reference breaks, they lose their only copy. | NFR-051 surfaces broken references. Documentation should warn users not to treat Coordinate references as archival storage. |
| ASM-005 | The Canadian personal insurance market is large enough and the pain point acute enough to reach G2 (general utility) beyond the founder. | Product remains a personal tool with no path to G3/G4. | Validate with early adopters outside the founder's household after MVP. |
| ASM-006 | Users trust the system's COB routing recommendations. If they routinely override, the routing engine adds complexity without value. | Routing engine becomes unused overhead. | Track override rate during G1 validation. If high, investigate whether the rules are wrong or the UX needs improvement. |

## External Dependencies

External systems, standards, or third-party services this project depends on.

| ID | Dependency | Type | Notes |
|----|------------|------|-------|
| DEP-001 | CLHIA Guideline G4 | Standards | Defines COB priority rules. Changes are infrequent but must be tracked. |
| DEP-002 | CRA eligible expense list | Regulatory | Defines what HCSAs and PHSPs can reimburse. Updated periodically by CRA. |
| DEP-003 | Insurer portals (Sun Life, Manulife, Blue Cross, Desjardins, Great-West Life, etc.) | Technical | Submission channels and status retrieval surface. No SLA or stability guarantee. |
| DEP-004 | HCSA/PHSP administrator portals (Coastal HSA, Benecaid, Olympia Benefits, etc.) | Technical | Final-step submission channel for spending accounts. Same stability concerns as insurer portals. |
| DEP-005 | User's cloud storage (Dropbox, iCloud, Google Drive) | Technical (optional) | If the user chooses cloud-based document references (NFR-051), Coordinate depends on the availability and link stability of the user's chosen service. |
