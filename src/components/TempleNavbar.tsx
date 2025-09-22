'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useSuppressHydrationWarning } from '@/hooks/useSuppressHydrationWarning';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OnboardingTrigger } from '@/components/onboarding';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Crown,
  BookOpen,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Bot,
  TrendingUp,
  HelpCircle,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const mainNavLinks: NavLink[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    href: '/assistant-full',
    label: 'AI Assistant',
    icon: Sparkles,
    description: 'Smart AI conversations'
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: BookOpen,
    description: 'Prompt library & manager'
  },
  {
    href: '/optimization',
    label: 'Optimizer',
    icon: Zap,
    description: 'AI prompt optimization'
  },
  {
    href: '/enhanced',
    label: 'Oracle Chat',
    icon: MessageSquare,
    description: 'Live AI conversations'
  },
  {
    href: '/rag',
    label: 'RAG',
    icon: Bot,
    description: 'Knowledge retrieval'
  },
  {
    href: '/analysis',
    label: 'Analytics',
    icon: TrendingUp,
    description: 'Performance insights'
  },
  {
    href: '/status',
    label: 'Status',
    icon: Activity,
    description: 'System health'
  },
  {
    href: '/profile',
    label: 'profile',
    icon: Crown,
    description: 'Profile Data'
  },
  {
    href: '/help',
    label: 'Help',
    icon: HelpCircle,
    description: 'Documentation & support'
  }
];

export function TempleNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Suppress hydration warnings for browser extension attributes
  useSuppressHydrationWarning();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent hydration mismatch by not rendering interactive elements until client-side
  if (!isClient) {
    return (
      <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-lg border-b border-primary/20 pyramid-elevation">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation group-hover:pharaoh-glow transition-shadow">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,22 2,22" />
                    <polygon points="12,6 18,18 6,18" className="opacity-70" />
                    <polygon points="12,10 14,14 10,14" className="opacity-50" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-3 h-3 bg-gold-accent rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg md:text-xl font-bold text-hieroglyph text-glow">
                  Prompt Temple
                </h1>
                <p className="text-xs text-muted-foreground">Sacred AI Sanctuary</p>
              </div>
            </Link>

            {/* Placeholder for user menu */}
            <div className="flex items-center space-x-3">
              <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-lg border-b-2 border-gold-accent/30 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Enhanced Logo with Pyramid Motif */}
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  {/* Three Pyramids Design for Prompt Temple */}
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-basalt-black" viewBox="0 0 24 24" fill="currentColor">
                    {/* Left Pyramid */}
                    <polygon points="4,2 10,14 -2,14" className="opacity-85" />
                    {/* Center Pyramid (tallest) */}
                    <polygon points="12,1 20,16 4,16" className="opacity-100" />
                    {/* Right Pyramid */}
                    <polygon points="20,2 26,14 14,14" className="opacity-85" />
                    {/* Base shadow/ground */}
                    <rect x="2" y="14" width="20" height="2" className="opacity-30" rx="1" />
                  </svg>
                </div>
                {/* Animated Sun Dot */}
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gold-accent to-yellow-600 bg-clip-text text-transparent">
                  PromptTemple
                </h1>
                <p className="text-xs text-muted-foreground">Sacred AI Sanctuary</p>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden xl:flex items-center space-x-1 lg:space-x-2" data-onboarding="main-nav">
                {mainNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActivePath(link.href);

                  // Add onboarding data attributes for key navigation items
                  const getDataAttribute = (href: string) => {
                    switch (href) {
                      case '/assistant': return 'assistant-nav';
                      case '/templates': return 'library-nav';
                      case '/optimization': return 'optimizer-nav';
                      case '/': return 'temple-nav';
                      case '/help': return 'academy-nav';
                      case '/status': return 'analytics-nav';
                      default: return undefined;
                    }
                  };

                  return (
                    <Link key={link.href} href={link.href} className="group relative">
                      <Button
                        data-onboarding={getDataAttribute(link.href)}
                        variant="ghost"
                        className={`
                          h-10 lg:h-11 px-2 lg:px-4 flex items-center space-x-1 lg:space-x-2 min-w-[80px] lg:min-w-[120px] relative overflow-hidden
                          ${isActive
                            ? 'bg-gradient-to-r from-gold-accent/20 to-yellow-500/20 text-gold-accent border border-gold-accent/30 shadow-lg'
                            : 'hover:bg-gold-accent/10 hover:text-gold-accent text-foreground/80'
                          }
                          transition-all duration-300 group-hover:scale-105 rounded-xl
                        `}
                      >
                        {/* Pyramid bullet for active state */}
                        {isActive && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
                            <svg className="h-2 w-2 text-gold-accent" viewBox="0 0 12 12" fill="currentColor">
                              <polygon points="6,1 11,9 1,9" />
                            </svg>
                          </div>
                        )}

                        <Icon className={`h-3 w-3 lg:h-4 lg:w-4 ${isActive ? 'text-gold-accent' : ''}`} />
                        <span className="text-xs lg:text-sm font-medium truncate">{link.label}</span>

                        {/* Active route underline with motion */}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-accent to-yellow-500 rounded-full"></div>
                        )}
                      </Button>

                      {/* Enhanced Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                        <div className="bg-basalt-black/90 text-papyrus text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gold-accent/20">
                          {link.description}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-basalt-black/90 rotate-45 border-l border-t border-gold-accent/20"></div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Enhanced User Menu & Mobile Button */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Enhanced User Info with Egyptian styling */}
                  <div className="hidden lg:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.first_name || user?.username}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Crown className="h-3 w-3 text-gold-accent" />
                        <span className="text-xs text-muted-foreground">Pharaoh Level {user?.level || 1}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold shadow-lg border-2 border-gold-accent/30">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                  </div>

                  {/* Enhanced Desktop User Menu */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <OnboardingTrigger variant="help" />
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent rounded-xl focus-ring">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="hover:bg-red-500/10 hover:text-red-600 rounded-xl focus-ring"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Enhanced Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="xl:hidden hover:bg-gold-accent/10 hover:text-gold-accent rounded-xl p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMobileMenuOpen}
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="hover:bg-gold-accent/10 hover:text-gold-accent rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-gradient-to-r from-gold-accent to-yellow-600 hover:from-yellow-600 hover:to-gold-accent text-basalt-black font-semibold rounded-xl shadow-lg">
                      Enter Temple
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Drawer Menu with Pharaonic Theme */}
      {isAuthenticated && (
        <>
          {/* Backdrop */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Mobile Drawer */}
          <div
            className={`
              fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 xl:hidden
              bg-gradient-to-b from-papyrus/95 to-desert-sand/95 backdrop-blur-lg
              border-l-2 border-gold-accent/30 shadow-2xl
              transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            <div className="h-full overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-lg border-b-2 border-gold-accent/30 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gold-accent to-yellow-600 bg-clip-text text-transparent">
                    Temple Navigation
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:bg-gold-accent/10 hover:text-gold-accent rounded-xl"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Enhanced User Info Mobile */}
                <Card className="p-4 bg-gradient-to-r from-gold-accent/10 via-yellow-500/10 to-gold-accent/10 border-2 border-gold-accent/30 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold shadow-lg border-2 border-gold-accent/30">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {user?.first_name || user?.username}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Crown className="h-3 w-3 text-gold-accent" />
                        <span className="text-sm text-muted-foreground">Pharaoh Level {user?.level || 1}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Navigation Links */}
                <div className="space-y-2">
                  {mainNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActivePath(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block"
                      >
                        <Card className={`p-4 transition-all duration-300 shadow-md relative overflow-hidden cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-gold-accent/20 to-yellow-500/20 border-2 border-gold-accent/50 shadow-lg'
                            : 'hover:bg-gold-accent/10 border border-gold-accent/20 hover:border-gold-accent/40'
                        }`}>
                          {/* Pyramid motif for active */}
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <svg className="h-4 w-4 text-gold-accent" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12,2 22,18 2,18" className="opacity-70" />
                                <polygon points="12,6 18,16 6,16" className="opacity-50" />
                              </svg>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${isActive ? 'text-gold-accent' : 'text-foreground'}`} />
                            <div>
                              <p className={`font-medium ${isActive ? 'text-gold-accent' : 'text-foreground'}`}>
                                {link.label}
                              </p>
                              <p className={`text-sm ${isActive ? 'text-gold-accent/70' : 'text-muted-foreground'}`}>
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3 pt-4 border-t-2 border-gold-accent/30">
                  <div className="flex items-center justify-between gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>

                  <Link href="/settings" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-gold-accent/30 hover:bg-gold-accent/10 hover:border-gold-accent/50 rounded-xl justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 rounded-xl justify-start"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}