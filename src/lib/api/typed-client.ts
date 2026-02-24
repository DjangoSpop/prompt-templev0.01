/**
 * Typed API Client with automatic bearer token authentication
 * Generated from api.d.ts - DO NOT EDIT MANUALLY
 */

import { components, operations } from '@/lib/types/api';
import { useAuthStore } from '@/store/user';
import type {
  SavedPrompt,
  PaginatedSavedPrompts,
  SavedPromptStats,
  PromptIteration,
  PromptUsageLog,
} from '@/types/saved-prompts';

// Re-export types for convenience - using actual schema names from api.d.ts
export type TemplateList = components['schemas']['TemplateList'];
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
      const err = new Error(message) as Error & { status: number };
      err.status = response.status;
      throw err;
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
  // AskMe — Guided Prompt Builder
  // ============================================

  async askmeStart(data: { intent: string; context?: string }): Promise<AskMeSession> {
    // Use `any` to handle the raw server shape before normalisation
    const raw = await this.request<any>('/api/v2/ai/askme/start/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Server returns questions with 'qid' / 'title' / 'kind' — normalise to frontend types
    const questions: AskMeQuestion[] = (raw.questions ?? []).map((q: any) => ({
      id: q.qid ?? q.id ?? '',
      question: q.title ?? q.question ?? '',
      type: q.kind ?? q.type,
      options: Array.isArray(q.options) && q.options.length ? q.options : undefined,
      help_text: q.help_text,
    }));
    return { ...raw, questions } as AskMeSession;
  }

  async askmeAnswer(data: {
    session_id: string;
    question_id: string;
    answer: string;
  }): Promise<AskMeAnswerResponse> {
    const raw = await this.request<any>('/api/v2/ai/askme/answer/', {
      method: 'POST',
      // Server expects 'qid', not 'question_id'
      body: JSON.stringify({
        session_id: data.session_id,
        qid: data.question_id,
        answer: data.answer,
      }),
    });
    // Normalise next_question if the server returns it with 'qid'/'title' shape
    if (raw.next_question) {
      const nq = raw.next_question;
      raw.next_question = {
        id: nq.qid ?? nq.id ?? '',
        question: nq.title ?? nq.question ?? '',
        type: nq.kind ?? nq.type,
        options: Array.isArray(nq.options) && nq.options.length ? nq.options : undefined,
        help_text: nq.help_text,
      } satisfies AskMeQuestion;
    }
    return raw as AskMeAnswerResponse;
  }

  async askmeFinalize(data: { session_id: string }): Promise<AskMeFinalResult> {
    return this.request<AskMeFinalResult>('/api/v2/ai/askme/finalize/', {
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
  usage: { tokens_in: number; tokens_out: number };
  run_id: string;
  processing_time_ms: number;
}

// ============================================
// AskMe Type Definitions
// ============================================

export interface AskMeQuestion {
  /** Normalised from server field 'qid' */
  id: string;
  /** Normalised from server field 'title' */
  question: string;
  /** Normalised from server field 'kind' (e.g. 'long_text' | 'choice') */
  type?: string;
  /** Available choices when type === 'choice' */
  options?: string[];
  help_text?: string;
}

export interface AskMeSession {
  session_id: string;
  goal: string;
  questions: AskMeQuestion[];
  status: 'active' | 'complete' | 'finalized';
  created_at: string;
}

export interface AskMeAnswerResponse {
  session_id: string;
  next_question?: AskMeQuestion;
  is_complete: boolean;
  answered_count?: number;
  total_questions?: number;
}

export interface AskMeFinalResult {
  session_id: string;
  prompt: string;
  explanation?: string;
  title?: string;
  category?: string;
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for testing/mocking
export default ApiClient;