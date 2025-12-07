'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SocialAuthButtons } from './SocialAuthButtons';

interface EnhancedAuthPageProps {
  defaultTab?: 'signin' | 'signup';
  onAuthSuccess?: (response: any) => void;
  onAuthError?: (error: string) => void;
  redirectUri?: string;
  className?: string;
}

export const EnhancedAuthPage: React.FC<EnhancedAuthPageProps> = ({
  defaultTab = 'signin',
  onAuthSuccess,
  onAuthError,
  redirectUri,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Implement your existing email/password signin logic here
      console.log('Signing in with:', signinForm);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAuthSuccess?.({
        user: { email: signinForm.email },
        access: 'mock-token',
        refresh: 'mock-refresh-token'
      });
    } catch (error) {
      onAuthError?.('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      onAuthError?.('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Implement your existing email/password signup logic here
      console.log('Signing up with:', signupForm);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAuthSuccess?.({
        user: {
          email: signupForm.email,
          username: signupForm.username,
        },
        access: 'mock-token',
        refresh: 'mock-refresh-token',
        is_new_user: true
      });
    } catch (error) {
      onAuthError?.('Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuthSuccess = (response: any) => {
    console.log('Social auth success:', response);
    onAuthSuccess?.(response);
  };

  const handleSocialAuthError = (error: string) => {
    console.error('Social auth error:', error);
    onAuthError?.(error);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              PromptTemple
            </h1>
          </motion.div>
          <p className="text-gray-600">
            {activeTab === 'signin'
              ? 'Welcome back to your AI-powered prompt crafting sanctuary'
              : 'Join the pharaonic quest of AI-powered prompt mastery'
            }
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab}>
              <TabsContent value="signin" className="space-y-4">
                {/* Social Authentication Buttons */}
                <SocialAuthButtons
                  mode="signin"
                  redirectUri={redirectUri}
                  onSuccess={handleSocialAuthSuccess}
                  onError={handleSocialAuthError}
                  size="md"
                  variant="outline"
                />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSignin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signinForm.email}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signinForm.password}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="text-center">
                  <button className="text-sm text-amber-600 hover:text-amber-700">
                    Forgot your password?
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {/* Social Authentication Buttons */}
                <SocialAuthButtons
                  mode="signup"
                  redirectUri={redirectUri}
                  onSuccess={handleSocialAuthSuccess}
                  onError={handleSocialAuthError}
                  size="md"
                  variant="outline"
                />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or create with email</span>
                  </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="pharaoh_builder"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="text-center text-xs text-gray-600">
                  By signing up, you agree to our{' '}
                  <a href="/terms" className="text-amber-600 hover:text-amber-700">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-amber-600 hover:text-amber-700">Privacy Policy</a>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          <p>
            {activeTab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EnhancedAuthPage;