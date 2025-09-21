import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, TemplateVariable } from './templatesStore';

export interface VariableValue {
  id: string;
  value: any;
  isValid: boolean;
  error?: string;
}

export interface BuilderState {
  // Current template being built
  selectedTemplate: Template | null;
  
  // Variable values
  variableValues: Record<string, VariableValue>;
  
  // Generated content
  generatedPrompt: string;
  tokenCount: number;
  estimatedCost: number;
  
  // Builder panes
  activePanes: {
    templatePicker: boolean;
    variables: boolean;
    preview: boolean;
  };
  
  // Export options
  exportFormat: 'json' | 'md' | 'txt';
  includeMetadata: boolean;
  
  // UI state
  isGenerating: boolean;
  previewMode: 'live' | 'manual';
  showTokenCount: boolean;
  showCostEstimate: boolean;
  
  // History
  buildHistory: {
    id: string;
    template: Template;
    variables: Record<string, any>;
    generatedPrompt: string;
    createdAt: Date;
  }[];
  
  // Validation
  validationErrors: Record<string, string[]>;
  isFormValid: boolean;
}

export interface BuilderActions {
  // Template selection
  selectTemplate: (template: Template | null) => void;
  
  // Variable management
  setVariableValue: (variableId: string, value: any) => void;
  setVariableValues: (values: Record<string, any>) => void;
  resetVariables: () => void;
  validateVariable: (variable: TemplateVariable, value: any) => { isValid: boolean; error?: string };
  validateAllVariables: () => boolean;
  
  // Content generation
  generatePrompt: () => void;
  updateTokenCount: () => void;
  updateCostEstimate: () => void;
  
  // Pane management
  togglePane: (pane: keyof BuilderState['activePanes']) => void;
  setActivePanes: (panes: Partial<BuilderState['activePanes']>) => void;
  
  // Export functionality
  exportTemplate: () => string;
  setExportFormat: (format: 'json' | 'md' | 'txt') => void;
  toggleIncludeMetadata: () => void;
  
  // History management
  addToBuildHistory: () => void;
  removeFromBuildHistory: (id: string) => void;
  clearBuildHistory: () => void;
  loadFromHistory: (historyId: string) => void;
  
  // UI actions
  setGenerating: (isGenerating: boolean) => void;
  setPreviewMode: (mode: 'live' | 'manual') => void;
  toggleTokenCount: () => void;
  toggleCostEstimate: () => void;
  
  // Copy functionality with confetti
  copyToClipboard: (content: string, showConfetti?: boolean) => Promise<boolean>;
  
  // Reset
  resetBuilder: () => void;
}

const initialState: BuilderState = {
  selectedTemplate: null,
  variableValues: {},
  generatedPrompt: '',
  tokenCount: 0,
  estimatedCost: 0,
  activePanes: {
    templatePicker: true,
    variables: true,
    preview: true,
  },
  exportFormat: 'json',
  includeMetadata: true,
  isGenerating: false,
  previewMode: 'live',
  showTokenCount: true,
  showCostEstimate: true,
  buildHistory: [],
  validationErrors: {},
  isFormValid: false,
};

// Utility function to estimate token count
const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

// Utility function to estimate cost (mock pricing)
const estimateCost = (tokens: number): number => {
  // Mock pricing: $0.001 per 1000 tokens
  return (tokens / 1000) * 0.001;
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      selectTemplate: (template) => {
        set({
          selectedTemplate: template,
          variableValues: {},
          generatedPrompt: '',
          tokenCount: 0,
          estimatedCost: 0,
          validationErrors: {},
          isFormValid: false,
        });
        
        if (template) {
          // Initialize variable values with defaults
          const initialValues: Record<string, VariableValue> = {};
          template.variables.forEach((variable) => {
            initialValues[variable.id] = {
              id: variable.id,
              value: variable.defaultValue || '',
              isValid: !variable.required,
            };
          });
          set({ variableValues: initialValues });
          get().generatePrompt();
        }
      },

      setVariableValue: (variableId, value) => {
        const { selectedTemplate } = get();
        if (!selectedTemplate) return;

        const variable = selectedTemplate.variables.find((v) => v.id === variableId);
        if (!variable) return;

        const validation = get().validateVariable(variable, value);
        
        set((state) => ({
          variableValues: {
            ...state.variableValues,
            [variableId]: {
              id: variableId,
              value,
              isValid: validation.isValid,
              error: validation.error,
            },
          },
        }));

        get().validateAllVariables();
        
        if (get().previewMode === 'live') {
          get().generatePrompt();
        }
      },

      setVariableValues: (values) => {
        const { selectedTemplate } = get();
        if (!selectedTemplate) return;

        const variableValues: Record<string, VariableValue> = {};
        
        Object.entries(values).forEach(([id, value]) => {
          const variable = selectedTemplate.variables.find((v) => v.id === id);
          if (variable) {
            const validation = get().validateVariable(variable, value);
            variableValues[id] = {
              id,
              value,
              isValid: validation.isValid,
              error: validation.error,
            };
          }
        });

        set({ variableValues });
        get().validateAllVariables();
        
        if (get().previewMode === 'live') {
          get().generatePrompt();
        }
      },

      resetVariables: () => {
        const { selectedTemplate } = get();
        if (!selectedTemplate) return;

        const resetValues: Record<string, VariableValue> = {};
        selectedTemplate.variables.forEach((variable) => {
          resetValues[variable.id] = {
            id: variable.id,
            value: variable.defaultValue || '',
            isValid: !variable.required,
          };
        });

        set({
          variableValues: resetValues,
          generatedPrompt: '',
          tokenCount: 0,
          estimatedCost: 0,
          validationErrors: {},
        });
        
        get().validateAllVariables();
        get().generatePrompt();
      },

      validateVariable: (variable, value) => {
        // Required validation
        if (variable.required && (!value || (typeof value === 'string' && !value.trim()))) {
          return { isValid: false, error: 'This field is required' };
        }

        // Type-specific validation
        if (value && variable.validation) {
          const { validation } = variable;
          
          if (typeof value === 'string') {
            if (validation.minLength && value.length < validation.minLength) {
              return { isValid: false, error: `Minimum length is ${validation.minLength} characters` };
            }
            
            if (validation.maxLength && value.length > validation.maxLength) {
              return { isValid: false, error: `Maximum length is ${validation.maxLength} characters` };
            }
            
            if (validation.pattern) {
              const regex = new RegExp(validation.pattern);
              if (!regex.test(value)) {
                return { isValid: false, error: 'Invalid format' };
              }
            }
          }
          
          if (variable.type === 'number') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              return { isValid: false, error: 'Must be a valid number' };
            }
            
            if (variable.min !== undefined && numValue < variable.min) {
              return { isValid: false, error: `Minimum value is ${variable.min}` };
            }
            
            if (variable.max !== undefined && numValue > variable.max) {
              return { isValid: false, error: `Maximum value is ${variable.max}` };
            }
          }
        }

        return { isValid: true };
      },

      validateAllVariables: () => {
        const { selectedTemplate, variableValues } = get();
        if (!selectedTemplate) return false;

        const errors: Record<string, string[]> = {};
        let isValid = true;

        selectedTemplate.variables.forEach((variable) => {
          const variableValue = variableValues[variable.id];
          const validation = get().validateVariable(variable, variableValue?.value);
          
          if (!validation.isValid && validation.error) {
            errors[variable.id] = [validation.error];
            isValid = false;
          }
        });

        set({ validationErrors: errors, isFormValid: isValid });
        return isValid;
      },

      generatePrompt: () => {
        const { selectedTemplate, variableValues } = get();
        if (!selectedTemplate) return;

        set({ isGenerating: true });

        try {
          let prompt = selectedTemplate.content;

          // Replace variables in the template
          selectedTemplate.variables.forEach((variable) => {
            const variableValue = variableValues[variable.id];
            const value = variableValue?.value || variable.defaultValue || '';
            
            // Replace all instances of {variableName} with the actual value
            const regex = new RegExp(`\\{${variable.name}\\}`, 'g');
            prompt = prompt.replace(regex, String(value));
          });

          const tokenCount = estimateTokenCount(prompt);
          const estimatedCost = estimateCost(tokenCount);

          set({
            generatedPrompt: prompt,
            tokenCount,
            estimatedCost,
          });
        } catch (error) {
          console.error('Error generating prompt:', error);
        } finally {
          set({ isGenerating: false });
        }
      },

      updateTokenCount: () => {
        const { generatedPrompt } = get();
        const tokenCount = estimateTokenCount(generatedPrompt);
        set({ tokenCount });
        get().updateCostEstimate();
      },

      updateCostEstimate: () => {
        const { tokenCount } = get();
        const estimatedCost = estimateCost(tokenCount);
        set({ estimatedCost });
      },

      togglePane: (pane) => {
        set((state) => ({
          activePanes: {
            ...state.activePanes,
            [pane]: !state.activePanes[pane],
          },
        }));
      },

      setActivePanes: (panes) => {
        set((state) => ({
          activePanes: { ...state.activePanes, ...panes },
        }));
      },

      exportTemplate: () => {
        const { selectedTemplate, variableValues, generatedPrompt, exportFormat, includeMetadata } = get();
        if (!selectedTemplate) return '';

        const data = {
          template: includeMetadata ? selectedTemplate : { id: selectedTemplate.id, title: selectedTemplate.title },
          variables: Object.fromEntries(
            Object.entries(variableValues).map(([id, { value }]) => [id, value])
          ),
          generatedPrompt,
          exportedAt: new Date().toISOString(),
        };

        switch (exportFormat) {
          case 'json':
            return JSON.stringify(data, null, 2);
          case 'md':
            return `# ${selectedTemplate.title}\n\n${generatedPrompt}\n\n---\n\n**Variables:**\n${Object.entries(variableValues).map(([id, { value }]) => `- **${id}:** ${value}`).join('\n')}`;
          case 'txt':
            return generatedPrompt;
          default:
            return '';
        }
      },

      setExportFormat: (format) => set({ exportFormat: format }),
      toggleIncludeMetadata: () => set((state) => ({ includeMetadata: !state.includeMetadata })),

      addToBuildHistory: () => {
        const { selectedTemplate, variableValues, generatedPrompt } = get();
        if (!selectedTemplate || !generatedPrompt) return;

        const historyItem = {
          id: Date.now().toString(),
          template: selectedTemplate,
          variables: Object.fromEntries(
            Object.entries(variableValues).map(([id, { value }]) => [id, value])
          ),
          generatedPrompt,
          createdAt: new Date(),
        };

        set((state) => ({
          buildHistory: [historyItem, ...state.buildHistory].slice(0, 50), // Keep last 50 items
        }));
      },

      removeFromBuildHistory: (id) => {
        set((state) => ({
          buildHistory: state.buildHistory.filter((item) => item.id !== id),
        }));
      },

      clearBuildHistory: () => set({ buildHistory: [] }),

      loadFromHistory: (historyId) => {
        const { buildHistory } = get();
        const historyItem = buildHistory.find((item) => item.id === historyId);
        if (!historyItem) return;

        get().selectTemplate(historyItem.template);
        get().setVariableValues(historyItem.variables);
      },

      setGenerating: (isGenerating) => set({ isGenerating }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      toggleTokenCount: () => set((state) => ({ showTokenCount: !state.showTokenCount })),
      toggleCostEstimate: () => set((state) => ({ showCostEstimate: !state.showCostEstimate })),

      copyToClipboard: async (content, showConfetti = true) => {
        try {
          await navigator.clipboard.writeText(content);
          
          if (showConfetti && typeof window !== 'undefined') {
            // Create confetti animation
            const confetti = document.createElement('div');
            confetti.className = 'copy-success';
            confetti.innerHTML = `
              <div class="copy-confetti">
                ${Array.from({ length: 6 }, (_, i) => `
                  <div class="golden-triangle" style="
                    left: ${Math.random() * 100}px;
                    animation-delay: ${i * 0.1}s;
                  "></div>
                `).join('')}
              </div>
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
              document.body.removeChild(confetti);
            }, 600);
          }
          
          return true;
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          return false;
        }
      },

      resetBuilder: () => {
        set({
          ...initialState,
          buildHistory: get().buildHistory, // Preserve history
        });
      },
    }),
    {
      name: 'promptcraft-builder-store',
      partialize: (state) => ({
        exportFormat: state.exportFormat,
        includeMetadata: state.includeMetadata,
        previewMode: state.previewMode,
        showTokenCount: state.showTokenCount,
        showCostEstimate: state.showCostEstimate,
        buildHistory: state.buildHistory.slice(0, 10), // Persist last 10 builds
        activePanes: state.activePanes,
      }),
    }
  )
);