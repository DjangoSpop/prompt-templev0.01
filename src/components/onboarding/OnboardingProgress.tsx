import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingProgressProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

const onboardingSteps = [
  { id: 'welcome', title: 'Welcome', badge: '🏛️' },
  { id: 'library', title: 'Library', badge: '📚' },
  { id: 'optimizer', title: 'Optimizer', badge: '⚡' },
  { id: 'my-temple', title: 'My Temple', badge: '🏛️' },
  { id: 'academy', title: 'Academy', badge: '🎓' },
  { id: 'analytics', title: 'Analytics', badge: '📊' },
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { 
    isOnboardingActive, 
    completedSteps, 
    progress, 
    startOnboarding 
  } = useOnboarding();

  if (!isOnboardingActive && completedSteps.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-900 dark:text-amber-100">
              Temple Journey
            </span>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            {completedSteps.length}/{onboardingSteps.length}
          </Badge>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2 mb-3" 
        />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {progress === 100 
              ? 'Journey Complete! 🎉' 
              : `${Math.round(progress)}% Complete`
            }
          </p>
          {!isOnboardingActive && progress < 100 && (
            <Button 
              onClick={startOnboarding}
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
          <Trophy className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Temple Journey Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete your onboarding to unlock all features
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {onboardingSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-lg mr-2">{step.badge}</span>
              <span className={`font-medium ${
                isCompleted 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {step.title}
              </span>
              {isCompleted && (
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Complete
                </Badge>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-3">
        <Progress 
          value={progress} 
          className="h-3" 
        />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {progress === 100 
              ? 'Congratulations! You\'ve mastered the Temple! 🎉' 
              : `${completedSteps.length} of ${onboardingSteps.length} steps completed`
            }
          </p>
          {!isOnboardingActive && progress < 100 && (
            <Button 
              onClick={startOnboarding}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Continue Journey
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
