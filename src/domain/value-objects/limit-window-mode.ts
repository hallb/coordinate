/**
 * LimitWindowMode: PlanYear = calendar-aligned; ServiceDate = rolling window.
 * Per 03-data-model.md.
 */
export type LimitWindowMode = "PlanYear" | "ServiceDate";

export const LIMIT_WINDOW_MODES: LimitWindowMode[] = [
  "PlanYear",
  "ServiceDate",
];

export function isLimitWindowMode(s: string): s is LimitWindowMode {
  return LIMIT_WINDOW_MODES.includes(s as LimitWindowMode);
}

export function assertLimitWindowMode(s: string): LimitWindowMode {
  if (!isLimitWindowMode(s)) {
    throw new Error(`Invalid LimitWindowMode: ${s}`);
  }
  return s;
}
