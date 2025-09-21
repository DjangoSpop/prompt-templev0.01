import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApiClient } from '../api/chat';
import type { ChatSession } from '../../types/chat';

const QUERY_KEYS = {
  sessions: ['chat', 'sessions'] as const,
  templates: ['chat', 'templates'] as const,
  credits: ['chat', 'credits'] as const,
  metrics: ['chat', 'metrics'] as const,
} as const;

/**
 * Hook to fetch chat sessions with React Query
 */
export const useChatSessions = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.sessions, page, limit],
    queryFn: () => chatApiClient.getSessions(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new chat session
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (title?: string) => chatApiClient.createSession(title),
    onSuccess: (newSession) => {
      // Update the sessions list cache
      queryClient.setQueryData(
        [...QUERY_KEYS.sessions, 1, 50],
        (oldData: { sessions: ChatSession[] } | undefined) => {
          if (!oldData) return { sessions: [newSession] };
          return {
            ...oldData,
            sessions: [newSession, ...oldData.sessions],
          };
        }
      );
      
      // Invalidate sessions queries to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
  });
};

/**
 * Hook to update a chat session
 */
export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: Partial<ChatSession> }) =>
      chatApiClient.updateSession(sessionId, updates),
    onSuccess: (updatedSession) => {
      // Update the sessions list cache
      queryClient.setQueryData(
        [...QUERY_KEYS.sessions, 1, 50],
        (oldData: { sessions: ChatSession[] } | undefined) => {
          if (!oldData) return { sessions: [updatedSession] };
          return {
            ...oldData,
            sessions: oldData.sessions.map(session =>
              session.id === updatedSession.id ? updatedSession : session
            ),
          };
        }
      );
    },
  });
};

/**
 * Hook to delete a chat session
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => chatApiClient.deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Remove from sessions list cache
      queryClient.setQueryData(
        [...QUERY_KEYS.sessions, 1, 50],
        (oldData: { sessions: ChatSession[] } | undefined) => {
          if (!oldData) return { sessions: [] };
          return {
            ...oldData,
            sessions: oldData.sessions.filter(session => session.id !== sessionId),
          };
        }
      );
      
      // Invalidate sessions queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
  });
};

/**
 * Hook to fetch templates
 */
export const useTemplates = (category?: string, limit = 20) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.templates, category, limit],
    queryFn: () => chatApiClient.getTemplates(category, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to fetch a specific template
 */
export const useTemplate = (templateId: string | null) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.templates, templateId],
    queryFn: () => templateId ? chatApiClient.getTemplate(templateId) : null,
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to purchase credits
 */
export const usePurchaseCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ amount, packageId }: { amount: number; packageId?: string }) =>
      chatApiClient.purchaseCredits({ amount, package_id: packageId }),
    onSuccess: () => {
      // Invalidate credits query to refetch balance
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credits });
    },
  });
};

/**
 * Hook to fetch credit balance
 */
export const useCreditBalance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.credits,
    queryFn: () => chatApiClient.getCreditBalance(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to fetch chat metrics
 */
export const useChatMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.metrics,
    queryFn: () => chatApiClient.getChatMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
