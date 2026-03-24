import type { PersonId } from "../ids";
import { CalendarDate } from "../value-objects/calendar-date";
import { Money } from "../value-objects/money";

/**
 * AnnualMaximum value object. Per 03-data-model.md.
 * Identity: (categoryId, personId?, windowStart).
 */
export interface AnnualMaximumData {
  personId: PersonId | null;
  windowStart: CalendarDate;
  limit: Money;
  used: Money;
}

export class AnnualMaximum {
  constructor(
    public readonly personId: PersonId | null,
    public readonly windowStart: CalendarDate,
    public readonly limit: Money,
    public readonly used: Money,
  ) {
    if (used.lessThan(Money.fromNumber(0)) || limit.lessThan(Money.fromNumber(0))) {
      throw new Error("AnnualMaximum limit and used must be non-negative");
    }
    if (limit.lessThan(used)) {
      throw new Error("AnnualMaximum used cannot exceed limit");
    }
  }
}
