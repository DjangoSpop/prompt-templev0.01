'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './AuthProvider';
import { 
  AnalyticsEvent, 
  DashboardData,
  GamificationAchievement,
  GamificationBadge,
  GamificationStats
} from '@/lib/types';

interface AnalyticsContextType {
  dashboardData: DashboardData | null;
  achievements: GamificationAchievement[];
  badges: GamificationBadge[];
  userStats: GamificationStats | null;
  isLoading: boolean;
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [achievements, setAchievements] = useState<GamificationAchievement[]>([]);
  const [badges, setBadges] = useState<GamificationBadge[]>([]);
  const [userStats, setUserStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventQueue, setEventQueue] = useState<AnalyticsEvent[]>([]);

  const loadAnalyticsData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const [dashboard, achievementsData, badgesData, statsData] = await Promise.allSettled([
        apiClient.getDashboard(),
        apiClient.getAchievements(),
        apiClient.getBadges(),
        apiClient.getUserLevel(),
      ]);

      if (dashboard.status === 'fulfilled') {
        setDashboardData(dashboard.value);
      }
      if (achievementsData.status === 'fulfilled') {
        setAchievements(Array.isArray(achievementsData.value) ? achievementsData.value : []);
      } else {
        setAchievements([]);
      }
      if (badgesData.status === 'fulfilled') {
        setBadges(Array.isArray(badgesData.value) ? badgesData.value : []);
      } else {
        setBadges([]);
      }
      if (statsData.status === 'fulfilled') {
        setUserStats(statsData.value);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      
      // Provide fallback data in development mode when API is not available
      if (process.env.NODE_ENV === 'development') {
        setDashboardData({
          total_templates_used: 0,
          total_renders: 0,
          favorite_categories: [],
          recent_activity: [],
          gamification: {
            level: 1,
            experience_points: 0,
            daily_streak: 0,
            achievements_unlocked: 0,
            badges_earned: 0,
            rank: 'Beginner',
            next_level_xp: 100
          }
        });
        setAchievements([]);
        setBadges([]);
        setUserStats({
          level: 1,
          experience_points: 0,
          daily_streak: 0,
          achievements_unlocked: 0,
          badges_earned: 0,
          rank: 'Beginner',
          next_level_xp: 100
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    if (!isAuthenticated) {
      // Queue events for when user logs in
      setEventQueue(prev => [...prev, event]);
      return;
    }

    try {
      await apiClient.trackEvent({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      // Could implement retry logic here
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    await loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Load data when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAnalyticsData();
      
      // Process queued events
      if (eventQueue.length > 0) {
        eventQueue.forEach(event => trackEvent(event));
        setEventQueue([]);
      }
    }
  }, [isAuthenticated, user, loadAnalyticsData, trackEvent, eventQueue]);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshData]);

  const value: AnalyticsContextType = {
    dashboardData,
    achievements,
    badges,
    userStats,
    isLoading,
    trackEvent,
    refreshData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook for tracking specific events
export function useEventTracker() {
  const { trackEvent } = useAnalytics();

  const trackPageView = useCallback((page: string) => {
    trackEvent({
      event_type: 'page_view',
      properties: {
        page,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    });
  }, [trackEvent]);

  const trackTemplateAction = (action: string, templateId: string, templateTitle?: string) => {
    trackEvent({
      event_type: `template_${action}`,
      properties: {
        template_id: templateId,
        template_title: templateTitle,
        action,
      },
    });
  };

  const trackPromptGeneration = (promptLength: number, templateId?: string) => {
    trackEvent({
      event_type: 'prompt_generated',
      properties: {
        prompt_length: promptLength,
        template_id: templateId,
        has_template: !!templateId,
      },
    });
  };

  const trackUserEngagement = (action: string, duration?: number) => {
    trackEvent({
      event_type: 'user_engagement',
      properties: {
        action,
        duration,
      },
    });
  };

  const trackFeatureUsage = (feature: string, context?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'feature_usage',
      properties: {
        feature,
        ...context,
      },
    });
  };

  const trackError = (error: Error, context?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'error_occurred',
      properties: {
        error_message: error.message,
        error_name: error.name,
        stack_trace: error.stack?.slice(0, 1000), // Limit stack trace length
        ...context,
      },
    });
  };

  return {
    trackPageView,
    trackTemplateAction,
    trackPromptGeneration,
    trackUserEngagement,
    trackFeatureUsage,
    trackError,
  };
}

// Hook for gamification features
export function useGamification() {
  const { achievements, badges, userStats, refreshData } = useAnalytics();

  const getUnlockedAchievements = () => {
    if (!Array.isArray(achievements)) {
      return [];
    }
    return achievements.filter(achievement => achievement.unlocked);
  };

  const getProgressAchievements = () => {
    if (!Array.isArray(achievements)) {
      return [];
    }
    return achievements.filter(achievement => !achievement.unlocked && achievement.progress > 0);
  };

  const getNextLevelProgress = () => {
    if (!userStats || !userStats.next_level_xp || userStats.next_level_xp === 0) return 0;
    return Math.min((userStats.experience_points || 0) / userStats.next_level_xp, 1);
  };

  const getRecentBadges = (limit = 5) => {
    if (!Array.isArray(badges)) {
      return [];
    }
    return badges
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, limit);
  };

  return {
    achievements,
    badges,
    userStats,
    getUnlockedAchievements,
    getProgressAchievements,
    getNextLevelProgress,
    getRecentBadges,
    refreshData,
  };
}