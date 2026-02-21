'use client';

import { FC, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/lib/stores/gameStore';
import { useAuth } from '@/providers/AuthProvider';

export type TriggerReason = 'returning-user' | 'inactivity' | 'limit-hit';

interface OnboardingTriggerManagerProps {
  onTrigger: (reason: TriggerReason) => void;
}

// Pages whose visit counts as "feature activity" — resets the inactivity clock
const FEATURE_PAGES = [
  '/templates',
  '/template-library',
  '/prompt-library',
  '/optimization',
  '/academy',
  '/dashboard',
  '/status',
  '/analysis',
];

/**
 * OnboardingTriggerManager
 *
 * Mounted once inside UserOnboarding (renders null — no UI).
 * Evaluates trigger conditions and calls onTrigger(reason) when one fires.
 *
 * Trigger hierarchy (stops at first match per session):
 *  1. returning-user  — 7+ days since last login
 *  2. inactivity      — 3+ days since last feature page visit
 *  3. limit-hit       — called imperatively via triggerLimitHit() in useOnboarding
 *
 * Each trigger respects a 24 h cooldown and a "shown" flag to prevent repeats.
 */
export const OnboardingTriggerManager: FC<OnboardingTriggerManagerProps> = ({ onTrigger }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const pathname = usePathname();

  const {
    onboarding,
    triggers,
    recordActivity,
    recordLogin,
    markTriggerShown,
    shouldShowTrigger,
  } = useGameStore();

  // ── Record feature-page activity ──────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    if (FEATURE_PAGES.some((p) => pathname.startsWith(p))) {
      recordActivity();
    }
  }, [pathname, isAuthenticated, recordActivity]);

  // ── Evaluate triggers on auth state or login ──────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    // Skip trigger evaluation during first-login onboarding
    if (onboarding.isFirstLogin) {
      recordLogin(); // Still record so we have a baseline for future sessions
      return;
    }

    // ⚠️ Check returning-user trigger BEFORE calling recordLogin().
    // recordLogin() sets lastLoginDate = now, which would make the
    // "7+ days since last login" check always fail on the same session.
    if (shouldShowTrigger('returning')) {
      markTriggerShown('returning');
      onTrigger('returning-user');
      recordLogin(); // Record the new login only after detection
      return;
    }

    // Now safe to record the current login timestamp
    recordLogin();

    // Trigger 2: Feature inactivity (3+ days no feature visit)
    if (shouldShowTrigger('inactivity')) {
      markTriggerShown('inactivity');
      onTrigger('inactivity');
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll every 5 min for inactivity while tab is open ─────
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (onboarding.isFirstLogin) return;
      if (shouldShowTrigger('inactivity')) {
        markTriggerShown('inactivity');
        onTrigger('inactivity');
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, onboarding.isFirstLogin, shouldShowTrigger, markTriggerShown, onTrigger]);

  return null;
};

export default OnboardingTriggerManager;
