import type { HouseholdId } from "../ids";
import type { Household } from "../household";

/**
 * Port for Household persistence. Per ADR-001.
 */
export interface HouseholdRepository {
  get(id: HouseholdId): Promise<Household | undefined>;
  getAll(): Promise<Household[]>;
  save(household: Household): Promise<void>;
  delete(id: HouseholdId): Promise<void>;
}
