import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../api/analytics';

interface AnalyticsEvent {
  event_type: string;
  data?: Record<string, any>;
  timestamp?: string;
}

export const useDashboard = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors in development
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useUserInsights = () => {
  return useQuery({
    queryKey: ['analytics', 'user-insights'],
    queryFn: () => analyticsService.getUserInsights(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useTemplatesAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'templates'],
    queryFn: () => analyticsService.getAllTemplateAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['analytics', 'recommendations'],
    queryFn: () => analyticsService.getRecommendations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useABTests = () => {
  return useQuery({
    queryKey: ['analytics', 'ab-tests'],
    queryFn: () => analyticsService.getABTests(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useTrackEvent = () => {
  const queryClient = useQueryClient();

  const trackEventMutation = useMutation({
    mutationFn: (event: AnalyticsEvent) => analyticsService.trackEvent(event),
    onSuccess: () => {
      // Invalidate analytics queries after tracking events
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    // Don't show errors for analytics tracking
    onError: (error) => {
      console.warn('Analytics tracking failed:', error);
    },
  });

  return {
    trackEvent: trackEventMutation.mutate,
    isTracking: trackEventMutation.isPending,
  };
};