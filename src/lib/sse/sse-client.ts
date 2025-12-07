/**
 * Production-ready SSE (Server-Sent Events) client
 * Features: reconnection logic, heartbeat monitoring, error recovery,
 * buffer management, and proper cleanup
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { handleError, AppError } from '../errors/error-handler';

// ============================================
// Types
// ============================================

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export interface SSEClientConfig {
  url: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  onOpen?: () => void;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: AppError) => void;
  onClose?: () => void;
  onReconnect?: (attempt: number) => void;
}

export enum SSEConnectionState {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

// ============================================
// SSE Client Class
// ============================================

export class SSEClient {
  private eventSource: EventSource | null = null;
  private config: Required<Omit<SSEClientConfig, 'onOpen' | 'onMessage' | 'onError' | 'onClose' | 'onReconnect'>> & Pick<SSEClientConfig, 'onOpen' | 'onMessage' | 'onError' | 'onClose' | 'onReconnect'>;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = Date.now();
  private state: SSEConnectionState = SSEConnectionState.CLOSED;
  private messageBuffer: SSEMessage[] = [];
  private maxBufferSize = 100;

  constructor(config: SSEClientConfig) {
    this.config = {
      withCredentials: false,
      headers: {},
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      ...config,
    };
  }

  // ============================================
  // Connection Management
  // ============================================

  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.warn('[SSE] Already connected');
      return;
    }

    this.setState(SSEConnectionState.CONNECTING);

    try {
      // Build URL with headers as query params if needed
      const url = this.buildURL();

      this.eventSource = new EventSource(url, {
        withCredentials: this.config.withCredentials,
      });

      this.setupEventHandlers();
      this.startHeartbeat();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  disconnect(): void {
    this.cleanup();
    this.setState(SSEConnectionState.CLOSED);
    this.config.onClose?.();
  }

  reconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[SSE] Max reconnect attempts reached');
      this.setState(SSEConnectionState.ERROR);
      this.config.onError?.(
        new AppError(
          'Failed to reconnect after multiple attempts',
          'SSE_RECONNECT_FAILED',
          0
        )
      );
      return;
    }

    this.reconnectAttempts++;
    this.setState(SSEConnectionState.RECONNECTING);
    this.config.onReconnect?.(this.reconnectAttempts);

    const delay = this.calculateReconnectDelay();

    this.reconnectTimeout = setTimeout(() => {
      console.log(`[SSE] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  private calculateReconnectDelay(): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.reconnectInterval;
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    const maxDelay = 30000; // 30 seconds max
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    
    return Math.min(exponentialDelay, maxDelay) + jitter;
  }

  // ============================================
  // Event Handlers
  // ============================================

  private setupEventHandlers(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
      this.setState(SSEConnectionState.OPEN);
      this.reconnectAttempts = 0;
      this.config.onOpen?.();
      this.flushMessageBuffer();
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.updateHeartbeat();
      
      const message: SSEMessage = {
        id: event.lastEventId,
        data: event.data,
      };

      this.processMessage(message);
    };

    this.eventSource.onerror = (error: Event) => {
      console.error('[SSE] Connection error:', error);
      
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.setState(SSEConnectionState.ERROR);
        this.handleConnectionError(error);
      } else if (this.eventSource?.readyState === EventSource.CONNECTING) {
        console.log('[SSE] Reconnecting...');
        this.setState(SSEConnectionState.RECONNECTING);
      }
    };

    // Handle custom events
    this.setupCustomEventHandlers();
  }

  private setupCustomEventHandlers(): void {
    if (!this.eventSource) return;

    // Token event
    this.eventSource.addEventListener('token', (event: Event) => {
      const messageEvent = event as MessageEvent;
      this.processMessage({
        event: 'token',
        data: messageEvent.data,
      });
    });

    // Done event
    this.eventSource.addEventListener('done', (event: Event) => {
      const messageEvent = event as MessageEvent;
      this.processMessage({
        event: 'done',
        data: messageEvent.data,
      });
      this.disconnect();
    });

    // Error event
    this.eventSource.addEventListener('error', (event: Event) => {
      const messageEvent = event as MessageEvent;
      this.processMessage({
        event: 'error',
        data: messageEvent.data,
      });
    });

    // Heartbeat event
    this.eventSource.addEventListener('heartbeat', () => {
      this.updateHeartbeat();
    });

    // Retry event
    this.eventSource.addEventListener('retry', (event: Event) => {
      const messageEvent = event as MessageEvent;
      const retryTime = parseInt(messageEvent.data, 10);
      if (!isNaN(retryTime)) {
        this.config.reconnectInterval = retryTime;
      }
    });
  }

  // ============================================
  // Message Processing
  // ============================================

  private processMessage(message: SSEMessage): void {
    try {
      // Try to parse JSON data
      if (message.data) {
        try {
          const parsed = JSON.parse(message.data);
          message.data = parsed;
        } catch {
          // Keep as string if not valid JSON
        }
      }

      // Buffer messages if not connected
      if (this.state !== SSEConnectionState.OPEN) {
        this.bufferMessage(message);
        return;
      }

      this.config.onMessage?.(message);
    } catch (error) {
      console.error('[SSE] Failed to process message:', error);
    }
  }

  private bufferMessage(message: SSEMessage): void {
    this.messageBuffer.push(message);
    
    // Limit buffer size
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer.shift();
    }
  }

  private flushMessageBuffer(): void {
    if (this.messageBuffer.length === 0) return;

    console.log(`[SSE] Flushing ${this.messageBuffer.length} buffered messages`);
    
    this.messageBuffer.forEach((message) => {
      this.config.onMessage?.(message);
    });

    this.messageBuffer = [];
  }

  // ============================================
  // Heartbeat Monitoring
  // ============================================

  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();

    // Send heartbeat check periodically
    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;

      if (timeSinceLastHeartbeat > this.config.heartbeatTimeout) {
        console.warn('[SSE] Heartbeat timeout - reconnecting');
        this.reconnect();
      }
    }, this.config.heartbeatInterval);
  }

  private updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // ============================================
  // Error Handling
  // ============================================

  private handleConnectionError(error: unknown): void {
    const appError = new AppError(
      'SSE connection failed',
      'SSE_CONNECTION_ERROR',
      0,
      true,
      { error }
    );

    this.config.onError?.(appError);
    this.reconnect();
  }

  // ============================================
  // Cleanup
  // ============================================

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // ============================================
  // Helpers
  // ============================================

  private buildURL(): string {
    const url = new URL(this.config.url);

    // Add authorization token if available
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    if (token && !this.config.headers['Authorization']) {
      url.searchParams.append('token', token);
    }

    // Add custom headers as query params (EventSource doesn't support custom headers)
    Object.entries(this.config.headers).forEach(([key, value]) => {
      if (key !== 'Authorization') {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }

  private setState(state: SSEConnectionState): void {
    this.state = state;
  }

  // ============================================
  // Public API
  // ============================================

  getState(): SSEConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === SSEConnectionState.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getBufferedMessageCount(): number {
    return this.messageBuffer.length;
  }
}

// ============================================
// React Hook
// ============================================

export interface UseSSEOptions {
  enabled?: boolean;
  reconnectOnMount?: boolean;
  clearOnUnmount?: boolean;
}

export interface UseSSEReturn {
  data: string;
  messages: SSEMessage[];
  isConnecting: boolean;
  isConnected: boolean;
  isError: boolean;
  error: AppError | null;
  state: SSEConnectionState;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  clear: () => void;
}

export function useSSE(
  url: string | null,
  options: UseSSEOptions = {}
): UseSSEReturn {
  const { enabled = true, reconnectOnMount = true, clearOnUnmount = true } = options;

  const [data, setData] = useState<string>('');
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [state, setState] = useState<SSEConnectionState>(SSEConnectionState.CLOSED);
  const [error, setError] = useState<AppError | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const clientRef = useRef<SSEClient | null>(null);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    // Create new client
    const client = new SSEClient({
      url,
      withCredentials: false,
      onOpen: () => {
        setState(SSEConnectionState.OPEN);
        setError(null);
      },
      onMessage: (message: SSEMessage) => {
        setMessages((prev) => [...prev, message]);

        // Append text data
        if (typeof message.data === 'string') {
          setData((prev) => prev + message.data);
        } else if (message.data?.content) {
          setData((prev) => prev + message.data.content);
        }

        // Handle done event
        if (message.event === 'done') {
          setState(SSEConnectionState.CLOSED);
        }
      },
      onError: (err) => {
        setError(err);
        setState(SSEConnectionState.ERROR);
      },
      onClose: () => {
        setState(SSEConnectionState.CLOSED);
      },
      onReconnect: (attempt) => {
        setReconnectAttempts(attempt);
        setState(SSEConnectionState.RECONNECTING);
      },
    });

    clientRef.current = client;
    client.connect();
  }, [url, enabled]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  const clear = useCallback(() => {
    setData('');
    setMessages([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (reconnectOnMount) {
      connect();
    }

    return () => {
      disconnect();
      if (clearOnUnmount) {
        clear();
      }
    };
  }, [connect, disconnect, clear, reconnectOnMount, clearOnUnmount]);

  return {
    data,
    messages,
    isConnecting: state === SSEConnectionState.CONNECTING,
    isConnected: state === SSEConnectionState.OPEN,
    isError: state === SSEConnectionState.ERROR,
    error,
    state,
    reconnectAttempts,
    connect,
    disconnect,
    clear,
  };
}

// ============================================
// Specialized Hook for RAG Streaming
// ============================================

export interface UseRAGStreamOptions {
  enabled?: boolean;
  onComplete?: (text: string) => void;
  onError?: (error: AppError) => void;
}

export function useRAGStream(
  query: string | null,
  options: UseRAGStreamOptions = {}
) {
  const { enabled = true, onComplete, onError: onErrorCallback } = options;

  const url = query
    ? `${process.env.NEXT_PUBLIC_AGENT_URL}/api/v2/rag/stream?q=${encodeURIComponent(query)}`
    : null;

  const {
    data,
    isConnecting,
    isConnected,
    isError,
    error,
    state,
    reconnectAttempts,
    disconnect,
    clear,
  } = useSSE(url, { enabled });

  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (state === SSEConnectionState.CLOSED && data && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.(data);
    }
  }, [state, data, onComplete]);

  useEffect(() => {
    if (error) {
      onErrorCallback?.(error);
    }
  }, [error, onErrorCallback]);

  useEffect(() => {
    return () => {
      hasCompletedRef.current = false;
    };
  }, [query]);

  return {
    text: data,
    isStreaming: isConnected,
    isConnecting,
    isError,
    error,
    reconnectAttempts,
    stop: disconnect,
    clear,
  };
}
