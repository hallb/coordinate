/**
 * Percentage: decimal 0–100, 2 decimal places. Used for coinsurance rates.
 * Per 03-data-model.md.
 */
export class Percentage {
  private readonly _value: number;

  private constructor(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }
    this._value = Math.round(value * 100) / 100;
  }

  static fromNumber(value: number): Percentage {
    return new Percentage(value);
  }

  get value(): number {
    return this._value;
  }

  equals(other: Percentage): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }
}
