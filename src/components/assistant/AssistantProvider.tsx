'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AssistantChannelMap, StreamMessage } from '@/types/assistant';

interface AssistantContextValue {
  sessionId: string;
  channels: AssistantChannelMap;
  openChannel: (assistantId: string) => Promise<WebSocket>;
  closeChannel: (assistantId: string) => void;
  sendMessage: (assistantId: string, payload: any) => boolean;
  isConnected: (assistantId: string) => boolean;
}

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return context;
}

interface AssistantProviderProps {
  children: React.ReactNode;
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const queryClient = useQueryClient();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [channels, setChannels] = useState<AssistantChannelMap>({});

  const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || 'ws://127.0.0.1:8000';

  const openChannel = useCallback(async (assistantId: string): Promise<WebSocket> => {
    // Close existing channel if any
    if (channels[assistantId]) {
      channels[assistantId].close();
    }

    const wsUrl = `${WS_BASE}/ws/assistant/${assistantId}/${sessionId}/`;
    const socket = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      socket.addEventListener('open', () => {
        console.log(`WebSocket connected for assistant ${assistantId}`);
        setChannels(prev => ({ ...prev, [assistantId]: socket }));
        resolve(socket);
      });

      socket.addEventListener('error', (error) => {
        console.error(`WebSocket error for assistant ${assistantId}:`, error);
        reject(error);
      });

      socket.addEventListener('message', (event) => {
        try {
          const message: StreamMessage = JSON.parse(event.data);
          handleStreamMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      socket.addEventListener('close', (event) => {
        console.log(`WebSocket closed for assistant ${assistantId}:`, event.code, event.reason);
        setChannels(prev => {
          const newChannels = { ...prev };
          delete newChannels[assistantId];
          return newChannels;
        });
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }, [sessionId, channels, WS_BASE]);

  const closeChannel = useCallback((assistantId: string) => {
    const socket = channels[assistantId];
    if (socket) {
      socket.close();
      setChannels(prev => {
        const newChannels = { ...prev };
        delete newChannels[assistantId];
        return newChannels;
      });
    }
  }, [channels]);

  const sendMessage = useCallback((assistantId: string, payload: any): boolean => {
    const socket = channels[assistantId];
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, [channels]);

  const isConnected = useCallback((assistantId: string): boolean => {
    const socket = channels[assistantId];
    return socket ? socket.readyState === WebSocket.OPEN : false;
  }, [channels]);

  const handleStreamMessage = useCallback((message: StreamMessage) => {
    switch (message.type) {
      case 'assistant.message':
        // Invalidate thread query to refresh messages
        if (message.data.thread_id) {
          queryClient.invalidateQueries({
            queryKey: ['thread', message.data.thread_id]
          });
        }
        break;

      case 'assistant.error':
        console.error('Assistant error:', message.data.error);
        break;

      case 'assistant.thinking':
        // Handle typing indicator
        break;

      case 'assistant.done':
        // Message complete
        if (message.data.thread_id) {
          queryClient.invalidateQueries({
            queryKey: ['thread', message.data.thread_id]
          });
        }
        break;
    }
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(channels).forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      });
    };
  }, [channels]);

  // Handle page visibility change
  useEffect(() => {
    let visibilityTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start timer to close connections after 5 minutes
        visibilityTimer = setTimeout(() => {
          Object.entries(channels).forEach(([assistantId, socket]) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.close();
            }
          });
        }, 5 * 60 * 1000); // 5 minutes
      } else {
        // Page is visible again, clear timer
        if (visibilityTimer) {
          clearTimeout(visibilityTimer);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
      }
    };
  }, [channels]);

  const value: AssistantContextValue = {
    sessionId,
    channels,
    openChannel,
    closeChannel,
    sendMessage,
    isConnected,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}