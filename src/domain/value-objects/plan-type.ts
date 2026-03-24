/**
 * PlanType: coverage type. Per 03-data-model.md.
 */
export type PlanType = "GroupHealth" | "GroupDental" | "HCSA" | "PHSP";

export const PLAN_TYPES: PlanType[] = [
  "GroupHealth",
  "GroupDental",
  "HCSA",
  "PHSP",
];

export function isPlanType(s: string): s is PlanType {
  return PLAN_TYPES.includes(s as PlanType);
}

export function assertPlanType(s: string): PlanType {
  if (!isPlanType(s)) {
    throw new Error(`Invalid PlanType: ${s}`);
  }
  return s;
}
