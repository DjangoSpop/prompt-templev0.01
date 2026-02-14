/**
 * Saved Prompts Store (Zustand)
 * Manages prompt library state: saved prompts, iterations, UI modals
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type {
  SavedPrompt,
  PromptIteration,
  SavePromptModalState,
  IterationModalState,
  SavedPromptFilters,
  SavePromptRequest,
  SavedPromptStats,
} from '@/types/saved-prompts';

// ============================================
// Store State Interface
// ============================================

interface SavedPromptsState {
  // Data
  prompts: SavedPrompt[];
  currentPrompt: SavedPrompt | null;
  iterations: Record<string, PromptIteration[]>; // keyed by prompt id
  stats: SavedPromptStats | null;

  // Filters & Pagination
  filters: SavedPromptFilters;
  totalCount: number;
  currentPage: number;

  // UI State
  saveModal: SavePromptModalState;
  iterationModal: IterationModalState;
  isLoading: boolean;
  error: string | null;

  // Actions - Data
  setPrompts: (prompts: SavedPrompt[], totalCount?: number) => void;
  addPrompt: (prompt: SavedPrompt) => void;
  updatePrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  removePrompt: (id: string) => void;
  setCurrentPrompt: (prompt: SavedPrompt | null) => void;
  setIterations: (promptId: string, iterations: PromptIteration[]) => void;
  addIteration: (promptId: string, iteration: PromptIteration) => void;
  setStats: (stats: SavedPromptStats) => void;
  toggleFavorite: (id: string) => void;

  // Actions - Filters
  setFilters: (filters: Partial<SavedPromptFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;

  // Actions - UI
  openSaveModal: (config?: Partial<SavePromptModalState>) => void;
  closeSaveModal: () => void;
  openIterationModal: (prompt: SavedPrompt) => void;
  closeIterationModal: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed helpers
  getFavorites: () => SavedPrompt[];
  getByCategory: (category: string) => SavedPrompt[];
  getRecentlyUsed: (limit?: number) => SavedPrompt[];
}

// ============================================
// Default States
// ============================================

const defaultFilters: SavedPromptFilters = {
  sort_by: 'updated_at',
  sort_order: 'desc',
  page: 1,
  limit: 20,
};

const defaultSaveModal: SavePromptModalState = {
  isOpen: false,
  mode: 'create',
};

const defaultIterationModal: IterationModalState = {
  isOpen: false,
  prompt: null,
  iterations: [],
};

// ============================================
// Store Implementation
// ============================================

export const useSavedPromptsStore = create<SavedPromptsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        prompts: [],
        currentPrompt: null,
        iterations: {},
        stats: null,
        filters: defaultFilters,
        totalCount: 0,
        currentPage: 1,
        saveModal: defaultSaveModal,
        iterationModal: defaultIterationModal,
        isLoading: false,
        error: null,

        // Data actions
        setPrompts: (prompts, totalCount) =>
          set({
            prompts,
            ...(totalCount !== undefined ? { totalCount } : {}),
          }),

        addPrompt: (prompt) =>
          set((state) => ({
            prompts: [prompt, ...state.prompts],
            totalCount: state.totalCount + 1,
          })),

        updatePrompt: (id, updates) =>
          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
            ),
            currentPrompt:
              state.currentPrompt?.id === id
                ? { ...state.currentPrompt, ...updates, updated_at: new Date().toISOString() }
                : state.currentPrompt,
          })),

        removePrompt: (id) =>
          set((state) => ({
            prompts: state.prompts.filter((p) => p.id !== id),
            totalCount: Math.max(0, state.totalCount - 1),
            currentPrompt: state.currentPrompt?.id === id ? null : state.currentPrompt,
          })),

        setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

        setIterations: (promptId, iterations) =>
          set((state) => ({
            iterations: { ...state.iterations, [promptId]: iterations },
          })),

        addIteration: (promptId, iteration) =>
          set((state) => ({
            iterations: {
              ...state.iterations,
              [promptId]: [iteration, ...(state.iterations[promptId] || [])],
            },
          })),

        setStats: (stats) => set({ stats }),

        toggleFavorite: (id) =>
          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
            ),
          })),

        // Filter actions
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            currentPage: 1, // Reset page on filter change
          })),

        clearFilters: () =>
          set({ filters: defaultFilters, currentPage: 1 }),

        setPage: (page) =>
          set((state) => ({
            currentPage: page,
            filters: { ...state.filters, page },
          })),

        // UI actions
        openSaveModal: (config) =>
          set({
            saveModal: {
              ...defaultSaveModal,
              isOpen: true,
              ...config,
            },
          }),

        closeSaveModal: () =>
          set({ saveModal: defaultSaveModal }),

        openIterationModal: (prompt) =>
          set({
            iterationModal: {
              isOpen: true,
              prompt,
              iterations: get().iterations[prompt.id] || [],
            },
          }),

        closeIterationModal: () =>
          set({ iterationModal: defaultIterationModal }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Computed helpers
        getFavorites: () => get().prompts.filter((p) => p.is_favorite),

        getByCategory: (category) =>
          get().prompts.filter((p) => p.category === category),

        getRecentlyUsed: (limit = 10) =>
          [...get().prompts]
            .filter((p) => p.last_used_at)
            .sort((a, b) =>
              new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime()
            )
            .slice(0, limit),
      }),
      {
        name: 'saved-prompts-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist filters (not data - that comes from API)
          filters: state.filters,
        }),
      }
    ),
    { name: 'saved-prompts' }
  )
);
