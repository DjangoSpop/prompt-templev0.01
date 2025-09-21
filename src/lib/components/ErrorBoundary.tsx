'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorHandler } from '../utils/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error
        ? ErrorHandler.getErrorMessage(this.state.error)
        : 'Something went wrong';

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Something went wrong</div>
            <div className="text-gray-600 text-sm mb-4">{errorMessage}</div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}