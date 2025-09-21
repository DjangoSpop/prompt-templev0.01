import { io, Socket } from 'socket.io-client';

export interface PromptOptimizationRequest {
  userIntent: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
}

export interface PromptOptimizationResponse {
  optimizedPrompt: string;
  suggestions: string[];
  confidence: number;
  processingTime: number;
  alternatives: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  relevanceScore: number;
  category: string;
  tags: string[];
}

interface WebSocketError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

interface SearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  minRating?: number;
}

export interface IntentAnalysisResult {
  detectedIntent: string;
  confidence: number;
  suggestedTemplates: SearchResult[];
  keywords: string[];
  category: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';
    
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      timeout: 5000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Real-time prompt optimization with <50ms target
  optimizePrompt(request: PromptOptimizationRequest): Promise<PromptOptimizationResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error('Optimization timeout - exceeded 50ms target'));
      }, 100); // 100ms fallback timeout

      this.socket.emit('optimize_prompt', request);

      this.socket.once('prompt_optimized', (response: PromptOptimizationResponse) => {
        clearTimeout(timeout);
        const processingTime = Date.now() - startTime;
        response.processingTime = processingTime;
        
        if (processingTime > 50) {
          console.warn(`Optimization took ${processingTime}ms - exceeds 50ms target`);
        }
        
        resolve(response);
      });

      this.socket.once('optimization_error', (error: WebSocketError) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Optimization failed'));
      });
    });
  }

  // Real-time intent analysis
  analyzeIntent(userInput: string): Promise<IntentAnalysisResult> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error('Intent analysis timeout'));
      }, 75); // 75ms timeout for intent analysis

      this.socket.emit('analyze_intent', { input: userInput, timestamp: startTime });

      this.socket.once('intent_analyzed', (result: IntentAnalysisResult) => {
        clearTimeout(timeout);
        const processingTime = Date.now() - startTime;
        
        if (processingTime > 50) {
          console.warn(`Intent analysis took ${processingTime}ms - exceeds 50ms target`);
        }
        
        resolve(result);
      });

      this.socket.once('intent_analysis_error', (error: WebSocketError) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Intent analysis failed'));
      });
    });
  }

  // Real-time search with vector similarity
  searchPrompts(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error('Search timeout'));
      }, 100);

      this.socket.emit('search_prompts', { query, filters, timestamp: startTime });

      this.socket.once('search_results', (results: SearchResult[]) => {
        clearTimeout(timeout);
        const processingTime = Date.now() - startTime;
        
        if (processingTime > 50) {
          console.warn(`Search took ${processingTime}ms - exceeds 50ms target`);
        }
        
        resolve(results);
      });

      this.socket.once('search_error', (error: WebSocketError) => {
        clearTimeout(timeout);
        reject(new Error(error.message || 'Search failed'));
      });
    });
  }

  // Subscribe to real-time suggestion updates
  onSuggestionUpdate(callback: (suggestions: string[]) => void) {
    if (this.socket) {
      this.socket.on('suggestion_update', callback);
    }
  }

  // Subscribe to typing indicators for collaborative features
  onTypingIndicator(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('typing_indicator', callback);
    }
  }

  // Send typing indicator
  sendTypingIndicator(isTyping: boolean, sessionId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { isTyping, sessionId });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
export const wsService = new WebSocketService();

export default WebSocketService;
