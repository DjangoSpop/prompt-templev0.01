import { BaseApiClient } from './base';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  total_required: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  level: number;
  experience_points: number;
  rank: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  reward_points: number;
  expires_at: string;
  completed: boolean;
}

interface UserLevel {
  current_level: number;
  experience_points: number;
  points_to_next_level: number;
  level_name: string;
  level_benefits: string[];
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_type: string;
  last_activity: string;
}

export class GamificationService extends BaseApiClient {
  async getAchievements(): Promise<Achievement[]> {
    return this.request<Achievement[]>('/api/v2/gamification/achievements/');
  }

  async getBadges(): Promise<Badge[]> {
    return this.request<Badge[]>('/api/v2/gamification/badges/');
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`/api/v2/gamification/leaderboard/?limit=${limit}`);
  }

  async getDailyChallenges(): Promise<DailyChallenge[]> {
    return this.request<DailyChallenge[]>('/api/v2/gamification/daily-challenges/');
  }

  async getUserLevel(): Promise<UserLevel> {
    return this.request<UserLevel>('/api/v2/gamification/user-level/');
  }

  async getStreak(): Promise<StreakData> {
    return this.request<StreakData>('/api/v2/gamification/streak/');
  }
}

export const gamificationService = new GamificationService();