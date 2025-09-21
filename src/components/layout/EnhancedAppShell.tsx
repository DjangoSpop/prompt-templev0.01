'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Layers,
  Sparkles,
  Globe
} from 'lucide-react';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { NefertitiIcon } from '@/components/pharaonic/NefertitiIcon';
import { Button } from '@/components/ui/button';

// Enhanced server list with Pharaonic theming
const serverIcons = [
  { id: 'library', icon: Library, label: 'Library', path: '/template-manager', color: 'lapis-blue' },
  { id: 'builder', icon: Layers, label: 'Builder', path: '/builder', color: 'nile-teal' },
  { id: 'orchestrate', icon: Zap, label: 'Orchestrate', path: '/orchestrate', color: 'royal-gold' },
  { id: 'workspace', icon: User, label: 'Workspace', path: '/workspace', color: 'desert-sand' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics', color: 'pyramid-limestone' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings', color: 'hieroglyph-stone' },
];

// Enhanced channel mappings with better UX
const channelMappings = {
  'library': [
    { id: 'browse', icon: Hash, label: 'Browse All', path: '/template-manager' },
    { id: 'featured', icon: Star, label: 'Featured', path: '/template-manager/featured' },
    { id: 'trending', icon: TrendingUp, label: 'Trending', path: '/template-manager/trending' },
    { id: 'my-templates', icon: User, label: 'My Templates', path: '/template-manager/my-templates' },
  ],
  'builder': [
    { id: 'new-prompt', icon: Sparkles, label: 'New Prompt', path: '/builder' },
    { id: 'templates', icon: Library, label: 'From Template', path: '/builder/template' },
    { id: 'drafts', icon: History, label: 'Drafts', path: '/builder/drafts' },
  ],
  'orchestrate': [
    { id: 'pipeline', icon: Target, label: 'Pipeline', path: '/orchestrate' },
    { id: 'sessions', icon: History, label: 'Recent Sessions', path: '/orchestrate/sessions' },
    { id: 'presets', icon: Settings2, label: 'Presets', path: '/orchestrate/presets' },
  ],
  'workspace': [
    { id: 'saved', icon: Star, label: 'Saved Prompts', path: '/workspace' },
    { id: 'history', icon: History, label: 'History', path: '/workspace/history' },
    { id: 'teams', icon: Users, label: 'Teams', path: '/workspace/teams' },
  ],
  'analytics': [
    { id: 'overview', icon: PieChart, label: 'Overview', path: '/analytics' },
    { id: 'templates', icon: BarChart2, label: 'Templates', path: '/analytics/templates' },
    { id: 'usage', icon: TrendingUp, label: 'Usage Stats', path: '/analytics/usage' },
  ],
  'settings': [
    { id: 'general', icon: Settings2, label: 'General', path: '/settings' },
    { id: 'api-keys', icon: Globe, label: 'API Keys', path: '/settings/api-keys' },
    { id: 'quotas', icon: CreditCard, label: 'Quotas & Usage', path: '/settings/quotas' },
  ],
};

interface EnhancedAppShellProps {
  children: ReactNode;
}

export function EnhancedAppShell({ children }: EnhancedAppShellProps) {
  const pathname = usePathname();
  const [currentServer, setCurrentServer] = useState(() => {
    const pathSegment = pathname.split('/')[1];
    // Map template-manager to library for consistency
    const mappedSegment = pathSegment === 'template-manager' ? 'library' : pathSegment;
    return serverIcons.find(s => s.id === mappedSegment)?.id || 'library';
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pharaoh-sidebar-expanded');
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved));
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('pharaoh-sidebar-expanded', JSON.stringify(newState));
  };

  const shouldShowText = isExpanded || isHovered;
  const sidebarWidth = shouldShowText ? 'w-64' : 'w-16';
  const currentChannels = channelMappings[currentServer as keyof typeof channelMappings] || [];

  // Update current server when route changes
  useEffect(() => {
    const pathSegment = pathname.split('/')[1];
    const mappedSegment = pathSegment === 'template-manager' ? 'library' : pathSegment;
    const foundServer = serverIcons.find(s => s.id === mappedSegment);
    if (foundServer) {
      setCurrentServer(foundServer.id);
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Rail - Server List with Pharaonic Design */}
      <motion.div 
        className="w-[72px] bg-gradient-to-b from-lapis-blue to-nile-teal flex flex-col items-center py-6 space-y-3 fixed left-0 top-0 h-full z-40 shadow-pyramid"
        initial={{ x: -72 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo/Brand */}
        <motion.div
          className="mb-4 p-2 rounded-xl bg-pharaoh-gold/20 backdrop-blur-sm"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <NefertitiIcon size="sm" className="text-white" />
        </motion.div>

        {/* Server Icons */}
        <div className="flex flex-col space-y-3">
          {serverIcons.map((server) => {
            const isActive = currentServer === server.id;
            const Icon = server.icon;
            
            return (
              <motion.div
                key={server.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={server.path}
                  onClick={() => setCurrentServer(server.id)}
                  className={`
                    relative group w-12 h-12 rounded-2xl transition-all duration-300
                    flex items-center justify-center
                    ${isActive 
                      ? 'bg-white text-lapis-blue shadow-pyramid scale-110' 
                      : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white hover:scale-105'
                    }
                  `}
                  title={server.label}
                >
                  <Icon className="w-6 h-6" />
                  
                  {/* Active indicator - Pharaonic accent */}
                  {isActive && (
                    <motion.div 
                      className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-pharaoh-gold rounded-r-lg"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  
                  {/* Enhanced tooltip with Pharaonic styling */}
                  <div className="absolute left-16 px-3 py-2 bg-card/95 backdrop-blur-sm text-foreground text-sm rounded-temple shadow-pyramid opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-pharaoh-gold/20">
                    {server.label}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-card/95 border-l border-b border-pharaoh-gold/20 rotate-45" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Middle Column - Channel List with Enhanced Design */}
      <motion.div 
        className={`${sidebarWidth} bg-card/95 backdrop-blur-lg flex flex-col transition-all duration-500 ease-in-out fixed left-[72px] top-0 h-full z-30 border-r border-border shadow-temple`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {/* Header with Pharaonic branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-gradient-to-r from-pharaoh-gold/5 to-nile-teal/5">
          <motion.h1 
            className={`text-foreground font-display font-bold text-lg transition-all duration-300 ${shouldShowText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            animate={{ opacity: shouldShowText ? 1 : 0 }}
          >
            Prompt Temple
          </motion.h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="p-2 hover:bg-pharaoh-gold/10 text-muted-foreground hover:text-pharaoh-gold transition-colors"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>

        {/* Channels with enhanced animations */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentServer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              {currentChannels.map((channel, index) => {
                const isActive = pathname === channel.path || pathname.startsWith(channel.path);
                const Icon = channel.icon;
                
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={channel.path}
                      className={`
                        flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                        group hover:bg-pharaoh-gold/10 relative
                        ${isActive 
                          ? 'bg-pharaoh-gold/15 text-pharaoh-gold shadow-sm border-l-2 border-pharaoh-gold' 
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                      title={!shouldShowText ? channel.label : ''}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${shouldShowText ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-pharaoh-gold' : 'group-hover:text-pharaoh-gold'}`} />
                      
                      <AnimatePresence>
                        {shouldShowText && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="truncate font-medium"
                          >
                            {channel.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div 
                          className="absolute right-3 w-2 h-2 bg-pharaoh-gold rounded-full"
                          layoutId={`activeChannel-${currentServer}`}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {!shouldShowText && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-card/95 backdrop-blur-sm text-foreground text-sm rounded-temple shadow-pyramid opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-pharaoh-gold/20">
                          {channel.label}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-card/95 border-l border-b border-pharaoh-gold/20 rotate-45" />
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced User Area */}
        <motion.div 
          className="h-16 bg-gradient-to-r from-pharaoh-gold/5 to-nile-teal/5 border-t border-border px-3 flex items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-pharaoh-gold/10 transition-colors cursor-pointer flex-1 min-w-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            
            <AnimatePresence>
              {shouldShowText && (
                <motion.div 
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-medium text-foreground truncate group-hover:text-pharaoh-gold transition-colors">
                    Pharaoh User
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Master of Prompts
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <PyramidGrid className="w-full h-full" animate={false} />
        </div>
      </motion.div>

      {/* Main Content Area with smooth transitions */}
      <motion.div 
        className="flex-1 overflow-y-auto bg-background" 
        style={{ marginLeft: shouldShowText ? '336px' : '88px' }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      >
        <div className="transition-all duration-500 ease-in-out min-h-screen">
          {children}
        </div>
      </motion.div>
    </div>
  );
}