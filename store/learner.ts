/**
 * Learner Store
 * 
 * Manages learning module state, progress tracking, and course enrollment.
 * 
 * Features:
 * - Course enrollment and progress tracking
 * - Quiz completion and scoring
 * - Certificate generation
 * - Lesson completion state
 * - Learning analytics
 * 
 * @module store/learner
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  User,
  Course,
  Lesson,
  Quiz,
  Certificate,
  LearningProgress,
  QuizAttempt,
} from '@/types/core';
import { api } from '@/lib/api/client';
import { handleError } from '@/lib/errors/error-handler';
import { toast } from 'sonner';

/**
 * Learner State Interface
 */
interface LearnerState {
  // ===== State =====
  currentUser: User | null;
  enrolledCourses: Course[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  learningProgress: Record<string, LearningProgress>;
  certificates: Certificate[];
  quizAttempts: QuizAttempt[];
  
  // Loading states
  isLoadingCourses: boolean;
  isLoadingProgress: boolean;
  isSubmittingQuiz: boolean;
  
  // ===== Actions =====
  
  // User management
  setUser: (user: User | null) => void;
  
  // Course management
  fetchEnrolledCourses: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  unenrollFromCourse: (courseId: string) => Promise<void>;
  setCurrentCourse: (course: Course | null) => void;
  
  // Lesson management
  setCurrentLesson: (lesson: Lesson | null) => void;
  markLessonComplete: (lessonId: string) => Promise<void>;
  
  // Progress tracking
  fetchLearningProgress: () => Promise<void>;
  updateProgress: (courseId: string, progress: Partial<LearningProgress>) => Promise<void>;
  
  // Quiz management
  submitQuizAttempt: (quizId: string, answers: Record<string, any>) => Promise<QuizAttempt>;
  fetchQuizAttempts: (courseId: string) => Promise<void>;
  
  // Certificate management
  fetchCertificates: () => Promise<void>;
  generateCertificate: (courseId: string) => Promise<Certificate>;
  
  // Utilities
  reset: () => void;
}

/**
 * Initial State
 */
const initialState = {
  currentUser: null,
  enrolledCourses: [],
  currentCourse: null,
  currentLesson: null,
  learningProgress: {},
  certificates: [],
  quizAttempts: [],
  isLoadingCourses: false,
  isLoadingProgress: false,
  isSubmittingQuiz: false,
};

/**
 * Learner Store
 */
export const useLearnerStore = create<LearnerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ===== User Management =====
        
        setUser: (user) => {
          set({ currentUser: user });
          if (!user) {
            // Clear user-specific data on logout
            set({
              enrolledCourses: [],
              currentCourse: null,
              currentLesson: null,
              learningProgress: {},
              certificates: [],
              quizAttempts: [],
            });
          }
        },

        // ===== Course Management =====
        
        fetchEnrolledCourses: async () => {
          set({ isLoadingCourses: true });
          try {
            const response = await api.courses.getEnrolled();
            set({ 
              enrolledCourses: response.data || [],
              isLoadingCourses: false,
            });
          } catch (error) {
            set({ isLoadingCourses: false });
            handleError(error, {
              title: 'Failed to load courses',
              description: 'Could not fetch your enrolled courses.',
            });
          }
        },

        enrollInCourse: async (courseId) => {
          try {
            const response = await api.courses.enroll(courseId);
            const newCourse = response.data;
            
            set((state) => ({
              enrolledCourses: [...state.enrolledCourses, newCourse],
            }));

            toast.success('Enrolled successfully', {
              description: `You are now enrolled in ${newCourse.title}`,
            });
          } catch (error) {
            handleError(error, {
              title: 'Enrollment failed',
              description: 'Could not enroll in the course.',
            });
            throw error;
          }
        },

        unenrollFromCourse: async (courseId) => {
          try {
            await api.courses.unenroll(courseId);
            
            set((state) => ({
              enrolledCourses: state.enrolledCourses.filter(
                (course) => course.id !== courseId
              ),
              currentCourse: state.currentCourse?.id === courseId 
                ? null 
                : state.currentCourse,
            }));

            toast.success('Unenrolled successfully');
          } catch (error) {
            handleError(error, {
              title: 'Unenrollment failed',
              description: 'Could not unenroll from the course.',
            });
            throw error;
          }
        },

        setCurrentCourse: (course) => {
          set({ currentCourse: course, currentLesson: null });
        },

        // ===== Lesson Management =====
        
        setCurrentLesson: (lesson) => {
          set({ currentLesson: lesson });
        },

        markLessonComplete: async (lessonId) => {
          const { currentCourse } = get();
          if (!currentCourse) {
            toast.error('No active course');
            return;
          }

          try {
            await api.lessons.markComplete(lessonId);
            
            // Update progress
            const currentProgress = get().learningProgress[currentCourse.id];
            if (currentProgress) {
              const updatedProgress = {
                ...currentProgress,
                lessonsCompleted: [...currentProgress.lessonsCompleted, lessonId],
                progressPercentage: Math.min(
                  100,
                  ((currentProgress.lessonsCompleted.length + 1) / 
                   currentCourse.lessons.length) * 100
                ),
                lastAccessedAt: new Date().toISOString(),
              };

              set((state) => ({
                learningProgress: {
                  ...state.learningProgress,
                  [currentCourse.id]: updatedProgress,
                },
              }));
            }

            toast.success('Lesson completed! 🎉');
          } catch (error) {
            handleError(error, {
              title: 'Failed to mark lesson complete',
            });
            throw error;
          }
        },

        // ===== Progress Tracking =====
        
        fetchLearningProgress: async () => {
          set({ isLoadingProgress: true });
          try {
            const response = await api.learning.getProgress();
            const progressMap: Record<string, LearningProgress> = {};
            
            response.data?.forEach((progress) => {
              progressMap[progress.courseId] = progress;
            });

            set({ 
              learningProgress: progressMap,
              isLoadingProgress: false,
            });
          } catch (error) {
            set({ isLoadingProgress: false });
            handleError(error, {
              title: 'Failed to load progress',
            });
          }
        },

        updateProgress: async (courseId, progressUpdate) => {
          try {
            const response = await api.learning.updateProgress(courseId, progressUpdate);
            
            set((state) => ({
              learningProgress: {
                ...state.learningProgress,
                [courseId]: response.data,
              },
            }));
          } catch (error) {
            handleError(error, {
              title: 'Failed to update progress',
            });
            throw error;
          }
        },

        // ===== Quiz Management =====
        
        submitQuizAttempt: async (quizId, answers) => {
          set({ isSubmittingQuiz: true });
          try {
            const response = await api.quizzes.submit(quizId, answers);
            const attempt = response.data;
            
            set((state) => ({
              quizAttempts: [...state.quizAttempts, attempt],
              isSubmittingQuiz: false,
            }));

            // Show result
            const passed = attempt.score >= (attempt.passingScore || 70);
            toast[passed ? 'success' : 'error'](
              passed ? 'Quiz passed! 🎉' : 'Quiz not passed',
              {
                description: `Score: ${attempt.score}% ${
                  passed ? '- Great job!' : '- Try again!'
                }`,
              }
            );

            return attempt;
          } catch (error) {
            set({ isSubmittingQuiz: false });
            handleError(error, {
              title: 'Failed to submit quiz',
            });
            throw error;
          }
        },

        fetchQuizAttempts: async (courseId) => {
          try {
            const response = await api.quizzes.getAttempts(courseId);
            set({ quizAttempts: response.data || [] });
          } catch (error) {
            handleError(error, {
              title: 'Failed to load quiz attempts',
            });
          }
        },

        // ===== Certificate Management =====
        
        fetchCertificates: async () => {
          try {
            const response = await api.certificates.getAll();
            set({ certificates: response.data || [] });
          } catch (error) {
            handleError(error, {
              title: 'Failed to load certificates',
            });
          }
        },

        generateCertificate: async (courseId) => {
          try {
            const response = await api.certificates.generate(courseId);
            const certificate = response.data;
            
            set((state) => ({
              certificates: [...state.certificates, certificate],
            }));

            toast.success('Certificate generated! 🏆', {
              description: 'Your certificate is ready to download.',
            });

            return certificate;
          } catch (error) {
            handleError(error, {
              title: 'Failed to generate certificate',
            });
            throw error;
          }
        },

        // ===== Utilities =====
        
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'prompt-temple-learner',
        partialize: (state) => ({
          // Only persist essential data
          enrolledCourses: state.enrolledCourses,
          learningProgress: state.learningProgress,
          certificates: state.certificates,
        }),
      }
    ),
    { name: 'LearnerStore' }
  )
);

/**
 * Selector Hooks for Performance
 */

// Get current course progress
export const useCurrentCourseProgress = () => {
  return useLearnerStore((state) => {
    if (!state.currentCourse) return null;
    return state.learningProgress[state.currentCourse.id];
  });
};

// Get course completion status
export const useCourseCompletion = (courseId: string) => {
  return useLearnerStore((state) => {
    const progress = state.learningProgress[courseId];
    return progress?.progressPercentage === 100;
  });
};

// Get total XP earned
export const useTotalXP = () => {
  return useLearnerStore((state) => {
    return Object.values(state.learningProgress).reduce(
      (total, progress) => total + (progress.xpEarned || 0),
      0
    );
  });
};

// Check if lesson is completed
export const useIsLessonComplete = (lessonId: string) => {
  return useLearnerStore((state) => {
    if (!state.currentCourse) return false;
    const progress = state.learningProgress[state.currentCourse.id];
    return progress?.lessonsCompleted.includes(lessonId) || false;
  });
};
