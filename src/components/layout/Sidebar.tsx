"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Library,
  Users,
  CreditCard,
  Settings,
  Trophy,
  Target,
  Zap,
  Crown,
  Star,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Gift,
  Brain,
  MessageSquare,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Prompt Optimizer",
    href: "/optimization",
    icon: Brain,
    badge: "AI",
  },
  {
    title: "Template Library",
    href: "/library",
    icon: Library,
    badge: "1000+",
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Users,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const gameNavItems: NavItem[] = [
  {
    title: "Achievements",
    href: "/achievements",
    icon: Trophy,
  },
  {
    title: "Challenges",
    href: "/challenges",
    icon: Target,
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Crown,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGameSection, setShowGameSection] = useState(true);
  
  const {
    user,
    notifications,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    onboarding,
    resetOnboarding,
  } = useGameStore();

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const levelProgress = getProgressToNextLevel();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRestartTutorial = () => {
    resetOnboarding();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative h-screen bg-secondary/50 border-r border-border glass-effect flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">PromptCraft</h1>
                  <p className="text-xs text-muted-foreground">Temple</p>
                </div>
              </motion.div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary/10">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-level-gold rounded-full flex items-center justify-center text-xs font-bold text-background">
                {user.level}
              </div>
            </div>
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{user.username || "Guest User"}</h3>
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs px-1.5">
                      {unreadNotifications}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate" style={{ color: currentLevel.color }}>
                  {currentLevel.title}
                </p>
              </motion.div>
            )}
          </div>

          {/* Level Progress */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-experience" />
                  {user.experience} XP
                </span>
                {nextLevel && (
                  <span className="text-muted-foreground">
                    {nextLevel.requiredXP - user.experience} to level {nextLevel.level}
                  </span>
                )}
              </div>
              <Progress value={levelProgress} className="h-2">
                <div className="h-full level-progress rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Streak Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <motion.div
                    animate={user.streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Flame className="h-3 w-3 text-warning" />
                  </motion.div>
                  <span>{user.streak} day streak</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="h-3 w-3" />
                  {user.totalPoints}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          {mainNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Tooltip key={item.href} side="right" disabled={!isCollapsed}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground card-hover",
                        isActive && "bg-primary/10 text-primary border border-primary/20"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      
                      {!isCollapsed && (
                        <>
                          <span className="font-medium truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 w-1 h-8 bg-primary rounded-r"
                        />
                      )}
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Separator */}
          <div className="py-2">
            <Separator />
          </div>

          {/* Gamification Section */}
          <Collapsible open={showGameSection} onOpenChange={setShowGameSection}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto font-medium text-sm"
              >
                {!isCollapsed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-achievement" />
                      Gamification
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      showGameSection && "rotate-180"
                    )} />
                  </>
                )}
                {isCollapsed && <Trophy className="h-4 w-4 text-achievement" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {gameNavItems.map((item, index) => {
                const isActive = pathname === item.href;
                
                return (
                  <Tooltip key={item.href} side="right" disabled={!isCollapsed}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 ml-2 rounded-lg transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-achievement/10 text-achievement"
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm truncate">{item.title}</span>
                          )}
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Tutorial Restart Button */}
          {!isCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestartTutorial}
              className="w-full flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              Restart Tutorial
            </Button>
          )}
          
          {/* Daily Reward */}
          {!isCollapsed && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-gradient-to-r from-achievement/20 to-primary/20 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-achievement rounded-full flex items-center justify-center">
                  <Gift className="h-4 w-4 text-background" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Daily Reward</div>
                  <div className="text-xs text-muted-foreground">Come back tomorrow</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Collapse indicator */}
        {isCollapsed && (
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-12 bg-secondary border border-border rounded-r-lg flex items-center justify-center">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  );
}