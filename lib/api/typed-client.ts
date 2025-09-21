/**
 * Typed API Client with automatic bearer token authentication
 * Generated from api.d.ts - DO NOT EDIT MANUALLY
 */

import { components, operations } from '@/lib/types/api';
import { useAuthStore } from '@/store/user';

// Re-export types for convenience
export type Template = components['schemas']['Template'];
export type TemplateList = components['schemas']['TemplateList'];
export type TemplateDetail = components['schemas']['TemplateDetail'];
export type TemplateCategory = components['schemas']['TemplateCategory'];
export type UserProfile = components['schemas']['UserProfile'];
export type UserStats = components['schemas']['UserStats'];
export type LoginResponse = components['schemas']['TokenObtainPairResponse'];
export type RegisterResponse = components['schemas']['UserRegistrationResponse'];
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get token from Zustand store
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication Methods
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/v2/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Store tokens
    if (response.access) {
      useAuthStore.getState().setToken(response.access);
    }

    return response;
  }

  async register(data: components['schemas']['UserRegistration']): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/api/v2/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens if returned
    if (response.access) {
      useAuthStore.getState().setToken(response.access);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/v2/auth/logout/', {
        method: 'POST',
      });
    } finally {
      useAuthStore.getState().logout();
    }
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    return this.request('/api/v2/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v2/auth/profile/');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v2/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { old_password: string; new_password: string }): Promise<void> {
    await this.request('/api/v2/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/api/v2/auth/stats/');
  }

  // Template Methods
  async getTemplates(params?: {
    page?: number;
    limit?: number;
    category?: string;
    q?: string;
    is_featured?: boolean;
    is_public?: boolean;
    author?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<TemplateList>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request<PaginatedResponse<TemplateList>>(
      `/api/v2/templates/?${queryParams.toString()}`
    );
  }

  async getTemplate(id: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/`);
  }

  async createTemplate(data: components['schemas']['TemplateCreate']): Promise<Template> {
    return this.request<Template>('/api/v2/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<components['schemas']['TemplateUpdate']>): Promise<Template> {
    return this.request<Template>(`/api/v2/templates/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.request(`/api/v2/templates/${id}/`, {
      method: 'DELETE',
    });
  }

  async getFeaturedTemplates(): Promise<TemplateList[]> {
    return this.request<TemplateList[]>('/api/v2/templates/featured/');
  }

  async getTrendingTemplates(): Promise<TemplateList[]> {
    return this.request<TemplateList[]>('/api/v2/templates/trending/');
  }

  async getMyTemplates(): Promise<TemplateList[]> {
    return this.request<TemplateList[]>('/api/v2/templates/my_templates/');
  }

  async duplicateTemplate(id: string): Promise<Template> {
    return this.request<Template>(`/api/v2/templates/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  async rateTemplate(id: string, rating: number): Promise<void> {
    await this.request(`/api/v2/templates/${id}/rate_template/`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  async startTemplateUsage(id: string): Promise<any> {
    return this.request(`/api/v2/templates/${id}/start_usage/`, {
      method: 'POST',
    });
  }

  async completeTemplateUsage(id: string, data: any): Promise<any> {
    return this.request(`/api/v2/templates/${id}/complete_usage/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeTemplateWithAI(id: string): Promise<any> {
    return this.request(`/api/v2/templates/${id}/analyze_with_ai/`, {
      method: 'POST',
    });
  }

  async getTemplateAnalytics(id: string): Promise<any> {
    return this.request(`/api/v2/templates/${id}/analytics/`);
  }

  // Category Methods
  async getCategories(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<TemplateCategory>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request<PaginatedResponse<TemplateCategory>>(
      `/api/v2/template-categories/?${queryParams.toString()}`
    );
  }

  async getCategoryTemplates(categoryId: number): Promise<TemplateList[]> {
    return this.request<TemplateList[]>(`/api/v2/template-categories/${categoryId}/templates/`);
  }

  // AI Methods
  async getAIProviders(): Promise<any> {
    return this.request('/api/v2/ai/providers/');
  }

  async getAIModels(): Promise<any> {
    return this.request('/api/v2/ai/models/');
  }

  async generateWithAI(data: any): Promise<any> {
    return this.request('/api/v2/ai/generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIUsage(): Promise<any> {
    return this.request('/api/v2/ai/usage/');
  }

  async getAIQuotas(): Promise<any> {
    return this.request('/api/v2/ai/quotas/');
  }

  async getAISuggestions(data: any): Promise<any> {
    return this.request('/api/v2/ai/suggestions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chat Methods (with streaming support)
  async* streamChat(messages: any[], options?: any): AsyncGenerator<any, void, unknown> {
    const response = await fetch(`${this.baseURL}/api/v2/chat/completions/`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ messages, ...options, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              yield JSON.parse(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // RAG Methods
  async ragRetrieve(query: string, options?: any): Promise<any> {
    return this.request('/api/v2/ai/rag/retrieve/', {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    });
  }

  async ragAnswer(query: string, context?: any): Promise<any> {
    return this.request('/api/v2/ai/rag/answer/', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  // Agent Methods
  async optimizeWithAgent(data: any): Promise<any> {
    return this.request('/api/v2/ai/agent/optimize/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgentStats(): Promise<any> {
    return this.request('/api/v2/ai/agent/stats/');
  }

  // Health Check
  async healthCheck(): Promise<any> {
    return this.request('/health/');
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<any> {
    return this.request('/api/v2/metrics/performance/');
  }

  // Status
  async getStatus(): Promise<any> {
    return this.request('/api/v2/status/');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for testing/mocking
export default ApiClient;