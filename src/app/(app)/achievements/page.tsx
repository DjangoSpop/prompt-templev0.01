"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
import { useAchievements, useLeaderboard, useUserLevel, useStreak } from "@/hooks/api/useGamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Star,
  Crown,
  Target,
  Flame,
  Users,
  Zap,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Medal,
  Sparkles,
  Lock,
  CheckCircle,
  Clock,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'usage' | 'social' | 'progression' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  progress?: {
    current: number;
    required: number;
  };
  unlockedAt?: Date;
  xpReward: number;
  iconType: 'trophy' | 'star' | 'crown' | 'target' | 'flame' | 'users' | 'zap' | 'book' | 'award';
  requirements: string[];
  isUnlocked: boolean;
  isSecret?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  score: number;
  change: number;
  achievements: number;
}

const achievementIcons = {
  trophy: Trophy,
  star: Star,
  crown: Crown,
  target: Target,
  flame: Flame,
  users: Users,
  zap: Zap,
  book: BookOpen,
  award: Award,
};

const rarityColors = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-purple-400',
  diamond: 'text-cyan-400',
};

const rarityGlow = {
  bronze: 'ring-amber-600/20',
  silver: 'ring-gray-400/20',
  gold: 'ring-yellow-500/20 shadow-yellow-500/10',
  platinum: 'ring-purple-400/20 shadow-purple-400/10',
  diamond: 'ring-cyan-400/20 shadow-cyan-400/10',
};


// ── API rarity → local rarity ──────────────────────────────────────────────
const RARITY_MAP: Record<string, Achievement['rarity']> = {
  common: 'bronze',
  uncommon: 'silver',
  rare: 'gold',
  epic: 'platinum',
  legendary: 'diamond',
};

// Map backend icon string to local iconType
function mapIconType(icon: string): Achievement['iconType'] {
  const map: Record<string, Achievement['iconType']> = {
    trophy: 'trophy', star: 'star', crown: 'crown', target: 'target',
    flame: 'flame', fire: 'flame', users: 'users', group: 'users',
    zap: 'zap', bolt: 'zap', book: 'book', award: 'award', medal: 'award',
    emoji_events: 'trophy',
  };
  return map[icon?.toLowerCase()] ?? 'star';
}

// Map API achievement object → local Achievement type
function adaptAchievement(raw: Record<string, unknown>): Achievement {
  const progressValue = (raw.progress_value as number) ?? 0;
  const requirementValue = (raw.requirement_value as number) ?? 1;
  const isUnlocked = !!(raw.is_unlocked ?? raw.unlocked);
  const apiRarity = (raw.rarity as string) ?? 'common';
  return {
    id: String(raw.id ?? ''),
    title: (raw.name as string) ?? (raw.title as string) ?? 'Achievement',
    description: (raw.description as string) ?? '',
    category: (raw.category as Achievement['category']) ?? 'usage',
    rarity: RARITY_MAP[apiRarity] ?? 'bronze',
    xpReward: (raw.experience_reward as number) ?? (raw.credits_reward as number) ?? (raw.points as number) ?? 0,
    iconType: mapIconType((raw.icon as string) ?? ''),
    requirements: raw.requirement_description
      ? [(raw.requirement_description as string)]
      : [`${raw.requirement_type ?? 'complete'}: ${requirementValue}`],
    isUnlocked,
    isSecret: !!(raw.is_hidden),
    unlockedAt: raw.unlocked_at ? new Date(raw.unlocked_at as string) : undefined,
    progress: !isUnlocked ? { current: progressValue, required: requirementValue } : undefined,
  };
}

// Map API leaderboard entry → local LeaderboardEntry
function adaptLeaderboard(raw: Record<string, unknown>): LeaderboardEntry {
  return {
    rank: (raw.rank as number) ?? 0,
    user: {
      id: String(raw.user_id ?? raw.id ?? ''),
      name: (raw.username as string) ?? 'User',
      avatar: (raw.avatar_url as string) ?? '',
      level: (raw.level as number) ?? 1,
    },
    score: (raw.experience_points as number) ?? 0,
    change: 0,
    achievements: (raw.achievements_count as number) ?? 0,
  };
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  const { user } = useGameStore();

  // Real API hooks
  const { data: achievementsRaw, isLoading: achievementsLoading } = useAchievements();
  const { data: leaderboardRaw, isLoading: leaderboardLoading } = useLeaderboard(50);
  const { data: levelData } = useUserLevel();
  const { data: streakData } = useStreak();

  // Adapt API data to local types, with fallback to empty arrays
  const achievements: Achievement[] = useMemo(() => {
    if (!achievementsRaw) return [];
    const list = Array.isArray(achievementsRaw) ? achievementsRaw : (achievementsRaw as Record<string, unknown[]>)?.results ?? [];
    return (list as Record<string, unknown>[]).map(adaptAchievement);
  }, [achievementsRaw]);

  // Pick leaderboard list based on selected period
  const leaderboardEntries: LeaderboardEntry[] = useMemo(() => {
    if (!leaderboardRaw) return [];
    const raw = leaderboardRaw as Record<string, unknown>;
    const key = leaderboardPeriod === 'weekly' ? 'weekly_leaders'
               : leaderboardPeriod === 'monthly' ? 'monthly_leaders'
               : 'all_time_leaders';
    const list = (raw[key] as Record<string, unknown>[]) ?? (raw['all_time_leaders'] as Record<string, unknown>[]) ?? [];
    return list.map(adaptLeaderboard);
  }, [leaderboardRaw, leaderboardPeriod]);

  // User's rank from leaderboard response
  const userRank = useMemo(() => {
    if (!leaderboardRaw) return 0;
    return (leaderboardRaw as Record<string, unknown>).user_rank as number ?? 0;
  }, [leaderboardRaw]);

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'usage', name: 'Usage', icon: Zap },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'progression', name: 'Progress', icon: TrendingUp },
    { id: 'special', name: 'Special', icon: Crown },
  ];

  const rarities = [
    { id: 'all', name: 'All Rarities' },
    { id: 'bronze', name: 'Bronze' },
    { id: 'silver', name: 'Silver' },
    { id: 'gold', name: 'Gold' },
    { id: 'platinum', name: 'Platinum' },
    { id: 'diamond', name: 'Diamond' },
  ];

  const filteredAchievements = achievements.filter(achievement => {
    if (!achievement.isSecret) {
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
      if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
    }
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = Math.max(1, achievements.filter(a => !a.isSecret).length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Achievements & Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your progress and compete with others
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-4 py-2">
                <Trophy className="h-4 w-4 mr-1" />
                {unlockedCount}/{totalCount} Unlocked
              </Badge>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-achievement" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Achievements</p>
                    <p className="text-lg font-bold">{unlockedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-experience" />
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement XP</p>
                    <p className="text-lg font-bold">
                      {(levelData as Record<string, unknown>)?.experience_points?.toLocaleString?.()
                        ?? achievements.filter(a => a.isUnlocked).reduce((t, a) => t + a.xpReward, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-bold">
                      {Math.round((unlockedCount / totalCount) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                    <p className="text-lg font-bold">{userRank > 0 ? `#${userRank}` : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity.id} value={rarity.id}>
                        {rarity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Achievements Grid/List */}
            {achievementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-secondary/20 animate-pulse" />
                ))}
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No achievements found. Start exploring to unlock them!</p>
              </div>
            ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              <AnimatePresence mode="popLayout">
                {filteredAchievements.map((achievement, index) => {
                  const IconComponent = achievementIcons[achievement.iconType];
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`glass-effect transition-all duration-300 ${
                        achievement.isUnlocked 
                          ? `ring-2 ${rarityGlow[achievement.rarity]}` 
                          : 'opacity-75'
                      } ${viewMode === 'list' ? 'flex-row' : ''}`}>
                        {achievement.isSecret && !achievement.isUnlocked ? (
                          <CardContent className={`${viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4 flex-1'}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-muted-foreground">Secret Achievement</h3>
                                <p className="text-sm text-muted-foreground">
                                  Keep exploring to unlock this mystery!
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        ) : (
                          <>
                            <CardHeader className={viewMode === 'list' ? 'pb-4' : 'pb-3'}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 bg-${achievement.rarity}/10 rounded-lg flex items-center justify-center relative`}>
                                    <IconComponent className={`h-6 w-6 ${rarityColors[achievement.rarity]}`} />
                                    {achievement.isUnlocked && (
                                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${rarityColors[achievement.rarity]}`}
                                      >
                                        {achievement.rarity}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {achievement.xpReward} XP
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className={viewMode === 'list' ? 'pt-0 flex-1' : 'space-y-4'}>
                              <CardDescription className="text-sm">
                                {achievement.description}
                              </CardDescription>

                              {achievement.progress && !achievement.isUnlocked && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span className="font-medium">
                                      {achievement.progress.current}/{achievement.progress.required}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(achievement.progress.current / achievement.progress.required) * 100}
                                    className="h-2"
                                  />
                                </div>
                              )}

                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Requirements:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {achievement.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {achievement.unlockedAt && (
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                  <Calendar className="h-3 w-3" />
                                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                                </div>
                              )}
                            </CardContent>
                          </>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-4">
              <Select value={leaderboardPeriod} onValueChange={(value: 'weekly' | 'monthly' | 'all-time') => setLeaderboardPeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-achievement" />
                  Top Achievers
                </CardTitle>
                <CardDescription>
                  See how you rank against other temple explorers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-lg bg-secondary/20 animate-pulse" />
                    ))
                  ) : leaderboardEntries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No leaderboard data yet. Be the first!</p>
                  ) : leaderboardEntries.map((entry) => {
                    const isCurrentUser = !!(leaderboardRaw as Record<string, unknown>)?.current_user && entry.rank === userRank;
                    
                    return (
                      <motion.div
                        key={entry.user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: entry.rank * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                          isCurrentUser 
                            ? 'bg-primary/5 border border-primary/20' 
                            : 'bg-secondary/20 hover:bg-secondary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              entry.rank === 1 ? 'bg-yellow-500 text-black' :
                              entry.rank === 2 ? 'bg-gray-400 text-black' :
                              entry.rank === 3 ? 'bg-amber-600 text-white' :
                              'bg-secondary text-secondary-foreground'
                            }`}>
                              {entry.rank}
                            </div>
                            {entry.change !== 0 && (
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                entry.change > 0 ? 'bg-green-500' : 'bg-red-500'
                              } text-white`}>
                                {entry.change > 0 ? '↑' : '↓'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.user.name || entry.user.id}</span>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Level {entry.user.level}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="font-medium">{entry.score.toLocaleString()} XP</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.achievements} achievements
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}