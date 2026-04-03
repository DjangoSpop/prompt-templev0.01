import { useCreditsStore } from '@/store/credits';

/**
 * Credit cost mapping for all AI features
 * Based on FRONTEND_AI_INTEGRATION_GUIDE.md backend documentation
 * Synced: March 8, 2026
 */
export const CREDIT_COSTS = {
  // Prompt Optimization
  optimizerFast: 3,
  optimizerDeep: 8,

  // AskMe Builder
  askmeStart: 2,
  askmeFinalize: 3,

  // SEO & Templates
  seoSpec: 10,
  aiBroadcast: 8,
  smartFill: 2, // Sprint 4: Smart Fill one-click template completion
  templateRecommendations: 1, // Sprint 4: AI semantic search per query
  templateVariations: 5, // Sprint 4: Generate 3 tone variations

  // Research Agent
  research: 10,

  // Fallback
  default: 5,
} as const;

export type CreditFeature = keyof typeof CREDIT_COSTS;

/**
 * Get cost for a feature with optional mode modifier
 * @example getCreditCost('optimizer', 'deep') => 8
 * @example getCreditCost('askme', 'start') => 2
 */
export function getCreditCost(feature: string, mode?: string): number {
  // Optimizer variants
  if (feature === 'optimizer' && mode === 'deep') {
    return CREDIT_COSTS.optimizerDeep;
  }
  if (feature === 'optimizer') {
    return CREDIT_COSTS.optimizerFast;
  }

  // AskMe variants
  if (feature === 'askme' && mode === 'start') {
    return CREDIT_COSTS.askmeStart;
  }
  if (feature === 'askme' && mode === 'finalize') {
    return CREDIT_COSTS.askmeFinalize;
  }

  // Direct feature lookups
  if (feature === 'seoSpec') return CREDIT_COSTS.seoSpec;
  if (feature === 'broadcast') return CREDIT_COSTS.aiBroadcast;
  if (feature === 'smartFill') return CREDIT_COSTS.smartFill;
  if (feature === 'recommendations') return CREDIT_COSTS.templateRecommendations;
  if (feature === 'variations') return CREDIT_COSTS.templateVariations;
  if (feature === 'research') return CREDIT_COSTS.research;

  return CREDIT_COSTS.default;
}

/**
 * Wrapper function to handle optimistic credit deduction with automatic refund on error
 * 
 * @example
 * const result = await withCreditDeduction(
 *   'optimizer',
 *   'deep',
 *   async () => await optimizePrompt(prompt)
 * );
 */
export async function withCreditDeduction<T>(
  feature: string,
  mode: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const cost = getCreditCost(feature, mode);
  const creditsStore = useCreditsStore.getState();

  // Check availability before deducting
  if (creditsStore.creditsAvailable < cost) {
    const error = new Error(
      `Insufficient credits: need ${cost}, have ${creditsStore.creditsAvailable}`
    );
    (error as any).status = 402;
    (error as any).code = 'INSUFFICIENT_CREDITS';
    throw error;
  }

  // Optimistically deduct now
  creditsStore.deductOptimistic(cost);

  try {
    // Call the API
    return await fn();
  } catch (error: any) {
    // Refund optimistic deduction on specific errors:
    // - 402: Insufficient credits (backend rejected)
    // - 429: Rate limited (should retry later)
    // - AbortError: User cancelled
    if ([402, 429].includes(error?.status) || error?.name === 'AbortError') {
      creditsStore.refundOptimistic(cost);
    }
    
    // Re-throw the error
    throw error;
  }
}
