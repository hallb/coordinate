import type { MembershipId, HouseholdId, PersonId } from "../ids";

/**
 * HouseholdMembership entity. Per 03-data-model.md.
 * References Person by ID (cross-aggregate).
 */
export interface HouseholdMembershipData {
  id: MembershipId;
  householdId: HouseholdId;
  personId: PersonId;
}

export class HouseholdMembership {
  constructor(
    public readonly id: MembershipId,
    public readonly householdId: HouseholdId,
    public readonly personId: PersonId
  ) {}
}
