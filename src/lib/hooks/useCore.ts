import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreService } from '../api/core';

interface NotificationMarkReadRequest {
  notification_id: string;
}

export const useHealth = () => {
  return useQuery({
    queryKey: ['core', 'health'],
    queryFn: () => coreService.getHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useCoreHealth = () => {
  return useQuery({
    queryKey: ['core', 'health-detailed'],
    queryFn: () => coreService.getCoreHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useAppConfig = () => {
  return useQuery({
    queryKey: ['core', 'config'],
    queryFn: () => coreService.getConfig(),
    staleTime: 60 * 60 * 1000, // 1 hour - config doesn't change often
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['core', 'notifications'],
    queryFn: () => coreService.getNotifications(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (request: NotificationMarkReadRequest) => coreService.markNotificationRead(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'notifications'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarking: markAsReadMutation.isPending,
    markError: markAsReadMutation.error,
  };
};