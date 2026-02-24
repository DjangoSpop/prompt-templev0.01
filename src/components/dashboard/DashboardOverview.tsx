"use client";

import React from 'react';
import { Card } from '@/components/ui/card-unified';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  useAnalyticsDashboard, 
  useUserInsights 
} from '@/hooks/api/useAnalytics';
import {
  useUserLevel,
  useStreak,
  useAchievements,
  useBadges
} from '@/hooks/api/useGamification';
import {
  TrendingUp,
  Target,
  Zap,
  Award,
  Flame,
  Star,
  BarChart3,
  Activity
} from 'lucide-react';

export function DashboardOverview() {
  const { data: dashboard, isLoading: dashboardLoading } = useAnalyticsDashboard();
  const { data: insights } = useUserInsights();
  const { data: level } = useUserLevel();
  const { data: streak } = useStreak();
  const { data: achievements } = useAchievements();
  const { data: badges } = useBadges();

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const unlockedAchievements = achievements?.filter((a: any) => a.is_unlocked || a.unlocked).length || 0;
  const totalAchievements = achievements?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Templates Used */}
        <Card variant="temple" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Templates Used</p>
              <p className="text-2xl font-bold mt-1">
                {dashboard?.total_templates_used || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        {/* Total Renders */}
        <Card variant="temple" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Renders</p>
              <p className="text-2xl font-bold mt-1">
                {dashboard?.total_renders || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Current Level */}
        {level && (
          <Card variant="temple" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold mt-1">{level.current_level}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {level.level_name}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        )}

        {/* Current Streak */}
        {streak && (
          <Card variant="temple" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold mt-1">
                  {streak.current_streak} days
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        {level && (
          <Card variant="temple" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Level Progress</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {level.experience_points} / {level.experience_points + level.points_to_next_level} XP
                  </span>
                  <Badge variant="default">
                    Level {level.current_level}
                  </Badge>
                </div>
                <Progress 
                  value={(level.experience_points / (level.experience_points + level.points_to_next_level)) * 100} 
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Next Level Benefits:</p>
                <ul className="space-y-1">
                  {level.level_benefits?.slice(0, 3).map((benefit: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <Star className="h-3 w-3 text-amber-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Achievements */}
        <Card variant="temple" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {unlockedAchievements} of {totalAchievements} unlocked
              </span>
              <Badge variant="success">
                {totalAchievements > 0 
                  ? Math.round((unlockedAchievements / totalAchievements) * 100) 
                  : 0}%
              </Badge>
            </div>
            <Progress 
              value={totalAchievements > 0 
                ? (unlockedAchievements / totalAchievements) * 100 
                : 0
              } 
            />
            {badges && badges.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recent Badges:</p>
                <div className="flex flex-wrap gap-2">
                  {badges.slice(0, 4).map((badge: any) => (
                    <Badge 
                      key={badge.id} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {badge.icon && <span>{badge.icon}</span>}
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Favorite Categories */}
      {dashboard?.favorite_categories && dashboard.favorite_categories.length > 0 && (
        <Card variant="temple" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Favorite Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.favorite_categories.map((category: string, i: number) => (
              <Badge key={i} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {dashboard?.recent_activity && dashboard.recent_activity.length > 0 && (
        <Card variant="temple" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {dashboard.recent_activity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{activity.template_name}</p>
                  <p className="text-xs text-muted-foreground">{activity.category}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.used_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
