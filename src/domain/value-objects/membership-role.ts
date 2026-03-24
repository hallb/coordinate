/**
 * MembershipRole: Insured = primary subscriber, Beneficiary = dependent.
 * Per 03-data-model.md (GLO-004, GLO-005).
 */
export type MembershipRole = "Insured" | "Beneficiary";

export const MEMBERSHIP_ROLES: MembershipRole[] = ["Insured", "Beneficiary"];

export function isMembershipRole(s: string): s is MembershipRole {
  return MEMBERSHIP_ROLES.includes(s as MembershipRole);
}

export function assertMembershipRole(s: string): MembershipRole {
  if (!isMembershipRole(s)) {
    throw new Error(`Invalid MembershipRole: ${s}`);
  }
  return s;
}
