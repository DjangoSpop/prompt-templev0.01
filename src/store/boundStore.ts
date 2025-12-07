/**
 * Core Zustand Store - Bound Store with all slices
 * Central state management for Prompt Temple
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { LearnerSlice } from './slices/learnerSlice';
import type { OptimizerSlice } from './slices/optimizerSlice';
import type { UserSlice } from './slices/userSlice';
import type { ReferralSlice } from './slices/referralSlice';
import type { AnalyticsSlice } from './slices/analyticsSlice';
import type { TemplateSlice } from './slices/templateSlice';

import { createLearnerSlice } from './slices/learnerSlice';
import { createOptimizerSlice } from './slices/optimizerSlice';
import { createUserSlice } from './slices/userSlice';
import { createReferralSlice } from './slices/referralSlice';
import { createAnalyticsSlice } from './slices/analyticsSlice';
import { createTemplateSlice } from './slices/templateSlice';

// ============================================
// Combined Store Type
// ============================================

export type BoundStore = LearnerSlice &
  OptimizerSlice &
  UserSlice &
  ReferralSlice &
  AnalyticsSlice &
  TemplateSlice;

// ============================================
// Store Creation
// ============================================

export const useBoundStore = create<BoundStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((...a) => ({
          ...createLearnerSlice(...a),
          ...createOptimizerSlice(...a),
          ...createUserSlice(...a),
          ...createReferralSlice(...a),
          ...createAnalyticsSlice(...a),
          ...createTemplateSlice(...a),
        })),
        {
          name: 'prompt-temple-storage',
          version: 1,
          partialize: (state) => ({
            // User data
            user: state.user,
            
            // Learning progress
            completedLessons: state.completedLessons,
            streak: state.streak,
            xp: state.xp,
            enrolledCourses: state.enrolledCourses,
            
            // Optimizer history (last 10)
            optimizationHistory: state.optimizationHistory.slice(0, 10),
            
            // Referral code
            referralCode: state.referralCode,
            
            // User preferences
            preferences: state.preferences,
          }),
          onRehydrateStorage: () => (state) => {
            console.log('[Store] Rehydrated from storage');
            
            // Update streak on app load
            if (state?.updateStreak) {
              state.updateStreak();
            }
          },
        }
      )
    ),
    {
      name: 'PromptTemple',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// Selector Hooks (Optimized)
// ============================================

// User selectors
export const useUser = () => useBoundStore((state) => state.user);
export const useIsAuthenticated = () => useBoundStore((state) => !!state.user);
export const useUserCredits = () => useBoundStore((state) => state.user?.credits ?? 0);
export const useUserPlan = () => useBoundStore((state) => state.user?.plan);

// Learning selectors
export const useXP = () => useBoundStore((state) => state.xp);
export const useStreak = () => useBoundStore((state) => state.streak);
export const useCompletedLessons = () => useBoundStore((state) => state.completedLessons);
export const useCurrentCourse = () => useBoundStore((state) => state.currentCourse);
export const useCurrentLesson = () => useBoundStore((state) => state.currentLesson);

// Optimizer selectors
export const useOptimizationState = () =>
  useBoundStore((state) => ({
    originalPrompt: state.originalPrompt,
    revisedPrompt: state.revisedPrompt,
    critiques: state.critiques,
    scoreBefore: state.scoreBefore,
    scoreAfter: state.scoreAfter,
    isOptimizing: state.isOptimizing,
  }));

export const useOptimizationHistory = () =>
  useBoundStore((state) => state.optimizationHistory);

// Referral selectors
export const useReferralCode = () => useBoundStore((state) => state.referralCode);
export const useReferralStats = () =>
  useBoundStore((state) => ({
    totalReferrals: state.totalReferrals,
    totalRewards: state.totalRewards,
    rank: state.leaderboardRank,
  }));

// Template selectors
export const useFavoriteTemplates = () =>
  useBoundStore((state) => state.favoriteTemplates);

export const useRecentTemplates = () =>
  useBoundStore((state) => state.recentTemplates);

// ============================================
// Action Hooks
// ============================================

// Learning actions
export const useLearningActions = () =>
  useBoundStore((state) => ({
    enroll: state.enroll,
    loadCourse: state.loadCourse,
    loadLesson: state.loadLesson,
    completeSlide: state.completeSlide,
    submitQuiz: state.submitQuiz,
    completeLesson: state.completeLesson,
  }));

// Optimizer actions
export const useOptimizerActions = () =>
  useBoundStore((state) => ({
    setOriginalPrompt: state.setOriginalPrompt,
    optimize: state.optimize,
    acceptRevision: state.acceptRevision,
    rejectRevision: state.rejectRevision,
    clearOptimization: state.clearOptimization,
  }));

// User actions
export const useUserActions = () =>
  useBoundStore((state) => ({
    login: state.login,
    logout: state.logout,
    updateProfile: state.updateProfile,
    updatePreferences: state.updatePreferences,
  }));

// Referral actions
export const useReferralActions = () =>
  useBoundStore((state) => ({
    generateReferralCode: state.generateReferralCode,
    claimReferral: state.claimReferral,
    loadLeaderboard: state.loadLeaderboard,
  }));

// Analytics actions
export const useAnalyticsActions = () =>
  useBoundStore((state) => ({
    trackEvent: state.trackEvent,
    trackPageView: state.trackPageView,
  }));

// ============================================
// Computed Selectors
// ============================================

export const useLearningProgress = () =>
  useBoundStore((state) => {
    if (!state.currentCourse) return 0;
    
    const totalLessons = state.currentCourse.lessons.length;
    const completed = state.completedLessons.filter((id) =>
      state.currentCourse?.lessons.some((lesson) => lesson.id === id)
    ).length;
    
    return Math.round((completed / totalLessons) * 100);
  });

export const useOptimizationDelta = () =>
  useBoundStore((state) => {
    if (!state.scoreBefore || !state.scoreAfter) return 0;
    return state.scoreAfter - state.scoreBefore;
  });

export const useUserLevel = () =>
  useBoundStore((state) => {
    const xp = state.xp;
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100));
  });

export const useXPToNextLevel = () =>
  useBoundStore((state) => {
    const currentLevel = Math.floor(Math.sqrt(state.xp / 100));
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
    return nextLevelXP - state.xp;
  });
