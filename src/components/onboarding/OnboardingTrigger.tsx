'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, HelpCircle } from 'lucide-react';
import { UserOnboarding } from './UserOnboarding';
import { useGameStore } from '@/lib/stores/gameStore';

interface OnboardingTriggerProps {
  variant?: 'button' | 'help' | 'floating';
  className?: string;
}

export const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({ 
  variant = 'button',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { resetOnboarding } = useGameStore();

  const handleStart = () => {
    resetOnboarding();
    setIsOpen(true);
  };

  if (variant === 'floating') {
    return (
      <>
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg rounded-full p-4"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
        <UserOnboarding 
          autoStart={false}
        />
      </>
    );
  }

  if (variant === 'help') {
    return (
      <>
        <Button 
          onClick={handleStart}
          variant="ghost"
          size="sm"
          className={`text-muted-foreground ${className}`}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Take Tour
        </Button>
        {isOpen && (
          <UserOnboarding 
            autoStart={false}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button 
        onClick={handleStart}
        className={`bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 ${className}`}
      >
        <Play className="h-4 w-4 mr-2" />
        Start Temple Tour
      </Button>
      {isOpen && (
        <UserOnboarding 
          autoStart={false}
        />
      )}
    </>
  );
};

export default OnboardingTrigger;
