import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  subcategory?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number;
  downloads: number;
  views: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  tags: string[];
  variables: TemplateVariable[];
  xpReward: number;
  isPremium: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  model?: string;
  tone?: string;
  language?: string;
  estimatedTokens?: number;
}

export interface TemplateVariable {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'textarea' | 'select' | 'multi-select' | 'number' | 'slider' | 'toggle';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select/multi-select
  min?: number; // For number/slider
  max?: number; // For number/slider
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface TemplateFilters {
  search: string;
  category: string;
  subcategory: string;
  difficulty: string[];
  rarity: string[];
  tags: string[];
  author: string;
  model: string[];
  tone: string[];
  language: string[];
  sortBy: 'popular' | 'rating' | 'newest' | 'xp' | 'alphabetical';
  viewMode: 'grid' | 'list';
  showPremiumOnly: boolean;
  showBookmarkedOnly: boolean;
}

export interface TemplatesState {
  // Templates data
  templates: Template[];
  filteredTemplates: Template[];
  selectedTemplate: Template | null;
  
  // Filters and search
  filters: TemplateFilters;
  quickFilters: {
    categories: { id: string; name: string; count: number }[];
    tags: { name: string; count: number }[];
    authors: { id: string; name: string; count: number }[];
  };
  
  // UI state
  loading: boolean;
  error: string | null;
  searchHistory: string[];
  recentTemplates: Template[];
  bookmarkedTemplates: Template[];
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface TemplatesActions {
  // Templates
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (template: Template | null) => void;
  useTemplate: (templateId: string) => void;
  
  // Bookmarks
  toggleBookmark: (templateId: string) => void;
  addToRecentTemplates: (template: Template) => void;
  
  // Filters and search
  updateFilters: (filters: Partial<TemplateFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  setSearch: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  
  // Data fetching
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  searchTemplates: (query: string) => Promise<void>;
}

const defaultFilters: TemplateFilters = {
  search: '',
  category: 'all',
  subcategory: '',
  difficulty: [],
  rarity: [],
  tags: [],
  author: '',
  model: [],
  tone: [],
  language: [],
  sortBy: 'popular',
  viewMode: 'grid',
  showPremiumOnly: false,
  showBookmarkedOnly: false,
};

const initialState: TemplatesState = {
  templates: [],
  filteredTemplates: [],
  selectedTemplate: null,
  filters: defaultFilters,
  quickFilters: {
    categories: [],
    tags: [],
    authors: [],
  },
  loading: false,
  error: null,
  searchHistory: [],
  recentTemplates: [],
  bookmarkedTemplates: [],
  currentPage: 1,
  itemsPerPage: 12,
  totalPages: 0,
};

export const useTemplatesStore = create<TemplatesState & TemplatesActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTemplates: (templates) => {
        set({ templates });
        get().applyFilters();
      },

      addTemplate: (template) => {
        set((state) => ({
          templates: [template, ...state.templates],
        }));
        get().applyFilters();
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        get().applyFilters();
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
        }));
        get().applyFilters();
      },

      selectTemplate: (template) => set({ selectedTemplate: template }),

      useTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (template) {
          get().updateTemplate(templateId, {
            lastUsed: new Date(),
            views: template.views + 1,
          });
          get().addToRecentTemplates(template);
        }
      },

      toggleBookmark: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (template) {
          const isBookmarked = !template.isBookmarked;
          get().updateTemplate(templateId, { isBookmarked });
          
          set((state) => ({
            bookmarkedTemplates: isBookmarked
              ? [template, ...state.bookmarkedTemplates.filter((t) => t.id !== templateId)]
              : state.bookmarkedTemplates.filter((t) => t.id !== templateId),
          }));
        }
      },

      addToRecentTemplates: (template) => {
        set((state) => ({
          recentTemplates: [
            template,
            ...state.recentTemplates.filter((t) => t.id !== template.id),
          ].slice(0, 10),
        }));
      },

      updateFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        }));
        get().applyFilters();
      },

      resetFilters: () => {
        set({ filters: defaultFilters, currentPage: 1 });
        get().applyFilters();
      },

      applyFilters: () => {
        const { templates, filters, currentPage, itemsPerPage } = get();
        
        let filtered = [...templates];

        // Apply search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(
            (template) =>
              template.title.toLowerCase().includes(searchTerm) ||
              template.description.toLowerCase().includes(searchTerm) ||
              template.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
              template.author.name.toLowerCase().includes(searchTerm)
          );
        }

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
          filtered = filtered.filter((template) => 
            template.category.toLowerCase().replace(/\s+/g, '-') === filters.category
          );
        }

        // Apply subcategory filter
        if (filters.subcategory) {
          filtered = filtered.filter((template) => template.subcategory === filters.subcategory);
        }

        // Apply difficulty filter
        if (filters.difficulty.length > 0) {
          filtered = filtered.filter((template) => filters.difficulty.includes(template.difficulty));
        }

        // Apply rarity filter
        if (filters.rarity.length > 0) {
          filtered = filtered.filter((template) => filters.rarity.includes(template.rarity));
        }

        // Apply tags filter
        if (filters.tags.length > 0) {
          filtered = filtered.filter((template) =>
            filters.tags.some((tag) => template.tags.includes(tag))
          );
        }

        // Apply author filter
        if (filters.author) {
          filtered = filtered.filter((template) => template.author.id === filters.author);
        }

        // Apply model filter
        if (filters.model.length > 0 && filters.model[0] !== 'all') {
          filtered = filtered.filter((template) => 
            template.model && filters.model.includes(template.model)
          );
        }

        // Apply tone filter
        if (filters.tone.length > 0 && filters.tone[0] !== 'all') {
          filtered = filtered.filter((template) => 
            template.tone && filters.tone.includes(template.tone)
          );
        }

        // Apply language filter
        if (filters.language.length > 0 && filters.language[0] !== 'all') {
          filtered = filtered.filter((template) => 
            template.language && filters.language.includes(template.language)
          );
        }

        // Apply premium filter
        if (filters.showPremiumOnly) {
          filtered = filtered.filter((template) => template.isPremium);
        }

        // Apply bookmarked filter
        if (filters.showBookmarkedOnly) {
          filtered = filtered.filter((template) => template.isBookmarked);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          switch (filters.sortBy) {
            case 'popular':
              return b.downloads - a.downloads;
            case 'rating':
              return b.rating - a.rating;
            case 'newest':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'xp':
              return b.xpReward - a.xpReward;
            case 'alphabetical':
              return a.title.localeCompare(b.title);
            default:
              return 0;
          }
        });

        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        set({
          filteredTemplates: filtered,
          totalPages,
        });
      },

      setSearch: (query) => {
        get().updateFilters({ search: query });
        if (query) {
          get().addToSearchHistory(query);
        }
      },

      addToSearchHistory: (query) => {
        if (!query.trim()) return;
        
        set((state) => ({
          searchHistory: [
            query,
            ...state.searchHistory.filter((q) => q !== query),
          ].slice(0, 10),
        }));
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      setPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (itemsPerPage) => {
        set({ itemsPerPage, currentPage: 1 });
        get().applyFilters();
      },

      fetchTemplates: async () => {
        try {
          set({ loading: true, error: null });
          // TODO: Replace with actual API call
          // const templates = await apiClient.templates.getAll();
          // get().setTemplates(templates);
          
          // For now, we'll use mock data if none exists
          const { templates } = get();
          if (templates.length === 0) {
            // The Library page already has mock data, so we'll skip this for now
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
        } finally {
          set({ loading: false });
        }
      },

      fetchTemplate: async (id) => {
        try {
          set({ loading: true, error: null });
          // TODO: Replace with actual API call
          // const template = await apiClient.templates.getById(id);
          // get().selectTemplate(template);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch template' });
        } finally {
          set({ loading: false });
        }
      },

      searchTemplates: async (query) => {
        try {
          set({ loading: true, error: null });
          // TODO: Replace with actual API call
          // const templates = await apiClient.templates.search(query);
          // get().setTemplates(templates);
          get().setSearch(query);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to search templates' });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'promptcraft-templates-store',
      partialize: (state) => ({
        filters: state.filters,
        searchHistory: state.searchHistory,
        recentTemplates: state.recentTemplates,
        bookmarkedTemplates: state.bookmarkedTemplates,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);