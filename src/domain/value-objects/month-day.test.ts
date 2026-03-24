import { describe, it, expect } from "vitest";
import { MonthDay } from "./month-day";

describe("MonthDay", () => {
  it("parses valid MM-DD", () => {
    const md = MonthDay.fromString("01-01");
    expect(md.value).toBe("01-01");
    expect(md.month).toBe(1);
    expect(md.day).toBe(1);
  });

  it("creates from month and day", () => {
    const md = MonthDay.from(9, 15);
    expect(md.value).toBe("09-15");
  });

  it("rejects invalid format", () => {
    expect(() => MonthDay.fromString("1-1")).toThrow("Invalid");
    expect(() => MonthDay.fromString("13-01")).toThrow("Invalid");
  });

  it("equals works", () => {
    const a = MonthDay.fromString("01-01");
    const b = MonthDay.fromString("01-01");
    expect(a.equals(b)).toBe(true);
  });
});
