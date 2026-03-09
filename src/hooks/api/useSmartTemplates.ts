import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import type {
  SmartFillResult,
  TemplateRecommendation,
  TemplateVariation,
} from '@/lib/api/typed-client';
import { handleApiError } from '@/lib/errors/handle-api-error';
import { withCreditDeduction } from '@/lib/api/helpers/credit-costs';
import { billingKeys } from './useBilling';

export type { SmartFillResult, TemplateRecommendation, TemplateVariation };

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const smartTemplateKeys = {
  all: ['smart-templates'] as const,
  smartFill: (id: string) => [...smartTemplateKeys.all, 'smart-fill', id] as const,
  variations: (id: string) => [...smartTemplateKeys.all, 'variations', id] as const,
  recommend: (intent: string) => [...smartTemplateKeys.all, 'recommend', intent] as const,
};

// ─── Smart Fill ────────────────────────────────────────────────────────────────

/**
 * Calls the AI to suggest values for template variables.
 * Returns a mutation because it consumes credits and may have side effects.
 */
export function useSmartFill(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation<SmartFillResult, Error, Record<string, string>>({
    mutationFn: async (currentVariables) =>
      withCreditDeduction(
        'smartFill',
        undefined,
        async () => apiClient.templateSmartFill(templateId, currentVariables)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.usage() });
    },
    onError: (error) => {
      handleApiError(error, 'template_smart_fill');
    },
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      if (err?.status && err.status >= 400 && err.status < 500) return false;
      return failureCount < 1;
    },
  });
}

// ─── Template Variations ───────────────────────────────────────────────────────

export function useTemplateVariations(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation<TemplateVariation[], Error, { count?: number } | void>({
    mutationFn: async (params) =>
      withCreditDeduction(
        'variations',
        undefined,
        async () => apiClient.templateVariations(templateId, (params as { count?: number } | undefined)?.count)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.usage() });
    },
    onError: (error) => {
      handleApiError(error, 'template_variations');
    },
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      if (err?.status && err.status >= 400 && err.status < 500) return false;
      return failureCount < 1;
    },
  });
}

// ─── Recommend Templates ───────────────────────────────────────────────────────

/**
 * Query-based: intent string is the cache key.
 * Enabled only when intent is non-empty.
 */
export function useRecommendTemplates(intent: string) {
  const queryClient = useQueryClient();

  return useQuery<TemplateRecommendation[], Error>({
    queryKey: smartTemplateKeys.recommend(intent),
    queryFn: async () =>
      withCreditDeduction(
        'recommendations',
        undefined,
        async () => apiClient.recommendTemplates(intent)
      ),
    enabled: intent.trim().length >= 10,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      if (err?.status && err.status === 402) {
        handleApiError(error, 'template_recommend');
        return false;
      }
      if (err?.status && err.status >= 400 && err.status < 500) return false;
      return failureCount < 1;
    },
  });
}
