/**
 * Core/System hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';

// Query keys
export const coreKeys = {
  all: ['core'] as const,
  config: () => [...coreKeys.all, 'config'] as const,
  notifications: () => [...coreKeys.all, 'notifications'] as const,
  status: () => [...coreKeys.all, 'status'] as const,
  health: () => [...coreKeys.all, 'health'] as const,
};

export function useAppConfig() {
  return useQuery({
    queryKey: coreKeys.config(),
    queryFn: () => apiClient.getAppConfig(),
    staleTime: 60 * 60 * 1000, // 1 hour - config rarely changes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: coreKeys.notifications(),
    queryFn: () => apiClient.getNotifications(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: coreKeys.status(),
    queryFn: () => apiClient.getStatus(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: coreKeys.health(),
    queryFn: () => apiClient.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coreKeys.notifications() });
    },
  });
}
