'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, SkipForward, Play, Book, Lightbulb, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/stores/gameStore';

interface TourStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  blockInteraction?: boolean;
  action?: {
    label: string;
    href: string;
    demo?: boolean; // If true, shows demo instead of navigating
  };
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Temple',
    description: 'Begin your journey to prompt engineering mastery',
    position: 'center',
    blockInteraction: true,
    content: (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🏛️</div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Welcome to Prompt Temple</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your sacred sanctuary for AI prompt engineering. Let&apos;s explore the three pillars of prompt mastery.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Book className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Library</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Lightbulb className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Optimizer</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">My Temple</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'navigation',
    title: 'Navigation Bar',
    description: 'Your gateway to all temple features',
    target: 'nav[class*="navbar"], header[class*="navbar"], .temple-navbar',
    position: 'bottom',
    blockInteraction: true,
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold">Temple Navigation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your command center for accessing all features
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm">Dashboard - Your progress overview</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm">Templates - The prompt library</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm">Optimizer - Enhance your prompts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm">Help - Learning resources</span>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Tip:</strong> Look for the tour button in the navigation to restart this guide anytime
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'library-intro',
    title: 'The Prompt Library',
    description: 'Discover the "Bible of Prompts"',
    target: '[href="/templates"], .templates-link',
    position: 'bottom',
    blockInteraction: false,
    action: {
      label: 'Explore Library',
      href: '/templates',
      demo: true,
    },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold">Prompt Library</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Curated collection of professional prompts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Browse & Filter</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Find prompts by category, model, or domain</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Copy & Save</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Use immediately or save to your temple</p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            🎯 <strong>Try it:</strong> Click the button below to visit the library (this won&apos;t interrupt the tour)
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'optimizer-intro',
    title: 'Prompt Optimizer',
    description: 'Transform prompts into masterpieces',
    target: '[href="/optimization"], .optimizer-link',
    position: 'bottom',
    blockInteraction: false,
    action: {
      label: 'Try Optimizer',
      href: '/optimization',
      demo: true,
    },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-lg font-bold">Prompt Optimizer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered prompt enhancement
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">Paste your raw prompt</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Any prompt, no matter how basic</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Select target model</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">GPT-4, Claude, DeepSeek, etc.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">Get optimized version</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">With detailed improvement rationale</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard-intro',
    title: 'Your Personal Temple',
    description: 'Command center and saved prompts',
    target: '[href="/"], .dashboard-link',
    position: 'bottom',
    blockInteraction: false,
    action: {
      label: 'View Dashboard',
      href: '/',
      demo: true,
    },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-bold">My Temple Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personal prompt sanctuary
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">📊 Progress Tracking</p>
            <p className="text-xs text-green-700 dark:text-green-300">Monitor your journey and achievements</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">🗂️ Saved Prompts</p>
            <p className="text-xs text-green-700 dark:text-green-300">Organize by tags and folders</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">📈 Analytics</p>
            <p className="text-xs text-green-700 dark:text-green-300">Usage patterns and optimization insights</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'completion',
    title: 'Tour Complete!',
    description: 'You\'re ready to master prompt engineering',
    position: 'center',
    blockInteraction: true,
    content: (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Welcome to the Temple!</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You&apos;re now ready to explore all features. Remember, you can always restart this tour from the navigation menu.
          </p>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-amber-900 dark:text-amber-100">Achievement Unlocked!</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Temple Initiate - Completed your first tour (+50 XP)
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="font-medium">Next Step</p>
              <p className="text-gray-600 dark:text-gray-400">Explore Library</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Then Try</p>
              <p className="text-gray-600 dark:text-gray-400">Optimize Prompt</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Finally</p>
              <p className="text-gray-600 dark:text-gray-400">Build Temple</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { completeStep, nextStep: gameNextStep } = useGameStore();

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Handle element highlighting
  useEffect(() => {
    if (!isOpen || !currentTourStep.target) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentTourStep.target);
    if (element) {
      setHighlightedElement(element);
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isOpen, currentTourStep.target]);

  // Handle interaction blocking
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const isOverlayClick = overlayRef.current?.contains(e.target as Node);
      const isHighlightedClick = highlightedElement?.contains(e.target as Node);
      
      // Block clicks if step requires it, unless it's the overlay or demo action
      if (currentTourStep.blockInteraction && !isOverlayClick && !isHighlightedClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow ESC to close tour
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Block other keyboard interactions during blocking steps
      if (currentTourStep.blockInteraction) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (currentTourStep.blockInteraction) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, currentTourStep.blockInteraction, highlightedElement, onClose]);

  const handleNext = () => {
    const step = tourSteps[currentStep];
    completeStep(step.id);
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      gameNextStep();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Complete all remaining steps
    for (let i = currentStep; i < tourSteps.length; i++) {
      completeStep(tourSteps[i].id);
    }
    gameNextStep();
    onClose();
  };

  const handleDemoAction = (href: string) => {
    // For demo actions, we can show a preview or navigate after tour
    console.log('Demo action:', href);
    // You could open a preview modal or store the action for after tour completion
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Background overlay with highlight cutout */}
        <div className="absolute inset-0">
          {highlightedElement && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(
                    ellipse at ${highlightedElement.getBoundingClientRect().left + highlightedElement.getBoundingClientRect().width / 2}px 
                    ${highlightedElement.getBoundingClientRect().top + highlightedElement.getBoundingClientRect().height / 2}px,
                    transparent ${Math.max(highlightedElement.getBoundingClientRect().width, highlightedElement.getBoundingClientRect().height) / 2 + 10}px,
                    rgba(0, 0, 0, 0.7) ${Math.max(highlightedElement.getBoundingClientRect().width, highlightedElement.getBoundingClientRect().height) / 2 + 20}px
                  )
                `,
              }}
            />
          )}
          {!highlightedElement && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          )}
        </div>

        {/* Highlight ring around target element */}
        {highlightedElement && (
          <div
            className="absolute pointer-events-none border-4 border-blue-500 rounded-lg shadow-lg"
            style={{
              left: highlightedElement.getBoundingClientRect().left - 4,
              top: highlightedElement.getBoundingClientRect().top - 4,
              width: highlightedElement.getBoundingClientRect().width + 8,
              height: highlightedElement.getBoundingClientRect().height + 8,
            }}
          />
        )}

        {/* Tour content - Fixed positioning for mobile */}
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
          <motion.div
            ref={overlayRef}
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl flex flex-col p-4 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[80vh] pointer-events-auto shadow-2xl"
            style={{
              ...(currentTourStep.position === 'center' && {
                position: 'relative',
              }),
              ...(currentTourStep.position === 'top' && highlightedElement && window.innerWidth >= 640 && {
                position: 'fixed',
                top: Math.max(20, highlightedElement.getBoundingClientRect().top - 350),
                left: Math.min(Math.max(20, highlightedElement.getBoundingClientRect().left + highlightedElement.getBoundingClientRect().width / 2 - 150), window.innerWidth - 320),
                transform: 'none',
              }),
              ...(currentTourStep.position === 'bottom' && highlightedElement && window.innerWidth >= 640 && {
                position: 'fixed',
                top: Math.min(highlightedElement.getBoundingClientRect().bottom + 20, window.innerHeight - 400),
                left: Math.min(Math.max(20, highlightedElement.getBoundingClientRect().left + highlightedElement.getBoundingClientRect().width / 2 - 150), window.innerWidth - 320),
                transform: 'none',
              }),
              ...(currentTourStep.position === 'left' && highlightedElement && window.innerWidth >= 640 && {
                position: 'fixed',
                top: Math.min(Math.max(20, highlightedElement.getBoundingClientRect().top + highlightedElement.getBoundingClientRect().height / 2 - 200), window.innerHeight - 400),
                left: Math.max(20, highlightedElement.getBoundingClientRect().left - 350),
                transform: 'none',
              }),
              ...(currentTourStep.position === 'right' && highlightedElement && window.innerWidth >= 640 && {
                position: 'fixed',
                top: Math.min(Math.max(20, highlightedElement.getBoundingClientRect().top + highlightedElement.getBoundingClientRect().height / 2 - 200), window.innerHeight - 400),
                left: Math.min(highlightedElement.getBoundingClientRect().right + 20, window.innerWidth - 320),
                transform: 'none',
              }),
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {currentTourStep.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentTourStep.description}
                </p>
              </div>
       <button
  type="button" // 1. explicit role
  aria-label="Close" // 2. accessible name
  onClick={onClose}
  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
>
  <X className="h-5 w-5" aria-hidden /> {/* icon is decorative */}
</button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Step {currentStep + 1} of {tourSteps.length}
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto mb-6">
              {currentTourStep.content}
            </div>

            {/* Demo Action */}
            {currentTourStep.action && (
              <div className="mb-4">
                <Button
                  onClick={() => {
                    if (currentTourStep.action?.demo) {
                      handleDemoAction(currentTourStep.action.href);
                    } else if (currentTourStep.action) {
                      window.open(currentTourStep.action.href, '_blank');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {currentTourStep.action.label}
                  {currentTourStep.action.demo && (
                    <Badge variant="secondary" className="ml-2">Demo</Badge>
                  )}
                </Button>
              </div>
            )}

            {/* Navigation - Optimized for mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handlePrev}
                variant="outline"
                size="sm"
                disabled={currentStep === 0}
                className="order-2 sm:order-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button onClick={handleSkip} variant="ghost" size="sm" className="flex-1 sm:flex-none">
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button onClick={handleNext} size="sm" className="flex-1 sm:flex-none">
                  {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default GuidedTour;
