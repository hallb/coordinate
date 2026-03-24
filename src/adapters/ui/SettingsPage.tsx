import React from "react";
import { SettingsHouseholdSection } from "./SettingsHouseholdSection";
import { SettingsCoverageSection } from "./SettingsCoverageSection";

export function SettingsPage(): React.ReactElement {
  return (
    <div>
      <h1>Settings</h1>
      <SettingsHouseholdSection />
      <SettingsCoverageSection />
    </div>
  );
}
