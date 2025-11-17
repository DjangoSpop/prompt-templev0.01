import { z } from "zod";

/**
 * SSE Optimize chunk schema
 */
export const OptimizeChunk = z.object({
  token: z.string().optional(),
  is_final: z.boolean().optional(),
  suggestions: z.array(z.string()).optional(),
  metrics: z.object({
    latency_ms: z.number().optional(),
    tokens_generated: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type TOptimizeChunk = z.infer<typeof OptimizeChunk>;

/**
 * Optimize request schema
 */
export const OptimizeRequest = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(),
  optimize_for: z.enum(["clarity", "conciseness", "creativity", "general"]).optional(),
  max_tokens: z.number().min(1).max(4000).optional(),
});

export type TOptimizeRequest = z.infer<typeof OptimizeRequest>;

/**
 * Complete optimization response (when streaming is done)
 */
export const OptimizeResponse = z.object({
  original_prompt: z.string(),
  optimized_prompt: z.string(),
  suggestions: z.array(z.string()),
  metrics: z.object({
    original_tokens: z.number(),
    optimized_tokens: z.number(),
    improvement_score: z.number().min(0).max(100),
    latency_ms: z.number(),
  }),
  created_at: z.string().datetime(),
});

export type TOptimizeResponse = z.infer<typeof OptimizeResponse>;

/**
 * SSE event types
 */
export const SSEEvent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("token"),
    data: z.string(),
  }),
  z.object({
    type: z.literal("complete"),
    data: OptimizeResponse,
  }),
  z.object({
    type: z.literal("error"),
    data: z.object({
      message: z.string(),
      code: z.string().optional(),
    }),
  }),
]);

export type TSSEEvent = z.infer<typeof SSEEvent>;
