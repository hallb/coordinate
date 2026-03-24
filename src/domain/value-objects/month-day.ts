/**
 * MonthDay: month and day only (e.g. plan year start, birthday rule).
 * Format: MM-DD. Per 03-data-model.md.
 */
const MONTH_DAY_REGEX = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class MonthDay {
  private readonly _value: string;

  private constructor(value: string) {
    if (!MONTH_DAY_REGEX.test(value)) {
      throw new Error(`Invalid MonthDay format: ${value}`);
    }
    this._value = value;
  }

  static fromString(value: string): MonthDay {
    return new MonthDay(value);
  }

  /** @param month 1-12, day 1-31 */
  static from(month: number, day: number): MonthDay {
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return new MonthDay(`${m}-${d}`);
  }

  get value(): string {
    return this._value;
  }

  get month(): number {
    return parseInt(this._value.slice(0, 2), 10);
  }

  get day(): number {
    return parseInt(this._value.slice(3, 5), 10);
  }

  equals(other: MonthDay): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
