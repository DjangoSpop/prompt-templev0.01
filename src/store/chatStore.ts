import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date | string;
  processingTime?: number;
  optimizationResult?: any;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastHeartbeat: Date | null;
  latency: number | null;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, update: Partial<ChatMessage>) => void;
  setTypingIndicator: (isTyping: boolean) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  updateLastHeartbeat: () => void;
  updateLatency: (latencyMs: number) => void;
  addOptimizationResult: (result: any) => void;
  addIntentResult: (result: any) => void;
  clearMessages: () => void;
  showError: (message: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  connectionStatus: 'disconnected',
  lastHeartbeat: null,
  latency: null,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    isTyping: false
  })),
  
  updateMessage: (id, update) => set((state) => ({
    messages: state.messages.map(message => 
      message.id === id ? { ...message, ...update } : message
    )
  })),
  
  setTypingIndicator: (isTyping) => set({ isTyping }),
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updateLastHeartbeat: () => set({ lastHeartbeat: new Date() }),
  
  updateLatency: (latencyMs) => set({ latency: latencyMs }),
  
  addOptimizationResult: (result) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === result.message_id 
        ? { ...msg, optimizationResult: result }
        : msg
    )
  })),
  
  addIntentResult: (result) => set((state) => {
    // Add intent result as a new message
    return {
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          content: `Intent Analysis: ${result.category} (${Math.round(result.confidence * 100)}% confidence)\n\n${result.suggestions?.join('\n')}`,
          role: 'assistant',
          timestamp: new Date(),
          processingTime: result.processing_time_ms
        }
      ]
    };
  }),
  
  clearMessages: () => set({ messages: [] }),
  
  showError: (message) => {
    toast.error(message);
    return set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          content: `Error: ${message}`,
          role: 'system',
          timestamp: new Date()
        }
      ]
    }));
  }
}));
