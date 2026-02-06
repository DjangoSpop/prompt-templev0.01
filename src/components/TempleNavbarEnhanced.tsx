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
  Activity,
  Download,
  Gem
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
    href: '/help',
    label: 'Help',
    icon: HelpCircle,
    description: 'Documentation & support'
  },
  {
    href: '/download',
    label: 'Download',
    icon: Download,
    description: 'Get the browser extension'
  }
];

export function TempleNavbarEnhanced() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePyramid, setActivePyramid] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useSuppressHydrationWarning();

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const pyramidInterval = setInterval(() => {
      setActivePyramid(true);
      setTimeout(() => setActivePyramid(false), 1000);
    }, 4000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(pyramidInterval);
    };
  }, []);

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isClient) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 py-2 md:py-3">
        <div className="mx-2 md:mx-4 lg:mx-6 xl:mx-8 rounded-3xl shadow-lg">
          <div className="bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-xl border-2 border-gold-accent/30 overflow-hidden rounded-3xl p-4">
            <div className="flex items-center justify-between h-12 animate-pulse">
              <div className="w-32 h-8 bg-muted rounded-full"></div>
              <div className="flex gap-2">
                <div className="w-20 h-8 bg-muted rounded-full"></div>
                <div className="w-20 h-8 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pharaohGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(217, 119, 6, 0.3), 0 0 30px rgba(217, 119, 6, 0.1); }
          50% { box-shadow: 0 0 25px rgba(217, 119, 6, 0.6), 0 0 40px rgba(217, 119, 6, 0.2); }
        }
        @keyframes pyramidFloat {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-6px) rotateZ(1deg); }
        }
        @keyframes shimmerWave {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes goldenPulse {
          0%, 100% { opacity: 0.6, filter: drop-shadow(0 0 8px rgba(217, 119, 6, 0.2)); }
          50% { opacity: 1, filter: drop-shadow(0 0 16px rgba(217, 119, 6, 0.5)); }
        }
        .pharaoh-glow {
          animation: pharaohGlow 3s ease-in-out infinite;
        }
        .pyramid-float {
          animation: pyramidFloat 4s ease-in-out infinite;
        }
        .golden-pulse {
          animation: goldenPulse 2s ease-in-out infinite;
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled ? 'py-1 md:py-2' : 'py-2 md:py-3'
      }`}>
        <div className={`mx-2 md:mx-4 lg:mx-6 xl:mx-8 transition-all duration-500 ${
          isScrolled
            ? 'rounded-3xl shadow-2xl md:shadow-3xl scale-[0.97]'
            : 'rounded-3xl shadow-xl scale-100'
        }`}>
          <div className={`bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-2xl border-2 transition-all duration-500 overflow-hidden rounded-3xl ${
            isScrolled
              ? 'border-gold-accent/50 pharaoh-glow'
              : 'border-gold-accent/30'
          }`}>
            <div className="container mx-auto px-4 py-2 md:py-3">
              <div className="flex items-center justify-between h-16 md:h-20">
                {/* Logo with Enhanced Pharaonic Design */}
                <Link href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
                  <div className={`relative ${activePyramid ? 'pyramid-float' : ''}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-3xl ${
                      activePyramid ? 'pharaoh-glow' : ''
                    }`}>
                      <svg className="h-5 w-5 md:h-6 md:w-6 text-basalt-black" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 22,22 2,22" />
                        <polygon points="12,6 18,18 6,18" className="opacity-70" />
                        <polygon points="12,10 14,14 10,14" className="opacity-50" />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gold-accent to-yellow-600 bg-clip-text text-transparent">
                      Prompt Temple
                    </h1>
                    <p className="text-xs text-muted-foreground/80">Sacred Sanctuary</p>
                  </div>
                </Link>

                {/* Desktop Navigation - Centered */}
                {isAuthenticated && (
                  <div className="hidden xl:flex items-center gap-1" data-onboarding="main-nav">
                    {mainNavLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = isActivePath(link.href);

                      return (
                        <Link key={link.href} href={link.href} className="group relative">
                          <Button
                            variant="ghost"
                            className={`h-10 px-3 flex items-center gap-2 relative overflow-hidden transition-all duration-300 rounded-full ${
                              isActive
                                ? 'bg-gradient-to-r from-gold-accent/20 to-yellow-500/20 text-gold-accent border border-gold-accent/40 shadow-lg pharaoh-glow'
                                : 'hover:bg-gold-accent/10 hover:text-gold-accent text-foreground/70 hover:scale-105'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                <svg className="h-2 w-2 text-gold-accent" viewBox="0 0 12 12" fill="currentColor">
                                  <polygon points="6,1 11,9 1,9" />
                                </svg>
                              </div>
                            )}
                            <Icon className={`h-4 w-4 ${isActive ? 'text-gold-accent' : ''}`} />
                            <span className="text-sm font-medium">{link.label}</span>
                            {isActive && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-accent to-yellow-500"></div>
                            )}
                          </Button>
                          
                          {/* Floating Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                            <div className="bg-basalt-black/95 text-papyrus text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl border border-gold-accent/30 backdrop-blur-sm">
                              {link.description}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-basalt-black/95 rotate-45 border-l border-t border-gold-accent/30"></div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* User Menu & Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                  {isAuthenticated ? (
                    <>
                      {/* User Info - Desktop */}
                      {user && (
                        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-gold-accent/20">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {user?.first_name || user?.username}
                            </p>
                            <div className="flex items-center gap-1">
                              <Gem className="h-3 w-3 text-gold-accent" />
                              <span className="text-xs text-muted-foreground">Level {user?.level || 1}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold shadow-lg border-2 border-gold-accent/50 group hover:scale-110 transition-all duration-300">
                            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="hidden lg:flex items-center gap-2">
                        <OnboardingTrigger variant="help" />
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <Link href="/settings">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-gold-accent/10 hover:text-gold-accent rounded-full transition-all duration-300"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={logout}
                          className="hover:bg-red-500/10 hover:text-red-600 rounded-full transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Mobile Menu Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="xl:hidden hover:bg-gold-accent/10 hover:text-gold-accent rounded-full p-2 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                      >
                        {isMobileMenuOpen ? (
                          <X className="h-5 w-5" />
                        ) : (
                          <Menu className="h-5 w-5" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/auth/login">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gold-accent/10 hover:text-gold-accent rounded-full transition-all duration-300"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-gold-accent to-yellow-600 hover:from-yellow-600 hover:to-gold-accent text-basalt-black font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          Enter Temple
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className={`transition-all duration-300 ${
        isScrolled ? 'h-20 md:h-24' : 'h-24 md:h-28'
      }`} aria-hidden="true" />

      {/* Mobile Drawer Menu */}
      {isAuthenticated && (
        <>
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <div className={`
            fixed top-24 right-0 h-[calc(100vh-6rem)] w-72 max-w-[90vw] z-50 xl:hidden
            bg-gradient-to-b from-papyrus/98 to-desert-sand/98 backdrop-blur-2xl
            border-l-2 border-gold-accent/30 shadow-2xl rounded-l-3xl
            transition-transform duration-300 ease-in-out overflow-hidden
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="h-full overflow-y-auto pb-4">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-xl border-b-2 border-gold-accent/30 p-4 rounded-bl-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gold-accent to-yellow-600 bg-clip-text text-transparent">
                    Navigation
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:bg-gold-accent/10 hover:text-gold-accent rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info Mobile */}
                {user && (
                  <Card className="p-3 bg-gradient-to-r from-gold-accent/10 to-yellow-500/10 border-2 border-gold-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold shadow-lg border-2 border-gold-accent/50">
                        {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {user?.first_name || user?.username}
                        </p>
                        <div className="flex items-center gap-1">
                          <Gem className="h-3 w-3 text-gold-accent" />
                          <span className="text-xs text-muted-foreground">Level {user?.level || 1}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                {mainNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActivePath(link.href);

                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <Card className={`p-3 cursor-pointer transition-all duration-300 rounded-2xl ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-accent/20 to-yellow-500/20 border-2 border-gold-accent/50 shadow-lg pharaoh-glow'
                          : 'hover:bg-gold-accent/10 border border-gold-accent/20 hover:border-gold-accent/40 hover:scale-105'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isActive ? 'text-gold-accent golden-pulse' : 'text-foreground'}`} />
                          <div>
                            <p className={`font-medium text-sm ${isActive ? 'text-gold-accent' : 'text-foreground'}`}>
                              {link.label}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-gold-accent/70' : 'text-muted-foreground'}`}>
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-2 border-t-2 border-gold-accent/20 mt-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-gold-accent/30 hover:bg-gold-accent/10 hover:border-gold-accent/50 rounded-2xl justify-start transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full hover:bg-red-500/10 hover:text-red-600 hover:border-red-300 rounded-2xl justify-start transition-all duration-300"
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
        </>
      )}
    </>
  );
}
