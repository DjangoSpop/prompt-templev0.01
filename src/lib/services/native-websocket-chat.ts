'use client';

'use client';

import { getAccessToken } from '@/lib/auth';

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
  sessionId?: string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export class NativeWebSocketChatService {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketChatConfig>;
  private connectionPromise: Promise<void> | null = null;
  private retryCount = 0;
  private messageQueue: Array<WebSocketMessage> = [];
  private eventListeners: Map<string, Set<(data?: unknown) => void>> = new Map();
  private isManuallyDisconnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionId: string | null = null;

  constructor(config: WebSocketChatConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com',
      enableOptimization: config.enableOptimization ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      maxRetries: config.maxRetries ?? 5,
      retryDelay: config.retryDelay ?? 3000,
      sessionId: config.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Ensure we're using WS/WSS URL for native WebSocket
    if (this.config.apiUrl.startsWith('http://')) {
      this.config.apiUrl = this.config.apiUrl.replace('http://', 'ws://');
    } else if (this.config.apiUrl.startsWith('https://')) {
      this.config.apiUrl = this.config.apiUrl.replace('https://', 'wss://');
    }

    console.log('🔧 Native WebSocket Chat Service initialized with config:', {
      apiUrl: this.config.apiUrl,
      sessionId: this.config.sessionId,
      enableOptimization: this.config.enableOptimization,
    });
  }

  /**
   * Initialize native WebSocket connection
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
      
      // Get authentication token
      const token = this._getAuthToken();
      
      // Build correct WebSocket URL for Django backend
      const wsUrl = `${this.config.apiUrl}/ws/chat/${this.config.sessionId}/${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      
      console.log('🔌 Connecting to native WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      await this._setupEventHandlers();
      await this._waitForConnection();
      
      // Start heartbeat
      this._startHeartbeat();
      
      // Process queued messages
      this._processMessageQueue();
      
      this.retryCount = 0;
      console.log('✅ Native WebSocket connected successfully');
      this._emit('connected', { sessionId: this.config.sessionId });
      
    } catch (error) {
      console.error('❌ Native WebSocket connection failed:', error);
      await this._handleConnectionError();
    }
  }

  private _getAuthToken(): string | null {
    // Try different token sources
    if (typeof window !== 'undefined') {
      // Try auth service first
      const authToken = getAccessToken();
      if (authToken) return authToken;
      
      // Fallback to localStorage
      const stored = localStorage.getItem('auth_token') || 
                    localStorage.getItem('access_token') ||
                    localStorage.getItem('token');
      if (stored) return stored;
      
      // Generate development token if none exists
      const devToken = `dev_token_${crypto.randomUUID()}`;
      localStorage.setItem('auth_token', devToken);
      console.log('🔑 Generated development auth token:', devToken);
      return devToken;
    }
    return null;
  }

  private async _setupEventHandlers(): Promise<void> {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('🎉 Native WebSocket opened successfully');
      this.connectionId = crypto.randomUUID();
      
      // Get user profile data for better backend context
      const token = this._getAuthToken();
      let userInfo = null;
      
      if (token) {
        try {
          // Decode JWT to get user info (basic decode, no verification needed on client)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          userInfo = JSON.parse(jsonPayload);
        } catch (error) {
          console.warn('Could not decode user token:', error);
        }
      }
      
      // Send connection acknowledgment with user context
      this._sendMessage({
        type: 'connection_init',
        sessionId: this.config.sessionId,
        timestamp: new Date().toISOString(),
        connectionId: this.connectionId,
        userInfo: userInfo ? {
          userId: userInfo.user_id,
          tokenExp: userInfo.exp,
          tokenIat: userInfo.iat,
        } : null,
        clientInfo: {
          userAgent: navigator?.userAgent || 'Unknown',
          platform: 'web',
          version: '1.0.0',
        },
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', data);
        this._handleIncomingMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error, event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
      this._emit('disconnected', { code: event.code, reason: event.reason });
      
      this._stopHeartbeat();
      
      // Only attempt reconnection if not manually disconnected
      if (!this.isManuallyDisconnected && event.code !== 1000) {
        this._handleDisconnection();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this._emit('error', error);
    };
  }

  private _handleIncomingMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'connection_ack':
        console.log('✅ Connection acknowledged by server');
        this._emit('connection_ack', data);
        break;

      case 'pong':
        // Handle heartbeat response
        if (data.ping_time) {
          const latency = Date.now() - (data.ping_time as number);
          this._emit('latency', { latency });
        }
        break;

      case 'message_response':
      case 'stream_start':
      case 'stream_token':
      case 'stream_complete':
      case 'message':
        console.log(`📧 Chat message (${data.type}):`, data);
        this._emit('messageResponse', data);
        break;

      case 'optimization_result':
        console.log('🎯 Optimization result:', data);
        this._emit('optimizationResult', data);
        break;

      case 'typing_start':
        this._emit('typing_start', data);
        break;

      case 'typing_stop':
        this._emit('typing_stop', data);
        break;

      case 'error':
        console.error('🚨 Server error details:', data);
        const errorMessage = data.message || data.error || data.detail || 'An error occurred';
        this._emit('error', {
          type: 'server_error',
          message: errorMessage,
          details: data,
        });
        break;

      default:
        console.log('📦 Unknown message type:', data.type, data);
        this._emit('message', data);
    }
  }

  private async _waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.ws.addEventListener('open', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.ws.addEventListener('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this._sendMessage({
          type: 'ping',
          timestamp: new Date().toISOString(),
          ping_time: Date.now(),
        });
      }
    }, 30000); // 30 second heartbeat
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private _processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this._sendMessage(message);
      }
    }
  }

  private _sendMessage(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log('📤 Sent WebSocket message:', message.type);
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      console.log('📋 Queued message for later:', message.type);
      return false;
    }
  }

  private async _handleConnectionError(): Promise<void> {
    this.connectionPromise = null;
    
    if (this.retryCount < this.config.maxRetries && !this.isManuallyDisconnected) {
      this.retryCount++;
      const delay = this.config.retryDelay * Math.pow(2, this.retryCount - 1);
      
      console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.retryCount}/${this.config.maxRetries})`);
      this._emit('reconnecting', { attempt: this.retryCount, delay });
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('💥 Max retry attempts reached or manually disconnected');
      this._emit('connectionFailed', { retryCount: this.retryCount });
    }
  }

  private _handleDisconnection(): void {
    if (!this.isManuallyDisconnected) {
      console.log('🔄 Attempting to reconnect...');
      setTimeout(() => {
        this.connect().catch(console.error);
      }, 1000);
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(content: string, options: {
    optimize?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    context?: string[];
  } = {}): Promise<void> {
    const message: WebSocketMessage = {
      type: 'send_message',
      content,
      sessionId: this.config.sessionId,
      timestamp: new Date().toISOString(),
      messageId: crypto.randomUUID(),
      options: {
        optimize: options.optimize ?? this.config.enableOptimization,
        model: options.model || 'deepseek-chat',
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000,
        context: options.context || [],
      },
    };

    const sent = this._sendMessage(message);
    if (sent) {
      this._emit('messageSent', { content, messageId: message.messageId });
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(isTyping: boolean): void {
    this._sendMessage({
      type: isTyping ? 'typing_start' : 'typing_stop',
      sessionId: this.config.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Request prompt optimization
   */
  async optimizePrompt(prompt: string): Promise<void> {
    this._sendMessage({
      type: 'optimize_prompt',
      prompt,
      sessionId: this.config.sessionId,
      timestamp: new Date().toISOString(),
      messageId: crypto.randomUUID(),
    });
  }

  /**
   * Get conversation history
   */
  async getHistory(limit = 50): Promise<void> {
    this._sendMessage({
      type: 'get_history',
      sessionId: this.config.sessionId,
      limit,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManuallyDisconnected = true;
    this._stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.connectionPromise = null;
    console.log('🔌 WebSocket manually disconnected');
    this._emit('disconnected', { manual: true });
  }

  /**
   * Reconnect WebSocket
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.connect();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): {
    sessionId: string;
    connectionId: string | null;
    isConnected: boolean;
    retryCount: number;
  } {
    return {
      sessionId: this.config.sessionId,
      connectionId: this.connectionId,
      isConnected: this.isConnected(),
      retryCount: this.retryCount,
    };
  }

  /**
   * Event listener management
   */
  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private _emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.messageQueue = [];
  }
}

// Export singleton instance
export const nativeWebSocketChat = new NativeWebSocketChatService();
