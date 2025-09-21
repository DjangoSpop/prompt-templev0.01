import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface TemplateSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  author: string;
  rating: number;
  usage_count: number;
  is_featured: boolean;
  is_premium: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiline' | 'boolean';
  label: string;
  description?: string;
  default_value?: any;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplateDetail extends TemplateSummary {
  content: string;
  variables: TemplateVariable[];
  examples?: string[];
  metadata?: Record<string, any>;
}

export interface TemplateFilters {
  category?: string;
  search?: string;
  tags?: string[];
  isPremium?: boolean;
  sortBy?: 'rating' | 'usage' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplatesState {
  list: TemplateSummary[];
  details: Record<string, TemplateDetail>;
  filters: TemplateFilters;
  loading: boolean;
  error?: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  setList: (templates: TemplateSummary[]) => void;
  setDetail: (id: string, template: TemplateDetail) => void;
  setFilters: (filters: TemplateFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setPagination: (page: number, totalCount: number) => void;
  fetch: () => Promise<void>;
  fetchById: (id: string) => Promise<TemplateDetail | null>;
  rate: (id: string, value: number) => Promise<void>;
  clearFilters: () => void;
}

export const useTemplatesStore = create<TemplatesState>()(
  devtools(
    persist(
      (set, get) => ({
        list: [],
        details: {},
        filters: {},
        loading: false,
        error: undefined,
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        
        setList: (templates) => set({ list: templates }),
        
        setDetail: (id, template) => 
          set((state) => ({
            details: { ...state.details, [id]: template }
          })),
        
        setFilters: (filters) => set({ filters, currentPage: 1 }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),
        
        setPagination: (page, totalCount) => 
          set({ currentPage: page, totalCount }),
        
        clearFilters: () => set({ filters: {}, currentPage: 1 }),
        
        fetch: async () => {
          const state = get();
          state.setLoading(true);
          state.setError(undefined);
          
          try {
            const params = new URLSearchParams();
            const { filters, currentPage, pageSize } = state;
            
            if (filters.category) params.set('category', filters.category);
            if (filters.search) params.set('search', filters.search);
            if (filters.tags?.length) params.set('tags', filters.tags.join(','));
            if (filters.isPremium !== undefined) params.set('premium', String(filters.isPremium));
            if (filters.sortBy) params.set('sort', filters.sortBy);
            if (filters.sortOrder) params.set('order', filters.sortOrder);
            
            params.set('page', String(currentPage));
            params.set('page_size', String(pageSize));
            
            const response = await fetch(`/api/v1/templates?${params}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) throw new Error('Failed to fetch templates');
            
            const data = await response.json();
            state.setList(data.results || []);
            state.setPagination(currentPage, data.count || 0);
          } catch (error) {
            state.setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            state.setLoading(false);
          }
        },
        
        fetchById: async (id) => {
          const state = get();
          
          if (state.details[id]) {
            return state.details[id];
          }
          
          try {
            const response = await fetch(`/api/v1/templates/${id}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) throw new Error('Failed to fetch template');
            
            const template = await response.json();
            state.setDetail(id, template);
            return template;
          } catch (error) {
            state.setError(error instanceof Error ? error.message : 'Unknown error');
            return null;
          }
        },
        
        rate: async (id, value) => {
          try {
            const response = await fetch(`/api/v1/templates/${id}/rate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ rating: value }),
            });
            
            if (!response.ok) throw new Error('Failed to rate template');
            
            const updatedTemplate = await response.json();
            
            set((state) => ({
              list: state.list.map((t) =>
                t.id === id ? { ...t, rating: updatedTemplate.rating } : t
              ),
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Unknown error' });
          }
        },
      }),
      {
        name: 'templates-store',
        partialize: (state) => ({ filters: state.filters }),
      }
    ),
    { name: 'templates-store' }
  )
);