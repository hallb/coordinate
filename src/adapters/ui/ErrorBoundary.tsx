import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled rendering errors and displays fallback UI.
 * Per 09-infrastructure-and-deployment.md: runtime errors surface via error boundary.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            style={{ padding: "1rem", fontFamily: "sans-serif" }}
          >
            <h2>Something went wrong</h2>
            <p>{this.state.error.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
