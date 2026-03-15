# Stakeholder Register

## Stakeholders


| ID      | Stakeholder                             | Type               | Interest | Influence |
| ------- | --------------------------------------- | ------------------ | -------- | --------- |
| STK-001 | Plan members (families)                 | Primary user       | High     | High      |
| STK-002 | Insurers                                | Affected party     | Medium   | High      |
| STK-003 | HCSA/PHSP administrators                | Affected party     | Medium   | High      |
| STK-004 | Privacy regulators (PIPEDA, provincial) | Regulatory         | Low      | High      |
| STK-005 | CLHIA                                   | Standards body     | Low      | High      |
| STK-006 | CRA                                     | Regulatory         | Low      | Medium    |
| STK-007 | Health care providers                   | Passive / indirect | Low      | Low       |
| STK-008 | Product team                            | Builder            | High     | High      |


### STK-001 · Plan Members (Families)

The primary users of Coordinate. Individuals and families covered by one or more health and dental plans who need to submit claims, track reimbursements, and manage benefits across multiple insurers and spending accounts.

- **Interest**: Maximize reimbursement, minimize effort, never miss a deadline or leave a benefit unused.
- **Influence**: Their needs drive all product decisions.

### STK-002 · Insurers

Insurance companies (Sun Life, Manulife, Blue Cross, Desjardins, Great-West Life, etc.) whose plans Coordinate interacts with. They are not users of the system, but their portals, APIs, and adjudication processes are a primary integration surface.

- **Interest**: Correctly routed claims reduce their administrative burden. However, they may view automated portal interactions or unexpected API load as unwelcome. Coordinate should reduce incorrectly ordered claims, not create adversarial friction.
- **Influence**: High -- they control the submission channels. If an insurer blocks automation or changes their portal, it directly affects Coordinate's functionality.

### STK-003 · HCSA / PHSP Administrators

Third-party benefits administrators (e.g., Coastal HSA, Benecaid, Olympia Benefits) that manage Health Care Spending Accounts and Private Health Services Plans on behalf of employers or self-employed individuals. They are distinct from insurers and have their own submission portals, eligible expense rules, and adjudication processes.

- **Interest**: Correctly documented claims with proper supporting EOBs from prior insurers. Like insurers, they may have concerns about automated interactions.
- **Influence**: High -- they control HCSA claim adjudication, which is the final step in the COB workflow.

### STK-004 · Privacy Regulators

Federal (PIPEDA) and provincial privacy legislation (e.g., Ontario's PHIPA, Alberta's HIA, Quebec's Law 25) govern the collection, use, and disclosure of personal health information. Coordinate will handle sensitive data including health conditions (implied by claim types), family relationships, and financial information.

- **Interest**: Lawful handling of personal health information with appropriate consent, security, and data minimization.
- **Influence**: High -- non-compliance is a legal risk. Privacy requirements will shape data architecture, storage, and retention decisions.

### STK-005 · CLHIA (Canadian Life and Health Insurance Association)

The industry body that publishes the Guideline G4 -- Coordination of Benefits for Group Health and Dental. These guidelines define the priority rules (employee-first, birthday rule, duration of coverage) that Coordinate's claim routing logic is built on.

- **Interest**: That COB is applied correctly and consistently.
- **Influence**: High -- guideline changes directly affect the core routing engine. Updates are infrequent but must be tracked.

### STK-006 · CRA (Canada Revenue Agency)

CRA defines the list of eligible medical expenses for HCSA/PHSP reimbursement and for the Medical Expense Tax Credit. Changes to eligible expense definitions affect what can be claimed through spending accounts.

- **Interest**: Tax compliance; that PHSPs and HCSAs operate within CRA rules.
- **Influence**: Medium -- CRA rules constrain what HCSAs can reimburse, but Coordinate doesn't interact with CRA systems directly.

### STK-007 · Health Care Providers

Dentists, physicians, physiotherapists, massage therapists, optometrists, pharmacies, and other practitioners. They are not users of Coordinate, but the receipts and invoices they generate are the primary input documents.

- **Interest**: Minimal direct interest in Coordinate.
- **Influence**: Low -- but inconsistent billing formats, missing itemization, or incomplete receipts create data quality challenges for claim submission.

### STK-008 · Product Team

The builders and maintainers of Coordinate.

- **Interest**: Feasibility, sustainable development effort, manageable scope.
- **Influence**: High -- technical constraints and prioritization decisions shape what gets built and when.

## Communication Plan

Not applicable in the traditional sense -- Coordinate does not have organizational stakeholders to engage on a schedule. The relevant communication considerations are:

- **Plan members**: Product communication through the application itself (onboarding, guidance, notifications).
- **Insurers and HCSA administrators**: No direct communication anticipated. Monitor their portal/API changes and terms of service.
- **Regulators and standards bodies**: Monitor CLHIA guideline updates, CRA eligible expense list changes, and privacy legislation amendments.

## Decision Authority


| Decision Area                | Responsible | Accountable | Consulted              | Informed               |
| ---------------------------- | ----------- | ----------- | ---------------------- | ---------------------- |
| Product direction and scope  | STK-008     | STK-008     | STK-001 (via feedback) | --                     |
| COB rule implementation      | STK-008     | STK-008     | STK-005 guidelines     | --                     |
| Privacy and data handling    | STK-008     | STK-008     | Privacy legal counsel  | STK-004                |
| Insurer integration approach | STK-008     | STK-008     | --                     | STK-002 (if API-based) |
| HCSA eligible expense rules  | STK-008     | STK-008     | STK-006 guidelines     | --                     |


