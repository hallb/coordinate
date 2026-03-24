/**
 * CalendarDate: date without time zone, ISO 8601 format (YYYY-MM-DD).
 * Per 03-data-model.md.
 */
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CalendarDate {
  private readonly _iso: string;

  private constructor(iso: string) {
    if (!DATE_ONLY_REGEX.test(iso)) {
      throw new Error(`Invalid CalendarDate format: ${iso}`);
    }
    const d = new Date(iso + "T12:00:00Z");
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid date: ${iso}`);
    }
    this._iso = iso;
  }

  static fromString(iso: string): CalendarDate {
    return new CalendarDate(iso);
  }

  static fromDate(d: Date): CalendarDate {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return new CalendarDate(`${y}-${m}-${day}`);
  }

  get iso(): string {
    return this._iso;
  }

  toDate(): Date {
    return new Date(this._iso + "T12:00:00Z");
  }

  isBefore(other: CalendarDate): boolean {
    return this._iso < other._iso;
  }

  isAfter(other: CalendarDate): boolean {
    return this._iso > other._iso;
  }

  isSameOrBefore(other: CalendarDate): boolean {
    return this._iso <= other._iso;
  }

  isSameOrAfter(other: CalendarDate): boolean {
    return this._iso >= other._iso;
  }

  equals(other: CalendarDate): boolean {
    return this._iso === other._iso;
  }

  toString(): string {
    return this._iso;
  }
}
