import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useWebSocketConnection } from './useWebSocketConnection';
import { getAccessToken } from '@/lib/auth';

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
  [key: string]: unknown;
}

interface UseChatOptions {
  userId: string;
  sessionId: string;
  wsUrl?: string;
  maxReconnectAttempts?: number;
  autoSave?: boolean;
}

export function useStreamingChat(options: UseChatOptions) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    error: null,
    currentStreamingMessageId: null,
    templateSuggestion: null,
    lastCreatedTemplate: null,
    lastActive: new Date(),
  });

  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalMessages: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    lastActive: new Date(),
  });

  const streamingBufferRef = useRef<{ [messageId: string]: string }>({});
  const responseStartTimeRef = useRef<{ [messageId: string]: number }>({});

  // Token management
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Try auth service first
      const authToken = getAccessToken();
      if (authToken) return authToken;
      
      // Fallback to localStorage
      const stored = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      if (stored) return stored;
      
      // Generate development token if none exists
      const devToken = `dev_token_${crypto.randomUUID()}`;
      localStorage.setItem('auth_token', devToken);
      console.log('🔑 Generated development auth token:', devToken);
      return devToken;
    }
    return null;
  }, []);

  // WebSocket configuration
  const wsConfig = useMemo(() => {
    const base = options.wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';
    const token = getToken();
    return {
      url: token
        ? `${base}/ws/chat/${options.sessionId}/?token=${encodeURIComponent(token)}`
        : `${base}/ws/chat/${options.sessionId}/`,
      maxReconnectAttempts: options.maxReconnectAttempts || 5,
      reconnectDelay: 1000,
      heartbeatInterval: 15000,
    };
  }, [options.sessionId, options.wsUrl, options.maxReconnectAttempts, getToken]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: WebSocketMessageData) => {
    setChatState(prev => ({ ...prev, lastActive: new Date() }));

    switch (data.type) {
      case 'connection_ack':
        console.log('🎉 WebSocket connection acknowledged by server');
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
        const messageId = data.message_id || crypto.randomUUID();
        const newMessage: StreamingMessage = {
          id: messageId,
          role: 'assistant',
          content: '',
          isStreaming: true,
          timestamp: new Date(),
          metadata: {
            model: data.model,
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
        const tokenMessageId = data.message_id;
        if (tokenMessageId && streamingBufferRef.current[tokenMessageId] !== undefined) {
          streamingBufferRef.current[tokenMessageId] += data.token || '';
          
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
        const completedMessageId = data.message_id;
        if (!completedMessageId) break;
        
        const responseTime = Date.now() - (responseStartTimeRef.current[completedMessageId] || 0);
        
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === completedMessageId
              ? {
                  ...msg,
                  isStreaming: false,
                  content: data.final_content || streamingBufferRef.current[completedMessageId] || '',
                  metadata: {
                    ...msg.metadata,
                    tokens: data.token_count,
                    processingTime: responseTime,
                    templateSuggestions: data.template_suggestions,
                  },
                }
              : msg
          ),
          currentStreamingMessageId: null,
        }));

        // Update metrics
        setMetrics(prev => ({
          totalMessages: prev.totalMessages + 1,
          totalTokens: prev.totalTokens + (data.token_count || 0),
          averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
          lastActive: new Date(),
        }));

        // Cleanup
        delete streamingBufferRef.current[completedMessageId];
        delete responseStartTimeRef.current[completedMessageId];
        break;

      case 'message':
        // Non-streaming message (fallback)
        const directMessage: StreamingMessage = {
          id: data.message_id || crypto.randomUUID(),
          role: data.role === 'assistant' ? 'assistant' : 'assistant',
          content: data.content || '',
          isStreaming: false,
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: {
            processingTime: data.processing_time_ms,
            templateSuggestions: data.template_suggestions,
            tokens: data.token_count,
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
        if (data.original_message_id) {
          const optimizationData: OptimizationResult = {
            original_prompt: data.original_prompt || '',
            optimized_prompt: data.optimized_prompt || '',
            improvements: data.improvements || [],
            confidence: data.confidence || 0,
            processing_time_ms: data.processing_time_ms || 0,
          };

          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === data.original_message_id
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

      case 'error':
        const errorMessage = (data.message as string) || 'An error occurred';
        console.error('❌ WebSocket error:', errorMessage);
        setChatState(prev => ({
          ...prev,
          error: errorMessage,
          isTyping: false,
          currentStreamingMessageId: null,
        }));
        break;

      case 'heartbeat':
        // Handle heartbeat from server - update connection state
        setChatState(prev => ({ ...prev, lastActive: new Date() }));
        // Optionally respond with pong if needed
        break;

      case 'pong':
        // Handle pong response from server
        setChatState(prev => ({ ...prev, lastActive: new Date() }));
        break;

      case 'template_opportunity':
        // Handle template creation suggestions
        if (data.suggestion) {
          setChatState(prev => ({
            ...prev,
            templateSuggestion: data.suggestion,
          }));
        }
        break;

      case 'template_created':
        // Handle successful template creation
        if (data.template) {
          setChatState(prev => ({
            ...prev,
            lastCreatedTemplate: data.template,
            templateSuggestion: null,
          }));
        }
        break;

      default:
        // Only log truly unknown message types, ignore common ones
        if (!['ping', 'status', 'connection_status'].includes(data.type)) {
          console.log('Unknown message type:', data.type, data);
        }
    }
  }, []);

  // WebSocket connection
  const { isConnected, latency, sendMessage, disconnect, reconnect } = useWebSocketConnection(
    wsConfig,
    handleWebSocketMessage
  );

  // Update chat state with WebSocket connection status
  useEffect(() => {
    setChatState(prev => ({ ...prev, isConnected }));
  }, [isConnected]);

  // Send chat message
  const sendChatMessage = useCallback(
    (content: string, options?: { type?: 'chat' | 'slash_command'; command?: string }) => {
      if (!content.trim() || !isConnected) {
        return false;
      }

      const messageId = crypto.randomUUID();
      const timestamp = new Date();

      // Add user message to state
      const userMessage: StreamingMessage = {
        id: messageId,
        role: 'user',
        content,
        isStreaming: false,
        timestamp,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        error: null,
      }));

      // Send to WebSocket
      if (options?.type === 'slash_command') {
        return sendMessage({
          type: 'slash_command',
          command: options.command,
          content: content.replace(`/${options.command}`, '').trim(),
          message_id: messageId,
          timestamp: timestamp.toISOString(),
        });
      } else {
        return sendMessage({
          type: 'chat_message',
          message_id: messageId,
          content,
          timestamp: timestamp.toISOString(),
        });
      }
    },
    [isConnected, sendMessage]
  );

  // Send slash command
  const sendSlashCommand = useCallback(
    (command: string, content: string) => {
      return sendChatMessage(`/${command} ${content}`, { type: 'slash_command', command });
    },
    [sendChatMessage]
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null,
      currentStreamingMessageId: null,
    }));
    streamingBufferRef.current = {};
    responseStartTimeRef.current = {};
  }, []);

  // Export conversation
  const exportConversation = useCallback(() => {
    return {
      messages: chatState.messages,
      metrics,
      sessionId: options.sessionId,
      exportedAt: new Date(),
    };
  }, [chatState.messages, metrics, options.sessionId]);

  // Save conversation as template
  const saveAsTemplate = useCallback((templateData: {
    title: string;
    category: string;
    description?: string;
    includeAiResponses?: boolean;
  }) => {
    if (!isConnected) return false;

    return sendMessage({
      type: 'save_conversation_as_template',
      title: templateData.title,
      category: templateData.category,
      description: templateData.description || '',
      include_ai_responses: templateData.includeAiResponses || false,
      conversation_messages: chatState.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    });
  }, [isConnected, sendMessage, chatState.messages]);

  // Create template directly
  const createTemplate = useCallback((templateData: {
    title: string;
    description: string;
    content: string;
    category: string;
    fields?: string[];
  }) => {
    if (!isConnected) return false;

    return sendMessage({
      type: 'create_template',
      template_data: templateData,
    });
  }, [isConnected, sendMessage]);

  // Dismiss template suggestion
  const dismissTemplateSuggestion = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      templateSuggestion: null,
    }));
  }, []);

  return {
    // State
    ...chatState,
    metrics,
    latency,

    // Actions
    sendMessage: sendChatMessage,
    sendSlashCommand,
    clearConversation,
    exportConversation,

    // Template actions
    saveAsTemplate,
    createTemplate,
    dismissTemplateSuggestion,

    // WebSocket actions
    disconnect,
    reconnect,
  };
}
