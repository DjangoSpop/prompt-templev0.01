import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Citation {
  id: string;
  source: string;
  title: string;
  url?: string;
  snippet: string;
  relevance_score: number;
}

export interface UsageMetrics {
  tokens_in: number;
  tokens_out: number;
  credits: number;
  latency_ms?: number;
}

export interface RagSession {
  id: string;
  mode: 'fast' | 'deep';
  original: string;
  best?: string;
  optimized?: string;
  citations: Citation[];
  usage?: UsageMetrics;
  diff_summary?: string;
  created_at: string;
  updated_at: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata?: {
    context?: any;
    budget?: {
      max_tokens?: number;
      max_credits?: number;
    };
    improvements?: string[];
  };
}

export interface RagState {
  sessions: Record<string, RagSession>;
  activeId?: string;
  currentSession?: RagSession;
  isProcessing: boolean;
  wsConnected: boolean;
  indexStatus?: {
    total_documents: number;
    indexed_documents: number;
    last_updated: string;
  };
  
  createSession: (mode: 'fast' | 'deep', original: string) => string;
  setActiveSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<RagSession>) => void;
  optimize: (input: {
    sessionId: string;
    original: string;
    mode: 'fast' | 'deep';
    context?: any;
    budget?: any;
  }) => Promise<void>;
  acceptBest: (sessionId: string, value: string) => void;
  setWsConnected: (connected: boolean) => void;
  clearSession: (id: string) => void;
  clearAllSessions: () => void;
}

export const useRagStore = create<RagState>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: {},
        activeId: undefined,
        currentSession: undefined,
        isProcessing: false,
        wsConnected: false,
        indexStatus: undefined,
        
        createSession: (mode, original) => {
          const id = `rag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const session: RagSession = {
            id,
            mode,
            original,
            citations: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'idle',
          };
          
          set((state) => ({
            sessions: { ...state.sessions, [id]: session },
            activeId: id,
            currentSession: session,
          }));
          
          return id;
        },
        
        setActiveSession: (id) => {
          const state = get();
          const session = state.sessions[id];
          set({ activeId: id, currentSession: session });
        },
        
        updateSession: (id, updates) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [id]: {
                ...state.sessions[id],
                ...updates,
                updated_at: new Date().toISOString(),
              },
            },
            currentSession: state.activeId === id
              ? { ...state.sessions[id], ...updates }
              : state.currentSession,
          }));
        },
        
        optimize: async (input) => {
          const state = get();
          const { sessionId } = input;
          
          state.updateSession(sessionId, {
            status: 'processing',
            error: undefined,
          });
          
          set({ isProcessing: true });
          
          try {
            const response = await fetch('/api/v1/ai-services/agent/optimize/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(window as any).authToken}`,
              },
              body: JSON.stringify({
                session_id: sessionId,
                original: input.original,
                mode: input.mode,
                context: input.context,
                budget: input.budget,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Optimization failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            state.updateSession(sessionId, {
              optimized: data.optimized,
              best: data.optimized,
              citations: data.citations || [],
              diff_summary: data.diff_summary,
              usage: data.usage,
              status: 'completed',
              metadata: {
                ...state.sessions[sessionId].metadata,
                improvements: data.improvements,
              },
            });
          } catch (error) {
            state.updateSession(sessionId, {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } finally {
            set({ isProcessing: false });
          }
        },
        
        acceptBest: (sessionId, value) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...state.sessions[sessionId],
                best: value,
                updated_at: new Date().toISOString(),
              },
            },
          }));
        },
        
        setWsConnected: (connected) => set({ wsConnected: connected }),
        
        clearSession: (id) => {
          set((state) => {
            const newSessions = { ...state.sessions };
            delete newSessions[id];
            return {
              sessions: newSessions,
              activeId: state.activeId === id ? undefined : state.activeId,
              currentSession: state.activeId === id ? undefined : state.currentSession,
            };
          });
        },
        
        clearAllSessions: () => {
          set({
            sessions: {},
            activeId: undefined,
            currentSession: undefined,
          });
        },
      }),
      {
        name: 'rag-store',
        partialize: (state) => ({
          sessions: Object.fromEntries(
            Object.entries(state.sessions).slice(-10)
          ),
        }),
      }
    ),
    { name: 'rag-store' }
  )
);