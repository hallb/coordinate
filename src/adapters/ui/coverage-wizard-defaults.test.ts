import { describe, expect, it } from "vitest";
import {
  buildCreateCoveragePayload,
  normalizeOptionalNumber,
} from "./coverage-wizard-defaults";
import type { CoverageFormValues } from "./coverage-edit-helpers";

describe("normalizeOptionalNumber", () => {
  it("maps null to undefined", () => {
    expect(normalizeOptionalNumber(null)).toBeUndefined();
  });
  it("keeps zero", () => {
    expect(normalizeOptionalNumber(0)).toBe(0);
  });
  it("maps invalid to undefined", () => {
    expect(normalizeOptionalNumber("x")).toBeUndefined();
  });
});

describe("buildCreateCoveragePayload", () => {
  const ctx = {
    covId: "cov-test",
    householdId: "h-1",
    insuredPersonId: "p-1",
  };

  it("applies defaults when optional fields are empty", () => {
    const raw: CoverageFormValues = {
      insurerName: "Acme",
      coverageType: "GroupHealth",
    };
    const p = buildCreateCoveragePayload(raw, ctx);
    expect(p.planYearStart).toBe("01-01");
    expect(p.gracePeriodDays).toBe(90);
    expect(p.effectiveDate).toBe("2026-01-01");
    expect(p.benefitCategories[0]?.name).toBe("General");
    expect(p.benefitCategories[0]?.limitWindowMode).toBe("PlanYear");
    expect(p.benefitCategories[0]?.limitCycleMonths).toBe(12);
    expect(p.annualMaxima[0]?.limit).toBe(500);
    expect(p.cobPriority).toBeUndefined();
    expect(p.insurerPortalUrl).toBeUndefined();
  });

  it("uses provided optional values when set", () => {
    const raw: CoverageFormValues = {
      insurerName: "Acme",
      coverageType: "HCSA",
      portalUrl: "https://example.com",
      effectiveDate: "2025-06-15",
      planYearStart: "04-01",
      gracePeriodDays: 60,
      categoryName: "Dental",
      limitWindowMode: "ServiceDate",
      limitCycleMonths: 6,
      limit: 1200,
      cobPriority: 2,
    };
    const p = buildCreateCoveragePayload(raw, ctx);
    expect(p.insurerPortalUrl).toBe("https://example.com");
    expect(p.effectiveDate).toBe("2025-06-15");
    expect(p.planYearStart).toBe("04-01");
    expect(p.gracePeriodDays).toBe(60);
    expect(p.benefitCategories[0]?.name).toBe("Dental");
    expect(p.benefitCategories[0]?.limitWindowMode).toBe("ServiceDate");
    expect(p.benefitCategories[0]?.limitCycleMonths).toBe(6);
    expect(p.annualMaxima[0]?.limit).toBe(1200);
    expect(p.cobPriority).toBe(2);
  });
});
