'use client';

import { useState, useCallback, useRef } from 'react';
import { getAccessToken } from '@/lib/auth';

export interface SSECompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown; // Allow additional parameters
}

export interface SSECompletionState {
  text: string;
  isStreaming: boolean;
  error: string | null;
  trace_id?: string;
  token_count?: number;
  elapsed_time?: number;
}

export interface UseSSECompletionReturn extends SSECompletionState {
  start: (request: SSECompletionRequest) => Promise<void>;
  abort: () => void;
  reset: () => void;
}

/**
 * Hook for SSE-based chat completions using our backend SSE proxy.
 * Streams tokens from POST /api/v2/chat/completions/ with text/event-stream.
 */
export function useSSECompletion(): UseSSECompletionReturn {
  const [state, setState] = useState<SSECompletionState>({
    text: '',
    isStreaming: false,
    error: null,
  });

  const abortController = useRef<AbortController | null>(null);
  const startTime = useRef<number>(0);

  const reset = useCallback(() => {
    setState({
      text: '',
      isStreaming: false,
      error: null,
      trace_id: undefined,
      token_count: undefined,
      elapsed_time: undefined,
    });
  }, []);

  const abort = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setState(prev => ({ 
      ...prev, 
      isStreaming: false,
      elapsed_time: startTime.current ? Date.now() - startTime.current : undefined,
    }));
  }, []);

  const start = useCallback(async (request: SSECompletionRequest) => {
    // Abort any ongoing request
    abort();
    
    // Reset state
    reset();
    
    // Create new abort controller
    abortController.current = new AbortController();
    startTime.current = Date.now();
    
    setState(prev => ({ ...prev, isStreaming: true, error: null }));

    try {
      // Get auth token
      const token = getAccessToken();
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json', // Accept both formats
        'Cache-Control': 'no-cache',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Ensure stream is enabled
      const payload = {
        ...request,
        stream: true,
      };

      // Make request to Django API directly
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
      const url = `${apiBaseUrl}/api/v2/chat/completions/`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortController.current.signal,
      });

      // Check for 2xx success (not just 200)
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Fallback to status text if JSON parsing fails
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Ensure we have a readable stream
      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let currentTraceId: string | undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE frames (separated by \n\n)
          const frames = buffer.split('\n\n');
          buffer = frames.pop() || ''; // Keep incomplete frame in buffer
          
          for (const frame of frames) {
            if (!frame.trim()) continue;
            
            const lines = frame.split('\n');
            let eventType = 'message';
            let eventData = '';
            
            // Parse SSE frame
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                eventData = line.slice(5).trim();
              }
            }
            
            // Handle different event types
            if (eventType === 'meta' && eventData) {
              try {
                const metaData = JSON.parse(eventData);
                if (metaData.trace_id) {
                  currentTraceId = metaData.trace_id;
                }
              } catch {
                console.warn('Failed to parse meta event');
              }
            } else if (eventType === 'message' || eventType === 'data') {
              if (eventData === '[DONE]') {
                // Stream completion signal
                setState(prev => ({ 
                  ...prev, 
                  isStreaming: false,
                  elapsed_time: Date.now() - startTime.current,
                  trace_id: currentTraceId,
                }));
                return;
              }
              
              // Try to parse JSON delta
              try {
                const delta = JSON.parse(eventData);
                const content = delta.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  accumulatedText += content;
                  setState(prev => ({ 
                    ...prev, 
                    text: accumulatedText,
                    trace_id: currentTraceId,
                  }));
                }
              } catch {
                // If not JSON, treat as plain text
                if (eventData && eventData !== '[DONE]') {
                  accumulatedText += eventData;
                  setState(prev => ({ 
                    ...prev, 
                    text: accumulatedText,
                    trace_id: currentTraceId,
                  }));
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Final state update
      setState(prev => ({ 
        ...prev, 
        isStreaming: false,
        elapsed_time: Date.now() - startTime.current,
        trace_id: currentTraceId,
      }));
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (err.name === 'AbortError') {
        // User cancelled - don't set error state
        setState(prev => ({ 
          ...prev, 
          isStreaming: false,
          elapsed_time: startTime.current ? Date.now() - startTime.current : undefined,
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isStreaming: false, 
          error: err.message || 'Failed to start completion',
          elapsed_time: startTime.current ? Date.now() - startTime.current : undefined,
        }));
      }
    } finally {
      abortController.current = null;
    }
  }, [abort, reset]);

  return {
    ...state,
    start,
    abort,
    reset,
  };
}
