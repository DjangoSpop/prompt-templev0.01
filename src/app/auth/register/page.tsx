'use client';

// This page uses client-only navigation state. Force dynamic and read the
// redirect param on mount to avoid SSR Suspense/CSR bailout during prerender.
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Github,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    bio: '',
    theme_preference: 'light',
    language_preference: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  const {
    signInWithProvider,
    isAuthenticating,
  } = useSocialAuth({
    onAuthSuccess: () => {
      router.push(redirectTo);
    },
    onAuthError: (err) => {
      setError(err);
      setSocialLoading(null);
    },
  });

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('redirect');
      if (r) setRedirectTo(r);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in the required fields');
      return false;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        bio: formData.bio,
        theme_preference: formData.theme_preference,
        language_preference: formData.language_preference,
      });
      router.push('/auth/login?registered=true');
    } catch (err: unknown) {
      console.error('Register error:', err);
      const e = err as Record<string, unknown>;
      setError((e?.message as string) || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');
    try {
      localStorage.setItem('auth_redirect', redirectTo);
      await signInWithProvider(provider);
    } catch (err: unknown) {
      setError(`${provider} sign-up failed. Please try again.`);
      console.error(`${provider} register error:`, err);
      setSocialLoading(null);
    }
  };

  const inputClass =
    'w-full py-3 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-temple text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nile-teal focus:border-nile-teal transition-all duration-300';
  const iconInputClass = inputClass + ' pl-10';

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pharaoh-gold/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-nile-teal/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-desert-sand/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
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
                <span className="text-foreground ml-2">Temple</span>
              </h1>
              <p className="text-temple-stone text-sm">Sacred AI Sanctuary</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Begin Your Journey</h2>
          <p className="text-temple-stone text-lg">
            Create your sacred account to unlock the temple&apos;s wisdom
          </p>
        </div>

        {/* Register Card */}
        <Card className="bg-gradient-to-br from-background/95 to-desert-sand/10 backdrop-blur-lg border border-pharaoh-gold/20 shadow-pyramid rounded-temple">
          <CardHeader>
            <CardTitle className="text-foreground text-center text-2xl font-bold">
              Sacred Registration
            </CardTitle>
            <p className="text-center text-temple-stone">
              Join the temple — or sign up instantly with your existing accounts
            </p>
          </CardHeader>
          <CardContent>
            {/* Social Sign-Up Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-pharaoh-gold/30 hover:bg-pharaoh-gold/10 hover:border-pharaoh-gold/50 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialRegister('google')}
                disabled={isLoading || socialLoading !== null || isAuthenticating}
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FcGoogle className="h-4 w-4 mr-2" />
                )}
                Sign up with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-nile-teal/30 hover:bg-nile-teal/10 hover:border-nile-teal/50 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialRegister('github')}
                disabled={isLoading || socialLoading !== null || isAuthenticating}
              >
                {socialLoading === 'github' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Github className="h-4 w-4 mr-2" />
                )}
                Sign up with GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-temple-stone font-medium">
                  Or register with sacred credentials
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                id="register-error"
                role="alert"
                className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700/50 rounded-temple backdrop-blur-sm mb-6"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sacred Identifier
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Min. 4 characters, letters &amp; numbers only
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={iconInputClass}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sacred Scroll Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={iconInputClass}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* First & Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="First"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Last"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sacred Passphrase
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Min. 8 characters, 1 uppercase, 1 number
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={iconInputClass + ' pr-10'}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-temple-stone hover:text-pharaoh-gold transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-temple-stone hover:text-pharaoh-gold transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Passphrase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    name="password_confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className={iconInputClass + ' pr-10'}
                    placeholder="Repeat your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-temple-stone hover:text-pharaoh-gold transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-temple-stone hover:text-pharaoh-gold transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bio (optional) */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sacred Tale{' '}
                  <span className="text-temple-stone font-normal">(optional)</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full py-3 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-temple text-slate-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nile-teal focus:border-nile-teal transition-all duration-300 resize-none"
                  placeholder="Tell the temple about yourself..."
                  rows={2}
                />
              </div>

              {/* Theme & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Temple Theme
                  </label>
                  <select
                    name="theme_preference"
                    title="Temple Theme"
                    value={formData.theme_preference}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Language
                  </label>
                  <input
                    name="language_preference"
                    value={formData.language_preference}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="en"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || socialLoading !== null || isAuthenticating}
                className="w-full bg-gradient-to-r from-pharaoh-gold to-nile-teal hover:from-pharaoh-gold/80 hover:to-nile-teal/80 text-white py-3 font-semibold shadow-pyramid hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-temple"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consecrating your account...
                  </>
                ) : (
                  'Enter the Temple'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-temple-stone">
              Already a temple guardian?{' '}
              <Link
                href="/auth/login"
                className="text-nile-teal hover:text-nile-teal/80 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
