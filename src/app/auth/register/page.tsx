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
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import Eyehorus from '@/components/pharaonic/Eyehorus';
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
    'w-full py-3 px-3 bg-white/5 border border-amber-500/15 rounded-temple text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all duration-300';
  const iconInputClass = inputClass + ' pl-10';

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

      <div className="w-full max-w-lg space-y-8 relative z-10">
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
                <span className="text-foreground ml-2">Temple</span>
              </h1>
              <p className="text-temple-stone text-sm">Sacred AI Sanctuary</p>
            </div>
          </div>
          <h2
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Begin Your Journey
          </h2>
          <p className="text-stone-400 text-lg">
            Create your sacred account to unlock the temple&apos;s wisdom
          </p>
        </div>

        {/* Register Card */}
        <Card
          className="backdrop-blur-lg border border-amber-500/15 shadow-[0_0_40px_rgba(212,175,55,0.06)] rounded-temple"
          style={{ background: 'linear-gradient(135deg, rgba(14,15,20,0.95) 0%, rgba(19,22,32,0.95) 100%)' }}
        >
          <CardHeader>
            <CardTitle
              className="text-white text-center text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sacred Registration
            </CardTitle>
            <p className="text-center text-stone-400">
              Join the temple — or sign up instantly with your existing accounts
            </p>
          </CardHeader>
          <CardContent>
            {/* Social Sign-Up Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/20 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 rounded-temple"
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
                className="w-full border-amber-500/20 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 rounded-temple"
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
                <span className="bg-[#0E0F14] px-2 text-stone-500 font-medium">
                  Or register with sacred credentials
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                id="register-error"
                role="alert"
                className="flex items-center space-x-2 p-4 bg-red-900/20 border-2 border-red-700/50 rounded-temple backdrop-blur-sm mb-6"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-stone-200">
                  Sacred Identifier
                </label>
                <p className="text-xs text-stone-500">
                  Min. 4 characters, letters &amp; numbers only
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-amber-500/60" />
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
                <label className="block text-sm font-semibold text-stone-200">
                  Sacred Scroll Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-amber-500/60" />
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
                  <label className="block text-sm font-semibold text-stone-200">
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
                  <label className="block text-sm font-semibold text-stone-200">
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
                <label className="block text-sm font-semibold text-stone-200">
                  Sacred Passphrase
                </label>
                <p className="text-xs text-stone-500">
                  Min. 8 characters, 1 uppercase, 1 number
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-amber-500/60" />
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
                      <EyeOff className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-stone-200">
                  Confirm Passphrase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-amber-500/60" />
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
                      <EyeOff className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-500/60 hover:text-pharaoh-gold transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bio (optional) */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-stone-200">
                  Sacred Tale{' '}
                  <span className="text-stone-500 font-normal">(optional)</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full py-3 px-3 bg-white/5 border border-amber-500/15 rounded-temple text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all duration-300 resize-none"
                  placeholder="Tell the temple about yourself..."
                  rows={2}
                />
              </div>

              {/* Theme & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-stone-200">
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
                  <label className="block text-sm font-semibold text-stone-200">
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
                className="w-full py-3 font-bold text-[#0E0F12] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 transform hover:scale-[1.02] rounded-temple"
                style={{ background: 'linear-gradient(135deg, #ffe066, #d4af37, #CBA135)' }}
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
            <div className="mt-6 text-center text-sm text-stone-400">
              Already a temple guardian?{' '}
              <Link
                href="/auth/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
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
