import { BaseApiClient } from './base';
import type { components } from '../../types/api';
import { TypeAdapters, type AppTemplate, type PaginatedResponse, type AppCategory } from '../types/adapters';

type TemplateList = components['schemas']['TemplateList'];
type TemplateDetail = components['schemas']['TemplateDetail'];
type TemplateCreateUpdate = components['schemas']['TemplateCreateUpdateRequest'];
type PatchedTemplateUpdate = components['schemas']['PatchedTemplateCreateUpdateRequest'];
type PaginatedTemplateList = components['schemas']['PaginatedTemplateListList'];

interface TemplateSearch {
  search?: string;
  category?: number;
  author?: string;
  is_featured?: boolean;
  is_public?: boolean;
  ordering?: string;
  page?: number;
}

interface TemplateRating {
  rating: number;
  review?: string;
}

interface TemplateUsageData {
  variables?: Record<string, any>;
  output?: string;
  success?: boolean;
  error_message?: string;
  completion_time?: number;
}

interface TemplateAnalysis {
  suggestions: string[];
  score: number;
  issues?: string[];
  recommendations?: string[];
}

export class TemplatesService extends BaseApiClient {
  async getTemplates(filters?: TemplateSearch): Promise<PaginatedResponse<AppTemplate>> {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/templates/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.request<PaginatedTemplateList>(endpoint);
    
    return TypeAdapters.convertPaginatedResponse(
      response,
      (item: TemplateList) => TypeAdapters.convertTemplateList([item])[0]
    );
  }

  async getTemplate(id: string): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>(`/templates/${id}/`);
    return TypeAdapters.convertTemplate(response);
  }

  async createTemplate(templateData: TemplateCreateUpdate): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>('/templates/', {
      method: 'POST',
      data: templateData,
    });
    return TypeAdapters.convertTemplate(response);
  }

  async updateTemplate(id: string, templateData: PatchedTemplateUpdate): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>(`/templates/${id}/`, {
      method: 'PATCH',
      data: templateData,
    });
    return TypeAdapters.convertTemplate(response);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request<void>(`/templates/${id}/`, {
      method: 'DELETE',
    });
  }

  async getFeaturedTemplates(): Promise<AppTemplate[]> {
    const response = await this.request<TemplateDetail[]>('/templates/featured/');
    return response.map(template => TypeAdapters.convertTemplate(template));
  }

  async getTrendingTemplates(): Promise<AppTemplate[]> {
    const response = await this.request<TemplateDetail[]>('/templates/trending/');
    return response.map(template => TypeAdapters.convertTemplate(template));
  }

  async getMyTemplates(): Promise<AppTemplate[]> {
    const response = await this.request<TemplateDetail[]>('/templates/my_templates/');
    return response.map(template => TypeAdapters.convertTemplate(template));
  }

  async getSearchSuggestions(): Promise<string[]> {
    return this.request<string[]>('/templates/search_suggestions/');
  }

  async duplicateTemplate(id: string): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>(`/templates/${id}/duplicate/`, {
      method: 'POST',
    });
    return TypeAdapters.convertTemplate(response);
  }

  async rateTemplate(id: string, rating: TemplateRating): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>(`/templates/${id}/rate_template/`, {
      method: 'POST',
      data: rating,
    });
    return TypeAdapters.convertTemplate(response);
  }

  async startTemplateUsage(id: string): Promise<{ usage_session_id: string }> {
    return this.request<{ usage_session_id: string }>(`/templates/${id}/start_usage/`, {
      method: 'POST',
    });
  }

  async completeTemplateUsage(id: string, usageData: TemplateUsageData): Promise<AppTemplate> {
    const response = await this.request<TemplateDetail>(`/templates/${id}/complete_usage/`, {
      method: 'POST',
      data: usageData,
    });
    return TypeAdapters.convertTemplate(response);
  }

  async analyzeTemplateWithAI(id: string): Promise<TemplateAnalysis> {
    return this.request<TemplateAnalysis>(`/templates/${id}/analyze_with_ai/`, {
      method: 'POST',
    });
  }

  async getTemplateAnalytics(id: string): Promise<any> {
    return this.request<any>(`/api/v2/templates/${id}/analytics/`);
  }
}

export const templatesService = new TemplatesService();
