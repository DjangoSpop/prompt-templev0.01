'use client';

import { fetchJSON } from '../../../lib/api/client';

// Types
export interface SocialProvider {
  name: string;
  display_name: string;
  enabled: boolean;
  initiate_url: string;
  callback_url: string;
  scopes: string[];
}

export interface SocialAuthCallbackResponse {
  // Tokens can be at top level OR in a nested 'tokens' object
  access?: string;
  refresh?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  user: {
    id: string | number; // UUID or number depending on backend
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    avatar_url?: string | null;
    social_avatar_url?: string;
    provider_id?: string;
    provider_name?: string;
    is_premium?: boolean;
    credits?: number;
    level?: number;
    experience_points?: number;
    daily_streak?: number;
    user_rank?: string;
    theme_preference?: string;
    language_preference?: string;
  };
  is_new_user: boolean;
  linked_accounts: Array<{
    provider: string;
    provider_id: string;
    email: string;
    linked_at: string;
  }>;
}

export interface SocialLinkResponse {
  success: boolean;
  message: string;
  linked_account: {
    provider: string;
    provider_id: string;
    email: string;
    linked_at: string;
  };
}

export interface SocialUnlinkResponse {
  success: boolean;
  message: string;
  removed_provider: string;
}

export interface SocialAuthError extends Error {
  code?: string;
  provider?: string;
}

// Social Auth Manager Class
export class SocialAuthManager {
  private baseUrl: string;
  private backendUrl: string;
  private appUrl?: string;
  private debug: boolean;

  constructor() {
    // baseUrl: where the app proxies API requests (client-side). If not provided,
    // default to the current origin + `/api/proxy` when running in the browser.
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api/proxy` : '/api/proxy');

    // backendUrl: MUST be direct backend URL for OAuth flows (not proxy).
    // For local dev: http://127.0.0.1:8000
    // For production: https://api.prompt-temple.com
    // CRITICAL: Never point this to /api/proxy - OAuth requires direct backend communication
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? 'https://api.prompt-temple.com' : 'https://api.prompt-temple.com)');

    // appUrl: optional explicit front-end URL to build redirect URIs (useful on Vercel).
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);

    // debug flag can be enabled via `NEXT_PUBLIC_ENABLE_DEBUG=true` for troubleshooting.
    this.debug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';

    if (this.debug) {
      console.log('🔧 SocialAuthManager initialized:', {
        baseUrl: this.baseUrl,
        backendUrl: this.backendUrl,
        appUrl: this.appUrl,
        envBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        envBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
      });
    }
  }

  // Get available social providers
  async getAvailableProviders(): Promise<SocialProvider[]> {
    try {
      const data = await this.fetchDirect<{ providers: SocialProvider[] }>('/api/v2/auth/social/providers/');
      return data.providers || [];
    } catch (error) {
      console.error('Error fetching social providers:', error);

      // Return default providers if API fails
      return [
        {
          name: 'google',
          display_name: 'Google',
          enabled: true,
          initiate_url: '/api/v2/auth/social/google/initiate/',
          callback_url: '/api/v2/auth/social/callback/',
          scopes: ['profile', 'email']
        },
        {
          name: 'github',
          display_name: 'GitHub',
          enabled: true,
          initiate_url: '/api/v2/auth/social/github/initiate/',
          callback_url: '/api/v2/auth/social/callback/',
          scopes: ['user:email', 'read:user']
        }
      ];
    }
  }

  // Custom fetch for direct backend calls (bypasses Next.js proxy)
  private async fetchDirect<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.backendUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // Redirect to social provider using backend initiate endpoint
  async redirectToProvider(provider: 'google' | 'github'): Promise<void> {
    try {
      // Build redirect_uri - MUST be same for both initiate and callback
      const redirectUri = this.appUrl 
        ? `${this.appUrl}/auth/callback/${provider}` 
        : (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback/${provider}` : undefined);

      if (this.debug) {
        console.log('🔐 Initiating OAuth with redirect_uri:', {
          provider,
          redirectUri,
          appUrl: this.appUrl,
          windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A'
        });
      }

      // Call backend DIRECTLY (not through proxy) to get OAuth URL with proper state
      // CRITICAL: Send redirect_uri as query param so backend uses the SAME one when generating auth_url
      const initiateUrl = redirectUri 
        ? `/api/v2/auth/social/${provider}/initiate/?redirect_uri=${encodeURIComponent(redirectUri)}`
        : `/api/v2/auth/social/${provider}/initiate/`;
      
      const response = await this.fetchDirect<{
        auth_url: string;
        state: string;
        provider: string;
        message: string;
      }>(initiateUrl);

      // Store state and provider for validation on callback. Use localStorage
      // so the values survive a full redirect flow.
      if (typeof window !== 'undefined') {
        const stateKey = 'oauth_state';
        const providerKey = 'oauth_provider';
        const timestampKey = 'oauth_timestamp';
        const redirectUriKey = 'oauth_redirect_uri';

        localStorage.setItem(stateKey, response.state);
        localStorage.setItem(providerKey, response.provider);
        localStorage.setItem(timestampKey, Date.now().toString());
        // Store redirect_uri to use the EXACT same value in callback
        if (redirectUri) {
          localStorage.setItem(redirectUriKey, redirectUri);
        }

        if (this.debug) {
          console.log('💾 Stored OAuth state:', {
            state: response.state.substring(0, 30) + '...',
            provider: response.provider,
            redirectUri,
            timestamp: new Date().toISOString(),
            localStorage_check: localStorage.getItem(stateKey)?.substring(0, 30) + '...'
          });
        }
      }

      // Verify state is stored before redirecting
      if (typeof window !== 'undefined') {
        const verifyState = localStorage.getItem('oauth_state');
        if (!verifyState) {
          console.error('❌ State not found in localStorage before redirect!');
          throw new Error('Failed to store OAuth state');
        }

        if (this.debug) {
          console.log('🚀 Redirecting to OAuth provider:', {
            provider: response.provider,
            stateStored: verifyState.substring(0, 30) + '...',
            redirectUrl: response.auth_url.substring(0, 100) + '...'
          });
        }

        // Small delay to ensure localStorage is written
        setTimeout(() => {
          window.location.href = response.auth_url;
        }, 100);
      }
    } catch (error) {
      console.error('Failed to initiate OAuth flow:', error);
      throw new Error(`Failed to start ${provider} authentication`);
    }
  }

  // Handle OAuth callback
  async handleCallback(
    code: string,
    state: string,
    provider?: string
  ): Promise<SocialAuthCallbackResponse> {
    let finalProvider: string | null = null;
    let redirectUri: string | undefined = undefined;
    let storedProvider: string | null = null;
    let storedState: string | null = null;
    
    try {
      // Validate state parameter
      if (typeof window !== 'undefined') {
        storedState = localStorage.getItem('oauth_state');
        storedProvider = localStorage.getItem('oauth_provider');
        const storedTimestamp = localStorage.getItem('oauth_timestamp');

        const timeSinceStorage = storedTimestamp ? Date.now() - parseInt(storedTimestamp) : null;
        const allLocalStorageKeys = Object.keys(localStorage);

        if (this.debug) {
          console.log('🔐 OAuth State Validation:', {
            storedState: storedState?.substring(0, 30) + '...',
            receivedState: state?.substring(0, 30) + '...',
            match: storedState === state,
            storedProvider,
            receivedProvider: provider,
            timeSinceStorage: timeSinceStorage ? `${Math.round(timeSinceStorage / 1000)}s` : 'unknown',
            localStorageKeys: allLocalStorageKeys.filter(k => k.includes('oauth'))
          });
        }

        if (!storedState) {
          console.error('❌ No stored state found!', {
            allKeys: allLocalStorageKeys,
            provider: storedProvider || provider,
            receivedState: state?.substring(0, 50)
          });
          throw new Error('No stored state found - session may have expired. Please try signing in again.');
        }

        if (storedState !== state) {
          console.error('❌ State mismatch!', {
            stored: storedState?.substring(0, 50),
            received: state?.substring(0, 50),
            storedLength: storedState?.length,
            receivedLength: state?.length
          });
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        if (provider && provider !== storedProvider) {
          throw new Error(`Provider mismatch: expected ${storedProvider}, got ${provider}`);
        }

        // Clean up stored state but keep storedProvider/storedState variables for later
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
        localStorage.removeItem('oauth_timestamp');

        if (this.debug) {
          console.log('✅ OAuth state validated and cleaned up');
        }
      }
      // Determine provider from provided parameter or from the stored session
      finalProvider = provider || storedProvider || null;

      if (!finalProvider) {
        throw new Error('Provider information missing');
      }

      // CRITICAL: Use the EXACT same redirect_uri that was used during initiate
      // If we stored it in localStorage, use that; otherwise build it the same way
      if (typeof window !== 'undefined') {
        const storedRedirectUri = localStorage.getItem('oauth_redirect_uri');
        if (storedRedirectUri) {
          redirectUri = storedRedirectUri;
          localStorage.removeItem('oauth_redirect_uri'); // Clean up
        } else {
          // Fallback: build it the same way as in redirectToProvider
          redirectUri = this.appUrl 
            ? `${this.appUrl}/auth/callback/${finalProvider}` 
            : `${window.location.origin}/auth/callback/${finalProvider}`;
        }
      } else {
        // Server-side fallback
        redirectUri = this.appUrl ? `${this.appUrl}/auth/callback/${finalProvider}` : undefined;
      }

      if (this.debug) {
        console.log('🔄 Sending callback to backend (DIRECT):', {
          provider: finalProvider,
          statePreview: state?.substring(0, 30) + '...',
          redirectUri,
          codePreview: code?.substring(0, 20) + '...',
          backendUrl: this.backendUrl,
          usedStoredRedirectUri: !!(typeof window !== 'undefined' && localStorage.getItem('oauth_redirect_uri'))
        });
      }

      // Send callback DIRECTLY to backend (not through proxy) with required fields including redirect_uri
      const data: SocialAuthCallbackResponse = await this.fetchDirect<SocialAuthCallbackResponse>('/api/v2/auth/social/callback/', {
        method: 'POST',
        body: JSON.stringify({
          code,
          state,
          provider: finalProvider,
          redirect_uri: redirectUri
        }),
      });

      // ALWAYS log raw response structure to debug token issues
      console.log('📦 Raw OAuth response:', {
        dataKeys: Object.keys(data),
        hasTopLevelAccess: !!data.access,
        hasTopLevelRefresh: !!data.refresh,
        hasNestedTokens: !!data.tokens,
        hasUser: !!data.user,
        rawData: JSON.stringify(data).substring(0, 500) + '...'
      });

      // Extract tokens - handle both flat and nested token structures
      const accessToken = data.access || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;

      if (this.debug) {
        console.log('📦 OAuth response structure:', {
          hasTopLevelAccess: !!data.access,
          hasTopLevelRefresh: !!data.refresh,
          hasNestedTokens: !!data.tokens,
          hasNestedAccess: !!data.tokens?.access,
          hasNestedRefresh: !!data.tokens?.refresh,
          finalAccessToken: accessToken?.substring(0, 20) + '...',
          finalRefreshToken: refreshToken?.substring(0, 20) + '...'
        });
      }

      if (!accessToken || !refreshToken) {
        console.error('❌ No tokens found in OAuth response:', {
          dataKeys: Object.keys(data),
          hasAccess: !!data.access,
          hasRefresh: !!data.refresh,
          hasTokens: !!data.tokens
        });
        throw new Error('No authentication tokens received from server');
      }

      // Store tokens in localStorage (same as existing auth)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Store user data for the application
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Log registration/login details for debugging
        if (this.debug) {
          console.log('✅ OAuth callback successful:', {
            isNewUser: data.is_new_user,
            userId: data.user.id,
            username: data.user.username,
            email: data.user.email,
            provider: data.user.provider_name,
            linkedAccounts: data.linked_accounts?.length || 0,
            tokensSaved: true
          });
        }
      }

      // Return normalized response with tokens at top level for consistency
      return {
        ...data,
        access: accessToken,
        refresh: refreshToken
      };
    } catch (error) {
      console.error('❌ Social auth callback FAILED:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        provider: finalProvider,
        redirectUri,
        backendUrl: this.backendUrl
      });
      
      // Try to parse the error message for more details
      if (error instanceof Error && error.message) {
        try {
          const errorData = JSON.parse(error.message);
          console.error('📋 Backend error details:', errorData);
        } catch {
          // Not JSON, just a regular error message
          console.error('📋 Error message:', error.message);
        }
      }
      
      throw error instanceof Error ? error : new Error('Authentication callback failed');
    }
  }

  // Generate secure state parameter
  private generateState(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side or older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// API functions for social auth
export async function getSocialProviders(): Promise<SocialProvider[]> {
  const manager = new SocialAuthManager();
  return manager.getAvailableProviders();
}

export async function completeSocialAuth(
  code: string,
  state: string,
  provider?: string
): Promise<SocialAuthCallbackResponse> {
  const manager = new SocialAuthManager();
  return manager.handleCallback(code, state, provider);
}

export async function linkSocialAccount(
  params: { provider: 'google' | 'github'; code: string; state: string },
  token: string
): Promise<SocialLinkResponse> {
  return fetchJSON<SocialLinkResponse>('/api/v2/auth/social/link/', {
    method: 'POST',
    body: JSON.stringify(params),
    token,
  });
}

export async function unlinkSocialAccount(
  params: { provider: 'google' | 'github' },
  token: string
): Promise<SocialUnlinkResponse> {
  return fetchJSON<SocialUnlinkResponse>('/api/v2/auth/social/unlink/', {
    method: 'POST',
    body: JSON.stringify(params),
    token,
  });
}