'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Library,
  Zap,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Crown,
  Home,
  Sparkles,
  BookOpen,
  Flame
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  description?: string;
  color?: string;
}

const mainItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    description: 'Return to Temple',
    color: 'from-blue-500 to-blue-400'
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: Bot,
    path: '/assistant',
    description: 'AI Conversations',
    color: 'from-purple-500 to-purple-400'
  },
  {
    id: 'academy',
    label: 'Academy',
    icon: GraduationCap,
    path: '/academy',
    badge: 'NEW',
    description: 'Master Prompt Engineering',
    color: 'from-emerald-500 to-emerald-400'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Library,
    path: '/template-manager',
    description: 'Template Management',
    color: 'from-orange-500 to-orange-400'
  },
  {
    id: 'orchestrate',
    label: 'Orchestrate',
    icon: Zap,
    path: '/orchestrate',
    description: 'Automation & Workflows',
    color: 'from-yellow-500 to-yellow-400'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    description: 'Insights & Metrics',
    color: 'from-rose-500 to-rose-400'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    description: 'Configuration',
    color: 'from-slate-500 to-slate-400'
  },
];

export default function EgyptianSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved));
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('sidebar-expanded', JSON.stringify(newState));
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const shouldShowText = isExpanded || isHovered;

  return (
    <>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-royal-gold-400 to-transparent opacity-50" />

      {/* Main Sidebar */}
      <div
        className="h-full bg-gradient-to-b from-obsidian-900 to-obsidian-950 flex flex-col transition-all duration-300 ease-in-out relative"
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-royal-gold-500/20 bg-gradient-to-r from-obsidian-800/50 to-obsidian-900/50">
          <div className={`flex items-center space-x-2 transition-all duration-300 overflow-hidden ${shouldShowText ? 'w-full' : 'w-0'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-royal-gold-500/50">
              <Crown className="w-5 h-5 text-obsidian-950" />
            </div>
            <h1 className="text-white font-bold text-base whitespace-nowrap">PromptTemple</h1>
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleExpanded}
            className="p-2 rounded-lg hover:bg-royal-gold-500/20 text-royal-gold-400 transition-all duration-200 ml-auto"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-hide">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);
            
            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group/item relative min-h-12 ${
                    isItemActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/40`
                      : 'text-desert-sand-300 hover:bg-obsidian-800/50 hover:text-royal-gold-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isItemActive ? 'animate-pulse' : ''}`} />
                  
                  <span
                    className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                      shouldShowText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.badge && shouldShowText && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full animate-pulse text-xs">
                      {item.badge}
                    </span>
                  )}

                  {isItemActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-lg shadow-lg" />
                  )}
                </Link>

                {/* Tooltip */}
                {!shouldShowText && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-obsidian-950 text-desert-sand-100 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-royal-gold-500/30 z-50">
                    {item.label}
                    {item.badge && <span className="ml-2 text-xs text-emerald-400">{item.badge}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Premium Section */}
        {shouldShowText && (
          <div className="border-t border-royal-gold-500/20 p-4 bg-gradient-to-t from-obsidian-950 to-transparent">
            <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-royal-gold-500 to-royal-gold-400 text-obsidian-950 font-semibold hover:shadow-lg hover:shadow-royal-gold-500/50 transition-all duration-200 flex items-center justify-center space-x-2 group">
              <Sparkles className="w-4 h-4" />
              <span>Go Premium</span>
            </button>
            <p className="text-xs text-desert-sand-400 text-center mt-3">
              Unlock advanced features
            </p>
          </div>
        )}
      </div>

      {/* Mobile Menu Icon (shown on small screens when not expanded) */}
      {!shouldShowText && (
        <button
        title='MObile Menu'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:hidden p-2 rounded-lg bg-royal-gold-500/20 hover:bg-royal-gold-500/40 text-royal-gold-400 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}

// Helper icon - BarChart4 (not in lucide by default)
const BarChart4 = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
