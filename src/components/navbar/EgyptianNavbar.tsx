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
  Menu,
  X,
  GraduationCap,
  Home,
  ChevronDown,
  Sparkles,
  Crown,
  Wand2
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  description?: string;
}

const mainNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Temple',
    icon: <Home className="w-5 h-5" />,
    path: '/',
    description: 'Home'
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: <Bot className="w-5 h-5" />,
    path: '/assistant',
    description: 'AI Conversations'
  },
  {
    id: 'academy',
    label: 'Academy',
    icon: <GraduationCap className="w-5 h-5" />,
    path: '/academy',
    badge: 'NEW',
    description: 'Learn Prompt Engineering'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <Library className="w-5 h-5" />,
    path: '/template-manager',
    description: 'Manage Templates'
  },
  {
    id: 'orchestrate',
    label: 'Orchestrate',
    icon: <Zap className="w-5 h-5" />,
    path: '/orchestrate',
    description: 'Automate Workflows'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/analytics',
    description: 'View Insights'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
    description: 'Configure'
  },
];

export default function EgyptianNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Egyptian-themed Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gradient-to-r from-obsidian-900/95 via-obsidian-800/95 to-obsidian-900/95 shadow-lg shadow-royal-gold-500/20 backdrop-blur-md'
            : 'bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950'
        }`}
      >
        {/* Top decorative border with Egyptian pattern */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-gold-500 via-royal-gold-400 to-royal-gold-500 opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Egyptian styling */}
            <Link href="/" className="flex items-center space-x-3 group hover:opacity-80 transition-opacity">
              <div className="relative">
                {/* Pharaoh Crown SVG Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 rounded-lg flex items-center justify-center shadow-lg shadow-royal-gold-500/50 group-hover:shadow-royal-gold-500/80 transition-all">
                  <Crown className="w-6 h-6 text-obsidian-950" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-royal-gold-400 rounded-lg opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-royal-gold-400 to-royal-gold-300 bg-clip-text text-transparent">
                  PromptTemple
                </span>
                <span className="text-xs text-desert-sand-300 tracking-widest uppercase">Academy</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {mainNavItems.map((item) => (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${
                      isActive(item.path)
                        ? 'bg-royal-gold-500/20 text-royal-gold-300 shadow-lg shadow-royal-gold-500/30'
                        : 'text-desert-sand-200 hover:text-royal-gold-300 hover:bg-obsidian-700/50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 text-obsidian-950 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {isActive(item.path) && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-royal-gold-400 to-transparent" />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-royal-gold-400 rounded-full animate-bounce" />
                      </>
                    )}
                  </Link>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-obsidian-950 text-desert-sand-100 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-royal-gold-500/30 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-obsidian-950">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-royal-gold-500 to-royal-gold-400 text-obsidian-950 font-semibold hover:shadow-lg hover:shadow-royal-gold-500/50 transition-all duration-200 flex items-center space-x-2 group">
                <Wand2 className="w-4 h-4" />
                <span>Upgrade</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-desert-sand-200 hover:bg-obsidian-700/50 hover:text-royal-gold-300 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-royal-gold-500/20 bg-gradient-to-b from-obsidian-800 to-obsidian-900 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-royal-gold-500/20 text-royal-gold-300 border border-royal-gold-500/30'
                      : 'text-desert-sand-200 hover:bg-obsidian-700/50 hover:text-royal-gold-300'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-desert-sand-400">{item.description}</div>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 text-obsidian-950 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <button className="w-full mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-royal-gold-500 to-royal-gold-400 text-obsidian-950 font-semibold hover:shadow-lg hover:shadow-royal-gold-500/50 transition-all duration-200">
                Upgrade Plan
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
