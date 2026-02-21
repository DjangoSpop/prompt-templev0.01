'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, HelpCircle } from 'lucide-react';
import { useGameStore } from '@/lib/stores/gameStore';

interface OnboardingTriggerProps {
  variant?: 'button' | 'help' | 'floating';
  className?: string;
}

export const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { resetOnboarding } = useGameStore();

  const handleStart = () => {
    // Reset gamification state so the tour XP can be re-earned
    resetOnboarding();
    // Signal the single UserOnboarding instance in layout.tsx to open the tour.
    // This avoids mounting a duplicate UserOnboarding (which was causing double
    // TriggerManager, double event listeners, and the tour never actually opening).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('onboarding:start-tour'));
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg rounded-full p-4"
          aria-label="Restart temple tour"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (variant === 'help') {
    return (
      <Button
        onClick={handleStart}
        variant="ghost"
        size="sm"
        className={`text-muted-foreground ${className}`}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Take Tour
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStart}
      className={`bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 ${className}`}
    >
      <Play className="h-4 w-4 mr-2" />
      Start Temple Tour
    </Button>
  );
};

export default OnboardingTrigger;
