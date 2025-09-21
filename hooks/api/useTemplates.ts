/**
 * Template hooks using React Query
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, Template, TemplateList, TemplateDetail, TemplateCategory } from '@/lib/api/typed-client';
import { toast } from 'sonner';
import { components } from '@/lib/types/api';

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  featured: () => [...templateKeys.all, 'featured'] as const,
  trending: () => [...templateKeys.all, 'trending'] as const,
  my: () => [...templateKeys.all, 'my'] as const,
  analytics: (id: string) => [...templateKeys.all, 'analytics', id] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: number) => [...categoryKeys.all, id] as const,
  templates: (id: number) => [...categoryKeys.all, id, 'templates'] as const,
};

// Template Hooks
export function useTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  is_featured?: boolean;
  is_public?: boolean;
  author?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => apiClient.getTemplates(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useInfiniteTemplates(params?: {
  limit?: number;
  category?: string;
  q?: string;
  is_featured?: boolean;
  is_public?: boolean;
  author?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return useInfiniteQuery({
    queryKey: templateKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getTemplates({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) {
        return pages.length + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => apiClient.getTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFeaturedTemplates() {
  return useQuery({
    queryKey: templateKeys.featured(),
    queryFn: () => apiClient.getFeaturedTemplates(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useTrendingTemplates() {
  return useQuery({
    queryKey: templateKeys.trending(),
    queryFn: () => apiClient.getTrendingTemplates(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useMyTemplates() {
  return useQuery({
    queryKey: templateKeys.my(),
    queryFn: () => apiClient.getMyTemplates(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTemplateAnalytics(id: string) {
  return useQuery({
    queryKey: templateKeys.analytics(id),
    queryFn: () => apiClient.getTemplateAnalytics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Mutation Hooks
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: components['schemas']['TemplateCreate']) =>
      apiClient.createTemplate(data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });

      toast.success('Template created successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<components['schemas']['TemplateUpdate']> }) =>
      apiClient.updateTemplate(id, data),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(templateKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });

      toast.success('Template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTemplate(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });

      toast.success('Template deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });

      toast.success('Template duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate template');
    },
  });
}

export function useRateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      apiClient.rateTemplate(id, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });

      toast.success('Rating submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });
}

export function useTemplateUsage() {
  const queryClient = useQueryClient();

  return {
    start: useMutation({
      mutationFn: (id: string) => apiClient.startTemplateUsage(id),
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to start template usage');
      },
    }),

    complete: useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        apiClient.completeTemplateUsage(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: templateKeys.analytics(variables.id) });

        toast.success('Template usage recorded');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to complete template usage');
      },
    }),
  };
}

export function useAnalyzeTemplateWithAI() {
  return useMutation({
    mutationFn: (id: string) => apiClient.analyzeTemplateWithAI(id),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to analyze template');
    },
  });
}

// Category Hooks
export function useCategories(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => apiClient.getCategories(params),
    staleTime: 15 * 60 * 1000, // Categories change less frequently
    gcTime: 30 * 60 * 1000,
  });
}

export function useCategoryTemplates(categoryId: number) {
  return useQuery({
    queryKey: categoryKeys.templates(categoryId),
    queryFn: () => apiClient.getCategoryTemplates(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}