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
  Crown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
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

  const { login, socialLogin } = useAuth();
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  // Read redirect query param on client-side mount to avoid SSR/suspense issues
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('redirect');
      if (r) setRedirectTo(r);
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
      await socialLogin(provider);
      router.push(redirectTo);
    } catch (error: unknown) {
      setError(`${provider} login failed. Please try again.`);
      console.error(`${provider} login error:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 flex items-center justify-center px-4 relative overflow-hidden">
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
              <p className="text-temple-stone text-sm">Sacred AI Sanctuary</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Return to the Temple</h2>
          <p className="text-temple-stone text-lg">
            Enter your sacred credentials to continue your journey
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-gradient-to-br from-background/95 to-desert-sand/10 backdrop-blur-lg border border-pharaoh-gold/20 shadow-pyramid rounded-temple">
          <CardHeader>
            <CardTitle className="text-foreground text-center text-2xl font-bold">Sacred Access Portal</CardTitle>
            <p className="text-center text-temple-stone">Enter your credentials to access the temple</p>
          </CardHeader>
          <CardContent>
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-pharaoh-gold/30 hover:bg-pharaoh-gold/10 hover:border-pharaoh-gold/50 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || socialLoading !== null}
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
                className="w-full border-nile-teal/30 hover:bg-nile-teal/10 hover:border-nile-teal/50 transition-all duration-300 rounded-temple"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading || socialLoading !== null}
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
                <span className="bg-background px-2 text-temple-stone font-medium">Or use sacred credentials</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50/80 border border-red-300/50 rounded-temple backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Username/Email Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-foreground">
                  Sacred Identifier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 bg-desert-sand/20 border border-pharaoh-gold/30 rounded-temple text-foreground placeholder-temple-stone focus:outline-none focus:ring-2 focus:ring-pharaoh-gold focus:border-pharaoh-gold transition-all duration-300"
                    placeholder="Enter your username or email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Sacred Passphrase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-temple-stone" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 bg-desert-sand/20 border border-pharaoh-gold/30 rounded-temple text-foreground placeholder-temple-stone focus:outline-none focus:ring-2 focus:ring-pharaoh-gold focus:border-pharaoh-gold transition-all duration-300"
                    placeholder="Enter your password"
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || socialLoading !== null}
                className="w-full bg-gradient-to-r from-pharaoh-gold to-nile-teal hover:from-pharaoh-gold/80 hover:to-nile-teal/80 text-white py-3 font-semibold shadow-pyramid hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-temple"
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
              <button className="text-sm text-pharaoh-gold hover:text-pharaoh-gold/80 font-medium transition-colors">
                Forgotten your sacred passphrase?
              </button>
              <div className="text-sm text-temple-stone">
                Seeking entry to the temple?{' '}
                <Link href="/auth/register" className="text-nile-teal hover:text-nile-teal/80 font-semibold transition-colors">
                  Begin your journey
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Information */}
        <Card className="bg-gradient-to-br from-background/80 to-desert-sand/20 backdrop-blur-lg border border-pharaoh-gold/20 shadow-pyramid rounded-temple">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-4 w-4 text-pharaoh-gold" />
                <span className="text-sm text-foreground font-semibold">Temple Guest Access</span>
              </div>
              <div className="text-sm text-temple-stone">
                Sacred ID: <span className="font-mono bg-pharaoh-gold/20 text-pharaoh-gold px-2 py-1 rounded-temple">demo</span>
              </div>
              <div className="text-sm text-temple-stone">
                Passphrase: <span className="font-mono bg-nile-teal/20 text-nile-teal px-2 py-1 rounded-temple">password</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}