'use client';

import { useCallback } from 'react';
import { create } from 'zustand';
import { useEntitlements, useIsPremium } from '@/hooks/api/useBilling';

// --- Modal-only store (open/close state, no counters) ---
interface PaywallModalStore {
  modalOpen: boolean;
  modalTrigger: 'limit_reached' | 'high_score' | 'no_credits' | null;
  openModal: (trigger: PaywallModalStore['modalTrigger']) => void;
  closeModal: () => void;
}

export const usePaywallStore = create<PaywallModalStore>()((set) => ({
  modalOpen: false,
  modalTrigger: null,
  openModal: (trigger) => set({ modalOpen: true, modalTrigger: trigger }),
  closeModal: () => set({ modalOpen: false, modalTrigger: null }),
}));

export function usePaywallTrigger() {
  const { modalOpen, modalTrigger, openModal, closeModal } = usePaywallStore();

  // Real subscription status from the billing API
  const isPremium = useIsPremium();
  const { data: entitlements } = useEntitlements();

  const creditsAvailable = entitlements?.credits_available ?? null;
  const isSubscribed = isPremium;
  // Legacy: show count down for FREE users
  const usesRemaining = creditsAvailable ?? 0;
  const isCapped = !isSubscribed && creditsAvailable !== null && creditsAvailable <= 0;

  /**
   * Call before every optimization attempt.
   * Returns `true` if the user can proceed, `false` if they should be gated.
   */
  const checkAndTrigger = useCallback((): boolean => {
    if (isSubscribed) return true;

    // If entitlements are still loading, optimistically allow
    if (creditsAvailable === null) return true;

    if (creditsAvailable <= 0) {
      openModal('no_credits');
      return false;
    }

    // Soft nudge when only 5 or fewer credits remain (acts like the old "second_use" trigger)
    if (creditsAvailable <= 5) {
      setTimeout(() => openModal('limit_reached'), 800);
      return true; // Still allow the action
    }

    return true;
  }, [isSubscribed, creditsAvailable, openModal]);

  /**
   * Trigger high-score upsell modal after a great result.
   */
  const triggerOnHighScore = useCallback(
    (score: number) => {
      if (score >= 7.5 && !isSubscribed) {
        setTimeout(() => openModal('high_score'), 1500);
      }
    },
    [isSubscribed, openModal]
  );

  return {
    checkAndTrigger,
    triggerOnHighScore,
    closeModal,
    modalOpen,
    modalTrigger,
    usesRemaining,
    isSubscribed,
    isCapped,
    creditsAvailable,
    entitlements,
  };
}
