/**
 * History/Chat Sessions hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  sessions: (page?: number, limit?: number) => [...historyKeys.all, 'sessions', page, limit] as const,
};

export function useChatSessions(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: historyKeys.sessions(page, limit),
    queryFn: () => apiClient.getChatSessions(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Alias for consistency with other hooks
 */
export function usePromptHistory(page: number = 1, limit: number = 50) {
  return useChatSessions(page, limit);
}
