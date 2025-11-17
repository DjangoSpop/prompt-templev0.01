import { z } from "zod";

/**
 * Common pagination schema used across all paginated endpoints
 */
export const Pagination = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
});

export type TPagination = z.infer<typeof Pagination>;

/**
 * Generic paginated response wrapper
 */
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return Pagination.extend({
    results: z.array(itemSchema),
  });
}

/**
 * Common error response schema
 */
export const ErrorResponse = z.object({
  detail: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  code: z.string().optional(),
});

export type TErrorResponse = z.infer<typeof ErrorResponse>;

/**
 * Common success response schema
 */
export const SuccessResponse = z.object({
  message: z.string(),
  success: z.boolean(),
});

export type TSuccessResponse = z.infer<typeof SuccessResponse>;
