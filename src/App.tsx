import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "@/adapters/ui/ErrorBoundary";
import { AppLayout } from "@/adapters/ui/AppLayout";
import { ClaimsPage } from "@/adapters/ui/ClaimsPage";
import { PlansPage } from "@/adapters/ui/PlansPage";
import { SettingsPage } from "@/adapters/ui/SettingsPage";

/** AntD 5 custom theme tokens per 05-ui-ux.md */
const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 6,
  },
};

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/claims" replace />} />
              <Route path="claims" element={<ClaimsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
