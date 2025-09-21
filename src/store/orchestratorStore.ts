import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrchestratorStage {
  id: string;
  name: string;
  description: string;
  type: 'expand' | 'constrain' | 'evaluate' | 'compare';
  order: number;
  isActive: boolean;
  isCompleted: boolean;
  settings: {
    temperature?: number;
    maxTokens?: number;
    retryCount?: number;
    timeout?: number;
    model?: string;
    systemPrompt?: string;
  };
  input?: string;
  output?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface OrchestratorResult {
  id: string;
  type: 'best' | 'variant' | 'critique' | 'comparison';
  content: string;
  score?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface OrchestratorState {
  // Pipeline stages
  stages: OrchestratorStage[];
  activeStageId: string | null;
  
  // Input and results
  initialPrompt: string;
  results: {
    best: OrchestratorResult[];
    variants: OrchestratorResult[];
    critiques: OrchestratorResult[];
    comparisons: OrchestratorResult[];
  };
  
  // Selected results
  selectedResults: {
    best: string | null;
    variant: string | null;
    critique: string | null;
    comparison: string | null;
  };
  
  // UI state
  isRunning: boolean;
  isPaused: boolean;
  currentStageIndex: number;
  totalProgress: number; // 0-100
  
  // Settings
  globalSettings: {
    budgetLimit: number; // In USD
    totalSpent: number;
    maxRetries: number;
    timeoutMinutes: number;
    enableParallel: boolean;
    saveIntermediateResults: boolean;
  };
  
  // Output tabs
  activeOutputTab: 'best' | 'variants' | 'critiques' | 'comparisons';
  outputFilters: {
    minScore?: number;
    maxScore?: number;
    model?: string;
    sortBy: 'score' | 'created' | 'tokens';
    sortOrder: 'asc' | 'desc';
  };
  
  // Workspace
  savedResults: OrchestratorResult[];
  
  // History
  runHistory: {
    id: string;
    prompt: string;
    stages: OrchestratorStage[];
    results: OrchestratorResult[];
    totalCost: number;
    duration: number;
    completedAt: Date;
  }[];
}

export interface OrchestratorActions {
  // Stage management
  addStage: (stage: Omit<OrchestratorStage, 'id' | 'order'>) => void;
  updateStage: (stageId: string, updates: Partial<OrchestratorStage>) => void;
  removeStage: (stageId: string) => void;
  reorderStages: (stageIds: string[]) => void;
  setActiveStage: (stageId: string | null) => void;
  
  // Pipeline execution
  runPipeline: () => Promise<void>;
  pausePipeline: () => void;
  resumePipeline: () => void;
  stopPipeline: () => void;
  runSingleStage: (stageId: string) => Promise<void>;
  
  // Input and results
  setInitialPrompt: (prompt: string) => void;
  addResult: (type: keyof OrchestratorState['results'], result: OrchestratorResult) => void;
  removeResult: (type: keyof OrchestratorState['results'], resultId: string) => void;
  selectResult: (type: keyof OrchestratorState['selectedResults'], resultId: string | null) => void;
  
  // Settings
  updateGlobalSettings: (settings: Partial<OrchestratorState['globalSettings']>) => void;
  updateStageSettings: (stageId: string, settings: Partial<OrchestratorStage['settings']>) => void;
  
  // Output management
  setActiveOutputTab: (tab: OrchestratorState['activeOutputTab']) => void;
  updateOutputFilters: (filters: Partial<OrchestratorState['outputFilters']>) => void;
  exportResults: (format: 'json' | 'csv' | 'md') => string;
  
  // Workspace
  saveResult: (result: OrchestratorResult) => void;
  removeSavedResult: (resultId: string) => void;
  saveToWorkspace: () => void;
  
  // History
  saveToHistory: () => void;
  loadFromHistory: (historyId: string) => void;
  clearHistory: () => void;
  
  // Utility
  resetOrchestrator: () => void;
  calculateTotalCost: () => number;
  getFilteredResults: () => OrchestratorResult[];
}

const defaultStages: OrchestratorStage[] = [
  {
    id: 'expand',
    name: 'Expand',
    description: 'Expand and elaborate on the initial prompt',
    type: 'expand',
    order: 0,
    isActive: false,
    isCompleted: false,
    settings: {
      temperature: 0.8,
      maxTokens: 1000,
      retryCount: 2,
      timeout: 60,
      model: 'gpt-4',
    },
  },
  {
    id: 'constrain',
    name: 'Constrain',
    description: 'Add constraints and specific requirements',
    type: 'constrain',
    order: 1,
    isActive: false,
    isCompleted: false,
    settings: {
      temperature: 0.3,
      maxTokens: 800,
      retryCount: 2,
      timeout: 60,
      model: 'gpt-4',
    },
  },
  {
    id: 'evaluate',
    name: 'Evaluate',
    description: 'Evaluate and score the generated content',
    type: 'evaluate',
    order: 2,
    isActive: false,
    isCompleted: false,
    settings: {
      temperature: 0.1,
      maxTokens: 500,
      retryCount: 1,
      timeout: 45,
      model: 'gpt-4',
    },
  },
  {
    id: 'compare',
    name: 'Compare',
    description: 'Compare different variations and select the best',
    type: 'compare',
    order: 3,
    isActive: false,
    isCompleted: false,
    settings: {
      temperature: 0.2,
      maxTokens: 600,
      retryCount: 1,
      timeout: 45,
      model: 'gpt-4',
    },
  },
];

const initialState: OrchestratorState = {
  stages: defaultStages,
  activeStageId: null,
  initialPrompt: '',
  results: {
    best: [],
    variants: [],
    critiques: [],
    comparisons: [],
  },
  selectedResults: {
    best: null,
    variant: null,
    critique: null,
    comparison: null,
  },
  isRunning: false,
  isPaused: false,
  currentStageIndex: 0,
  totalProgress: 0,
  globalSettings: {
    budgetLimit: 10.0, // $10 USD
    totalSpent: 0,
    maxRetries: 3,
    timeoutMinutes: 5,
    enableParallel: false,
    saveIntermediateResults: true,
  },
  activeOutputTab: 'best',
  outputFilters: {
    sortBy: 'score',
    sortOrder: 'desc',
  },
  savedResults: [],
  runHistory: [],
};

export const useOrchestratorStore = create<OrchestratorState & OrchestratorActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addStage: (stageData) => {
        const newStage: OrchestratorStage = {
          ...stageData,
          id: Date.now().toString(),
          order: get().stages.length,
        };
        
        set((state) => ({
          stages: [...state.stages, newStage],
        }));
      },

      updateStage: (stageId, updates) => {
        set((state) => ({
          stages: state.stages.map((stage) =>
            stage.id === stageId ? { ...stage, ...updates } : stage
          ),
        }));
      },

      removeStage: (stageId) => {
        set((state) => ({
          stages: state.stages
            .filter((stage) => stage.id !== stageId)
            .map((stage, index) => ({ ...stage, order: index })),
          activeStageId: state.activeStageId === stageId ? null : state.activeStageId,
        }));
      },

      reorderStages: (stageIds) => {
        set((state) => ({
          stages: stageIds.map((id, index) => {
            const stage = state.stages.find((s) => s.id === id);
            return stage ? { ...stage, order: index } : stage;
          }).filter(Boolean) as OrchestratorStage[],
        }));
      },

      setActiveStage: (stageId) => set({ activeStageId: stageId }),

      runPipeline: async () => {
        const { stages, globalSettings } = get();
        
        set({ 
          isRunning: true, 
          isPaused: false, 
          currentStageIndex: 0, 
          totalProgress: 0,
        });

        try {
          for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            
            // Check if we've exceeded budget
            if (globalSettings.totalSpent >= globalSettings.budgetLimit) {
              throw new Error(`Budget limit of $${globalSettings.budgetLimit} exceeded`);
            }

            // Check if paused
            if (get().isPaused) {
              return;
            }

            set({ 
              currentStageIndex: i,
              activeStageId: stage.id,
              totalProgress: (i / stages.length) * 100,
            });

            await get().runSingleStage(stage.id);
          }

          set({ 
            totalProgress: 100, 
            isRunning: false,
            activeStageId: null,
          });
          
          get().saveToHistory();
        } catch (error) {
          console.error('Pipeline execution failed:', error);
          set({ 
            isRunning: false, 
            isPaused: false,
            activeStageId: null,
          });
        }
      },

      pausePipeline: () => set({ isPaused: true }),
      resumePipeline: () => {
        set({ isPaused: false });
        get().runPipeline();
      },
      stopPipeline: () => set({ 
        isRunning: false, 
        isPaused: false,
        activeStageId: null,
        totalProgress: 0,
      }),

      runSingleStage: async (stageId) => {
        const stage = get().stages.find((s) => s.id === stageId);
        if (!stage) return;

        // Update stage status
        get().updateStage(stageId, { 
          isActive: true, 
          startTime: new Date(),
          error: undefined,
        });

        try {
          // Mock stage execution - in real implementation, this would call actual APIs
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time
          
          // Generate mock results based on stage type
          const mockResult: OrchestratorResult = {
            id: Date.now().toString(),
            type: stage.type === 'expand' ? 'variant' : 
                  stage.type === 'constrain' ? 'variant' :
                  stage.type === 'evaluate' ? 'critique' : 'comparison',
            content: `Mock result from ${stage.name} stage`,
            score: Math.floor(Math.random() * 100),
            metadata: {
              stage: stage.id,
              model: stage.settings.model,
              temperature: stage.settings.temperature,
            },
            createdAt: new Date(),
          };

          // Add result to appropriate category
          if (stage.type === 'expand' || stage.type === 'constrain') {
            get().addResult('variants', mockResult);
          } else if (stage.type === 'evaluate') {
            get().addResult('critiques', mockResult);
          } else if (stage.type === 'compare') {
            get().addResult('comparisons', mockResult);
            // Also add a "best" result
            get().addResult('best', { ...mockResult, type: 'best' });
          }

          // Update stage as completed
          get().updateStage(stageId, { 
            isActive: false, 
            isCompleted: true,
            endTime: new Date(),
            output: mockResult.content,
          });

          // Mock cost calculation
          const mockCost = Math.random() * 0.1; // Random cost up to $0.10
          get().updateGlobalSettings({ 
            totalSpent: get().globalSettings.totalSpent + mockCost 
          });

        } catch (error) {
          get().updateStage(stageId, {
            isActive: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },

      setInitialPrompt: (prompt) => set({ initialPrompt: prompt }),

      addResult: (type, result) => {
        set((state) => ({
          results: {
            ...state.results,
            [type]: [...state.results[type], result],
          },
        }));
      },

      removeResult: (type, resultId) => {
        set((state) => ({
          results: {
            ...state.results,
            [type]: state.results[type].filter((r) => r.id !== resultId),
          },
        }));
      },

      selectResult: (type, resultId) => {
        set((state) => ({
          selectedResults: {
            ...state.selectedResults,
            [type]: resultId,
          },
        }));
      },

      updateGlobalSettings: (settings) => {
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...settings },
        }));
      },

      updateStageSettings: (stageId, settings) => {
        get().updateStage(stageId, { 
          settings: { 
            ...get().stages.find((s) => s.id === stageId)?.settings, 
            ...settings 
          } 
        });
      },

      setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),

      updateOutputFilters: (filters) => {
        set((state) => ({
          outputFilters: { ...state.outputFilters, ...filters },
        }));
      },

      exportResults: (format) => {
        const { results, initialPrompt } = get();
        const allResults = [
          ...results.best,
          ...results.variants,
          ...results.critiques,
          ...results.comparisons,
        ];

        const data = {
          initialPrompt,
          results: allResults,
          exportedAt: new Date().toISOString(),
        };

        switch (format) {
          case 'json':
            return JSON.stringify(data, null, 2);
          case 'csv':
            const csvHeader = 'Type,Content,Score,Created At\n';
            const csvRows = allResults.map((result) =>
              `"${result.type}","${result.content.replace(/"/g, '""')}","${result.score || ''}","${result.createdAt.toISOString()}"`
            ).join('\n');
            return csvHeader + csvRows;
          case 'md':
            const mdContent = `# Orchestrator Results\n\n**Initial Prompt:** ${initialPrompt}\n\n` +
              allResults.map((result) =>
                `## ${result.type.charAt(0).toUpperCase() + result.type.slice(1)} (Score: ${result.score || 'N/A'})\n\n${result.content}\n\n---\n`
              ).join('\n');
            return mdContent;
          default:
            return '';
        }
      },

      saveResult: (result) => {
        set((state) => ({
          savedResults: [result, ...state.savedResults.filter((r) => r.id !== result.id)],
        }));
      },

      removeSavedResult: (resultId) => {
        set((state) => ({
          savedResults: state.savedResults.filter((r) => r.id !== resultId),
        }));
      },

      saveToWorkspace: () => {
        const { selectedResults, results } = get();
        
        // Save selected results to workspace
        Object.entries(selectedResults).forEach(([type, resultId]) => {
          if (resultId) {
            const resultArray = results[type as keyof typeof results];
            const result = resultArray.find((r) => r.id === resultId);
            if (result) {
              get().saveResult(result);
            }
          }
        });
      },

      saveToHistory: () => {
        const { initialPrompt, stages, results, globalSettings } = get();
        const allResults = [
          ...results.best,
          ...results.variants,
          ...results.critiques,
          ...results.comparisons,
        ];

        const historyItem = {
          id: Date.now().toString(),
          prompt: initialPrompt,
          stages: [...stages],
          results: allResults,
          totalCost: globalSettings.totalSpent,
          duration: 0, // Calculate based on stage times
          completedAt: new Date(),
        };

        set((state) => ({
          runHistory: [historyItem, ...state.runHistory].slice(0, 20), // Keep last 20 runs
        }));
      },

      loadFromHistory: (historyId) => {
        const historyItem = get().runHistory.find((item) => item.id === historyId);
        if (!historyItem) return;

        set({
          initialPrompt: historyItem.prompt,
          stages: historyItem.stages,
          results: historyItem.results.reduce((acc, result) => {
            acc[result.type as keyof typeof acc].push(result);
            return acc;
          }, { best: [], variants: [], critiques: [], comparisons: [] } as OrchestratorState['results']),
        });
      },

      clearHistory: () => set({ runHistory: [] }),

      resetOrchestrator: () => {
        set({
          ...initialState,
          runHistory: get().runHistory, // Preserve history
          savedResults: get().savedResults, // Preserve saved results
        });
      },

      calculateTotalCost: () => {
        return get().globalSettings.totalSpent;
      },

      getFilteredResults: () => {
        const { results, activeOutputTab, outputFilters } = get();
        let filteredResults = results[activeOutputTab];

        // Apply score filters
        if (outputFilters.minScore !== undefined) {
          filteredResults = filteredResults.filter((r) => (r.score || 0) >= outputFilters.minScore!);
        }
        
        if (outputFilters.maxScore !== undefined) {
          filteredResults = filteredResults.filter((r) => (r.score || 0) <= outputFilters.maxScore!);
        }

        // Apply model filter
        if (outputFilters.model) {
          filteredResults = filteredResults.filter((r) => 
            r.metadata?.model === outputFilters.model
          );
        }

        // Apply sorting
        filteredResults.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (outputFilters.sortBy) {
            case 'score':
              aValue = a.score || 0;
              bValue = b.score || 0;
              break;
            case 'created':
              aValue = a.createdAt.getTime();
              bValue = b.createdAt.getTime();
              break;
            case 'tokens':
              aValue = a.metadata?.tokens || 0;
              bValue = b.metadata?.tokens || 0;
              break;
            default:
              return 0;
          }

          return outputFilters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filteredResults;
      },
    }),
    {
      name: 'promptcraft-orchestrator-store',
      partialize: (state) => ({
        globalSettings: state.globalSettings,
        outputFilters: state.outputFilters,
        activeOutputTab: state.activeOutputTab,
        savedResults: state.savedResults.slice(0, 20), // Persist last 20 saved results
        runHistory: state.runHistory.slice(0, 10), // Persist last 10 runs
      }),
    }
  )
);