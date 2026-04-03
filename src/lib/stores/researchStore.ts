import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CardEventData, ResearchJob } from '@/lib/types/research';

interface ResearchState {
  // Active job
  activeJobId: string | null;
  activeJob: ResearchJob | null;
  streamingCards: CardEventData[];

  // UI state
  queryInput: string;
  selectedTab: 'results' | 'sources' | 'chunks';
  isSubmitting: boolean;

  // Actions
  setActiveJob: (jobId: string, job?: ResearchJob) => void;
  clearActiveJob: () => void;
  addStreamingCard: (card: CardEventData) => void;
  setQueryInput: (query: string) => void;
  setSelectedTab: (tab: 'results' | 'sources' | 'chunks') => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export const useResearchStore = create<ResearchState>()(
  devtools(
    (set) => ({
      activeJobId: null,
      activeJob: null,
      streamingCards: [],
      queryInput: '',
      selectedTab: 'results',
      isSubmitting: false,

      setActiveJob: (jobId, job) =>
        set({ activeJobId: jobId, activeJob: job ?? null, streamingCards: [] }),

      clearActiveJob: () =>
        set({ activeJobId: null, activeJob: null, streamingCards: [] }),

      addStreamingCard: (card) =>
        set((s) => ({ streamingCards: [...s.streamingCards, card] })),

      setQueryInput: (query) => set({ queryInput: query }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),

      reset: () =>
        set({
          activeJobId: null,
          activeJob: null,
          streamingCards: [],
          queryInput: '',
          selectedTab: 'results',
          isSubmitting: false,
        }),
    }),
    { name: 'research-store' }
  )
);
