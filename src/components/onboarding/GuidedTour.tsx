'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, SkipForward, Play,
  Book, Lightbulb, Star, Target,
  GraduationCap, Layers, PenLine, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/stores/gameStore';
import { trackOnboardingEvent } from '@/lib/analytics/onboarding-events';

// ─────────────────────────────────────────────────────────
// Responsive positioning utilities
// ─────────────────────────────────────────────────────────

type Breakpoint = 'mobile' | 'large-phone' | 'tablet' | 'desktop';

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'mobile';
  if (width < 768) return 'large-phone';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const TOOLTIP_W = 380;
const TOOLTIP_H = 480;
const MARGIN = 16;
const EDGE = 12;

interface TooltipPos {
  position: 'fixed' | 'relative';
  top?: number;
  left?: number;
  bottom?: number;
}

function fits(p: TooltipPos, vw: number, vh: number): boolean {
  const top = p.top ?? 0;
  const left = p.left ?? 0;
  return top >= EDGE && left >= EDGE && top + TOOLTIP_H <= vh - EDGE && left + TOOLTIP_W <= vw - EDGE;
}

function computeTooltipPosition(
  el: Element | null,
  side: TourStep['position'],
  vw: number,
  vh: number,
): TooltipPos {
  // Mobile: always full-width bottom sheet
  if (getBreakpoint(vw) === 'mobile') {
    return { position: 'fixed', bottom: 0, left: 0 };
  }

  // No target or explicit center → centred modal
  if (!el || side === 'center') {
    return {
      position: 'fixed',
      top: Math.round((vh - TOOLTIP_H) / 2),
      left: Math.round((vw - TOOLTIP_W) / 2),
    };
  }

  const r = el.getBoundingClientRect();
  const centreX = clamp(r.left + r.width / 2 - TOOLTIP_W / 2, EDGE, vw - TOOLTIP_W - EDGE);
  const centreY = clamp(r.top + r.height / 2 - TOOLTIP_H / 2, EDGE, vh - TOOLTIP_H - EDGE);

  const candidates: Record<NonNullable<TourStep['position']>, TooltipPos> = {
    bottom: { position: 'fixed', top: r.bottom + MARGIN, left: centreX },
    top:    { position: 'fixed', top: r.top - TOOLTIP_H - MARGIN, left: centreX },
    right:  { position: 'fixed', top: centreY, left: r.right + MARGIN },
    left:   { position: 'fixed', top: centreY, left: r.left - TOOLTIP_W - MARGIN },
    center: { position: 'fixed', top: Math.round((vh - TOOLTIP_H) / 2), left: Math.round((vw - TOOLTIP_W) / 2) },
  };

  const preferred = candidates[side ?? 'bottom'];
  if (fits(preferred, vw, vh)) return preferred;

  const fallbacks: NonNullable<TourStep['position']>[] = ['bottom', 'top', 'right', 'left', 'center'];
  for (const fb of fallbacks) {
    if (fb === side) continue;
    if (fits(candidates[fb], vw, vh)) return candidates[fb];
  }
  return candidates.center;
}

// ─────────────────────────────────────────────────────────
// Tour step definitions
// ─────────────────────────────────────────────────────────

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
    demo?: boolean;
  };
}

const tourSteps: TourStep[] = [
  // ── Step 1: Welcome ──────────────────────────────────
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
            Your sacred sanctuary for AI prompt engineering. Let&apos;s explore what awaits you.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Book className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium">Library</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-medium">Optimizer</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Star className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium">Academy</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 2: Navigation ───────────────────────────────
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
          {[
            'Dashboard — Your progress overview',
            'Templates — The prompt library',
            'Optimizer — Enhance your prompts',
            'Academy — Learn prompt engineering',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Tip:</strong> Click the help icon in the nav to restart this tour anytime.
          </p>
        </div>
      </div>
    ),
  },

  // ── Step 3: Prompt Library ───────────────────────────
  {
    id: 'library-intro',
    title: 'The Prompt Library',
    description: 'Discover the "Bible of Prompts"',
    target: '[href="/templates"], .templates-link',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'Explore Library', href: '/templates', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold">Prompt Library</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Curated collection of professional prompts</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Browse &amp; Filter</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Find prompts by category, model, or domain</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Copy &amp; Save</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Use immediately or save to your temple</p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            🎯 <strong>Try it:</strong> Click the button below to visit the library.
          </p>
        </div>
      </div>
    ),
  },

  // ── Step 4: Optimizer ────────────────────────────────
  {
    id: 'optimizer-intro',
    title: 'Prompt Optimizer',
    description: 'Transform prompts into masterpieces',
    target: '[href="/optimization"], .optimizer-link',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'Try Optimizer', href: '/optimization', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-lg font-bold">Prompt Optimizer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered prompt enhancement</p>
          </div>
        </div>
        {[
          { n: 1, title: 'Paste your raw prompt', sub: 'Any prompt, no matter how basic' },
          { n: 2, title: 'Select target model', sub: 'GPT-4, Claude, DeepSeek, etc.' },
          { n: 3, title: 'Get optimized version', sub: 'With detailed improvement rationale' },
        ].map(({ n, title, sub }) => (
          <div key={n} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-600">{n}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  // ── Step 5: Dashboard ────────────────────────────────
  {
    id: 'dashboard-intro',
    title: 'Your Personal Temple',
    description: 'Command center and saved prompts',
    target: '[href="/"], .dashboard-link',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'View Dashboard', href: '/', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-bold">My Temple Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your personal prompt sanctuary</p>
          </div>
        </div>
        {[
          { icon: '📊', label: 'Progress Tracking', sub: 'Monitor your journey and achievements' },
          { icon: '🗂️', label: 'Saved Prompts', sub: 'Organize by tags and folders' },
          { icon: '📈', label: 'Analytics', sub: 'Usage patterns and optimization insights' },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">{icon} {label}</p>
            <p className="text-xs text-green-700 dark:text-green-300">{sub}</p>
          </div>
        ))}
      </div>
    ),
  },

  // ── Step 6: Academy ──────────────────────────────────
  {
    id: 'academy-intro',
    title: 'The Prompt Academy',
    description: 'Master prompt engineering through 6 structured modules',
    target: '[href="/academy"], [data-onboarding="academy"]',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'Enter the Academy', href: '/academy', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-8 w-8 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold">The Sacred Academy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">6 modules from novice to Prompt Oracle</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium">Interactive Quizzes</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Test and reinforce your learning</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium">XP &amp; Badges</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Earn rewards for each module</p>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
          <p className="text-sm">
            🎓 Module 1 is free. Unlock all 6 modules with <strong>Temple Scribe</strong> or higher.
          </p>
        </div>
      </div>
    ),
  },

  // ── Step 7: Template Library ─────────────────────────
  {
    id: 'template-library-intro',
    title: 'Template Library',
    description: '750+ curated professional templates',
    target: '[href="/template-library"], [data-onboarding="template-library"]',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'Browse Templates', href: '/template-library', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-8 w-8 text-teal-500" />
          <div>
            <h3 className="text-lg font-bold">Advanced Template Library</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Filter by category, difficulty, model, and rating</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Advanced search with multi-filter',
            'Copy, download, or save to your library',
            'Free users: 5 templates. Scribes: 20.',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ── Step 8: Personal Prompt Library ─────────────────
  {
    id: 'prompt-library-intro',
    title: 'Your Prompt Library',
    description: 'CRUD workspace for your own prompt collection',
    target: '[href="/prompt-library"], [data-onboarding="prompt-library"]',
    position: 'bottom',
    blockInteraction: false,
    action: { label: 'Open Prompt Library', href: '/prompt-library', demo: true },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <PenLine className="h-8 w-8 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold">Personal Prompt Library</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create, save, iterate, and version your prompts</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium">Full CRUD Operations</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Create, read, update, delete prompts</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium">Iteration History</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Track changes and improvements over time</p>
          </div>
        </div>
      </div>
    ),
  },

  // ── Step 9: Upgrade CTA ──────────────────────────────
  {
    id: 'upgrade-scribe',
    title: 'Unlock Your Full Power',
    description: 'Temple Scribe — the entry step to unlimited AI assistance',
    position: 'center',
    blockInteraction: true,
    content: (
      <div className="text-center space-y-6">
        <div className="text-5xl mb-2">📜</div>
        <h3 className="text-xl font-bold">Become a Temple Scribe</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Unlock unlimited prompt enhancement credits, AI walkthrough assistance,
          and 20 custom templates for just <strong>$3.99/month</strong>.
        </p>
        <div className="space-y-2 text-left bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          {[
            'Unlimited prompt enhancement credits',
            'AI-powered walkthrough assistance',
            '20 custom templates (vs 5 free)',
            'Full Academy access — all 6 modules',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/billing"
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition"
          >
            Upgrade — $3.99/mo
          </a>
        </div>
      </div>
    ),
  },

  // ── Step 10: Completion ──────────────────────────────
  {
    id: 'completion',
    title: 'Tour Complete!',
    description: "You're ready to master prompt engineering",
    position: 'center',
    blockInteraction: true,
    content: (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Welcome to the Temple!</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You&apos;re now ready to explore all features. Restart this tour anytime from the navigation menu.
          </p>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-amber-900 dark:text-amber-100">Achievement Unlocked!</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Temple Initiate — Completed your first tour (+50 XP)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { icon: '📚', label: 'Explore Templates' },
              { icon: '⚡', label: 'Optimize Prompts' },
              { icon: '🎓', label: 'Visit Academy' },
              { icon: '✍️', label: 'Build Library' },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg mb-1">{icon}</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────
// GuidedTour component
// ─────────────────────────────────────────────────────────

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ position: 'relative' });
  const overlayRef = useRef<HTMLDivElement>(null);
  const { completeStep, nextStep: gameNextStep } = useGameStore();

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // ── Reduced-motion preference ──────────────────────
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Compute tooltip position ────────────────────────
  const computePos = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setTooltipPos(computeTooltipPosition(highlightedElement, currentTourStep.position, vw, vh));
  }, [highlightedElement, currentTourStep.position]);

  // ── Highlight target element ────────────────────────
  useEffect(() => {
    if (!isOpen || !currentTourStep.target) {
      setHighlightedElement(null);
      return;
    }
    const element = document.querySelector(currentTourStep.target);
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Re-compute after scroll settles
      const t = setTimeout(computePos, 350);
      return () => clearTimeout(t);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen, currentTourStep.target, computePos]);

  // ── Recompute on resize ─────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    computePos();
    window.addEventListener('resize', computePos);
    return () => window.removeEventListener('resize', computePos);
  }, [isOpen, computePos]);

  // ── Focus management ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => overlayRef.current?.focus(), 50);
    }
  }, [isOpen, currentStep]);

  // ── Interaction blocking ────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const inOverlay = overlayRef.current?.contains(e.target as Node);
      const inTarget = highlightedElement?.contains(e.target as Node);
      if (currentTourStep.blockInteraction && !inOverlay && !inTarget) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
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

  // ── Tour start timestamp (for duration tracking) ────
  const tourStartMs = useRef<number>(Date.now());
  useEffect(() => {
    if (isOpen) tourStartMs.current = Date.now();
  }, [isOpen]);

  // ── Track step view on step change ──────────────────
  useEffect(() => {
    if (!isOpen) return;
    trackOnboardingEvent({
      event: 'onboarding_step_viewed',
      step_id: currentTourStep.id,
      step_index: currentStep,
    });
  }, [isOpen, currentStep, currentTourStep.id]);

  // ── Navigation handlers ─────────────────────────────
  const handleNext = () => {
    const step = tourSteps[currentStep];
    completeStep(step.id);
    trackOnboardingEvent({
      event: 'onboarding_step_completed',
      step_id: step.id,
      step_index: currentStep,
      method: 'next',
    });

    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      trackOnboardingEvent({
        event: 'onboarding_completed',
        total_steps: tourSteps.length,
        duration_ms: Date.now() - tourStartMs.current,
      });
      gameNextStep();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    trackOnboardingEvent({
      event: 'onboarding_skipped',
      at_step_id: tourSteps[currentStep].id,
      at_step_index: currentStep,
    });
    for (let i = currentStep; i < tourSteps.length; i++) {
      completeStep(tourSteps[i].id);
    }
    gameNextStep();
    onClose();
  };

  const handleDemoAction = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  // Determine mobile bottom-sheet layout
  const isMobileSheet =
    typeof window !== 'undefined' && getBreakpoint(window.innerWidth) === 'mobile';

  const motionVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { scale: 0.9, opacity: 0, y: 20 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.9, opacity: 0, y: -20 } };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* ── Overlay / Spotlight ──────────────────────── */}
        {highlightedElement ? (
          // Box-shadow spotlight — geometry passed as CSS custom properties so
          // no CSS property values live in the inline style attribute.
          <div
            aria-hidden="true"
            className="tour-spotlight-ring"
            style={{
              '--spr-left': `${highlightedElement.getBoundingClientRect().left - 6}px`,
              '--spr-top': `${highlightedElement.getBoundingClientRect().top - 6}px`,
              '--spr-width': `${highlightedElement.getBoundingClientRect().width + 12}px`,
              '--spr-height': `${highlightedElement.getBoundingClientRect().height + 12}px`,
            } as React.CSSProperties}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
        )}

        {/* ── Tooltip panel ────────────────────────────── */}
        <motion.div
          ref={overlayRef}
          key={currentStep}
          role="dialog"
          aria-modal="true"
          aria-label={currentTourStep.title}
          tabIndex={-1}
          {...motionVariants}
          transition={{ duration: 0.2 }}
          className={[
            'bg-white dark:bg-gray-900 flex flex-col shadow-2xl pointer-events-auto',
            'outline-none focus:outline-none',
            isMobileSheet
              ? 'w-full max-h-[72vh] rounded-t-2xl fixed bottom-0 left-0 p-4 pb-[env(safe-area-inset-bottom)]'
              : 'rounded-2xl p-6 tour-tooltip-panel',
          ].join(' ')}
          style={
            // Position passed as CSS custom properties consumed by .tour-tooltip-panel in globals.css
            isMobileSheet
              ? undefined
              : {
                  '--ttp-position': tooltipPos.position,
                  '--ttp-top': tooltipPos.top !== undefined ? `${tooltipPos.top}px` : 'auto',
                  '--ttp-left': tooltipPos.left !== undefined ? `${tooltipPos.left}px` : 'auto',
                  '--ttp-bottom': tooltipPos.bottom !== undefined ? `${tooltipPos.bottom}px` : 'auto',
                } as React.CSSProperties
          }
        >
          {/* SR-only live region */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Step {currentStep + 1} of {tourSteps.length}: {currentTourStep.title}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {currentTourStep.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTourStep.description}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close tour"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4 flex-shrink-0">
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

          {/* Content (scrollable) */}
          <div className="flex-1 overflow-y-auto mb-4">
            {currentTourStep.content}
          </div>

          {/* Demo Action */}
          {currentTourStep.action && (
            <div className="mb-4 flex-shrink-0">
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
                <Play className="h-4 w-4 mr-2" aria-hidden />
                {currentTourStep.action.label}
                {currentTourStep.action.demo && (
                  <Badge variant="secondary" className="ml-2">Demo</Badge>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              className="order-2 sm:order-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
              Previous
            </Button>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button onClick={handleSkip} variant="ghost" size="sm" className="flex-1 sm:flex-none">
                <SkipForward className="h-4 w-4 mr-1" aria-hidden />
                Skip
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GuidedTour;
