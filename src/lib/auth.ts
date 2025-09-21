import { authService } from './api/auth';
import type { components } from '../types/api';

// Use the generated API types directly
type UserProfile = components['schemas']['UserProfile'];
type UserRegistration = components['schemas']['UserRegistrationRequest'];

type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: UserProfile;
};

type TokenPair = {
  access: string;
  refresh: string;
};

type AuthEventListener = (data?: unknown) => void;

/**
 * Comprehensive auth adapter that integrates with the generated API client
 * Provides unified authentication interface for the application
 */
class AuthAdapter {
  private eventListeners: Map<string, Set<AuthEventListener>> = new Map();

  constructor() {
    // Listen to auth service events and re-emit them
    authService.addEventListener('login', (data) => {
      this.emitEvent('login', data);
      this.emitEvent('authStateChange', { type: 'login', data });
    });

    authService.addEventListener('logout', () => {
      this.emitEvent('logout');
      this.emitEvent('authStateChange', { type: 'logout' });
    });

    authService.addEventListener('token_refresh', (data) => {
      this.emitEvent('token_refresh', data);
      this.emitEvent('authStateChange', { type: 'token_refresh', data });
    });

    authService.addEventListener('unauthorized', () => {
      this.emitEvent('unauthorized');
      this.emitEvent('authStateChange', { type: 'unauthorized' });
    });
  }

  // Event management
  addEventListener(event: string, callback: AuthEventListener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: AuthEventListener) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emitEvent(event: string, data?: unknown) {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in auth event listener for ${event}:`, error);
      }
    });
  }

  // Authentication methods using the generated client
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🚀 Auth Adapter: Starting login process...');
      
      const response = await authService.login(credentials);
      
      // Ensure tokens are properly stored and synchronized
      const tokens = { access: response.access, refresh: response.refresh };
      authService.saveTokensToStorage(tokens);
      
      // Debug the auth status after login
      authService.debugAuthStatus();
      
      // Ensure compatibility with UserProfile
      const userProfile: UserProfile = {
        ...response.user,
        avatar_url: response.user.avatar_url || '/api/default-avatar.png'
      } as UserProfile;
      
      const loginResponse: LoginResponse = {
        access: response.access,
        refresh: response.refresh,
        user: userProfile
      };
      
      // Emit login event with user data
      this.emitEvent('login', loginResponse);
      
      console.log('🎉 Auth Adapter: Login completed successfully');
      
      return loginResponse;
    } catch (error) {
      console.error('❌ Auth Adapter: Login failed:', error);
      throw error;
    }
  }

  async register(userData: UserRegistration): Promise<{ user: UserProfile; tokens: TokenPair }> {
    try {
      const response = await authService.register(userData);
      
      // Ensure tokens are properly stored
      authService.saveTokensToStorage(response.tokens);
      
      // Convert user type if needed and ensure compatibility
      const userProfile: UserProfile = {
        ...response.user,
        avatar_url: response.user.avatar_url || '/api/default-avatar.png'
      } as UserProfile;
      
      const result = {
        user: userProfile,
        tokens: response.tokens
      };
      
      // Emit registration/login event
      this.emitEvent('login', {
        access: response.tokens.access,
        refresh: response.tokens.refresh,
        user: userProfile
      });
      
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout request failed, clearing local state:', error);
    } finally {
      // Always clear local state
      authService.clearTokens();
      this.emitEvent('logout');
    }
  }

  async refreshTokens(): Promise<TokenPair> {
    try {
      const tokens = await authService.refreshTokens();
      this.emitEvent('token_refresh', tokens);
      return tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and emit unauthorized event
      authService.clearTokens();
      this.emitEvent('unauthorized');
      throw error;
    }
  }

  async getProfile(): Promise<UserProfile> {
    const profile = await authService.getProfile();
    // Ensure compatibility with generated type
    return {
      ...profile,
      avatar_url: profile.avatar_url || '/api/default-avatar.png'
    } as UserProfile;
  }

  async updateProfile(userData: Partial<components['schemas']['UserUpdateRequest']>): Promise<UserProfile> {
    const profile = await authService.updateProfile(userData);
    // Ensure compatibility with generated type
    return {
      ...profile,
      avatar_url: profile.avatar_url || '/api/default-avatar.png'
    } as UserProfile;
  }

  async changePassword(data: { old_password: string; new_password: string }): Promise<void> {
    return authService.changePassword(data);
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return authService.checkUsername(username);
  }

  async checkEmail(email: string): Promise<{ available: boolean }> {
    return authService.checkEmail(email);
  }

  async getUserStats(): Promise<any> {
    return authService.getUserStats();
  }

  // Authentication state
  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  getAccessToken(): string | null {
    return authService.getAccessToken();
  }

  // Token utilities for compatibility
  get tokenUtils() {
    return {
      getAccessToken: () => this.getAccessToken(),
      isAuthenticated: () => this.isAuthenticated(),
      refreshTokens: () => this.refreshTokens(),
      clearTokens: () => authService.clearTokens(),
    };
  }
}

// Create singleton instance
const authAdapter = new AuthAdapter();

// Export the adapter instance and key methods
export default authAdapter;
export const {
  login,
  register,
  logout,
  refreshTokens,
  getProfile,
  updateProfile,
  changePassword,
  checkUsername,
  checkEmail,
  getUserStats,
  isAuthenticated,
  getAccessToken,
  tokenUtils,
  addEventListener,
  removeEventListener
} = authAdapter;

// Re-export from providers for backward compatibility
export { 
  useAuth,
  AuthProvider 
} from '@/providers/AuthProvider';

// Export types
export type {
  UserProfile,
  UserRegistration,
  LoginCredentials,
  TokenPair,
  LoginResponse
};