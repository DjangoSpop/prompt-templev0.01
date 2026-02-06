/**
 * PromptCraft Academy - State Management
 *
 * Zustand store for managing academy progress, quiz scores, and unlock status
 * Persists to localStorage for anonymous users and syncs to backend for authenticated users
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AcademyProgress, ModuleProgress, QuizAttempt } from '../academy/types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface AcademyState extends AcademyProgress {
  // Actions - Lesson Progress
  completeLesson: (moduleId: string, lessonId: string, timeSpent?: number) => void;
  markLessonViewed: (moduleId: string, lessonId: string) => void;

  // Actions - Quiz
  startQuiz: (moduleId: string) => void;
  submitQuiz: (moduleId: string, score: number, answers: Record<string, string>, timeSpent: number) => void;

  // Actions - Module Completion
  startModule: (moduleId: string) => void;
  completeModule: (moduleId: string) => void;

  // Actions - Unlock
  unlockModules: (method: 'email' | 'extension', email?: string) => void;
  checkModuleUnlock: (moduleId: string) => boolean;

  // Actions - Prompt IQ Test
  completePromptIQTest: (score: number) => void;

  // Actions - Interactive Components
  saveInteractiveState: (componentId: string, state: any) => void;

  // Actions - Certificate
  generateCertificate: (certificateId: string) => void;

  // Actions - Analytics & Time Tracking
  updateTimeSpent: (moduleId: string, additionalSeconds: number) => void;
  updateLastAccessed: () => void;

  // Actions - Reset
  resetProgress: () => void;
  resetModule: (moduleId: string) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AcademyProgress = {
  completedModules: [],
  moduleProgress: {},
  unlockedModules: ['module-1'],  // Module 1 is always free
  emailSubmitted: null,
  promptIQScore: null,
  promptIQCompleted: false,
  interactiveStates: {},
  certificateGenerated: false,
  certificateId: null,
  totalXPEarned: 0,
  totalTimeSpent: 0,
  startedAt: null,
  lastAccessed: null,
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // LESSON PROGRESS
      // ========================================================================

      completeLesson: (moduleId, lessonId, timeSpent = 0) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();
          const isAlreadyCompleted = currentProgress.lessonsCompleted.includes(lessonId);

          // Don't duplicate if already completed
          if (isAlreadyCompleted) {
            return state;
          }

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                lessonsCompleted: [...currentProgress.lessonsCompleted, lessonId],
                timeSpent: currentProgress.timeSpent + timeSpent,
                lastAccessed: new Date(),
              },
            },
            totalTimeSpent: state.totalTimeSpent + timeSpent,
            totalXPEarned: state.totalXPEarned + 20, // Base XP per lesson
            lastAccessed: new Date(),
          };
        });

        // Trigger gamification (will implement in integration step)
        // triggerXPReward(20);
      },

      markLessonViewed: (moduleId, lessonId) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                lastAccessed: new Date(),
              },
            },
            lastAccessed: new Date(),
          };
        });
      },

      // ========================================================================
      // QUIZ MANAGEMENT
      // ========================================================================

      startQuiz: (moduleId) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                lastAccessed: new Date(),
              },
            },
            lastAccessed: new Date(),
          };
        });
      },

      submitQuiz: (moduleId, score, answers, timeSpent) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();
          const newAttempts = currentProgress.quizAttempts + 1;
          const passed = score >= 70; // 70% passing score

          // Update quiz score only if it's better than previous
          const bestScore = currentProgress.quizScore
            ? Math.max(currentProgress.quizScore, score)
            : score;

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                quizScore: bestScore,
                quizAttempts: newAttempts,
                timeSpent: currentProgress.timeSpent + timeSpent,
                lastAccessed: new Date(),
              },
            },
            totalTimeSpent: state.totalTimeSpent + timeSpent,
            // Award XP only if passed
            totalXPEarned: passed ? state.totalXPEarned + 50 : state.totalXPEarned,
            lastAccessed: new Date(),
          };
        });

        // Trigger gamification
        // if (passed) triggerXPReward(50);
      },

      // ========================================================================
      // MODULE COMPLETION
      // ========================================================================

      startModule: (moduleId) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId];

          // If module already started, don't reinitialize
          if (currentProgress) {
            return {
              lastAccessed: new Date(),
            };
          }

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: createEmptyModuleProgress(),
            },
            startedAt: state.startedAt || new Date(),
            lastAccessed: new Date(),
          };
        });
      },

      completeModule: (moduleId) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();
          const isAlreadyCompleted = state.completedModules.includes(moduleId);

          // Don't duplicate if already completed
          if (isAlreadyCompleted) {
            return state;
          }

          return {
            completedModules: [...state.completedModules, moduleId],
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                completed: true,
                lastAccessed: new Date(),
              },
            },
            totalXPEarned: state.totalXPEarned + 100, // Base XP per module
            lastAccessed: new Date(),
          };
        });

        // Trigger gamification
        // triggerModuleCompletion(moduleId);
        // triggerXPReward(100);
        // triggerAchievement(`academy-${moduleId}`);
      },

      // ========================================================================
      // UNLOCK MANAGEMENT
      // ========================================================================

      unlockModules: (method, email) => {
        set((state) => {
          // Unlock all modules 2-5
          const newUnlockedModules = [
            'module-1',
            'module-2',
            'module-3',
            'module-4',
            'module-5',
          ];

          return {
            unlockedModules: newUnlockedModules,
            emailSubmitted: method === 'email' && email ? email : state.emailSubmitted,
            lastAccessed: new Date(),
          };
        });

        // Trigger analytics
        // trackAcademyEvent('academy_unlock_success', { method, email });
      },

      checkModuleUnlock: (moduleId) => {
        const state = get();
        return state.unlockedModules.includes(moduleId);
      },

      // ========================================================================
      // PROMPT IQ TEST
      // ========================================================================

      completePromptIQTest: (score) => {
        set((state) => ({
          promptIQScore: score,
          promptIQCompleted: true,
          totalXPEarned: state.totalXPEarned + 25, // Bonus XP for taking IQ test
          startedAt: state.startedAt || new Date(),
          lastAccessed: new Date(),
        }));

        // Trigger analytics
        // trackAcademyEvent('academy_iq_test_completed', { score });
      },

      // ========================================================================
      // INTERACTIVE COMPONENTS
      // ========================================================================

      saveInteractiveState: (componentId, componentState) => {
        set((state) => ({
          interactiveStates: {
            ...state.interactiveStates,
            [componentId]: componentState,
          },
          lastAccessed: new Date(),
        }));
      },

      // ========================================================================
      // CERTIFICATE
      // ========================================================================

      generateCertificate: (certificateId) => {
        set((state) => ({
          certificateGenerated: true,
          certificateId,
          lastAccessed: new Date(),
        }));

        // Trigger analytics
        // trackAcademyEvent('academy_certificate_generated', { certificateId });
      },

      // ========================================================================
      // TIME TRACKING
      // ========================================================================

      updateTimeSpent: (moduleId, additionalSeconds) => {
        set((state) => {
          const currentProgress = state.moduleProgress[moduleId] || createEmptyModuleProgress();

          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                ...currentProgress,
                timeSpent: currentProgress.timeSpent + additionalSeconds,
                lastAccessed: new Date(),
              },
            },
            totalTimeSpent: state.totalTimeSpent + additionalSeconds,
            lastAccessed: new Date(),
          };
        });
      },

      updateLastAccessed: () => {
        set({
          lastAccessed: new Date(),
        });
      },

      // ========================================================================
      // RESET ACTIONS
      // ========================================================================

      resetProgress: () => {
        set(initialState);
      },

      resetModule: (moduleId) => {
        set((state) => {
          const newProgress = { ...state.moduleProgress };
          delete newProgress[moduleId];

          return {
            completedModules: state.completedModules.filter((id) => id !== moduleId),
            moduleProgress: newProgress,
          };
        });
      },
    }),
    {
      name: 'promptcraft-academy-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields (exclude functions)
      partialize: (state) => ({
        completedModules: state.completedModules,
        moduleProgress: state.moduleProgress,
        unlockedModules: state.unlockedModules,
        emailSubmitted: state.emailSubmitted,
        promptIQScore: state.promptIQScore,
        promptIQCompleted: state.promptIQCompleted,
        interactiveStates: state.interactiveStates,
        certificateGenerated: state.certificateGenerated,
        certificateId: state.certificateId,
        totalXPEarned: state.totalXPEarned,
        totalTimeSpent: state.totalTimeSpent,
        startedAt: state.startedAt,
        lastAccessed: state.lastAccessed,
      }),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createEmptyModuleProgress(): ModuleProgress {
  return {
    lessonsCompleted: [],
    quizScore: null,
    quizAttempts: 0,
    timeSpent: 0,
    lastAccessed: new Date(),
    completed: false,
    startedAt: new Date(),
  };
}

// ============================================================================
// SELECTORS (for easier state access)
// ============================================================================

export const selectIsModuleUnlocked = (moduleId: string) => (state: AcademyState) =>
  state.unlockedModules.includes(moduleId);

export const selectIsModuleCompleted = (moduleId: string) => (state: AcademyState) =>
  state.completedModules.includes(moduleId);

export const selectModuleProgress = (moduleId: string) => (state: AcademyState) =>
  state.moduleProgress[moduleId];

export const selectLessonCompleted = (moduleId: string, lessonId: string) => (state: AcademyState) =>
  state.moduleProgress[moduleId]?.lessonsCompleted.includes(lessonId) || false;

export const selectOverallProgress = (state: AcademyState) => {
  const totalModules = 5;
  const completedCount = state.completedModules.length;
  return Math.round((completedCount / totalModules) * 100);
};

export const selectCanGenerateCertificate = (state: AcademyState) => {
  return state.completedModules.length === 5 && !state.certificateGenerated;
};
