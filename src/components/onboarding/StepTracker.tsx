"use client";

import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface StepTrackerProps {
  stepId: string;
  autoComplete?: boolean;
  children?: React.ReactNode;
}

export const StepTracker: React.FC<StepTrackerProps> = ({ 
  stepId, 
  autoComplete = true, 
  children 
}) => {
  const { completeStep, completedSteps } = useOnboarding();

  useEffect(() => {
    if (autoComplete && !completedSteps.includes(stepId)) {
      // Small delay to ensure the user has actually "seen" the step
      const timer = setTimeout(() => {
        completeStep(stepId);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stepId, autoComplete, completeStep, completedSteps]);

  if (children) {
    return <>{children}</>;
  }

  return null;
};

export default StepTracker;
