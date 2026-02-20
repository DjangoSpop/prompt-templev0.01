'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Globe,
  HelpCircle,
  History,
  Home,
  Library,
  Menu,
  MessageSquare,
  Sparkles,
  TrendingUp,
  X,
  Zap,
  Settings,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Eyehorus from '../pharaonic/Eyehorus';

// Navigation items configuration
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  category: 'main' | 'tools' | 'resources' | 'settings';
}

const navigationItems: NavItem[] = [
  // Main
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and analytics',
    category: 'main',
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: BookOpen,
    description: 'Prompt library',
    category: 'main',
  },
  {
    id: 'prompt-library',
    label: 'Prompt Library',
    href: '/prompt-library',
    icon: Library,
    description: 'Save & iterate prompts',
    badge: 'New',
    category: 'main',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analysis',
    icon: TrendingUp,
    description: 'Performance insights',
    category: 'main',
  },
  {
    id: 'history',
    label: 'History',
    href: '/history',
    icon: History,
    description: 'Past chat sessions',
    category: 'main',
  },
  {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    icon: Globe,
    description: 'Community prompts',
    category: 'main',
  },
  // Tools
  {
    id: 'assistant',
    label: 'AI Assistant',
    href: '/assistant-full',
    icon: Sparkles,
    description: 'Smart AI conversations',
    badge: 'New',
    category: 'tools',
  },
  {
    id: 'optimizer',
    label: 'Optimizer',
    href: '/optimization',
    icon: Zap,
    description: 'AI prompt optimization',
    badge: 'Pro',
    category: 'tools',
  },
  {
    id: 'threads',
    label: 'Conversations',
    href: '/threads',
    icon: MessageSquare,
    description: 'Your AI conversation threads',
    category: 'tools',
  },
  {
    id: 'oracle',
    label: 'Oracle Chat',
    href: '/enhanced',
    icon: MessageSquare,
    description: 'Live AI conversations',
    category: 'tools',
  },
  {
    id: 'rag',
    label: 'RAG',
    href: '/rag',
    icon: Bot,
    description: 'Knowledge retrieval',
    category: 'tools',
  },
  // Resources
  {
    id: 'academy',
    label: 'Academy',
    href: '/academy',
    icon: Crown,
    description: 'Learning & Tutorials',
    category: 'resources',
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Documentation',
    category: 'resources',
  },
  {
    id: 'download',
    label: 'Download',
    href: '/download',
    icon: Download,
    description: 'Browser extension',
    category: 'resources',
  },
];

const settingsItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration',
    category: 'settings',
  },
];

// Category labels
const categoryLabels: Record<string, string> = {
  main: 'Main',
  tools: 'Tools',
  resources: 'Resources',
  settings: 'Settings',
};

// Group items by category
const groupedItems = {
  main: navigationItems.filter((item) => item.category === 'main'),
  tools: navigationItems.filter((item) => item.category === 'tools'),
  resources: navigationItems.filter((item) => item.category === 'resources'),
};

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapsed, isOpen, close } = useSidebarStore();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Render nothing on server to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col',
          'bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-black',
          'border-r border-royal-gold-500/20',
          'transition-all duration-300 ease-in-out',
          sidebarWidth,
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-royal-gold-500/20 px-4 bg-gradient-to-r from-obsidian-950/50 to-obsidian-900/30">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                {/* Animated glow ring */}
                <div className="absolute inset-0 rounded-full bg-royal-gold-500/20 blur-xl animate-pulse" />

                {/* Eye of Horus */}
                <div className="relative">
                  <Eyehorus
                    size={48}
                    variant="sidebar"
                    glow={true}
                    glowIntensity="high"
                    showLabel={false}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold bg-gradient-to-r from-royal-gold-300 via-royal-gold-400 to-royal-gold-300 bg-clip-text text-transparent">
                  PromptTemple
                </span>
                <span className="text-[10px] text-desert-sand-400 tracking-wider uppercase">
                  Sacred Prompts
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/" className="flex items-center justify-center mx-auto">
                  <div className="relative flex items-center justify-center">
                    {/* Animated glow ring */}
                    <div className="absolute inset-0 rounded-full bg-royal-gold-500/20 blur-lg animate-pulse" />

                    {/* Eye of Horus */}
                    <div className="relative">
                      <Eyehorus
                        size={42}
                        variant="sidebar-collapsed"
                        glow={true}
                        glowIntensity="medium"
                        showLabel={false}
                      />
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-royal-gold-500/30 bg-obsidian-900 text-desert-sand-100"
              >
                <div className="flex flex-col items-center">
                  <span className="font-serif font-bold text-royal-gold-300">PromptTemple</span>
                  <span className="text-xs text-desert-sand-400">Sacred Prompts</span>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-desert-sand-300 hover:text-royal-gold-400 hover:bg-royal-gold-500/10"
            onClick={close}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              {/* Category Label */}
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-desert-sand-500">
                  {categoryLabels[category]}
                </h3>
              )}

              {/* Items */}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  const linkContent = (
                    <Link
                      href={item.href}
                      onClick={() => window.innerWidth < 1024 && close()}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                        active
                          ? 'bg-gradient-to-r from-royal-gold-500/20 to-royal-gold-500/10 text-royal-gold-300 shadow-md shadow-royal-gold-500/10'
                          : 'text-desert-sand-300 hover:bg-obsidian-800/50 hover:text-royal-gold-300',
                        isCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-transform',
                          active && 'text-royal-gold-400',
                          'group-hover:scale-110'
                        )}
                      />

                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                item.badge === 'New'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-royal-gold-500/20 text-royal-gold-400'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-royal-gold-400" />
                      )}
                    </Link>
                  );

                  // Wrap in tooltip when collapsed
                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div className="relative">{linkContent}</div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="border-royal-gold-500/30 bg-obsidian-900 text-desert-sand-100"
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-xs text-royal-gold-400">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-desert-sand-400">
                              {item.description}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <div key={item.id} className="relative">
                      {linkContent}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-royal-gold-500/20 p-3">
          {/* User Profile Section */}
          {isAuthenticated && user && !isCollapsed && (
            <div className="mb-3 rounded-lg bg-gradient-to-r from-royal-gold-500/10 to-royal-gold-500/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 shadow-lg">
                  <User className="h-5 w-5 text-obsidian-950" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-royal-gold-300">
                    {user.username || user.email || 'User'}
                  </p>
                  {user.email && (
                    <p className="truncate text-xs text-desert-sand-400">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar */}
          {isAuthenticated && user && isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 shadow-lg mx-auto">
                  <User className="h-5 w-5 text-obsidian-950" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-royal-gold-500/30 bg-obsidian-900 text-desert-sand-100"
              >
                <div>
                  <p className="font-semibold">{user.username || user.email}</p>
                  {user.email && (
                    <p className="text-xs text-desert-sand-400">{user.email}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Settings */}
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-royal-gold-500/20 to-royal-gold-500/10 text-royal-gold-300'
                        : 'text-desert-sand-300 hover:bg-obsidian-800/50 hover:text-royal-gold-300',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent
                    side="right"
                    className="border-royal-gold-500/30 bg-obsidian-900 text-desert-sand-100"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* Sign In/Out Button */}
          <Separator className="my-3 bg-royal-gold-500/20" />

          {isAuthenticated ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className={cn(
                    'w-full text-desert-sand-300 hover:text-red-400 hover:bg-red-500/10',
                    isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3'
                  )}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>Sign Out</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className="border-red-500/30 bg-obsidian-900 text-desert-sand-100"
                >
                  Sign Out
                </TooltipContent>
              )}
            </Tooltip>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignIn}
                  className={cn(
                    'w-full text-desert-sand-300 hover:text-emerald-400 hover:bg-emerald-500/10',
                    isCollapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3'
                  )}
                >
                  <LogIn className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>Sign In</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className="border-emerald-500/30 bg-obsidian-900 text-desert-sand-100"
                >
                  Sign In
                </TooltipContent>
              )}
            </Tooltip>
          )}

          <Separator className="my-3 bg-royal-gold-500/20" />

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={cn(
              'w-full justify-center text-desert-sand-400 hover:text-royal-gold-400 hover:bg-royal-gold-500/10',
              isCollapsed && 'px-2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}

// Mobile toggle button component
export function SidebarToggle({ className }: { className?: string }) {
  const { toggle, isOpen } = useSidebarStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn(
        'lg:hidden text-desert-sand-300 hover:text-royal-gold-400 hover:bg-royal-gold-500/10',
        className
      )}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );
}

export default AppSidebar;
