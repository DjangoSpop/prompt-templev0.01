import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../../providers/AuthProvider';
import type { WsOutbound, WsInbound, LatencyMetrics } from '../../types/chat';

interface UseWebSocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketReturn {
  send: (message: WsOutbound) => void;
  status: {
    connected: boolean;
    reconnecting: boolean;
    offline: boolean;
    reconnectAttempts: number;
  };
  latency: LatencyMetrics;
  lastError?: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    maxReconnectAttempts = 5,
    reconnectInterval = 1000,
    heartbeatInterval = 20000,
  } = options;
  
  const { user, isAuthenticated } = useAuth();
  const { 
    setWsStatus, 
    updateMessage, 
    appendToMessage, 
    setStreaming
  } = useChatStore();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WsOutbound[]>([]);
  const sendTimestampRef = useRef<Record<string, number>>({});
  
  const [latency, setLatency] = useState<LatencyMetrics>({
    p50: 0,
    p95: 0,
    lastMeasured: 0,
  });
  const [lastError, setLastError] = useState<string>();
  
  const latencyMeasurements = useRef<number[]>([]);
  
  const calculateLatency = useCallback((sendTime: number) => {
    const latencyMs = Date.now() - sendTime;
    latencyMeasurements.current.push(latencyMs);
    
    // Keep only last 100 measurements
    if (latencyMeasurements.current.length > 100) {
      latencyMeasurements.current.shift();
    }
    
    // Calculate percentiles
    const sorted = [...latencyMeasurements.current].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    
    setLatency({
      p50: sorted[p50Index] || 0,
      p95: sorted[p95Index] || 0,
      current: latencyMs,
      lastMeasured: Date.now(),
    });
    
    return latencyMs;
  }, []);
  
  const getBackoffDelay = useCallback((attempt: number) => {
    const baseDelay = reconnectInterval;
    const maxDelay = 8000; // 8 seconds max
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }, [reconnectInterval]);
  
  const scheduleHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    
    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingMessage: WsOutbound = {
          type: 'ping',
          ts: Date.now(),
        };
        wsRef.current.send(JSON.stringify(pingMessage));
        scheduleHeartbeat();
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);
  
  const processMessage = useCallback((data: WsInbound) => {
    switch (data.type) {
      case 'token':
        if (data.messageId && data.content) {
          appendToMessage(data.messageId, data.content);
        }
        break;
        
      case 'final':
        if (data.messageId) {
          updateMessage(data.messageId, { partial: false });
          setStreaming(false);
        }
        break;
        
      case 'error':
        if (data.messageId) {
          updateMessage(data.messageId, { 
            error: data.content || 'An error occurred',
            partial: false 
          });
        }
        setStreaming(false);
        setLastError(data.content);
        break;
        
      case 'metrics':
        if (data.metrics) {
          setLatency(prev => ({
            ...prev,
            p50: data.metrics?.p50 || prev.p50,
            p95: data.metrics?.p95 || prev.p95,
          }));
        }
        break;
        
      case 'pong':
        if (data.ts && sendTimestampRef.current.ping) {
          calculateLatency(sendTimestampRef.current.ping);
          delete sendTimestampRef.current.ping;
        }
        break;
        
      case 'status':
      case 'session.created':
        // Handle status updates from server
        break;
    }
  }, [appendToMessage, updateMessage, setStreaming, calculateLatency, setLatency]);
  
  const flushMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      const messages = [...messageQueueRef.current];
      messageQueueRef.current = [];
      
      messages.forEach(message => {
        wsRef.current?.send(JSON.stringify(message));
      });
    }
  }, []);
  
  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      console.log('Cannot connect: not authenticated');
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      let wsUrl = WS_URL;
      
      // Add token via Sec-WebSocket-Protocol or query param fallback
      if (token) {
        try {
          wsRef.current = new WebSocket(wsUrl, [`Bearer ${token}`]);
        } catch {
          // Fallback to query parameter if protocol method fails
          wsUrl += `?token=${encodeURIComponent(token)}`;
          wsRef.current = new WebSocket(wsUrl);
        }
      } else {
        wsRef.current = new WebSocket(wsUrl);
      }
      
      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setWsStatus({ 
          connected: true, 
          reconnecting: false, 
          offline: false,
          reconnectAttempts: 0,
          lastConnected: Date.now() 
        });
        setLastError(undefined);
        
        // Start heartbeat
        scheduleHeartbeat();
        
        // Flush queued messages
        flushMessageQueue();
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          let data: WsInbound;
          
          // Handle both JSON and binary messages
          if (event.data instanceof ArrayBuffer) {
            const text = new TextDecoder().decode(event.data);
            data = JSON.parse(text);
          } else if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
          } else {
            console.warn('Unknown message format:', typeof event.data);
            return;
          }
          
          processMessage(data);
        } catch (error) {
          console.error('Failed to process WebSocket message:', error, event.data);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        const wsStatus = useChatStore.getState().wsStatus;
        
        if (wsStatus.reconnectAttempts < maxReconnectAttempts) {
          // Attempt reconnection
          setWsStatus({ 
            connected: false, 
            reconnecting: true,
            reconnectAttempts: wsStatus.reconnectAttempts + 1 
          });
          
          const delay = getBackoffDelay(wsStatus.reconnectAttempts);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          // Max attempts reached
          setWsStatus({ 
            connected: false, 
            reconnecting: false, 
            offline: true 
          });
          setLastError('Connection failed after multiple attempts');
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLastError('WebSocket connection error');
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setLastError('Failed to establish connection');
    }
  }, [isAuthenticated, user, setWsStatus, scheduleHeartbeat, flushMessageQueue, 
      maxReconnectAttempts, getBackoffDelay, processMessage]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setWsStatus({ 
      connected: false, 
      reconnecting: false, 
      offline: false, 
      reconnectAttempts: 0 
    });
  }, [setWsStatus]);
  
  const send = useCallback((message: WsOutbound) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (message.type === 'ping') {
        sendTimestampRef.current.ping = Date.now();
      } else if (message.type === 'chat.send') {
        sendTimestampRef.current[message.content || 'message'] = Date.now();
      }
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      messageQueueRef.current.push(message);
      
      // Try to reconnect if not already doing so
      const wsStatus = useChatStore.getState().wsStatus;
      if (!wsStatus.connected && !wsStatus.reconnecting && wsStatus.reconnectAttempts < maxReconnectAttempts) {
        connect();
      }
    }
  }, [connect, maxReconnectAttempts]);
  
  // Effect to manage connection lifecycle
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);
  
  // Effect to handle visibility changes (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        const wsStatus = useChatStore.getState().wsStatus;
        if (!wsStatus.connected && !wsStatus.reconnecting) {
          connect();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, connect]);
  
  const wsStatus = useChatStore(state => state.wsStatus);
  
  return {
    send,
    status: wsStatus,
    latency,
    lastError,
  };
};
