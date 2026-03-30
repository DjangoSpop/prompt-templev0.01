'use client';

// This page uses next/navigation's useSearchParams which requires client-side
// rendering. Force dynamic to avoid prerender-time CSR bailout errors.
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Github,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import Eyehorus from '@/components/pharaonic/Eyehorus';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const {
    signInWithProvider,
    isAuthenticating,
    authError
  } = useSocialAuth({
    onAuthSuccess: (response) => {
      // Handle successful social auth
      console.log('Social auth successful:', response);
      router.push(redirectTo);
    },
    onAuthError: (error) => {
      console.error('Social auth failed:', error);
      setError(error);
      setSocialLoading(null);
    }
  });
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  // Read redirect query param on client-side mount to avoid SSR/suspense issues
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('redirect');
      const errorParam = sp.get('error');

      if (r) setRedirectTo(r);

      // Handle OAuth errors from callback page
      if (errorParam) {
        switch (errorParam) {
          case 'social_auth_failed':
            setError('Social authentication failed. Please try again.');
            break;
          case 'oauth_cancelled':
            setError('Authentication was cancelled. Please try again.');
            break;
          case 'invalid_callback':
            setError('Invalid authentication response. Please try again.');
            break;
          default:
            setError('Authentication error occurred. Please try again.');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData.username.trim(), formData.password);
      router.push(redirectTo);
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Handle different error types from Django backend
      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        if (err?.status === 401) {
          setError('Invalid username or password');
        } else if (err?.status === 429) {
          setError('Too many login attempts. Please try again later.');
        } else if (err?.response && typeof err.response === 'object') {
          const response = err.response as Record<string, unknown>;
          if (response?.data && typeof response.data === 'object') {
            const data = response.data as Record<string, unknown>;
            if (typeof data.message === 'string') {
              setError(data.message);
            }
          }
        } else if (typeof err?.message === 'string') {
          setError(err.message);
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');

    try {
      // Store redirect URL in localStorage before OAuth redirect
      localStorage.setItem('auth_redirect', redirectTo);

      // Use the social auth hook instead of the basic socialLogin
      await signInWithProvider(provider);
      // Note: After OAuth flow, user will be redirected to callback page
      // The callback page will handle the redirect to the final destination
    } catch (error: unknown) {
      setError(`${provider} login failed. Please try again.`);
      console.error(`${provider} login error:`, error);
      setSocialLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0E0F12 0%, #131620 40%, #1B2B6B 80%, #0E0F12 100%)',
      }}
    >
      {/* Gold hieroglyphic dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gold top line — temple threshold */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, #d4af37 30%, #ffe066 50%, #d4af37 70%, transparent 95%)',
        }}
      />
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full filter blur-xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div
              className="relative flex items-center justify-center"
              style={{ filter: 'drop-shadow(0 0 18px rgba(212, 175, 55, 0.5))' }}
            >
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 80,
                  height: 80,
                  background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                }}
              />
              <Eyehorus
                size={56}
                variant="hero"
                glow={true}
                glowIntensity="high"
                animated={true}
                speedMultiplier={1.5}
                showLabel={false}
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Prompt
                </span>
                <span className="text-white ml-2">Temple</span>
              </h1>
              <p className="text-stone-400 text-sm">Sacred AI Sanctuary</p>
            </div>
          </div>
          <h2
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Return to the Temple
          </h2>
          <p className="text-stone-400 text-lg">
            Enter your sacred credentials to continue your journey
          </p>
        </div>

        {/* Login Form */}
        <Card
          className="backdrop-blur-lg border border-amber-500/15 shadow-[0_0_40px_rgba(212,175,55,0.06)] rounded-temple"
          style={{ background: 'linear-gradient(135deg, rgba(14,15,20,0.95) 0%, rgba(19,22,32,0.95) 100%)' }}
        >
          <CardHeader>
            <CardTitle
              className="text-white text-center text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sacred Access Portal
            </CardTitle>
            <p className="text-center text-stone-400">Enter your credentials to access the temple</p>
          </CardHeader>
          <CardContent>
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/20 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || socialLoading !== null || isAuthenticating}
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FcGoogle className="h-4 w-4 mr-2" />
                )}
                Continue with Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/20 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading || socialLoading !== null || isAuthenticating}
              >
                {socialLoading === 'github' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Github className="h-4 w-4 mr-2" />
                )}
                Continue with GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0E0F14] px-2 text-stone-500 font-medium">Or use sacred credentials</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div id="login-error" role="alert" className="flex items-center space-x-2 p-4 bg-red-900/20 border-2 border-red-700/50 rounded-temple backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Username/Email Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-stone-200">
                  Sacred Identifier
                </label>
                <p id="username-help" className="text-xs text-stone-500">
                  Min. 4 characters, letters & numbers only
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-amber-500/60" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-amber-500/15 rounded-temple text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all duration-300"
                    placeholder="Enter your username or email"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'username-error' : 'username-help'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-stone-200">
                  Sacred Passphrase
                </label>
                <p id="password-help" className="text-xs text-stone-500">
                  Min. 8 characters, 1 uppercase, 1 number
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-amber-500/60" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-amber-500/15 rounded-temple text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all duration-300"
                    placeholder="Enter your password"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'password-error' : 'password-help'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || socialLoading !== null || isAuthenticating}
                className="w-full py-3 font-bold text-[#0E0F12] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 transform hover:scale-[1.02] rounded-temple"
                style={{ background: 'linear-gradient(135deg, #ffe066, #d4af37, #CBA135)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>Enter the Temple</>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-3">
              <button className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Forgotten your sacred passphrase?
              </button>
              <div className="text-sm text-stone-400">
                Seeking entry to the temple?{' '}
                <Link href="/auth/register" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Begin your journey
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}