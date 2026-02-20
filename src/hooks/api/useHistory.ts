/**
 * History/Chat Sessions hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { toast } from 'sonner';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  sessions: (page?: number, limit?: number) => [...historyKeys.all, 'sessions', page, limit] as const,
};

export function useChatSessions(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: historyKeys.sessions(page, limit),
    queryFn: () => apiClient.getChatSessions(page, limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('40')) return false;
      return failureCount < 2;
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
      toast.success('Session deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete session');
    },
  });
}

/**
 * Alias for consistency with other hooks
 */
export function usePromptHistory(page: number = 1, limit: number = 50) {
  return useChatSessions(page, limit);
}
