'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  SocialAuthManager,
  getSocialProviders,
  completeSocialAuth,
  linkSocialAccount,
  unlinkSocialAccount,
  type SocialProvider,
  type SocialAuthCallbackResponse,
  type SocialLinkResponse,
  type SocialUnlinkResponse,
  type SocialAuthError
} from '@/lib/api/social-auth';
import {
  getSocialProviders as getProvidersAPI,
  initiateSocialAuth,
  completeSocialAuth as completeAuthAPI,
  linkSocialAccount as linkAccountAPI,
  unlinkSocialAccount as unlinkAccountAPI
} from '../../lib/api/client';
import { authService } from '@/lib/api/auth';

interface SocialAuthState {
  // Providers
  providers: SocialProvider[];
  isLoadingProviders: boolean;

  // Authentication flow
  isAuthenticating: boolean;
  authError: string | null;

  // Account linking
  isLinking: boolean;
  linkError: string | null;

  // Account unlinking
  isUnlinking: boolean;
  unlinkError: string | null;
}

interface SocialAuthActions {
  // Provider management
  loadProviders: () => Promise<void>;
  getEnabledProviders: () => SocialProvider[];

  // Authentication flow
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  handleAuthCallback: (code: string, state: string, provider?: string) => Promise<SocialAuthCallbackResponse | null>;

  // Account management
  linkAccount: (provider: 'google' | 'github', code: string, state: string, token: string) => Promise<SocialLinkResponse | null>;
  unlinkAccount: (provider: 'google' | 'github', token: string) => Promise<SocialUnlinkResponse | null>;

  // Error handling
  clearErrors: () => void;
}

interface SocialAuthConfig {
  autoLoadProviders?: boolean;
  autoHandleCallback?: boolean;
  onAuthSuccess?: (response: SocialAuthCallbackResponse) => void;
  onAuthError?: (error: string) => void;
  onLinkSuccess?: (response: SocialLinkResponse) => void;
  onUnlinkSuccess?: (response: SocialUnlinkResponse) => void;
}

const defaultConfig: SocialAuthConfig = {
  autoLoadProviders: true,
  autoHandleCallback: true,
};

export function useSocialAuth(config: SocialAuthConfig = {}): SocialAuthState & SocialAuthActions {
  const router = useRouter();
  const finalConfig = { ...defaultConfig, ...config };

  // Auth manager instance
  const [authManager] = useState(() => new SocialAuthManager());

  // State
  const [state, setState] = useState<SocialAuthState>({
    providers: [],
    isLoadingProviders: false,
    isAuthenticating: false,
    authError: null,
    isLinking: false,
    linkError: null,
    isUnlinking: false,
    unlinkError: null,
  });

  // Load available providers
  const loadProviders = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingProviders: true }));

    try {
      // Use the API client function for consistency
      const response = await getProvidersAPI();
      const providers = response.providers || [];
      setState(prev => ({ ...prev, providers, isLoadingProviders: false }));
    } catch (error) {
      console.error('Failed to load social providers:', error);
      // Fallback to auth manager if API fails
      try {
        const providers = await authManager.getAvailableProviders();
        setState(prev => ({ ...prev, providers, isLoadingProviders: false }));
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          isLoadingProviders: false,
          authError: 'Failed to load authentication providers'
        }));
      }
    }
  }, [authManager]);

  // Get enabled providers
  const getEnabledProviders = useCallback((): SocialProvider[] => {
    return state.providers.filter(provider => provider.enabled);
  }, [state.providers]);

  // Sign in with social provider
  const signInWithProvider = useCallback(async (
    provider: 'google' | 'github'
  ) => {
    setState(prev => ({ ...prev, isAuthenticating: true, authError: null }));

    try {
      // Use the auth manager to initiate OAuth flow via backend
      await authManager.redirectToProvider(provider);
      // Note: User will be redirected to OAuth provider, so code after this won't execute
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        authError: errorMessage
      }));

      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed`, {
        description: errorMessage,
      });

      finalConfig.onAuthError?.(errorMessage);
    }
  }, [authManager, finalConfig]);

  // Handle OAuth callback
  const handleAuthCallback = useCallback(async (
    code: string,
    state: string,
    provider?: string
  ): Promise<SocialAuthCallbackResponse | null> => {
    setState(prev => ({ ...prev, isAuthenticating: true, authError: null }));

    try {
      // Get provider info before validation (completeSocialAuth will handle state validation and cleanup)
      const finalProvider = provider || localStorage.getItem('oauth_provider');
      if (!finalProvider) {
        throw new Error('Provider information missing');
      }

      // completeSocialAuth will handle state validation and cleanup
      // It normalizes the response to always have access/refresh at top level
      const response = await completeSocialAuth(code, state, finalProvider);

      setState(prev => ({ ...prev, isAuthenticating: false }));

      // Extract tokens - social-auth.ts normalizes these to top level
      const accessToken = response.access;
      const refreshToken = response.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error('No authentication tokens received');
      }

      // Store tokens and update auth state
      if (typeof window !== 'undefined') {
        console.log('💾 Storing OAuth tokens:', {
          accessLength: accessToken.length,
          refreshLength: refreshToken.length,
          accessPreview: accessToken.substring(0, 20) + '...'
        });
        
        // CRITICAL: Update authService/BaseApiClient shared tokens FIRST
        // This ensures the token is immediately available for the next API call
        authService.saveTokensToStorage({
          access: accessToken,
          refresh: refreshToken
        });
        
        // Store user data
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Verify tokens were stored correctly
        const verifyAccess = localStorage.getItem('access_token');
        const verifyRefresh = localStorage.getItem('refresh_token');
        const serviceToken = authService.getAccessToken();
        console.log('✅ Token storage verification:', {
          accessStored: !!verifyAccess,
          refreshStored: !!verifyRefresh,
          serviceTokenSet: !!serviceToken,
          accessMatch: verifyAccess === accessToken,
          refreshMatch: verifyRefresh === refreshToken,
          authServiceToken: serviceToken?.substring(0, 20) + '...'
        });
      }

      // Dispatch event to notify AuthProvider to refresh
      if (typeof window !== 'undefined') {
        console.log('🎉 Dispatching auth:success event after storing tokens');
        window.dispatchEvent(new CustomEvent('auth:success'));
        // Also dispatch storage event to trigger all listeners
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'access_token',
          newValue: accessToken,
          url: window.location.href
        }));
      }

      // Show appropriate success message based on registration vs. login
      const providerName = response.user.provider_name || provider || 'social';
      const providerDisplay = providerName.charAt(0).toUpperCase() + providerName.slice(1);
      
      if (response.is_new_user) {
        // New user registration via OAuth
        toast.success(`🎉 Welcome to PromptTemple!`, {
          description: `Your account has been created successfully with ${providerDisplay}. You've been granted ${response.user.credits || 100} starting credits!`,
          duration: 5000,
        });
      } else {
        // Existing user login via OAuth
        toast.success(`👋 Welcome back, ${response.user.username}!`, {
          description: `Successfully signed in with ${providerDisplay}.`,
          duration: 3000,
        });
      }

      finalConfig.onAuthSuccess?.(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication callback failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        authError: errorMessage
      }));

      toast.error('Authentication failed', {
        description: errorMessage,
        action: {
          label: 'Try Again',
          onClick: () => {
            if (provider) {
              signInWithProvider(provider as 'google' | 'github');
            }
          },
        },
      });

      finalConfig.onAuthError?.(errorMessage);
      return null;
    }
  }, [finalConfig, signInWithProvider]);

  // Link social account to existing user
  const linkAccount = useCallback(async (
    provider: 'google' | 'github',
    code: string,
    state: string,
    token: string
  ): Promise<SocialLinkResponse | null> => {
    setState(prev => ({ ...prev, isLinking: true, linkError: null }));

    try {
      const response = await linkAccountAPI({ provider, code, state }, token);

      setState(prev => ({ ...prev, isLinking: false }));

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account linked!`, {
        description: `You can now sign in using your ${provider} account.`,
      });

      finalConfig.onLinkSuccess?.(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account linking failed';
      setState(prev => ({
        ...prev,
        isLinking: false,
        linkError: errorMessage
      }));

      toast.error('Account linking failed', {
        description: errorMessage,
      });

      return null;
    }
  }, [finalConfig]);

  // Unlink social account
  const unlinkAccount = useCallback(async (
    provider: 'google' | 'github',
    token: string
  ): Promise<SocialUnlinkResponse | null> => {
    setState(prev => ({ ...prev, isUnlinking: true, unlinkError: null }));

    try {
      const response = await unlinkAccountAPI({ provider }, token);

      setState(prev => ({ ...prev, isUnlinking: false }));

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked`, {
        description: 'The social account has been removed from your profile.',
      });

      finalConfig.onUnlinkSuccess?.(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account unlinking failed';
      setState(prev => ({
        ...prev,
        isUnlinking: false,
        unlinkError: errorMessage
      }));

      toast.error('Account unlinking failed', {
        description: errorMessage,
      });

      return null;
    }
  }, [finalConfig]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      authError: null,
      linkError: null,
      unlinkError: null,
    }));
  }, []);

  // Auto-load providers on mount
  useEffect(() => {
    if (finalConfig.autoLoadProviders) {
      loadProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalConfig.autoLoadProviders]); // Only run on mount or when config changes

  // Handle URL parameters for OAuth callback (only if autoHandleCallback is enabled)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!finalConfig.autoHandleCallback) {
      console.log('⏭️ Auto callback handling disabled');
      return;
    }

    // Use a ref to track if we've already processed this URL
    const processedKey = 'oauth_url_processed';
    const currentUrl = window.location.href;
    const processedUrl = sessionStorage.getItem(processedKey);

    // Skip if we've already processed this exact URL
    if (processedUrl === currentUrl) {
      console.log('⏭️ URL already processed, skipping');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const provider = urlParams.get('provider');

    // Only process if we have OAuth parameters
    if (!code && !state && !error) {
      return;
    }

    // Mark this URL as processed
    sessionStorage.setItem(processedKey, currentUrl);

    // Handle OAuth error
    if (error) {
      const errorDescription = urlParams.get('error_description') || 'Authentication was cancelled or failed';
      setState(prev => ({ ...prev, authError: errorDescription }));

      toast.error('Authentication failed', {
        description: errorDescription,
      });

      // Clean up URL
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
      return;
    }

    // Handle OAuth success callback
    if (code && state) {
      handleAuthCallback(code, state, provider || undefined);

      // Clean up URL after handling
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalConfig.autoHandleCallback]); // Only depend on the config flag, not functions

  return {
    // State
    ...state,

    // Actions
    loadProviders,
    getEnabledProviders,
    signInWithProvider,
    handleAuthCallback,
    linkAccount,
    unlinkAccount,
    clearErrors,
  };
}

// Utility hook for checking if user has social accounts linked
export function useSocialAccountStatus(user?: any) {
  const hasSocialAccounts = user?.linked_social_accounts?.length > 0;
  const hasPassword = user?.has_password !== false;
  const primaryAuthMethod = user?.primary_auth_method || 'email';

  const socialProviders = user?.linked_social_accounts?.map((account: any) => account.provider) || [];
  const hasGoogle = socialProviders.includes('google');
  const hasGitHub = socialProviders.includes('github');

  return {
    hasSocialAccounts,
    hasPassword,
    primaryAuthMethod,
    socialProviders,
    hasGoogle,
    hasGitHub,
    canRemovePassword: hasSocialAccounts && hasPassword,
    accountCount: (hasPassword ? 1 : 0) + socialProviders.length,
  };
}

export default useSocialAuth;