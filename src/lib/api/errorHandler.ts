import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationAPIError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationAPIError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationAPIError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundAPIError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictAPIError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitAPIError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
  path: string;
}

export class APIErrorHandler {
  static handle(
    error: unknown,
    request: NextRequest,
    requestId: string
  ): NextResponse<ErrorResponse> {
    const path = new URL(request.url).pathname;
    
    // Log the error
    logger.error('API Error occurred', {
      requestId,
      method: request.method,
      url: request.url,
      path,
      error: error instanceof Error ? error.stack : String(error),
      userAgent: request.headers.get('user-agent'),
      ip: this.getClientIP(request),
    });

    if (error instanceof APIError) {
      return this.createErrorResponse(
        error.message,
        error.code,
        error.statusCode,
        requestId,
        path,
        error.details
      );
    }

    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      return this.createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        requestId,
        path,
        { errors: details }
      );
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('ECONNREFUSED') || 
          error.message.includes('Connection refused')) {
        logger.error('Database connection failed', {
          requestId,
          error: error.message,
        });

        return this.createErrorResponse(
          'Service temporarily unavailable',
          'SERVICE_UNAVAILABLE',
          503,
          requestId,
          path
        );
      }

      // Network timeout errors
      if (error.message.includes('timeout') || 
          error.message.includes('ETIMEDOUT')) {
        return this.createErrorResponse(
          'Request timeout',
          'TIMEOUT',
          408,
          requestId,
          path
        );
      }

      // Handle JWT errors
      if (error.message.includes('jwt') || 
          error.message.includes('token')) {
        return this.createErrorResponse(
          'Invalid or expired token',
          'INVALID_TOKEN',
          401,
          requestId,
          path
        );
      }
    }

    // Default to internal server error
    return this.createErrorResponse(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500,
      requestId,
      path
    );
  }

  private static createErrorResponse(
    message: string,
    code: string,
    statusCode: number,
    requestId: string,
    path: string,
    details?: any
  ): NextResponse<ErrorResponse> {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
      requestId,
      path,
    };

    return NextResponse.json(errorResponse, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
    });
  }

  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = request.headers.get('x-client-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || clientIP || 'unknown';
  }
}

// Higher-order function for wrapping API route handlers
export function withErrorHandling<T>(
  handler: (request: NextRequest, context?: any) => Promise<T>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Add request ID to headers for tracing
      const response = await handler(request, context);
      
      // Log successful request
      const duration = Date.now() - startTime;
      logger.httpRequest(
        request.method,
        request.url,
        200,
        duration,
        { requestId }
      );

      // If response is already a NextResponse, add headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-ID', requestId);
        return response;
      }

      // Create success response
      return NextResponse.json(
        {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
          requestId,
        },
        {
          headers: {
            'X-Request-ID': requestId,
          },
        }
      );
    } catch (error) {
      return APIErrorHandler.handle(error, request, requestId);
    }
  };
}

// Utility functions for throwing common errors
export const throwAPIError = {
  validation: (message: string, details?: any) => {
    throw new ValidationAPIError(message, details);
  },
  
  unauthorized: (message?: string) => {
    throw new AuthenticationAPIError(message);
  },
  
  forbidden: (message?: string) => {
    throw new AuthorizationAPIError(message);
  },
  
  notFound: (resource?: string) => {
    throw new NotFoundAPIError(resource);
  },
  
  conflict: (message: string) => {
    throw new ConflictAPIError(message);
  },
  
  rateLimit: (message?: string) => {
    throw new RateLimitAPIError(message);
  },
  
  internal: (message: string, code?: string) => {
    throw new APIError(message, 500, code || 'INTERNAL_ERROR');
  },
};