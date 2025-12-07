'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Crown, Sparkles } from 'lucide-react';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing GitHub authentication...');
  const [processed, setProcessed] = useState(false);

  const { handleAuthCallback } = useSocialAuth({
    autoLoadProviders: false,
    autoHandleCallback: false,
    onAuthSuccess: (response) => {
      setStatus('success');
      setMessage(`Welcome ${response.is_new_user ? 'to PromptTemple' : 'back'}!`);

      // Give auth state time to propagate before redirect
      setTimeout(() => {
        console.log('🚀 Redirecting after successful authentication...');
        const redirect = localStorage.getItem('auth_redirect') || '/';
        localStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('github_callback_processing');
        router.push(redirect);
      }, 2000);
    },
    onAuthError: (error) => {
      setStatus('error');
      setMessage(error || 'GitHub authentication failed');

      // Redirect to login page after error
      setTimeout(() => {
        sessionStorage.removeItem('github_callback_processing');
        router.push('/auth/login?error=social_auth_failed');
      }, 3000);
    },
  });

  useEffect(() => {
    // Use sessionStorage to prevent processing multiple times (survives HMR)
    const processingKey = 'github_callback_processing';
    if (sessionStorage.getItem(processingKey)) {
      console.log('GitHub callback already processing, skipping...');
      return;
    }
    
    sessionStorage.setItem(processingKey, 'true');
    setProcessed(true);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      const errorDescription =
        searchParams.get('error_description') || 'GitHub authentication was cancelled';
      setStatus('error');
      setMessage(errorDescription);

      setTimeout(() => {
        router.push('/auth/login?error=oauth_cancelled');
      }, 3000);
      return;
    }

    if (code && state) {
      // Handle the OAuth callback with 'github' provider
      handleAuthCallback(code, state, 'github');
    } else {
      setStatus('error');
      setMessage('Invalid callback parameters from GitHub');

      setTimeout(() => {
        router.push('/auth/login?error=invalid_callback');
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 text-pharaoh-gold animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'from-pharaoh-gold/20 to-nile-teal/20';
      case 'success':
        return 'from-green-100 to-emerald-100';
      case 'error':
        return 'from-red-100 to-pink-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pharaoh-gold/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-nile-teal/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-desert-sand/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-temple flex items-center justify-center shadow-pyramid">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-pharaoh-gold animate-spin" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-pharaoh-gold via-nile-teal to-pharaoh-gold bg-clip-text text-transparent">
                  Prompt
                </span>
                <span className="text-foreground ml-2">
                  Temple
                </span>
              </h1>
              <p className="text-temple-stone text-sm">GitHub Sign-In</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`bg-gradient-to-br ${getStatusColor()} backdrop-blur-lg border border-pharaoh-gold/20 shadow-pyramid rounded-temple`}>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {getStatusIcon()}
              </div>

              {/* Status Message */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {status === 'processing' && 'Authenticating with GitHub...'}
                  {status === 'success' && 'Success!'}
                  {status === 'error' && 'Authentication Failed'}
                </h2>
                <p className="text-temple-stone">
                  {message}
                </p>
              </div>

              {/* Progress or Additional Info */}
              {status === 'processing' && (
                <div className="space-y-2">
                  <div className="w-full bg-pharaoh-gold/20 rounded-full h-2">
                    <div className="bg-pharaoh-gold h-2 rounded-full animate-pulse w-3/4"></div>
                  </div>
                  <p className="text-xs text-temple-stone">
                    Verifying your GitHub account...
                  </p>
                </div>
              )}

              {status === 'success' && (
                <p className="text-sm text-green-700">
                  Redirecting you to the temple...
                </p>
              )}

              {status === 'error' && (
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    Please try again or contact support if the issue persists.
                  </p>
                  <p className="text-xs text-temple-stone">
                    Redirecting to login page...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GitHubCallbackFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-pharaoh-gold animate-spin" />
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<GitHubCallbackFallback />}>
      <GitHubCallbackContent />
    </Suspense>
  );
}
