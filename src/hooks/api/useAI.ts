/**
 * AI hooks using React Query and the aiService streaming client
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { apiClient } from '@/lib/api/typed-client';
import type { AgentOptimizeResult } from '@/lib/api/typed-client';
import {
  aiService,
  type OptimizeStreamRequest,
  type OptimizeStreamResult,
  type DeepSeekStreamRequest,
} from '@/lib/api/ai';
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

// ============================================================
// usePromptOptimization — SSE streaming hook
// ============================================================

export interface UsePromptOptimizationState {
  isStreaming: boolean;
  output: string;
  progress: { step: string; message: string } | null;
  result: OptimizeStreamResult | null;
  error: string | null;
}

/**
 * Hook that streams prompt optimisation via POST /api/v2/ai/optimization/stream/.
 * Automatically handles auth, AbortController, and state updates.
 *
 * @example
 * const { optimize, cancel, isStreaming, output, result, error } = usePromptOptimization();
 *
 * await optimize({ original: 'Write something about AI' });
 */
export function usePromptOptimization() {
  const [state, setState] = useState<UsePromptOptimizationState>({
    isStreaming: false,
    output: '',
    progress: null,
    result: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const optimize = useCallback(async (request: OptimizeStreamRequest) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState({ isStreaming: true, output: '', progress: null, result: null, error: null });

    await aiService.optimizePromptStream(
      request,
      {
        onProgress: (step, message) =>
          setState(prev => ({ ...prev, progress: { step, message } })),

        onToken: (content) =>
          setState(prev => ({ ...prev, output: prev.output + content })),

        onResult: (data) =>
          setState(prev => ({
            ...prev,
            result: data,
            // If the result contains the full optimised text, surface it
            output: data.optimized || prev.output,
          })),

        onError: (err) => {
          setState(prev => ({ ...prev, isStreaming: false, error: err }));
          toast.error(err);
        },

        onComplete: () =>
          setState(prev => ({ ...prev, isStreaming: false })),
      },
      abortRef.current.signal,
    );
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { optimize, cancel, ...state };
}

// ============================================================
// useDeepSeekStream — SSE streaming hook for chat
// ============================================================

export interface UseDeepSeekStreamState {
  isStreaming: boolean;
  output: string;
  error: string | null;
}

/**
 * Hook that streams a DeepSeek chat completion via POST /api/v2/chat/completions/.
 * Direct replacement for any WebSocket-based chat integration.
 *
 * @example
 * const { stream, cancel, isStreaming, output } = useDeepSeekStream();
 *
 * await stream({ messages: [{ role: 'user', content: 'Hello!' }] });
 */
export function useDeepSeekStream() {
  const [state, setState] = useState<UseDeepSeekStreamState>({
    isStreaming: false,
    output: '',
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(async (request: DeepSeekStreamRequest) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState({ isStreaming: true, output: '', error: null });

    await aiService.deepseekStream(
      request,
      {
        onToken: (content) =>
          setState(prev => ({ ...prev, output: prev.output + content })),

        onStreamComplete: (fullContent) =>
          setState({ isStreaming: false, output: fullContent, error: null }),

        onError: (err) => {
          setState(prev => ({ ...prev, isStreaming: false, error: err }));
          toast.error(err);
        },
      },
      abortRef.current.signal,
    );
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { stream, cancel, ...state };
}