"use client";

import { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
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
}

export const useOnboarding = (): OnboardingHookReturn => {
  const { user } = useAuth();
  const { 
    onboarding, 
    startOnboarding, 
    completeStep, 
    nextStep, 
    skipOnboarding, 
    resetOnboarding 
  } = useGameStore();

  // Calculate progress percentage
  const totalSteps = 6; // Based on our onboarding steps
  const progress = (onboarding.completedSteps.length / totalSteps) * 100;

  useEffect(() => {
    // Auto-start onboarding for new users
    if (user && onboarding.isFirstLogin && !onboarding.isActive) {
      startOnboarding();
    }
  }, [user, onboarding.isFirstLogin, onboarding.isActive, startOnboarding]);

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
  };
};

export default useOnboarding;
