import type { CoverageId, HouseholdId } from "../ids";
import { Insurer } from "../value-objects/insurer";
import type { PlanType } from "../value-objects/plan-type";
import { MonthDay } from "../value-objects/month-day";
import { CalendarDate } from "../value-objects/calendar-date";
import { CoverageMembership } from "./coverage-membership";
import { BenefitCategory } from "./benefit-category";
import { AnnualMaximum } from "./annual-maximum";

/**
 * Coverage aggregate. Per 03-data-model.md.
 * Invariant: exactly one CoverageMembership with role = Insured per Coverage.
 */
export interface CoverageData {
  id: CoverageId;
  householdId: HouseholdId;
  insurer: Insurer;
  coverageType: PlanType;
  planYearStart: MonthDay;
  gracePeriodDays: number;
  active: boolean;
  effectiveDate: CalendarDate;
  endDate?: CalendarDate;
  cobPriority?: number;
  memberships: CoverageMembership[];
  benefitCategories: BenefitCategory[];
  annualMaxima: AnnualMaximum[];
}

export class Coverage {
  public readonly id: CoverageId;
  public readonly householdId: HouseholdId;
  public readonly insurer: Insurer;
  public readonly coverageType: PlanType;
  public readonly planYearStart: MonthDay;
  public readonly gracePeriodDays: number;
  public readonly active: boolean;
  public readonly effectiveDate: CalendarDate;
  public readonly endDate: CalendarDate | undefined;
  public readonly cobPriority: number | undefined;
  public readonly memberships: readonly CoverageMembership[];
  public readonly benefitCategories: readonly BenefitCategory[];
  public readonly annualMaxima: readonly AnnualMaximum[];

  constructor(data: CoverageData) {
    this.id = data.id;
    this.householdId = data.householdId;
    this.insurer = data.insurer;
    this.coverageType = data.coverageType;
    this.planYearStart = data.planYearStart;
    this.gracePeriodDays = data.gracePeriodDays;
    this.active = data.active;
    this.effectiveDate = data.effectiveDate;
    this.endDate = data.endDate;
    this.cobPriority = data.cobPriority;
    this.memberships = data.memberships;
    this.benefitCategories = data.benefitCategories;
    this.annualMaxima = data.annualMaxima;

    const insuredCount = this.memberships.filter((m) => m.role === "Insured").length;
    if (insuredCount !== 1) {
      throw new Error(
        "Coverage must have exactly one Insured (CoverageMembership with role Insured)",
      );
    }
  }
}
