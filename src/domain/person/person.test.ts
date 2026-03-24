import { describe, it, expect } from "vitest";
import { Person } from "./person";
import { PersonName } from "../value-objects/person-name";
import { CalendarDate } from "../value-objects/calendar-date";

describe("Person aggregate", () => {
  it("creates with id, name, dateOfBirth", () => {
    const name = PersonName.create({ givenName: "Mira", familyName: "Jones" });
    const dob = CalendarDate.fromString("1990-05-15");
    const person = new Person("p-1", name, dob);
    expect(person.id).toBe("p-1");
    expect(person.displayName).toBe("Mira Jones");
    expect(person.dateOfBirth.iso).toBe("1990-05-15");
  });

  it("rejects missing id", () => {
    const name = PersonName.create({ givenName: "A", familyName: "B" });
    const dob = CalendarDate.fromString("1990-01-01");
    expect(() => new Person("", name, dob)).toThrow("id is required");
  });
});
