# User Personas and Scenarios

## Persona Approach

Personas are specific named individuals chosen to represent distinct plan configurations. Together they span the meaningful variation in how families interact with the system. The primary differentiator between users is not demographics but **plan configuration** -- how many plans, what type, how many dependents, and whether there's an HCSA.

The domain has a natural **primary / secondary user** dynamic. One family member typically acts as the "insurance manager" who configures plans, orchestrates submissions, and tracks the full picture. Other family members may interact occasionally (e.g., submitting a receipt) but don't manage the overall workflow. Personas reflect this relationship.

## Personas

### PER-001 · Ben (Founder / Family Insurance Manager)

- **Background:** Software professional. Technically proficient. Manages insurance claims for a family of five: himself, his spouse Sobia, and three dependents -- Gabriel (13), Mira (18, dependent student), and Anisa (18, dependent student). Both he and Sobia are employed with separate employer group benefits plans through different insurers.
- **Plan configuration:**
  - His employer plan (Insurer A, includes HCSA)
  - Sobia's employer plans: separate Health (Insurer B, includes HCSA) and Dental (Insurer C)
  - Three dependents covered under both parents' plans, subject to COB / birthday rule
- **Needs:** A single view of all claims across all destinations (his plan, Sobia's health plan, Sobia's dental plan, both HCSAs). Clear guidance on submission order per family member per expense. Tracking of what's been submitted, what's been paid, and what's still outstanding.
- **Frustrations:** Tracking is the dominant pain. With three different insurer portals (each with integrated HCSA access) and five family members, it's difficult to know what state each claim is in. Receipts and EOBs accumulate. It's easy to forget to submit a remainder to the HCSA, especially months after the original expense. Compounding this, Sobia's insurer portals require her personal credentials with SMS-based 2FA sent to her phone. Even though they share credentials via 1Password, Ben can't independently log in to check claim status or submit without coordinating with Sobia to receive the 2FA code -- adding a synchronous human dependency to what should be asynchronous admin work.
- **Goals:** Spend minimal time on insurance administration. Never miss a reimbursement. Use all available HCSA dollars before they expire. Have confidence that every expense has been fully processed across all plans.
- **Role in system:** Primary user. Configures family plans, submits and tracks all claims, manages dependents.
- **Note:** Ben is also the founder/builder. His personal use is the initial validation target for the product.

### PER-002 · Sobia (Partner / Occasional User)

- **Background:** Ben's spouse. Employed, with separate employer Health (includes HCSA) and Dental plans through different insurers. Not the family's insurance manager -- she handles her own plan's direct interactions (e.g., showing her benefits card at the pharmacy) but relies on Ben to orchestrate the COB workflow and HCSA submissions.
- **Needs:** Ability to submit a receipt or check the status of a claim without needing to understand the full COB picture. Visibility into what's been claimed under her plans on behalf of the family.
- **Frustrations:** Informal receipt handoff to Ben is unreliable -- things get lost. Gets interrupted for 2FA codes when Ben needs portal access to her plans (see PER-001 for full context).
- **Goals:** Minimal involvement in insurance admin. Confidence that expenses are being handled without needing to track them herself. Not being interrupted for 2FA codes.
- **Role in system:** Secondary user. Can submit receipts and view claim status, but doesn't configure plans or manage the COB workflow.
- **Note:** Direct system access (submit receipts, check status) requires Phase 4 multi-user infrastructure (sync layer, identity). Until then, receipt handoff uses out-of-system channels (e.g. texting Ben a photo); Ben enters and tracks (ADR-010).

### PER-003 · Marco (Single Parent, One Plan + HCSA)

- **Background:** Single parent with two young children. Has an employer group benefits plan and an HCSA. No second plan -- no COB complexity, but still needs to track claims, manage receipts for dependents, and remember to submit remaining balances to the HCSA.
- **Plan configuration:**
  - His employer plan (one insurer) + HCSA
  - Children covered as dependents
- **Needs:** Receipt management for kids' dental, vision, and prescription expenses. Reminders to submit HCSA claims for amounts not covered by the primary plan. Awareness of remaining annual maximums per benefit category.
- **Frustrations:** Doesn't have COB confusion, but still struggles with the volume of receipts across two kids and multiple benefit categories. Forgets to submit the unpaid remainder to the HCSA. Discovers at year-end that he left HCSA dollars on the table.
- **Goals:** Stay on top of the kids' health expenses without it becoming a part-time job. Use his full HCSA allocation each year.
- **Role in system:** Primary user (sole user for his family). Simpler plan configuration but similar tracking and HCSA workflow needs.

### PER-004 · Priya (Self-Employed with PHSP, Spouse Has Employer Plan)

- **Background:** Self-employed consultant, incorporated, with a PHSP set up through her corporation. Her spouse has an employer group benefits plan with a different insurer. They have one child under 18.
- **Plan configuration:**
  - Her corporate PHSP (self-funded, CRA-eligible expenses)
  - Spouse's employer plan (group insurer) + HCSA
  - Child covered under both, subject to COB rules
- **Needs:** Understand how her PHSP coordinates with her spouse's employer plan -- the PHSP doesn't follow standard CLHIA COB guidelines the same way two employer plans would. Track which expenses to run through the PHSP vs. the employer plan for maximum tax efficiency and reimbursement.
- **Frustrations:** Uncertainty about submission order. Her PHSP covers CRA-eligible expenses broadly, but the interaction with her spouse's employer plan and HCSA is confusing. She's not sure if she's leaving money on the table or double-claiming incorrectly.
- **Goals:** Correctly coordinate between her PHSP and her spouse's employer coverage. Maximize total family reimbursement without running afoul of CRA or COB rules.
- **Role in system:** Primary user for her family. Represents the self-employed plan configuration.

### PER-005 · Nadia (Caregiver for Aging Parent)

- **Background:** Working professional in her 40s. Manages her own family's insurance through her and her spouse's employer plans (similar to PER-001). Her mother, Fatima (72), is a retired former federal employee with a retiree group benefits plan (health and dental through a single insurer). Fatima is cognitively sharp but not comfortable navigating insurer portals or tracking claims. Nadia has taken over Fatima's insurance administration.
- **Plan configuration (for Fatima's household):**
  - Fatima's retiree group benefits plan (one insurer, no HCSA)
  - Fatima is the only Person in her own Household
- **Needs:** Manage Fatima's claims end-to-end: enter expenses, submit claims, track reimbursements. Do this from the same system she uses for her own family, without maintaining separate credentials or juggling a second tool. Clear separation between her own Household's claims and Fatima's.
- **Frustrations:** Currently logs into Fatima's insurer portal using Fatima's credentials -- feels like a security workaround. No consolidated view of Fatima's claim status alongside her own family's. Fatima sometimes forgets to tell her about a medical expense until weeks later, and receipts get lost.
- **Goals:** One place to manage both her own family's insurance and her mother's. Confidence that Fatima's expenses are being handled and nothing is falling through the cracks. Eventually, Fatima could be granted Contributor-level access to submit her own receipts directly.
- **Role in system:** Insurance Manager in Fatima's Household. Not an Insured or Beneficiary in that Household -- purely a delegate. Also an Insurance Manager (or Contributor) in her own family's Household.
- **Note:** Represents the caregiver/delegate pattern: a System User managing a Household they have no insurance relationship with. In MVP, Nadia operates both Households from her device (single Operator). Fatima's Contributor access requires Phase 4 (sync + identity) so she can access from her own device (ADR-010).

## Key Scenarios / User Stories

### Claim Submission Workflow

- As **PER-001 (Ben)**, I want to enter a dental expense for my child and be told exactly which plan to submit it to first (based on the birthday rule), so that I don't get the claim denied for wrong submission order.
- As **PER-001 (Ben)**, I want to see that a primary claim has been paid and be prompted to submit the remainder to the secondary plan with the EOB attached, so that I don't forget the follow-up submission.
- As **PER-001 (Ben)**, I want to be prompted to submit the final unpaid balance to my HCSA after both insurer plans have paid, so that I don't leave HCSA dollars unused.
- As **PER-002 (Sobia)**, I want to photograph a receipt from a physio appointment and hand it off to the system, so that Ben can process it through the correct plans without me needing to understand the routing.

### Tracking and Visibility

- As **PER-001 (Ben)**, I want a dashboard showing all outstanding claims across all plans and family members, so that I can see at a glance what needs attention.
- As **PER-003 (Marco)**, I want to see how much coverage I have left in each benefit category for each child, so that I can plan upcoming appointments accordingly.
- As **PER-002 (Sobia)**, I want to check whether a specific expense has been fully reimbursed across all plans, without asking Ben.

### HCSA and Benefit Utilization

- As **PER-003 (Marco)**, I want to be alerted when I have unspent HCSA dollars approaching the plan year end, so that I can schedule eligible expenses before the balance expires.
- As **PER-001 (Ben)**, I want a year-end summary of unreimbursed out-of-pocket expenses per family member, so that I have what I need for CRA medical expense tax credit reporting.

### Self-Employed Coordination

- As **PER-004 (Priya)**, I want to understand whether my child's expense should go through my PHSP or my spouse's employer plan first, so that I maximize reimbursement without violating COB rules.

### Caregiver / Delegate Access

- As **PER-005 (Nadia)**, I want to manage my mother Fatima's insurance claims from the same system I use for my own family, switching between Household contexts, so that I don't need a separate tool or login.
- As **PER-005 (Nadia)**, I want to enter an expense on Fatima's behalf and have the system route it through Fatima's retiree plan, so that I don't need to understand Fatima's plan details from scratch each time.
- As **PER-005 (Nadia)**, I want to grant Fatima limited access (Contributor) to her own Household in Coordinate, so that she can submit receipts directly when I'm not available. *(Phase 4)*

### Multi-Household Context

- As **PER-001 (Ben)**, when Mira (18, dependent student) gets married and her spouse has employer insurance, I want Mira to exist as a single Person in Coordinate who belongs to both my Household (as a dependent/Beneficiary) and her own new Household, so that claims under both contexts are tracked without duplicating her identity.

## Jobs to Be Done

Jobs to Be Done capture the outcomes users are hiring Coordinate to achieve. They are intentionally abstract and outcome-oriented. The functional requirements document will decompose these into specific system behaviors.

| Job Type | Job Statement |
|----------|---------------|
| Functional | Ensure every health and dental expense for every family member is routed through all applicable plans in the correct order, so that total reimbursement is maximized with minimum effort. |
| Functional | Keep me continuously aware of remaining coverage, unused benefits, and HCSA balances across all plans and family members, so that I can plan the timing of discretionary care (appointments, eyewear, orthotics) weeks or months in advance -- not just react at year-end. |
| Functional | Maintain a complete, organized record of all receipts, EOBs, and claim outcomes per family member, so that year-end tax reporting and audit-readiness are effortless. |
| Emotional | Give me confidence that I'm not leaving money on the table and that my family's health expenses are fully handled. |
| Emotional | Remove the guilt and anxiety of knowing there's a pile of unprocessed receipts that I'll "get to eventually." |
| Social | Let me be the competent family member who has the insurance situation handled, rather than the one who forgot to submit the claim. |
