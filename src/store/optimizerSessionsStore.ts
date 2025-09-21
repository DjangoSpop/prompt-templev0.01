import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// Types for optimizer sessions
export interface OptimMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  meta?: {
    variant?: 'A' | 'B' | 'C';
    tokens?: number;
    latencyMs?: number;
    clientRequestId?: string;
  };
  createdAt: number;
}

export interface OptimSession {
  id: string;
  title: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
  variables?: Record<string, unknown>;
  bestPrompt?: string;
  rubric?: {
    clarity: number;
    specificity: number;
    faithfulness: number;
  };
  messages: OptimMessage[];
}

export interface RubricHistory {
  sessionId: string;
  timestamp: number;
  rubric: {
    clarity: number;
    specificity: number;
    faithfulness: number;
  };
}

export interface OptimizerSessionsState {
  // Sessions data
  sessions: Record<string, OptimSession>;
  lastActiveSessionId?: string;
  
  // UI state
  activeSessionId?: string;
  searchQuery: string;
  isLoading: boolean;
  error?: string;
  
  // Cache settings
  messageLimit: number; // LRU limit per session
  maxSessions: number;   // Maximum sessions to keep
  
  // History tracking
  rubricHistory: RubricHistory[];
}

export interface OptimizerSessionsActions {
  // Session management
  createSession: (templateId?: string, variables?: Record<string, unknown>) => string;
  duplicateSession: (sessionId: string) => string;
  renameSession: (sessionId: string, title: string) => void;
  pinSession: (sessionId: string, pinned: boolean) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId?: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: Omit<OptimMessage, 'id' | 'createdAt'>) => string;
  removeMessage: (sessionId: string, messageId: string) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<OptimMessage>) => void;
  
  // Best prompt management
  updateBestPrompt: (sessionId: string, prompt: string) => void;
  acceptVariant: (sessionId: string, messageId: string, variant?: 'A' | 'B' | 'C') => void;
  
  // Rubric management
  updateRubric: (sessionId: string, rubric: OptimSession['rubric']) => void;
  addRubricHistory: (sessionId: string, rubric: OptimSession['rubric']) => void;
  getRubricHistory: (sessionId: string, limit?: number) => RubricHistory[];
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  getFilteredSessions: () => OptimSession[];
  getSortedSessions: (sortBy?: 'updated' | 'created' | 'title') => OptimSession[];
  
  // Template context
  attachTemplateContext: (sessionId: string, templateId: string, variables: Record<string, unknown>) => void;
  
          // Navigation persistence
  persistNavigation: () => void;
  restoreNavigation: () => void;  // Cache management
  trimMessages: (sessionId: string) => void;
  trimSessions: () => void;
  clearCache: () => void;
  
  // Utility
  exportSession: (sessionId: string, format: 'json' | 'md') => string;
  getSessionStats: (sessionId: string) => {
    messageCount: number;
    tokenCount: number;
    avgLatency: number;
    lastActivity: number;
  };
  
  // Request deduplication
  addClientRequestId: (sessionId: string, messageId: string, clientRequestId: string) => void;
  isDuplicateRequest: (sessionId: string, clientRequestId: string) => boolean;
}

const initialState: OptimizerSessionsState = {
  sessions: {},
  searchQuery: '',
  isLoading: false,
  messageLimit: 50,
  maxSessions: 100,
  rubricHistory: [],
};

export const useOptimizerSessionsStore = create<OptimizerSessionsState & OptimizerSessionsActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        createSession: (templateId, variables) => {
          const now = Date.now();
          const sessionId = `session_${now}`;
          
          const newSession: OptimSession = {
            id: sessionId,
            title: templateId ? `Template Session ${new Date().toLocaleString()}` : `New Session ${new Date().toLocaleString()}`,
            createdAt: now,
            updatedAt: now,
            templateId,
            variables,
            messages: [],
          };

          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: newSession,
            },
            activeSessionId: sessionId,
            lastActiveSessionId: sessionId,
          }));

          // Trim sessions if needed
          get().trimSessions();
          
          return sessionId;
        },

        duplicateSession: (sessionId) => {
          const session = get().sessions[sessionId];
          if (!session) return '';

          const now = Date.now();
          const newSessionId = `session_${now}`;
          
          const duplicatedSession: OptimSession = {
            ...session,
            id: newSessionId,
            title: `${session.title} (Copy)`,
            createdAt: now,
            updatedAt: now,
            // Keep messages but clear best prompt to encourage re-optimization
            bestPrompt: undefined,
            rubric: undefined,
          };

          set((state) => ({
            sessions: {
              ...state.sessions,
              [newSessionId]: duplicatedSession,
            },
            activeSessionId: newSessionId,
            lastActiveSessionId: newSessionId,
          }));

          return newSessionId;
        },

        renameSession: (sessionId, title) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId] 
                ? { ...state.sessions[sessionId], title, updatedAt: Date.now() }
                : state.sessions[sessionId],
            },
          }));
        },

        pinSession: (sessionId, pinned) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { ...state.sessions[sessionId], pinned, updatedAt: Date.now() }
                : state.sessions[sessionId],
            },
          }));
        },

        deleteSession: (sessionId) => {
          set((state) => {
            const newSessions = { ...state.sessions };
            delete newSessions[sessionId];
            
            // Update active session if deleted
            const activeSessionId = state.activeSessionId === sessionId 
              ? Object.keys(newSessions)[0] || undefined
              : state.activeSessionId;

            return {
              sessions: newSessions,
              activeSessionId,
              lastActiveSessionId: activeSessionId,
              rubricHistory: state.rubricHistory.filter(h => h.sessionId !== sessionId),
            };
          });
        },

        setActiveSession: (sessionId) => {
          set({
            activeSessionId: sessionId,
            lastActiveSessionId: sessionId,
          });
        },

        addMessage: (sessionId, messageData) => {
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = Date.now();
          
          const message: OptimMessage = {
            ...messageData,
            id: messageId,
            createdAt: now,
          };

          set((state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;

            const updatedMessages = [...session.messages, message];
            
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: updatedMessages,
                  updatedAt: now,
                },
              },
            };
          });

          // Trim messages if needed
          get().trimMessages(sessionId);
          
          return messageId;
        },

        removeMessage: (sessionId, messageId) => {
          set((state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: session.messages.filter(m => m.id !== messageId),
                  updatedAt: Date.now(),
                },
              },
            };
          });
        },

        updateMessage: (sessionId, messageId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: session.messages.map(m =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now(),
                },
              },
            };
          });
        },

        updateBestPrompt: (sessionId, prompt) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { ...state.sessions[sessionId], bestPrompt: prompt, updatedAt: Date.now() }
                : state.sessions[sessionId],
            },
          }));
        },

        acceptVariant: (sessionId, messageId, variant) => {
          const session = get().sessions[sessionId];
          if (!session) return;

          const message = session.messages.find(m => m.id === messageId);
          if (!message || message.role !== 'model') return;

          // Update best prompt with the message content
          get().updateBestPrompt(sessionId, message.content);
          
          // Mark the variant as accepted in message meta
          get().updateMessage(sessionId, messageId, {
            meta: { ...message.meta, variant: variant || 'A' },
          });
        },

        updateRubric: (sessionId, rubric) => {
          if (!rubric) return;
          
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { ...state.sessions[sessionId], rubric, updatedAt: Date.now() }
                : state.sessions[sessionId],
            },
          }));

          // Add to history
          get().addRubricHistory(sessionId, rubric);
        },

        addRubricHistory: (sessionId, rubric) => {
          if (!rubric) return;
          
          const historyEntry: RubricHistory = {
            sessionId,
            timestamp: Date.now(),
            rubric,
          };

          set((state) => ({
            rubricHistory: [...state.rubricHistory, historyEntry].slice(-200), // Keep last 200 entries
          }));
        },

        getRubricHistory: (sessionId, limit = 10) => {
          return get().rubricHistory
            .filter(h => h.sessionId === sessionId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
        },

        setSearchQuery: (query) => set({ searchQuery: query }),

        getFilteredSessions: () => {
          const { sessions, searchQuery } = get();
          const sessionsList = Object.values(sessions);

          if (!searchQuery.trim()) return sessionsList;

          const query = searchQuery.toLowerCase();
          return sessionsList.filter(session =>
            session.title.toLowerCase().includes(query) ||
            session.bestPrompt?.toLowerCase().includes(query) ||
            session.messages.some(m => m.content.toLowerCase().includes(query))
          );
        },

        getSortedSessions: (sortBy = 'updated') => {
          const sessions = get().getFilteredSessions();
          
          return sessions.sort((a, b) => {
            // Pinned sessions first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            switch (sortBy) {
              case 'created':
                return b.createdAt - a.createdAt;
              case 'title':
                return a.title.localeCompare(b.title);
              case 'updated':
              default:
                return b.updatedAt - a.updatedAt;
            }
          });
        },

        attachTemplateContext: (sessionId, templateId, variables) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { 
                    ...state.sessions[sessionId], 
                    templateId, 
                    variables, 
                    updatedAt: Date.now() 
                  }
                : state.sessions[sessionId],
            },
          }));
        },

        persistNavigation: () => {
          const { lastActiveSessionId } = get();
          if (typeof window !== 'undefined' && lastActiveSessionId) {
            localStorage.setItem('optimizer_last_active_session', lastActiveSessionId);
          }
        },

        restoreNavigation: () => {
          if (typeof window !== 'undefined') {
            const lastSessionId = localStorage.getItem('optimizer_last_active_session');
            if (lastSessionId && get().sessions[lastSessionId]) {
              set({ 
                activeSessionId: lastSessionId,
                lastActiveSessionId: lastSessionId,
              });
            }
          }
        },

        trimMessages: (sessionId) => {
          const session = get().sessions[sessionId];
          if (!session || session.messages.length <= get().messageLimit) return;

          const trimmed = session.messages.slice(-get().messageLimit);
          
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: trimmed,
              },
            },
          }));
        },

        trimSessions: () => {
          const { sessions, maxSessions } = get();
          const sessionsList = Object.values(sessions);
          
          if (sessionsList.length <= maxSessions) return;

          // Keep pinned sessions and most recent ones
          const sorted = sessionsList.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.updatedAt - a.updatedAt;
          });

          const toKeep = sorted.slice(0, maxSessions);
          const newSessions: Record<string, OptimSession> = {};
          
          toKeep.forEach(session => {
            newSessions[session.id] = session;
          });

          set({ sessions: newSessions });
        },

        clearCache: () => {
          set({
            sessions: {},
            activeSessionId: undefined,
            lastActiveSessionId: undefined,
            searchQuery: '',
            rubricHistory: [],
          });
        },

        exportSession: (sessionId, format) => {
          const session = get().sessions[sessionId];
          if (!session) return '';

          const data = {
            session,
            exportedAt: new Date().toISOString(),
            rubricHistory: get().getRubricHistory(sessionId),
          };

          switch (format) {
            case 'json':
              return JSON.stringify(data, null, 2);
            case 'md':
              const md = [
                `# ${session.title}`,
                `**Created:** ${new Date(session.createdAt).toLocaleString()}`,
                `**Last Updated:** ${new Date(session.updatedAt).toLocaleString()}`,
                session.bestPrompt ? `**Best Prompt:** ${session.bestPrompt}` : '',
                session.rubric ? `**Rubric Scores:** Clarity: ${session.rubric.clarity}, Specificity: ${session.rubric.specificity}, Faithfulness: ${session.rubric.faithfulness}` : '',
                '',
                '## Conversation',
                '',
                ...session.messages.map(msg => 
                  `**${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}** (${new Date(msg.createdAt).toLocaleString()}):\n${msg.content}\n`
                ),
                '',
                `*Exported: ${new Date().toLocaleString()}*`
              ].filter(Boolean).join('\n');
              return md;
            default:
              return '';
          }
        },

        getSessionStats: (sessionId) => {
          const session = get().sessions[sessionId];
          if (!session) {
            return { messageCount: 0, tokenCount: 0, avgLatency: 0, lastActivity: 0 };
          }

          const messages = session.messages;
          const tokenCount = messages.reduce((sum, msg) => sum + (msg.meta?.tokens || 0), 0);
          const latencies = messages.filter(msg => msg.meta?.latencyMs).map(msg => msg.meta!.latencyMs!);
          const avgLatency = latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;
          
          return {
            messageCount: messages.length,
            tokenCount,
            avgLatency: Math.round(avgLatency),
            lastActivity: session.updatedAt,
          };
        },

        addClientRequestId: (sessionId, messageId, clientRequestId) => {
          get().updateMessage(sessionId, messageId, {
            meta: {
              ...get().sessions[sessionId]?.messages.find(m => m.id === messageId)?.meta,
              clientRequestId,
            },
          });
        },

        isDuplicateRequest: (sessionId, clientRequestId) => {
          const session = get().sessions[sessionId];
          if (!session) return false;

          return session.messages.some(msg => 
            msg.meta?.clientRequestId === clientRequestId
          );
        },
      }),
      {
        name: 'promptcraft-optimizer-sessions',
        version: 1,
        partialize: (state) => ({
          sessions: Object.fromEntries(
            Object.entries(state.sessions)
              .sort(([,a], [,b]) => b.updatedAt - a.updatedAt)
              .slice(0, state.maxSessions)
          ),
          lastActiveSessionId: state.lastActiveSessionId,
          rubricHistory: state.rubricHistory.slice(-200),
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Restore navigation on hydration
            state.restoreNavigation();
            // Trim any excess data that might have been persisted
            state.trimSessions();
          }
        },
      }
    )
  )
);

// Selector hooks for performance
export const useActiveSession = () => 
  useOptimizerSessionsStore(state => 
    state.activeSessionId ? state.sessions[state.activeSessionId] : undefined
  );

export const useSessionsList = () =>
  useOptimizerSessionsStore(state => state.getSortedSessions());

export const useSessionStats = (sessionId: string) =>
  useOptimizerSessionsStore(state => state.getSessionStats(sessionId));