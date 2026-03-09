/**
 * useDashboard — hook for the AI usage dashboard analytics.
 *
 * Fetches data from GET /api/v2/ai/dashboard/ and auto-refreshes every 2 min.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import type { AIDashboardData } from '@/lib/api/typed-client';

export type { AIDashboardData };

export const dashboardKeys = {
  all: ['ai-dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
};

export function useDashboard() {
  return useQuery<AIDashboardData>({
    queryKey: dashboardKeys.data(),
    queryFn: () => apiClient.getAIDashboard(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
}
