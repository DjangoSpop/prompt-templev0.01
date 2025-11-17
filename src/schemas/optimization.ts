import { z } from "zod";

/**
 * Optimization Strategy Types
 */
export enum OptimizationStrategy {
  STRUCTURAL = "STRUCTURAL_OPTIMIZATION",
  SEMANTIC = "SEMANTIC_ENHANCEMENT",
  PSYCHOLOGICAL = "PSYCHOLOGICAL_OPTIMIZATION",
  TECHNICAL = "TECHNICAL_REFINEMENT",
  CONTEXT = "CONTEXT_INJECTION",
}

/**
 * Individual strategy improvement detail
 */
export const StrategyImprovement = z.object({
  strategy: z.nativeEnum(OptimizationStrategy),
  original_text: z.string(),
  improved_text: z.string(),
  explanation: z.string(),
  confidence_score: z.number().min(0).max(1),
  improvement_percentage: z.number().min(0).max(100),
  changes: z.array(
    z.object({
      type: z.enum(["addition", "removal", "modification"]),
      original: z.string().optional(),
      improved: z.string(),
      reasoning: z.string(),
    })
  ),
  metrics: z.object({
    clarity_gain: z.number().optional(),
    specificity_gain: z.number().optional(),
    effectiveness_score: z.number().optional(),
  }),
});

export type TStrategyImprovement = z.infer<typeof StrategyImprovement>;

/**
 * Multi-strategy optimization response
 */
export const MultiStrategyOptimizationResponse = z.object({
  original_prompt: z.string(),
  final_optimized_prompt: z.string(),
  overall_improvement_percentage: z.number().min(0).max(100),
  overall_confidence_score: z.number().min(0).max(1),
  strategy_breakdown: z.array(StrategyImprovement),
  combined_improvements: z.array(z.string()),
  processing_time_ms: z.number(),
  recommendations: z.array(z.string()),
  metadata: z.object({
    strategies_applied: z.array(z.nativeEnum(OptimizationStrategy)),
    optimization_level: z.enum(["basic", "standard", "advanced", "expert"]),
    model_optimized_for: z.string().optional(),
  }),
});

export type TMultiStrategyOptimizationResponse = z.infer<
  typeof MultiStrategyOptimizationResponse
>;

/**
 * Multi-strategy optimization request
 */
export const MultiStrategyOptimizationRequest = z.object({
  prompt: z.string().min(1),
  strategies: z.array(z.nativeEnum(OptimizationStrategy)).optional(),
  optimization_level: z.enum(["basic", "standard", "advanced", "expert"]).default("standard"),
  target_model: z.string().optional(),
  domain: z.string().optional(),
  user_preferences: z
    .object({
      tone: z.enum(["formal", "casual", "technical", "creative"]).optional(),
      length: z.enum(["concise", "moderate", "detailed"]).optional(),
      focus: z.array(z.string()).optional(),
    })
    .optional(),
});

export type TMultiStrategyOptimizationRequest = z.infer<
  typeof MultiStrategyOptimizationRequest
>;

/**
 * SSE streaming chunk for multi-strategy optimization
 */
export const MultiStrategyChunk = z.object({
  type: z.enum([
    "strategy_start",
    "strategy_progress",
    "strategy_complete",
    "final_result",
    "error",
  ]),
  strategy: z.nativeEnum(OptimizationStrategy).optional(),
  data: z.any().optional(),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
});

export type TMultiStrategyChunk = z.infer<typeof MultiStrategyChunk>;

/**
 * Strategy metadata for UI display
 */
export const STRATEGY_METADATA = {
  [OptimizationStrategy.STRUCTURAL]: {
    name: "Structural Optimization",
    description: "Improves logical flow, hierarchy, and organization",
    icon: "layout",
    color: "blue",
    expectedGain: "20-30%",
  },
  [OptimizationStrategy.SEMANTIC]: {
    name: "Semantic Enhancement",
    description: "Expands terminology and adds contextual clarity",
    icon: "book-open",
    color: "green",
    expectedGain: "15-25%",
  },
  [OptimizationStrategy.PSYCHOLOGICAL]: {
    name: "Psychological Optimization",
    description: "Enhances confidence, authority, and persuasiveness",
    icon: "brain",
    color: "purple",
    expectedGain: "10-20%",
  },
  [OptimizationStrategy.TECHNICAL]: {
    name: "Technical Refinement",
    description: "Optimizes for specific AI models and parameters",
    icon: "settings",
    color: "orange",
    expectedGain: "15-25%",
  },
  [OptimizationStrategy.CONTEXT]: {
    name: "Context Injection",
    description: "Adds domain knowledge and relevant background",
    icon: "database",
    color: "teal",
    expectedGain: "20-35%",
  },
} as const;
