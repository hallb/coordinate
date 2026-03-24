import type { PersonRepository } from "../domain/ports/person-repository";
import type { HouseholdRepository } from "../domain/ports/household-repository";
import type { CoverageRepository } from "../domain/ports/coverage-repository";
import type {
  PersonId,
  HouseholdId,
  MembershipId,
  CoverageId,
} from "../domain/ids";
import { Person } from "../domain/person";
import { Household } from "../domain/household";
import { HouseholdMembership } from "../domain/household";
import {
  Coverage,
  CoverageMembership,
  BenefitCategory,
  AnnualMaximum,
} from "../domain/coverage";
import { PersonName } from "../domain/value-objects/person-name";
import { CalendarDate } from "../domain/value-objects/calendar-date";
import { Insurer } from "../domain/value-objects/insurer";
import { MonthDay } from "../domain/value-objects/month-day";
import { Money } from "../domain/value-objects/money";
import { Percentage } from "../domain/value-objects/percentage";

/**
 * ConfigurePlanUseCase: CRUD for Person, Household, Coverage.
 * FR-040, FR-041, FR-042. Per ISS-58.
 */
export class ConfigurePlanUseCase {
  constructor(
    private readonly personRepo: PersonRepository,
    private readonly householdRepo: HouseholdRepository,
    private readonly coverageRepo: CoverageRepository
  ) {}

  // --- Person ---
  async createPerson(params: {
    id: PersonId;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    additionalNames?: string;
  }): Promise<Person> {
    const name = PersonName.create({
      givenName: params.givenName,
      familyName: params.familyName,
      ...(params.additionalNames && {
        additionalNames: params.additionalNames,
      }),
    });
    const person = new Person(
      params.id,
      name,
      CalendarDate.fromString(params.dateOfBirth)
    );
    await this.personRepo.save(person);
    return person;
  }

  async getPerson(id: PersonId): Promise<Person | undefined> {
    return this.personRepo.get(id);
  }

  async updatePerson(person: Person): Promise<void> {
    await this.personRepo.save(person);
  }

  async listPersons(): Promise<Person[]> {
    return this.personRepo.getAll();
  }

  // --- Household ---
  async createHousehold(params: {
    id: HouseholdId;
    name: string;
  }): Promise<Household> {
    const household = new Household({
      id: params.id,
      name: params.name,
      memberships: [],
    });
    await this.householdRepo.save(household);
    return household;
  }

  async getHousehold(id: HouseholdId): Promise<Household | undefined> {
    return this.householdRepo.get(id);
  }

  async addMemberToHousehold(
    householdId: HouseholdId,
    membershipId: MembershipId,
    personId: PersonId
  ): Promise<Household> {
    const household = await this.householdRepo.get(householdId);
    if (!household) throw new Error(`Household ${householdId} not found`);
    const newMembership = new HouseholdMembership(
      membershipId,
      householdId,
      personId
    );
    const memberships = [...household.memberships, newMembership];
    const updated = new Household({
      id: household.id,
      name: household.name,
      memberships,
    });
    await this.householdRepo.save(updated);
    return updated;
  }

  async removeMemberFromHousehold(
    householdId: HouseholdId,
    membershipId: MembershipId
  ): Promise<Household> {
    const household = await this.householdRepo.get(householdId);
    if (!household) throw new Error(`Household ${householdId} not found`);
    const memberships = household.memberships.filter(
      (m) => m.id !== membershipId
    );
    const updated = new Household({
      id: household.id,
      name: household.name,
      memberships,
    });
    await this.householdRepo.save(updated);
    return updated;
  }

  async listHouseholds(): Promise<Household[]> {
    return this.householdRepo.getAll();
  }

  // --- Coverage ---
  async createCoverage(params: {
    id: CoverageId;
    householdId: HouseholdId;
    insurerName: string;
    insurerPortalUrl?: string;
    coverageType: "GroupHealth" | "GroupDental" | "HCSA" | "PHSP";
    planYearStart: string;
    gracePeriodDays: number;
    effectiveDate: string;
    active?: boolean;
    cobPriority?: number;
    insuredPersonId: PersonId;
    insuredMembershipId: string;
    beneficiaryPersonIds?: Array<{ personId: PersonId; membershipId: string }>;
    benefitCategories: Array<{
      id: import("../domain/ids").CategoryId;
      name: string;
      coinsuranceRate?: number;
      limitWindowMode: "PlanYear" | "ServiceDate";
      limitCycleMonths: number;
    }>;
    annualMaxima: Array<{
      personId: PersonId | null;
      windowStart: string;
      limit: number;
      used?: number;
    }>;
  }): Promise<Coverage> {
    const insurer = Insurer.create({
      name: params.insurerName,
      ...(params.insurerPortalUrl && { portalUrl: params.insurerPortalUrl }),
    });
    const memberships: CoverageMembership[] = [
      new CoverageMembership(
        params.insuredMembershipId,
        params.id,
        params.insuredPersonId,
        "Insured"
      ),
      ...(params.beneficiaryPersonIds ?? []).map(
        (b) =>
          new CoverageMembership(
            b.membershipId as import("../domain/ids").CoverageMembershipId,
            params.id,
            b.personId,
            "Beneficiary"
          )
      ),
    ];
    const benefitCategories = params.benefitCategories.map(
      (bc) =>
        new BenefitCategory(
          bc.id,
          params.id,
          bc.name,
          bc.coinsuranceRate != null
            ? Percentage.fromNumber(bc.coinsuranceRate)
            : undefined,
          bc.limitWindowMode,
          bc.limitCycleMonths
        )
    );
    const annualMaxima = params.annualMaxima.map(
      (am) =>
        new AnnualMaximum(
          am.personId,
          CalendarDate.fromString(am.windowStart),
          Money.fromNumber(am.limit),
          am.used != null ? Money.fromNumber(am.used) : Money.fromNumber(0)
        )
    );
    const coverage = new Coverage({
      id: params.id,
      householdId: params.householdId,
      insurer,
      coverageType: params.coverageType,
      planYearStart: MonthDay.fromString(params.planYearStart),
      gracePeriodDays: params.gracePeriodDays,
      active: params.active ?? true,
      effectiveDate: CalendarDate.fromString(params.effectiveDate),
      memberships,
      benefitCategories,
      annualMaxima,
    });
    await this.coverageRepo.save(coverage);
    return coverage;
  }

  async getCoverage(id: CoverageId): Promise<Coverage | undefined> {
    return this.coverageRepo.get(id);
  }

  async getCoveragesByHousehold(householdId: HouseholdId): Promise<Coverage[]> {
    return this.coverageRepo.getByHousehold(householdId);
  }

  async saveCoverage(coverage: Coverage): Promise<void> {
    await this.coverageRepo.save(coverage);
  }

  async listCoverages(): Promise<Coverage[]> {
    return this.coverageRepo.getAll();
  }
}
