import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { components } from '../../types/api';
import { env, apiConfig } from '../config/env';
import { logger, monitor } from './logger';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

type AuthEventType = 'login' | 'logout' | 'token_refresh' | 'unauthorized';
type AuthEventListener = (data?: any) => void;

interface TokenPair {
  access: string;
  refresh: string;
}

export class BaseApiClient {
  protected axiosInstance!: AxiosInstance;
  private baseURL: string;
  
  // STATIC token management - shared across all instances
  private static sharedAccessToken: string | null = null;
  private static sharedRefreshToken: string | null = null;
  private static eventListeners: Map<AuthEventType, Set<AuthEventListener>> = new Map();
  
  // Instance-specific properties
  private isRefreshing = false;
  private failedRequestsQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseURL: string = apiConfig.baseUrl) {
    this.baseURL = baseURL;
    BaseApiClient.loadTokensFromStorage();
    this.setupAxiosInstance(); // Called after loading tokens so auth header can be set
    this.setupInterceptors();
    
    // Expose debug function globally for testing
    if (typeof window !== 'undefined') {
      (window as any).debugAuth = () => BaseApiClient.debugGlobalAuthStatus();
    }
  }

  addEventListener(event: AuthEventType, listener: AuthEventListener) {
    if (!BaseApiClient.eventListeners.has(event)) {
      BaseApiClient.eventListeners.set(event, new Set());
    }
    BaseApiClient.eventListeners.get(event)!.add(listener);
  }

  removeEventListener(event: AuthEventType, listener: AuthEventListener) {
    BaseApiClient.eventListeners.get(event)?.delete(listener);
  }

  emitEvent(event: AuthEventType, data?: any) {
    BaseApiClient.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in auth event listener for ${event}:`, error);
      }
    });
  }

  private setupAxiosInstance() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': env.NEXT_PUBLIC_APP_VERSION,
      'X-Client-Name': env.NEXT_PUBLIC_APP_NAME,
    };
    
    // If we have a token during initialization, add it to default headers
    const token = BaseApiClient.sharedAccessToken;
    if (token && token !== 'undefined' && !this.isTokenExpired(token)) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Setting initial auth header on axios instance:', token.substring(0, 20) + '...');
    } else {
      console.log('ℹ️ No valid token available during axios setup');
    }
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: apiConfig.timeout,
      headers,
      // CRITICAL: Enable credentials for cross-origin requests
      withCredentials: false, // We use Bearer tokens, not cookies
      // Ensure headers are sent with preflight requests
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
    
    console.log('🌐 Axios instance configured for baseURL:', this.baseURL);
  }

  private static loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Validate tokens before assigning (reject 'undefined' or 'null' strings)
      BaseApiClient.sharedAccessToken = (accessToken && accessToken !== 'undefined' && accessToken !== 'null') ? accessToken : null;
      BaseApiClient.sharedRefreshToken = (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') ? refreshToken : null;
      
      console.log('📥 Loaded tokens from storage:', {
        hasAccess: !!BaseApiClient.sharedAccessToken,
        hasRefresh: !!BaseApiClient.sharedRefreshToken,
        accessPreview: BaseApiClient.sharedAccessToken?.substring(0, 20) + '...',
        rawAccessToken: accessToken?.substring(0, 20) + '...'
      });
    }
  }

  static saveTokensToStorage(tokenPair: TokenPair) {
    if (!tokenPair.access || !tokenPair.refresh) {
      console.error('❌ Invalid token pair received:', tokenPair);
      return;
    }
    
    BaseApiClient.sharedAccessToken = tokenPair.access;
    BaseApiClient.sharedRefreshToken = tokenPair.refresh;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokenPair.access);
      localStorage.setItem('refresh_token', tokenPair.refresh);
    }
    
    console.log('✅ Shared tokens saved to storage:', {
      hasAccess: !!BaseApiClient.sharedAccessToken,
      hasRefresh: !!BaseApiClient.sharedRefreshToken,
      accessLength: BaseApiClient.sharedAccessToken?.length,
      accessPreview: BaseApiClient.sharedAccessToken?.substring(0, 30) + '...'
    });
    
    // Emit event after tokens are saved
    BaseApiClient.emitStaticEvent('token_refresh', tokenPair);
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    BaseApiClient.sharedAccessToken = null;
    BaseApiClient.sharedRefreshToken = null;
    
    BaseApiClient.emitStaticEvent('logout');
    
    console.log('🧹 Shared tokens cleared');
  }

  static emitStaticEvent(event: AuthEventType, data?: any) {
    BaseApiClient.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in static auth event listener for ${event}:`, error);
      }
    });
  }

  saveTokensToStorage(tokenPair: TokenPair) {
    // Use static method to save tokens
    BaseApiClient.saveTokensToStorage(tokenPair);
    
    // Update this instance's axios headers
    this.updateAxiosHeaders();
    
    // Emit instance event
    this.emitEvent('token_refresh', tokenPair);
  }
  
  private updateAxiosHeaders() {
    const token = BaseApiClient.sharedAccessToken;
    if (token && token !== 'undefined' && !this.isTokenExpired(token)) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔄 Updated axios headers for instance with token:', token.substring(0, 20) + '...');
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
      console.log('🧹 Cleared axios headers for instance');
    }
  }

  clearTokens() {
    // Use static method to clear tokens
    BaseApiClient.clearTokens();
    
    // Update this instance's axios headers
    this.updateAxiosHeaders();
    
    // Emit instance event
    this.emitEvent('logout');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < (currentTime + 30);
    } catch (error) {
      return true;
    }
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // CRITICAL: Always check and set Authorization header for each request
        // Try shared token first, then localStorage as fallback
        let currentToken = BaseApiClient.sharedAccessToken;
        
        // If sharedToken is empty, try to sync from localStorage
        if (!currentToken && typeof window !== 'undefined') {
          const storageToken = localStorage.getItem('access_token');
          if (storageToken && storageToken !== 'undefined' && storageToken !== 'null') {
            console.log('🔄 Syncing token from localStorage to shared state');
            BaseApiClient.sharedAccessToken = storageToken;
            currentToken = storageToken;
          }
        }
        
        // Validate and use token
        if (currentToken && currentToken !== 'undefined' && currentToken !== 'null' && !this.isTokenExpired(currentToken)) {
          // Force set the Authorization header for this request
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${currentToken}`;
          console.log('🔑 Setting auth header for request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            hasAuth: !!config.headers['Authorization'],
            tokenPreview: currentToken.substring(0, 20) + '...'
          });
        } else if (currentToken === 'undefined' || currentToken === 'null') {
          console.error('❌ Detected invalid token string, clearing it:', currentToken);
          delete config.headers?.['Authorization'];
          BaseApiClient.clearTokens();
        } else if (!currentToken) {
          console.log('ℹ️ No access token for request:', {
            url: config.url,
            method: config.method?.toUpperCase()
          });
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );


    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry && BaseApiClient.sharedRefreshToken) {
          if (this.isRefreshing) {
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
              this.failedRequestsQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedRequestsQueue = [];
              
              originalRequest.headers!.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.failedRequestsQueue.forEach(({ reject }) => reject(refreshError));
            this.failedRequestsQueue = [];

            this.emitEvent('unauthorized');
            this.clearTokens();
            
            // Don't throw here, let the original 401 propagate
            console.error('Token refresh failed, user needs to re-authenticate');
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!BaseApiClient.sharedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/v2/auth/refresh/`, {
        refresh: BaseApiClient.sharedRefreshToken,
      });

      const { access } = response.data;
      
      if (!access || access === 'undefined') {
        throw new Error('Invalid access token received from refresh');
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
      }
      BaseApiClient.sharedAccessToken = access;
      
      // CRITICAL: Update default headers with new token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      this.emitEvent('token_refresh', { access });
      console.log('🔄 Token refreshed and axios headers updated:', access.substring(0, 20) + '...');
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  protected async request<T>(
    endpoint: string, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const monitor_op = monitor(`api_${config.method || 'GET'}_${endpoint}`);
    const requestId = crypto.randomUUID();

    try {
      logger.debug('API request initiated', {
        requestId,
        method: config.method || 'GET',
        endpoint,
        baseURL: this.baseURL,
      });

      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        ...config,
        headers: {
          ...config.headers,
          'X-Request-ID': requestId,
        },
      });

      monitor_op.end(true, {
        requestId,
        statusCode: response.status,
        endpoint,
      });

      logger.info('API request completed successfully', {
        requestId,
        method: config.method || 'GET',
        endpoint,
        statusCode: response.status,
      });

      return response.data;
    } catch (error) {
      monitor_op.end(false, {
        requestId,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data || {};
        const apiError = new ApiError(
          errorData.message || error.message || `HTTP ${error.response?.status}: ${error.response?.statusText}`,
          error.response?.status || 0,
          errorData,
          errorData.code
        );

        logger.error('API request failed', {
          requestId,
          method: config.method || 'GET',
          endpoint,
          statusCode: error.response?.status,
          error: apiError.message,
          code: apiError.code,
        });

        throw apiError;
      }

      logger.error('Non-HTTP API error', {
        requestId,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  getAccessToken(): string | null {
    return BaseApiClient.sharedAccessToken;
  }

  syncTokensFromStorage() {
    console.log('🔄 Syncing tokens from storage...');
    const beforeSync = {
      sharedAccess: BaseApiClient.sharedAccessToken?.substring(0, 20),
      sharedRefresh: BaseApiClient.sharedRefreshToken?.substring(0, 20)
    };
    
    BaseApiClient.loadTokensFromStorage();
    
    const afterSync = {
      sharedAccess: BaseApiClient.sharedAccessToken?.substring(0, 20),
      sharedRefresh: BaseApiClient.sharedRefreshToken?.substring(0, 20)
    };
    
    console.log('📊 Token sync result:', { beforeSync, afterSync });
    this.updateAxiosHeaders();
  }

  getRefreshToken(): string | null {
    return BaseApiClient.sharedRefreshToken;
  }

  isAuthenticated(): boolean {
    const token = BaseApiClient.sharedAccessToken;
    return token !== null && !this.isTokenExpired(token);
  }

  // Debug method to check auth status
  debugAuthStatus() {
    console.log('🔍 Auth Status Debug:', {
      hasAccessToken: !!BaseApiClient.sharedAccessToken,
      hasRefreshToken: !!BaseApiClient.sharedRefreshToken,
      isTokenExpired: BaseApiClient.sharedAccessToken ? this.isTokenExpired(BaseApiClient.sharedAccessToken) : 'N/A',
      isAuthenticated: this.isAuthenticated(),
      accessTokenLength: BaseApiClient.sharedAccessToken?.length,
      accessTokenPreview: BaseApiClient.sharedAccessToken?.substring(0, 20) + '...',
      storageToken: typeof window !== 'undefined' ? localStorage.getItem('access_token')?.substring(0, 20) + '...' : 'N/A',
      axiosDefaultHeaders: !!this.axiosInstance.defaults.headers.common['Authorization']
    });
  }

  // Global debug method to check all instances
  static debugGlobalAuthStatus() {
    console.log('🌍 Global Auth Status:', {
      sharedAccessToken: !!BaseApiClient.sharedAccessToken,
      sharedRefreshToken: !!BaseApiClient.sharedRefreshToken,
      accessTokenPreview: BaseApiClient.sharedAccessToken?.substring(0, 20) + '...',
      storageAccessToken: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
      storageRefreshToken: typeof window !== 'undefined' ? !!localStorage.getItem('refresh_token') : false
    });
  }
}