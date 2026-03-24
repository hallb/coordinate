/**
 * Serialize domain entities to/from plain DB records.
 * Used by Dexie adapters. Per 03-data-model (nested JSON within aggregate root).
 */
import {
  type Person,
  Person as PersonEntity,
  type Household,
  Household as HouseholdEntity,
  HouseholdMembership,
  type Coverage,
  Coverage as CoverageEntity,
  CoverageMembership,
  BenefitCategory,
  AnnualMaximum,
  PersonName,
  CalendarDate,
  Money,
  Insurer,
  MonthDay,
  Percentage,
} from "../../domain";

export interface PersonRecord {
  id: string;
  name: { givenName: string; familyName: string; additionalNames?: string };
  dateOfBirth: string;
}

function personNameFromRecord(r: {
  givenName: string;
  familyName: string;
  additionalNames?: string;
}): PersonName {
  return PersonName.create({
    givenName: r.givenName,
    familyName: r.familyName,
    ...(r.additionalNames && { additionalNames: r.additionalNames }),
  });
}

export function personToRecord(p: Person): PersonRecord {
  return {
    id: p.id,
    name: {
      givenName: p.name.givenName,
      familyName: p.name.familyName,
      ...(p.name.additionalNames && {
        additionalNames: p.name.additionalNames,
      }),
    },
    dateOfBirth: p.dateOfBirth.iso,
  };
}

export function recordToPerson(r: PersonRecord): Person {
  const name = personNameFromRecord(r.name);
  return new PersonEntity(r.id, name, CalendarDate.fromString(r.dateOfBirth));
}

export interface HouseholdRecord {
  id: string;
  name: string;
  memberships: Array<{ id: string; householdId: string; personId: string }>;
}

export function householdToRecord(h: Household): HouseholdRecord {
  return {
    id: h.id,
    name: h.name,
    memberships: h.memberships.map((m) => ({
      id: m.id,
      householdId: m.householdId,
      personId: m.personId,
    })),
  };
}

export function recordToHousehold(r: HouseholdRecord): Household {
  const memberships = r.memberships.map(
    (m) => new HouseholdMembership(m.id, m.householdId, m.personId)
  );
  return new HouseholdEntity({ id: r.id, name: r.name, memberships });
}

export interface CoverageRecord {
  id: string;
  householdId: string;
  insurer: { name: string; portalUrl?: string };
  coverageType: string;
  planYearStart: string;
  gracePeriodDays: number;
  active: boolean;
  effectiveDate: string;
  endDate?: string;
  cobPriority?: number;
  memberships: Array<{
    id: string;
    coverageId: string;
    personId: string;
    role: string;
  }>;
  benefitCategories: Array<{
    id: string;
    coverageId: string;
    name: string;
    coinsuranceRate?: number;
    limitWindowMode: string;
    limitCycleMonths: number;
  }>;
  annualMaxima: Array<{
    personId: string | null;
    windowStart: string;
    limit: number;
    used: number;
  }>;
}

export function coverageToRecord(c: Coverage): CoverageRecord {
  return {
    id: c.id,
    householdId: c.householdId,
    insurer: {
      name: c.insurer.name,
      ...(c.insurer.portalUrl && { portalUrl: c.insurer.portalUrl }),
    },
    coverageType: c.coverageType,
    planYearStart: c.planYearStart.value,
    gracePeriodDays: c.gracePeriodDays,
    active: c.active,
    effectiveDate: c.effectiveDate.iso,
    ...(c.endDate && { endDate: c.endDate.iso }),
    ...(c.cobPriority != null && { cobPriority: c.cobPriority }),
    memberships: c.memberships.map((m) => ({
      id: m.id,
      coverageId: m.coverageId,
      personId: m.personId,
      role: m.role,
    })),
    benefitCategories: c.benefitCategories.map((bc) => ({
      id: bc.id,
      coverageId: bc.coverageId,
      name: bc.name,
      ...(bc.coinsuranceRate && { coinsuranceRate: bc.coinsuranceRate.value }),
      limitWindowMode: bc.limitWindowMode,
      limitCycleMonths: bc.limitCycleMonths,
    })),
    annualMaxima: c.annualMaxima.map((am) => ({
      personId: am.personId,
      windowStart: am.windowStart.iso,
      limit: am.limit.amount,
      used: am.used.amount,
    })),
  };
}

export function recordToCoverage(r: CoverageRecord): Coverage {
  const insurer = Insurer.create({
    name: r.insurer.name,
    ...(r.insurer.portalUrl && { portalUrl: r.insurer.portalUrl }),
  });
  const planYearStart = MonthDay.fromString(r.planYearStart);
  const effectiveDate = CalendarDate.fromString(r.effectiveDate);
  const endDate = r.endDate ? CalendarDate.fromString(r.endDate) : undefined;
  const memberships = r.memberships.map(
    (m) =>
      new CoverageMembership(
        m.id,
        m.coverageId,
        m.personId,
        m.role as "Insured" | "Beneficiary"
      )
  );
  const benefitCategories = r.benefitCategories.map(
    (bc) =>
      new BenefitCategory(
        bc.id,
        bc.coverageId,
        bc.name,
        bc.coinsuranceRate != null
          ? Percentage.fromNumber(bc.coinsuranceRate)
          : undefined,
        bc.limitWindowMode as "PlanYear" | "ServiceDate",
        bc.limitCycleMonths
      )
  );
  const annualMaxima = r.annualMaxima.map(
    (am) =>
      new AnnualMaximum(
        am.personId,
        CalendarDate.fromString(am.windowStart),
        Money.fromNumber(am.limit),
        Money.fromNumber(am.used)
      )
  );
  return new CoverageEntity({
    id: r.id,
    householdId: r.householdId,
    insurer,
    coverageType: r.coverageType as
      | "GroupHealth"
      | "GroupDental"
      | "HCSA"
      | "PHSP",
    planYearStart,
    gracePeriodDays: r.gracePeriodDays,
    active: r.active,
    effectiveDate,
    endDate,
    cobPriority: r.cobPriority,
    memberships,
    benefitCategories,
    annualMaxima,
  });
}
