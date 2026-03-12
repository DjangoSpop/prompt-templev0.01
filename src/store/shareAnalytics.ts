/**
 * Share Analytics State Management
 *
 * Zustand store for tracking share visits and preventing duplicate
 * visit tracking from the same device.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShareVisitRecord {
  slug: string;
  visitedAt: string; // ISO timestamp
  visitorFingerprint?: string;
}

interface ShareAnalyticsState {
  // Current share page
  currentShareSlug: string | null;
  visitRecorded: boolean;

  // Visit history (for deduplication)
  visitHistory: ShareVisitRecord[];

  // Actions
  setCurrentShare: (slug: string) => void;
  setVisitRecorded: (slug: string, fingerprint?: string) => void;
  clearVisitRecorded: () => void;
  hasVisitedRecently: (slug: string, fingerprint?: string, windowMs?: number) => boolean;
  clearHistory: () => void;
}

const initialState = {
  currentShareSlug: null,
  visitRecorded: false,
  visitHistory: [],
};

export const useShareAnalyticsStore = create<ShareAnalyticsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentShare: (slug) =>
        set({
          currentShareSlug: slug,
          visitRecorded: false,
        }),

      setVisitRecorded: (slug, fingerprint) =>
        set((state) => ({
          visitRecorded: true,
          visitHistory: [
            ...state.visitHistory,
            {
              slug,
              visitedAt: new Date().toISOString(),
              visitorFingerprint: fingerprint,
            },
          ],
        })),

      clearVisitRecorded: () =>
        set({
          visitRecorded: false,
          currentShareSlug: null,
        }),

      hasVisitedRecently: (slug, fingerprint, windowMs = 3600000) => {
        // Default window: 1 hour
        const now = Date.now();
        const { visitHistory } = get();

        return visitHistory.some((visit) => {
          // Match by slug and optionally by fingerprint
          if (visit.slug !== slug) return false;
          if (fingerprint && visit.visitorFingerprint !== fingerprint) return false;

          // Check if within time window
          const visitTime = new Date(visit.visitedAt).getTime();
          return now - visitTime < windowMs;
        });
      },

      clearHistory: () =>
        set({
          visitHistory: [],
        }),
    }),
    {
      name: 'share-analytics-storage',
      // Limit history size to prevent storage bloat
      partialize: (state) => ({
        visitHistory: state.visitHistory.slice(-100), // Keep last 100 visits
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Get the current share page slug
 */
export const useCurrentShareSlug = () =>
  useShareAnalyticsStore((state) => state.currentShareSlug);

/**
 * Check if visit has been recorded for current share
 */
export const useVisitRecorded = () =>
  useShareAnalyticsStore((state) => state.visitRecorded);

/**
 * Get visit history
 */
export const useVisitHistory = () =>
  useShareAnalyticsStore((state) => state.visitHistory);
