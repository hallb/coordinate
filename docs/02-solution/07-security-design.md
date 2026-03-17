# Security Design

## Threat Model

Key threats and attack surfaces.

## Authentication

Identity provider and flows (OAuth, SSO, etc.).

## Authorization

**Household as the ABAC boundary.** Access to all domain data is determined by Household membership and User Role (NFR-044, NFR-045). A System User's access is the union of (Household × UserRole) across all Households they belong to. There is no implicit cross-household access — a user with access to Household A cannot see or modify data in Household B unless they have explicit membership in B.

**Permission model within a Household:**

| Role | Permissions |
|------|-------------|
| Insurance Manager | Full access: configure Household, plans, COB relationships, External Coverage; submit and track claims for any Person in the Household; grant or revoke access to other users |
| Contributor | Limited access: submit receipts, view claim status; cannot edit plan configuration or COB rules |

**Data isolation.** Plan data (coverage limits, utilization, claim status, browser-extension-scraped data) is scoped to the Household that owns the InsurancePlan. A Person may belong to multiple Households, but plan data from one Household is never visible or accessible from another. Cross-household information flows occur only through user-initiated document sharing (EOBs, receipts), not through shared plan data.

## Data Protection

Encryption at rest and in transit; key management.

## Audit and Logging

What is logged, retention, and compliance requirements.
