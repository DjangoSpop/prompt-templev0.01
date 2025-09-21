import { BaseApiClient } from './base';
import type { components } from '../../types/api';
import { isDevelopment, features } from '../config/env';
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

// Mock data for development
const mockDashboardData: DashboardData = {
  total_templates_used: 42,
  total_renders: 186,
  favorite_categories: ['Productivity', 'Creative Writing', 'Analysis', 'Marketing', 'Educational'],
  recent_activity: [
    {
      template_name: 'Email Marketing Template',
      used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      category: 'Marketing'
    },
    {
      template_name: 'Code Review Assistant',
      used_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      category: 'Productivity'
    },
    {
      template_name: 'Creative Writing Prompt',
      used_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      category: 'Creative Writing'
    }
  ],
  gamification: {
    level: 7,
    experience_points: 2850,
    daily_streak: 12,
    achievements_unlocked: 8,
    badges_earned: 5,
    rank: 'Temple Adept',
    next_level_xp: 150
  }
};

const mockUserInsights: UserInsights = {
  usage_patterns: { peak_hours: [9, 14, 19], avg_session_duration: 25 },
  favorite_categories: ['Productivity', 'Creative Writing', 'Analysis'],
  performance_metrics: { success_rate: 0.87, avg_completion_time: 120 },
  recommendations: ['Try advanced templates', 'Explore team features']
};

const mockTemplateAnalytics: TemplateAnalytics[] = [
  {
    usage_count: 156,
    completion_rate: 0.92,
    average_rating: 4.6,
    user_feedback: [],
    performance_metrics: { avg_execution_time: 2.3 }
  }
];

const mockABTests: ABTest[] = [
  {
    id: 'test-1',
    name: 'New Template UI',
    status: 'active',
    variants: [{ name: 'Control', traffic: 0.5 }, { name: 'Variant A', traffic: 0.5 }],
    metrics: { conversion_rate: 0.12 }
  }
];

export class AnalyticsService extends BaseApiClient {
  private async safeRequest<T>(endpoint: string, config: any, fallback: T): Promise<T> {
    if (isDevelopment() && features.mockApi) {
      console.log(`Using mock data for ${endpoint} in development mode`);
      return fallback;
    }
    
    if (isDevelopment()) {
      try {
        return await this.request<T>(endpoint, config);
      } catch (error) {
        console.warn(`Analytics API ${endpoint} failed in development, using mock data:`, error);
        return fallback;
      }
    }
    return this.request<T>(endpoint, config);
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (isDevelopment() && features.mockApi) {
      console.log('Analytics event tracked (dev/mock mode):', event);
      return;
    }
    
    if (isDevelopment()) {
      try {
        return await this.request<void>('/api/v2/analytics/track/', {
          method: 'POST',
          data: event,
        });
      } catch (error) {
        console.warn('Analytics tracking failed in development:', error);
        return;
      }
    }
    
    return this.request<void>('/api/v2/analytics/track/', {
      method: 'POST',
      data: event,
    });
  }

  async getDashboard(): Promise<DashboardData> {
    return this.safeRequest('/api/v2/analytics/dashboard/', {}, mockDashboardData);
  }

  async getUserInsights(): Promise<UserInsights> {
    return this.safeRequest('/api/v2/analytics/user-insights/', {}, mockUserInsights);
  }

  async getAllTemplateAnalytics(): Promise<TemplateAnalytics[]> {
    return this.safeRequest('/api/v2/analytics/template-analytics/', {}, mockTemplateAnalytics);
  }

  async getRecommendations(): Promise<TemplateList[]> {
    return this.safeRequest('/api/v2/analytics/recommendations/', {}, []);
  }

  async getABTests(): Promise<ABTest[]> {
    return this.safeRequest('/api/v2/analytics/ab-tests/', {}, mockABTests);
  }
}

export const analyticsService = new AnalyticsService();