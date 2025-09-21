import { BaseApiClient } from './base';
import type { components } from '../../types/api';

type TemplateCategory = components['schemas']['TemplateCategory'];
type TemplateList = components['schemas']['TemplateList'];
type PaginatedCategoryList = components['schemas']['PaginatedTemplateCategoryList'];

interface CategorySearch {
  search?: string;
  ordering?: string;
  page?: number;
}

export class CategoriesService extends BaseApiClient {
  async getTemplateCategories(filters?: CategorySearch): Promise<PaginatedCategoryList> {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/template-categories/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<PaginatedCategoryList>(endpoint);
  }

  async getTemplateCategory(id: number): Promise<TemplateCategory> {
    return this.request<TemplateCategory>(`/template-categories/${id}/`);
  }

  async getCategoryTemplates(id: number): Promise<TemplateList[]> {
    return this.request<TemplateList[]>(`/template-categories/${id}/templates/`);
  }
}

export const categoriesService = new CategoriesService();