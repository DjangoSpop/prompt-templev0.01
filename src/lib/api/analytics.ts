import { BaseApiClient } from './base';
import type { components } from '../../types/api';
import { isDevelopment } from '../config/env';
import type { DashboardData } from '../types';

type TemplateList = components['schemas']['TemplateList'];

interface AnalyticsEvent {
  event_type: string;
  data?: Record<string, any>;
  timestamp?: string;
}

interface UserInsights {
  usage_patterns: any;
  favorite_categories: any[];
  performance_metrics: any;
  recommendations: string[];
}

interface TemplateAnalytics {
  usage_count: number;
  completion_rate: number;
  average_rating: number;
  user_feedback: any[];
  performance_metrics: any;
}

interface ABTest {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  variants: any[];
  metrics: any;
}

const emptyDashboard: DashboardData = {
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
    rank: 'Temple Initiate',
    next_level_xp: 500,
  },
};

export class AnalyticsService extends BaseApiClient {
  private async safeRequest<T>(endpoint: string, config: any, fallback: T): Promise<T> {
    try {
      return await this.request<T>(endpoint, config);
    } catch (error) {
      if (isDevelopment()) {
        console.warn(`Analytics API ${endpoint} unavailable:`, error);
      }
      return fallback;
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.request<void>('/api/v2/analytics/track/', {
        method: 'POST',
        data: event,
      });
    } catch (error) {
      if (isDevelopment()) {
        console.warn('Analytics tracking failed:', error);
      }
    }
  }

  async getDashboard(): Promise<DashboardData> {
    return this.safeRequest('/api/v2/analytics/dashboard/', {}, emptyDashboard);
  }

  async getUserInsights(): Promise<UserInsights> {
    return this.safeRequest('/api/v2/analytics/user-insights/', {}, {
      usage_patterns: {},
      favorite_categories: [],
      performance_metrics: {},
      recommendations: [],
    });
  }

  async getAllTemplateAnalytics(): Promise<TemplateAnalytics[]> {
    return this.safeRequest('/api/v2/analytics/template-analytics/', {}, []);
  }

  async getRecommendations(): Promise<TemplateList[]> {
    return this.safeRequest('/api/v2/analytics/recommendations/', {}, []);
  }

  async getABTests(): Promise<ABTest[]> {
    return this.safeRequest('/api/v2/analytics/ab-tests/', {}, []);
  }
}

export const analyticsService = new AnalyticsService();