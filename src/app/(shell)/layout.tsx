'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Library,
  Zap,
  BarChart3,
  Settings,
  Hash,
  Star,
  TrendingUp,
  User,
  Target,
  History,
  PieChart,
  Users,
  BarChart2,
  Settings2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Bot,
  Menu,
  X
} from 'lucide-react';

// Server list icons
const serverIcons = [
  { id: 'assistant', icon: Bot, label: 'AI Assistant', path: '/assistant' },
  { id: 'template-manager', icon: Library, label: 'Template Manager', path: '/template-manager' },
  { id: 'orchestrate', icon: Zap, label: 'Orchestrate', path: '/orchestrate' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

// Channel mappings for each server
const channelMappings = {
  assistant: [
    { id: 'conversations', icon: Hash, label: 'Conversations', path: '/assistant' },
  ],
  'template-manager': [
    { id: 'categories', icon: Hash, label: 'Categories', path: '/template-manager' },
    { id: 'featured', icon: Star, label: 'Featured', path: '/template-manager/featured' },
    { id: 'trending', icon: TrendingUp, label: 'Trending', path: '/template-manager/trending' },
    { id: 'my-templates', icon: User, label: 'My Templates', path: '/template-manager/my-templates' },
  ],
  orchestrate: [
    { id: 'intents', icon: Target, label: 'Intents', path: '/orchestrate' },
    { id: 'recent-sessions', icon: History, label: 'Recent Sessions', path: '/orchestrate/sessions' },
  ],
  analytics: [
    { id: 'overview', icon: PieChart, label: 'Overview', path: '/analytics' },
    { id: 'user-insights', icon: Users, label: 'User Insights', path: '/analytics/insights' },
    { id: 'template-analytics', icon: BarChart2, label: 'Template Analytics', path: '/analytics/templates' },
  ],
  settings: [
    { id: 'general', icon: Settings2, label: 'General', path: '/settings' },
    { id: 'quotas', icon: CreditCard, label: 'Quotas & Usage', path: '/settings/quotas' },
  ],
};

interface ShellLayoutProps {
  children: ReactNode;
}

export default function ShellLayout({ children }: ShellLayoutProps) {
  const pathname = usePathname();
  const [currentServer, setCurrentServer] = useState(() => {
    const pathSegment = pathname.split('/')[1];
    return serverIcons.find(s => s.id === pathSegment)?.id || 'assistant';
  });

  // Expandable sidebar state with localStorage persistence
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load expansion state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved));
    }
  }, []);

  // Save expansion state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('sidebar-expanded', JSON.stringify(newState));
  };

  const shouldShowText = isExpanded || isHovered;
  const sidebarWidth = shouldShowText ? 'w-60' : 'w-16';

  const currentChannels = channelMappings[currentServer as keyof typeof channelMappings] || [];

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-bg-primary text-text-primary rounded-lg shadow-lg border border-border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Left Rail - Server List */}
      <div className={`
        w-[72px] bg-bg-tertiary flex flex-col items-center py-3 space-y-2
        fixed left-0 top-0 h-full z-50 border-r border-gray-200
        transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {serverIcons.map((server) => {
          const isActive = currentServer === server.id;
          const Icon = server.icon;
          
          return (
            <Link
              key={server.id}
              href={server.path}
              onClick={() => setCurrentServer(server.id)}
              className={`
                relative group w-12 h-12 rounded-3xl transition-all duration-200
                flex items-center justify-center min-h-[48px] min-w-[48px]
                ${isActive
                  ? 'bg-brand rounded-2xl text-white'
                  : 'bg-bg-primary hover:bg-brand hover:rounded-2xl text-text-secondary hover:text-white'
                }
              `}
              onClick={() => setMobileMenuOpen(false)}
              title={server.label}
            >
              <Icon className="w-6 h-6" />
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-lg" />
              )}
              
              {/* Hover tooltip */}
              <div className="absolute left-16 px-3 py-2 bg-bg-floating text-text-primary text-sm rounded-lg shadow-elevation-high opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {server.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Middle Column - Channel List */}
      <div
        className={`
          ${sidebarWidth} bg-bg-secondary flex flex-col transition-all duration-300 ease-in-out
          fixed left-[72px] top-0 h-full z-40 border-r border-gray-200
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Server header with toggle button */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-elevation-low">
          <h1 className={`text-white font-semibold text-base transition-opacity duration-200 ${shouldShowText ? 'opacity-100' : 'opacity-0'}`}>
            PromptCord
          </h1>
          <button
            onClick={toggleExpanded}
            className="p-2 rounded hover:bg-interactive-hover/10 text-interactive-normal hover:text-interactive-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            {currentChannels.map((channel) => {
              const isActive = pathname === channel.path;
              const Icon = channel.icon;
              
              return (
                <Link
                  key={channel.id}
                  href={channel.path}
                  className={`
                    flex items-center px-2 py-2 rounded text-sm transition-all duration-200
                    group hover:bg-interactive-hover/10 hover:text-interactive-hover relative
                    min-h-[44px]
                    ${isActive
                      ? 'bg-interactive-hover/15 text-interactive-active'
                      : 'text-interactive-normal'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                  title={!shouldShowText ? channel.label : ''}
                >
                  <Icon className={`w-5 h-5 text-interactive-muted group-hover:text-interactive-hover transition-colors flex-shrink-0 ${shouldShowText ? 'mr-1.5' : 'mx-auto'}`} />
                  <span className={`transition-all duration-200 truncate ${shouldShowText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'}`}>
                    {channel.label}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {!shouldShowText && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-bg-floating text-text-primary text-sm rounded-lg shadow-elevation-high opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {channel.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User area */}
        <div className="h-14 bg-bg-secondary border-t border-border px-2 flex items-center">
          <div className="flex items-center space-x-2 p-2 rounded hover:bg-interactive-hover/10 transition-colors cursor-pointer flex-1 min-w-0 min-h-[44px]">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {shouldShowText && (
              <div className="flex-1 min-w-0 transition-all duration-200">
                <div className="text-sm font-medium text-text-primary truncate">
                  User
                </div>
                <div className="text-xs text-text-muted truncate">
                  Online
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto bg-white transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? '' : 'md:ml-[88px] xl:ml-[332px]'
        } pt-0 md:pt-0`}
        style={{
          paddingTop: '64px'
        }}
      >
        <div className="transition-all duration-300 ease-in-out min-h-screen pb-[max(16px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}