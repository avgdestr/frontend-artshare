import React from "react";

type State = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
          {this.state.error && (
            <div className="mt-3 p-3 bg-gray-100 text-sm text-left">
              <div className="font-semibold">Error:</div>
              <div>{String(this.state.error.message || this.state.error)}</div>
              {(import.meta as any).env?.DEV && this.state.error.stack && (
                <pre className="mt-2 text-xs">{this.state.error.stack}</pre>
              )}
            </div>
          )}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
