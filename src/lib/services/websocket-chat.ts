'use client';

import React from 'react';
import { io, Socket } from 'socket.io-client';
import { billingService } from './billing';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    model?: string;
    tokens?: number;
    cost?: number;
  };
  optimizationData?: PromptOptimizationResult;
  status?: 'sending' | 'processing' | 'completed' | 'error';
}

export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  score: number;
  suggestions: string[];
  intent: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
}

export interface WebSocketChatConfig {
  apiUrl?: string;
  enableOptimization?: boolean;
  enableAnalytics?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export class WebSocketChatService {
  private socket: Socket | null = null;
  private config: Required<WebSocketChatConfig>;
  private connectionPromise: Promise<void> | null = null;
  private retryCount = 0;
  private messageQueue: Array<{ event: string; data: unknown }> = [];
  private eventListeners: Map<string, Set<(data?: unknown) => void>> = new Map();
  private isManuallyDisconnected = false;
  private connectionInfo: Record<string, unknown> | null = null;

  constructor(config: WebSocketChatConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com',
      enableOptimization: config.enableOptimization ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      maxRetries: config.maxRetries ?? 5,
      retryDelay: config.retryDelay ?? 3000,
    };

    // Ensure we're using HTTP/HTTPS URL, not WS/WSS for Socket.IO
    if (this.config.apiUrl.startsWith('ws://')) {
      this.config.apiUrl = this.config.apiUrl.replace('ws://', 'http://');
    } else if (this.config.apiUrl.startsWith('wss://')) {
      this.config.apiUrl = this.config.apiUrl.replace('wss://', 'https://');
    }
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    try {
      this.isManuallyDisconnected = false;
      
      // First, check WebSocket info endpoint
      await this._checkWebSocketInfo();
      
      // Get authentication token
      const token = await this._getAuthToken();
      
      console.log('Attempting Socket.IO connection to:', this.config.apiUrl);
      
      this.socket = io(this.config.apiUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'], // Allow fallback to polling
        upgrade: true,
        rememberUpgrade: true,
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.config.maxRetries,
        reconnectionDelay: this.config.retryDelay,
      });

      await this._setupEventHandlers();
      await this._waitForConnection();
      
      // Process queued messages
      this._processMessageQueue();
      
      this.retryCount = 0;
      console.log('WebSocket connected successfully');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      await this._handleConnectionError();
    }
  }

  private async _checkWebSocketInfo(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/ws/info/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.connectionInfo = await response.json();
        console.log('WebSocket info:', this.connectionInfo);
      } else {
        console.warn('WebSocket info endpoint not available, proceeding with default settings');
      }
    } catch (error) {
      console.warn('Failed to fetch WebSocket info:', error);
      // Continue without WebSocket info
    }
  }

  private async _getAuthToken(): Promise<string> {
    // Get token from localStorage or API client
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  private async _setupEventHandlers(): Promise<void> {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.IO connected with ID:', this.socket?.id);
      this._emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this._emit('disconnected', reason);
      
      // Only attempt reconnection if not manually disconnected
      if (!this.isManuallyDisconnected) {
        this._handleDisconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this._emit('error', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      this._emit('error', error);
    });

    // Chat-specific events
    this.socket.on('message_response', (data) => {
      console.log('Received message response:', data);
      
      // Handle credit deduction for AI responses
      if (data.metadata?.cost) {
        billingService.consumeCredits('chat_message', data.metadata.cost)
          .catch(error => console.error('Error updating credits:', error));
      }
      
      this._emit('messageResponse', data);
    });

    this.socket.on('optimization_result', (data) => {
      console.log('Received optimization result:', data);
      this._emit('optimizationResult', data);
    });

    this.socket.on('typing_start', (data) => {
      console.log('User started typing:', data);
      this._emit('typing', data);
    });

    this.socket.on('typing_stop', (data) => {
      console.log('User stopped typing:', data);
      this._emit('typingStop', data);
    });

    this.socket.on('analytics_update', (data) => {
      console.log('Analytics update:', data);
      this._emit('analyticsUpdate', data);
    });

    this.socket.on('template_recommendation', (data) => {
      console.log('Template recommendation:', data);
      this._emit('templateRecommendation', data);
    });

    // Handle backend status updates
    this.socket.on('status_update', (data) => {
      console.log('Status update:', data);
      this._emit('statusUpdate', data);
    });

    // Handle billing/credit updates
    this.socket.on('credit_update', (data) => {
      console.log('Credit update:', data);
      if (data.credits_remaining !== undefined) {
        localStorage.setItem('credits_remaining', data.credits_remaining.toString());
      }
      this._emit('creditUpdate', data);
    });

    // Handle template opportunities
    this.socket.on('template_opportunity', (data) => {
      console.log('Template opportunity detected:', data);
      this._emit('templateOpportunity', data);
    });

    // Handle billing errors
    this.socket.on('billing_error', (data) => {
      console.error('Billing error:', data);
      this._emit('billingError', data);
    });
  }

  private async _waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.socket.connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout - server may not support WebSocket'));
      }, 15000); // Increased timeout

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Connection failed: ${error.message}`));
      });
    });
  }

  private async _handleConnectionError(): Promise<void> {
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      console.log(`Retrying connection (${this.retryCount}/${this.config.maxRetries}) in ${this.config.retryDelay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      this.connectionPromise = null;
      
      // Exponential backoff
      this.config.retryDelay = Math.min(this.config.retryDelay * 1.5, 10000);
      
      try {
        await this.connect();
      } catch (error) {
        console.error('Retry failed:', error);
        if (this.retryCount >= this.config.maxRetries) {
          this._emit('maxRetriesReached', error);
        }
      }
    } else {
      const error = new Error('Max connection retries exceeded. Please check your internet connection and server status.');
      this._emit('connectionFailed', error);
      throw error;
    }
  }

  private _handleDisconnection(): void {
    // Reset connection promise to allow reconnection
    this.connectionPromise = null;
    
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect().catch(console.error);
      }
    }, this.config.retryDelay);
  }

  private _processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift()!;
      this._sendMessage(event, data);
    }
  }

  private _sendMessage(event: string, data: unknown): void {
    if (!this.socket?.connected) {
      this.messageQueue.push({ event, data });
      this.connect().catch(console.error);
      return;
    }

    this.socket.emit(event, data);
  }

  private _emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(content: string, options: {
    optimize?: boolean;
    context?: string[];
    templateId?: string;
  } = {}): Promise<string> {
    // Check billing limits before sending
    try {
      const canSend = await billingService.canPerformAction('chat_message', 1);
      if (!canSend) {
        throw new Error('Insufficient credits or plan limitations. Please upgrade your plan to continue chatting.');
      }
    } catch (error) {
      console.error('Billing check failed:', error);
      this._emit('error', error);
      throw error;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id: messageId,
      content,
      timestamp: new Date().toISOString(),
      options: {
        optimize: options.optimize ?? this.config.enableOptimization,
        context: options.context || [],
        templateId: options.templateId,
      },
    };

    // Try WebSocket first, fallback to HTTP if not connected
    if (this.socket?.connected) {
      this._sendMessage('chat_message', messageData);
    } else {
      console.warn('WebSocket not connected, using HTTP fallback');
      await this._sendMessageHTTP(messageData);
    }
    
    // Track analytics if enabled
    if (this.config.enableAnalytics) {
      this._trackEvent('message_sent', {
        messageId,
        contentLength: content.length,
        hasContext: !!options.context?.length,
        hasTemplateId: !!options.templateId,
        method: this.socket?.connected ? 'websocket' : 'http',
      });
    }

    return messageId;
  }

  /**
   * HTTP fallback for sending messages
   */
  private async _sendMessageHTTP(messageData: unknown): Promise<void> {
    try {
      const token = await this._getAuthToken();
      const response = await fetch(`${this.config.apiUrl}/api/v2/chat/message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const result = await response.json();
        // Emit the response as if it came from WebSocket
        this._emit('messageResponse', result);
      } else {
        throw new Error(`HTTP request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('HTTP fallback failed:', error);
      this._emit('error', error);
    }
  }

  /**
   * Request prompt optimization
   */
  async optimizePrompt(prompt: string, options: {
    intent?: string;
    targetAudience?: string;
    desiredTone?: string;
    maxTokens?: number;
  } = {}): Promise<string> {
    const requestId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const optimizationData = {
      id: requestId,
      prompt,
      options,
      timestamp: new Date().toISOString(),
    };

    this._sendMessage('optimize_prompt', optimizationData);
    
    if (this.config.enableAnalytics) {
      this._trackEvent('optimization_requested', {
        requestId,
        promptLength: prompt.length,
        hasIntent: !!options.intent,
      });
    }

    return requestId;
  }

  /**
   * Start typing indicator
   */
  startTyping(): void {
    this._sendMessage('typing_start', { timestamp: new Date().toISOString() });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(): void {
    this._sendMessage('typing_stop', { timestamp: new Date().toISOString() });
  }

  /**
   * Search templates via WebSocket
   */
  async searchTemplates(query: string, filters: {
    category?: string;
    tags?: string[];
    author?: string;
    featured?: boolean;
  } = {}): Promise<string> {
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const searchData = {
      id: searchId,
      query,
      filters,
      timestamp: new Date().toISOString(),
    };

    this._sendMessage('search_templates', searchData);
    return searchId;
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<string> {
    const requestId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this._sendMessage('get_user_analytics', {
      id: requestId,
      timestamp: new Date().toISOString(),
    });

    return requestId;
  }

  /**
   * Save conversation as template
   */
  async saveConversationAsTemplate(title: string, description: string, messages: ChatMessage[]): Promise<string> {
    // Check if user can create templates
    try {
      const canCreate = await billingService.canPerformAction('create_template');
      if (!canCreate) {
        throw new Error('Template creation limit reached for your plan. Please upgrade to create more templates.');
      }
    } catch (error) {
      console.error('Template creation check failed:', error);
      this._emit('error', error);
      throw error;
    }

    const requestId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const templateData = {
      id: requestId,
      title,
      description,
      messages,
      timestamp: new Date().toISOString(),
    };

    this._sendMessage('save_conversation_as_template', templateData);
    
    if (this.config.enableAnalytics) {
      this._trackEvent('template_created', {
        requestId,
        messageCount: messages.length,
        titleLength: title.length,
      });
    }

    return requestId;
  }

  /**
   * Request template analysis for current conversation
   */
  async analyzeForTemplate(messages: ChatMessage[]): Promise<string> {
    const requestId = `analyze_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const analysisData = {
      id: requestId,
      messages,
      timestamp: new Date().toISOString(),
    };

    this._sendMessage('analyze_for_template', analysisData);
    return requestId;
  }

  /**
   * Track custom analytics event
   */
  private _trackEvent(event: string, data: Record<string, unknown>): void {
    if (!this.config.enableAnalytics) return;

    this._sendMessage('track_event', {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this._getSessionId(),
    });
  }

  private _getSessionId(): string {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Event listener management
   */
  on(event: string, listener: (data?: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: (data?: unknown) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.isManuallyDisconnected = true;
    
    if (this.socket) {
      console.log('Manually disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionPromise = null;
    this.retryCount = 0;
    this.messageQueue = [];
    this.eventListeners.clear();
    this.connectionInfo = null;
  }

  /**
   * Reconnect to WebSocket
   */
  async reconnect(): Promise<void> {
    console.log('Manual reconnection requested');
    this.disconnect();
    this.isManuallyDisconnected = false;
    await this.connect();
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const webSocketChatService = new WebSocketChatService();

// React hook for easy integration
export function useWebSocketChat(config?: WebSocketChatConfig) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const serviceRef = React.useRef<WebSocketChatService>(
    config ? new WebSocketChatService(config) : webSocketChatService
  );

  React.useEffect(() => {
    const service = serviceRef.current;

    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (data?: unknown) => {
      const error = data as Error | string | undefined;
      setError(typeof error === 'string' ? error : error?.message || 'Connection error');
      setIsConnecting(false);
    };

    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);
    service.on('error', handleError);

    // Auto-connect
    setIsConnecting(true);
    service.connect().catch(handleError);

    return () => {
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
      service.off('error', handleError);
    };
  }, []);

  return {
    service: serviceRef.current,
    isConnected,
    isConnecting,
    error,
  };
}
