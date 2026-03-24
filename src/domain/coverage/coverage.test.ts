import { describe, it, expect } from "vitest";
import { Coverage } from "./coverage";
import { Insurer } from "../value-objects/insurer";
import { MonthDay } from "../value-objects/month-day";
import { CalendarDate } from "../value-objects/calendar-date";
import { CoverageMembership } from "./coverage-membership";
import { BenefitCategory } from "./benefit-category";
import { AnnualMaximum } from "./annual-maximum";
import { Money } from "../value-objects/money";

describe("Coverage aggregate", () => {
  const base = {
    id: "cov-1" as const,
    householdId: "h-1" as const,
    insurer: Insurer.create({ name: "Sun Life" }),
    coverageType: "GroupHealth" as const,
    planYearStart: MonthDay.fromString("01-01"),
    gracePeriodDays: 90,
    active: true,
    effectiveDate: CalendarDate.fromString("2026-01-01"),
    memberships: [
      new CoverageMembership("cm-1", "cov-1", "p-1", "Insured"),
      new CoverageMembership("cm-2", "cov-1", "p-2", "Beneficiary"),
    ],
    benefitCategories: [
      new BenefitCategory(
        "cat-1",
        "cov-1",
        "Paramedical",
        undefined,
        "PlanYear",
        12,
      ),
    ],
    annualMaxima: [
      new AnnualMaximum(
        "p-1",
        CalendarDate.fromString("2026-01-01"),
        Money.fromNumber(500),
        Money.fromNumber(0),
      ),
    ],
  };

  it("creates with exactly one Insured", () => {
    const cov = new Coverage(base);
    expect(cov.id).toBe("cov-1");
    expect(cov.memberships).toHaveLength(2);
    expect(cov.benefitCategories).toHaveLength(1);
  });

  it("rejects zero Insured", () => {
    const bad = {
      ...base,
      memberships: [
        new CoverageMembership("cm-1", "cov-1", "p-1", "Beneficiary"),
      ],
    };
    expect(() => new Coverage(bad)).toThrow("exactly one Insured");
  });

  it("rejects two Insured", () => {
    const bad = {
      ...base,
      memberships: [
        new CoverageMembership("cm-1", "cov-1", "p-1", "Insured"),
        new CoverageMembership("cm-2", "cov-1", "p-2", "Insured"),
      ],
    };
    expect(() => new Coverage(bad)).toThrow("exactly one Insured");
  });
});
