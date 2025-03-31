import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Something went wrong
            </h2>
            <p className="text-muted-foreground">
              An error occurred while rendering this component
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-2 w-full max-w-xl overflow-auto rounded-md bg-slate-950 p-4 text-sm text-white">
                {this.state.error?.message}
              </pre>
            )}
          </div>
          <Button onClick={this.handleReload}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
