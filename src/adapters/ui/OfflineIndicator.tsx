import { useState, useEffect } from "react";

/**
 * Slim banner when navigator.onLine === false. Per 05-ui-ux and 09-infrastructure.
 */
export function OfflineIndicator(): React.ReactElement | null {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = (): void => setOnline(true);
    const onOffline = (): void => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: "0.25rem 1rem",
        background: "var(--ant-color-warning)",
        color: "var(--ant-color-warning-contrast)",
        textAlign: "center",
        fontSize: "0.875rem",
      }}
    >
      You are offline. Data is saved locally.
    </div>
  );
}
