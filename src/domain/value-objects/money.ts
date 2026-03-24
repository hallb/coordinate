/**
 * Money: non-negative decimal amount in CAD. Precision: 2 decimal places.
 * Per 03-data-model.md.
 */
const MONEY_REGEX = /^\d+(\.\d{1,2})?$/;

function roundToTwo(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export class Money {
  private readonly _cents: number;

  private constructor(cents: number) {
    if (cents < 0 || !Number.isFinite(cents)) {
      throw new Error("Money must be non-negative and finite");
    }
    this._cents = Math.round(cents);
  }

  static fromNumber(amount: number): Money {
    if (amount < 0 || !Number.isFinite(amount)) {
      throw new Error("Money must be non-negative and finite");
    }
    return new Money(Math.round(amount * 100));
  }

  static fromString(s: string): Money {
    const trimmed = s.trim();
    if (!MONEY_REGEX.test(trimmed)) {
      throw new Error(`Invalid Money format: ${s}`);
    }
    return Money.fromNumber(parseFloat(trimmed));
  }

  get amount(): number {
    return roundToTwo(this._cents / 100);
  }

  add(other: Money): Money {
    return new Money(this._cents + other._cents);
  }

  subtract(other: Money): Money {
    const result = this._cents - other._cents;
    if (result < 0) throw new Error("Money result would be negative");
    return new Money(result);
  }

  equals(other: Money): boolean {
    return this._cents === other._cents;
  }

  lessThan(other: Money): boolean {
    return this._cents < other._cents;
  }

  lessThanOrEqual(other: Money): boolean {
    return this._cents <= other._cents;
  }

  toString(): string {
    return this.amount.toFixed(2);
  }
}

export const ZERO_MONEY = Money.fromNumber(0);
