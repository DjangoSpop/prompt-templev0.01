import { describe, it, expect } from 'vitest';
import { ErrorHandler, formatApiError, isNetworkError, isAuthError } from '../../utils/error-handling';
import { ApiError } from '../../api/base';

describe('ErrorHandler', () => {
  describe('formatError', () => {
    it('should format ApiError correctly', () => {
      const apiError = new ApiError('Invalid request', 400, { field: 'username' });
      const formatted = ErrorHandler.formatError(apiError);

      expect(formatted.message).toBe('Invalid request');
      expect(formatted.status).toBe(400);
      expect(formatted.details).toEqual({ field: 'username' });
      expect(formatted.timestamp).toBeInstanceOf(Date);
    });

    it('should format regular Error correctly', () => {
      const error = new Error('Something went wrong');
      const formatted = ErrorHandler.formatError(error);

      expect(formatted.message).toBe('Something went wrong');
      expect(formatted.status).toBeUndefined();
      expect(formatted.timestamp).toBeInstanceOf(Date);
    });

    it('should format string error correctly', () => {
      const error = 'String error message';
      const formatted = ErrorHandler.formatError(error);

      expect(formatted.message).toBe('String error message');
      expect(formatted.timestamp).toBeInstanceOf(Date);
    });

    it('should format unknown error correctly', () => {
      const error = { some: 'object' };
      const formatted = ErrorHandler.formatError(error);

      expect(formatted.message).toBe('An unexpected error occurred');
      expect(formatted.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('error type detection', () => {
    it('should detect network errors', () => {
      const networkError = new ApiError('Network Error', 0);
      expect(ErrorHandler.isNetworkError(networkError)).toBe(true);

      const messageError = new ApiError('Request failed with Network Error', 500);
      expect(ErrorHandler.isNetworkError(messageError)).toBe(true);

      const regularError = new ApiError('Bad request', 400);
      expect(ErrorHandler.isNetworkError(regularError)).toBe(false);
    });

    it('should detect auth errors', () => {
      const unauthorizedError = new ApiError('Unauthorized', 401);
      expect(ErrorHandler.isAuthError(unauthorizedError)).toBe(true);

      const forbiddenError = new ApiError('Forbidden', 403);
      expect(ErrorHandler.isAuthError(forbiddenError)).toBe(true);

      const badRequestError = new ApiError('Bad request', 400);
      expect(ErrorHandler.isAuthError(badRequestError)).toBe(false);
    });

    it('should detect validation errors', () => {
      const badRequestError = new ApiError('Validation failed', 400);
      expect(ErrorHandler.isValidationError(badRequestError)).toBe(true);

      const unprocessableError = new ApiError('Unprocessable entity', 422);
      expect(ErrorHandler.isValidationError(unprocessableError)).toBe(true);

      const serverError = new ApiError('Internal error', 500);
      expect(ErrorHandler.isValidationError(serverError)).toBe(false);
    });

    it('should detect server errors', () => {
      const internalError = new ApiError('Internal server error', 500);
      expect(ErrorHandler.isServerError(internalError)).toBe(true);

      const badGatewayError = new ApiError('Bad gateway', 502);
      expect(ErrorHandler.isServerError(badGatewayError)).toBe(true);

      const badRequestError = new ApiError('Bad request', 400);
      expect(ErrorHandler.isServerError(badRequestError)).toBe(false);
    });
  });

  describe('validation error extraction', () => {
    it('should extract validation errors from ApiError', () => {
      const validationResponse = {
        errors: {
          username: ['This field is required'],
          email: ['Invalid email format', 'Email already exists'],
        },
      };
      const validationError = new ApiError('Validation failed', 400, validationResponse);
      
      const extracted = ErrorHandler.getValidationErrors(validationError);
      
      expect(extracted).toEqual(validationResponse.errors);
    });

    it('should return empty object for non-validation errors', () => {
      const serverError = new ApiError('Internal error', 500);
      const extracted = ErrorHandler.getValidationErrors(serverError);
      
      expect(extracted).toEqual({});
    });
  });

  describe('retry logic', () => {
    it('should not retry after max attempts', () => {
      const serverError = new ApiError('Internal error', 500);
      expect(ErrorHandler.shouldRetry(serverError, 3, 3)).toBe(false);
    });

    it('should retry on server errors', () => {
      const serverError = new ApiError('Internal error', 500);
      expect(ErrorHandler.shouldRetry(serverError, 1, 3)).toBe(true);
    });

    it('should retry on network errors', () => {
      const networkError = new ApiError('Network Error', 0);
      expect(ErrorHandler.shouldRetry(networkError, 1, 3)).toBe(true);
    });

    it('should not retry on client errors', () => {
      const clientError = new ApiError('Bad request', 400);
      expect(ErrorHandler.shouldRetry(clientError, 1, 3)).toBe(false);
    });
  });

  describe('retry delay calculation', () => {
    it('should calculate exponential backoff delay', () => {
      expect(ErrorHandler.getRetryDelay(0)).toBe(1000);
      expect(ErrorHandler.getRetryDelay(1)).toBe(2000);
      expect(ErrorHandler.getRetryDelay(2)).toBe(4000);
      expect(ErrorHandler.getRetryDelay(3)).toBe(8000);
    });

    it('should cap delay at maximum', () => {
      expect(ErrorHandler.getRetryDelay(10)).toBe(10000);
    });
  });
});

describe('utility functions', () => {
  it('should format API error message', () => {
    const error = new ApiError('Test error', 400);
    expect(formatApiError(error)).toBe('Test error');
  });

  it('should detect network error', () => {
    const error = new ApiError('Network Error', 0);
    expect(isNetworkError(error)).toBe(true);
  });

  it('should detect auth error', () => {
    const error = new ApiError('Unauthorized', 401);
    expect(isAuthError(error)).toBe(true);
  });
});