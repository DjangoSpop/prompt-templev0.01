   'use client';

  // This page uses client-only navigation state. Force dynamic and read the
  // redirect param on mount to avoid SSR Suspense/CSR bailout during prerender.
  export const dynamic = 'force-dynamic';

  import React, { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Sparkle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { NefertitiBackground, NefertitiIcon } from '@/components/pharaonic/NefertitiIcon';
import { FloatingParticles } from '@/components/animations/FloatingParticles';
import { Badge } from '@/components/ui/badge';

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
    language_preference: 'en'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/auth/login');

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('redirect');
      if (r) setRedirectTo(r);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      // Redirect to login (or target) after successful registration
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
      <NefertitiIcon/>
      <NefertitiBackground/>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="h-12 w-12 rounded bg-brand flex items-center justify-center">
      
              <Badge/>
            </div>
            <FloatingParticles/>
            <Sparkle/>
            <span className="text-text-primary font-bold text-2xl">Prompt Temple</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Create an account</h2>
          <p className="text-text-secondary mt-2">Sign up for a PromptCraft account</p>
        </div>

        <Card className="bg-bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-text-primary text-center">Register</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red/10 border border-red/20 rounded-md mb-4">
                <AlertCircle className="h-4 w-4 text-red flex-shrink-0" />
                <span className="text-red text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">Username</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">Email</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">First name</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="First"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Last name</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="Last"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-text-muted" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-text-muted" /> : <Eye className="h-4 w-4 text-text-muted" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">Confirm password</label>
                <input
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">Short bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="Tell us a bit about yourself"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Theme</label>
                  <select
                    name="theme_preference"
                    value={formData.theme_preference}
                    onChange={handleChange}
                    className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Language</label>
                  <input
                    name="language_preference"
                    value={formData.language_preference}
                    onChange={handleChange}
                    className="w-full mt-1 py-2 px-3 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="en"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-4 text-sm text-text-muted text-center">
              Already have an account?{' '}
              <button className="text-brand hover:text-brand-hover" onClick={() => router.push('/auth/login')}>
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
