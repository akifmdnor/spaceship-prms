import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[Mission Control]", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f12] px-6">
          <div className="max-w-lg border border-[#ff4d4d]/50 bg-black/40 p-6 text-center">
            <p className="title-font text-lg text-[#ff4d4d]">
              Control link interrupted
            </p>
            <p className="mt-2 text-sm text-sky-200/80">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
