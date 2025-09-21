import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chat';
import { useAuthStore } from '../store/user';
import { streamSSE } from '../lib/api/client';


export function useChat() {
  const {
    messages,
    currentStreamingMessage,
    isStreaming,
    health,
    addMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    clearMessages,
    setHealth,
    setError,
  } = useChatStore();
  
  const { accessToken } = useAuthStore();
  const healthCheckInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;
    
    addMessage({
      role: 'user',
      content,
    });
    
    setError(undefined);
    
    try {
      const generator = streamSSE(
        '/api/v2/chat/completions/',
        {
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
          stream: true,
        },
        accessToken
      );
      
      for await (const event of generator) {
        if (event.type === 'stream_start') {
          updateStreamingMessage('');
        } else if (event.type === 'token') {
          updateStreamingMessage(event.content || '');
        } else if (event.type === 'stream_complete') {
          finalizeStreamingMessage();
        } else if (event.type === 'error') {
          setError(event.message || 'Stream error');
          finalizeStreamingMessage();
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
      finalizeStreamingMessage();
    }
  }, [messages, isStreaming, accessToken, addMessage, updateStreamingMessage, finalizeStreamingMessage, setError]);
  
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/v2/chat/health/', {
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });
      
      const data = await response.json();
      
      setHealth({
        status: data.status || 'healthy',
        message: data.message || 'Service is operational',
        lastChecked: Date.now(),
      });
    } catch (error) {
      setHealth({
        status: 'error',
        message: 'Failed to check service health',
        lastChecked: Date.now(),
      });
    }
  }, [accessToken, setHealth]);
  
  useEffect(() => {
    checkHealth();
    
    healthCheckInterval.current = setInterval(checkHealth, 30000);
    
    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, [checkHealth]);
  
  return {
    messages,
    currentStreamingMessage,
    isStreaming,
    health,
    sendMessage,
    clearMessages,
    checkHealth,
  };
}