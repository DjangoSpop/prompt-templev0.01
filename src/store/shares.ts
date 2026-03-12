/**
 * Share Modal State Management
 *
 * Zustand store for managing the share modal state and current share data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShareableArtifact } from '@/lib/sharing';

interface ShareModalState {
  // Modal state
  isOpen: boolean;
  artifact?: ShareableArtifact;
  shareUrl?: string;
  shareSlug?: string;
  isCreatingShare: boolean;
  shareCreated: boolean;

  // Actions
  openShareModal: (artifact: ShareableArtifact) => void;
  closeShareModal: () => void;
  setShareUrl: (url: string, slug: string) => void;
  setCreatingShare: (isCreating: boolean) => void;
  setShareCreated: (created: boolean) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  artifact: undefined,
  shareUrl: undefined,
  shareSlug: undefined,
  isCreatingShare: false,
  shareCreated: false,
};

export const useShareStore = create<ShareModalState>()(
  persist(
    (set) => ({
      ...initialState,

      openShareModal: (artifact) =>
        set({
          isOpen: true,
          artifact,
          shareUrl: undefined,
          shareSlug: undefined,
          shareCreated: false,
        }),

      closeShareModal: () =>
        set({
          isOpen: false,
          artifact: undefined,
          shareUrl: undefined,
          shareSlug: undefined,
          isCreatingShare: false,
        }),

      setShareUrl: (shareUrl, shareSlug) =>
        set({ shareUrl, shareSlug, shareCreated: true }),

      setCreatingShare: (isCreatingShare) => set({ isCreatingShare }),

      setShareCreated: (shareCreated) => set({ shareCreated }),

      reset: () => set(initialState),
    }),
    {
      name: 'share-modal-storage',
      partialize: (state) => ({
        // Only persist essential state, not the modal itself
        shareUrl: state.shareUrl,
        shareSlug: state.shareSlug,
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Check if a specific artifact is currently being shared
 */
export const useIsArtifactSharing = (artifactId: string) =>
  useShareStore((state) => state.artifact?.id === artifactId && state.isOpen);

/**
 * Get the current share URL if available
 */
export const useCurrentShareUrl = () =>
  useShareStore((state) => state.shareUrl);

/**
 * Get the current share slug if available
 */
export const useCurrentShareSlug = () =>
  useShareStore((state) => state.shareSlug);

/**
 * Check if share is currently being created
 */
export const useIsCreatingShare = () =>
  useShareStore((state) => state.isCreatingShare);
