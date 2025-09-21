import { ApiError } from '../api/base';

export interface ErrorInfo {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  static formatError(error: unknown): ErrorInfo {
    const timestamp = new Date();

    if (error instanceof ApiError) {
      return {
        message: error.message,
        status: error.status,
        details: error.response,
        timestamp,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        timestamp,
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        timestamp,
      };
    }

    return {
      message: 'An unexpected error occurred',
      timestamp,
    };
  }

  static getErrorMessage(error: unknown): string {
    const errorInfo = this.formatError(error);
    return errorInfo.message;
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.status === 0 || error.message.includes('Network Error');
    }
    return false;
  }

  static isAuthError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.status === 401 || error.status === 403;
    }
    return false;
  }

  static isValidationError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.status === 400 || error.status === 422;
    }
    return false;
  }

  static isServerError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.status >= 500;
    }
    return false;
  }

  static getValidationErrors(error: unknown): Record<string, string[]> {
    if (error instanceof ApiError && this.isValidationError(error)) {
      return error.response?.errors || error.response || {};
    }
    return {};
  }

  static shouldRetry(error: unknown, attempt: number, maxRetries: number = 3): boolean {
    if (attempt >= maxRetries) return false;
    
    // Retry on server errors and network errors
    return this.isServerError(error) || this.isNetworkError(error);
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

export const formatApiError = (error: unknown): string => {
  return ErrorHandler.getErrorMessage(error);
};

export const isNetworkError = (error: unknown): boolean => {
  return ErrorHandler.isNetworkError(error);
};

export const isAuthError = (error: unknown): boolean => {
  return ErrorHandler.isAuthError(error);
};

export const isValidationError = (error: unknown): boolean => {
  return ErrorHandler.isValidationError(error);
};

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  return ErrorHandler.getValidationErrors(error);
};