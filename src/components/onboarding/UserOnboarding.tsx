'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, Play, Book, Lightbulb, Star, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/stores/gameStore';
import { useAuth } from '@/providers/AuthProvider';
import { GuidedTour } from './GuidedTour';
import { OnboardingTriggerManager, type TriggerReason } from './OnboardingTriggerManager';
import { trackOnboardingEvent } from '@/lib/analytics/onboarding-events';

// ─────────────────────────────────────────────────────────────
// Welcome modal (first-login)
// ─────────────────────────────────────────────────────────────

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
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Prompt Temple"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close welcome modal"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>

          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg blur-xl" />
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
                Take a quick guided tour to discover the Academy, Template Library, Prompt Library, and AI Optimizer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <Book className="h-8 w-8 text-blue-600 mx-auto mb-2" aria-hidden />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Template Library</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">750+ curated professional prompts</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" aria-hidden />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Optimizer</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">AI-powered prompt enhancement</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" aria-hidden />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Academy</h3>
                <p className="text-sm text-green-700 dark:text-green-300">6 modules from novice to Oracle</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStart}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Play className="h-5 w-5 mr-2" aria-hidden />
                Start Guided Tour
              </Button>
              <Button onClick={onSkip} variant="outline" size="lg">
                <SkipForward className="h-5 w-5 mr-2" aria-hidden />
                Skip Tour
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────
// Returning-user modal
// ─────────────────────────────────────────────────────────────

interface ReturningUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const ReturningUserModal: React.FC<ReturningUserModalProps> = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome back"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl rounded-b-none sm:rounded-2xl p-6 max-w-md w-full"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="text-center space-y-4">
            <div className="text-4xl">🏛️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Welcome Back, Scribe!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              It&apos;s been a while since your last visit. Want a quick refresher tour to see what&apos;s new?
            </p>
            <div className="flex gap-3">
              <Button onClick={onStart} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                Quick Tour
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                I&apos;m Good
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────
// Inactivity modal
// ─────────────────────────────────────────────────────────────

interface InactivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const InactivityModal: React.FC<InactivityModalProps> = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="You haven't visited recently"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl rounded-b-none sm:rounded-2xl p-6 max-w-md w-full"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="text-center space-y-4">
            <div className="text-4xl">⚡</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Your Temple Awaits
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You haven&apos;t visited your key features in a few days.
              Jump back into the Optimizer, Academy, or Template Library.
            </p>
            <div className="flex gap-3">
              <Button onClick={onStart} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                <Zap className="h-4 w-4 mr-2" aria-hidden />
                Show Me
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Later
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────
// Limit-hit modal (free tier limit reached)
// ─────────────────────────────────────────────────────────────

interface LimitHitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LimitHitModal: React.FC<LimitHitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Free tier limit reached"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl rounded-b-none sm:rounded-2xl p-6 max-w-md w-full"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" aria-hidden />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Free Limit Reached
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You&apos;ve hit your free tier limit. Upgrade to <strong>Temple Scribe</strong> for
              unlimited prompt enhancement credits and full Academy access.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-left space-y-2">
              {[
                'Unlimited prompt enhancement credits',
                'AI-powered walkthrough assistance',
                '20 custom templates (vs 5 free)',
                'Full Academy — all 6 modules',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <a
                href="/billing"
                className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition"
              >
                Upgrade — $3.99/mo
              </a>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Stay Free
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────
// UserOnboarding — root orchestrator
// ─────────────────────────────────────────────────────────────

export interface UserOnboardingProps {
  autoStart?: boolean;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ autoStart = true }) => {
  const { user } = useAuth();
  const { onboarding, startOnboarding, skipOnboarding, completeOnboarding } = useGameStore();

  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showReturning, setShowReturning] = useState(false);
  const [showInactivity, setShowInactivity] = useState(false);
  const [showLimitHit, setShowLimitHit] = useState(false);

  // Guard: track whether the user has already interacted with the welcome flow
  // this prevents the useEffect from re-opening the modal while the tour is running
  const welcomeShownRef = useRef(false);

  // Show welcome modal once for first-time users
  useEffect(() => {
    if (autoStart && onboarding.isFirstLogin && user && !welcomeShownRef.current) {
      welcomeShownRef.current = true;
      setShowWelcome(true);
    }
  }, [autoStart, onboarding.isFirstLogin, user]);

  // Listen for external "start tour now" events (from the restart-tour button)
  useEffect(() => {
    const handler = () => {
      welcomeShownRef.current = true;
      setShowWelcome(false);
      setShowTour(true);
    };
    window.addEventListener('onboarding:start-tour', handler);
    return () => window.removeEventListener('onboarding:start-tour', handler);
  }, []);

  // Listen for limit-hit events dispatched by useOnboarding().triggerLimitHit()
  useEffect(() => {
    const handler = () => setShowLimitHit(true);
    window.addEventListener('onboarding:limit-hit', handler);
    return () => window.removeEventListener('onboarding:limit-hit', handler);
  }, []);

  // Handle trigger callbacks from TriggerManager
  const handleTrigger = useCallback((reason: TriggerReason) => {
    const triggerMap: Record<TriggerReason, 'returning_user' | 'inactivity' | 'limit_hit'> = {
      'returning-user': 'returning_user',
      'inactivity': 'inactivity',
      'limit-hit': 'limit_hit',
    };
    trackOnboardingEvent({ event: 'trigger_fired', trigger_type: triggerMap[reason] });

    switch (reason) {
      case 'returning-user':
        setShowReturning(true);
        break;
      case 'inactivity':
        setShowInactivity(true);
        break;
      case 'limit-hit':
        setShowLimitHit(true);
        break;
    }
  }, []);

  const handleStartTour = (trigger: 'first_login' | 'manual' | 'returning_user' | 'inactivity' = 'manual') => {
    // Prevent the welcome-modal useEffect from re-firing while tour is open
    welcomeShownRef.current = true;
    trackOnboardingEvent({ event: 'onboarding_started', trigger });
    setShowWelcome(false);
    setShowReturning(false);
    setShowInactivity(false);
    setShowTour(true);
    startOnboarding();
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    skipOnboarding();
  };

  const handleCompleteTour = () => {
    completeOnboarding(); // sets isFirstLogin: false, isActive: false in store
    setShowTour(false);
  };
  const handleCloseTour = () => {
    setShowTour(false);
    skipOnboarding();
  };

  return (
    <>
      <OnboardingTriggerManager onTrigger={handleTrigger} />

      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleSkipTour}
        onSkip={handleSkipTour}
        onStart={() => handleStartTour('first_login')}
      />

      <ReturningUserModal
        isOpen={showReturning}
        onClose={() => {
          trackOnboardingEvent({ event: 'trigger_dismissed', trigger_type: 'returning_user' });
          setShowReturning(false);
        }}
        onStart={() => handleStartTour('returning_user')}
      />

      <InactivityModal
        isOpen={showInactivity}
        onClose={() => {
          trackOnboardingEvent({ event: 'trigger_dismissed', trigger_type: 'inactivity' });
          setShowInactivity(false);
        }}
        onStart={() => handleStartTour('inactivity')}
      />

      <LimitHitModal
        isOpen={showLimitHit}
        onClose={() => {
          trackOnboardingEvent({ event: 'trigger_dismissed', trigger_type: 'limit_hit' });
          setShowLimitHit(false);
        }}
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
