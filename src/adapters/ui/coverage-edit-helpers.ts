/**
 * Map between Coverage aggregate and Settings coverage wizard form values.
 */
import { Coverage } from "../../domain/coverage";
import { BenefitCategory } from "../../domain/coverage/benefit-category";
import { AnnualMaximum } from "../../domain/coverage/annual-maximum";
import { Insurer } from "../../domain/value-objects/insurer";
import { CalendarDate } from "../../domain/value-objects/calendar-date";
import { MonthDay } from "../../domain/value-objects/month-day";
import { Money } from "../../domain/value-objects/money";

function trimOptional(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export interface CoverageFormValues {
  insurerName?: string;
  portalUrl?: string;
  coverageType?: "GroupHealth" | "GroupDental" | "HCSA" | "PHSP";
  effectiveDate?: string;
  planYearStart?: string;
  gracePeriodDays?: number;
  categoryName?: string;
  limitWindowMode?: "PlanYear" | "ServiceDate";
  limitCycleMonths?: number;
  limit?: number;
  cobPriority?: number;
}

export function coverageToFormValues(c: Coverage): CoverageFormValues {
  const insured = c.memberships.find((m) => m.role === "Insured");
  const firstCat = c.benefitCategories[0];
  const firstMax =
    c.annualMaxima.find((am) => am.personId === insured?.personId) ??
    c.annualMaxima[0];

  return {
    insurerName: c.insurer.name,
    portalUrl: c.insurer.portalUrl,
    coverageType: c.coverageType,
    effectiveDate: c.effectiveDate.iso,
    planYearStart: c.planYearStart.value,
    gracePeriodDays: c.gracePeriodDays,
    categoryName: firstCat?.name,
    limitWindowMode: firstCat?.limitWindowMode,
    limitCycleMonths: firstCat?.limitCycleMonths,
    limit: firstMax?.limit.amount,
    cobPriority: c.cobPriority,
  };
}

/**
 * Apply wizard form values onto an existing Coverage; preserves memberships,
 * benefit category ids (first row edited), annual maximum `used` where rows align.
 */
export function mergeCoverageFromForm(
  existing: Coverage,
  values: CoverageFormValues
): Coverage {
  const name =
    (values.insurerName ?? existing.insurer.name).trim() || "Unnamed insurer";
  const portalRaw = values.portalUrl;
  const portalUrl =
    portalRaw === undefined
      ? existing.insurer.portalUrl
      : String(portalRaw).trim() || undefined;
  const insurer = Insurer.create({
    name,
    ...(portalUrl ? { portalUrl } : {}),
  });

  const coverageType = values.coverageType ?? existing.coverageType;
  const planYearStart = MonthDay.fromString(
    trimOptional(values.planYearStart) ?? existing.planYearStart.value
  );
  const gracePeriodDays = values.gracePeriodDays ?? existing.gracePeriodDays;
  const effectiveDate = CalendarDate.fromString(
    trimOptional(values.effectiveDate) ?? existing.effectiveDate.iso
  );

  let benefitCategories: BenefitCategory[];
  const firstCategory = existing.benefitCategories[0];
  if (firstCategory !== undefined) {
    benefitCategories = [
      new BenefitCategory(
        firstCategory.id,
        existing.id,
        trimOptional(values.categoryName) ?? firstCategory.name,
        firstCategory.coinsuranceRate,
        values.limitWindowMode ?? firstCategory.limitWindowMode,
        values.limitCycleMonths ?? firstCategory.limitCycleMonths
      ),
      ...existing.benefitCategories
        .slice(1)
        .map(
          (bc) =>
            new BenefitCategory(
              bc.id,
              bc.coverageId,
              bc.name,
              bc.coinsuranceRate,
              bc.limitWindowMode,
              bc.limitCycleMonths
            )
        ),
    ];
  } else {
    benefitCategories = [
      new BenefitCategory(
        `cat-${existing.id}-1`,
        existing.id,
        trimOptional(values.categoryName) ?? "General",
        undefined,
        values.limitWindowMode ?? "PlanYear",
        values.limitCycleMonths ?? 12
      ),
    ];
  }

  const insured = existing.memberships.find((m) => m.role === "Insured");
  const limitAmount =
    values.limit ?? existing.annualMaxima[0]?.limit.amount ?? 500;

  let annualMaxima: AnnualMaximum[];
  if (existing.annualMaxima.length > 0) {
    annualMaxima = existing.annualMaxima.map((am, idx) => {
      if (idx === 0) {
        const eff = trimOptional(values.effectiveDate);
        const window =
          eff !== undefined ? CalendarDate.fromString(eff) : am.windowStart;
        return new AnnualMaximum(
          am.personId,
          window,
          Money.fromNumber(limitAmount),
          am.used
        );
      }
      return new AnnualMaximum(am.personId, am.windowStart, am.limit, am.used);
    });
  } else if (insured) {
    annualMaxima = [
      new AnnualMaximum(
        insured.personId,
        effectiveDate,
        Money.fromNumber(limitAmount),
        Money.fromNumber(0)
      ),
    ];
  } else {
    annualMaxima = [];
  }

  return new Coverage({
    id: existing.id,
    householdId: existing.householdId,
    insurer,
    coverageType,
    planYearStart,
    gracePeriodDays,
    active: existing.active,
    effectiveDate,
    endDate: existing.endDate,
    cobPriority:
      typeof values.cobPriority === "number"
        ? values.cobPriority
        : existing.cobPriority,
    memberships: [...existing.memberships],
    benefitCategories,
    annualMaxima,
  });
}
