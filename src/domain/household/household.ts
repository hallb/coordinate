import type { HouseholdId } from "../ids";
import { HouseholdMembership } from "./household-membership";

/**
 * Household aggregate with HouseholdMembership. Per 03-data-model.md (FR-040).
 */
export interface HouseholdData {
  id: HouseholdId;
  name: string;
  memberships: HouseholdMembership[];
}

export class Household {
  public readonly id: HouseholdId;
  public readonly name: string;
  public readonly memberships: readonly HouseholdMembership[];

  constructor(data: HouseholdData) {
    this.id = data.id;
    this.name = data.name;
    this.memberships = data.memberships;
    if (!(data.name ?? "").trim()) {
      throw new Error("Household name is required");
    }
  }

  hasMember(personId: string): boolean {
    return this.memberships.some((m) => m.personId === personId);
  }
}
