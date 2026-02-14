/**
 * Saved Prompts & Iteration hooks using React Query
 * Full CRUD + iteration + favorites + search + stats
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { toast } from 'sonner';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import type {
  SavedPrompt,
  SavedPromptFilters,
  SavePromptRequest,
  UpdatePromptRequest,
  CreateIterationRequest,
  PromptIteration,
  PaginatedSavedPrompts,
  SavedPromptStats,
} from '@/types/saved-prompts';

// ============================================
// Query Keys
// ============================================

export const savedPromptKeys = {
  all: ['saved-prompts'] as const,
  lists: () => [...savedPromptKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...savedPromptKeys.lists(), filters] as const,
  details: () => [...savedPromptKeys.all, 'detail'] as const,
  detail: (id: string) => [...savedPromptKeys.details(), id] as const,
  favorites: () => [...savedPromptKeys.all, 'favorites'] as const,
  stats: () => [...savedPromptKeys.all, 'stats'] as const,
  search: (q: string) => [...savedPromptKeys.all, 'search', q] as const,
  iterations: (promptId: string) => [...savedPromptKeys.all, 'iterations', promptId] as const,
  usageHistory: (promptId: string) => [...savedPromptKeys.all, 'usage', promptId] as const,
};

// ============================================
// Query Hooks - Listing & Fetching
// ============================================

export function useSavedPrompts(filters?: SavedPromptFilters) {
  const store = useSavedPromptsStore();

  return useQuery({
    queryKey: savedPromptKeys.list(filters),
    queryFn: async () => {
      const data = await apiClient.getSavedPrompts(filters) as PaginatedSavedPrompts;
      // Sync to store
      store.setPrompts(data.results, data.count);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInfiniteSavedPrompts(filters?: Omit<SavedPromptFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: savedPromptKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getSavedPrompts({ ...filters, page: pageParam }) as Promise<PaginatedSavedPrompts>,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) return pages.length + 1;
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSavedPrompt(id: string) {
  return useQuery({
    queryKey: savedPromptKeys.detail(id),
    queryFn: () => apiClient.getSavedPrompt(id) as Promise<SavedPrompt>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSavedPromptStats() {
  const store = useSavedPromptsStore();

  return useQuery({
    queryKey: savedPromptKeys.stats(),
    queryFn: async () => {
      const data = await apiClient.getSavedPromptStats() as SavedPromptStats;
      store.setStats(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFavoritePrompts() {
  return useQuery({
    queryKey: savedPromptKeys.favorites(),
    queryFn: () =>
      apiClient.getSavedPrompts({ is_favorite: true }) as Promise<PaginatedSavedPrompts>,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearchSavedPrompts(query: string) {
  return useQuery({
    queryKey: savedPromptKeys.search(query),
    queryFn: () => apiClient.searchSavedPrompts(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Mutation Hooks - CRUD Operations
// ============================================

export function useCreateSavedPrompt() {
  const queryClient = useQueryClient();
  const store = useSavedPromptsStore();

  return useMutation({
    mutationFn: (data: SavePromptRequest) => apiClient.createSavedPrompt(data),
    onSuccess: (data: SavedPrompt) => {
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.stats() });
      store.addPrompt(data);
      store.closeSaveModal();
      toast.success('Prompt saved to library!');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save prompt');
    },
  });
}

export function useUpdateSavedPrompt() {
  const queryClient = useQueryClient();
  const store = useSavedPromptsStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromptRequest }) =>
      apiClient.updateSavedPrompt(id, data),
    onSuccess: (data: SavedPrompt, variables) => {
      queryClient.setQueryData(savedPromptKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.lists() });
      store.updatePrompt(variables.id, data);
      toast.success('Prompt updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update prompt');
    },
  });
}

export function useDeleteSavedPrompt() {
  const queryClient = useQueryClient();
  const store = useSavedPromptsStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSavedPrompt(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: savedPromptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.stats() });
      store.removePrompt(id);
      toast.success('Prompt deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete prompt');
    },
  });
}

export function useDuplicateSavedPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.duplicateSavedPrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.stats() });
      toast.success('Prompt duplicated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate prompt');
    },
  });
}

// ============================================
// Mutation Hooks - Favorites & Usage
// ============================================

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const store = useSavedPromptsStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.toggleFavoritePrompt(id),
    onMutate: async (id) => {
      // Optimistic update
      store.toggleFavorite(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.favorites() });
    },
    onError: (error: Error, id) => {
      // Revert optimistic update
      store.toggleFavorite(id);
      toast.error(error.message || 'Failed to toggle favorite');
    },
  });
}

export function useRecordPromptUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { context?: string; model_used?: string; response_preview?: string } }) =>
      apiClient.recordPromptUsage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.stats() });
    },
  });
}

// ============================================
// Mutation Hooks - Iterations (Version Control)
// ============================================

export function usePromptIterations(promptId: string) {
  const store = useSavedPromptsStore();

  return useQuery({
    queryKey: savedPromptKeys.iterations(promptId),
    queryFn: async () => {
      const data = await apiClient.getPromptIterations(promptId) as PromptIteration[];
      store.setIterations(promptId, data);
      return data;
    },
    enabled: !!promptId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateIteration() {
  const queryClient = useQueryClient();
  const store = useSavedPromptsStore();

  return useMutation({
    mutationFn: ({
      promptId,
      data,
    }: {
      promptId: string;
      data: CreateIterationRequest;
    }) => apiClient.createPromptIteration(promptId, data),
    onSuccess: (data: PromptIteration, variables) => {
      queryClient.invalidateQueries({
        queryKey: savedPromptKeys.iterations(variables.promptId),
      });
      queryClient.invalidateQueries({
        queryKey: savedPromptKeys.detail(variables.promptId),
      });
      store.addIteration(variables.promptId, data);
      toast.success(`Iteration v${data.version} created`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create iteration');
    },
  });
}

export function useRevertToIteration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promptId,
      iterationId,
    }: {
      promptId: string;
      iterationId: string;
    }) => apiClient.revertToIteration(promptId, iterationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: savedPromptKeys.detail(variables.promptId),
      });
      queryClient.invalidateQueries({
        queryKey: savedPromptKeys.iterations(variables.promptId),
      });
      queryClient.invalidateQueries({ queryKey: savedPromptKeys.lists() });
      toast.success('Reverted to selected version');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revert');
    },
  });
}

export function useCompareIterations(promptId: string, versionA: number, versionB: number) {
  return useQuery({
    queryKey: [...savedPromptKeys.iterations(promptId), 'compare', versionA, versionB],
    queryFn: () => apiClient.compareIterations(promptId, versionA, versionB),
    enabled: !!promptId && versionA > 0 && versionB > 0 && versionA !== versionB,
  });
}

export function usePromptUsageHistory(promptId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: savedPromptKeys.usageHistory(promptId),
    queryFn: () => apiClient.getPromptUsageHistory(promptId, { page, limit }),
    enabled: !!promptId,
  });
}
