"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
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

const mockAchievements: Achievement[] = [
  {
    id: 'first-template',
    title: 'First Steps',
    description: 'Use your first template',
    category: 'usage',
    rarity: 'bronze',
    xpReward: 50,
    iconType: 'star',
    requirements: ['Use 1 template'],
    isUnlocked: true,
    unlockedAt: new Date('2024-01-10'),
  },
  {
    id: 'template-master',
    title: 'Template Master',
    description: 'Use 100 different templates',
    category: 'usage',
    rarity: 'gold',
    progress: {
      current: 67,
      required: 100,
    },
    xpReward: 500,
    iconType: 'trophy',
    requirements: ['Use 100 unique templates'],
    isUnlocked: false,
  },
  {
    id: 'week-streak',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day activity streak',
    category: 'progression',
    rarity: 'silver',
    xpReward: 200,
    iconType: 'flame',
    requirements: ['Complete 7 consecutive days of activity'],
    isUnlocked: true,
    unlockedAt: new Date('2024-01-18'),
  },
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Join your first team',
    category: 'social',
    rarity: 'bronze',
    xpReward: 100,
    iconType: 'users',
    requirements: ['Join a team'],
    isUnlocked: true,
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Reach level 50',
    category: 'progression',
    rarity: 'platinum',
    progress: {
      current: 34,
      required: 50,
    },
    xpReward: 1000,
    iconType: 'crown',
    requirements: ['Reach level 50'],
    isUnlocked: false,
  },
  {
    id: 'creator',
    title: 'Template Creator',
    description: 'Create and publish 10 custom templates',
    category: 'usage',
    rarity: 'gold',
    progress: {
      current: 3,
      required: 10,
    },
    xpReward: 750,
    iconType: 'zap',
    requirements: ['Create 10 custom templates', 'Publish templates to community'],
    isUnlocked: false,
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Share templates with 25 different users',
    category: 'social',
    rarity: 'silver',
    progress: {
      current: 8,
      required: 25,
    },
    xpReward: 300,
    iconType: 'users',
    requirements: ['Share templates with 25 users'],
    isUnlocked: false,
  },
  {
    id: 'legendary-master',
    title: 'Legendary Master',
    description: 'Complete all other achievements',
    category: 'special',
    rarity: 'diamond',
    xpReward: 2500,
    iconType: 'award',
    requirements: ['Complete all other achievements'],
    isUnlocked: false,
    isSecret: true,
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      level: 67,
    },
    score: 15420,
    change: 2,
    achievements: 24,
  },
  {
    rank: 2,
    user: {
      id: '2',
      name: 'Alex Rodriguez',
      avatar: '/avatars/alex.jpg',
      level: 61,
    },
    score: 14890,
    change: -1,
    achievements: 22,
  },
  {
    rank: 3,
    user: {
      id: '3',
      name: 'Maya Patel',
      avatar: '/avatars/maya.jpg',
      level: 58,
    },
    score: 13750,
    change: 1,
    achievements: 19,
  },
  {
    rank: 4,
    user: {
      id: '4',
      name: 'Jordan Kim',
      avatar: '/avatars/jordan.jpg',
      level: 52,
    },
    score: 12340,
    change: 0,
    achievements: 18,
  },
  {
    rank: 5,
    user: {
      id: 'current',
      name: 'You',
      avatar: '/avatars/current.jpg',
      level: 34,
    },
    score: 8900,
    change: 3,
    achievements: 12,
  },
];

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  const { user } = useGameStore();

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

  const filteredAchievements = mockAchievements.filter(achievement => {
    if (!achievement.isSecret) {
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
      if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
    }
    return true;
  });

  const unlockedCount = mockAchievements.filter(a => a.isUnlocked).length;
  const totalCount = mockAchievements.filter(a => !a.isSecret).length;

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
                      {mockAchievements
                        .filter(a => a.isUnlocked)
                        .reduce((total, a) => total + a.xpReward, 0)
                        .toLocaleString()}
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
                    <p className="text-lg font-bold">#5</p>
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
                  {mockLeaderboard.map((entry) => {
                    const isCurrentUser = entry.user.id === 'current';
                    
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
                              <span className="font-medium">{entry.user.name}</span>
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