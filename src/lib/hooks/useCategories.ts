import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../api/categories';

interface CategorySearch {
  search?: string;
  ordering?: string;
  page?: number;
}

export const useCategories = (filters?: CategorySearch) => {
  return useQuery({
    queryKey: ['categories', 'list', filters],
    queryFn: () => categoriesService.getTemplateCategories(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes - categories don't change often
  });
};

export const useCategory = (id: number | undefined) => {
  return useQuery({
    queryKey: ['categories', 'detail', id],
    queryFn: () => categoriesService.getTemplateCategory(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCategoryTemplates = (id: number | undefined) => {
  return useQuery({
    queryKey: ['categories', 'templates', id],
    queryFn: () => categoriesService.getCategoryTemplates(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};