import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { templatesService } from '../api/templates';
import type { AppTemplate, PaginatedResponse } from '../types/adapters';
import type { components } from '../../types/api';

type TemplateCreateUpdate = components['schemas']['TemplateCreateUpdateRequest'];
type PatchedTemplateUpdate = components['schemas']['PatchedTemplateCreateUpdateRequest'];

type TemplateSearch = {
  search?: string;
  category?: number;
  author?: string;
  is_featured?: boolean;
  is_public?: boolean;
  ordering?: string;
  page?: number;
};

type TemplateRating = {
  rating: number;
  review?: string;
};

type TemplateUsageData = {
  variables?: Record<string, unknown>;
  output?: string;
  success?: boolean;
  error_message?: string;
  completion_time?: number;
};

export const useTemplates = (filters?: TemplateSearch) => {
  const queryResult = useInfiniteQuery<PaginatedResponse<AppTemplate>>({
    queryKey: ['templates', 'list', filters],
    queryFn: ({ pageParam = 1 }) => templatesService.getTemplates({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      const nextPage = Number(url.searchParams.get('page'));
      return Number.isNaN(nextPage) ? undefined : nextPage;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const templates = queryResult.data?.pages.flatMap((page) => page.results) ?? [];
  const totalCount = queryResult.data?.pages[0]?.count ?? templates.length;

  return {
    templates,
    totalCount,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
  };
};

export const useTemplate = (id: string | undefined) =>
  useQuery<AppTemplate>({
    queryKey: ['templates', 'detail', id],
    queryFn: () => templatesService.getTemplate(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedTemplates = () =>
  useQuery<AppTemplate[]>({
    queryKey: ['templates', 'featured'],
    queryFn: () => templatesService.getFeaturedTemplates(),
    staleTime: 10 * 60 * 1000,
  });

export const useTrendingTemplates = () =>
  useQuery<AppTemplate[]>({
    queryKey: ['templates', 'trending'],
    queryFn: () => templatesService.getTrendingTemplates(),
    staleTime: 10 * 60 * 1000,
  });

export const useMyTemplates = () =>
  useQuery<AppTemplate[]>({
    queryKey: ['templates', 'my'],
    queryFn: () => templatesService.getMyTemplates(),
    staleTime: 2 * 60 * 1000,
  });

export const useSearchSuggestions = () =>
  useQuery<string[]>({
    queryKey: ['templates', 'search-suggestions'],
    queryFn: () => templatesService.getSearchSuggestions(),
    staleTime: 30 * 60 * 1000,
  });

export const templateKeys = {
  all: ['templates'] as const,
  lists: (params?: TemplateSearch) => [...templateKeys.all, 'list', params] as const,
  detail: (id?: string) => [...templateKeys.all, 'detail', id] as const,
  featured: () => [...templateKeys.all, 'featured'] as const,
  trending: () => [...templateKeys.all, 'trending'] as const,
  my: () => [...templateKeys.all, 'my'] as const,
  searchSuggestions: () => [...templateKeys.all, 'search-suggestions'] as const,
  analytics: (id?: string) => [...templateKeys.all, 'analytics', id] as const,
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<AppTemplate, unknown, string>({
    mutationFn: (id: string) => templatesService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
    },
  });
};

export const useRateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string; rating: TemplateRating }>({
    mutationFn: ({ id, rating }) => templatesService.rateTemplate(id, rating),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
};

export const useTemplateActions = () => {
  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: (templateData: TemplateCreateUpdate) => templatesService.createTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchedTemplateUpdate }) =>
      templatesService.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
    },
  });

  const duplicateTemplateMutation = useMutation<AppTemplate, unknown, string>({
    mutationFn: (id: string) => templatesService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });

  const rateTemplateMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: TemplateRating }) => templatesService.rateTemplate(id, rating),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });

  const startUsageMutation = useMutation({
    mutationFn: (id: string) => templatesService.startTemplateUsage(id),
  });

  const completeUsageMutation = useMutation({
    mutationFn: ({ id, usageData }: { id: string; usageData: TemplateUsageData }) =>
      templatesService.completeTemplateUsage(id, usageData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.analytics(id) });
    },
  });

  const analyzeWithAIMutation = useMutation({
    mutationFn: (id: string) => templatesService.analyzeTemplateWithAI(id),
  });

  return {
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    duplicateTemplate: duplicateTemplateMutation.mutate,
    rateTemplate: rateTemplateMutation.mutate,
    startUsage: startUsageMutation.mutate,
    completeUsage: completeUsageMutation.mutate,
    analyzeWithAI: analyzeWithAIMutation.mutate,

    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
    isDuplicating: duplicateTemplateMutation.isPending,
    isRating: rateTemplateMutation.isPending,
    isStartingUsage: startUsageMutation.isPending,
    isCompletingUsage: completeUsageMutation.isPending,
    isAnalyzing: analyzeWithAIMutation.isPending,

    createError: createTemplateMutation.error,
    updateError: updateTemplateMutation.error,
    deleteError: deleteTemplateMutation.error,
    duplicateError: duplicateTemplateMutation.error,
    rateError: rateTemplateMutation.error,
    startUsageError: startUsageMutation.error,
    completeUsageError: completeUsageMutation.error,
    analyzeError: analyzeWithAIMutation.error,

    createResult: createTemplateMutation.data,
    updateResult: updateTemplateMutation.data,
    duplicateResult: duplicateTemplateMutation.data,
    rateResult: rateTemplateMutation.data,
    startUsageResult: startUsageMutation.data,
    completeUsageResult: completeUsageMutation.data,
    analyzeResult: analyzeWithAIMutation.data,
  };
};

export const useTemplateAnalytics = (id: string | undefined) =>
  useQuery({
    queryKey: ['templates', 'analytics', id],
    queryFn: () => templatesService.getTemplateAnalytics(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
