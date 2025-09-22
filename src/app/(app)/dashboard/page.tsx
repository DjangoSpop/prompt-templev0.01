"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGameStore } from "@/lib/stores/gameStore";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Crown,
  Flame,
  Star,
  Zap,
  Users,
  Calendar,
  Download,
  Smartphone,
  Monitor,
  Globe,
  Share,
  BookOpen,
  Plus,
  TrendingUp,
  Gift,
  Clock,
  Eye,
  Heart,
  Sparkles,
  Building2,
  Coins,
} from "lucide-react";

interface TempleStats {
  totalTemplates: number;
  templatesCreated: number;
  templatesUsed: number;
  totalViews: number;
  collaborations: number;
  weeklyActivity: Array<{ day: string; value: number }>;
  achievements: number;
  streakCount: number;
}

export default function TempleDashboard() {
  const {
    user,
    notifications,
    stats,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    updateStreak,
    addExperience,
  } = useGameStore();

  const [templeStats] = useState<TempleStats>({
    totalTemplates: 1247,
    templatesCreated: stats.templatesCreated,
    templatesUsed: stats.templatesUsed,
    totalViews: 15420,
    collaborations: stats.collaborations,
    weeklyActivity: [
      { day: "Mon", value: 12 },
      { day: "Tue", value: 8 },
      { day: "Wed", value: 15 },
      { day: "Thu", value: 22 },
      { day: "Fri", value: 18 },
      { day: "Sat", value: 25 },
      { day: "Sun", value: 14 },
    ],
    achievements: 8,
    streakCount: user.streak,
  });

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const levelProgress = getProgressToNextLevel();
  const recentNotifications = notifications.slice(0, 3);

  // Update streak on page load
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen game-background p-4 md:p-6 space-y-4 md:space-y-6 pb-[max(16px,env(safe-area-inset-bottom))]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Temple Header */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20" />
          <div className="absolute inset-0 bg-game-pattern opacity-30" />
          <Card className="relative glass-effect border-primary/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-20 h-20 bg-gradient-to-br from-achievement via-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                      <Building2 className="h-10 w-10 text-white" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-achievement rounded-full flex items-center justify-center text-sm font-bold text-background">
                      {user.level}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {getGreeting()}, {user.username || "Temple Keeper"}!
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1" style={{ color: currentLevel.color }}>
                      {currentLevel.title} • Level {user.level}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">{user.streak} day streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-achievement" />
                        <span className="text-sm font-medium">{formatNumber(user.totalPoints)} points</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Download App Section */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-3 text-glow">Download Our App</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-effect border-primary/20">
                      <Smartphone className="h-4 w-4 mr-2" />
                      iOS
                    </Button>
                    <Button variant="outline" size="sm" className="glass-effect border-primary/20">
                      <Monitor className="h-4 w-4 mr-2" />
                      Android
                    </Button>
                    <Button variant="outline" size="sm" className="glass-effect border-primary/20">
                      <Globe className="h-4 w-4 mr-2" />
                      Web
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Available on all platforms</p>
                </div>
              </div>
              
              {/* Level Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-experience" />
                    Progress to {nextLevel?.title || "Max Level"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.experience} / {nextLevel?.requiredXP || "∞"} XP
                  </span>
                </div>
                <Progress value={levelProgress} className="h-3">
                  <motion.div
                    className="h-full level-progress rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </Progress>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Temple Statistics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Templates Created",
              value: templeStats.templatesCreated,
              icon: Plus,
              color: "text-success",
              bgColor: "from-success/20 to-success/5",
              change: "+12%",
            },
            {
              title: "Templates Used",
              value: templeStats.templatesUsed,
              icon: Zap,
              color: "text-primary",
              bgColor: "from-primary/20 to-primary/5",
              change: "+8%",
            },
            {
              title: "Total Views",
              value: templeStats.totalViews,
              icon: Eye,
              color: "text-warning",
              bgColor: "from-warning/20 to-warning/5",
              change: "+15%",
            },
            {
              title: "Collaborations",
              value: templeStats.collaborations,
              icon: Users,
              color: "text-experience",
              bgColor: "from-experience/20 to-experience/5",
              change: "+5%",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <Card className={`game-card card-hover bg-gradient-to-br ${stat.bgColor} border-glow`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-background/20`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(stat.value)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Temple Activities */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Rewards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recent Temple Activity
                  </CardTitle>
                  <CardDescription>Your latest actions and achievements in the temple</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/40 transition-all duration-200"
                        >
                          <div className="text-2xl">{notification.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(() => {
                                try {
                                  return formatRelativeTime(notification.timestamp);
                                } catch (error) {
                                  console.warn('Invalid timestamp for notification:', notification.id, notification.timestamp);
                                  return 'recently';
                                }
                              })()}
                            </p>
                          </div>
                          {notification.points && (
                            <Badge variant="experience" className="level-badge">
                              +{notification.points} XP
                            </Badge>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Welcome to Your Temple</h3>
                        <p className="text-muted-foreground mb-6">
                          Start your journey by exploring templates and earning your first achievements!
                        </p>
                        <div className="flex justify-center gap-3">
                          <Button onClick={() => addExperience(100)} className="neon-border">
                            <Gift className="h-4 w-4 mr-2" />
                            Claim Welcome Bonus (+100 XP)
                          </Button>
                          <Link href="/library">
                            <Button variant="outline">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Explore Library
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "First Steps",
                    description: "Complete your first template",
                    icon: "🏃‍♂️",
                    progress: stats.templatesUsed > 0 ? 100 : 0,
                    unlocked: stats.templatesUsed > 0,
                  },
                  {
                    title: "Creator",
                    description: "Create 5 templates",
                    icon: "🎨",
                    progress: Math.min(100, (stats.templatesCreated / 5) * 100),
                    unlocked: stats.templatesCreated >= 5,
                  },
                  {
                    title: "Collaborator",
                    description: "Work with 3 team members",
                    icon: "🤝",
                    progress: Math.min(100, (stats.collaborations / 3) * 100),
                    unlocked: stats.collaborations >= 3,
                  },
                  {
                    title: "Streak Master",
                    description: "Maintain a 7-day streak",
                    icon: "🔥",
                    progress: Math.min(100, (user.streak / 7) * 100),
                    unlocked: user.streak >= 7,
                  },
                  {
                    title: "Level Up",
                    description: "Reach level 5",
                    icon: "⭐",
                    progress: Math.min(100, (user.level / 5) * 100),
                    unlocked: user.level >= 5,
                  },
                  {
                    title: "Points Collector",
                    description: "Earn 1000 points",
                    icon: "💎",
                    progress: Math.min(100, (user.totalPoints / 1000) * 100),
                    unlocked: user.totalPoints >= 1000,
                  },
                ].map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className={`game-card ${achievement.unlocked ? 'achievement-glow border-achievement' : 'opacity-60'}`}>
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                        <Progress value={achievement.progress} className="h-2 mb-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(achievement.progress)}% Complete
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-achievement" />
                    Temple Leaderboard
                  </CardTitle>
                  <CardDescription>Top performers in the PromptCraft Temple</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { rank: 1, name: "Temple Master Alex", points: 15420, level: 8, avatar: "👑" },
                      { rank: 2, name: "Sage Creator Sam", points: 12840, level: 7, avatar: "🧙‍♂️" },
                      { rank: 3, name: "Prompt Wizard Maya", points: 10560, level: 6, avatar: "🧙‍♀️" },
                      { rank: 4, name: user.username || "You", points: user.totalPoints, level: user.level, avatar: "👤" },
                      { rank: 5, name: "Creative Jordan", points: 8240, level: 5, avatar: "🎨" },
                    ].map((player, index) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          player.name === (user.username || "You")
                            ? 'bg-primary/10 border border-primary/20 neon-border'
                            : 'bg-secondary/20 hover:bg-secondary/30'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            player.rank <= 3 ? 'bg-achievement text-background' : 'bg-secondary text-foreground'
                          }`}>
                            {player.rank}
                          </div>
                          <div className="text-2xl">{player.avatar}</div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-muted-foreground">Level {player.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(player.points)}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-success" />
                      Daily Rewards
                    </CardTitle>
                    <CardDescription>Come back daily to claim your rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(7)].map((_, day) => {
                        const claimed = day < user.streak;
                        const today = day === user.streak;
                        return (
                          <motion.div
                            key={day}
                            whileHover={{ scale: 1.05 }}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                              claimed
                                ? 'bg-success/20 border-success border'
                                : today
                                ? 'bg-primary/20 border-primary border-2 pulse-glow'
                                : 'bg-secondary/20 border-border border'
                            }`}
                          >
                            <Gift className={`h-4 w-4 mb-1 ${claimed ? 'text-success' : today ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium">{day + 1}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                    <Button 
                      className="w-full mt-4 neon-border" 
                      onClick={() => addExperience(50)}
                      disabled={user.streak === 0}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Today&apos;s Reward (+50 XP)
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Mobile App Benefits
                    </CardTitle>
                    <CardDescription>Get exclusive rewards by using our mobile app</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { icon: "📱", title: "Push Notifications", desc: "Never miss daily rewards" },
                        { icon: "🔔", title: "Instant Updates", desc: "Real-time collaboration alerts" },
                        { icon: "💾", title: "Offline Access", desc: "Access templates anywhere" },
                        { icon: "⚡", title: "Faster Performance", desc: "Native app experience" },
                      ].map((benefit) => (
                        <div key={benefit.title} className="flex items-center gap-3">
                          <span className="text-lg">{benefit.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{benefit.title}</p>
                            <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Smartphone className="h-3 w-3" />
                        iOS
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Monitor className="h-3 w-3" />
                        Android
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions Temple Style */}
        <motion.div variants={itemVariants}>
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Temple Quick Actions
              </CardTitle>
              <CardDescription>Jump into your most powerful temple tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Create Template", icon: Plus, href: "/templates/create", color: "success", glow: "shadow-success" },
                  { title: "Browse Library", icon: BookOpen, href: "/library", color: "primary", glow: "shadow-primary" },
                  { title: "View Analytics", icon: TrendingUp, href: "/analytics", color: "warning", glow: "shadow-warning" },
                  { title: "Join Teams", icon: Users, href: "/teams", color: "experience", glow: "shadow-experience" },
                ].map((action) => (
                  <Link key={action.title} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", damping: 20 }}
                    >
                      <Button
                        variant="outline"
                        className={`h-auto p-6 flex-col gap-3 w-full game-card card-hover ${action.glow}`}
                      >
                        <div className={`p-3 rounded-full bg-${action.color}/20`}>
                          <action.icon className={`h-8 w-8 text-${action.color}`} />
                        </div>
                        <span className="font-medium">{action.title}</span>
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Sharing & Retention */}
        <motion.div variants={itemVariants}>
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Share Your Temple Progress</h3>
                  <p className="text-muted-foreground text-sm">
                    Show off your achievements and invite friends to join your temple journey!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share Progress
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Invite Friends
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}