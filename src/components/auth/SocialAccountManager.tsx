'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Chrome,
  Link,
  Unlink,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  User,
  Calendar,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSocialAuth, useSocialAccountStatus } from '@/hooks/useSocialAuth';
import { useAuth } from '@/hooks/useAuth'; // Assuming this exists

interface SocialAccountManagerProps {
  className?: string;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: Chrome,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
};

export const SocialAccountManager: React.FC<SocialAccountManagerProps> = ({
  className = '',
}) => {
  const { user, token } = useAuth();
  const {
    providers,
    isLinking,
    isUnlinking,
    linkAccount,
    unlinkAccount,
    signInWithProvider,
    getEnabledProviders,
  } = useSocialAuth();

  const {
    hasSocialAccounts,
    hasPassword,
    primaryAuthMethod,
    socialProviders,
    hasGoogle,
    hasGitHub,
    canRemovePassword,
    accountCount,
  } = useSocialAccountStatus(user);

  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);

  const enabledProviders = getEnabledProviders();

  const handleLinkProvider = async (provider: 'google' | 'github') => {
    try {
      // For linking, we need to redirect to OAuth with special parameters
      // The redirect should come back to a special linking callback
      await signInWithProvider(provider, `/auth/link-callback?provider=${provider}`);
    } catch (error) {
      console.error('Failed to initiate provider linking:', error);
    }
  };

  const handleUnlinkProvider = async (provider: 'google' | 'github') => {
    if (!token) return;

    try {
      await unlinkAccount(provider, token);
      setShowUnlinkDialog(false);
      setUnlinkingProvider(null);
    } catch (error) {
      console.error('Failed to unlink provider:', error);
    }
  };

  const confirmUnlink = (provider: string) => {
    setUnlinkingProvider(provider);
    setShowUnlinkDialog(true);
  };

  const getProviderStatus = (providerName: string) => {
    const isLinked = socialProviders.includes(providerName);
    const isPrimary = primaryAuthMethod === providerName;

    return { isLinked, isPrimary };
  };

  const canUnlinkProvider = (providerName: string) => {
    const { isLinked, isPrimary } = getProviderStatus(providerName);

    // Can't unlink if it's the only authentication method
    if (accountCount <= 1) return false;

    // Can unlink if there are other methods available
    return isLinked && (hasPassword || socialProviders.length > 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Connected Accounts</span>
          </CardTitle>
          <CardDescription>
            Manage your social authentication providers and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-900">Account Security</h3>
              <Badge
                variant="outline"
                className={`${
                  accountCount >= 2
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}
              >
                {accountCount} method{accountCount !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Primary method:</span>
                <Badge variant="outline" className="text-xs">
                  {primaryAuthMethod === 'email' ? 'Password' : primaryAuthMethod}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Security level:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    accountCount >= 2
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {accountCount >= 2 ? 'Enhanced' : 'Basic'}
                </Badge>
              </div>
            </div>

            {accountCount === 1 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Consider linking another account for enhanced security
              </div>
            )}
          </div>

          {/* Social Providers */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Social Authentication</h3>

            {enabledProviders
              .filter(provider => provider.name in providerConfig)
              .map((provider) => {
                const config = providerConfig[provider.name as keyof typeof providerConfig];
                const { isLinked, isPrimary } = getProviderStatus(provider.name);
                const Icon = config.icon;
                const linkedAccount = user?.linked_social_accounts?.find(
                  (account: any) => account.provider === provider.name
                );

                return (
                  <motion.div
                    key={provider.id}
                    layout
                    className={`p-4 border rounded-lg transition-all ${
                      isLinked
                        ? `${config.bgColor} ${config.borderColor}`
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isLinked ? 'bg-white/60' : 'bg-white'}`}>
                          <Icon
                            className={`w-5 h-5 ${
                              isLinked ? config.textColor : 'text-gray-600'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{config.name}</h4>
                            {isLinked && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {isPrimary && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Primary
                              </Badge>
                            )}
                          </div>

                          {isLinked ? (
                            <div className="text-sm text-gray-600">
                              <p>{linkedAccount?.email}</p>
                              {linkedAccount?.linked_at && (
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Linked {formatDate(linkedAccount.linked_at)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Not connected to your account
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isLinked ? (
                          <Button
                            onClick={() => confirmUnlink(provider.name)}
                            disabled={!canUnlinkProvider(provider.name) || isUnlinking}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isUnlinking && unlinkingProvider === provider.name ? (
                              <Loader className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Unlink className="w-3 h-3 mr-1" />
                            )}
                            Unlink
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleLinkProvider(provider.name as 'google' | 'github')}
                            disabled={isLinking}
                            variant="outline"
                            size="sm"
                            className={`${config.textColor} hover:${config.bgColor}`}
                          >
                            {isLinking ? (
                              <Loader className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Link className="w-3 h-3 mr-1" />
                            )}
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Security Recommendations */}
          {accountCount === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <h3 className="font-medium text-amber-900 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security Recommendation
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                Linking additional authentication methods improves account security and provides
                backup access options.
              </p>
              <div className="flex flex-wrap gap-2">
                {enabledProviders
                  .filter(p => !socialProviders.includes(p.name))
                  .map(provider => {
                    const config = providerConfig[provider.name as keyof typeof providerConfig];
                    if (!config) return null;

                    return (
                      <Button
                        key={provider.id}
                        onClick={() => handleLinkProvider(provider.name as 'google' | 'github')}
                        variant="outline"
                        size="sm"
                        className="text-amber-700 border-amber-300 hover:bg-amber-100"
                      >
                        <config.icon className="w-3 h-3 mr-1" />
                        Link {config.name}
                      </Button>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink {unlinkingProvider} Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the {unlinkingProvider} authentication method from your account.
              You can always reconnect it later.
              {accountCount <= 2 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ This will leave you with only one authentication method.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUnlinkProvider(unlinkingProvider as 'google' | 'github')}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUnlinking ? (
                <>
                  <Loader className="w-3 h-3 animate-spin mr-1" />
                  Unlinking...
                </>
              ) : (
                'Unlink Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SocialAccountManager;