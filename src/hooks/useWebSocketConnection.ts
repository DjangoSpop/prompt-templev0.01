import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WebSocketConfig {
  url: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  latency: number | null;
  reconnectAttempts: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface WebSocketActions {
  sendMessage: (message: WebSocketMessage) => boolean;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocketConnection(
  config: WebSocketConfig,
  onMessage?: (data: WebSocketMessage) => void
): WebSocketState & WebSocketActions {
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    latency: null,
    reconnectAttempts: 0,
  });

  const configRef = useRef(config);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const onMessageRef = useRef(onMessage);

  // Update refs when dependencies change
  useEffect(() => {
    configRef.current = config;
    onMessageRef.current = onMessage;
  }, [config, onMessage]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setState(prev => {
      if (prev.socket) {
        prev.socket.close(1000, 'Manual disconnect');
      }
      return {
        ...prev,
        socket: null,
        isConnected: false,
        latency: null,
      };
    });
  }, [cleanup]);

  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    if (state.socket?.readyState === WebSocket.OPEN) {
      try {
        state.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, [state.socket]);

  const connect = useCallback(() => {
    const { url, maxReconnectAttempts = 5, reconnectDelay = 1000, heartbeatInterval = 15000 } = configRef.current;

    if (state.socket?.readyState === WebSocket.CONNECTING || state.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('🔌 Attempting WebSocket connection to:', url);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        reconnectAttemptsRef.current = 0;
        setState(prev => ({
          ...prev,
          socket: ws,
          isConnected: true,
          reconnectAttempts: 0,
        }));
        
        toast.success('Connected to PromptCraft AI');

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const pingTime = Date.now();
            ws.send(JSON.stringify({ 
              type: 'ping', 
              timestamp: new Date().toISOString(),
              ping_time: pingTime
            }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong for latency calculation
          if (data.type === 'pong' && data.ping_time) {
            const latency = Date.now() - data.ping_time;
            setState(prev => ({ ...prev, latency }));
          }
          
          // Call the message handler
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        
        setState(prev => ({
          ...prev,
          socket: null,
          isConnected: false,
          latency: null,
        }));

        cleanup();

        // Only show disconnect message if it wasn't a normal closure and first attempt
        if (event.code !== 1000 && state.reconnectAttempts === 0) {
          toast.error('Disconnected from PromptCraft');
        }

        // Attempt reconnection for unexpected disconnects
        if (event.code !== 1000 && state.reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`🔄 Scheduling reconnection attempt ${state.reconnectAttempts + 1} in ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            // keep a ref in sync so closures see the latest value
            reconnectAttemptsRef.current = (reconnectAttemptsRef.current || 0) + 1;
            setState(prev => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));
            connect();
          }, delay);
        } else if (state.reconnectAttempts >= maxReconnectAttempts) {
          toast.error('Failed to connect to PromptCraft AI. Please check your backend server.');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        
        // If connection fails immediately, try to reconnect
        if (ws.readyState === WebSocket.CONNECTING) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
            console.log(`🔄 Connection failed, scheduling reconnection attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current = (reconnectAttemptsRef.current || 0) + 1;
              setState(prev => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));
              toast.loading(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
              connect();
            }, delay);
          } else {
            toast.error('Failed to connect to PromptCraft AI. Please check your backend server.');
          }
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      toast.error('Failed to create WebSocket connection');
      
      // Schedule reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current = (reconnectAttemptsRef.current || 0) + 1;
          setState(prev => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));
          connect();
        }, delay);
      }
    }
  }, [state.socket, state.reconnectAttempts, cleanup]);

  const reconnect = useCallback(() => {
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    disconnect();
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Reconnect when the URL changes (for example token appended after login)
  useEffect(() => {
    // reset attempts when URL changes
    reconnectAttemptsRef.current = 0;
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    connect();

    return () => {
      cleanup();
      setState(prev => {
        if (prev.socket?.readyState === WebSocket.OPEN) {
          prev.socket.close(1000, 'Component unmounting');
        }
        return {
          ...prev,
          socket: null,
          isConnected: false,
          latency: null,
        };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.url]); // reconnect when URL changes

  return {
    ...state,
    sendMessage,
    disconnect,
    reconnect,
  };
}
