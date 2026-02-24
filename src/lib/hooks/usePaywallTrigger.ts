'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaywallStore {
  freeUses: number;
  isSubscribed: boolean;
  modalOpen: boolean;
  modalTrigger: 'second_use' | 'limit_reached' | 'high_score' | null;
  increment: () => void;
  setSubscribed: (v: boolean) => void;
  openModal: (trigger: PaywallStore['modalTrigger']) => void;
  closeModal: () => void;
}

export const usePaywallStore = create<PaywallStore>()(
  persist(
    (set) => ({
      freeUses: 0,
      isSubscribed: false,
      modalOpen: false,
      modalTrigger: null,
      increment: () => set((s) => ({ freeUses: s.freeUses + 1 })),
      setSubscribed: (v) => set({ isSubscribed: v }),
      openModal: (trigger) => set({ modalOpen: true, modalTrigger: trigger }),
      closeModal: () => set({ modalOpen: false, modalTrigger: null }),
    }),
    { name: 'prompttemple_paywall' }
  )
);

export const FREE_DAILY_LIMIT = 3;

export function usePaywallTrigger() {
  const { freeUses, isSubscribed, increment, openModal, closeModal, modalOpen, modalTrigger } =
    usePaywallStore();

  /**
   * Call this after every successful optimization.
   * Returns `true` if the user can proceed, `false` if paywalled.
   */
  const checkAndTrigger = useCallback((): boolean => {
    if (isSubscribed) return true;

    increment();
    const newCount = freeUses + 1;

    if (newCount === 2) {
      // Soft nudge on 2nd use
      setTimeout(() => openModal('second_use'), 800);
      return true;
    }

    if (newCount > FREE_DAILY_LIMIT) {
      openModal('limit_reached');
      return false;
    }

    return true;
  }, [freeUses, isSubscribed, increment, openModal]);

  /**
   * Call this when a wow score > 7.5 is achieved to show share + upsell.
   */
  const triggerOnHighScore = useCallback(
    (score: number) => {
      if (score >= 7.5 && !isSubscribed && freeUses >= 2) {
        setTimeout(() => openModal('high_score'), 1500);
      }
    },
    [isSubscribed, freeUses, openModal]
  );

  const usesRemaining = Math.max(0, FREE_DAILY_LIMIT - freeUses);

  return {
    checkAndTrigger,
    triggerOnHighScore,
    closeModal,
    modalOpen,
    modalTrigger,
    freeUses,
    usesRemaining,
    isSubscribed,
    isCapped: !isSubscribed && freeUses >= FREE_DAILY_LIMIT,
  };
}
