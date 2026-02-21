"use client";

import { useEffect } from 'react';
import { useGameStore, steps } from '@/lib/stores/gameStore';
import { useAuth } from '@/providers/AuthProvider';

export interface OnboardingHookReturn {
  isOnboardingActive: boolean;
  currentStep: number;
  completedSteps: string[];
  isFirstLogin: boolean;
  progress: number;
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  /** Call when the user hits a free-tier limit to show the upgrade modal */
  triggerLimitHit: () => void;
}

export const useOnboarding = (): OnboardingHookReturn => {
  const { user } = useAuth();
  const {
    onboarding,
    startOnboarding,
    completeStep,
    nextStep,
    skipOnboarding,
    resetOnboarding,
    markTriggerShown,
    shouldShowTrigger,
  } = useGameStore();

  // Calculate progress percentage — derived from the canonical steps array
  const totalSteps = steps.length;
  const progress = (onboarding.completedSteps.length / totalSteps) * 100;

  useEffect(() => {
    // Auto-start onboarding for new users
    if (user && onboarding.isFirstLogin && !onboarding.isActive) {
      startOnboarding();
    }
  }, [user, onboarding.isFirstLogin, onboarding.isActive, startOnboarding]);

  const triggerLimitHit = () => {
    if (shouldShowTrigger('limit')) {
      markTriggerShown('limit');
      // Dispatch a custom event that UserOnboarding listens to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboarding:limit-hit'));
      }
    }
  };

  return {
    isOnboardingActive: onboarding.isActive,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
    isFirstLogin: onboarding.isFirstLogin,
    progress,
    startOnboarding,
    completeStep,
    nextStep,
    skipOnboarding,
    resetOnboarding,
    triggerLimitHit,
  };
};

export default useOnboarding;
