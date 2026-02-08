'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  Download,
  Gem,
  ChevronDown,
  Bell,
  Search,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  category?: 'main' | 'tools' | 'resources';
}

interface NavbarProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'glass';
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const mainNavLinks: NavLink[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and analytics',
    category: 'main'
  },
  {
    href: '/assistant-full',
    label: 'AI Assistant',
    icon: Sparkles,
    description: 'Smart AI conversations',
    badge: 'New',
    category: 'tools'
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: BookOpen,
    description: 'Prompt library & manager',
    category: 'main'
  },
  {
    href: '/academy',
    label: 'Academy',
    icon: Crown,
    description: 'Learning & Tutorials',
    category: 'resources'
  },
  {
    href: '/optimization',
    label: 'Optimizer',
    icon: Zap,
    description: 'AI prompt optimization',
    badge: 'Pro',
    category: 'tools'
  },
  {
    href: '/enhanced',
    label: 'Oracle Chat',
    icon: MessageSquare,
    description: 'Live AI conversations',
    category: 'tools'
  },
  {
    href: '/rag',
    label: 'RAG',
    icon: Bot,
    description: 'Knowledge retrieval',
    category: 'tools'
  },
  {
    href: '/analysis',
    label: 'Analytics',
    icon: TrendingUp,
    description: 'Performance insights',
    category: 'main'
  },
  {
    href: '/help',
    label: 'Help',
    icon: HelpCircle,
    description: 'Documentation & support',
    category: 'resources'
  },
  {
    href: '/download',
    label: 'Download',
    icon: Download,
    description: 'Get the browser extension',
    category: 'resources'
  }
];

// ============================================================================
// TEMPLE LOGO COMPONENT - Sacred Geometric Design
// ============================================================================

const TempleLogo = ({ size = 48, animate = false }: { size?: number; animate?: boolean }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-all duration-500", animate && "animate-temple-glow")}
      >
        {/* Background Circle - Sacred Boundary */}
        <circle
          cx="50"
          cy="50"
          r="48"
          className="fill-gradient-to-br from-amber-500 to-yellow-600"
          filter="url(#temple-glow)"
        />
        
        {/* Outer Ring - Protection Circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          className="fill-none stroke-basalt-black/20"
          strokeWidth="1"
        />
        
        {/* Main Pyramid Structure - Three Tiers */}
        <g className="pyramid-main">
          {/* Base Pyramid - Foundation */}
          <path
            d="M 50 15 L 75 75 L 25 75 Z"
            className="fill-basalt-black/90"
            strokeWidth="1.5"
            stroke="url(#gold-gradient)"
          />
          
          {/* Middle Pyramid - Knowledge */}
          <path
            d="M 50 25 L 68 65 L 32 65 Z"
            className="fill-basalt-black/70"
            strokeWidth="1"
            stroke="url(#gold-gradient)"
          />
          
          {/* Inner Pyramid - Wisdom */}
          <path
            d="M 50 35 L 60 55 L 40 55 Z"
            className="fill-basalt-black/50"
            strokeWidth="0.5"
            stroke="url(#gold-gradient)"
          />
          
          {/* Capstone - All-Seeing Eye */}
          <circle
            cx="50"
            cy="25"
            r="4"
            className="fill-amber-400"
            filter="url(#eye-glow)"
          />
          
          {/* Eye Detail */}
          <circle
            cx="50"
            cy="25"
            r="2"
            className="fill-basalt-black"
          />
        </g>
        
        {/* Sacred Geometry - Bottom Pillars */}
        <g className="temple-pillars">
          {/* Left Pillar */}
          <rect
            x="28"
            y="75"
            width="6"
            height="15"
            className="fill-amber-600/80"
            rx="1"
          />
          {/* Right Pillar */}
          <rect
            x="66"
            y="75"
            width="6"
            height="15"
            className="fill-amber-600/80"
            rx="1"
          />
          {/* Foundation Line */}
          <line
            x1="25"
            y1="90"
            x2="75"
            y2="90"
            className="stroke-amber-700"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        
        {/* Sacred Symbols - Decorative Elements */}
        <g className="sacred-symbols" opacity="0.6">
          {/* Top Star */}
          <path
            d="M 50 12 L 51 14 L 49 14 Z"
            className="fill-amber-300"
          />
          
          {/* Side Ankhs - Simplified */}
          <circle cx="20" cy="50" r="2" className="fill-amber-400/50" />
          <circle cx="80" cy="50" r="2" className="fill-amber-400/50" />
        </g>
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="1" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="1" />
          </linearGradient>
          
          <filter id="temple-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <radialGradient id="sphere-gradient">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Floating Particles Animation */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full animate-float-particle-1" />
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-float-particle-2" />
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-amber-300 rounded-full animate-float-particle-3" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ENHANCED NAVIGATION LINK COMPONENT
// ============================================================================

const NavLinkItem = ({ link, isActive, onClick }: { 
  link: NavLink; 
  isActive: boolean;
  onClick?: () => void;
}) => {
  const Icon = link.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={link.href} className="group relative" onClick={onClick}>
      <Button
        variant="ghost"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "h-10 px-3 flex items-center gap-2 relative overflow-hidden transition-all duration-300 rounded-full",
          isActive
            ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20"
            : "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-foreground/70 hover:scale-105 hover:shadow-md"
        )}
      >
        {/* Active Indicator Pyramid */}
        {isActive && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 animate-pulse">
            <svg className="h-2 w-2 text-amber-600 dark:text-amber-400" viewBox="0 0 12 12" fill="currentColor">
              <polygon points="6,1 11,9 1,9" />
            </svg>
          </div>
        )}
        
        {/* Icon with Animation */}
        <Icon className={cn(
          "h-4 w-4 transition-all duration-300",
          isActive && "text-amber-600 dark:text-amber-400",
          isHovered && "scale-110 rotate-3"
        )} />
        
        {/* Label */}
        <span className="text-sm font-medium">{link.label}</span>
        
        {/* Badge */}
        {link.badge && (
          <span className={cn(
            "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
            link.badge === 'New' 
              ? "bg-emerald-500 text-white" 
              : "bg-amber-500 text-basalt-black"
          )}>
            {link.badge}
          </span>
        )}
        
        {/* Active Bottom Border */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-500" />
        )}
        
        {/* Hover Glow Effect */}
        {isHovered && !isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full" />
        )}
      </Button>
      
      {/* Enhanced Floating Tooltip */}
      <div className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 mt-3 transition-all duration-200 pointer-events-none z-50",
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}>
        <div className="bg-basalt-black/95 dark:bg-papyrus/95 text-papyrus dark:text-basalt-black text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-2xl border border-amber-500/30 backdrop-blur-sm">
          <div className="font-medium mb-0.5">{link.label}</div>
          <div className="text-amber-400/70 dark:text-amber-600/70 text-[10px]">{link.description}</div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-basalt-black/95 dark:bg-papyrus/95 rotate-45 border-l border-t border-amber-500/30" />
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// USER MENU COMPONENT
// ============================================================================

const UserMenu = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
      >
        <div className="hidden lg:block text-right">
          <p className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">
            {user?.first_name || user?.username}
          </p>
          <div className="flex items-center gap-1 justify-end">
            <Gem className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-muted-foreground">Level {user?.level || 1}</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold shadow-lg border-2 border-amber-500/50 group-hover:scale-110 group-hover:shadow-amber-500/50 transition-all duration-300">
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-background/98 backdrop-blur-xl border-2 border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold text-lg shadow-lg border-2 border-amber-500/50">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground">{user?.first_name || user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-amber-500/10">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-amber-500/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          <div className="p-2 border-t border-amber-500/20">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start rounded-xl hover:bg-red-500/10 hover:text-red-600 text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================

export function TempleNavbarPro({ className, variant = 'default' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useSuppressHydrationWarning();

  // Scroll Detection with Throttling
  useEffect(() => {
    setIsClient(true);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active Path Detection
  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Group navigation links by category
  const groupedLinks = useMemo(() => {
    return mainNavLinks.reduce((acc, link) => {
      const category = link.category || 'main';
      if (!acc[category]) acc[category] = [];
      acc[category].push(link);
      return acc;
    }, {} as Record<string, NavLink[]>);
  }, []);

  // Loading State
  if (!isClient) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 py-2 md:py-3">
        <div className="mx-2 md:mx-4 lg:mx-6 xl:mx-8 rounded-3xl shadow-lg">
          <div className="bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-xl border-2 border-amber-500/30 overflow-hidden rounded-3xl p-4">
            <div className="flex items-center justify-between h-12 animate-pulse">
              <div className="w-32 h-8 bg-muted rounded-full" />
              <div className="flex gap-2">
                <div className="w-20 h-8 bg-muted rounded-full" />
                <div className="w-20 h-8 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes temple-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.6));
          }
        }

        @keyframes float-particle-1 {
          0%, 100% { transform: translate(-50%, 0px) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -20px) scale(1.2); opacity: 1; }
        }

        @keyframes float-particle-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(-5px, -15px) scale(1.1); opacity: 0.8; }
        }

        @keyframes float-particle-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(5px, -18px) scale(1.15); opacity: 0.9; }
        }

        .animate-temple-glow {
          animation: temple-glow 3s ease-in-out infinite;
        }

        .animate-float-particle-1 {
          animation: float-particle-1 3s ease-in-out infinite;
        }

        .animate-float-particle-2 {
          animation: float-particle-2 3.5s ease-in-out infinite 0.5s;
        }

        .animate-float-particle-3 {
          animation: float-particle-3 4s ease-in-out infinite 1s;
        }

        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer-slide 2s infinite;
        }
      `}</style>

      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled ? 'py-1 md:py-2' : 'py-2 md:py-3',
        className
      )}>
        <div className={cn(
          "mx-2 md:mx-4 lg:mx-6 xl:mx-8 transition-all duration-500",
          isScrolled
            ? 'rounded-3xl shadow-2xl md:shadow-3xl scale-[0.98]'
            : 'rounded-3xl shadow-xl scale-100'
        )}>
          <div className={cn(
            "backdrop-blur-2xl border-2 transition-all duration-500 overflow-hidden rounded-3xl relative",
            variant === 'glass' 
              ? 'bg-background/80' 
              : 'bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95',
            isScrolled
              ? 'border-amber-500/50 shadow-amber-500/20'
              : 'border-amber-500/30'
          )}>
            {/* Ambient Glow Effect */}
            {isScrolled && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 pointer-events-none" />
            )}

            <div className="container mx-auto px-4 py-2 md:py-3 relative z-10">
              <div className="flex items-center justify-between h-16 md:h-20">
                {/* ========== LEFT: LOGO ========== */}
                <Link href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
                  <div className="relative transition-transform duration-500 group-hover:scale-110">
                    <TempleLogo size={isScrolled ? 40 : 48} animate={true} />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
                      Prompt Temple
                    </h1>
                    <p className="text-xs text-muted-foreground/80 tracking-wide">Sacred Sanctuary of AI</p>
                  </div>
                </Link>

                {/* ========== CENTER: DESKTOP NAVIGATION ========== */}
                {isAuthenticated && (
                  <div className="hidden xl:flex items-center gap-1" data-onboarding="main-nav">
                    {mainNavLinks.slice(0, 8).map((link) => (
                      <NavLinkItem
                        key={link.href}
                        link={link}
                        isActive={isActivePath(link.href)}
                      />
                    ))}
                  </div>
                )}

                {/* ========== RIGHT: USER MENU & ACTIONS ========== */}
                <div className="flex items-center gap-2 md:gap-3">
                  {isAuthenticated ? (
                    <>
                      {/* Quick Actions - Desktop */}
                      <div className="hidden lg:flex items-center gap-2 mr-3 border-r border-amber-500/20 pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchOpen(!searchOpen)}
                          className="hover:bg-amber-500/10 hover:text-amber-600 rounded-full transition-all duration-300"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-amber-500/10 hover:text-amber-600 rounded-full transition-all duration-300 relative"
                        >
                          <Bell className="h-4 w-4" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>

                        <OnboardingTrigger variant="help" />
                        <LanguageSwitcher />
                        <ThemeToggle />
                      </div>

                      {/* User Menu */}
                      <div className="hidden lg:block">
                        <UserMenu user={user} onLogout={logout} />
                      </div>

                      {/* Mobile Menu Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="xl:hidden hover:bg-amber-500/10 hover:text-amber-600 rounded-full p-2 transition-all duration-300"
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
                          className="hover:bg-amber-500/10 hover:text-amber-600 rounded-full transition-all duration-300"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-yellow-600 hover:to-amber-500 text-basalt-black font-semibold rounded-full shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50"
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

      {/* Spacer */}
      <div className="h-24 md:h-28 shrink-0" aria-hidden="true" />

      {/* ========== MOBILE DRAWER MENU ========== */}
      {isAuthenticated && (
        <>
          {/* Backdrop */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden animate-in fade-in duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Drawer */}
          <div className={cn(
            "fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-50 xl:hidden",
            "bg-gradient-to-b from-background/98 to-secondary/98 backdrop-blur-2xl",
            "border-l-2 border-amber-500/30 shadow-2xl shadow-amber-500/10",
            "transition-transform duration-300 ease-in-out overflow-hidden",
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}>
            <div className="h-full overflow-y-auto pb-4">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-secondary/95 via-papyrus/95 to-secondary/95 backdrop-blur-xl border-b-2 border-amber-500/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TempleLogo size={32} />
                    <h2 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                      Menu
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:bg-amber-500/10 hover:text-amber-600 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info Mobile */}
                {user && (
                  <Card className="p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-basalt-black font-bold text-lg shadow-lg border-2 border-amber-500/50">
                        {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          {user?.first_name || user?.username}
                        </p>
                        <div className="flex items-center gap-1">
                          <Gem className="h-3 w-3 text-amber-600" />
                          <span className="text-xs text-muted-foreground">Level {user?.level || 1}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Navigation Links by Category */}
              <div className="p-4 space-y-4">
                {Object.entries(groupedLinks).map(([category, links]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      {category === 'main' ? 'Main' : category === 'tools' ? 'Tools' : 'Resources'}
                    </h3>
                    <div className="space-y-1">
                      {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = isActivePath(link.href);

                        return (
                          <Link 
                            key={link.href} 
                            href={link.href} 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Card className={cn(
                              "p-3 cursor-pointer transition-all duration-300 rounded-2xl",
                              isActive
                                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20'
                                : 'hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:scale-[1.02]'
                            )}>
                              <div className="flex items-center gap-3">
                                <Icon className={cn(
                                  "h-5 w-5",
                                  isActive ? 'text-amber-600' : 'text-foreground'
                                )} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={cn(
                                      "font-medium text-sm",
                                      isActive ? 'text-amber-600' : 'text-foreground'
                                    )}>
                                      {link.label}
                                    </p>
                                    {link.badge && (
                                      <span className={cn(
                                        "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                                        link.badge === 'New' 
                                          ? "bg-emerald-500 text-white" 
                                          : "bg-amber-500 text-basalt-black"
                                      )}>
                                        {link.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className={cn(
                                    "text-xs mt-0.5",
                                    isActive ? 'text-amber-600/70' : 'text-muted-foreground'
                                  )}>
                                    {link.description}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-2 border-t-2 border-amber-500/20 mt-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-2xl justify-start transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-2xl justify-start transition-all duration-300"
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
