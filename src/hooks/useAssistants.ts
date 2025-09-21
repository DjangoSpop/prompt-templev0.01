'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '@/lib/api/assistant-client';
import type { Assistant, Thread, Message, RunMessageRequest } from '@/types/assistant';

export function useAssistants() {
  return useQuery({
    queryKey: ['assistants'],
    queryFn: assistantApi.getAssistants,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAssistant(assistantId: string) {
  return useQuery({
    queryKey: ['assistant', assistantId],
    queryFn: () => assistantApi.getAssistant(assistantId),
    enabled: !!assistantId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useThreads(assistantId?: string) {
  return useQuery({
    queryKey: ['threads', assistantId],
    queryFn: () => assistantApi.getThreads(assistantId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => assistantApi.getThread(threadId),
    enabled: !!threadId,
    refetchInterval: (query) => {
      // Avoid accessing browser globals during server-side prerender
      if (typeof document === 'undefined') return false;

      // Stop polling if query has error or window is not focused
      if (query?.state?.error || !document.hasFocus()) {
        return false;
      }
      return 3000; // Poll every 3 seconds for new messages
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assistantId, title }: { assistantId: string; title?: string }) =>
      assistantApi.createThread(assistantId, title),
    onSuccess: (newThread) => {
      // Update threads cache
      queryClient.setQueryData(['threads'], (oldData: Thread[] | undefined) => {
        if (oldData) {
          return [newThread, ...oldData];
        }
        return [newThread];
      });

      // Update assistant-specific threads cache
      queryClient.setQueryData(['threads', newThread.assistant_id], (oldData: Thread[] | undefined) => {
        if (oldData) {
          return [newThread, ...oldData];
        }
        return [newThread];
      });
    },
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, updates }: { threadId: string; updates: Partial<Thread> }) =>
      assistantApi.updateThread(threadId, updates),
    onSuccess: (updatedThread) => {
      // Update thread cache
      queryClient.setQueryData(['thread', updatedThread.id], (oldData: any) => {
        if (oldData) {
          return { ...oldData, thread: updatedThread };
        }
        return { thread: updatedThread, messages: [] };
      });

      // Update threads list cache
      queryClient.setQueryData(['threads'], (oldData: Thread[] | undefined) => {
        if (oldData) {
          return oldData.map(thread =>
            thread.id === updatedThread.id ? updatedThread : thread
          );
        }
        return [updatedThread];
      });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assistantApi.deleteThread,
    onSuccess: (_, threadId) => {
      // Remove from threads cache
      queryClient.setQueryData(['threads'], (oldData: Thread[] | undefined) => {
        if (oldData) {
          return oldData.filter(thread => thread.id !== threadId);
        }
        return [];
      });

      // Remove thread data
      queryClient.removeQueries({ queryKey: ['thread', threadId] });
    },
  });
}

export function useRunMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assistantApi.runMessage,
    onMutate: async ({ message, thread_id }: RunMessageRequest) => {
      // Optimistically add user message
      if (thread_id) {
        await queryClient.cancelQueries({ queryKey: ['thread', thread_id] });

        const previousData = queryClient.getQueryData(['thread', thread_id]);

        queryClient.setQueryData(['thread', thread_id], (old: any) => {
          if (old?.messages) {
            const userMessage: Message = {
              id: 'temp-' + Date.now(),
              thread_id,
              role: 'user',
              content: message,
              created_at: new Date().toISOString(),
            };
            return {
              ...old,
              messages: [...old.messages, userMessage],
            };
          }
          return old;
        });

        return { previousData };
      }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData && variables.thread_id) {
        queryClient.setQueryData(['thread', variables.thread_id], context.previousData);
      }
    },
    onSuccess: (data) => {
      // Update thread cache with the real response
      queryClient.setQueryData(['thread', data.thread.id], (old: any) => {
        if (old) {
          return {
            thread: data.thread,
            messages: [...(old.messages || []).filter((m: Message) => !m.id.startsWith('temp-')), data.message],
          };
        }
        return { thread: data.thread, messages: [data.message] };
      });

      // Update threads list with latest timestamp
      queryClient.setQueryData(['threads'], (oldData: Thread[] | undefined) => {
        if (oldData) {
          return oldData.map(thread =>
            thread.id === data.thread.id ? data.thread : thread
          );
        }
        return [data.thread];
      });
    },
  });
}