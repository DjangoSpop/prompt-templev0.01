import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { templateApi } from '@/lib/services/template-api';

// Template variable types for structured inputs
export type VariableType = 'text' | 'textarea' | 'select' | 'number' | 'boolean';

export interface TemplateVariable {
  name: string;
  label: string;
  type: VariableType;
  required: boolean;
  default?: string | number | boolean;
  options?: string[]; // For select type
  placeholder?: string;
  description?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string; // Template content with {{variable}} markers
  variables: TemplateVariable[];
  tags: string[];
  description?: string;
  author?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  usageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateHistory {
  id: string;
  templateId: string;
  variables: Record<string, string | number | boolean>;
  renderedPrompt: string;
  response?: string;
  createdAt: Date;
}

interface PromptStoreState {
  // Data
  templates: PromptTemplate[];
  categories: string[];
  selectedTemplateId: string | null;
  variables: Record<string, string | number | boolean>;
  renderedPrompt: string;
  history: TemplateHistory[];
  
  // UI State
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => void;
  setVariable: (name: string, value: string | number | boolean) => void;
  setVariables: (variables: Record<string, string | number | boolean>) => void;
  render: () => string;
  pinTemplate: (id: string) => void;
  unpinTemplate: (id: string) => void;
  saveTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addToHistory: (entry: Omit<TemplateHistory, 'id' | 'createdAt'>) => void;
  clearHistory: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  reset: () => void;
}

// Variable extraction utility
function extractVariables(content: string): TemplateVariable[] {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const matches = [...content.matchAll(variableRegex)];
  const uniqueNames = [...new Set(matches.map(match => match[1]))];
  
  return uniqueNames.map(name => ({
    name,
    label: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    type: 'text' as VariableType,
    required: true,
    placeholder: `Enter ${name}...`,
  }));
}

// Safe template rendering with validation
function renderTemplate(content: string, variables: Record<string, string | number | boolean>): string {
  try {
    let rendered = content;
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...content.matchAll(variableRegex)];
    
    for (const match of matches) {
      const varName = match[1];
      const value = variables[varName];
      
      if (value !== undefined && value !== null) {
        rendered = rendered.replace(match[0], String(value));
      }
      // Leave unfilled variables as-is for preview
    }
    
    return rendered;
  } catch (error) {
    console.error('Template rendering error:', error);
    return content; // Return original on error
  }
}

// Default templates for initial state
const defaultTemplates: PromptTemplate[] = [
  {
    id: 'creative-writing',
    title: 'Creative Writing Assistant',
    category: 'Writing',
    content: 'Write a {{genre}} story about {{topic}} in approximately {{length}} words. The tone should be {{tone}} and the target audience is {{audience}}.',
    variables: [
      { name: 'genre', label: 'Genre', type: 'select', required: true, options: ['fantasy', 'sci-fi', 'mystery', 'romance', 'thriller'] },
      { name: 'topic', label: 'Topic/Theme', type: 'text', required: true, placeholder: 'e.g., time travel, lost love, mystery box' },
      { name: 'length', label: 'Word Count', type: 'select', required: true, options: ['500', '1000', '1500', '2000'] },
      { name: 'tone', label: 'Tone', type: 'select', required: true, options: ['serious', 'humorous', 'dramatic', 'lighthearted'] },
      { name: 'audience', label: 'Target Audience', type: 'select', required: true, options: ['children', 'young adults', 'adults', 'general'] },
    ],
    tags: ['creative', 'writing', 'storytelling'],
    description: 'Generate creative stories with customizable parameters',
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'code-review',
    title: 'Code Review Assistant',
    category: 'Development',
    content: 'Please review the following {{language}} code for {{focus}}. Code:\n\n```{{language}}\n{{code}}\n```\n\nProvide specific feedback on improvements, best practices, and potential issues.',
    variables: [
      { name: 'language', label: 'Programming Language', type: 'select', required: true, options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'] },
      { name: 'code', label: 'Code to Review', type: 'textarea', required: true, placeholder: 'Paste your code here...' },
      { name: 'focus', label: 'Review Focus', type: 'select', required: true, options: ['performance', 'security', 'maintainability', 'all aspects'] },
    ],
    tags: ['development', 'code-review', 'programming'],
    description: 'Get detailed code reviews with specific focus areas',
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'business-email',
    title: 'Professional Email Composer',
    category: 'Business',
    content: 'Compose a professional email with the following details:\n\nTo: {{recipient}}\nSubject: {{subject}}\nTone: {{tone}}\nPurpose: {{purpose}}\n\nKey points to include:\n{{key_points}}\n\nPlease write a well-structured, professional email.',
    variables: [
      { name: 'recipient', label: 'Recipient', type: 'text', required: true, placeholder: 'e.g., Client name, team, department' },
      { name: 'subject', label: 'Subject Line', type: 'text', required: true, placeholder: 'Email subject' },
      { name: 'tone', label: 'Tone', type: 'select', required: true, options: ['formal', 'friendly', 'urgent', 'apologetic', 'congratulatory'] },
      { name: 'purpose', label: 'Email Purpose', type: 'select', required: true, options: ['follow-up', 'request', 'announcement', 'meeting', 'proposal'] },
      { name: 'key_points', label: 'Key Points', type: 'textarea', required: true, placeholder: 'List the main points to cover...' },
    ],
    tags: ['business', 'email', 'communication'],
    description: 'Create professional emails for various business scenarios',
    isPublic: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const usePromptStore = create<PromptStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: defaultTemplates,
      categories: ['Writing', 'Development', 'Business', 'Education', 'Marketing'],
      selectedTemplateId: null,
      variables: {},
      renderedPrompt: '',
      history: [],
      searchQuery: '',
      selectedCategory: null,
      isLoading: false,
      error: null,

      // Actions
      loadTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await templateApi.getTemplates();
          const templates = response.results || response; // Handle paginated or direct response
          
          // Transform API response to our template format
          const transformedTemplates = templates.map((apiTemplate: Record<string, unknown>) => ({
            id: String(apiTemplate.id),
            title: String(apiTemplate.title || ''),
            category: (apiTemplate.category as { name?: string })?.name || 'Uncategorized',
            content: String(apiTemplate.template_content || ''),
            variables: (apiTemplate.fields_data as Array<Record<string, unknown>> | undefined)?.map((field: Record<string, unknown>) => ({
              name: String(field.name || ''),
              label: String(field.label || ''),
              type: (field.field_type as VariableType) || 'text',
              required: Boolean(field.is_required),
              default: field.default_value,
              options: typeof field.options === 'string' ? field.options.split(',').filter(Boolean) : undefined,
              placeholder: field.placeholder ? String(field.placeholder) : undefined,
              description: field.description ? String(field.description) : undefined,
            })) || extractVariables(String(apiTemplate.template_content || '')),
            tags: Array.isArray(apiTemplate.tags) ? apiTemplate.tags.map(String) : [],
            description: apiTemplate.description ? String(apiTemplate.description) : undefined,
            author: (apiTemplate.author as { username?: string })?.username,
            isPublic: Boolean(apiTemplate.is_public),
            isPinned: false, // This will be managed locally
            usageCount: Number(apiTemplate.usage_count) || 0,
            createdAt: new Date(String(apiTemplate.created_at)),
            updatedAt: new Date(String(apiTemplate.updated_at)),
          }));
          
          set({ templates: transformedTemplates, isLoading: false });
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to load templates');
          set({ error: err.message, isLoading: false });
          // Fallback to default templates on error
          set(state => ({ templates: state.templates.length === 0 ? defaultTemplates : state.templates }));
        }
      },

      selectTemplate: (id: string | null) => {
        const template = id ? get().templates.find(t => t.id === id) : null;
        
        if (template) {
          // Auto-extract variables if not defined
          const variables = template.variables.length > 0 
            ? template.variables 
            : extractVariables(template.content);
            
          // Reset variables to defaults
          const defaultVars: Record<string, string | number | boolean> = {};
          variables.forEach(variable => {
            if (variable.default !== undefined) {
              defaultVars[variable.name] = variable.default;
            }
          });
          
          // Update template with extracted variables if needed
          if (template.variables.length === 0) {
            set(state => ({
              templates: state.templates.map(t => 
                t.id === id ? { ...t, variables } : t
              )
            }));
          }
          
          set({ 
            selectedTemplateId: id, 
            variables: defaultVars,
            renderedPrompt: renderTemplate(template.content, defaultVars)
          });
        } else {
          set({ 
            selectedTemplateId: null, 
            variables: {},
            renderedPrompt: ''
          });
        }
      },

      setVariable: (name: string, value: string | number | boolean) => {
        const newVariables = { ...get().variables, [name]: value };
        const selectedTemplate = get().selectedTemplateId 
          ? get().templates.find(t => t.id === get().selectedTemplateId) 
          : null;
          
        const renderedPrompt = selectedTemplate 
          ? renderTemplate(selectedTemplate.content, newVariables)
          : '';
          
        set({ variables: newVariables, renderedPrompt });
      },

      setVariables: (variables: Record<string, string | number | boolean>) => {
        const selectedTemplate = get().selectedTemplateId 
          ? get().templates.find(t => t.id === get().selectedTemplateId) 
          : null;
          
        const renderedPrompt = selectedTemplate 
          ? renderTemplate(selectedTemplate.content, variables)
          : '';
          
        set({ variables, renderedPrompt });
      },

      render: () => {
        const { selectedTemplateId, templates, variables } = get();
        const template = selectedTemplateId 
          ? templates.find(t => t.id === selectedTemplateId) 
          : null;
          
        if (!template) return '';
        
        const rendered = renderTemplate(template.content, variables);
        set({ renderedPrompt: rendered });
        return rendered;
      },

      pinTemplate: (id: string) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id ? { ...template, isPinned: true } : template
          )
        }));
      },

      unpinTemplate: (id: string) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id ? { ...template, isPinned: false } : template
          )
        }));
      },

      saveTemplate: async (templateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await templateApi.createTemplate(templateData);
          
          const newTemplate: PromptTemplate = {
            id: String(response.id),
            title: templateData.title,
            category: templateData.category,
            content: templateData.content,
            variables: templateData.variables.length > 0 
              ? templateData.variables 
              : extractVariables(templateData.content),
            tags: templateData.tags,
            description: templateData.description,
            author: templateData.author,
            isPublic: templateData.isPublic,
            isPinned: false,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => ({
            templates: [...state.templates, newTemplate],
            isLoading: false
          }));
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to save template');
          set({ error: err.message, isLoading: false });
          throw error; // Re-throw for UI handling
        }
      },

      updateTemplate: async (id: string, updates) => {
        set({ isLoading: true, error: null });
        try {
          await templateApi.updateTemplate(id, updates);
          
          set(state => ({
            templates: state.templates.map(template =>
              template.id === id 
                ? { 
                    ...template, 
                    ...updates, 
                    updatedAt: new Date(),
                    variables: updates.content 
                      ? extractVariables(updates.content) 
                      : template.variables
                  } 
                : template
            ),
            isLoading: false
          }));
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to update template');
          set({ error: err.message, isLoading: false });
          throw error; // Re-throw for UI handling
        }
      },

      deleteTemplate: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await templateApi.deleteTemplate(id);
          
          set(state => ({
            templates: state.templates.filter(template => template.id !== id),
            selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId,
            isLoading: false
          }));
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to delete template');
          set({ error: err.message, isLoading: false });
          throw error; // Re-throw for UI handling
        }
      },

      addToHistory: (entry) => {
        const historyEntry: TemplateHistory = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        set(state => ({
          history: [historyEntry, ...state.history].slice(0, 100) // Keep last 100 entries
        }));
        
        // Track template usage in background (don't await)
        if (entry.templateId && entry.variables) {
          templateApi.trackUsage(entry.templateId, entry.variables).catch(err => {
            console.warn('Failed to track template usage:', err);
          });
        }
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedCategory: (category: string | null) => {
        set({ selectedCategory: category });
      },

      reset: () => {
        set({
          selectedTemplateId: null,
          variables: {},
          renderedPrompt: '',
          searchQuery: '',
          selectedCategory: null,
          error: null,
        });
      },
    }),
    {
      name: 'prompt-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist templates, history, and some UI state
        templates: state.templates,
        history: state.history,
        categories: state.categories,
      }),
    }
  )
);
