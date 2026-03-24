import type { PersonId } from "../ids";
import { PersonName } from "../value-objects/person-name";
import { CalendarDate } from "../value-objects/calendar-date";

/**
 * Person aggregate. Single identity across households (GLO-002, FR-040).
 * Per 03-data-model.md.
 */
export class Person {
  constructor(
    public readonly id: PersonId,
    public readonly name: PersonName,
    public readonly dateOfBirth: CalendarDate
  ) {
    if (!id || typeof id !== "string") {
      throw new Error("Person id is required");
    }
  }

  get displayName(): string {
    return this.name.displayName;
  }
}
