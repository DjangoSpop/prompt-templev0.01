import { useCallback, useEffect, useRef, useState } from 'react';
import { useRagStore } from '../store/rag';
import { useAuthStore } from '../store/user';
import { WebSocketClient } from '../lib/api/client';
import { getIndexStatus, optimizePrompt } from '../lib/api/rag';


interface UseRagAgentOptions {
  enableWebSocket?: boolean;
}

export function useRagAgent(options: UseRagAgentOptions = {}) {
  const {
    sessions,
    activeId,
    currentSession,
    isProcessing,
    wsConnected,
    createSession,
    setActiveSession,
    updateSession,
    acceptBest,
    setWsConnected,
  } = useRagStore();
  
  const { accessToken } = useAuthStore();
  const wsClient = useRef<WebSocketClient | null>(null);
  const [indexStatus, setIndexStatus] = useState<any>(null);
  
  const initWebSocket = useCallback(async () => {
    if (!options.enableWebSocket || !accessToken) return;
    
    wsClient.current = new WebSocketClient('/ws/agent/');
    
    wsClient.current.on('agent.start', (data) => {
      if (activeId) {
        updateSession(activeId, {
          status: 'processing',
          metadata: { ...currentSession?.metadata, ...data },
        });
      }
    });
    
    wsClient.current.on('agent.step', (data) => {
      console.log('Agent step:', data);
    });
    
    wsClient.current.on('agent.token', (data) => {
      if (activeId && data.content) {
        updateSession(activeId, {
          optimized: (currentSession?.optimized || '') + data.content,
        });
      }
    });
    
    wsClient.current.on('agent.citations', (data) => {
      if (activeId) {
        updateSession(activeId, {
          citations: data.citations || [],
        });
      }
    });
    
    wsClient.current.on('agent.done', (data) => {
      if (activeId) {
        updateSession(activeId, {
          status: 'completed',
          best: data.optimized,
          usage: data.usage,
        });
      }
    });
    
    try {
      await wsClient.current.connect(accessToken);
      setWsConnected(true);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsConnected(false);
    }
  }, [options.enableWebSocket, accessToken, activeId, currentSession, updateSession, setWsConnected]);
  
  const optimize = useCallback(async (
    original: string,
    mode: 'fast' | 'deep',
    context?: any,
    budget?: any
  ) => {
    const sessionId = createSession(mode, original);
    
    updateSession(sessionId, {
      status: 'processing',
    });
    
    try {
      const response = await optimizePrompt(
        {
          session_id: sessionId,
          original,
          mode,
          context,
          budget,
        },
        accessToken
      );
      
      updateSession(sessionId, {
        optimized: response.optimized,
        best: response.optimized,
        citations: response.citations || [],
        diff_summary: response.diff_summary,
        usage: response.usage,
        status: 'completed',
        metadata: {
          improvements: response.improvements,
          context,
          budget,
        },
      });
      
      return response;
    } catch (error) {
      updateSession(sessionId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Optimization failed',
      });
      throw error;
    }
  }, [createSession, updateSession, accessToken]);
  
  const fetchIndexStatus = useCallback(async () => {
    try {
      const status = await getIndexStatus(accessToken);
      setIndexStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to fetch index status:', error);
      return null;
    }
  }, [accessToken]);
  
  useEffect(() => {
    if (options.enableWebSocket) {
      initWebSocket();
    }
    
    return () => {
      wsClient.current?.disconnect();
    };
  }, [initWebSocket, options.enableWebSocket]);
  
  useEffect(() => {
    fetchIndexStatus();
  }, [fetchIndexStatus]);
  
  return {
    sessions,
    activeId,
    currentSession,
    isProcessing,
    wsConnected,
    indexStatus,
    optimize,
    acceptBest,
    setActiveSession,
    fetchIndexStatus,
  };
}