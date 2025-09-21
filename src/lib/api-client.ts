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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
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
    return this.request<{ available: boolean }>(`/api/v2/auth/auth/check-email/?email=${encodeURIComponent(email)}`);
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
    return this.request<any[]>('/api/v2/gamification/badges/');
  }

  async getLeaderboard(): Promise<any> {
    return this.request<any>('/api/v2/gamification/leaderboard/');
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
      data: { user_input: userInput, context },
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
    return this.request<any[]>(endpoint);
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

  // Billing APIs (if needed)
  async getBillingPlans(): Promise<any[]> {
    return this.request<any[]>('/api/v2/billing/plans/');
  }

  async getSubscription(): Promise<any> {
    return this.request<any>('/api/v2/billing/me/subscription/');
  }

  async getEntitlements(): Promise<any> {
    return this.request<any>('/api/v2/billing/me/entitlements/');
  }

  async getUsage(): Promise<any> {
    return this.request<any>('/api/v2/billing/me/usage/');
  }

  async createCheckoutSession(planId: string, successUrl?: string, cancelUrl?: string): Promise<{
    checkout_url: string;
    session_id: string;
  }> {
    return this.request<{
      checkout_url: string;
      session_id: string;
    }>('/api/v2/billing/checkout/', {
      method: 'POST',
      data: {
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });
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

  // Enhanced Template Analytics Methods

  async getTemplateUsageStats(templateId: string, period: string = '30d'): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `/api/templates/${templateId}/usage-stats/`,
        { params: { period } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template usage stats:', error);
      throw error;
    }
  }

  async getTemplateRatings(templateId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/api/templates/${templateId}/ratings/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template ratings:', error);
      throw error;
    }
  }

  // Enhanced Template Management Methods

  async exportTemplate(templateId: string, format: string = 'json'): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `/api/templates/${templateId}/export/`,
        { params: { format } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export template:', error);
      throw error;
    }
  }

  async importTemplate(templateData: any): Promise<TemplateDetail> {
    try {
      const response = await this.axiosInstance.post('/api/templates/import/', templateData);
      return response.data;
    } catch (error) {
      console.error('Failed to import template:', error);
      throw error;
    }
  }

  // Enhanced Search and Discovery Methods
  async getRelatedTemplates(templateId: string, limit: number = 5): Promise<TemplateList[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/templates/${templateId}/related/`,
        { params: { limit } }
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch related templates:', error);
      throw error;
    }
  }

  async getTemplateRecommendations(userId?: string): Promise<TemplateList[]> {
    try {
      const response = await this.axiosInstance.get(
        '/api/templates/recommendations/',
        userId ? { params: { user_id: userId } } : {}
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch template recommendations:', error);
      throw error;
    }
  }

  async searchTemplatesAdvanced(searchParams: any): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/templates/search/', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search templates:', error);
      throw error;
    }
  }

  // Enhanced User Interaction Methods
  async saveTemplateToFavorites(templateId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/templates/${templateId}/favorite/`);
    } catch (error) {
      console.error('Failed to save template to favorites:', error);
      throw error;
    }
  }

  async removeTemplateFromFavorites(templateId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/templates/${templateId}/favorite/`);
    } catch (error) {
      console.error('Failed to remove template from favorites:', error);
      throw error;
    }
  }

  async shareTemplate(templateId: string, shareOptions: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/api/templates/${templateId}/share/`,
        shareOptions
      );
      return response.data;
    } catch (error) {
      console.error('Failed to share template:', error);
      throw error;
    }
  }

  // Enhanced Analytics and Tracking Methods
  async trackTemplateView(templateId: string, sessionData?: any): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/templates/${templateId}/view/`, {
        timestamp: new Date().toISOString(),
        session_data: sessionData,
        theme: 'egyptian'
      });
    } catch (error) {
      console.warn('Failed to track template view:', error);
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  async trackTemplateUsage(templateId: string, usageData: any): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/templates/${templateId}/usage/`, {
        ...usageData,
        timestamp: new Date().toISOString(),
        theme: 'egyptian'
      });
    } catch (error) {
      console.warn('Failed to track template usage:', error);
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
    try {
      const response = await this.axiosInstance.get('/api/users/profile/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.axiosInstance.patch('/api/users/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async getUserFavorites(): Promise<TemplateList[]> {
    try {
      const response = await this.axiosInstance.get('/api/users/favorites/');
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch user favorites:', error);
      throw error;
    }
  }

  async getUserHistory(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/api/users/history/');
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch user history:', error);
      throw error;
    }
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