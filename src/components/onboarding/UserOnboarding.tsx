'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, Play, Book, Lightbulb, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/stores/gameStore';
import { useAuth } from '@/providers/AuthProvider';
import { GuidedTour } from './GuidedTour';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onStart: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onSkip, onStart }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg blur-xl"></div>
              <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-lg">
                <div className="text-6xl mb-4">🏛️</div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Prompt Temple</h1>
                <p className="text-amber-100">Your sacred sanctuary for AI prompt engineering mastery</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Ready to become a Prompt Master?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Take a quick guided tour to discover the power of professional prompt engineering
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <Book className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Prompt Library</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Explore & copy top prompts</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Optimizer</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Improve prompts instantly</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">My Temple</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Save & organize favorites</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onStart} size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                <Play className="h-5 w-5 mr-2" />
                Start Guided Tour
              </Button>
              <Button onClick={onSkip} variant="outline" size="lg">
                <SkipForward className="h-5 w-5 mr-2" />
                Skip Tour
              </Button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close welcome modal"
              title="Close welcome modal"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface UserOnboardingProps {
  autoStart?: boolean;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ autoStart = true }) => {
  const { user } = useAuth();
  const { onboarding, startOnboarding, skipOnboarding } = useGameStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Show welcome modal for new users
    if (autoStart && onboarding.isFirstLogin && user) {
      setShowWelcome(true);
    }
  }, [autoStart, onboarding.isFirstLogin, user]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
    startOnboarding();
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    skipOnboarding();
  };

  const handleCompleteTour = () => {
    setShowTour(false);
  };

  const handleCloseTour = () => {
    setShowTour(false);
    skipOnboarding();
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleSkipTour}
        onSkip={handleSkipTour}
        onStart={handleStartTour}
      />
      
      <GuidedTour
        isOpen={showTour}
        onClose={handleCloseTour}
        onComplete={handleCompleteTour}
      />
    </>
  );
};

export default UserOnboarding;
