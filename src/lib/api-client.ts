import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { BaseApiClient } from './api/base';

// Default configuration
const DEFAULT_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Token management - Simple interface to get tokens from localStorage
// This syncs with BaseApiClient's shared token system
// Token management - Simple interface to get tokens from localStorage
// This syncs with BaseApiClient's shared token system
const TokenManager = {
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }
};
import type { 
  components
} from '../types/api';


type TemplateList = components['schemas']['TemplateList'];
type TemplateDetail = components['schemas']['TemplateDetail'];
type TemplateCategory = components['schemas']['TemplateCategory'];
type UserProfile = components['schemas']['UserProfile'];
type UserRegistration = components['schemas']['UserRegistrationRequest'];

type PaginatedTemplateList = components['schemas']['PaginatedTemplateListList'];


interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

interface TokenPair {
  access: string;
  refresh: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  checks?: Record<string, any>;
}

interface AppConfig {
  version: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

interface TemplateSearch {
  search?: string;
  category?: number;
  author?: string;
  is_featured?: boolean;
  is_public?: boolean;
  ordering?: string;
  page?: number;
}

interface AnalyticsEvent {
  event_type: string;
  data?: Record<string, any>;
  timestamp?: string;
}

// Default base URL: prefer an explicit env var; fall back to the public API host.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Event listeners for authentication state changes
type AuthEventType = 'login' | 'logout' | 'token_refresh' | 'unauthorized';
type AuthEventListener = (data?: any) => void;

class ApiClient {
  private axiosInstance: AxiosInstance = axios.create();
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private backendHealthy = true;
  private lastHealthCheck = 0;
  private failedRequestsQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];
  private eventListeners: Map<AuthEventType, Set<AuthEventListener>> = new Map();

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
    this.setupAxiosInstance();
    this.setupInterceptors();
  }

  // Event system for auth state changes
  addEventListener(event: AuthEventType, listener: AuthEventListener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  removeEventListener(event: AuthEventType, listener: AuthEventListener) {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emitEvent(event: AuthEventType, data?: any) {
    this.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in auth event listener for ${event}:`, error);
      }
    });
  }

  private setupAxiosInstance() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        // Removed x-client-version due to CORS restrictions
      },
    });
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  // Method to get shared access token from BaseApiClient
  private getSharedAccessToken(): string | null {
    try {
      // Get token from shared localStorage (synced with BaseApiClient)
      return TokenManager.getAccessToken();
    } catch (error) {
      console.warn('Failed to get shared access token:', error);
      return null;
    }
  }

  private saveTokensToStorage(tokenPair: TokenPair) {
    // Always update the in-memory tokens so server-side code (e.g. NextAuth
    // authorize) can use them immediately. Only persist to localStorage
    // when running in the browser.
    this.accessToken = tokenPair.access;
    this.refreshToken = tokenPair.refresh;
    this.emitEvent('token_refresh', tokenPair);

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokenPair.access);
      localStorage.setItem('refresh_token', tokenPair.refresh);
    }
  }

  private removeTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.accessToken = null;
      this.refreshToken = null;
      this.emitEvent('logout');
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Add 30 seconds buffer
      return payload.exp < (currentTime + 30);
    } catch (error) {
      return true;
    }
  }

  private setupInterceptors() {
    // Request interceptor - add auth header and request ID
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        // Removed x-request-id due to CORS restrictions
        // config.headers['x-request-id'] = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
        
        // Use BaseApiClient's shared token system instead of local tokens
        const sharedToken = this.getSharedAccessToken();
        if (sharedToken && !this.isTokenExpired(sharedToken)) {
          config.headers.Authorization = `Bearer ${sharedToken}`;
        } else if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
          // Fallback to local token if shared token not available
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If refresh is already in progress, queue the request
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers!.Authorization = `Bearer ${token}`;
                  resolve(this.axiosInstance(originalRequest));
                },
                reject: (err: any) => reject(err),
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              // Process queued requests
              this.failedRequestsQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedRequestsQueue = [];
              
              // Retry original request
              originalRequest.headers!.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, reject all queued requests
            this.failedRequestsQueue.forEach(({ reject }) => reject(refreshError));
            this.failedRequestsQueue = [];

            // Emit unauthorized event for app-wide handling and clear tokens.
            // Don't perform a hard redirect here — leave navigation to the
            // React layer (AuthProvider) to avoid competing redirects and
            // infinite loops when multiple requests fail concurrently.
            this.emitEvent('unauthorized');
            this.removeTokensFromStorage();
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/v2/auth/refresh/`, {
        refresh: this.refreshToken,
      });

      const { access } = response.data;
      
      // Update tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
      }
      this.accessToken = access;
      
      this.emitEvent('token_refresh', { access });
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    // Check health every 30 seconds
    if (now - this.lastHealthCheck < 30000 && this.backendHealthy) {
      return this.backendHealthy;
    }

    try {
      await axios.get(`${this.baseURL}/health/`, { timeout: 5000 });
      this.backendHealthy = true;
      this.lastHealthCheck = now;
      return true;
    } catch (error) {
      this.backendHealthy = false;
      this.lastHealthCheck = now;
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        ...config,
      });
      this.backendHealthy = true; // Mark as healthy on successful request
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Check if this is a network error
        if (!error.response && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
          this.backendHealthy = false;
        }
        
        const errorData = error.response?.data || {};
        throw new ApiError(
          errorData.message || error.message || `HTTP ${error.response?.status}: ${error.response?.statusText}`,
          error.response?.status || 0,
          errorData
        );
      }
      throw error;
    }
  }

  // Health & Config APIs
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health/');
  }

  async getCoreHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/v2/core/health/');
  }

  async getConfig(): Promise<AppConfig> {
    return this.request<AppConfig>('/api/v2/core/config/');
  }

  // Authentication APIs
  async register(userData: UserRegistration): Promise<{ user: UserProfile; tokens: TokenPair }> {
    const response = await this.request<{ user: UserProfile; tokens: TokenPair }>('/api/v2/auth/register/', {
      method: 'POST',
      data: userData,
    });
    
    this.saveTokensToStorage(response.tokens);
    this.emitEvent('login', response);
    return response;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/v2/auth/login/', {
      method: 'POST',
      data: credentials,
    });
    
    // Extract tokens from the response and save them
    const tokens = { access: response.access, refresh: response.refresh };
    this.saveTokensToStorage(tokens);
    this.emitEvent('login', response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/v2/auth/logout/', {
        method: 'POST',
      });
    } finally {
      this.removeTokensFromStorage();
    }
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v2/auth/profile/');
  }

  async updateProfile(profileData: Partial<components['schemas']['UserUpdateRequest']>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v2/auth/profile/', {
      method: 'PATCH',
      data: profileData,
    });
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/api/v2/auth/check-username/?username=${encodeURIComponent(username)}`);
  }

  async checkEmail(email: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/api/v2/auth/check-email/?email=${encodeURIComponent(email)}`);
  }

  async getUserStats(): Promise<any> {
    return this.request<any>('/api/v2/auth/stats/');
  }

  async changePassword(data: { old_password: string; new_password: string }): Promise<void> {
    return this.request<void>('/api/v2/auth/change-password/', {
      method: 'POST',
      data,
    });
  }

  // Template APIs
  async getTemplates(filters?: TemplateSearch): Promise<PaginatedTemplateList> {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/api/v2/templates/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<PaginatedTemplateList>(endpoint);
  }

  async getTemplate(id: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/`);
  }

  async createTemplate(templateData: components['schemas']['TemplateCreateUpdateRequest']): Promise<TemplateDetail> {
    console.log('Creating template with data:', templateData);
    const result = await this.request<TemplateDetail>('/api/v2/templates/', {
      method: 'POST',
      data: templateData,
    });
    console.log('Template creation response:', result);
    return result;
  }

  async updateTemplate(id: string, templateData: components['schemas']['PatchedTemplateCreateUpdateRequest']): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/`, {
      method: 'PATCH',
      data: templateData,
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request<void>(`/api/v2/templates/${id}/`, {
      method: 'DELETE',
    });
  }

  async getFeaturedTemplates(): Promise<TemplateDetail[]> {
    return this.request<TemplateDetail[]>('/api/v2/templates/featured/');
  }

  async getTrendingTemplates(): Promise<TemplateDetail[]> {
    return this.request<TemplateDetail[]>('/api/v2/templates/trending/');
  }

  async getMyTemplates(): Promise<TemplateDetail[]> {
    return this.request<TemplateDetail[]>('/api/v2/templates/my_templates/');
  }

  async getSearchSuggestions(): Promise<string[]> {
    return this.request<string[]>('/api/v2/templates/search_suggestions/');
  }


  async rateTemplate(id: string, rating: number, review?: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/rate_template/`, {
      method: 'POST',
      data: { rating, review },
    });
  }

  async startTemplateUsage(id: string): Promise<{ usage_session_id: string }> {
    return this.request<{ usage_session_id: string }>(`/api/v2/templates/${id}/start_usage/`, {
      method: 'POST',
    });
  }

  async completeTemplateUsage(id: string, usageData: any): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/v2/templates/${id}/complete_usage/`, {
      method: 'POST',
      data: usageData,
    });
  }

  async analyzeTemplateWithAI(id: string): Promise<{ suggestions: string[]; score: number }> {
    return this.request<{ suggestions: string[]; score: number }>(`/api/v2/templates/${id}/analyze_with_ai/`, {
      method: 'POST',
    });
  }


  // Template Categories APIs
  async getTemplateCategories(): Promise<components["schemas"]["PaginatedTemplateCategoryList"]> {
    return this.request<components["schemas"]["PaginatedTemplateCategoryList"]>('/api/v2/template-categories/');
  }

  // Alias for getTemplateCategories for backward compatibility
  async getCategories(): Promise<components["schemas"]["PaginatedTemplateCategoryList"]> {
    return this.getTemplateCategories();
  }

  async getTemplateCategory(id: number): Promise<TemplateCategory> {
    return this.request<TemplateCategory>(`/api/v2/template-categories/${id}/`);
  }

  async getCategoryTemplates(id: number): Promise<TemplateList[]> {
    return this.request<TemplateList[]>(`/api/v2/template-categories/${id}/templates/`);
  }

  // Analytics APIs

  async getDashboard(): Promise<any> {
    return this.request<any>('/api/v2/analytics/dashboard/');
  }

  async getUserInsights(): Promise<any> {
    return this.request<any>('/api/v2/analytics/user-insights/');
  }

  async getAllTemplateAnalytics(): Promise<any> {
    return this.request<any>('/api/v2/analytics/template-analytics/');
  }

  async getRecommendations(): Promise<TemplateList[]> {
    return this.request<TemplateList[]>('/api/v2/analytics/recommendations/');
  }

  async getABTests(): Promise<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    variants: any[];
    metrics: any;
    user_variant?: string;
  }[]> {
    return this.request<{
      id: string;
      name: string;
      status: 'active' | 'paused' | 'completed';
      variants: any[];
      metrics: any;
      user_variant?: string;
    }[]>('/api/v2/analytics/ab-tests/');
  }

  // Gamification APIs
  async getAchievements(): Promise<any[]> {
    return this.request<any[]>('/api/v2/gamification/achievements/');
  }

  async getBadges(): Promise<any[]> {
    const res = await this.request<any>('/api/v2/gamification/badges/');
    // Backend returns { badges: [], total_badges: 0, recent_badges: [] }
    return Array.isArray(res) ? res : (res?.badges ?? []);
  }

  async getLeaderboard(limit: number = 50): Promise<any> {
    return this.request<any>(`/api/v2/gamification/leaderboard/?limit=${limit}`);
  }

  async getDailyChallenges(): Promise<any> {
    return this.request<any>('/api/v2/gamification/daily-challenges/');
  }

  async getUserLevel(): Promise<any> {
    return this.request<any>('/api/v2/gamification/user-level/');
  }

  async getStreak(): Promise<{ current_streak: number; longest_streak: number }> {
    return this.request<{ current_streak: number; longest_streak: number }>('/api/v2/gamification/streak/');
  }

  // Orchestrator APIs (for advanced functionality)
  async detectIntent(userInput: string, context?: any): Promise<any> {
    return this.request<any>('/api/v2/orchestrator/intent/', {
      method: 'POST',
      data: { prompt: userInput, query: userInput, context },
    });
  }

  async assessPrompt(originalPrompt: string, llmResponse: string, context?: any): Promise<any> {
    return this.request<any>('/api/v2/orchestrator/assess/', {
      method: 'POST',
      data: { 
        original_prompt: originalPrompt, 
        llm_response: llmResponse, 
        context 
      },
    });
  }

  async renderTemplate(templateId: string, variables: Record<string, string>): Promise<any> {
    return this.request<any>('/api/v2/orchestrator/render/', {
      method: 'POST',
      data: { template_id: templateId, variables },
    });
  }

  async searchTemplates(query: string): Promise<TemplateList[]> {
    return this.request<TemplateList[]>(`/api/v2/orchestrator/search/?q=${encodeURIComponent(query)}`);
  }

  // AI Service APIs
  async getAIProviders(): Promise<any[]> {
    return this.request<any[]>('/api/v2/ai/providers/');
  }

  async getAIModels(providerId?: string): Promise<any[]> {
    const endpoint = providerId
      ? `/api/v2/ai/models/?provider=${encodeURIComponent(providerId)}`
      : '/api/v2/ai/models/';
    const res = await this.request<any>(endpoint);
    return Array.isArray(res) ? res : (res?.models ?? []);
  }

  async generateWithAI(data: {
    model: string;
    prompt: string;
    parameters?: Record<string, any>;
    template_id?: string;
  }): Promise<{
    response: string;
    usage: any;
    metadata: any;
  }> {
    return this.request<{
      response: string;
      usage: any;
      metadata: any;
    }>('/api/v2/ai/generate/', {
      method: 'POST',
      data,
    });
  }

  async getAIUsage(period?: 'day' | 'week' | 'month'): Promise<{
    total_requests: number;
    total_tokens: number;
    cost: number;
    by_model: Record<string, any>;
  }> {
    const endpoint = period 
      ? `/api/v2/ai/usage/?period=${period}`
      : '/api/v2/ai/usage/';
    return this.request<{
      total_requests: number;
      total_tokens: number;
      cost: number;
      by_model: Record<string, any>;
    }>(endpoint);
  }

  async getAIQuotas(): Promise<{
    daily_limit: number;
    daily_used: number;
    monthly_limit: number;
    monthly_used: number;
    rate_limit: number;
  }> {
    return this.request<{
      daily_limit: number;
      daily_used: number;
      monthly_limit: number;
      monthly_used: number;
      rate_limit: number;
    }>('/api/v2/ai/quotas/');
  }

  // Core/Notifications APIs
  async getNotifications(): Promise<any[]> {
    return this.request<any[]>('/api/v2/core/notifications/');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request<void>('/api/v2/core/notifications/', {
      method: 'POST',
      data: { notification_id: notificationId },
    });
  }

  // Billing APIs
  async getBillingPlans(): Promise<any[]> {
    const res = await this.request<any>('/api/v2/billing/plans/');
    // Backend returns { plans: [...] }
    return Array.isArray(res) ? res : (res?.plans ?? []);
  }

  async getBillingPlan(id: number): Promise<any> {
    const res = await this.request<any>(`/api/v2/billing/plans/${id}/`);
    return res?.plan ?? res;
  }

  async getSubscription(): Promise<any> {
    const res = await this.request<any>('/api/v2/billing/me/subscription/');
    // Backend returns { subscription: {...} }
    return res?.subscription ?? res;
  }

  async getEntitlements(): Promise<any[]> {
    const res = await this.request<any>('/api/v2/billing/me/entitlements/');
    const raw = res?.entitlements ?? res;
    // Backend returns { entitlements: { max_templates: N, ai_requests_per_day: N, ... } }
    // Transform to expected Entitlement[] array format
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      return Object.entries(raw).map(([feature, limit]) => ({
        feature,
        limit: typeof limit === 'number' ? limit : 0,
        used: 0,
        remaining: typeof limit === 'number' ? limit : 0,
        unlimited: limit === -1 || limit === null,
      }));
    }
    return [];
  }

  async getBillingUsage(): Promise<any> {
    const res = await this.request<any>('/api/v2/billing/me/usage/');
    // Backend returns { usage: {...} }
    return res?.usage ?? res;
  }

  async getUsage(): Promise<any> {
    return this.getBillingUsage();
  }

  async createCheckoutSession(
    planIdOrData: string | { plan_id: number | string; success_url?: string; cancel_url?: string },
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ checkout_url: string; session_id: string }> {
    const data = typeof planIdOrData === 'object'
      ? planIdOrData
      : { plan_id: planIdOrData, success_url: successUrl, cancel_url: cancelUrl };
    return this.request<{ checkout_url: string; session_id: string }>(
      '/api/v2/billing/checkout/',
      { method: 'POST', data },
    );
  }

  // Alias used by hooks
  async createPortalSession(): Promise<{ portal_url: string }> {
    return this.createCustomerPortalSession();
  }

  async createCustomerPortalSession(returnUrl?: string): Promise<{
    portal_url: string;
  }> {
    return this.request<{
      portal_url: string;
    }>('/api/v2/billing/portal/', {
      method: 'POST',
      data: {
        return_url: returnUrl,
      },
    });
  }

  // Method to sync tokens with the BaseApiClient (authService)
  syncTokensFromStorage() {
    this.loadTokensFromStorage();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null && !this.isTokenExpired(this.accessToken);
  }

  // Check backend connectivity
  async isBackendHealthy(): Promise<boolean> {
    return this.checkBackendHealth();
  }

  // Get backend status
  getBackendStatus(): { healthy: boolean; lastChecked: number } {
    return {
      healthy: this.backendHealthy,
      lastChecked: this.lastHealthCheck
    };
  }

  // Template Analytics Methods

  async getTemplateUsageStats(templateId: string, _period: string = '30d'): Promise<any> {
    // Use the spec-aligned analytics endpoint
    return this.request<any>(`/api/v2/templates/${templateId}/analytics/`);
  }

  async getTemplateRatings(templateId: string): Promise<any> {
    return this.request<any>(`/api/v2/templates/${templateId}/analytics/`);
  }

  // Template Management Methods

  async exportTemplate(_templateId: string, _format: string = 'json'): Promise<any> {
    // Not available in API spec
    return Promise.reject(new Error('Template export is not supported by the API'));
  }

  async importTemplate(_templateData: any): Promise<TemplateDetail> {
    // Not available in API spec
    return Promise.reject(new Error('Template import is not supported by the API'));
  }

  // Search and Discovery Methods
  async getRelatedTemplates(templateId: string, limit: number = 5): Promise<TemplateList[]> {
    // Use similar prompts endpoint
    const res = await this.request<any>(`/api/v2/prompts/${templateId}/similar/?limit=${limit}`);
    return res?.results ?? (Array.isArray(res) ? res : []);
  }

  async getTemplateRecommendations(_userId?: string): Promise<TemplateList[]> {
    return this.getRecommendations();
  }

  async searchTemplatesAdvanced(searchParams: any): Promise<any> {
    return this.request<any>('/api/v2/search/prompts/', {
      method: 'POST',
      data: searchParams,
    });
  }

  // User Interaction Methods
  async saveTemplateToFavorites(templateId: string): Promise<void> {
    // Map to saved-prompts duplicate as closest equivalent
    await this.request<void>(`/api/v2/templates/${templateId}/start_usage/`, { method: 'POST' });
  }

  async removeTemplateFromFavorites(_templateId: string): Promise<void> {
    // Not available in API spec — no-op
  }

  async shareTemplate(templateId: string, _shareOptions: any): Promise<any> {
    // Duplicate the template as the closest spec action
    return this.request<any>(`/api/v2/templates/${templateId}/duplicate/`, { method: 'POST' });
  }

  // Analytics Tracking Methods (fire-and-forget)
  async trackTemplateView(_templateId: string, _sessionData?: any): Promise<void> {
    // No dedicated view-tracking endpoint in spec — no-op to avoid 404s
  }

  async trackTemplateUsage(templateId: string, usageData: any): Promise<void> {
    try {
      await this.request<void>(`/api/v2/templates/${templateId}/complete_usage/`, {
        method: 'POST',
        data: usageData,
      });
    } catch {
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  async trackEvent(eventData: AnalyticsEvent): Promise<void> {
    try {
      await this.axiosInstance.post('/api/v2/analytics/track/', {
        ...eventData,
        timestamp: eventData.timestamp || new Date().toISOString(),
        user_agent: navigator.userAgent,
        theme: 'egyptian'
      });
    } catch (error) {
      console.warn('Failed to track event:', error);
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  // Enhanced User Profile Methods
  async getUserProfile(): Promise<UserProfile> {
    return this.getProfile();
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    return this.updateProfile(profileData);
  }

  async getUserFavorites(): Promise<TemplateList[]> {
    const res = await this.request<any>('/api/v2/history/saved-prompts/favorites/');
    return res?.results ?? (Array.isArray(res) ? res : []);
  }

  async getUserHistory(): Promise<any[]> {
    const res = await this.request<any>('/api/v2/history/history/');
    return res?.results ?? (Array.isArray(res) ? res : []);
  }

  // Saved Prompts APIs (/api/v2/history/saved-prompts/)

  async getSavedPrompts(params?: { page?: number; search?: string; is_favorite?: boolean }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.append(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return this.request<any>(`/api/v2/history/saved-prompts/${qs ? `?${qs}` : ''}`);
  }

  async getSavedPrompt(id: string): Promise<any> {
    return this.request<any>(`/api/v2/history/saved-prompts/${id}/`);
  }

  async createSavedPrompt(data: {
    title: string;
    content: string;
    description?: string;
    tags?: string[];
    is_public?: boolean;
    template_id?: string;
  }): Promise<any> {
    return this.request<any>('/api/v2/history/saved-prompts/', {
      method: 'POST',
      data,
    });
  }

  async updateSavedPrompt(id: string, data: Record<string, any>): Promise<any> {
    return this.request<any>(`/api/v2/history/saved-prompts/${id}/`, {
      method: 'PATCH',
      data,
    });
  }

  async deleteSavedPrompt(id: string): Promise<void> {
    return this.request<void>(`/api/v2/history/saved-prompts/${id}/`, {
      method: 'DELETE',
    });
  }

  async toggleSavedPromptFavorite(id: string): Promise<any> {
    return this.request<any>(`/api/v2/history/saved-prompts/${id}/toggle-favorite/`, {
      method: 'POST',
    });
  }

  async duplicateSavedPrompt(id: string): Promise<any> {
    return this.request<any>(`/api/v2/history/saved-prompts/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  async useSavedPrompt(id: string): Promise<any> {
    return this.request<any>(`/api/v2/history/saved-prompts/${id}/use/`, {
      method: 'POST',
    });
  }

  // Prompt History APIs (/api/v2/history/history/)

  async getPromptHistory(params?: { page?: number; intent_category?: string; source?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.append(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return this.request<any>(`/api/v2/history/history/${qs ? `?${qs}` : ''}`);
  }

  async createPromptHistory(data: { original_prompt: string; intent_category?: string; source?: string }): Promise<any> {
    return this.request<any>('/api/v2/history/history/', {
      method: 'POST',
      data,
    });
  }

  async deletePromptHistory(id: string): Promise<void> {
    return this.request<void>(`/api/v2/history/history/${id}/`, {
      method: 'DELETE',
    });
  }

  // Prompt Iterations APIs (/api/v2/history/iterations/)

  async getIterations(params?: { page?: number; is_bookmarked?: boolean; parent_prompt?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.append(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return this.request<any>(`/api/v2/history/iterations/${qs ? `?${qs}` : ''}`);
  }

  async createIteration(data: { content: string; parent_prompt: string; interaction_type?: string }): Promise<any> {
    return this.request<any>('/api/v2/history/iterations/', {
      method: 'POST',
      data,
    });
  }

  async toggleIterationBookmark(id: string): Promise<any> {
    return this.request<any>(`/api/v2/history/iterations/${id}/toggle-bookmark/`, {
      method: 'POST',
    });
  }

  // Chat APIs (/api/v2/chat/)

  async getChatSessions(): Promise<any> {
    return this.request<any>('/api/v2/chat/sessions/');
  }

  // DeepSeek APIs

  async deepseekChat(messages: Array<{ role: string; content: string }>, opts?: { temperature?: number; max_tokens?: number }): Promise<any> {
    return this.request<any>('/api/v2/ai/deepseek/chat/', {
      method: 'POST',
      data: { messages, ...opts },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Set up cross-client token synchronization 
if (typeof window !== 'undefined') {
  // Listen for localStorage changes to sync tokens between API clients
  window.addEventListener('storage', (event) => {
    if (event.key === 'access_token' || event.key === 'refresh_token') {
      apiClient.syncTokensFromStorage();
    }
  });

  // Also set up a periodic check to sync tokens (in case localStorage events don't fire in same tab)
  setInterval(() => {
    apiClient.syncTokensFromStorage();
  }, 5000); // Check every 5 seconds
}

// Export the ApiClient class for testing
export { ApiClient, ApiError };