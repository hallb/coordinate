import type { CategoryId, CoverageId } from "../ids";
import type { LimitWindowMode } from "../value-objects/limit-window-mode";
import type { Percentage } from "../value-objects/percentage";

/**
 * BenefitCategory entity. Per 03-data-model.md.
 */
export interface BenefitCategoryData {
  id: CategoryId;
  coverageId: CoverageId;
  name: string;
  coinsuranceRate?: Percentage;
  limitWindowMode: LimitWindowMode;
  limitCycleMonths: number;
}

export class BenefitCategory {
  constructor(
    public readonly id: CategoryId,
    public readonly coverageId: CoverageId,
    public readonly name: string,
    public readonly coinsuranceRate: Percentage | undefined,
    public readonly limitWindowMode: LimitWindowMode,
    public readonly limitCycleMonths: number,
  ) {
    if (limitCycleMonths <= 0) {
      throw new Error("limitCycleMonths must be > 0");
    }
  }
}
