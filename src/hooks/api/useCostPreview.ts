/**
 * useCostPreview — hook to fetch estimated credit cost for an AI feature
 * before the user commits to the action.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { useCreditsStore } from '@/store/credits';

export function useCostPreview(feature: string, params?: Record<string, unknown>) {
  const available = useCreditsStore((s) => s.creditsAvailable);

  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'cost-preview', feature, params],
    queryFn: () => apiClient.getCostPreview(feature, params),
    staleTime: 5 * 60 * 1000, // 5 min — costs rarely change
    enabled: !!feature,
    retry: 0,
  });

  const cost = data?.estimated_credits ?? 0;

  return {
    /** Estimated credit cost for this action */
    cost,
    /** Description of what the cost covers */
    description: data?.description ?? '',
    /** Whether the user can afford this action */
    canAfford: available >= cost,
    /** Whether an upgrade is needed (no credits at all) */
    upgradeRequired: available <= 0 && cost > 0,
    /** Still fetching */
    isLoading,
  };
}
