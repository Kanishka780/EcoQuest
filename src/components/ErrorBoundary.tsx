"use client";
 
import React, { Component, ErrorInfo } from "react";
 
interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback UI */
  fallback?: React.ReactNode;
  /** Optional error handler callback */
  onError?: (error: Error, info: ErrorInfo) => void;
}
 
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
 
/**
 * Error boundary that catches rendering errors in the component tree.
 * Displays a user-friendly fallback and prevents the whole page from crashing.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
 
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
 
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to monitoring service in production
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
    this.props.onError?.(error, info);
  }
 
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };
 
  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
 
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center"
        >
          <div aria-hidden="true" className="text-4xl">
            🌱
          </div>
          <h2 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-red-600">
            {this.state.error?.message ??
              "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Try again — reload this section"
          >
            Try again
          </button>
        </div>
      );
    }
 
    return this.props.children;
  }
}
 
export default ErrorBoundary;
