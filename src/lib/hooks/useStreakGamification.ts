'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackEvent } from '@/lib/analytics/trackEvent';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // ISO date string YYYY-MM-DD
  totalOptimizations: number;
  todayOptimizations: number;
  lastOptimizationDate: string | null;
  xp: number;
  level: number;
  badges: string[];
}

interface StreakStore extends StreakState {
  recordActivity: () => void;
  addXP: (amount: number) => void;
  resetStreak: () => void;
  getCurrentLevel: () => { name: string; minXP: number; maxXP: number; color: string };
  getProgress: () => number; // 0-100
}

const LEVELS = [
  { name: 'Apprentice', minXP: 0, maxXP: 100, color: '#9CA3AF' },
  { name: 'Scribe', minXP: 100, maxXP: 300, color: '#60A5FA' },
  { name: 'Vizier', minXP: 300, maxXP: 700, color: '#A78BFA' },
  { name: 'High Priest', minXP: 700, maxXP: 1500, color: '#F5C518' },
  { name: 'Grand Vizier', minXP: 1500, maxXP: 3000, color: '#F97316' },
  { name: 'Pharaoh', minXP: 3000, maxXP: Infinity, color: '#F5C518' },
];

function getLevel(xp: number) {
  return LEVELS.findLast(l => xp >= l.minXP) || LEVELS[0];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalOptimizations: 0,
      todayOptimizations: 0,
      lastOptimizationDate: null,
      xp: 0,
      level: 0,
      badges: [],

      recordActivity: () => {
        const today = todayISO();
        const { lastActiveDate, currentStreak, longestStreak, totalOptimizations, todayOptimizations, lastOptimizationDate } = get();

        let newStreak = currentStreak;
        let todayOpts = todayOptimizations;

        // Streak logic
        if (lastActiveDate === today) {
          // Already active today — just increment optimizations
        } else if (lastActiveDate && isYesterday(lastActiveDate)) {
          newStreak = currentStreak + 1;
          todayOpts = 0;
          if (newStreak === 7) {
            trackEvent('streak_milestone', { days: 7 });
          }
        } else if (lastActiveDate !== today) {
          newStreak = 1;
          todayOpts = 0;
        }

        // Today optimizations counter
        if (lastOptimizationDate !== today) todayOpts = 0;
        todayOpts += 1;

        const newTotal = totalOptimizations + 1;
        const newLongest = Math.max(longestStreak, newStreak);

        // XP calculation
        const xpGained = 10 + (newStreak > 1 ? newStreak * 2 : 0);

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          totalOptimizations: newTotal,
          todayOptimizations: todayOpts,
          lastOptimizationDate: today,
        });

        get().addXP(xpGained);
      },

      addXP: (amount: number) => {
        set(state => {
          const newXP = state.xp + amount;
          const newLevel = LEVELS.findIndex(l => newXP >= l.minXP && newXP < l.maxXP);
          return { xp: newXP, level: Math.max(0, newLevel) };
        });
      },

      resetStreak: () => {
        set({ currentStreak: 0, lastActiveDate: null });
      },

      getCurrentLevel: () => {
        return getLevel(get().xp);
      },

      getProgress: () => {
        const level = getLevel(get().xp);
        const { xp } = get();
        if (level.maxXP === Infinity) return 100;
        return Math.min(100, Math.round(((xp - level.minXP) / (level.maxXP - level.minXP)) * 100));
      },
    }),
    { name: 'prompttemple_streak' }
  )
);

/** Hook to use streak + gamification in components */
export function useStreakGamification() {
  const store = useStreakStore();

  const recordOptimization = useCallback(() => {
    store.recordActivity();
  }, [store]);

  return {
    streak: store.currentStreak,
    longestStreak: store.longestStreak,
    totalOptimizations: store.totalOptimizations,
    todayOptimizations: store.todayOptimizations,
    xp: store.xp,
    level: store.getCurrentLevel(),
    progress: store.getProgress(),
    recordOptimization,
  };
}
