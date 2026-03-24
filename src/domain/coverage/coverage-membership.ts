import type { CoverageMembershipId, CoverageId, PersonId } from "../ids";
import type { MembershipRole } from "../value-objects/membership-role";

/**
 * CoverageMembership entity. Per 03-data-model.md.
 * Invariant: exactly one Insured per Coverage (enforced by aggregate).
 */
export interface CoverageMembershipData {
  id: CoverageMembershipId;
  coverageId: CoverageId;
  personId: PersonId;
  role: MembershipRole;
}

export class CoverageMembership {
  constructor(
    public readonly id: CoverageMembershipId,
    public readonly coverageId: CoverageId,
    public readonly personId: PersonId,
    public readonly role: MembershipRole,
  ) {}
}
