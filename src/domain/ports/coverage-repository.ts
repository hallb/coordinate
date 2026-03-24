import type { CoverageId, HouseholdId } from "../ids";
import type { Coverage } from "../coverage";

/**
 * Port for Coverage persistence. Per ADR-001.
 */
export interface CoverageRepository {
  get(id: CoverageId): Promise<Coverage | undefined>;
  getByHousehold(householdId: HouseholdId): Promise<Coverage[]>;
  getAll(): Promise<Coverage[]>;
  save(coverage: Coverage): Promise<void>;
  delete(id: CoverageId): Promise<void>;
}
