'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
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
  ChevronRight,
  Search,
  Command,
  Bell,
  User,
  Layers,
  ScrollText, // Added for Academy
  Pyramid // Using a custom shape or general icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// --- Types & Interfaces ---

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  priority: 'primary' | 'secondary' | 'utility';
  isHighlighted?: boolean; // For Academy
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

// --- Navigation Configuration ---

const navigationGroups: NavGroup[] = [
  {
    label: 'Core',
    links: [
      {
        href: '/',
        label: 'Dashboard',
        icon: BarChart3,
        description: 'Overview and analytics',
        priority: 'primary'
      },
      {
        href: '/assistant-full',
        label: 'AI Assistant',
        icon: Sparkles,
        description: 'Smart AI conversations',
        badge: 'New',
        priority: 'primary'
      },
      {
        href: '/templates',
        label: 'Templates',
        icon: BookOpen,
        description: 'Prompt library & manager',
        priority: 'primary'
      }
    ]
  },
  {
    label: 'Knowledge', // Renamed from Resources for Ancient feel
    links: [
      {
        href: '/academy',
        label: 'The Academy',
        icon: ScrollText,
        description: 'Master the art of prompting',
        priority: 'primary',
        isHighlighted: true // Special flag for styling
      },
      {
        href: '/optimization',
        label: 'Optimizer',
        icon: Zap,
        description: 'AI prompt optimization',
        priority: 'secondary'
      },
      {
        href: '/enhanced',
        label: 'Oracle Chat',
        icon: MessageSquare,
        description: 'Live AI conversations',
        priority: 'secondary'
      },
      {
        href: '/rag',
        label: 'RAG',
        icon: Bot,
        description: 'Knowledge retrieval',
        priority: 'secondary'
      }
    ]
  },
  {
    label: 'System',
    links: [
      {
        href: '/analysis',
        label: 'Analytics',
        icon: TrendingUp,
        description: 'Performance insights',
        priority: 'secondary'
      },
      {
        href: '/help',
        label: 'Help',
        icon: HelpCircle,
        description: 'Documentation & support',
        priority: 'utility'
      },
      {
        href: '/download',
        label: 'Download',
        icon: Download,
        description: 'Get the browser extension',
        priority: 'utility'
      }
    ]
  }
];

const allNavLinks = navigationGroups.flatMap(g => g.links);

// --- Components ---

/**
 * PharaohSigil - The Professional Pharaonic Logo
 * Features: Pyramids, Benben Stone, Eye of Horus, Rotating Sun Rays
 */
const PharaohSigil = ({ className, active = false }: { className?: string; active?: boolean }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Rotating Sun Rays (Background) */}
      <motion.div
        className="absolute inset-0 text-amber-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d="M50 50 L50 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${i * 45} 50 50)`}
            />
          ))}
        </svg>
      </motion.div>

      {/* Main Sigil SVG */}
      <motion.svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" /> {/* Amber 300 */}
            <stop offset="50%" stopColor="#F59E0B" /> {/* Amber 500 */}
            <stop offset="100%" stopColor="#B45309" /> {/* Amber 700 */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* The Great Pyramid Base */}
        <path d="M24 14 L40 40 H8 L24 14Z" fill="url(#goldGrad)" stroke="#78350F" strokeWidth="0.5" />
        
        {/* Inner Detail Lines (Bricks) */}
        <path d="M24 22 L34 38" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />
        <path d="M24 22 L14 38" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />
        <path d="M24 30 L24 38" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />

        {/* The Floating Benben Stone (Capstone) */}
        <motion.path
          d="M24 4 L32 14 H16 L24 4Z"
          fill="#FEF3C7"
          stroke="#F59E0B"
          strokeWidth="1"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Eye of Horus / Ra (Center) */}
        <g transform="translate(24, 26)">
          {/* Eye Shape */}
          <path d="M-6 0 Q0 -6 6 0 Q0 6 -6 0 Z" fill="#1C1917" />
          {/* Pupil */}
          <motion.circle
            cx="0"
            cy="0"
            r="2"
            fill="#FCD34D"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Eyebrow (Royal) */}
          <path d="M-7 -3 Q0 -6 7 -3" stroke="#F59E0B" strokeWidth="0.5" fill="none" />
        </g>
      </motion.svg>
    </div>
  );
};

/**
 * NavItem - Enhanced with Academy Highlighting
 */
const NavItem = ({
  link,
  isActive,
  onHover,
  hoveredPath,
  layoutId
}: {
  link: NavLink;
  isActive: boolean;
  onHover: (path: string | null) => void;
  hoveredPath: string | null;
  layoutId: string;
}) => {
  const Icon = link.icon;
  
  // Special styling for The Academy
  if (link.isHighlighted) {
    return (
      <Link
        href={link.href}
        className="relative group"
        onMouseEnter={() => onHover(link.href)}
        onMouseLeave={() => onHover(null)}
      >
        <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <ScrollText className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide">{link.label}</span>
        </div>
        {isActive && (
          <motion.div
            layoutId={`${layoutId}-active`}
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 shadow-[0_0_8px_#F59E0B]"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    );
  }

  // Standard Item
  return (
    <Link
      href={link.href}
      className="relative px-3 py-2 rounded-full group"
      onMouseEnter={() => onHover(link.href)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="relative z-10 flex items-center gap-2">
        <Icon className={cn(
          "h-4 w-4 transition-colors duration-200",
          isActive ? "text-amber-600 dark:text-amber-400" : "text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100"
        )} />
        <span className={cn(
          "text-sm font-medium transition-colors duration-200 hidden lg:inline-block",
          isActive ? "text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100"
        )}>
          {link.label}
        </span>
        {link.badge && (
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
      </div>
      
      <AnimatePresence>
        {(hoveredPath === link.href || isActive) && (
          <motion.div
            layoutId={layoutId}
            className={cn(
              "absolute inset-0 rounded-full",
              isActive 
                ? "bg-amber-100/80 dark:bg-amber-900/30" 
                : "bg-stone-100 dark:bg-stone-800"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              bounce: 0.2,
              stiffness: 130,
              damping: 15,
            }}
          />
        )}
      </AnimatePresence>
    </Link>
  );
};

/**
 * CommandPaletteTrigger - Search Button
 */
const CommandPaletteTrigger = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 bg-stone-100/50 dark:bg-stone-800/50 rounded-full border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-amber-500/30 transition-all duration-300"
  >
    <Search className="h-3.5 w-3.5 text-stone-400" />
    <span className="hidden lg:inline">Search Oracle...</span>
    <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono text-stone-400 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700">
      <Command className="h-3 w-3" />
      <span>K</span>
    </kbd>
  </button>
);

/**
 * UserMenu - Profile Dropdown
 */
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
        className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-200"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
            {user?.first_name || user?.username}
          </p>
          <div className="flex items-center gap-1 justify-end">
            <Gem className="h-3 w-3 text-amber-500 fill-amber-500/20" />
            <span className="text-xs text-stone-500 font-mono">LVL {user?.level || 1}</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-stone-900 transition-transform hover:scale-105">
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-stone-900 rounded-full animate-pulse"></div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
              <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                 <Crown className="h-3 w-3 text-amber-500" />
                 <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Temple Scribe</p>
              </div>
            </div>
            <div className="p-2">
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-400 rounded-xl transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-400 rounded-xl transition-colors">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </div>
            <div className="p-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * MobileMenu
 */
const MobileMenu = ({
  isOpen,
  onClose,
  links,
  pathname,
  user,
  onLogout
}: {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  pathname: string;
  user: any;
  onLogout: () => void;
}) => {
  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'tween',
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1] // Custom ease for premium feel
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-stone-50 dark:bg-stone-950 z-50 shadow-2xl lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-stone-900 dark:text-stone-100 font-serif">{user?.first_name || user?.username}</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Scribe Level {user?.level || 1}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-stone-500" />
                </button>
              </div>
              
              {/* Featured: The Academy Card */}
              <Link href="/academy" onClick={onClose} className="block group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 p-4">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ScrollText className="h-16 w-16 text-amber-600" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Featured</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">The Academy</h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">Master the ancient art of prompting.</p>
                 </div>
              </Link>
            </div>
            
            {/* Scrollable Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navigationGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 font-serif">{group.label}</p>
                  <div className="space-y-1">
                    {group.links.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                      
                      // Skip Academy link here as it's featured above
                      if(link.isHighlighted) return null;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100"
                              : "text-stone-600 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-900 hover:shadow-sm"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg", isActive ? "bg-amber-200/50" : "bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-200 dark:group-hover:bg-stone-700")}>
                            <Icon className={cn("h-4 w-4", isActive ? "text-amber-700" : "text-stone-500")} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{link.label}</p>
                          </div>
                          {isActive && <ChevronRight className="h-4 w-4 text-amber-600" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => { onLogout(); onClose(); }} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                   <LogOut className="h-4 w-4 mr-2" /> Sign Out
                 </Button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Main Navbar Component
 */
export function TempleNavbarEnhanced() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [activePyramid, setActivePyramid] = useState(false);
  
  const { scrollY } = useScroll();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  
  // Scroll Logic: Hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.1, 1], [0, -20, -20]); // subtle parallax
  const scale = useSpring(useTransform(scrollY, [0, 100], [1, 0.95]), { stiffness: 300, damping: 30 });
  const opacity = useTransform(scrollY, [0, 50], [1, 0.95]); // slight fade on scroll
  
  useSuppressHydrationWarning();
  
  useEffect(() => {
    setIsClient(true);
    
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScroll = currentScroll;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const pyramidInterval = setInterval(() => {
      setActivePyramid(true);
      setTimeout(() => setActivePyramid(false), 2000);
    }, 6000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(pyramidInterval);
    };
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  const isActivePath = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);
  
  const primaryLinks = allNavLinks.filter(l => l.priority === 'primary' && !l.isHighlighted);
  const academyLink = allNavLinks.find(l => l.isHighlighted);
  const secondaryLinks = allNavLinks.filter(l => l.priority === 'secondary' && !l.isHighlighted);
  
  if (!isClient) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800" />
    );
  }
  
  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none" // pointer-events-none allows clicking through the padding
        initial={{ y: -100 }}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="mx-auto max-w-7xl pointer-events-auto">
          <motion.nav
            style={{ scale, opacity }}
            className={cn(
              "relative rounded-3xl border transition-all duration-500",
              scrollY.get() > 20
                ? "bg-white/90 dark:bg-stone-950/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-stone-200/50 dark:border-stone-800/50 py-2"
                : "bg-white/70 dark:bg-stone-950/70 backdrop-blur-xl border-stone-200/30 dark:border-stone-800/30 py-3 shadow-lg"
            )}
          >
            <div className="flex items-center justify-between px-4">
              {/* Logo Section */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3 group">
                  <PharaohSigil 
                    className="w-10 h-10" 
                    active={activePyramid} 
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent font-serif tracking-tight">
                      Prompt Temple
                    </h1>
                    <motion.p 
                       className="text-[10px] text-stone-500 font-medium tracking-[0.2em] uppercase"
                       initial={{ opacity: 0.6 }}
                       animate={{ opacity: 1 }}
                       transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                        Sacred Sanctuary
                    </motion.p>
                  </div>
                </Link>
                
                {/* Desktop Navigation */}
                {isAuthenticated && (
                  <div className="hidden lg:flex items-center gap-1">
                    {primaryLinks.map((link) => (
                      <NavItem
                        key={link.href}
                        link={link}
                        isActive={isActivePath(link.href)}
                        onHover={setHoveredPath}
                        hoveredPath={hoveredPath}
                        layoutId="primary-nav"
                      />
                    ))}
                    
                    {/* The Academy - Highlighted */}
                    {academyLink && (
                      <NavItem
                        key={academyLink.href}
                        link={academyLink}
                        isActive={isActivePath(academyLink.href)}
                        onHover={setHoveredPath}
                        hoveredPath={hoveredPath}
                        layoutId="academy-nav"
                      />
                    )}

                    {/* More Dropdown */}
                    <div className="relative group ml-2">
                      <button className="relative px-3 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                        <Layers className="h-4 w-4" />
                        <span className="hidden xl:inline">Tools</span>
                        <ChevronRight className="h-3 w-3 rotate-90 transition-transform group-hover:rotate-180" />
                      </button>
                      
                      <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2">
                          {secondaryLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = isActivePath(link.href);
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                                  isActive
                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100"
                                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                                )}
                              >
                                <Icon className={cn("h-4 w-4", isActive ? "text-amber-600" : "text-stone-500")} />
                                <span className="flex-1">{link.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                {isAuthenticated ? (
                  <>
                    <CommandPaletteTrigger onClick={() => {}} />
                    
                    <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 hidden md:block" />
                    
                    <button className="relative p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-full transition-colors hidden md:block hover:bg-stone-100 dark:hover:bg-stone-800">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-stone-950"></span>
                    </button>
                    
                    <div className="hidden md:block">
                      <UserMenu user={user} onLogout={logout} />
                    </div>
                    
                    {/* Mobile Toggle */}
                    <button
                    title='setMobile open'
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="lg:hidden p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/auth/login"
                      className="hidden sm:block text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link href="/auth/register">
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-semibold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 border border-amber-400/20"
                      >
                        Enter Temple
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        </div>
      </motion.header>
      
      {/* Spacer */}
      <div className="h-24" />
      
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={allNavLinks}
        pathname={pathname}
        user={user}
        onLogout={logout}
      />
    </>
  );
}