# Goals, Objectives, and Success Metrics

## Business Goals

High-level outcomes the project aims to achieve. Four goals, ordered by priority and dependency:

| ID | Goal | Notes |
|----|------|-------|
| G1 | **Personal utility** | Coordinate fully manages Ben's family insurance claims across all plans, dependents, and HCSAs, replacing the current manual process. |
| G2 | **General utility** | Coordinate generalizes to serve Canadian families with varying plan configurations (single plan, dual employer, self-employed PHSP, with/without HCSA). |
| G3 | **Sustainability** | Revenue covers all operational costs (infrastructure, third-party services) plus the value of ongoing development and maintenance time, assessed at an hourly rate reflecting opportunity cost. |
| G4 | **Profitability** | (Stretch) Revenue exceeds total costs including time, generating positive returns. |

## Product Objectives

Measurable targets tied to each goal:

| ID | Objective | Notes |
|----|------------|-------|
| G1 | Ben's family claims are fully tracked; HCSA utilization reaches 100%; no claim is missed or left incomplete; time spent on insurance admin is measurably reduced. | |
| G2 | At least one non-founder user (different plan configuration) successfully manages claims through Coordinate; the system handles the plan configurations represented by all four personas (Ben, Sobia, Marco, Priya). | |
| G3 | Define and track total cost of ownership (hosting, services, imputed time at hourly rate); identify a revenue model that covers TCO. | |
| G4 | Positive margin after all costs including time. | |

## Success Metrics / KPIs

How we know we have succeeded. Concrete, measurable indicators grouped by goal:

### Personal utility (G1)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Percentage of family expenses tracked through Coordinate | 100% | Count of expenses in Coordinate vs. known family health/dental expenses |
| HCSA dollars utilized vs. allocated | 100% | Sum of HCSA claims paid vs. annual allocation |
| Claims with missed follow-up submissions | 0 | Count of expenses with primary paid but secondary/HCSA not submitted |
| Time spent on insurance admin per month | Reduced vs. baseline | Self-reported (before/after) |

### General utility (G2)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Active households beyond the founder | Grow over time | Count of distinct households with active use |
| Plan configuration coverage | All four persona types supported | Which persona configurations are represented among users |
| User-reported claim completion rate | High | Survey or in-app feedback |

### Sustainability (G3)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Monthly operational cost | Tracked | Infrastructure + third-party services |
| Monthly imputed development/maintenance cost | Tracked | Hours x hourly rate (opportunity cost) |
| Monthly revenue | Tracked | Revenue model dependent |
| Revenue-to-total-cost ratio | >= 1.0 | Revenue / (operational + imputed cost) |

### Profitability (G4)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Net margin after all costs including imputed time | > 0 | Revenue minus total cost |

## Anti-Goals

What we are explicitly *not* optimizing for:

- **Not a tax tool**: Coordinate surfaces unreimbursed expenses for CRA reporting but does not determine METC eligibility, optimize claiming strategy, or provide tax advice.
- **Not a replacement for insurer apps**: Coordinate orchestrates across plans but does not aim to replicate the full functionality of each insurer's portal.
- **Not enterprise / B2B**: The target user is individuals and families, not benefits administrators, HR departments, or employers.
- **Not all-insurance**: Scope is health, dental, vision, and paramedical. Auto, home, life, disability, and critical illness insurance are out of scope.
- **Not a provider directory**: Coordinate may note which providers direct-bill, but building a provider search or comparison tool is not a goal.
