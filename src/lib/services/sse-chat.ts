'use client';

import React from 'react';
import { EventEmitter } from 'events';
import { getAccessToken } from '@/lib/auth';
import { billingService } from './billing';
import { BaseApiClient } from '@/lib/api/base';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    model?: string;
    tokens?: number;
    cost?: number;
  };
  optimizationData?: PromptOptimizationResult;
  status?: 'sending' | 'processing' | 'completed' | 'error';
}

export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  score: number;
  suggestions: string[];
  intent: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
}

export interface SSEChatConfig {
  apiUrl?: string;
  enableOptimization?: boolean;
  enableAnalytics?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface SSEStreamEvent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

/**
 * SSE-based chat service that provides the same interface as WebSocketChatService
 * for seamless migration from WebSocket to HTTP SSE streaming
 */
export class SSEChatService extends EventEmitter {
  private config: Required<SSEChatConfig>;
  private abortController: AbortController | null = null;
  private isConnected = false;
  private isConnecting = false;
  private retryCount = 0;
  private currentStreamingMessage: ChatMessage | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionInfo: Record<string, unknown> | null = null;

  constructor(config: SSEChatConfig = {}) {
    super();
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com',
      enableOptimization: config.enableOptimization ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      maxRetries: config.maxRetries ?? 5,
      retryDelay: config.retryDelay ?? 3000,
      model: config.model || 'deepseek-chat', // Updated to use DeepSeek as default
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
    };

    this.setupHealthCheck();
  }

  /**
   * Initialize SSE connection (compatibility method - SSE doesn't need persistent connection)
   */
  async connect(): Promise<void> {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      // Check health endpoint
      await this.checkHealth();
      this.isConnected = true;
      this.isConnecting = false;
      this.retryCount = 0;
      
      console.log('SSE Chat service ready');
      this.emit('connected');
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      console.error('SSE Chat service initialization failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from service (cleanup method)
   */
  disconnect(): void {
    this.isConnected = false;
    this.isConnecting = false;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.emit('disconnected');
    console.log('SSE Chat service disconnected');
  }

  /**
   * Check if token is expired (same logic as base.ts)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < (currentTime + 30); // 30 second buffer like base.ts
    } catch {
      return true; // If we can't parse it, consider it expired
    }
  }

  /**
   * Test different authentication header formats to see what works with Django
   */
  private async testAuthenticationFormats(token: string): Promise<boolean> {
    console.log('🧪 Testing authentication formats with Django backend...');
    
    const authFormats = [
      `Bearer ${token}`,
      `Token ${token}`,
      `JWT ${token}`,
      token // Raw token
    ];
    
    // Test against Django profile endpoint first (simpler endpoint)
    for (const authHeader of authFormats) {
      try {
        const testResponse = await fetch(`${this.config.apiUrl}/api/v2/auth/profile/`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });
        
        if (testResponse.ok) {
          console.log(`✅ Authentication format "${authHeader.split(' ')[0] || 'Raw'}" works!`);
          return true;
        } else {
          console.log(`❌ Authentication format "${authHeader.split(' ')[0] || 'Raw'}" failed:`, testResponse.status);
        }
      } catch (error) {
        console.warn(`⚠️ Auth test error for "${authHeader.split(' ')[0] || 'Raw'}":`, error);
      }
    }
    
    console.error('❌ All authentication formats failed');
    return false;
  }

  /**
   * Enhanced authentication token retrieval with multiple fallbacks
   * This method tries various ways to get a valid auth token
   */
  private async getAuthTokenWithFallbacks(): Promise<string | null> {
    console.log('🔍 Starting enhanced auth token retrieval...');
    
    // Method 1: Try getAccessToken() function
    try {
      const token = getAccessToken();
      if (token && token.length > 10) {
        console.log('✅ Got token from getAccessToken():', {
          length: token.length,
          preview: token.substring(0, 20) + '...'
        });
        return token;
      }
    } catch (error) {
      console.warn('⚠️ getAccessToken() failed:', error);
    }
    
    // Method 2: Try localStorage directly
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken && storedToken.length > 10) {
          console.log('✅ Got token from localStorage:', {
            length: storedToken.length,
            preview: storedToken.substring(0, 20) + '...'
          });
          return storedToken;
        }
      } catch (error) {
        console.warn('⚠️ localStorage access failed:', error);
      }
    }
    
    // Method 3: Try auth service import
    try {
      const { authService } = await import('@/lib/api/auth');
      if (authService && 'getAccessToken' in authService) {
        const serviceToken = (authService as unknown as { getAccessToken: () => string | null }).getAccessToken();
        if (serviceToken && serviceToken.length > 10) {
          console.log('✅ Got token from authService:', {
            length: serviceToken.length,
            preview: serviceToken.substring(0, 20) + '...'
          });
          return serviceToken;
        }
      }
    } catch (error) {
      console.warn('⚠️ authService import failed:', error);
    }
    
    // Method 4: Try shared storage (check if available)
    try {
      if (typeof window !== 'undefined') {
        // Check if shared tokens exist in any global storage
        const possibleTokenKeys = ['token', 'auth_token', 'authToken', 'jwt_token'];
        for (const key of possibleTokenKeys) {
          const altToken = localStorage.getItem(key);
          if (altToken && altToken.length > 10) {
            console.log(`✅ Got token from alternative storage key "${key}":`, {
              length: altToken.length,
              preview: altToken.substring(0, 20) + '...'
            });
            return altToken;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ alternative storage access failed:', error);
    }
    
    console.error('❌ All authentication methods failed');
    return null;
  }

  /**
   * Send a chat message using SSE streaming
   */
  async sendMessage(content: string, conversationHistory: ChatMessage[] = []): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    // Abort any ongoing request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller
    this.abortController = new AbortController();

    const messageId = `msg_${Date.now()}`;
    const startTime = Date.now();

    // Create streaming message placeholder
    this.currentStreamingMessage = {
      id: messageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'processing',
      metadata: {
        model: this.config.model,
      }
    };

    try {
      // Use EXACT same authentication logic as base.ts setupInterceptors
      // CRITICAL: This matches exactly what base.ts request interceptor does
      const apiClient = new BaseApiClient();
      const currentToken = apiClient.getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
      
      if (!currentToken || currentToken === 'undefined' || this.isTokenExpired(currentToken)) {
        throw new Error('No valid authentication token available. Please log in first.');
      }
      
      if (currentToken.includes('undefined')) {
        console.error('❌ Detected undefined token, clearing it');
        BaseApiClient.clearTokens();
        throw new Error('Invalid token detected. Please log in again.');
      }
      
      console.log('🔑 SSE using centralized auth token:', {
        tokenLength: currentToken.length,
        tokenPreview: currentToken.substring(0, 20) + '...',
        source: apiClient.getAccessToken() ? 'BaseApiClient.getAccessToken()' : 'localStorage'
      });
      
      // Prepare conversation history with DeepSeek optimization system prompt
      const systemPrompt = this.getDeepSeekSystemPrompt();
      
      const messages = [
        // Add system prompt for better DeepSeek performance
        { role: 'system' as const, content: systemPrompt },
        // Add conversation history
        ...conversationHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        // Add current user message
        { role: 'user' as const, content }
      ];

      // Prepare request payload
      const payload = {
        messages,
        model: this.config.model,
        stream: true,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      };

      console.log('🚀 Starting SSE stream for message:', messageId);
      console.log('📋 Request payload:', JSON.stringify(payload, null, 2));

      // Make direct request to Django API (bypass Next.js proxy)
      const url = `${this.config.apiUrl}/api/v2/chat/completions/`;
      console.log('🌐 Request URL:', url);
      console.log('🔐 Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken.substring(0, 20)}...`,
        'Accept': 'text/event-stream, application/json',
        'Cache-Control': 'no-cache'
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'text/event-stream, application/json', // CRITICAL: Accept both formats
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        console.error('❌ API Response failed:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        let errorMessage = `Request failed with status ${response.status}`;
        let errorDetails = {};
        
        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          // Clear invalid tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else if (response.status === 406) {
          errorMessage = 'Could not satisfy the request Accept header.';
        }
        
        try {
          const errorData = await response.json();
          errorDetails = errorData;
          const serverMessage = errorData.error || errorData.message || errorData.detail;
          if (serverMessage) {
            errorMessage = serverMessage;
          }
          console.error('❌ API Error response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = response.statusText || errorMessage;
        }
        
        // Include more details for debugging
        const fullError = `${errorMessage} (Status: ${response.status})`;
        console.error('❌ Full error context:', {
          message: fullError,
          status: response.status,
          statusText: response.statusText,
          errorDetails,
          requestUrl: url,
          hasToken: !!currentToken,
          tokenPreview: currentToken ? currentToken.substring(0, 20) + '...' : 'none'
        });
        
        throw new Error(fullError);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Check the response content type to handle appropriately
      const contentType = response.headers.get('content-type') || '';
      console.log('📋 Response content type:', contentType);

      if (contentType.includes('text/event-stream')) {
        // Handle SSE stream
        await this.processSSEStream(response.body, messageId, startTime);
      } else if (contentType.includes('application/json')) {
        // Handle JSON response with manual streaming simulation
        await this.processJSONResponse(response, messageId, startTime);
      } else {
        throw new Error(`Unsupported response content type: ${contentType}`);
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      
      if (err.name === 'AbortError') {
        console.log('SSE request aborted');
        return;
      }

      console.error('❌ SSE chat error:', err);
      
      // Update streaming message with error
      if (this.currentStreamingMessage) {
        this.currentStreamingMessage.status = 'error';
        this.currentStreamingMessage.content = `Error: ${err.message}`;
        this.emit('messageResponse', this.currentStreamingMessage);
      }

      this.emit('error', err);
      throw err;
    } finally {
      this.abortController = null;
      this.currentStreamingMessage = null;
    }
  }

  /**
   * Process SSE stream and emit events
   */
  private async processSSEStream(body: ReadableStream<Uint8Array>, messageId: string, startTime: number): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';
    let traceId: string | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE frames
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || ''; // Keep incomplete frame in buffer
        
        for (const frame of frames) {
          if (!frame.trim()) continue;
          
          const event = this.parseSSEFrame(frame);
          if (event) {
            await this.handleSSEEvent(event, messageId, accumulatedContent, traceId, startTime);
            
            // Update accumulated content if we got new content
            if (event.event === 'message' || event.event === 'data' || !event.event) {
              try {
                const data = JSON.parse(event.data);
                const content = data.choices?.[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                }
                if (data.trace_id) {
                  traceId = data.trace_id;
                }
              } catch {
                // Handle plain text content
                if (event.data && event.data !== '[DONE]') {
                  accumulatedContent += event.data;
                }
              }
            }
          }
        }
      }

      // Finalize the message
      if (this.currentStreamingMessage && accumulatedContent) {
        this.currentStreamingMessage.content = accumulatedContent;
        this.currentStreamingMessage.status = 'completed';
        this.currentStreamingMessage.metadata = {
          ...this.currentStreamingMessage.metadata,
          processingTime: Date.now() - startTime,
          tokens: accumulatedContent.split(' ').length, // Rough token estimate
        };

        // Handle credit consumption
        if (this.currentStreamingMessage.metadata?.cost) {
          try {
            await billingService.consumeCredits('chat_message', this.currentStreamingMessage.metadata.cost);
          } catch (error) {
            console.error('Error updating credits:', error);
          }
        }

        console.log('✅ SSE stream completed:', messageId);
        this.emit('messageResponse', this.currentStreamingMessage);
      }

    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse SSE frame into event object
   */
  private parseSSEFrame(frame: string): SSEStreamEvent | null {
    const lines = frame.split('\n');
    const event: SSEStreamEvent = { data: '' };
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('id:')) {
        event.id = trimmed.slice(3).trim();
      } else if (trimmed.startsWith('event:')) {
        event.event = trimmed.slice(6).trim();
      } else if (trimmed.startsWith('data:')) {
        event.data = trimmed.slice(5).trim();
      } else if (trimmed.startsWith('retry:')) {
        event.retry = parseInt(trimmed.slice(6).trim(), 10);
      }
    }
    
    return event.data ? event : null;
  }

  /**
   * Handle individual SSE events
   */
  private async handleSSEEvent(
    event: SSEStreamEvent, 
    messageId: string, 
    accumulatedContent: string,
    traceId: string | undefined,
    _startTime: number
  ): Promise<void> {
    switch (event.event) {
      case 'stream_start':
        try {
          const data = JSON.parse(event.data);
          console.log('🚀 Stream started:', data);
          if (data.trace_id) {
            traceId = data.trace_id;
          }
        } catch {
          console.warn('Failed to parse stream_start event');
        }
        break;

      case 'stream_complete':
        try {
          const data = JSON.parse(event.data);
          console.log('✅ Stream completed:', data);
        } catch {
          console.warn('Failed to parse stream_complete event');
        }
        break;

      case 'error':
        try {
          const errorData = JSON.parse(event.data);
          console.error('❌ Stream error:', errorData);
          throw new Error(errorData.error || 'Stream error');
        } catch (e) {
          if (e instanceof Error && e.message !== 'Stream error') {
            console.warn('Failed to parse error event');
          } else {
            throw e;
          }
        }
        break;

      case 'message':
      case 'data':
      default:
        // Handle streaming content
        if (event.data === '[DONE]') {
          return; // Stream finished
        }

        try {
          const data = JSON.parse(event.data);
          const content = data.choices?.[0]?.delta?.content || '';
          
          if (content && this.currentStreamingMessage) {
            this.currentStreamingMessage.content = accumulatedContent + content;
            // Emit live updates
            this.emit('messageUpdate', {
              messageId,
              content: this.currentStreamingMessage.content,
              traceId,
            });
          }
        } catch {
          // Handle plain text content
          if (event.data && this.currentStreamingMessage) {
            this.currentStreamingMessage.content = accumulatedContent + event.data;
            this.emit('messageUpdate', {
              messageId,
              content: this.currentStreamingMessage.content,
              traceId,
            });
          }
        }
        break;
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ status: string; message: string; config?: unknown }> {
    try {
      const token = getAccessToken();
      const url = `${this.config.apiUrl}/api/v2/chat/health/`;
      
      console.log('🏥 Health check:', {
        url,
        hasToken: !!token,
        tokenPreview: token?.substring(0, 20) + '...'
      });
      
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('🏥 Health check response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const health = await response.json();
      this.connectionInfo = health.config || null;
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Cannot connect to chat service'
      };
    }
  }

  /**
   * Setup periodic health checks
   */
  private setupHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          await this.checkHealth();
        } catch (error) {
          console.warn('Health check failed:', error);
          this.emit('health_warning', error);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }

  get connecting(): boolean {
    return this.isConnecting;
  }

  /**
   * Compatibility methods for WebSocket interface
   */
  on(event: string, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    if (typeof super.off === 'function') {
      return super.off(event, listener);
    }

    return super.removeListener(event, listener);
  }

  /**
   * Process JSON response and simulate streaming for better UX
   */
  private async processJSONResponse(response: Response, messageId: string, startTime: number): Promise<void> {
    try {
      const data = await response.json();
      console.log('📋 Processing JSON response:', data);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        if (this.currentStreamingMessage) {
          // Simulate streaming by gradually revealing content
          this.currentStreamingMessage.content = '';
          this.currentStreamingMessage.status = 'processing';
          
          // Stream the content character by character for better UX
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            if (this.abortController?.signal.aborted) {
              return;
            }
            
            this.currentStreamingMessage.content = words.slice(0, i + 1).join(' ');
            this.emit('messageResponse', { ...this.currentStreamingMessage });
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Finalize the message
          this.currentStreamingMessage.content = content;
          this.currentStreamingMessage.status = 'completed';
          this.currentStreamingMessage.metadata = {
            ...this.currentStreamingMessage.metadata,
            processingTime: Date.now() - startTime,
            tokens: data.usage?.total_tokens || content.split(' ').length,
            model: data.model || this.config.model,
          };

          // Handle credit consumption
          if (data.usage?.total_tokens) {
            try {
              const cost = data.usage.total_tokens * 0.001; // Rough cost calculation
              this.currentStreamingMessage.metadata.cost = cost;
              await billingService.consumeCredits('chat_message', cost);
            } catch (error) {
              console.error('Error updating credits:', error);
            }
          }

          console.log('✅ JSON response processed:', messageId);
          this.emit('messageResponse', this.currentStreamingMessage);
        }
      } else {
        throw new Error('Invalid response format: missing message content');
      }
    } catch (error) {
      console.error('❌ Error processing JSON response:', error);
      throw error;
    }
  }

  /**
   * Generate DeepSeek-optimized system prompt for better performance
   */
  private getDeepSeekSystemPrompt(): string {
    return `You are an expert AI assistant powered by DeepSeek, designed to provide high-quality, helpful, and accurate responses. You excel at:

🎯 **Core Capabilities:**
- Clear, concise, and well-structured communication
- Deep technical knowledge across multiple domains
- Creative problem-solving and analytical thinking
- Code generation and debugging expertise
- Professional writing and content creation

💡 **Prompt Optimization Guidelines:**
- Understand user intent quickly and accurately
- Provide actionable, practical solutions
- Use markdown formatting for better readability
- Include examples and step-by-step instructions when helpful
- Ask clarifying questions when context is insufficient

🚀 **Response Style:**
- Be conversational yet professional
- Prioritize accuracy over speed
- Admit uncertainty when appropriate
- Offer multiple approaches when relevant
- Focus on delivering maximum value to the user

Please respond thoughtfully and helpfully to the user's request, leveraging your capabilities to provide the best possible assistance.`;
  }

  emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}

// Export singleton instance for easy use
export const sseChatService = new SSEChatService();

/**
 * React hook for using SSE chat service (compatible with useWebSocketChat)
 */
export function useSSEChat(config?: SSEChatConfig) {
  const [service] = React.useState(() => new SSEChatService(config));
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleConnecting = () => {
      setIsConnecting(true);
      setError(null);
    };

    const handleError = (...args: unknown[]) => {
      const err = args[0] instanceof Error ? args[0] : new Error('Unknown error');
      setError(err);
      setIsConnected(false);
      setIsConnecting(false);
    };

    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);
    service.on('connecting', handleConnecting);
    service.on('error', handleError);

    // Auto-connect
    service.connect().catch(handleError);

    return () => {
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
      service.off('connecting', handleConnecting);
      service.off('error', handleError);
      service.destroy();
    };
  }, [service]);

  return {
    service,
    isConnected,
    isConnecting,
    error,
  };
}

