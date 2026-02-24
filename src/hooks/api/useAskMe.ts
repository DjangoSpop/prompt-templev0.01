/**
 * AskMe — Guided AI Prompt Builder hooks
 * Backend: /api/v2/ai/askme/* — all endpoints fully implemented with DeepSeek
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { toast } from 'sonner';

// ============================================
// Query Keys
// ============================================

export const askMeKeys = {
  all: ['askme'] as const,
  sessions: () => [...askMeKeys.all, 'sessions'] as const,
};

// ============================================
// Query Hooks
// ============================================

export function useAskmeSessions() {
  return useQuery({
    queryKey: askMeKeys.sessions(),
    queryFn: () => apiClient.getAskmeSessions(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useStartAskMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { intent: string; context?: string }) =>
      apiClient.askmeStart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: askMeKeys.sessions() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start AskMe session');
    },
  });
}

export function useAnswerAskMe() {
  return useMutation({
    mutationFn: (data: { session_id: string; question_id: string; answer: string }) =>
      apiClient.askmeAnswer(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit answer');
    },
  });
}

export function useFinalizeAskMe() {
  return useMutation({
    mutationFn: (data: { session_id: string }) =>
      apiClient.askmeFinalize(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to build prompt');
    },
  });
}

export function useDeleteAskmeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteAskmeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: askMeKeys.sessions() });
      toast.success('Session deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete session');
    },
  });
}
