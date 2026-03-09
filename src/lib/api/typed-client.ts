/**
 * Typed API Client with automatic bearer token authentication
 * Generated from api.d.ts - DO NOT EDIT MANUALLY
 */

import { components, operations } from '@/lib/types/api';
import { useAuthStore } from '@/store/user';
import { useCreditsStore } from '@/store/credits';
import type {
  SavedPrompt,
  PaginatedSavedPrompts,
  SavedPromptStats,
  PromptIteration,
  PromptUsageLog,
} from '@/types/saved-prompts';

// Re-export types for convenience - using actual schema names from api.d.ts
export type TemplateList = components['schemas']['TemplateList'];
/** Alias for backward compatibility with older code importing Template */
export type Template = TemplateList;
export type TemplateDetail = components['schemas']['TemplateDetail'];
export type TemplateCategory = components['schemas']['TemplateCategory'];
export type UserProfile = components['schemas']['UserProfile'];
export type LoginResponse = { access: string; refresh: string }; // Custom type since no token schema found
export type RegisterResponse = { access?: string; refresh?: string; user?: UserProfile };
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export interface UserStats {
  total_prompts?: number;
  total_templates_used?: number;
  total_credits_used?: number;
  credits_remaining?: number;
  streak_days?: number;
  rank?: string;
  [key: string]: unknown;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get token from Zustand store first, then fallback to localStorage
    let token = useAuthStore.getState().accessToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token') ?? undefined;
    }
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
      const raw = await response.text();
      let message = `Request failed: ${response.status}`;
      try {
        const parsed = JSON.parse(raw);
        message = parsed.error || parsed.detail || parsed.message || message;
      } catch {
        if (raw) message = raw;
      }
      const err = new Error(message) as Error & { status: number; code?: string };
      err.status = response.status;
      if (response.status === 402) err.code = 'INSUFFICIENT_CREDITS';
      throw err;
    }

    if (response.status === 204) {
      return {} as T;
    }

    // Extract credit headers and sync to credits store (client-side only)
    if (typeof window !== 'undefined') {
      const remaining = response.headers.get('X-Credits-Remaining');
      const used = response.headers.get('X-Credits-Used');
      const low = response.headers.get('X-Low-Credits');
      const balance = response.headers.get('X-Credits-Balance');
      const reserved = response.headers.get('X-Credits-Reserved');
      
      if (remaining !== null || low !== null || balance !== null) {
        useCreditsStore.getState().syncFromHeaders(
          remaining !== null ? Number(remaining) : null,
          used !== null ? Number(used) : null,
          low === 'true',
          balance !== null ? Number(balance) : null,
          reserved !== null ? Number(reserved) : null
        );
      }
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

  async register(data: components['schemas']['UserRegistrationRequest']): Promise<RegisterResponse> {
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

  async createTemplate(data: components['schemas']['TemplateCreateUpdateRequest']): Promise<TemplateDetail> {
    return this.request<TemplateDetail>('/api/v2/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<components['schemas']['PatchedTemplateCreateUpdateRequest']>): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/`, {
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

  async duplicateTemplate(id: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/duplicate/`, {
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

  // ============================================
  // Smart Template AI Actions
  // ============================================

  async templateSmartFill(
    id: string,
    variables: Record<string, string>
  ): Promise<SmartFillResult> {
    return this.request<SmartFillResult>(`/api/v2/templates/${id}/smart-fill/`, {
      method: 'POST',
      body: JSON.stringify({ variables }),
    });
  }

  async recommendTemplates(intent: string, context?: string): Promise<TemplateRecommendation[]> {
    const result = await this.request<{ recommendations: TemplateRecommendation[] }>(
      '/api/v2/templates/recommend/',
      {
        method: 'POST',
        body: JSON.stringify({ intent, context }),
      }
    );
    return result.recommendations ?? [];
  }

  async templateVariations(id: string, count?: number): Promise<TemplateVariation[]> {
    const result = await this.request<{ variations: TemplateVariation[] }>(
      `/api/v2/templates/${id}/variations/`,
      {
        method: 'POST',
        body: JSON.stringify({ count: count ?? 4 }),
      }
    );
    return result.variations ?? [];
  }

  // ============================================
  // Cost Preview
  // ============================================

  async getCostPreview(
    feature: string,
    params?: Record<string, unknown>
  ): Promise<CostPreviewResult> {
    return this.request<CostPreviewResult>('/api/v2/billing/cost-preview/', {
      method: 'POST',
      body: JSON.stringify({ feature, params }),
    });
  }

  async getTemplateAnalytics(id?: string): Promise<any> {
    if (id) return this.request(`/api/v2/templates/${id}/analytics/`);
    return this.request('/api/v2/analytics/template-analytics/');
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

  async getAIDashboard(): Promise<AIDashboardData> {
    return this.request<AIDashboardData>('/api/v2/ai/dashboard/');
  }

  async getAIQuotas(): Promise<any> {
    return this.request('/api/v2/ai/quotas/');
  }

  async getAISuggestions(data: { prompt?: string; q?: string; model?: string; [key: string]: any }): Promise<any> {
    const params = new URLSearchParams();
    const text = data.prompt ?? data.q ?? '';
    if (text) params.set('prompt', text);
    if (data.model) params.set('model', data.model);
    // Forward any other scalar params
    Object.entries(data).forEach(([k, v]) => {
      if (k !== 'prompt' && k !== 'q' && k !== 'model' && v !== undefined && v !== null) {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return this.request(`/api/v2/ai/suggestions/${qs ? `?${qs}` : ''}`);
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
  async optimizeWithAgent(data: {
    session_id: string;
    original: string;
    mode?: 'fast' | 'deep';
    context?: Record<string, unknown>;
    budget?: { tokens_in?: number; tokens_out?: number; max_credits?: number };
  }): Promise<AgentOptimizeResult> {
    return this.request<AgentOptimizeResult>('/api/v2/ai/agent/optimize/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgentStats(): Promise<any> {
    return this.request('/api/v2/ai/agent/stats/');
  }

  // ============================================
  // Core / App Config / Notifications
  // ============================================

  async getAppConfig(): Promise<Record<string, unknown>> {
    return this.request('/api/v2/core/config/');
  }

  async getNotifications(): Promise<{ results: AppNotification[]; count: number }> {
    return this.request('/api/v2/core/notifications/');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.request('/api/v2/core/notifications/read/', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health/');
  }

  async getStatus(): Promise<{ status: string; [key: string]: unknown }> {
    return this.request('/api/v2/status/');
  }

  async trackEvent(event: { event_type: string; data?: Record<string, unknown> }): Promise<void> {
    await this.request('/api/v2/analytics/track/', {
      method: 'POST',
      body: JSON.stringify(event),
    }).catch(() => {/* fire-and-forget: never block UI for analytics */});
  }

  // ============================================
  // AskMe — Guided Prompt Builder
  // ============================================

  async askmeStart(data: { intent: string; context?: string }): Promise<AskMeSession> {
    // Server returns the session shape directly — no field remapping needed.
    return this.request<AskMeSession>('/api/v2/ai/askme/start/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async askmeAnswer(data: {
    session_id: string;
    /** The question's qid exactly as returned by the server */
    qid: string;
    answer: string;
  }): Promise<AskMeSession> {
    // Server returns the same session shape as /start/ with updated is_answered flags.
    return this.request<AskMeSession>('/api/v2/ai/askme/answer/', {
      method: 'POST',
      body: JSON.stringify({
        session_id: data.session_id,
        qid: data.qid,
        answer: data.answer,
      }),
    });
  }

  async askmeFinalize(data: { session_id: string }): Promise<AskMeFinalResult> {
    return this.request<AskMeFinalResult>('/api/v2/ai/askme/finalize/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Recommended single-call endpoint: records all answers, deducts 3 credits atomically,
   * generates the final prompt, saves to PromptHistory, and returns everything in one shot.
   */
  async askmeSubmitAll(data: {
    session_id: string;
    answers: Array<{ qid: string; value: string }>;
  }): Promise<AskMeSubmitAllResult> {
    return this.request<AskMeSubmitAllResult>('/api/v2/ai/askme/submit-all/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAskmeSessions(): Promise<AskMeSession[]> {
    return this.request<AskMeSession[]>('/api/v2/ai/askme/sessions/');
  }

  async deleteAskmeSession(sessionId: string): Promise<void> {
    await this.request(`/api/v2/ai/askme/sessions/${sessionId}/delete/`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // DeepSeek Direct Endpoints
  // ============================================

  async deepseekChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<{ content: string; model: string; usage?: { prompt_tokens: number; completion_tokens: number } }> {
    return this.request('/api/v2/ai/deepseek/chat/', {
      method: 'POST',
      body: JSON.stringify({ messages, ...options }),
    });
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<any> {
    return this.request('/api/v2/metrics/performance/');
  }

  // ============================================
  // Saved Prompts (Prompt Library) Methods
  // ============================================

  async getSavedPrompts(params?: {
    search?: string;
    category?: string;
    tags?: string[];
    is_favorite?: boolean;
    is_public?: boolean;
    source?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    ordering?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedSavedPrompts> {
    const queryParams = new URLSearchParams();
    if (params) {
      // Convert sort_by + sort_order to Django ordering param
      const { sort_by, sort_order, ...rest } = params;
      if (sort_by && !params.ordering) {
        const prefix = sort_order === 'desc' ? '-' : '';
        queryParams.append('ordering', `${prefix}${sort_by}`);
      }
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    return this.request<PaginatedSavedPrompts>(
      `/api/v2/history/saved-prompts/?${queryParams.toString()}`
    );
  }

  async getSavedPrompt(id: string): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${id}/`);
  }

  async createSavedPrompt(data: {
    title: string;
    content: string;
    description?: string;
    category: string;
    tags?: string[];
    is_favorite?: boolean;
    is_public?: boolean;
    source?: string;
    source_template_id?: string;
    variables_snapshot?: Record<string, string | number | boolean>;
    metadata?: Record<string, unknown>;
  }): Promise<SavedPrompt> {
    return this.request<SavedPrompt>('/api/v2/history/saved-prompts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSavedPrompt(id: string, data: {
    title?: string;
    content?: string;
    description?: string;
    category?: string;
    tags?: string[];
    is_favorite?: boolean;
    is_public?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSavedPrompt(id: string): Promise<void> {
    await this.request(`/api/v2/history/saved-prompts/${id}/`, {
      method: 'DELETE',
    });
  }

  async toggleFavoritePrompt(id: string): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${id}/toggle-favorite/`, {
      method: 'POST',
    });
  }

  async recordPromptUsage(id: string, data?: {
    context?: string;
    model_used?: string;
    response_preview?: string;
  }): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${id}/use/`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getSavedPromptStats(): Promise<SavedPromptStats> {
    return this.request<SavedPromptStats>('/api/v2/history/saved-prompts/stats/');
  }

  async searchSavedPrompts(query: string): Promise<PaginatedSavedPrompts> {
    return this.request<PaginatedSavedPrompts>(`/api/v2/history/saved-prompts/search/?q=${encodeURIComponent(query)}`);
  }

  async duplicateSavedPrompt(id: string): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  async discoverTemplates(params?: {
    search?: string;
    category?: string;
    sort_by?: 'use_count' | 'created_at';
    sort_order?: 'asc' | 'desc';
    page?: number;
  }): Promise<PaginatedSavedPrompts> {
    const queryParams = new URLSearchParams();
    if (params) {
      const { sort_by, sort_order, ...rest } = params;
      if (sort_by) {
        const prefix = sort_order === 'asc' ? '' : '-';
        queryParams.append('ordering', `${prefix}${sort_by}`);
      }
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return this.request<PaginatedSavedPrompts>(
      `/api/v2/history/saved-prompts/discover/?${queryParams.toString()}`
    );
  }

  async getDiscoverCategories(): Promise<string[]> {
    return this.request<string[]>('/api/v2/history/saved-prompts/categories/');
  }

  async copyFromTemplate(templateId: string): Promise<SavedPrompt> {
    return this.request<SavedPrompt>('/api/v2/history/saved-prompts/copy-from-template/', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId }),
    });
  }

  // ============================================
  // Prompt Iterations (Version Control) Methods
  // ============================================

  async getPromptIterations(promptId: string): Promise<PromptIteration[]> {
    return this.request<PromptIteration[]>(`/api/v2/history/saved-prompts/${promptId}/iterations/`);
  }

  async createPromptIteration(promptId: string, data: {
    content: string;
    change_description: string;
    change_type: string;
    performance_metrics?: Record<string, unknown>;
  }): Promise<PromptIteration> {
    return this.request<PromptIteration>(`/api/v2/history/saved-prompts/${promptId}/iterations/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPromptIteration(promptId: string, iterationId: string): Promise<PromptIteration> {
    return this.request<PromptIteration>(`/api/v2/history/saved-prompts/${promptId}/iterations/${iterationId}/`);
  }

  async revertToIteration(promptId: string, iterationId: string): Promise<SavedPrompt> {
    return this.request<SavedPrompt>(`/api/v2/history/saved-prompts/${promptId}/iterations/${iterationId}/revert/`, {
      method: 'POST',
    });
  }

  async compareIterations(promptId: string, versionA: number, versionB: number): Promise<{ version_a: PromptIteration; version_b: PromptIteration; diff: string }> {
    return this.request(
      `/api/v2/history/saved-prompts/${promptId}/iterations/compare/?version_a=${versionA}&version_b=${versionB}`
    );
  }

  // ============================================
  // Prompt Usage History Methods
  // ============================================

  async getPromptUsageHistory(promptId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PromptUsageLog>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return this.request<PaginatedResponse<any>>(
      `/api/v2/history/saved-prompts/${promptId}/usage-history/?${queryParams.toString()}`
    );
  }

  // ============================================
  // Chat Sessions (History) Methods
  // ============================================

  async getChatSessions(page: number = 1, limit: number = 50): Promise<{
    sessions: ChatSession[];
    pagination?: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/api/v1/chat/sessions/?${queryParams.toString()}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request(`/api/v1/chat/sessions/${sessionId}/`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Gamification Methods
  // ============================================

  async getAchievements(): Promise<any> {
    return this.request('/api/v2/gamification/achievements/');
  }

  async getBadges(): Promise<any> {
    return this.request('/api/v2/gamification/badges/');
  }

  async getLeaderboard(limit: number = 50): Promise<any> {
    return this.request(`/api/v2/gamification/leaderboard/?limit=${limit}`);
  }

  async getDailyChallenges(): Promise<any> {
    return this.request('/api/v2/gamification/daily-challenges/');
  }

  async getUserLevel(): Promise<any> {
    return this.request('/api/v2/gamification/user-level/');
  }

  async getStreak(): Promise<any> {
    return this.request('/api/v2/gamification/streak/');
  }

  // ============================================
  // Analytics Methods
  // ============================================

  // ============================================
  // Conversation Threads (/api/v2/history/threads/)
  // ============================================

  async getConversationThreads(params?: { page?: number; is_shared?: boolean; status?: string }): Promise<any> {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.append(k, String(v)); });
    return this.request(`/api/v2/history/threads/${qs.toString() ? `?${qs}` : ''}`);
  }

  async getConversationThread(id: string): Promise<any> {
    return this.request(`/api/v2/history/threads/${id}/`);
  }

  async createConversationThread(data: { title: string; status?: string; is_shared?: boolean }): Promise<any> {
    return this.request('/api/v2/history/threads/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateConversationThread(id: string, data: Record<string, any>): Promise<any> {
    return this.request(`/api/v2/history/threads/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteConversationThread(id: string): Promise<void> {
    await this.request(`/api/v2/history/threads/${id}/`, { method: 'DELETE' });
  }

  async addIterationToThread(threadId: string, iterationId: string): Promise<any> {
    return this.request(`/api/v2/history/threads/${threadId}/add-iteration/`, {
      method: 'POST',
      body: JSON.stringify({ iteration_id: iterationId }),
    });
  }

  // ============================================
  // Analytics
  // ============================================

  async getAnalyticsDashboard(): Promise<any> {
    return this.request('/api/v2/analytics/dashboard/');
  }

  async getUserInsights(): Promise<any> {
    return this.request('/api/v2/analytics/user-insights/');
  }

  async getRecommendations(): Promise<any> {
    return this.request('/api/v2/analytics/recommendations/');
  }

  async trackAnalytics(event: { event_type: string; data?: any }): Promise<void> {
    await this.request('/api/v2/analytics/track/', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // ============================================
  // Billing Methods
  // ============================================

  async getBillingPlans(): Promise<{ plans: BillingPlan[] }> {
    return this.request<{ plans: BillingPlan[] }>('/api/v2/billing/plans/');
  }

  async getSubscription(): Promise<{ subscription: SubscriptionState }> {
    return this.request<{ subscription: SubscriptionState }>('/api/v2/billing/me/subscription/');
  }

  async getEntitlements(): Promise<{ entitlements: Entitlements }> {
    return this.request<{ entitlements: Entitlements }>('/api/v2/billing/me/entitlements/');
  }

  async getBillingUsage(): Promise<{ usage: UsageSummary }> {
    return this.request<{ usage: UsageSummary }>('/api/v2/billing/me/usage/');
  }

  async createCheckoutSession(
    planCode: 'PRO' | 'POWER',
    opts?: { success_url?: string; cancel_url?: string }
  ): Promise<CheckoutSessionResponse> {
    return this.request<CheckoutSessionResponse>(
      `/api/v2/billing/checkout-session/${planCode}/`,
      {
        method: 'POST',
        body: JSON.stringify(opts ?? {}),
      }
    );
  }

  async createPortalSession(returnUrl?: string): Promise<BillingPortalResponse> {
    return this.request<BillingPortalResponse>('/api/v2/billing/portal/', {
      method: 'POST',
      body: JSON.stringify({ return_url: returnUrl }),
    });
  }
}

// ============================================
// Supporting Types
// ============================================

export interface ChatSession {
  id: string;
  title: string;
  createdAt?: number;
  created_at?: string;
  updatedAt?: number;
  updated_at?: string;
  messageCount?: number;
  message_count?: number;
  starred?: boolean;
  archived?: boolean;
}

// ============================================
// Agent Optimize Type Definitions
// ============================================

export interface AgentOptimizeCitation {
  id: string;
  title: string;
  source: string;
  score: number;
}

export interface AgentOptimizeResult {
  optimized: string;
  citations: AgentOptimizeCitation[];
  diff_summary: string;
  usage: { tokens_in: number; tokens_out: number; credits_consumed?: number };
  run_id: string;
  processing_time_ms: number;
  /** Credits consumed by this optimization call */
  credits_consumed?: number;
  /** Which mode was used */
  mode?: 'fast' | 'deep';
  /** Whether result came from cache */
  from_cache?: boolean;
  /** Confidence score 0–10 */
  confidence_score?: number;
  /** Named improvement dimensions */
  improvements?: {
    clarity?: number;
    specificity?: number;
    effectiveness?: number;
    overall?: number;
  };
}

// ============================================
// AskMe Type Definitions
// ============================================

/** Raw question shape as returned by the server. No re-mapping. */
export interface AskMeQuestion {
  qid: string;
  title: string;
  help_text?: string;
  /** 'long_text' | 'short_text' | 'choice' | 'boolean' */
  kind: string;
  options: string[];
  variable: string;
  required: boolean;
  suggested: string;
  /** True when this question was already answered (e.g. from the initial intent) */
  is_answered: boolean;
  /** Current answer value — empty string when not answered */
  answer: string;
}

/** Shape returned by /askme/start/ and /askme/answer/ */
export interface AskMeSession {
  session_id: string;
  questions: AskMeQuestion[];
  /** True when the backend has enough info to generate the final prompt */
  good_enough_to_run: boolean;
  preview_prompt: string | null;
}

/** @deprecated Use AskMeSession — the answer endpoint now returns the full session */
export interface AskMeAnswerResponse extends AskMeSession {}

export interface AskMeFinalResult {
  session_id: string;
  /** The generated prompt content */
  prompt: string;
  explanation?: string;
  title?: string;
  category?: string;
  /** The user's original stated intent */
  original_intent?: string;
  /** 0–100 completeness of spec coverage */
  spec_completeness?: number;
  /** Overall quality score 0–10 */
  quality_score?: number;
  /** Character count of the optimized prompt */
  optimized_length?: number;
  /** Credits consumed by this finalize call */
  credits_used?: number;
}

/**
 * Response shape from POST /api/v2/ai/askme/submit-all/
 * One call records all answers, generates the prompt, and saves to PromptHistory.
 */
export interface AskMeSubmitAllResult {
  session_id: string;
  /** The final generated prompt */
  prompt: string;
  /** ID of the auto-saved PromptHistory record — link user to /library */
  prompt_history_id?: string;
  comparison?: {
    original_intent?: string;
    improvement_ratio?: number;
    quality_indicators?: string[];
    spec_completeness?: number;
  };
  metadata?: {
    spec?: Record<string, unknown>;
    variables_used?: string[];
    completion_percentage?: number;
  };
  /** Fields also present on AskMeFinalResult for UI compatibility */
  explanation?: string;
  title?: string;
  category?: string;
  original_intent?: string;
  spec_completeness?: number;
  quality_score?: number;
  optimized_length?: number;
  credits_used?: number;
}

// ============================================
// AI Dashboard Type Definitions
// ============================================

export interface AIDashboardDailyUsage {
  date: string;
  credits_used: number;
  api_calls: number;
  tokens_generated: number;
}

export interface AIDashboardFeatureUsage {
  feature: string;
  credits_used: number;
  call_count: number;
  percentage: number;
}

export interface AIDashboardData {
  credits_remaining: number;
  credits_total: number;
  api_calls_this_month: number;
  avg_latency_ms: number;
  tokens_generated: number;
  daily_usage: AIDashboardDailyUsage[];
  feature_breakdown: AIDashboardFeatureUsage[];
  roi: {
    direct_api_cost: number;
    temple_cost: number;
    savings_percentage: number;
  };
  plan_code: string;
  plan_name: string;
  credits_refresh_date: string;
}

// ============================================
// Billing Type Definitions (matches backend guide exactly)
// ============================================

export type PlanCode = 'FREE' | 'PRO' | 'POWER';
export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'expired' | 'past_due';

export interface BillingPlan {
  id: string;
  plan_code: PlanCode;
  name: string;
  price: string;
  currency: string;
  billing_interval: string;
  monthly_credits: number;
  max_requests_per_hour: number;
  max_requests_per_day: number;
  max_input_tokens: number;
  max_output_tokens: number;
  allowed_models: string[];
  daily_template_limit: number;
  daily_copy_limit: number;
  premium_templates_access: boolean;
  ads_free: boolean;
  priority_support: boolean;
  analytics_access: boolean;
  api_access: boolean;
  collaboration_features: boolean;
  stripe_price_id: string;
  is_popular: boolean;
  features_list: string[];
}

export interface Entitlements {
  plan_code: PlanCode;
  plan_name: string;
  credits_balance: number;
  credits_available: number;
  monthly_credits: number;
  max_requests_per_hour: number;
  max_requests_per_day: number;
  max_input_tokens: number;
  max_output_tokens: number;
  allowed_models: string[];
  daily_template_limit: number;
  daily_copy_limit: number;
  premium_templates: boolean;
  ads_free: boolean;
  priority_support: boolean;
  analytics: boolean;
  api_access: boolean;
  collaboration: boolean;
  streaming_enabled: boolean;
}

export interface SubscriptionState {
  id: string;
  status: SubscriptionStatus;
  is_active: boolean;
  is_premium: boolean;
  plan: BillingPlan;
  credits_balance: number;
  credits_reserved: number;
  credits_available: number;
  credits_refilled_at: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  days_remaining: number;
  auto_renew: boolean;
  stripe_customer_id?: string;
}

export interface FeatureUsageLine {
  feature: string;
  total_credits: number;
  total_tokens_out: number;
  call_count: number;
}

export interface UsageSummary {
  period_start: string;
  credits_consumed_this_period: number;
  credits_remaining: number;
  by_feature: FeatureUsageLine[];
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  plan_code: PlanCode;
  plan_name: string;
}

export interface BillingPortalResponse {
  portal_url: string;
}

// ============================================
// Smart Template Type Definitions
// ============================================

export interface SmartFillResult {
  filled_prompt: string;
  suggestions: Record<string, string[]>;
  credits_used?: number;
}

export interface TemplateRecommendation {
  template_id: string;
  title: string;
  relevance_score: number;
  reason: string;
  category?: string;
}

export interface TemplateVariation {
  title: string;
  content: string;
  difference_summary: string;
}

// ============================================
// Cost Preview Type
// ============================================

export interface CostPreviewResult {
  estimated_credits: number;
  description: string;
  feature: string;
}

// ============================================
// Core / Notification Types
// ============================================

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

// ============================================
// App Config / Notifications / Core
// ============================================

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for testing/mocking
export default ApiClient;