'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Chrome, Loader, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocialAuth } from '@/hooks/useSocialAuth';

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup' | 'link';
  redirectUri?: string;
  token?: string; // Required for linking mode
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showProviderLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: Chrome,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    borderColor: 'border-gray-200',
  },
};

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  mode = 'signin',
  redirectUri,
  token,
  onSuccess,
  onError,
  className = '',
  showProviderLabels = true,
  size = 'md',
  variant = 'outline',
}) => {
  const {
    providers,
    isLoadingProviders,
    isAuthenticating,
    isLinking,
    signInWithProvider,
    linkAccount,
    getEnabledProviders,
    authError,
    linkError,
  } = useSocialAuth({
    onAuthSuccess: onSuccess,
    onAuthError: onError,
    onLinkSuccess: onSuccess,
  });

  const enabledProviders = getEnabledProviders();
  const isLoading = isLoadingProviders || isAuthenticating || isLinking;
  const error = authError || linkError;

  const handleProviderClick = async (provider: 'google' | 'github') => {
    if (mode === 'link' && token) {
      // For linking mode, we need to handle the OAuth flow differently
      // This would typically involve opening a popup or redirecting with special parameters
      console.log('Link mode not yet implemented in this component');
      return;
    }

    try {
      await signInWithProvider(provider, redirectUri);
    } catch (err) {
      console.error('Social auth failed:', err);
    }
  };

  const getButtonText = (providerName: string) => {
    switch (mode) {
      case 'signup':
        return `Sign up with ${providerName}`;
      case 'link':
        return `Link ${providerName}`;
      case 'signin':
      default:
        return `Continue with ${providerName}`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-sm';
      case 'lg':
        return 'h-12 px-6 text-base';
      case 'md':
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  if (isLoadingProviders) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <Loader className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-600">Loading authentication options...</span>
      </div>
    );
  }

  if (enabledProviders.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-600">No social authentication providers available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      <div className="grid gap-3">
        {enabledProviders
          .filter(provider => provider.name in providerConfig)
          .map((provider, index) => {
            const config = providerConfig[provider.name as keyof typeof providerConfig];
            const Icon = config.icon;
            const isProviderLoading = isLoading;

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleProviderClick(provider.name as 'google' | 'github')}
                  disabled={isProviderLoading}
                  variant={variant}
                  className={`
                    w-full ${getSizeClasses()}
                    ${variant === 'outline' ? `${config.bgColor} ${config.borderColor} ${config.textColor}` : ''}
                    transition-all duration-200 hover:scale-[1.02] hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  `}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isProviderLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}

                    {showProviderLabels && (
                      <span className="font-medium">
                        {isProviderLoading
                          ? mode === 'link'
                            ? 'Linking...'
                            : 'Signing in...'
                          : getButtonText(config.name)
                        }
                      </span>
                    )}

                    {!isProviderLoading && mode !== 'link' && (
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    )}
                  </div>
                </Button>
              </motion.div>
            );
          })}
      </div>

      {/* Security badge */}
      {mode !== 'link' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center space-x-2 pt-2"
        >
          <Shield className="w-3 h-3 text-green-600" />
          <span className="text-xs text-gray-600">
            Secure OAuth2 authentication
          </span>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            SSL
          </Badge>
        </motion.div>
      )}

      {/* Provider status indicators */}
      {mode === 'signin' && (
        <div className="flex justify-center space-x-2 pt-2">
          {enabledProviders.map((provider) => {
            const config = providerConfig[provider.name as keyof typeof providerConfig];
            if (!config) return null;

            return (
              <div
                key={provider.id}
                className="w-2 h-2 rounded-full bg-green-400"
                title={`${config.name} available`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Compact version for inline use
export const SocialAuthButtonsCompact: React.FC<Omit<SocialAuthButtonsProps, 'showProviderLabels' | 'size'>> = (props) => {
  return (
    <SocialAuthButtons
      {...props}
      showProviderLabels={false}
      size="sm"
      className="flex flex-row space-y-0 space-x-2"
    />
  );
};

// Large version for dedicated auth pages
export const SocialAuthButtonsLarge: React.FC<SocialAuthButtonsProps> = (props) => {
  return (
    <SocialAuthButtons
      {...props}
      size="lg"
      className="max-w-sm mx-auto"
    />
  );
};

export default SocialAuthButtons;