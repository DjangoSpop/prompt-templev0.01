import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from './rateLimit';
import { logger } from '../logger';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: ValidationError[];
  };
  timestamp: string;
  requestId: string;
}

export class RequestValidator {
  static async validateRequest<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    options: {
      source?: 'body' | 'query' | 'params';
      requireAuth?: boolean;
      rateLimit?: { max: number; windowMs: number };
    } = {}
  ): Promise<{
    data: T;
    response?: NextResponse;
  }> {
    const requestId = crypto.randomUUID();
    const { source = 'body', requireAuth = true, rateLimit: rateLimitOptions } = options;

    try {
      // Rate limiting
      if (rateLimitOptions) {
        const rateLimitResult = await rateLimit(request, rateLimitOptions);
        if (!rateLimitResult.success) {
          throw new Error('Rate limit exceeded');
        }
      }

      // Authentication check
      if (requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return {
            data: null as any,
            response: this.createErrorResponse(
              'Authentication required',
              'UNAUTHORIZED',
              401,
              requestId
            ),
          };
        }
      }

      // Extract data based on source
      let rawData: any;
      switch (source) {
        case 'body':
          rawData = await request.json();
          break;
        case 'query':
          rawData = Object.fromEntries(request.nextUrl.searchParams.entries());
          break;
        case 'params':
          // This would need to be passed in from the route handler
          rawData = {};
          break;
        default:
          throw new Error('Invalid data source');
      }

      // Validate data
      const validatedData = schema.parse(rawData);

      logger.info('Request validated successfully', {
        requestId,
        method: request.method,
        url: request.url,
        source,
      });

      return { data: validatedData };
    } catch (error) {
      logger.error('Request validation failed', {
        requestId,
        method: request.method,
        url: request.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code.toUpperCase(),
        }));

        return {
          data: null as any,
          response: this.createValidationErrorResponse(validationErrors, requestId),
        };
      }

      return {
        data: null as any,
        response: this.createErrorResponse(
          'Internal server error',
          'INTERNAL_ERROR',
          500,
          requestId
        ),
      };
    }
  }

  static createErrorResponse(
    message: string,
    code: string,
    status: number,
    requestId: string
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        code,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status });
  }

  static createValidationErrorResponse(
    errors: ValidationError[],
    requestId: string
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: 400 });
  }

  static createSuccessResponse<T>(
    data: T,
    requestId: string,
    status: number = 200
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status });
  }
}

// Common validation schemas
export const commonSchemas = {
  pagination: z.object({
    page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional(),
  }),

  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    sort: z.enum(['created_at', 'updated_at', 'name', 'rating']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),

  templateCreate: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    prompt: z.string().min(1).max(10000),
    category_id: z.number().int().positive().optional(),
    is_public: z.boolean().default(false),
    tags: z.array(z.string()).max(10).optional(),
    variables: z.array(z.object({
      name: z.string().min(1).max(50),
      type: z.enum(['text', 'textarea', 'number', 'select', 'checkbox']),
      description: z.string().max(255).optional(),
      required: z.boolean().default(false),
      default_value: z.string().optional(),
      options: z.array(z.string()).optional(),
    })).optional(),
  }),

  userUpdate: z.object({
    first_name: z.string().max(30).optional(),
    last_name: z.string().max(30).optional(),
    bio: z.string().max(500).optional(),
    website: z.string().url().optional(),
    location: z.string().max(100).optional(),
    avatar_url: z.string().url().optional(),
  }),
} as const;