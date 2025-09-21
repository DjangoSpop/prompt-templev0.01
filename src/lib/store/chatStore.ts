import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  ChatState, 
  ChatMessage, 
  ChatSession, 
  WebSocketStatus
} from '../../types/chat';

interface ChatStore extends ChatState {
  // Session actions
  createSession: (title?: string) => string;
  selectSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  toggleSessionStar: (sessionId: string) => void;
  
  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'ts'>) => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  appendToMessage: (messageId: string, content: string) => void;
  
  // UI state actions
  setStreaming: (streaming: boolean) => void;
  setWsStatus: (status: Partial<WebSocketStatus>) => void;
  setRateLimited: (limited: boolean, cooldown?: number) => void;
  
  // Utility actions
  getCurrentSession: () => ChatSession | null;
  getCurrentMessages: () => ChatMessage[];
  getSessionMessages: (sessionId: string) => ChatMessage[];
  clearAllData: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  messages: {},
  streaming: false,
  wsStatus: {
    connected: false,
    reconnecting: false,
    offline: false,
    reconnectAttempts: 0,
  },
  rateLimited: false,
};

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        createSession: (title) => {
          const sessionId = generateId();
          const newSession: ChatSession = {
            id: sessionId,
            title: title || `Chat ${get().sessions.length + 1}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messageCount: 0,
          };
          
          set((state) => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: sessionId,
            messages: {
              ...state.messages,
              [sessionId]: [],
            },
          }));
          
          return sessionId;
        },
        
        selectSession: (sessionId) => {
          set({ currentSessionId: sessionId });
        },
        
        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId 
                ? { ...session, ...updates, updatedAt: Date.now() }
                : session
            ),
          }));
        },
        
        deleteSession: (sessionId) => {
          set((state) => {
            const newMessages = { ...state.messages };
            delete newMessages[sessionId];
            
            return {
              sessions: state.sessions.filter(s => s.id !== sessionId),
              messages: newMessages,
              currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
            };
          });
        },
        
        toggleSessionStar: (sessionId) => {
          set((state) => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId 
                ? { ...session, starred: !session.starred }
                : session
            ),
          }));
        },
        
        addMessage: (message) => {
          const messageId = generateId();
          const fullMessage: ChatMessage = {
            ...message,
            id: messageId,
            ts: Date.now(),
          };
          
          const sessionId = message.sessionId || get().currentSessionId;
          
          if (!sessionId) {
            throw new Error('No active session to add message to');
          }
          
          set((state) => {
            const sessionMessages = state.messages[sessionId] || [];
            
            return {
              messages: {
                ...state.messages,
                [sessionId]: [...sessionMessages, fullMessage],
              },
              sessions: state.sessions.map(session =>
                session.id === sessionId
                  ? { 
                      ...session, 
                      messageCount: session.messageCount + 1,
                      updatedAt: Date.now() 
                    }
                  : session
              ),
            };
          });
          
          return messageId;
        },
        
        updateMessage: (messageId, updates) => {
          set((state) => {
            const newMessages = { ...state.messages };
            
            for (const sessionId in newMessages) {
              const messages = newMessages[sessionId];
              const messageIndex = messages.findIndex(m => m.id === messageId);
              
              if (messageIndex !== -1) {
                newMessages[sessionId] = [
                  ...messages.slice(0, messageIndex),
                  { ...messages[messageIndex], ...updates },
                  ...messages.slice(messageIndex + 1),
                ];
                break;
              }
            }
            
            return { messages: newMessages };
          });
        },
        
        appendToMessage: (messageId, content) => {
          set((state) => {
            const newMessages = { ...state.messages };
            
            for (const sessionId in newMessages) {
              const messages = newMessages[sessionId];
              const messageIndex = messages.findIndex(m => m.id === messageId);
              
              if (messageIndex !== -1) {
                const currentMessage = messages[messageIndex];
                newMessages[sessionId] = [
                  ...messages.slice(0, messageIndex),
                  { 
                    ...currentMessage, 
                    content: currentMessage.content + content,
                    partial: true 
                  },
                  ...messages.slice(messageIndex + 1),
                ];
                break;
              }
            }
            
            return { messages: newMessages };
          });
        },
        
        setStreaming: (streaming) => set({ streaming }),
        
        setWsStatus: (status) => {
          set((state) => ({
            wsStatus: { ...state.wsStatus, ...status }
          }));
        },
        
        setRateLimited: (limited, cooldown) => {
          set({ rateLimited: limited, rateLimitCooldown: cooldown });
        },
        
        getCurrentSession: () => {
          const state = get();
          return state.sessions.find(s => s.id === state.currentSessionId) || null;
        },
        
        getCurrentMessages: () => {
          const state = get();
          return state.currentSessionId ? state.messages[state.currentSessionId] || [] : [];
        },
        
        getSessionMessages: (sessionId) => {
          return get().messages[sessionId] || [];
        },
        
        clearAllData: () => {
          set(initialState);
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          sessions: state.sessions,
          messages: state.messages,
          currentSessionId: state.currentSessionId,
        }),
      }
    ),
    { name: 'chat-store' }
  )
);
