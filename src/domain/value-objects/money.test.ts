import { describe, it, expect } from "vitest";
import { Money, ZERO_MONEY } from "./money";

describe("Money", () => {
  it("creates from number and preserves two decimal precision", () => {
    const m = Money.fromNumber(125.456);
    expect(m.amount).toBe(125.46);
    expect(m.toString()).toBe("125.46");
  });

  it("rejects negative amount", () => {
    expect(() => Money.fromNumber(-1)).toThrow("non-negative");
  });

  it("adds and subtracts correctly", () => {
    const a = Money.fromNumber(100);
    const b = Money.fromNumber(25.5);
    expect(a.add(b).amount).toBe(125.5);
    expect(a.add(b).subtract(b).equals(a)).toBe(true);
  });

  it("subtract throws when result would be negative", () => {
    const a = Money.fromNumber(10);
    const b = Money.fromNumber(20);
    expect(() => a.subtract(b)).toThrow("negative");
  });

  it("parses from string", () => {
    const m = Money.fromString("99.99");
    expect(m.amount).toBe(99.99);
  });

  it("rejects invalid string format", () => {
    expect(() => Money.fromString("abc")).toThrow("Invalid");
    expect(() => Money.fromString("12.345")).toThrow("Invalid");
  });

  it("ZERO_MONEY is identity for add", () => {
    const m = Money.fromNumber(50);
    expect(m.add(ZERO_MONEY).equals(m)).toBe(true);
  });

  it("lessThan and lessThanOrEqual work", () => {
    const a = Money.fromNumber(10);
    const b = Money.fromNumber(20);
    expect(a.lessThan(b)).toBe(true);
    expect(a.lessThanOrEqual(b)).toBe(true);
    expect(b.lessThan(a)).toBe(false);
    expect(a.lessThanOrEqual(a)).toBe(true);
  });
});
