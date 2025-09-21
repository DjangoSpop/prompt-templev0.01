import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  streaming?: boolean;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
  };
}

export interface ChatHealth {
  status: 'healthy' | 'degraded' | 'error';
  message: string;
  lastChecked: number;
}

export interface ChatState {
  messages: ChatMessage[];
  currentStreamingMessage?: ChatMessage;
  isStreaming: boolean;
  health?: ChatHealth;
  error?: string;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateStreamingMessage: (content: string) => void;
  finalizeStreamingMessage: () => void;
  clearMessages: () => void;
  setHealth: (health: ChatHealth) => void;
  setError: (error?: string) => void;
  send: (message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        isStreaming: false,
        health: undefined,
        error: undefined,
        
        addMessage: (message) => {
          const newMessage: ChatMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          };
          
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        },
        
        updateStreamingMessage: (content) => {
          set((state) => {
            if (!state.currentStreamingMessage) {
              const streamingMsg: ChatMessage = {
                id: `stream-${Date.now()}`,
                role: 'assistant',
                content,
                timestamp: Date.now(),
                streaming: true,
              };
              return {
                currentStreamingMessage: streamingMsg,
                isStreaming: true,
              };
            }
            
            return {
              currentStreamingMessage: {
                ...state.currentStreamingMessage,
                content: state.currentStreamingMessage.content + content,
              },
            };
          });
        },
        
        finalizeStreamingMessage: () => {
          set((state) => {
            if (!state.currentStreamingMessage) return state;
            
            const finalMessage = {
              ...state.currentStreamingMessage,
              streaming: false,
            };
            
            return {
              messages: [...state.messages, finalMessage],
              currentStreamingMessage: undefined,
              isStreaming: false,
            };
          });
        },
        
        clearMessages: () => {
          set({
            messages: [],
            currentStreamingMessage: undefined,
            isStreaming: false,
            error: undefined,
          });
        },
        
        setHealth: (health) => set({ health }),
        
        setError: (error) => set({ error }),
        
        send: async (message) => {
          const state = get();
          
          state.addMessage({
            role: 'user',
            content: message,
          });
          
          state.setError(undefined);
          set({ isStreaming: true });
          
          try {
            const response = await fetch('/api/v2/chat/completions/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${(window as any).authToken}`,
              },
              body: JSON.stringify({
                messages: [
                  ...state.messages.map(m => ({
                    role: m.role,
                    content: m.content,
                  })),
                  { role: 'user', content: message },
                ],
                stream: true,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Chat request failed: ${response.status}`);
            }
            
            if (!response.body) {
              throw new Error('No response body');
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '[DONE]') {
                    state.finalizeStreamingMessage();
                    continue;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    
                    if (parsed.type === 'stream_start') {
                      state.updateStreamingMessage('');
                    } else if (parsed.type === 'token') {
                      state.updateStreamingMessage(parsed.content || '');
                    } else if (parsed.type === 'stream_complete') {
                      state.finalizeStreamingMessage();
                    }
                  } catch (e) {
                    console.error('Failed to parse SSE data:', e);
                  }
                }
              }
            }
          } catch (error) {
            state.setError(error instanceof Error ? error.message : 'Unknown error');
            set({ isStreaming: false });
          }
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          messages: state.messages.slice(-50),
        }),
      }
    ),
    { name: 'chat-store' }
  )
);