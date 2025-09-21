import { useState, useCallback, useRef, useEffect } from 'react';
import { NativeWebSocketChatService } from '@/lib/services/native-websocket-chat';

export interface StreamingMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming: boolean;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    templateSuggestions?: string[];
    optimization?: OptimizationResult;
  };
}

export interface OptimizationResult {
  original_prompt: string;
  optimized_prompt: string;
  improvements: string[];
  confidence: number;
  processing_time_ms: number;
}

export interface ChatState {
  messages: StreamingMessage[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  currentStreamingMessageId: string | null;
  templateSuggestion?: TemplateSuggestion | null;
  lastCreatedTemplate?: CreatedTemplate | null;
  lastActive?: Date;
  latency?: number | null;
}

export interface TemplateSuggestion {
  title: string;
  description: string;
  category: string;
  confidence: number;
  reasoning?: string;
}

export interface CreatedTemplate {
  id: string;
  title: string;
  category: string;
  fields_count: number;
}

export interface ConversationMetrics {
  totalMessages: number;
  totalTokens: number;
  averageResponseTime: number;
  lastActive: Date;
}

interface WebSocketMessageData {
  type: string;
  message_id?: string;
  content?: string;
  token?: string;
  final_content?: string;
  token_count?: number;
  template_suggestions?: string[];
  model?: string;
  timestamp?: string;
  processing_time_ms?: number;
  role?: string;
  message?: string;
  original_message_id?: string;
  original_prompt?: string;
  optimized_prompt?: string;
  improvements?: string[];
  confidence?: number;
  session_id?: string;
  suggestion?: TemplateSuggestion;
  template?: CreatedTemplate;
  latency?: number;
  [key: string]: unknown;
}

interface UseNativeChatOptions {
  userId: string;
  sessionId: string;
  wsUrl?: string;
  maxReconnectAttempts?: number;
  autoSave?: boolean;
  enableOptimization?: boolean;
}

export function useNativeStreamingChat(options: UseNativeChatOptions) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    error: null,
    currentStreamingMessageId: null,
    templateSuggestion: null,
    lastCreatedTemplate: null,
    lastActive: new Date(),
    latency: null,
  });

  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalMessages: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    lastActive: new Date(),
  });

  const streamingBufferRef = useRef<{ [messageId: string]: string }>({});
  const responseStartTimeRef = useRef<{ [messageId: string]: number }>({});
  const wsServiceRef = useRef<NativeWebSocketChatService | null>(null);

  // Initialize WebSocket service
  useEffect(() => {
    if (!wsServiceRef.current) {
      wsServiceRef.current = new NativeWebSocketChatService({
        apiUrl: options.wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
        sessionId: options.sessionId,
        enableOptimization: options.enableOptimization ?? true,
        maxRetries: options.maxReconnectAttempts || 5,
      });
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.destroy();
        wsServiceRef.current = null;
      }
    };
  }, [options.sessionId, options.wsUrl, options.maxReconnectAttempts, options.enableOptimization]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data?: unknown) => {
    const messageData = data as WebSocketMessageData;
    setChatState(prev => ({ ...prev, lastActive: new Date() }));

    switch (messageData.type) {
      case 'connection_ack':
        console.log('🎉 Native WebSocket connection acknowledged by server');
        setChatState(prev => ({ ...prev, isConnected: true, error: null }));
        break;

      case 'typing_start':
        setChatState(prev => ({ ...prev, isTyping: true }));
        break;

      case 'typing_stop':
        setChatState(prev => ({ ...prev, isTyping: false }));
        break;

      case 'stream_start':
        // Initialize streaming message
        const messageId = messageData.message_id || crypto.randomUUID();
        const newMessage: StreamingMessage = {
          id: messageId,
          role: 'assistant',
          content: '',
          isStreaming: true,
          timestamp: new Date(),
          metadata: {
            model: messageData.model,
          },
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          currentStreamingMessageId: messageId,
          isTyping: false,
        }));

        streamingBufferRef.current[messageId] = '';
        responseStartTimeRef.current[messageId] = Date.now();
        break;

      case 'stream_token':
        // Append token to streaming message
        const tokenMessageId = messageData.message_id;
        if (tokenMessageId && streamingBufferRef.current[tokenMessageId] !== undefined) {
          streamingBufferRef.current[tokenMessageId] += messageData.token || '';
          
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === tokenMessageId
                ? { ...msg, content: streamingBufferRef.current[tokenMessageId] }
                : msg
            ),
          }));
        }
        break;

      case 'stream_complete':
        // Finalize streaming message
        const completedMessageId = messageData.message_id;
        if (!completedMessageId) break;
        
        const responseTime = Date.now() - (responseStartTimeRef.current[completedMessageId] || 0);
        
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === completedMessageId
              ? {
                  ...msg,
                  isStreaming: false,
                  content: messageData.final_content || streamingBufferRef.current[completedMessageId] || '',
                  metadata: {
                    ...msg.metadata,
                    tokens: messageData.token_count,
                    processingTime: responseTime,
                    templateSuggestions: messageData.template_suggestions,
                  },
                }
              : msg
          ),
          currentStreamingMessageId: null,
        }));

        // Update metrics
        setMetrics(prev => ({
          totalMessages: prev.totalMessages + 1,
          totalTokens: prev.totalTokens + (messageData.token_count || 0),
          averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
          lastActive: new Date(),
        }));

        // Cleanup
        delete streamingBufferRef.current[completedMessageId];
        delete responseStartTimeRef.current[completedMessageId];
        break;

      case 'message':
      case 'message_response':
        // Non-streaming message (fallback)
        const directMessage: StreamingMessage = {
          id: messageData.message_id || crypto.randomUUID(),
          role: messageData.role === 'assistant' ? 'assistant' : 'assistant',
          content: messageData.content || '',
          isStreaming: false,
          timestamp: new Date(messageData.timestamp || Date.now()),
          metadata: {
            processingTime: messageData.processing_time_ms,
            templateSuggestions: messageData.template_suggestions,
            tokens: messageData.token_count,
          },
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, directMessage],
          isTyping: false,
        }));
        break;

      case 'optimization_result':
        // Handle optimization results
        if (messageData.original_message_id) {
          const optimizationData: OptimizationResult = {
            original_prompt: messageData.original_prompt || '',
            optimized_prompt: messageData.optimized_prompt || '',
            improvements: messageData.improvements || [],
            confidence: messageData.confidence || 0,
            processing_time_ms: messageData.processing_time_ms || 0,
          };

          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === messageData.original_message_id
                ? {
                    ...msg,
                    metadata: {
                      ...msg.metadata,
                      optimization: optimizationData,
                    },
                  }
                : msg
            ),
          }));
        }
        break;

      case 'template_suggestion':
        setChatState(prev => ({
          ...prev,
          templateSuggestion: messageData.suggestion as TemplateSuggestion,
        }));
        break;

      case 'template_created':
        setChatState(prev => ({
          ...prev,
          lastCreatedTemplate: messageData.template as CreatedTemplate,
        }));
        break;

      case 'error':
        const errorMessage = (messageData.message as string) || 'An error occurred';
        console.error('🚨 WebSocket error:', errorMessage);
        setChatState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isTyping: false,
          currentStreamingMessageId: null,
        }));
        break;

      default:
        console.log('📦 Unknown message type:', messageData.type, messageData);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!wsServiceRef.current) return;

    const service = wsServiceRef.current;

    // Connection events
    service.on('connected', () => {
      setChatState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    service.on('disconnected', () => {
      setChatState(prev => ({ ...prev, isConnected: false }));
    });

    service.on('error', (error) => {
      console.error('WebSocket error:', error);
      setChatState(prev => ({ 
        ...prev, 
        error: 'Connection error occurred',
        isConnected: false 
      }));
    });

    service.on('latency', (data?: unknown) => {
      const latencyData = data as { latency: number };
      setChatState(prev => ({ ...prev, latency: latencyData.latency }));
    });

    // Message events
    service.on('messageResponse', handleWebSocketMessage);
    service.on('optimizationResult', handleWebSocketMessage);
    service.on('typing_start', handleWebSocketMessage);
    service.on('typing_stop', handleWebSocketMessage);

    return () => {
      service.off('connected', () => {});
      service.off('disconnected', () => {});
      service.off('error', () => {});
      service.off('latency', () => {});
      service.off('messageResponse', handleWebSocketMessage);
      service.off('optimizationResult', handleWebSocketMessage);
      service.off('typing_start', handleWebSocketMessage);
      service.off('typing_stop', handleWebSocketMessage);
    };
  }, [handleWebSocketMessage]);

  // Connect on mount
  useEffect(() => {
    if (wsServiceRef.current && !wsServiceRef.current.isConnected()) {
      wsServiceRef.current.connect().catch(error => {
        console.error('Failed to connect WebSocket:', error);
        setChatState(prev => ({ 
          ...prev, 
          error: 'Failed to connect to chat service',
          isConnected: false 
        }));
      });
    }
  }, []);

  // Send message function
  const sendMessage = useCallback(async (
    content: string,
    options: {
      optimize?: boolean;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      context?: string[];
    } = {}
  ) => {
    if (!wsServiceRef.current?.isConnected()) {
      console.error('Cannot send message: WebSocket not connected');
      setChatState(prev => ({ 
        ...prev, 
        error: 'Not connected to chat service' 
      }));
      return;
    }

    // Add user message to chat
    const userMessage: StreamingMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      isStreaming: false,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      error: null,
    }));

    // Send message via WebSocket
    try {
      await wsServiceRef.current.sendMessage(content, options);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({ 
        ...prev, 
        error: 'Failed to send message' 
      }));
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsServiceRef.current?.isConnected()) {
      wsServiceRef.current.sendTyping(isTyping);
    }
  }, []);

  // Optimize prompt
  const optimizePrompt = useCallback(async (prompt: string) => {
    if (!wsServiceRef.current?.isConnected()) {
      console.error('Cannot optimize prompt: WebSocket not connected');
      return;
    }

    try {
      await wsServiceRef.current.optimizePrompt(prompt);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      setChatState(prev => ({ 
        ...prev, 
        error: 'Failed to optimize prompt' 
      }));
    }
  }, []);

  // Get conversation history
  const getHistory = useCallback(async (limit = 50) => {
    if (!wsServiceRef.current?.isConnected()) {
      console.error('Cannot get history: WebSocket not connected');
      return;
    }

    try {
      await wsServiceRef.current.getHistory(limit);
    } catch (error) {
      console.error('Error getting history:', error);
      setChatState(prev => ({ 
        ...prev, 
        error: 'Failed to load conversation history' 
      }));
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  // Reconnect
  const reconnect = useCallback(async () => {
    if (wsServiceRef.current) {
      try {
        await wsServiceRef.current.reconnect();
      } catch (error) {
        console.error('Error reconnecting:', error);
        setChatState(prev => ({ 
          ...prev, 
          error: 'Failed to reconnect' 
        }));
      }
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      currentStreamingMessageId: null,
      templateSuggestion: null,
      lastCreatedTemplate: null,
    }));
    
    // Clear streaming buffers
    streamingBufferRef.current = {};
    responseStartTimeRef.current = {};
  }, []);

  return {
    // State
    ...chatState,
    metrics,
    
    // Actions
    sendMessage,
    sendTyping,
    optimizePrompt,
    getHistory,
    clearError,
    reconnect,
    clearMessages,
    
    // Computed values
    isReady: chatState.isConnected && !chatState.error,
    connectionInfo: wsServiceRef.current?.getConnectionInfo() || null,
  };
}
