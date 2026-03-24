import { describe, it, expect } from "vitest";
import { CalendarDate } from "./calendar-date";

describe("CalendarDate", () => {
  it("parses valid ISO date", () => {
    const d = CalendarDate.fromString("2026-03-15");
    expect(d.iso).toBe("2026-03-15");
    expect(d.toString()).toBe("2026-03-15");
  });

  it("rejects invalid format", () => {
    expect(() => CalendarDate.fromString("03/15/2026")).toThrow("Invalid");
    expect(() => CalendarDate.fromString("2026-13-01")).toThrow();
  });

  it("isBefore and isAfter work", () => {
    const a = CalendarDate.fromString("2026-01-01");
    const b = CalendarDate.fromString("2026-06-15");
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
    expect(a.equals(b)).toBe(false);
    expect(a.equals(CalendarDate.fromString("2026-01-01"))).toBe(true);
  });

  it("isSameOrBefore and isSameOrAfter work", () => {
    const a = CalendarDate.fromString("2026-01-01");
    const b = CalendarDate.fromString("2026-01-01");
    const c = CalendarDate.fromString("2026-02-01");
    expect(a.isSameOrBefore(b)).toBe(true);
    expect(a.isSameOrAfter(b)).toBe(true);
    expect(a.isSameOrBefore(c)).toBe(true);
    expect(c.isSameOrAfter(a)).toBe(true);
  });
});
