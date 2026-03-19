import { describe, it, expect, beforeEach } from "vitest";
import { CoordinateDB } from "./db";

describe("CoordinateDB v001 schema", () => {
  let db: CoordinateDB;

  beforeEach(() => {
    db = new CoordinateDB(`CoordinateDB-test-${Date.now()}`);
  });

  it("creates DB and allows add/read for each store", async () => {
    await db.persons.add({
      id: "p-1",
      name: { givenName: "Test", familyName: "User" },
      dateOfBirth: "1990-01-01",
    });
    await db.households.add({ id: "h-1", name: "Test Household" });
    await db.external_coverages.add({
      id: "ec-1",
      householdId: "h-1",
      personId: "p-1",
      insurerName: "Other",
      planType: "GroupHealth",
      cobPositionHint: "primary",
    });
    await db.coverages.add({
      id: "c-1",
      householdId: "h-1",
      insurer: { name: "Insurer" },
      coverageType: "GroupHealth",
      planYearStart: "01-01",
      gracePeriodDays: 90,
      active: true,
    });
    await db.expenses.add({
      id: "e-1",
      householdId: "h-1",
      personId: "p-1",
      category: "Dental",
      serviceDate: "2026-01-15",
      providerName: "Dr. Test",
      originalAmount: 100,
      remainingBalance: 100,
    });

    const person = await db.persons.get("p-1");
    const household = await db.households.get("h-1");
    const ext = await db.external_coverages.get("ec-1");
    const cov = await db.coverages.get("c-1");
    const exp = await db.expenses.get("e-1");

    expect(person?.name.familyName).toBe("User");
    expect(household?.name).toBe("Test Household");
    expect(ext?.insurerName).toBe("Other");
    expect(cov?.coverageType).toBe("GroupHealth");
    expect(exp?.remainingBalance).toBe(100);
  });
});
