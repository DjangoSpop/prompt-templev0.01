import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type AgentOptimizeResult } from '@/lib/api/typed-client';
import { handleApiError } from '@/lib/errors/handle-api-error';
import { getCreditCost, withCreditDeduction } from '@/lib/api/helpers/credit-costs';
import { billingKeys } from './useBilling';

export type { AgentOptimizeResult };

export interface OptimizePromptParams {
  session_id: string;
  original: string;
  mode?: 'fast' | 'deep';
  context?: Record<string, unknown>;
}

export function useOptimizePrompt() {
  const queryClient = useQueryClient();

  return useMutation<AgentOptimizeResult, Error, OptimizePromptParams>({
    mutationFn: async (params) => {
      return withCreditDeduction(
        'optimizer',
        params.mode ?? 'fast',
        async () => {
          return apiClient.optimizeWithAgent({
            session_id: params.session_id,
            original: params.original,
            mode: params.mode ?? 'fast',
            context: params.context,
          });
        }
      );
    },
    onSuccess: () => {
      // Refresh credit balance after optimization
      queryClient.invalidateQueries({ queryKey: billingKeys.usage() });
      queryClient.invalidateQueries({ queryKey: billingKeys.entitlements() });
    },
    onError: (error) => {
      handleApiError(error, 'prompt_optimizer');
    },
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      // Never retry 401/402/4xx
      if (err?.status && err.status >= 400 && err.status < 500) return false;
      return failureCount < 1;
    },
  });
}
