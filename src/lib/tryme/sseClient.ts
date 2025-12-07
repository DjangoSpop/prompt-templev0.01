export interface SSEMessage {
  type: 'stream_start' | 'token' | 'insight' | 'suggestions' | 'optimization_result' | 'stream_complete' | 'error';
  data?: any;
}

export interface SSEEventHandlers {
  onStart?: (data: { session_id: string }) => void;
  onToken?: (data: { token: string; is_final: boolean }) => void;
  onInsight?: (data: { items: Array<{ text: string; confidence: number }> }) => void;
  onSuggestions?: (data: { items: string[] }) => void;
  onResult?: (data: { before: string; after: string }) => void;
  onComplete?: (data: { usage: { input_tokens: number; output_tokens: number } }) => void;
  onError?: (data: { code: number; message: string }) => void;
}

export interface OptimizeRequest {
  prompt: string;
  guest_session_id: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export class SSEClient {
  private controller: AbortController | null = null;
  private tokenBuffer: string[] = [];
  private rafId: number | null = null;
  private lastFlushTime = 0;
  private readonly FLUSH_INTERVAL = 16; // ~60fps

  async optimizePrompt(
    request: OptimizeRequest,
    handlers: SSEEventHandlers
  ): Promise<void> {
    // Cancel any existing request
    this.abort();

    this.controller = new AbortController();
    this.tokenBuffer = [];

    try {
      const response = await fetch('/api/v2/try/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          prompt: request.prompt.slice(0, 8000), // Limit prompt length
          guest_session_id: request.guest_session_id,
          model: request.model || 'deepseek-chat',
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 512,
        }),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line === 'data: [DONE]') {
            this.flushTokens(handlers.onToken);
            return;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              this.handleSSEMessage(data, handlers);
            } catch (error) {
              console.warn('Failed to parse SSE message:', line);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was intentionally aborted
      }

      handlers.onError?.({
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private handleSSEMessage(data: any, handlers: SSEEventHandlers) {
    switch (data.type) {
      case 'stream_start':
        handlers.onStart?.(data);
        break;

      case 'token':
        this.bufferToken(data.token, handlers.onToken);
        break;

      case 'insight':
        this.flushTokens(handlers.onToken);
        handlers.onInsight?.(data);
        break;

      case 'suggestions':
        this.flushTokens(handlers.onToken);
        handlers.onSuggestions?.(data);
        break;

      case 'optimization_result':
        this.flushTokens(handlers.onToken);
        handlers.onResult?.(data);
        break;

      case 'stream_complete':
        this.flushTokens(handlers.onToken);
        handlers.onComplete?.(data);
        break;

      case 'error':
        this.flushTokens(handlers.onToken);
        handlers.onError?.(data);
        break;

      default:
        console.warn('Unknown SSE message type:', data.type);
    }
  }

  private bufferToken(token: string, onToken?: (data: { token: string; is_final: boolean }) => void) {
    this.tokenBuffer.push(token);

    // Use requestAnimationFrame for smooth batching
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - this.lastFlushTime >= this.FLUSH_INTERVAL) {
          this.flushTokens(onToken);
        } else {
          this.rafId = null;
          // Schedule next flush
          setTimeout(() => {
            this.rafId = requestAnimationFrame(() => {
              this.flushTokens(onToken);
            });
          }, this.FLUSH_INTERVAL - (now - this.lastFlushTime));
        }
      });
    }
  }

  private flushTokens(onToken?: (data: { token: string; is_final: boolean }) => void) {
    if (this.tokenBuffer.length > 0 && onToken) {
      const batchedTokens = this.tokenBuffer.join('');
      onToken({ token: batchedTokens, is_final: false });
      this.tokenBuffer = [];
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.lastFlushTime = performance.now();
  }

  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.tokenBuffer = [];
  }
}

// Singleton instance
export const sseClient = new SSEClient();