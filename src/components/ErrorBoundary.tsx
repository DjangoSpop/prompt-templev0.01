'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getErrorBoundaryFallback, errorLogger } from '@/lib/errors/error-handler';
import { AppError } from '@/types/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our centralized error logger
    errorLogger.log({
      message: error.message,
      code: 'REACT_ERROR',
      statusCode: 500,
      context: {
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Get error details
      const errorDetails = getErrorBoundaryFallback(
        this.state.error || new Error('Unknown error')
      );

      // Render error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {errorDetails.title}
              </h1>
              <p className="text-temple-stone">
                {errorDetails.description}
              </p>
              {this.state.error && (
                <details className="text-xs text-left mt-4 p-4 bg-muted rounded-md">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Technical Details
                  </summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="bg-pharaoh-gold hover:bg-pharaoh-gold/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {errorDetails.action || 'Reload'}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}