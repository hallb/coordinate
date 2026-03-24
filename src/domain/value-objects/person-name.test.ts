import { describe, it, expect } from "vitest";
import { PersonName } from "./person-name";

describe("PersonName", () => {
  it("creates with givenName and familyName", () => {
    const n = PersonName.create({ givenName: "Mira", familyName: "Jones" });
    expect(n.displayName).toBe("Mira Jones");
    expect(n.givenName).toBe("Mira");
    expect(n.familyName).toBe("Jones");
  });

  it("requires familyName", () => {
    expect(() =>
      PersonName.create({ givenName: "Mira", familyName: "" })
    ).toThrow("familyName is required");
  });

  it("displayName works with only familyName", () => {
    const n = PersonName.create({ givenName: "", familyName: "Jones" });
    expect(n.displayName).toBe("Jones");
  });

  it("equals compares all fields", () => {
    const a = PersonName.create({ givenName: "Mira", familyName: "Jones" });
    const b = PersonName.create({ givenName: "Mira", familyName: "Jones" });
    const c = PersonName.create({ givenName: "Mira", familyName: "Smith" });
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
