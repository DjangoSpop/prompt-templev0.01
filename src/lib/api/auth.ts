import { BaseApiClient } from './base';
import type { components } from '../../types/api';
import { isDevelopment, features } from '../config/env';

type UserProfile = components['schemas']['UserProfile'];
type UserRegistration = components['schemas']['UserRegistrationRequest'];
type UserUpdate = components['schemas']['UserUpdateRequest'];

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

interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

// Mock user for development
const mockUser: UserProfile = {
  id: '1',
  username: 'dev_user',
  email: 'dev@example.com',
  first_name: 'Dev',
  last_name: 'User',
  avatar: null,
  avatar_url: '/api/default-avatar.png',
  bio: 'Development user',
  date_joined: new Date().toISOString(),
  last_login: new Date().toISOString(),
  credits: 100,
  level: 1,
  experience_points: 250,
  daily_streak: 3,
  user_rank: 'Novice',
  rank_info: 'New to prompt crafting',
  next_level_xp: '500',
  is_premium: false,
  premium_expires_at: null,
  theme_preference: 'light' as any,
  language_preference: 'en',
  ai_assistance_enabled: true,
  analytics_enabled: true,
  templates_created: 5,
  templates_completed: 12,
  total_prompts_generated: 45,
  completion_rate: '87.5',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockTokens: TokenPair = {
  access: 'mock-access-token-' + Date.now(),
  refresh: 'mock-refresh-token-' + Date.now()
};

export class AuthService extends BaseApiClient {
  private async mockAuth(): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      access: mockTokens.access,
      refresh: mockTokens.refresh,
      user: mockUser
    };
  }

  async register(userData: UserRegistration): Promise<{ user: UserProfile; tokens: TokenPair }> {
    if (isDevelopment() && features.mockApi) {
      console.log('Mock registration:', userData);
      const mockResponse = await this.mockAuth();
      const response = {
        user: { ...mockResponse.user, username: userData.username, email: userData.email },
        tokens: { access: mockResponse.access, refresh: mockResponse.refresh }
      };
      this.saveTokensToStorage(response.tokens);
      this.emitEvent('login', response);
      return response;
    }

    try {
      console.log('🔐 Attempting registration for:', userData.username);

      // Cast to any — the OpenAPI spec returns UserRegistration (no tokens) but some
      // DRF setups return { user, tokens } or { access, refresh, user }.  We handle all.
      const raw = await this.request<any>('/api/v2/auth/register/', {
        method: 'POST',
        data: userData,
      });

      // Detect which response shape the backend sent
      const user: UserProfile = raw.user ?? (raw as UserProfile);
      const tokens: TokenPair | null =
        raw.tokens?.access && raw.tokens?.refresh
          ? raw.tokens
          : raw.access && raw.refresh
            ? { access: raw.access, refresh: raw.refresh }
            : null;

      console.log('✅ Registration response received:', {
        hasTokens: !!tokens,
        hasUser: !!(user as any)?.username,
        username: (user as any)?.username ?? (raw as any)?.username,
      });

      if (tokens) {
        this.saveTokensToStorage(tokens);
        this.emitEvent('login', { user, tokens });
        console.log('🎉 Registration successful, tokens saved and login event emitted');
      } else {
        // Backend created the account but did not issue tokens (user must log in)
        console.log('✅ Registration successful — no tokens in response, redirect to login');
      }

      // Return empty-string tokens so callers can detect "no auto-login" without crashing
      return { user, tokens: tokens ?? { access: '', refresh: '' } };
    } catch (error: any) {
      console.error('❌ Registration failed:', error?.response?.status, error?.response?.data);

      if (error?.status === 400) {
        const details = error?.response?.data;
        if (details?.username) {
          throw new Error(`Username error: ${Array.isArray(details.username) ? details.username.join(', ') : details.username}`);
        }
        if (details?.email) {
          throw new Error(`Email error: ${Array.isArray(details.email) ? details.email.join(', ') : details.email}`);
        }
        if (details?.password) {
          throw new Error(`Password error: ${Array.isArray(details.password) ? details.password.join(', ') : details.password}`);
        }
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (isDevelopment() && features.mockApi) {
      console.log('Mock login:', credentials);
      
      // Simple validation for mock
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }
      
      const response = await this.mockAuth();
      const tokens = { access: response.access, refresh: response.refresh };
      this.saveTokensToStorage(tokens);
      this.emitEvent('login', response);
      return response;
    }

    try {
      console.log('🔐 Attempting login for:', credentials.username);
      
      // Use same endpoint format as registration
      const response = await this.request<{ user: UserProfile; tokens: TokenPair }>('/api/v2/auth/login/', {
        method: 'POST',
        data: credentials,
      });
      
      console.log('✅ Login response received:', {
        hasTokens: !!response.tokens,
        hasUser: !!response.user,
        username: response.user?.username
      });
      
      // Create proper response matching LoginResponse interface
      const convertedResponse: LoginResponse = {
        access: response.tokens.access,
        refresh: response.tokens.refresh,
        user: response.user
      };
      
      // CRITICAL: Save tokens immediately using same method as registration
      this.saveTokensToStorage(response.tokens);
      
      // Emit login event immediately (same as registration)
      this.emitEvent('login', convertedResponse);
      
      console.log('🎉 Login successful, tokens saved and event emitted');
      
      return convertedResponse;
    } catch (error: any) {
      console.error('❌ Login failed:', error?.response?.status, error?.response?.data);
      
      // Enhanced error information (matching registration pattern)
      if (error?.status === 400) {
        const details = error?.response?.data;
        if (details?.username) {
          throw new Error(`Username error: ${Array.isArray(details.username) ? details.username.join(', ') : details.username}`);
        }
        if (details?.password) {
          throw new Error(`Password error: ${Array.isArray(details.password) ? details.password.join(', ') : details.password}`);
        }
        if (details?.non_field_errors) {
          throw new Error(Array.isArray(details.non_field_errors) ? details.non_field_errors.join(', ') : details.non_field_errors);
        }
        if (details?.detail) {
          throw new Error(details.detail);
        }
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/api/v2/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearTokens();
      this.emitEvent('logout');
    }
  }

  async refreshTokens(): Promise<TokenPair> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<TokenPair>('/api/v2/auth/refresh/', {
      method: 'POST',
      data: { refresh: refreshToken },
    });

    this.saveTokensToStorage(response);
    this.emitEvent('token_refresh', response);
    return response;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/api/v2/auth/profile/');
    return response;
  }

  // Alias for getCurrentUser for consistency
  async getProfile(): Promise<UserProfile> {
    return this.getCurrentUser();
  }

  async updateProfile(userData: UserUpdate): Promise<UserProfile> {
    const response = await this.request<UserProfile>('/api/v2/auth/profile/', {
      method: 'PATCH',
      data: userData,
    });
    return response;
  }

  async changePassword(passwordData: PasswordChangeData): Promise<void> {
    return this.request<void>('/api/v2/auth/change-password/', {
      method: 'POST',
      data: passwordData,
    });
  }

  async getUserStats(): Promise<any> {
    return this.request<any>('/api/v2/auth/stats/');
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/api/v2/auth/check-username/`, {
      method: 'POST',
      data: { username },
    });
  }

  async checkEmail(email: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/api/v2/auth/check-email/`, {
      method: 'POST',
      data: { email },
    });
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  // Public method to expose refresh token for other services
  getStoredRefreshToken(): string | null {
    return this.getRefreshToken();
  }
}

export const authService = new AuthService();
