import type { CoverageRepository as ICoverageRepository } from "../../domain/ports/coverage-repository";
import type { CoverageId, HouseholdId } from "../../domain/ids";
import type { Coverage } from "../../domain/coverage";
import { CoordinateDB } from "./db";
import {
  coverageToRecord,
  recordToCoverage,
  type CoverageRecord,
} from "./serialization";

export class CoverageDexieRepository implements ICoverageRepository {
  constructor(private readonly db: CoordinateDB) {}

  async get(id: CoverageId): Promise<Coverage | undefined> {
    const r = await this.db.coverages.get(id);
    return r ? recordToCoverage(r as unknown as CoverageRecord) : undefined;
  }

  async getByHousehold(householdId: HouseholdId): Promise<Coverage[]> {
    const rows = await this.db.coverages
      .where("householdId")
      .equals(householdId)
      .toArray();
    return rows.map((r) => recordToCoverage(r as unknown as CoverageRecord));
  }

  async getAll(): Promise<Coverage[]> {
    const rows = await this.db.coverages.toArray();
    return rows.map((r) => recordToCoverage(r as unknown as CoverageRecord));
  }

  async save(coverage: Coverage): Promise<void> {
    await this.db.coverages.put(
      coverageToRecord(coverage) as unknown as Record<string, unknown>
    );
  }

  async delete(id: CoverageId): Promise<void> {
    await this.db.coverages.delete(id);
  }
}
