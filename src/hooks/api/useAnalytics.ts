/**
 * Analytics hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  insights: () => [...analyticsKeys.all, 'insights'] as const,
  templateAnalytics: () => [...analyticsKeys.all, 'template-analytics'] as const,
  recommendations: () => [...analyticsKeys.all, 'recommendations'] as const,
};

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => apiClient.getAnalyticsDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useUserInsights() {
  return useQuery({
    queryKey: analyticsKeys.insights(),
    queryFn: () => apiClient.getUserInsights(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTemplateAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.templateAnalytics(),
    queryFn: () => apiClient.getTemplateAnalytics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: analyticsKeys.recommendations(),
    queryFn: () => apiClient.getRecommendations(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useTrackAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: { event_type: string; data?: any }) =>
      apiClient.trackAnalytics(event),
    onSuccess: () => {
      // Invalidate analytics queries after tracking
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
    onError: (error) => {
      // Silently fail for analytics
      console.warn('Analytics tracking failed:', error);
    },
  });
}
