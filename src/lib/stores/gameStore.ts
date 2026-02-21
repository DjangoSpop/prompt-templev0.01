import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: Date;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  targetPage: string;
  points: number;
  badge: string;
  category: string;
  requirements?: string[];
}

export interface UserLevel {
  level: number;
  title: string;
  color: string;
  requiredXP: number;
}

export interface GameState {
  // User progression
  user: {
    id: string | null;
    username: string | null;
    level: number;
    experience: number;
    totalPoints: number;
    streak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
  };

  // Onboarding
  onboarding: {
    isActive: boolean;
    currentStep: number;
    completedSteps: string[];
    isFirstLogin: boolean;
  };

  // Dynamic trigger tracking
  triggers: {
    lastTourShown: number | null;       // unix timestamp ms — controls 24h cooldown
    lastFeatureActivity: number | null; // unix timestamp ms — reset on feature page visit
    lastLoginDate: number | null;       // unix timestamp ms — set each login
    returningUserShown: boolean;        // prevent repeat returning-user modal
    inactivityShown: boolean;           // prevent repeat inactivity modal
    limitHitShown: boolean;             // prevent repeat limit-hit modal
    cooldownMs: number;                 // default 86400000 (24h)
  };
  
  // Achievements and Badges
  achievements: Achievement[];
  unlockedAchievements: string[];
  badges: Badge[];
  unlockedBadges: string[];
  
  // Daily challenges and quests
  dailyChallenges: {
    id: string;
    title: string;
    description: string;
    progress: number;
    maxProgress: number;
    points: number;
    expiresAt: Date;
    completed: boolean;
  }[];
  
  // Statistics
  stats: {
    templatesCreated: number;
    templatesUsed: number;
    collaborations: number;
    totalTimeSpent: number;
    favoriteCategory: string;
  };
  
  // Notifications
  notifications: {
    id: string;
    type: 'achievement' | 'level-up' | 'streak' | 'challenge' | 'points';
    title: string;
    description: string;
    icon: string;
    points?: number;
    timestamp: Date | string; // Can be Date object or string from localStorage
    read: boolean;
  }[];
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt Temple',
    description: 'Enter the sacred sanctuary of prompt engineering mastery',
    targetPage: '/',
    points: 50,
    badge: '🏛️',
    category: 'onboarding',
  },
  {
    id: 'library',
    title: 'Explore the Prompt Library',
    description: 'Discover the "Bible of Prompts" - curated best practices across industries',
    targetPage: '/templates',
    points: 100,
    badge: '�',
    category: 'exploration',
  },
  {
    id: 'optimizer',
    title: 'Try the Prompt Optimizer',
    description: 'Transform your raw prompts into professional, optimized versions',
    targetPage: '/optimization',
    points: 150,
    badge: '⚡',
    category: 'action',
    requirements: ['library'],
  },
  {
    id: 'my-temple',
    title: 'Build Your Personal Temple',
    description: 'Save and organize your favorite prompts in your sanctuary',
    targetPage: '/dashboard',
    points: 125,
    badge: '🏛️',
    category: 'organization',
    requirements: ['optimizer'],
  },
  {
    id: 'academy',
    title: 'Visit the Prompt Academy',
    description: 'Learn prompt engineering through interactive courses and challenges',
    targetPage: '/academy',
    points: 100,
    badge: '🎓',
    category: 'learning',
  },
  {
    id: 'analytics',
    title: 'Check Your Analytics',
    description: 'Monitor your usage, performance, and growth metrics',
    targetPage: '/status',
    points: 75,
    badge: '📊',
    category: 'insights',
  },
  {
    id: 'template-library',
    title: 'Explore the Template Library',
    description: 'Browse 750+ professional templates with advanced search and filtering',
    targetPage: '/template-library',
    points: 100,
    badge: '🗂️',
    category: 'exploration',
    requirements: ['library'],
  },
  {
    id: 'prompt-library',
    title: 'Build Your Prompt Library',
    description: 'Save, iterate, and version-control your own prompts',
    targetPage: '/prompt-library',
    points: 125,
    badge: '✍️',
    category: 'action',
    requirements: ['template-library'],
  },
  {
    id: 'upgrade-scribe',
    title: 'Unlock Temple Scribe',
    description: 'Unlimited credits and AI walkthrough for $3.99/month',
    targetPage: '/billing',
    points: 50,
    badge: '📜',
    category: 'monetization',
  },
];

const userLevels: UserLevel[] = [
  { level: 1, title: 'Temple Initiate', color: '#8B5CF6', requiredXP: 0 },
  { level: 2, title: 'Prompt Apprentice', color: '#06B6D4', requiredXP: 500 },
  { level: 3, title: 'Skilled Prompter', color: '#10B981', requiredXP: 1200 },
  { level: 4, title: 'Prompt Engineer', color: '#F59E0B', requiredXP: 2500 },
  { level: 5, title: 'Temple Craftsman', color: '#EF4444', requiredXP: 5000 },
  { level: 6, title: 'Prompt Architect', color: '#8B5CF6', requiredXP: 10000 },
  { level: 7, title: 'Temple Scholar', color: '#06B6D4', requiredXP: 20000 },
  { level: 8, title: 'Prompt Oracle', color: '#10B981', requiredXP: 35000 },
  { level: 9, title: 'Temple Master', color: '#F59E0B', requiredXP: 60000 },
  { level: 10, title: 'Temple Guardian', color: '#EF4444', requiredXP: 100000 },
];

interface GameActions {
  // User actions
  setUser: (user: Partial<GameState['user']>) => void;
  addExperience: (amount: number) => void;
  addPoints: (amount: number) => void;
  updateStreak: () => void;
  
  // Onboarding actions
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
  
  // Achievement actions
  unlockAchievement: (achievementId: string) => void;
  unlockBadge: (badgeId: string) => void;
  checkAchievements: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<GameState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Daily challenges
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  
  // Statistics
  updateStats: (stats: Partial<GameState['stats']>) => void;
  
  // Trigger actions
  recordActivity: () => void;
  recordLogin: () => void;
  markTriggerShown: (trigger: 'tour' | 'returning' | 'inactivity' | 'limit') => void;
  shouldShowTrigger: (trigger: 'returning' | 'inactivity' | 'limit') => boolean;

  // Utility
  getCurrentLevel: () => UserLevel;
  getNextLevel: () => UserLevel | null;
  getProgressToNextLevel: () => number;
  saveToAPI: () => Promise<void>;
  loadFromAPI: () => Promise<void>;
}

const initialState: GameState = {
  user: {
    id: null,
    username: null,
    level: 1,
    experience: 0,
    totalPoints: 0,
    streak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  },
  onboarding: {
    isActive: true,
    currentStep: 0,
    completedSteps: [],
    isFirstLogin: true,
  },
  triggers: {
    lastTourShown: null,
    lastFeatureActivity: null,
    lastLoginDate: null,
    returningUserShown: false,
    inactivityShown: false,
    limitHitShown: false,
    cooldownMs: 86400000, // 24 hours
  },
  achievements: [],
  unlockedAchievements: [],
  badges: [],
  unlockedBadges: [],
  dailyChallenges: [],
  stats: {
    templatesCreated: 0,
    templatesUsed: 0,
    collaborations: 0,
    totalTimeSpent: 0,
    favoriteCategory: '',
  },
  notifications: [],
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      addExperience: (amount) =>
        set((state) => {
          const newExperience = state.user.experience + amount;
          const currentLevel = get().getCurrentLevel();
          const nextLevel = get().getNextLevel();
          
          let newLevel = state.user.level;
          if (nextLevel && newExperience >= nextLevel.requiredXP) {
            newLevel = nextLevel.level;
            get().addNotification({
              type: 'level-up',
              title: 'Level Up!',
              description: `Congratulations! You've reached ${nextLevel.title}`,
              icon: '🎉',
            });
          }

          return {
            user: {
              ...state.user,
              experience: newExperience,
              level: newLevel,
            },
          };
        }),

      addPoints: (amount) =>
        set((state) => ({
          user: {
            ...state.user,
            totalPoints: state.user.totalPoints + amount,
          },
        })),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const lastActivity = state.user.lastActivityDate 
            ? new Date(state.user.lastActivityDate).toDateString()
            : null;
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
          
          let newStreak = state.user.streak;
          
          if (lastActivity === today) {
            // Already updated today
            return state;
          } else if (lastActivity === yesterday) {
            // Continue streak
            newStreak += 1;
          } else if (lastActivity !== yesterday && lastActivity !== today) {
            // Streak broken
            newStreak = 1;
          }

          const newLongestStreak = Math.max(newStreak, state.user.longestStreak);

          if (newStreak > 1) {
            get().addNotification({
              type: 'streak',
              title: `${newStreak} Day Streak!`,
              description: `Keep it up! You're on fire! 🔥`,
              icon: '🔥',
            });
          }

          return {
            user: {
              ...state.user,
              streak: newStreak,
              longestStreak: newLongestStreak,
              lastActivityDate: new Date(),
            },
          };
        }),

      startOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, isActive: true },
        })),

      completeStep: (stepId) =>
        set((state) => {
          if (state.onboarding.completedSteps.includes(stepId)) {
            return state;
          }

          const step = steps.find((s) => s.id === stepId);
          if (!step) return state;

          const newCompletedSteps = [...state.onboarding.completedSteps, stepId];
          
          get().addExperience(step.points);
          get().addNotification({
            type: 'achievement',
            title: 'Step Completed!',
            description: `${step.title} - Earned ${step.points} XP`,
            icon: step.badge,
            points: step.points,
          });

          return {
            onboarding: {
              ...state.onboarding,
              completedSteps: newCompletedSteps,
            },
          };
        }),

      nextStep: () =>
        set((state) => {
          if (state.onboarding.currentStep < steps.length - 1) {
            return {
              onboarding: {
                ...state.onboarding,
                currentStep: state.onboarding.currentStep + 1,
              },
            };
          } else {
            // Onboarding complete
            get().addNotification({
              type: 'achievement',
              title: 'Onboarding Complete!',
              description: 'Welcome to PromptCraft Temple! You\'re ready to create amazing content.',
              icon: '🏆',
            });
            
            return {
              onboarding: {
                ...state.onboarding,
                isActive: false,
                isFirstLogin: false,
              },
            };
          }
        }),

      skipOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            isActive: false,
            isFirstLogin: false,
          },
        })),

      completeOnboarding: () =>
        set((state) => {
          get().addNotification({
            type: 'achievement',
            title: 'Tour Complete! 🏆',
            description: "You've mastered the temple basics. Welcome aboard!",
            icon: '🏆',
          });
          return {
            onboarding: {
              ...state.onboarding,
              isActive: false,
              isFirstLogin: false,
            },
          };
        }),

      resetOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...initialState.onboarding,
            isActive: true,
            isFirstLogin: false,
          },
        })),

      unlockAchievement: (achievementId) =>
        set((state) => {
          if (state.unlockedAchievements.includes(achievementId)) {
            return state;
          }

          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement) return state;

          get().addExperience(achievement.points);
          get().addNotification({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            description: achievement.name,
            icon: achievement.icon,
            points: achievement.points,
          });

          return {
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
          };
        }),

      unlockBadge: (badgeId) =>
        set((state) => {
          if (state.unlockedBadges.includes(badgeId)) {
            return state;
          }

          const badge = state.badges.find((b) => b.id === badgeId);
          if (!badge) return state;

          get().addNotification({
            type: 'achievement',
            title: 'Badge Earned!',
            description: badge.name,
            icon: badge.icon,
          });

          return {
            unlockedBadges: [...state.unlockedBadges, badgeId],
          };
        }),

      checkAchievements: () => {
        const state = get();
        
        // Check various achievement conditions
        if (state.stats.templatesUsed >= 1 && !state.unlockedAchievements.includes('first-use')) {
          get().unlockAchievement('first-use');
        }
        
        if (state.stats.templatesCreated >= 1 && !state.unlockedAchievements.includes('first-creation')) {
          get().unlockAchievement('first-creation');
        }
        
        if (state.user.streak >= 7 && !state.unlockedAchievements.includes('week-streak')) {
          get().unlockAchievement('week-streak');
        }
      },

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep only last 50 notifications
        })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () =>
        set((state) => ({
          notifications: [],
        })),

      updateChallengeProgress: (challengeId, progress) =>
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map((challenge) =>
            challenge.id === challengeId
              ? { ...challenge, progress: Math.min(progress, challenge.maxProgress) }
              : challenge
          ),
        })),

      completeChallenge: (challengeId) =>
        set((state) => {
          const challenge = state.dailyChallenges.find((c) => c.id === challengeId);
          if (!challenge || challenge.completed) return state;

          get().addExperience(challenge.points);
          get().addNotification({
            type: 'challenge',
            title: 'Challenge Complete!',
            description: challenge.title,
            icon: '✅',
            points: challenge.points,
          });

          return {
            dailyChallenges: state.dailyChallenges.map((c) =>
              c.id === challengeId ? { ...c, completed: true, progress: c.maxProgress } : c
            ),
          };
        }),

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),

      getCurrentLevel: () => {
        const experience = get().user.experience;
        return (
          [...userLevels]
            .reverse()
            .find((level) => experience >= level.requiredXP) || userLevels[0]
        );
      },

      getNextLevel: () => {
        const currentLevel = get().getCurrentLevel();
        return userLevels.find((level) => level.level === currentLevel.level + 1) || null;
      },

      getProgressToNextLevel: () => {
        const experience = get().user.experience;
        const currentLevel = get().getCurrentLevel();
        const nextLevel = get().getNextLevel();
        
        if (!nextLevel) return 100;
        
        const currentLevelXP = currentLevel.requiredXP;
        const nextLevelXP = nextLevel.requiredXP;
        const progressXP = experience - currentLevelXP;
        const totalXPNeeded = nextLevelXP - currentLevelXP;
        
        return Math.min(100, (progressXP / totalXPNeeded) * 100);
      },

      recordActivity: () =>
        set((state) => ({
          triggers: { ...state.triggers, lastFeatureActivity: Date.now() },
        })),

      recordLogin: () =>
        set((state) => ({
          triggers: { ...state.triggers, lastLoginDate: Date.now() },
        })),

      markTriggerShown: (trigger) =>
        set((state) => {
          const now = Date.now();
          switch (trigger) {
            case 'tour':
              return { triggers: { ...state.triggers, lastTourShown: now } };
            case 'returning':
              return { triggers: { ...state.triggers, lastTourShown: now, returningUserShown: true } };
            case 'inactivity':
              return { triggers: { ...state.triggers, lastTourShown: now, inactivityShown: true } };
            case 'limit':
              return { triggers: { ...state.triggers, lastTourShown: now, limitHitShown: true } };
            default:
              return state;
          }
        }),

      shouldShowTrigger: (trigger) => {
        const { triggers } = get();
        const now = Date.now();
        // Global cooldown: never show within 24h of last trigger
        if (triggers.lastTourShown && now - triggers.lastTourShown < triggers.cooldownMs) {
          return false;
        }
        switch (trigger) {
          case 'returning':
            if (triggers.returningUserShown) return false;
            if (!triggers.lastLoginDate) return false;
            return now - triggers.lastLoginDate > 7 * 24 * 60 * 60 * 1000;
          case 'inactivity':
            if (triggers.inactivityShown) return false;
            if (!triggers.lastFeatureActivity) return false;
            return now - triggers.lastFeatureActivity > 3 * 24 * 60 * 60 * 1000;
          case 'limit':
            return !triggers.limitHitShown;
          default:
            return false;
        }
      },

      saveToAPI: async () => {
        try {
          const state = get();
          // TODO: Implement game progress API endpoint
          console.log('Game progress would be saved:', {
            user: state.user,
            onboarding: state.onboarding,
            achievements: state.unlockedAchievements,
            badges: state.unlockedBadges,
            stats: state.stats,
          });
          // For now, we'll skip the API call as the endpoint needs to be implemented
        } catch (error) {
          console.error('Failed to save game progress:', error);
        }
      },

      loadFromAPI: async () => {
        try {
          // Implementation would load from API
          // For now, we'll use localStorage persistence
        } catch (error) {
          console.error('Failed to load game progress:', error);
        }
      },
    }),
    {
      name: 'promptcraft-game-store',
      partialize: (state) => ({
        user: state.user,
        onboarding: state.onboarding,
        triggers: state.triggers,
        unlockedAchievements: state.unlockedAchievements,
        unlockedBadges: state.unlockedBadges,
        stats: state.stats,
        notifications: state.notifications.slice(0, 10), // Only persist recent notifications
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          
          // Convert date strings back to Date objects
          if (parsed.state?.user?.lastActivityDate) {
            parsed.state.user.lastActivityDate = new Date(parsed.state.user.lastActivityDate);
          }
          
          // Convert notification timestamps back to Date objects
          if (parsed.state?.notifications) {
            parsed.state.notifications = parsed.state.notifications.map((notification: any) => ({
              ...notification,
              timestamp: new Date(notification.timestamp)
            }));
          }
          
          // Convert daily challenge expiry dates
          if (parsed.state?.dailyChallenges) {
            parsed.state.dailyChallenges = parsed.state.dailyChallenges.map((challenge: any) => ({
              ...challenge,
              expiresAt: new Date(challenge.expiresAt)
            }));
          }
          
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export { steps, userLevels };