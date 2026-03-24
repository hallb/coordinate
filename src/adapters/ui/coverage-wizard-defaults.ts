/**
 * Wizard form empty state and create-time defaults.
 * Optional fields stay empty in the UI; defaults apply only when persisting.
 */
import type { CoverageFormValues } from "./coverage-edit-helpers";

/** Use after resetFields when opening Add coverage so the store has no stale keys. */
export const EMPTY_COVERAGE_WIZARD_VALUES: Partial<CoverageFormValues> = {
  insurerName: undefined,
  portalUrl: undefined,
  coverageType: undefined,
  effectiveDate: undefined,
  planYearStart: undefined,
  gracePeriodDays: undefined,
  categoryName: undefined,
  limitWindowMode: undefined,
  limitCycleMonths: undefined,
  limit: undefined,
  cobPriority: undefined,
};

function trimStr(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
}

/** Coalesce Ant Design InputNumber empty → undefined for optional fields. */
export function normalizeOptionalNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

export interface CreateCoveragePayload {
  id: string;
  householdId: string;
  insurerName: string;
  insurerPortalUrl?: string;
  coverageType: "GroupHealth" | "GroupDental" | "HCSA" | "PHSP";
  planYearStart: string;
  gracePeriodDays: number;
  effectiveDate: string;
  insuredPersonId: string;
  insuredMembershipId: string;
  benefitCategories: Array<{
    id: string;
    name: string;
    limitWindowMode: "PlanYear" | "ServiceDate";
    limitCycleMonths: number;
  }>;
  annualMaxima: Array<{
    personId: string;
    windowStart: string;
    limit: number;
    used: number;
  }>;
  cobPriority?: number;
}

const DEFAULT_PLAN_YEAR_START = "01-01";
const DEFAULT_GRACE_DAYS = 90;
const DEFAULT_EFFECTIVE_DATE = "2026-01-01";
const DEFAULT_CATEGORY_NAME = "General";
const DEFAULT_LIMIT_WINDOW: "PlanYear" | "ServiceDate" = "PlanYear";
const DEFAULT_LIMIT_CYCLE_MONTHS = 12;
const DEFAULT_ANNUAL_LIMIT = 500;

/**
 * Map raw wizard values to createCoverage parameters.
 * Empty / omitted optional fields receive defaults here only.
 */
export function buildCreateCoveragePayload(
  raw: CoverageFormValues,
  ctx: { covId: string; householdId: string; insuredPersonId: string }
): CreateCoveragePayload {
  const insuredMembershipId = `cm-${ctx.covId}-1`;
  const effectiveDate = trimStr(raw.effectiveDate) ?? DEFAULT_EFFECTIVE_DATE;
  const planYearStart = trimStr(raw.planYearStart) ?? DEFAULT_PLAN_YEAR_START;
  const categoryName = trimStr(raw.categoryName) ?? DEFAULT_CATEGORY_NAME;
  const limitWindowMode = raw.limitWindowMode ?? DEFAULT_LIMIT_WINDOW;
  const limitCycleMonths = raw.limitCycleMonths ?? DEFAULT_LIMIT_CYCLE_MONTHS;
  const limit = raw.limit ?? DEFAULT_ANNUAL_LIMIT;
  const gracePeriodDays = raw.gracePeriodDays ?? DEFAULT_GRACE_DAYS;

  const portalUrl = trimStr(raw.portalUrl);

  return {
    id: ctx.covId,
    householdId: ctx.householdId,
    insurerName: trimStr(raw.insurerName) ?? "Unnamed insurer",
    ...(portalUrl !== undefined ? { insurerPortalUrl: portalUrl } : {}),
    coverageType: raw.coverageType ?? "GroupHealth",
    planYearStart,
    gracePeriodDays,
    effectiveDate,
    insuredPersonId: ctx.insuredPersonId,
    insuredMembershipId,
    benefitCategories: [
      {
        id: `cat-${ctx.covId}-1`,
        name: categoryName,
        limitWindowMode,
        limitCycleMonths,
      },
    ],
    annualMaxima: [
      {
        personId: ctx.insuredPersonId,
        windowStart: effectiveDate,
        limit,
        used: 0,
      },
    ],
    ...(typeof raw.cobPriority === "number"
      ? { cobPriority: raw.cobPriority }
      : {}),
  };
}
