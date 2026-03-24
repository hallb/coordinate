import { describe, it, expect, beforeEach } from "vitest";
import { CoordinateDB } from "./db";
import { PersonDexieRepository } from "./person-repository";
import { HouseholdDexieRepository } from "./household-repository";
import { CoverageDexieRepository } from "./coverage-repository";
import { ConfigurePlanUseCase } from "../../application/configure-plan-usecase";

describe("ConfigurePlanUseCase integration", () => {
  let db: CoordinateDB;
  let useCase: ConfigurePlanUseCase;

  beforeEach(() => {
    db = new CoordinateDB(`test-${Date.now()}`);
    const personRepo = new PersonDexieRepository(db);
    const householdRepo = new HouseholdDexieRepository(db);
    const coverageRepo = new CoverageDexieRepository(db);
    useCase = new ConfigurePlanUseCase(personRepo, householdRepo, coverageRepo);
  });

  it("creates household, adds persons, adds coverage and persists", async () => {
    await useCase.createPerson({
      id: "p-1",
      givenName: "Ben",
      familyName: "Hall",
      dateOfBirth: "1982-04-15",
    });
    await useCase.createPerson({
      id: "p-2",
      givenName: "Sobia",
      familyName: "Hall",
      dateOfBirth: "1984-09-22",
    });

    const household = await useCase.createHousehold({
      id: "h-1",
      name: "Hall Family",
    });
    expect(household.name).toBe("Hall Family");

    await useCase.addMemberToHousehold("h-1", "m-1", "p-1");
    await useCase.addMemberToHousehold("h-1", "m-2", "p-2");

    const householdLoaded = await useCase.getHousehold("h-1");
    expect(householdLoaded?.memberships).toHaveLength(2);

    await useCase.createCoverage({
      id: "cov-1",
      householdId: "h-1",
      insurerName: "Sun Life",
      coverageType: "GroupHealth",
      planYearStart: "01-01",
      gracePeriodDays: 90,
      effectiveDate: "2026-01-01",
      insuredPersonId: "p-1",
      insuredMembershipId: "cm-1",
      beneficiaryPersonIds: [{ personId: "p-2", membershipId: "cm-2" }],
      benefitCategories: [
        {
          id: "cat-1",
          name: "Paramedical",
          limitWindowMode: "PlanYear",
          limitCycleMonths: 12,
        },
      ],
      annualMaxima: [
        {
          personId: "p-1",
          windowStart: "2026-01-01",
          limit: 500,
          used: 0,
        },
      ],
    });

    const coverage = await useCase.getCoverage("cov-1");
    expect(coverage).toBeDefined();
    expect(coverage?.insurer.name).toBe("Sun Life");
    expect(coverage?.benefitCategories).toHaveLength(1);
    expect(coverage?.memberships).toHaveLength(2);

    const byHousehold = await useCase.getCoveragesByHousehold("h-1");
    expect(byHousehold).toHaveLength(1);
  });

  it("cross-aggregate: person and household consistency", async () => {
    await useCase.createPerson({
      id: "p-1",
      givenName: "A",
      familyName: "B",
      dateOfBirth: "1990-01-01",
    });
    await useCase.createHousehold({ id: "h-1", name: "H1" });
    await useCase.addMemberToHousehold("h-1", "m-1", "p-1");

    const person = await useCase.getPerson("p-1");
    const household = await useCase.getHousehold("h-1");
    expect(person?.displayName).toBe("A B");
    expect(household?.hasMember("p-1")).toBe(true);
  });
});
