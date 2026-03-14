# Functional Requirements

## Core Claim Lifecycle Model

Coordinate is built around a consumer-side orchestration model that does not exist in industry-standard insurer tooling. Each insurer manages its own claim lifecycle independently; Coordinate manages the cross-plan journey from the claimant's perspective.

The organizing principle is:

> **While an unreimbursed balance remains on an expense, claim against the next applicable plan.**

An expense has an original amount. Each successful submission reduces the remaining balance. The system determines the "next applicable plan" by evaluating COB priority rules, expense category eligibility, remaining annual maximums, and the HCSA-last-payer rule. The loop continues until the balance reaches zero (fully reimbursed) or no more applicable plans exist (out-of-pocket remainder).

```mermaid
flowchart TD
    newExpense["New Expense (full balance)"] --> findNext["Find next applicable plan"]
    findNext --> hasNext{Plan available?}
    hasNext -->|Yes| submit["Submit claim"]
    submit --> adjudicate{Outcome?}
    adjudicate -->|"Paid (full)"| closed["Closed (balance = 0)"]
    adjudicate -->|"Paid (partial)"| updateBal["Update balance with remainder"]
    adjudicate -->|Rejected| handleReject{Fixable?}
    adjudicate -->|Audit| waitAudit["Wait for audit resolution"]
    adjudicate -->|"Limit hit"| skipPlan["Mark plan exhausted for this category/person/year"]
    waitAudit --> adjudicate
    updateBal --> findNext
    handleReject -->|Yes| resubmit["Fix and resubmit to same plan"]
    resubmit --> adjudicate
    handleReject -->|No| skipPlan
    skipPlan --> findNext
    hasNext -->|"No plans left"| closedOOP["Closed (out-of-pocket remainder)"]
```

**Claim states:**

| State | Meaning |
|---|---|
| `submitted` | Claim sent to a plan; awaiting adjudication |
| `processing` | Plan has acknowledged receipt; decision pending |
| `paid_full` | Plan paid the full claimed amount |
| `paid_partial` | Plan paid less than claimed; remainder exists |
| `rejected_fixable` | Rejected for a correctable reason (missing doc, wrong format) |
| `rejected_final` | Rejected and not correctable for this plan |
| `audit` | Plan has flagged for manual audit; outcome pending |
| `limit_hit` | Plan's annual maximum for this category/person is exhausted |
| `closed_zero` | Expense fully reimbursed; balance = 0 |
| `closed_oop` | No more applicable plans; remainder is out-of-pocket |

---

## Lifecycle Feature Areas

### Expense Entry

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | Record a new expense with: service date, beneficiary (family member), expense category, amount, and provider name. | Must | Expense is stored and visible in the claim dashboard. All five fields are required. |
| FR-002 | Attach a receipt to an expense via photo capture or file upload. | Must | Receipt is stored and linked to the expense. Supported formats include JPEG, PNG, and PDF. |
| FR-003 | Support recurring expense templates. A template captures: beneficiary, category, amount, provider, and a recurrence interval (e.g., weekly). Applying a template pre-fills a new expense. | Should | Templates can be created, edited, and applied. Applying a template creates a new expense record, not a dependent record. |
| FR-004 | Support multi-beneficiary sessions. A single expense can name more than one beneficiary (e.g., a joint counselling session). Each beneficiary's portion is tracked and claimed independently. | Should | Expense can be split by beneficiary; each split follows its own routing and balance lifecycle. |
| FR-005 | Handle provider direct-billing. When a provider has submitted directly to the primary plan, the expense enters the system with the primary submission pre-recorded (reference number, amount claimed, amount paid). The system picks up from the remainder cascade. | Should | User can mark an expense as direct-billed, enter the primary plan's payment details, and the system routes the remainder correctly. |

### Routing Engine

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-010 | For a given expense, determine the next applicable plan using the following ordered rules: (1) employee-first rule (own plan before spouse's plan), (2) birthday rule for dependents (primary is the parent whose birthday is earliest in the calendar year), (3) duration of coverage as a tiebreaker. | Must | Given a test family configuration and a dependent expense, the system returns the correct primary plan in accordance with CLHIA Guideline G4. |
| FR-011 | Skip any plan that does not cover the expense category. | Must | A dental expense is not routed to a plan with no dental coverage. |
| FR-012 | Skip any plan whose annual maximum for the relevant category and beneficiary is exhausted. Record the plan as `limit_hit` for that category/beneficiary/plan year. This affects all subsequent claims of the same category for the same beneficiary for the remainder of the plan year. | Must | Once marked `limit_hit`, the plan is not proposed again for that category/beneficiary until the plan year resets. |
| FR-013 | Apply the HCSA-last-payer rule. HCSAs are never proposed before all applicable insurance plans have been evaluated. | Must | Routing engine never returns an HCSA as the next plan when an unevaluated insurance plan exists. |
| FR-014 | Handle PHSP coordination. A corporate PHSP (PER-004 scenario) does not follow standard CLHIA COB guidelines. The system must allow the user to configure PHSP priority explicitly, with a note that PHSP typically acts as last-payer relative to group insurance but before HCSA. | Should | User can set PHSP payment order in plan configuration. Routing respects the configured order. |
| FR-015 | Surface the routing decision to the user with a plain-language explanation. ("Submit to [Plan Name] because [reason]", e.g., "Submit to Sobia's Health Plan because Ben's plan has reached its annual maximum for Paramedical services.") | Must | Explanation is shown before the user confirms submission. |

### Submission Tracking

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-020 | Record a claim submission against a specific plan: submission date, plan, amount claimed, and reference number (optional at submission, required once received). | Must | Submission is stored linked to the expense and the specific plan. |
| FR-021 | Update a submission with the adjudication outcome: claim state (see state table above), amount paid, denial reason (if applicable), and EOB document (if available). | Must | State, amount paid, and denial reason are recorded. Remaining balance on the expense is recalculated automatically. |
| FR-022 | Store the EOB from a submission and automatically associate it as a supporting document for the next submission in the cascade. | Must | When the user initiates the next submission, the prior EOB is surfaced as an attachment. |
| FR-023 | Validate that the amount claimed against any single plan does not exceed the current remaining balance on the expense (NFR-008). | Must | System prevents or warns when claimed amount would cause total reimbursement to exceed original expense amount. |

### Follow-up and Remainder Cascade

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-030 | When a submission resolves with a non-zero remainder (state `paid_partial`, `rejected_final`, or `limit_hit`), automatically recalculate the remaining balance and invoke the routing engine to identify the next applicable plan. | Must | After outcome is recorded, the system immediately shows the next recommended action. |
| FR-031 | When a submission is rejected for a fixable reason (`rejected_fixable`), prompt the user to correct the issue and resubmit to the same plan. Do not advance the cascade until this plan is resolved. | Must | Fixable rejection does not advance to the next plan. User is guided to correct and resubmit. |
| FR-032 | When the routing engine finds no further applicable plans, mark the expense as `closed_oop` and record the final out-of-pocket amount. | Must | Expense shows final out-of-pocket amount. Amount is included in unreimbursed expense reporting. |
| FR-033 | When the routing engine finds no further applicable plans and the balance is zero, mark the expense as `closed_zero`. | Must | Expense is marked fully reimbursed. |
| FR-034 | Support overclaiming correction. If a user realises more was claimed from a plan than the remaining balance allowed, the system must support recording a correction (excess amount returned) and recalculating the balance. | Should | User can record a correction; balance is updated; audit trail is preserved. |

---

## Cross-Cutting Feature Areas

### Plan Configuration

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-040 | Define a household containing one or more Persons via Household Memberships. Each Person has a name and date of birth. A Person may belong to more than one Household (e.g., an adult dependent who is also a member of their own household). | Must | Household can be configured with all Persons. A Person added to a second Household shares their existing identity (no duplicate Person records). Birthday rule can be evaluated from stored birthdates. |
| FR-041 | Add and configure insurance plans: insurer name, plan type (group health, group dental, HCSA, PHSP), plan year start date, and benefit categories with annual maximums per category per covered person. | Must | Plan configuration is stored and available to the routing engine. |
| FR-042 | Define COB relationships between plans. The user can specify which plans coordinate with each other and in what order (where not fully determined by CLHIA rules). | Must | Routing engine uses configured COB order when statutory rules do not fully determine priority. |
| FR-043 | Support plan changes. When a plan holder changes employers or plans, the old plan can be marked inactive (with an end date) and a new plan added. Historical claims against the old plan are preserved. | Must | Old plan is retained in history. New plan is used for routing from its effective date. |
| FR-044 | Support multi-user household access with delegated authority. A System User selects a Household context after login (GLO-033). An Insurance Manager can grant another System User access as a Contributor or co-Insurance Manager. An Insurance Manager need not be an Insured or Beneficiary in the Household (see PER-005). Role definitions and scoping per GLO-007 through GLO-009. | Should | A System User can access multiple Households and switch context. An Insurance Manager with no plan membership in the Household can fully manage it. A Contributor can submit receipts and view status but cannot edit plan configuration or COB rules. |

### Maximum and Balance Tracking

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-050 | Track remaining annual maximum per plan, per benefit category, per covered person. | Must | After each paid claim, the relevant maximum is decremented by the amount paid. |
| FR-051 | Reset annual maximums at the plan year boundary. | Must | On the plan year start date, maximums reset to their configured values. |
| FR-052 | Track HCSA balance: total allocation, amount claimed, and remaining balance. | Must | HCSA balance is decremented as HCSA claims are paid. Remaining balance is visible to the user. |
| FR-053 | Display remaining coverage across all plans and categories for any family member, on demand. | Must | User can view a coverage summary showing remaining maximums per category per plan per person. |
| FR-054 | Alert the user when a benefit category maximum is approaching exhaustion (configurable threshold, e.g., less than 20% or less than one session's worth remaining). | Should | Alert is triggered before the maximum is hit, giving the user time to plan. |
| FR-055 | Alert the user when HCSA balance is underutilised relative to plan year progress (e.g., more than 50% of the year has passed but less than 25% of the HCSA has been used). | Should | Alert fires at a configurable point in the plan year. |
| FR-056 | Support benefit utilisation planning. Given a proposed future expense (category, amount, beneficiary), show projected remaining coverage after that expense across all plans. | Could | User can model a proposed expense and see its impact on remaining balances before booking. |

### Document Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-060 | Store receipts and EOBs linked to specific expenses and submissions. | Must | Every stored document is associated with an expense and, where applicable, a specific submission. |
| FR-061 | Support receipt capture via photo (mobile) and file upload (desktop). Accepted formats: JPEG, PNG, PDF. | Must | Documents can be attached from both mobile and desktop entry points. |
| FR-062 | Retain all claim-related documents per the retention floor in NFR-006. | Must | Documents cannot be deleted within the retention window unless the user explicitly overrides with acknowledgement. |

### Alerts and Notifications

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-070 | Notify the user when a submission has been resolved (paid or rejected) and a follow-up action is needed. | Must | Alert is generated when an expense transitions to a state requiring user action. |
| FR-071 | Notify the user when a claim submission deadline is approaching. Deadlines are configured per plan (typically 12-18 months from service date). | Should | Alert fires at a configurable lead time (e.g., 60 days) before the deadline. |
| FR-072 | Notify the user when unused benefit coverage or HCSA balance is at risk of expiring before the plan year ends. | Should | Alert fires at a configurable point before plan year end, listing unused benefits by category. |
| FR-073 | Notify the user when a benefit category annual maximum is approaching exhaustion for a frequently-used category. | Should | Alert fires when remaining maximum falls below a configurable threshold. |

### Reporting

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-080 | Generate a year-end unreimbursed expense summary per family member: total expenses, total reimbursed, and total out-of-pocket, for any calendar year or 12-month period. | Must | Report can be exported (CSV or PDF). Values reconcile with individual expense records. |
| FR-081 | Provide an expense history view filterable by family member, expense category, plan, and date range. | Must | User can filter and view any subset of historical expenses and their claim outcomes. |
| FR-082 | Provide an HCSA utilisation summary for the current and prior plan years: allocation, claimed, paid, and remaining. | Should | Summary is available per HCSA. |
| FR-083 | Provide a benefit utilisation summary for the current plan year: remaining maximums by category and plan. | Should | Summary covers all configured plans and categories. |

---

## Dependencies

| FR | Depends On | Notes |
|----|------------|-------|
| FR-010 (routing) | FR-040 (plan config), FR-050 (max tracking) | Routing cannot determine next plan without knowing plan configuration and remaining maximums. |
| FR-011 (category skip) | FR-041 (plan categories) | Category eligibility is derived from plan configuration. |
| FR-012 (limit hit) | FR-050 (max tracking) | Exhaustion state is read from maximum tracking. |
| FR-030 (remainder cascade) | FR-010 (routing), FR-021 (outcome recording) | Cascade is triggered by outcome recording; next plan comes from routing engine. |
| FR-022 (EOB linking) | FR-020, FR-021 | EOB is produced from submission tracking and linked to next submission. |
| FR-070 (action alerts) | FR-021, FR-030 | Alerts fire based on claim state transitions. |
| FR-071 (deadline alerts) | FR-041 (plan config) | Deadlines are configured per plan. |
| FR-072 (expiry alerts) | FR-051 (plan year reset), FR-052 (HCSA balance) | Alerts compare current date to plan year end and remaining balances. |
| FR-073 (limit alerts) | FR-050 (max tracking) | Alerts compare remaining maximum to configured threshold. |
| FR-080 (year-end report) | FR-032, FR-033 | Out-of-pocket amounts come from closed expenses. |
| FR-056 (utilisation planning) | FR-050 (max tracking) | Projection requires current remaining maximum state. |
