/**
 * Comprehensive error handling system
 * Provides centralized error processing, logging, and user feedback
 */

import { toast } from 'sonner';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  APIError,
} from '@/types/core';

// ============================================
// Error Logger
// ============================================

interface ErrorLogEntry {
  timestamp: string;
  error: AppError;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs: number = 100;

  log(error: AppError, context?: Record<string, unknown>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error,
      context,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorLogger]', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        stack: error.stack,
      });
    }

    // Send to error tracking service (e.g., Sentry)
    this.sendToErrorService(entry);
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return undefined;
    }
  }

  private sendToErrorService(entry: ErrorLogEntry): void {
    // Integration point for Sentry, LogRocket, etc.
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // window.Sentry?.captureException(entry.error, {
      //   contexts: { errorContext: entry.context },
      //   user: { id: entry.userId },
      //   tags: {
      //     errorCode: entry.error.code,
      //     sessionId: entry.sessionId,
      //   },
      // });
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

// ============================================
// Error Parser
// ============================================

export function parseAPIError(error: unknown): AppError {
  // Handle AppError instances
  if (error instanceof AppError) {
    return error;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network request failed. Please check your connection.');
  }

  // Handle Response objects
  if (error instanceof Response) {
    return new AppError(
      `Request failed with status ${error.status}`,
      'API_ERROR',
      error.status
    );
  }

  // Handle API error responses
  if (isAPIErrorResponse(error)) {
    const apiError = error as { errors?: APIError[]; message?: string; statusCode?: number };
    const firstError = apiError.errors?.[0];
    
    if (firstError) {
      return new AppError(
        firstError.message,
        firstError.code,
        apiError.statusCode || 500
      );
    }
    
    return new AppError(
      apiError.message || 'An error occurred',
      'API_ERROR',
      apiError.statusCode || 500
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', 500);
  }

  // Fallback
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

function isAPIErrorResponse(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('errors' in error || 'message' in error)
  );
}

// ============================================
// Error Handler
// ============================================

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  rethrow?: boolean;
  context?: Record<string, unknown>;
  customMessage?: string;
}

const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logError: true,
  rethrow: false,
};

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const opts = { ...defaultOptions, ...options };
  const appError = parseAPIError(error);

  // Log the error
  if (opts.logError) {
    errorLogger.log(appError, opts.context);
  }

  // Show user-friendly toast notification
  if (opts.showToast) {
    showErrorToast(appError, opts.customMessage);
  }

  // Rethrow if needed
  if (opts.rethrow) {
    throw appError;
  }

  return appError;
}

function showErrorToast(error: AppError, customMessage?: string): void {
  const message = customMessage || getUserFriendlyMessage(error);
  
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      toast.error('Authentication Required', {
        description: message,
        action: {
          label: 'Sign In',
          onClick: () => {
            window.location.href = '/auth/login';
          },
        },
      });
      break;

    case 'AUTHORIZATION_ERROR':
      toast.error('Access Denied', {
        description: message,
      });
      break;

    case 'VALIDATION_ERROR':
      toast.error('Validation Error', {
        description: message,
      });
      break;

    case 'RATE_LIMIT':
      toast.error('Rate Limit Exceeded', {
        description: message,
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            window.location.href = '/pricing';
          },
        },
      });
      break;

    case 'NETWORK_ERROR':
      toast.error('Connection Error', {
        description: message,
        action: {
          label: 'Retry',
          onClick: () => {
            window.location.reload();
          },
        },
      });
      break;

    case 'NOT_FOUND':
      toast.error('Not Found', {
        description: message,
      });
      break;

    default:
      toast.error('Error', {
        description: message,
      });
  }
}

function getUserFriendlyMessage(error: AppError): string {
  const friendlyMessages: Record<string, string> = {
    AUTHENTICATION_ERROR: 'Please sign in to continue.',
    AUTHORIZATION_ERROR: "You don't have permission to perform this action.",
    VALIDATION_ERROR: 'Please check your input and try again.',
    RATE_LIMIT: 'You have exceeded the rate limit. Please try again later.',
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    NOT_FOUND: 'The requested resource could not be found.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  };

  return friendlyMessages[error.code] || error.message;
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  onRetry?: (attempt: number, error: AppError) => void;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: AppError | null = null;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseAPIError(error);

      // Don't retry if error is not retryable
      if (
        lastError.statusCode > 0 &&
        !opts.retryableStatusCodes.includes(lastError.statusCode)
      ) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Call retry callback
      opts.onRetry(attempt, lastError);

      // Wait before retrying
      await sleep(delay);

      // Increase delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError || new AppError('Retry failed', 'RETRY_FAILED', 500);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Error Boundary Helpers
// ============================================

export function getErrorBoundaryFallback(error: Error): {
  title: string;
  description: string;
  action?: string;
} {
  if (error.message.includes('chunk')) {
    return {
      title: 'Update Required',
      description: 'A new version is available. Please refresh the page.',
      action: 'Refresh',
    };
  }

  if (error.message.includes('network')) {
    return {
      title: 'Connection Lost',
      description: 'Unable to reach the server. Please check your connection.',
      action: 'Retry',
    };
  }

  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    action: 'Reload',
  };
}

// ============================================
// Validation Helpers
// ============================================

export function createValidationError(
  field: string,
  message: string
): ValidationError {
  return new ValidationError(message, { field });
}

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw createValidationError(fieldName, `${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createValidationError('email', 'Invalid email address');
  }
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): void {
  if (value.length < minLength) {
    throw createValidationError(
      fieldName,
      `${fieldName} must be at least ${minLength} characters`
    );
  }
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): void {
  if (value.length > maxLength) {
    throw createValidationError(
      fieldName,
      `${fieldName} must be at most ${maxLength} characters`
    );
  }
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw createValidationError(
      fieldName,
      `${fieldName} must be between ${min} and ${max}`
    );
  }
}
