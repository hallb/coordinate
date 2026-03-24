import { describe, it, expect } from "vitest";
import { Household } from "./household";
import { HouseholdMembership } from "./household-membership";

describe("Household aggregate", () => {
  it("creates with id, name, memberships", () => {
    const memberships = [
      new HouseholdMembership("m-1", "h-1", "p-1"),
      new HouseholdMembership("m-2", "h-1", "p-2"),
    ];
    const h = new Household({ id: "h-1", name: "Hall Family", memberships });
    expect(h.id).toBe("h-1");
    expect(h.name).toBe("Hall Family");
    expect(h.memberships).toHaveLength(2);
  });

  it("hasMember returns true when personId is in memberships", () => {
    const memberships = [new HouseholdMembership("m-1", "h-1", "p-1")];
    const h = new Household({ id: "h-1", name: "Test", memberships });
    expect(h.hasMember("p-1")).toBe(true);
    expect(h.hasMember("p-2")).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      () => new Household({ id: "h-1", name: "  ", memberships: [] })
    ).toThrow("name is required");
  });
});
