import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/** Low-credit threshold — show warning at this balance or below */
const LOW_CREDIT_THRESHOLD = 10;

export interface CreditsState {
  /** Latest known credit balance — synced from X-Credits-Remaining response header */
  creditsRemaining: number | null;
  /** Credits currently reserved by in-flight optimistic deductions */
  creditsReserved: number;
  /** Effective available balance (remaining - reserved) */
  creditsAvailable: number;
  /** Credits spent on the last completed AI action */
  creditsUsedLastAction: number | null;
  /** Current plan code from entitlements */
  planCode: string;
  /** True when X-Low-Credits: true header is received OR balance <= threshold */
  isLowCredits: boolean;
  /** True when balance is 0 or depleted */
  isDepleted: boolean;
  /** Whether the upgrade modal is open */
  upgradeModalOpen: boolean;
  /** The feature that triggered the upgrade modal (for contextual copy) */
  upgradeModalFeature: string | null;
  /** Persisted — don't show the low-credit banner again until next session */
  creditBannerDismissed: boolean;
  /** Timestamp of last balance sync */
  lastSyncedAt: number;

  // Actions
  syncFromHeaders: (
    remaining: number | null,
    used: number | null,
    low: boolean,
    /** Raw balance from X-Credits-Balance header (total, before reserved) */
    balance?: number | null,
    /** Server-side reserved from X-Credits-Reserved header */
    reserved?: number | null,
  ) => void;
  /** Set plan code from entitlements */
  setPlan: (planCode: string) => void;
  /** Optimistically deduct credits before an API call completes */
  deductOptimistic: (amount: number) => void;
  /** Refund an optimistic deduction (e.g. on error) */
  refundOptimistic: (amount: number) => void;
  openUpgradeModal: (feature: string) => void;
  closeUpgradeModal: () => void;
  dismissCreditBanner: () => void;
  resetBannerDismiss: () => void;
  /** Full reset on logout */
  reset: () => void;
  /** Clear persisted localStorage entry (called on logout) */
  clearPersisted: () => void;
}

export const useCreditsStore = create<CreditsState>()(
  devtools(
    persist(
      (set) => ({
        creditsRemaining: null,
        creditsReserved: 0,
        creditsAvailable: 0,
        creditsUsedLastAction: null,
        planCode: 'FREE',
        isLowCredits: false,
        isDepleted: false,
        upgradeModalOpen: false,
        upgradeModalFeature: null,
        creditBannerDismissed: false,
        lastSyncedAt: 0,

        syncFromHeaders: (remaining, used, low, balance, reserved) => {
          set((state) => {
            // Prefer X-Credits-Balance (total) when available; fall back to
            // X-Credits-Remaining which already has reserved subtracted.
            const effectiveBalance = balance ?? remaining ?? state.creditsRemaining ?? 0;
            // If the server tells us its reserved count, clear local optimistic
            // reservations — the server is the source of truth.
            const effectiveReserved = reserved != null ? reserved : state.creditsReserved;
            const available = Math.max(0, effectiveBalance - effectiveReserved);
            const isLow = low || available <= LOW_CREDIT_THRESHOLD;
            return {
              creditsRemaining: effectiveBalance,
              creditsReserved: effectiveReserved,
              creditsAvailable: available,
              creditsUsedLastAction: used ?? state.creditsUsedLastAction,
              isLowCredits: isLow,
              isDepleted: available <= 0,
              lastSyncedAt: Date.now(),
              // Re-show banner if credits become low again
              creditBannerDismissed: isLow ? false : state.creditBannerDismissed,
            };
          });
        },

        setPlan: (planCode) => {
          set({ planCode });
        },

        deductOptimistic: (amount) => {
          set((state) => {
            const newReserved = state.creditsReserved + amount;
            const balance = state.creditsRemaining ?? 0;
            const available = Math.max(0, balance - newReserved);
            return {
              creditsReserved: newReserved,
              creditsAvailable: available,
              isLowCredits: available <= LOW_CREDIT_THRESHOLD,
              isDepleted: available <= 0,
            };
          });
        },

        refundOptimistic: (amount) => {
          set((state) => {
            const newReserved = Math.max(0, state.creditsReserved - amount);
            const balance = state.creditsRemaining ?? 0;
            const available = Math.max(0, balance - newReserved);
            return {
              creditsReserved: newReserved,
              creditsAvailable: available,
              isLowCredits: available <= LOW_CREDIT_THRESHOLD,
              isDepleted: available <= 0,
            };
          });
        },

        openUpgradeModal: (feature) => {
          set({ upgradeModalOpen: true, upgradeModalFeature: feature });
        },

        closeUpgradeModal: () => {
          set({ upgradeModalOpen: false, upgradeModalFeature: null });
        },

        dismissCreditBanner: () => {
          set({ creditBannerDismissed: true });
        },

        resetBannerDismiss: () => {
          set({ creditBannerDismissed: false });
        },

        reset: () => {
          set({
            creditsRemaining: null,
            creditsReserved: 0,
            creditsAvailable: 0,
            creditsUsedLastAction: null,
            planCode: 'FREE',
            isLowCredits: false,
            isDepleted: false,
            upgradeModalOpen: false,
            upgradeModalFeature: null,
            creditBannerDismissed: false,
            lastSyncedAt: 0,
          });
        },

        clearPersisted: () => {
          // Clear the persisted localStorage entry to prevent stale data
          // from being restored on next session/page reload
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('prompt-temple-credits');
              console.log('✅ Cleared persisted credits from localStorage');
            } catch (error) {
              console.error('Failed to clear persisted credits:', error);
            }
          }
        },
      }),
      {
        name: 'prompt-temple-credits',
        // Do NOT persist creditsRemaining — the backend is the single source of
        // truth. Persisting it causes stale balances to appear when the user
        // logs out and back in (the localStorage value overwrites the fresh API
        // response for the first render). We only persist UI-only state.
        partialize: (state) => ({
          creditBannerDismissed: state.creditBannerDismissed,
          planCode: state.planCode,
        }),
      }
    ),
    { name: 'credits-store' }
  )
);
