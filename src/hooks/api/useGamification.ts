/**
 * Gamification hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';

// Query keys
export const gamificationKeys = {
  all: ['gamification'] as const,
  achievements: () => [...gamificationKeys.all, 'achievements'] as const,
  badges: () => [...gamificationKeys.all, 'badges'] as const,
  leaderboard: (limit?: number) => [...gamificationKeys.all, 'leaderboard', limit] as const,
  challenges: () => [...gamificationKeys.all, 'challenges'] as const,
  level: () => [...gamificationKeys.all, 'level'] as const,
  streak: () => [...gamificationKeys.all, 'streak'] as const,
};

export function useAchievements() {
  return useQuery({
    queryKey: gamificationKeys.achievements(),
    queryFn: () => apiClient.getAchievements(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: gamificationKeys.badges(),
    queryFn: () => apiClient.getBadges(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(limit),
    queryFn: () => apiClient.getLeaderboard(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

export function useDailyChallenges() {
  return useQuery({
    queryKey: gamificationKeys.challenges(),
    queryFn: () => apiClient.getDailyChallenges(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}

export function useUserLevel() {
  return useQuery({
    queryKey: gamificationKeys.level(),
    queryFn: () => apiClient.getUserLevel(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: gamificationKeys.streak(),
    queryFn: () => apiClient.getStreak(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
