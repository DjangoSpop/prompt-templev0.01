/**
 * Production-ready API client with comprehensive error handling
 * Features: request/response interceptors, token refresh, retry logic,
 * request deduplication, and caching
 */

import {
  AppError,
  AuthenticationError,
  APIResponse,
  APIError,
} from '@/types/core';
import { handleError, withRetry, parseAPIError } from '../errors/error-handler';

// ============================================
// Configuration
// ============================================

export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheDuration?: number;
  enableRequestDeduplication?: boolean;
}

const DEFAULT_CONFIG: Required<APIClientConfig> = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/proxy',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  enableRequestDeduplication: true,
};

// ============================================
// Request/Response Types
// ============================================

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  skipAuth?: boolean;
  skipRetry?: boolean;
  skipCache?: boolean;
  cacheKey?: string;
}

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

// ============================================
// Cache Implementation
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================
// Token Management
// ============================================

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshQueue: QueuedRequest[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokens();
    }
  }

  private loadTokens(): void {
    try {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      // Wait for the ongoing refresh
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.baseURL}/api/v2/auth/token/refresh/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: this.refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new AuthenticationError('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.access;

      this.setAccessToken(newAccessToken);

      // Resolve queued requests
      this.refreshQueue.forEach((req) => req.resolve(newAccessToken));
      this.refreshQueue = [];

      return newAccessToken;
    } catch (error) {
      // Reject queued requests
      this.refreshQueue.forEach((req) => req.reject(error));
      this.refreshQueue = [];

      // Clear tokens on refresh failure
      this.clearTokens();

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }
}

// ============================================
// Request Deduplication
// ============================================

class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<unknown>>();

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const existing = this.pendingRequests.get(key);
    
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);

    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

// ============================================
// API Client
// ============================================

export class APIClient {
  private config: Required<APIClientConfig>;
  private cache: APICache;
  private tokenManager: TokenManager;
  private deduplicator: RequestDeduplicator;

  constructor(config?: Partial<APIClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new APICache();
    this.tokenManager = new TokenManager();
    this.deduplicator = new RequestDeduplicator();
  }

  // ============================================
  // Public API Methods
  // ============================================

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // ============================================
  // Core Request Method
  // ============================================

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const fullUrl = this.buildURL(url, config.params);
    const cacheKey = config.cacheKey || this.getCacheKey(fullUrl, config.method || 'GET');

    // Check cache for GET requests
    if (
      config.method === 'GET' &&
      this.config.enableCache &&
      !config.skipCache
    ) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Request deduplication for GET requests
    if (
      config.method === 'GET' &&
      this.config.enableRequestDeduplication &&
      !config.skipCache
    ) {
      return this.deduplicator.deduplicate(cacheKey, () =>
        this.executeRequest<T>(fullUrl, config, cacheKey)
      );
    }

    return this.executeRequest<T>(fullUrl, config, cacheKey);
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    cacheKey: string
  ): Promise<T> {
    const requestFn = async (): Promise<T> => {
      const response = await this.fetchWithTimeout(url, config);
      return this.handleResponse<T>(response, cacheKey, config);
    };

    if (config.skipRetry) {
      return requestFn();
    }

    return withRetry(requestFn, {
      maxAttempts: this.config.retryAttempts,
      initialDelay: this.config.retryDelay,
      onRetry: (attempt, error) => {
        console.log(`Retrying request (${attempt}/${this.config.retryAttempts}):`, error.message);
      },
    });
  }

  // ============================================
  // Request Building
  // ============================================

  private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private getCacheKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  private async buildHeaders(config: RequestConfig): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (!config.skipAuth) {
      const token = this.tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ============================================
  // Fetch with Timeout
  // ============================================

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const timeout = config.timeout || this.config.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = await this.buildHeaders(config);
      
      const response = await fetch(url, {
        ...config,
        headers,
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('Request timeout', 'REQUEST_TIMEOUT', 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================
  // Response Handling
  // ============================================

  private async handleResponse<T>(
    response: Response,
    cacheKey: string,
    config: RequestConfig
  ): Promise<T> {
    // Handle 401 - Token refresh
    if (response.status === 401 && !config.skipAuth) {
      try {
        await this.tokenManager.refreshAccessToken();
        // Retry the request with new token
        return this.request<T>(response.url, config);
      } catch (error) {
        // Redirect to login on refresh failure
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw new AuthenticationError('Session expired. Please sign in again.');
      }
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    let data: unknown;
    
    if (isJSON) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      throw this.createErrorFromResponse(response, data);
    }

    // Extract data from APIResponse wrapper if present
    const result = this.unwrapAPIResponse<T>(data);

    // Cache successful GET requests
    if (
      config.method === 'GET' &&
      this.config.enableCache &&
      !config.skipCache
    ) {
      this.cache.set(cacheKey, result, this.config.cacheDuration);
    }

    return result;
  }

  private unwrapAPIResponse<T>(data: unknown): T {
    if (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data
    ) {
      const apiResponse = data as APIResponse<T>;
      return apiResponse.data;
    }

    return data as T;
  }

  private createErrorFromResponse(response: Response, data: unknown): AppError {
    if (typeof data === 'object' && data !== null && 'errors' in data) {
      const apiResponse = data as { errors: APIError[] };
      const firstError = apiResponse.errors[0];
      
      return new AppError(
        firstError.message,
        firstError.code,
        response.status,
        true,
        firstError.details
      );
    }

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const errorResponse = data as { message: string };
      return new AppError(
        errorResponse.message,
        'API_ERROR',
        response.status
      );
    }

    return new AppError(
      `Request failed with status ${response.status}`,
      'API_ERROR',
      response.status
    );
  }

  // ============================================
  // Cache Management
  // ============================================

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    this.cache.invalidatePattern(regex);
  }

  // ============================================
  // Token Management
  // ============================================

  setTokens(accessToken: string, refreshToken: string): void {
    this.tokenManager.setAccessToken(accessToken);
    this.tokenManager.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  // ============================================
  // Configuration
  // ============================================

  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================
// Default Instance
// ============================================

export const apiClient = new APIClient();

// ============================================
// Convenience Functions
// ============================================

export const api = {
  get: <T>(url: string, config?: RequestConfig) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: RequestConfig) => apiClient.delete<T>(url, config),
};
