/**
 * AI hooks using React Query
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import type { AgentOptimizeResult } from '@/lib/api/typed-client';
import { toast } from 'sonner';

// Query keys
export const aiKeys = {
  all: ['ai'] as const,
  providers: () => [...aiKeys.all, 'providers'] as const,
  models: () => [...aiKeys.all, 'models'] as const,
  usage: () => [...aiKeys.all, 'usage'] as const,
  quotas: () => [...aiKeys.all, 'quotas'] as const,
  agentStats: () => [...aiKeys.all, 'agent', 'stats'] as const,
};

// Query Hooks
export function useAIProviders() {
  return useQuery({
    queryKey: aiKeys.providers(),
    queryFn: () => apiClient.getAIProviders(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useAIModels() {
  return useQuery({
    queryKey: aiKeys.models(),
    queryFn: () => apiClient.getAIModels(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useAIUsage() {
  return useQuery({
    queryKey: aiKeys.usage(),
    queryFn: () => apiClient.getAIUsage(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAIQuotas() {
  return useQuery({
    queryKey: aiKeys.quotas(),
    queryFn: () => apiClient.getAIQuotas(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAgentStats() {
  return useQuery({
    queryKey: aiKeys.agentStats(),
    queryFn: () => apiClient.getAgentStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Mutation Hooks
export function useGenerateWithAI() {
  return useMutation({
    mutationFn: (data: any) => apiClient.generateWithAI(data),
    onError: (error: Error) => {
      toast.error(error.message || 'AI generation failed');
    },
  });
}

export function useAISuggestions() {
  return useMutation({
    mutationFn: (data: any) => apiClient.getAISuggestions(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to get AI suggestions');
    },
  });
}

// Chat Hook with Streaming
export function useStreamChat() {
  return useMutation({
    mutationFn: async ({
      messages,
      options,
      onChunk
    }: {
      messages: any[];
      options?: any;
      onChunk?: (chunk: any) => void;
    }) => {
      const chunks: any[] = [];

      for await (const chunk of apiClient.streamChat(messages, options)) {
        chunks.push(chunk);
        onChunk?.(chunk);
      }

      return chunks;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Chat stream failed');
    },
  });
}

// RAG Hooks
export function useRAGRetrieve() {
  return useMutation({
    mutationFn: ({ query, options }: { query: string; options?: any }) =>
      apiClient.ragRetrieve(query, options),
    onError: (error: Error) => {
      toast.error(error.message || 'RAG retrieval failed');
    },
  });
}

export function useRAGAnswer() {
  return useMutation({
    mutationFn: ({ query, context }: { query: string; context?: any }) =>
      apiClient.ragAnswer(query, context),
    onError: (error: Error) => {
      toast.error(error.message || 'RAG answer generation failed');
    },
  });
}

// Agent Hooks
export function useOptimizeWithAgent() {
  return useMutation<
    AgentOptimizeResult,
    Error & { status?: number },
    { session_id: string; original: string; mode?: 'fast' | 'deep'; context?: Record<string, unknown>; budget?: { tokens_in?: number; tokens_out?: number; max_credits?: number } }
  >({
    mutationFn: (data) => apiClient.optimizeWithAgent(data),
    onError: (error) => {
      if (error.status === 402) {
        toast.error('Insufficient credits for agent optimization. Please upgrade your plan.');
      } else if (error.status === 429) {
        toast.error('Rate limit reached (20 requests/hour). Please try again later.');
      } else if (error.status === 503) {
        toast.error('Optimization service is temporarily unavailable. Try again shortly.');
      } else {
        toast.error(error.message || 'Agent optimization failed');
      }
    },
  });
}