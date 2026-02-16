import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Get WebSocket URL from environment or use default
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';

// Message types for WebSocket communication
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ChatMessage extends WebSocketMessage {
  type: 'chat_message';
  message_id: string;
  content: string;
  timestamp: string;
}

export interface OptimizePrompt extends WebSocketMessage {
  type: 'optimize_prompt';
  prompt: string;
  context?: any;
  optimization_type?: string;
}

export interface SlashCommand extends WebSocketMessage {
  type: 'slash_command';
  command: 'intent' | 'optimize' | 'rewrite' | 'summarize' | 'code';
  content: string;
}

interface UseWebSocketProps {
  sessionId: string;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  autoReconnect?: boolean;
  token?: string;
}

export const useWebSocket = ({
  sessionId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  token
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) return;
    
    try {
      const url = token 
        ? `${WS_URL}/ws/chat/${sessionId}/?token=${token}`
        : `${WS_URL}/ws/chat/${sessionId}/`;
      
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
        onConnect?.();
        
        // Start ping interval for latency measurement
        if (pingInterval.current) clearInterval(pingInterval.current);
        pingInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const timestamp = Date.now();
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }));
          }
        }, 30000); // ping every 30 seconds
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Handle pong messages for latency
        if (data.type === 'pong' && data.latency_ms) {
          setLatency(data.latency_ms);
        }
        
        onMessage?.(data);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        onDisconnect?.();
        
        // Clear ping interval
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }
        
        // Attempt reconnection
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          setTimeout(connect, delay);
        }
      };
      
      ws.onerror = (error) => {
        onError?.(error);
      };
      
      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      onError?.(error);
      return null;
    }
  }, [sessionId, token, onMessage, onConnect, onDisconnect, onError, autoReconnect, socket]);

  // Send message helper
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to server. Attempting to reconnect...');
      connect();
      return false;
    }
    
    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [socket, connect]);

  // Send chat message helper
  const sendChatMessage = useCallback((content: string) => {
    const messageId = crypto.randomUUID();
    return sendMessage({
      type: 'chat_message',
      message_id: messageId,
      content,
      timestamp: new Date().toISOString()
    }) ? messageId : null;
  }, [sendMessage]);

  // Execute slash command
  const sendSlashCommand = useCallback((command: string, content: string) => {
    return sendMessage({
      type: 'slash_command',
      command: command as any,
      content,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  // Connect on component mount
  useEffect(() => {
    const ws = connect();
    
    // Cleanup function
    return () => {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    sendChatMessage,
    sendSlashCommand,
    latency,
    lastMessage,
    connect,
    disconnect: useCallback(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }, [socket])
  };
};
