/**
 * Household context switcher. MVP: placeholder; re-scopes all tabs when selected.
 * Per 05-ui-ux.md: persistent header chip/dropdown.
 */
import React from "react";

export function HouseholdSwitcher(): React.ReactElement {
  return (
    <span
      style={{ fontSize: "0.875rem", color: "inherit" }}
      aria-label="Household context"
    >
      My Household
    </span>
  );
}
