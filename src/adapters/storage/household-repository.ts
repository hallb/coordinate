import type { HouseholdRepository as IHouseholdRepository } from "../../domain/ports/household-repository";
import type { HouseholdId } from "../../domain/ids";
import type { Household } from "../../domain/household";
import { CoordinateDB } from "./db";
import {
  householdToRecord,
  recordToHousehold,
  type HouseholdRecord,
} from "./serialization";

export class HouseholdDexieRepository implements IHouseholdRepository {
  constructor(private readonly db: CoordinateDB) {}

  async get(id: HouseholdId): Promise<Household | undefined> {
    const r = await this.db.households.get(id);
    return r ? recordToHousehold(r as unknown as HouseholdRecord) : undefined;
  }

  async getAll(): Promise<Household[]> {
    const rows = await this.db.households.toArray();
    return rows.map((r) => recordToHousehold(r as unknown as HouseholdRecord));
  }

  async save(household: Household): Promise<void> {
    await this.db.households.put(
      householdToRecord(household) as unknown as Record<string, unknown>
    );
  }

  async delete(id: HouseholdId): Promise<void> {
    await this.db.households.delete(id);
  }
}
