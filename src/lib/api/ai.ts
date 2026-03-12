import { BaseApiClient } from './base';
import { useCreditsStore } from '@/store/credits';

// ============================================================
// Core provider / model types (existing)
// ============================================================

interface AIProvider {
  id: string;
  name: string;
  description: string;
  supported_models: string[];
  pricing: any;
  status: 'active' | 'inactive';
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: any;
  context_length: number;
  status: 'active' | 'inactive';
}

interface GenerationRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  context?: any;
}

interface GenerationResponse {
  id: string;
  model: string;
  choices: Array<{
    text: string;
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIUsage {
  total_requests: number;
  total_tokens: number;
  cost: number;
  period: string;
  breakdown_by_model: any;
}

interface AIQuota {
  model: string;
  limit: number;
  used: number;
  remaining: number;
  reset_at: string;
}

// ============================================================
// Streaming: Optimization types
// ============================================================

export interface OptimizeStreamRequest {
  /** The original prompt text to optimise */
  original: string;
  session_id?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  /** 'fast' (default) = single-pass; 'deep' = RAG + multi-step */
  mode?: 'fast' | 'deep';
  context?: Record<string, unknown>;
}

export interface OptimizeStreamCitation {
  id: string;
  title: string;
  source: string;
  score: number;
}

export interface OptimizeStreamResult {
  /** The final optimised prompt text */
  optimized: string;
  citations?: OptimizeStreamCitation[];
  diff_summary?: string;
  usage?: { tokens_in: number; tokens_out: number };
  run_id?: string;
  processing_time_ms?: number;
  improvements?: {
    clarity_score?: number;
    specificity_score?: number;
    effectiveness_score?: number;
    overall_score?: number;
  };
  /** Template opportunity detected during optimisation */
  template_opportunity?: {
    id: string;
    title: string;
    description: string;
    category: string;
    confidence: number;
    reasoning: string;
    suggested_tags: string[];
  };
  /** Short list of improvement suggestions */
  suggestions?: string[];
}

export interface OptimizeStreamCallbacks {
  /** Called for each progress stage: (step, human-readable message) */
  onProgress?: (step: string, message: string) => void;
  /** Called for each streamed token (delta content) */
  onToken?: (content: string) => void;
  /** Called once the full optimisation result is available */
  onResult?: (data: OptimizeStreamResult) => void;
  /** Called on any error (network, auth, backend) */
  onError?: (error: string) => void;
  /** Called after the stream finishes cleanly */
  onComplete?: () => void;
}

// ============================================================
// Streaming: DeepSeek chat types
// ============================================================

export interface DeepSeekStreamRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  session_id?: string;
  optimization_type?: string;
}

export interface DeepSeekStreamCallbacks {
  /** Called with each streamed token */
  onToken?: (content: string) => void;
  /** Called when stream begins */
  onStreamStart?: (data: unknown) => void;
  /** Called when stream completes; receives accumulated full text */
  onStreamComplete?: (fullContent: string, data?: unknown) => void;
  /** Called on error */
  onError?: (error: string) => void;
}

// ============================================================
// AIService
// ============================================================

export class AIService extends BaseApiClient {
  // Track current SSE event type for multi-line events
  private lastSSEEvent: string | null = null;

  // ----------------------------------------------------------
  // Existing REST methods
  // ----------------------------------------------------------

  async getProviders(): Promise<AIProvider[]> {
    return this.request<AIProvider[]>('/api/v2/ai/providers/');
  }

  async getModels(): Promise<AIModel[]> {
    return this.request<AIModel[]>('/api/v2/ai/models/');
  }

  async generate(data: GenerationRequest): Promise<GenerationResponse> {
    return this.request<GenerationResponse>('/api/v2/ai/generate/', {
      method: 'POST',
      data,
    });
  }

  async getUsage(): Promise<AIUsage> {
    return this.request<AIUsage>('/api/v2/ai/usage/');
  }

  async getQuotas(): Promise<AIQuota[]> {
    return this.request<AIQuota[]>('/api/v2/ai/quotas/');
  }

  // ----------------------------------------------------------
  // Token helpers
  // ----------------------------------------------------------

  /**
   * Manually set the JWT access token (useful after login outside BaseApiClient).
   * Falls back to reading from localStorage if not explicitly set.
   */
  setToken(token: string): void {
    BaseApiClient.saveTokensToStorage({ access: token, refresh: '' });
  }

  private resolveToken(): string | null {
    // Try shared token first, then localStorage fallback
    const shared = this.getAccessToken();
    if (shared) return shared;
    if (typeof window !== 'undefined') {
      const candidates = [
        localStorage.getItem('access_token'),
        sessionStorage.getItem('access_token'),
        localStorage.getItem('auth_token'),
        localStorage.getItem('token'),
      ];
      for (const c of candidates) {
        if (c && c !== 'undefined' && c !== 'null') return c;
      }
    }
    return null;
  }

  private get baseUrl(): string {
    return (this.axiosInstance.defaults.baseURL as string) ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
      'https://api.prompt-temple.com';
  }

  // ----------------------------------------------------------
  // SSE helpers
  // ----------------------------------------------------------

  private buildSSEHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json',
      'Cache-Control': 'no-cache',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async fetchSSE(
    url: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<Response | null> {
    const token = this.resolveToken();
    let headers = this.buildSSEHeaders(token);

    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    // Some servers reject the mixed Accept header with 406 — retry with */*
    if (response.status === 406) {
      headers = { ...headers, Accept: '*/*' };
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
      });
    }

    // Handle rate limiting (429) before further processing
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const err = new Error(
        `Rate limited: retry after ${retryAfter ?? '60'} seconds`
      ) as any;
      err.status = 429;
      err.retryAfter = retryAfter ? parseInt(retryAfter) : 60;
      throw err;
    }

    return response;
  }

  private async consumeSSEStream(
    response: Response,
    onLine: (line: string) => void,
    onDone: () => void,
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      onDone();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any remaining buffer
          if (buffer.trim()) onLine(buffer);
          onDone();
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          onLine(line);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse SSE-formatted lines to extract event name and JSON data
   * Handles format:
   * event: meta
   * data: {...}
   */
  private parseSSELine(
    line: string
  ): { eventType?: string; data?: any } | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) return null; // ignore blanks/comments

    if (trimmed.startsWith('event: ')) {
      return { eventType: trimmed.slice(7).trim() };
    }

    if (trimmed.startsWith('data: ')) {
      const raw = trimmed.slice(6).trim();
      if (raw === '[DONE]') {
        return { data: { stream_complete: true } };
      }
      try {
        return { data: JSON.parse(raw) };
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Sync credit headers from SSE response to credits store
   * Called after stream starts to ensure X-Credits-* headers are captured
   */
  private syncCreditHeadersFromResponse(response: Response): void {
    if (typeof window === 'undefined') return;

    const remaining = response.headers.get('X-Credits-Remaining');
    const balance = response.headers.get('X-Credits-Balance');
    const reserved = response.headers.get('X-Credits-Reserved');
    const low = response.headers.get('X-Low-Credits');

    if (remaining !== null || balance !== null) {
      useCreditsStore.getState().syncFromHeaders(
        remaining !== null ? Number(remaining) : null,
        null, // credits_consumed comes from stream_complete event
        low === 'true',
        balance !== null ? Number(balance) : null,
        reserved !== null ? Number(reserved) : null
      );
    }
  }

  // ----------------------------------------------------------
  // optimizePromptStream — POST /api/v2/ai/optimization/stream/
  // ----------------------------------------------------------

  /**
   * Stream prompt optimisation via SSE.
   * Replaces any broken WebSocket usage at /ws/optimization/.
   *
   * @example
   * await aiService.optimizePromptStream(
   *   { original: 'Write something about AI' },
   *   {
   *     onProgress: (step, msg) => setStatus(msg),
   *     onToken:    (tok)       => setOutput(p => p + tok),
   *     onResult:   (data)      => setResult(data),
   *     onError:    (err)       => toast.error(err),
   *     onComplete: ()          => setLoading(false),
   *   },
   *   abortController.signal,
   * );
   */
  async optimizePromptStream(
    request: OptimizeStreamRequest,
    callbacks: OptimizeStreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void> {
    // POST directly to the backend — same pattern as deepseekStream and optimizePrompt
    const url = `${this.baseUrl}/api/v2/ai/optimization/stream/`;

    const body = {
      original: request.original,
      mode: request.mode ?? 'fast',
      provider: 'auto',
      context: request.context ?? {},
      session_id: request.session_id ?? `optimize_${Date.now()}`,
    };

    let response: Response;
    try {
      response = await this.fetchSSE(url, body, signal);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      // Handle rate limiting
      if (err?.status === 429) {
        const retryAfter = err?.retryAfter ?? 60;
        callbacks.onError?.(`Rate limited. Please try again in ${retryAfter} seconds.`);
        return;
      }

      callbacks.onError?.(err?.message ?? 'Network error');
      return;
    }

    if (!response.ok) {
      // Handle 402 Insufficient Credits
      if (response.status === 402) {
        const errData = await response.json().catch(() => ({}));
        callbacks.onError?.(
          `Insufficient credits: need ${(errData as any).credits_required ?? '?'}, ` +
          `have ${(errData as any).credits_available ?? '?'}`
        );
        return;
      }

      const errData = await response.json().catch(() => ({}));
      callbacks.onError?.(
        (errData as any).detail ?? (errData as any).error ?? `HTTP ${response.status}`,
      );
      return;
    }

    // Guard against onComplete being called twice (once from event: complete, once from stream end)
    let completeFired = false;
    const safeComplete = () => {
      if (!completeFired) {
        completeFired = true;
        callbacks.onComplete?.();
      }
    };

    this.lastSSEEvent = null; // Reset event tracking
    const onLine = (line: string) =>
      this.handleOptimizationLine(line, callbacks, safeComplete);

    try {
      await this.consumeSSEStream(response, onLine, safeComplete);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        callbacks.onError?.(err?.message ?? 'Stream error');
      }
    }
  }

  private handleOptimizationLine(
    line: string,
    callbacks: OptimizeStreamCallbacks,
    safeComplete: () => void,
  ): void {
    const parsed = this.parseSSELine(line);
    if (!parsed) return;

    // Track the current event type
    if (parsed.eventType) {
      this.lastSSEEvent = parsed.eventType;
      return;
    }

    if (!parsed.data) return;
    const data = parsed.data;

    // Consume the event name immediately so it doesn't bleed into next line
    const ev = this.lastSSEEvent;
    this.lastSSEEvent = null;

    // --- Named-event dispatch (real backend format) ---
    if (ev === 'meta') {
      callbacks.onProgress?.('meta', String(data.status ?? 'connected'));
      return;
    }

    if (ev === 'token') {
      if (data.text) callbacks.onToken?.(data.text);
      return;
    }

    if (ev === 'complete') {
      callbacks.onResult?.(data as OptimizeStreamResult);
      if (data.credits_consumed !== undefined) {
        useCreditsStore.getState().syncFromHeaders(null, data.credits_consumed, false);
      }
      safeComplete();
      return;
    }

    if (ev === 'error') {
      callbacks.onError?.(String(data.error ?? 'Stream error'));
      return;
    }

    // --- Fallback: bare data lines without a named event (OpenAI-compat or legacy) ---

    // Progress heartbeat: { step, message }
    if (data.step && data.message) {
      callbacks.onProgress?.(String(data.step), String(data.message));
      return;
    }

    // Template opportunity sidecar
    if (data.template_opportunity) {
      callbacks.onResult?.({ optimized: '', template_opportunity: data.template_opportunity });
      return;
    }

    // Full optimisation result (bare data line)
    if (data.optimized) {
      callbacks.onResult?.(data as OptimizeStreamResult);
      return;
    }

    // OpenAI-compatible streaming token
    const delta = data?.choices?.[0]?.delta?.content;
    if (delta) {
      callbacks.onToken?.(delta);
      return;
    }

    // Legacy stream_complete event
    if (data.stream_complete) {
      if (data.credits_consumed !== undefined) {
        useCreditsStore.getState().syncFromHeaders(null, data.credits_consumed, false);
      }
      safeComplete();
      return;
    }

    // Backend-reported error (bare data line)
    if (data.error) {
      callbacks.onError?.(String(data.error));
      return;
    }
  }

  // ----------------------------------------------------------
  // optimizePrompt — POST /api/v2/ai/optimization/  (JSON fallback)
  // ----------------------------------------------------------

  /**
   * Non-streaming JSON fallback.
   * Use when the client cannot process SSE (e.g. server components, tests).
   */
  async optimizePrompt(request: OptimizeStreamRequest): Promise<OptimizeStreamResult> {
    return this.request<OptimizeStreamResult>('/api/v2/ai/optimization/', {
      method: 'POST',
      data: {
        original: request.original,
        session_id: request.session_id ?? `optimize_${Date.now()}`,
        model: request.model ?? 'deepseek-chat',
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
        mode: request.mode ?? 'fast',
        context: request.context,
      },
    });
  }

  // ----------------------------------------------------------
  // deepseekStream — POST /api/v2/chat/completions/
  // ----------------------------------------------------------

  /**
   * Stream a DeepSeek chat completion via SSE.
   * Direct drop-in for any `new WebSocket('wss://…/ws/…')` chat integration.
   *
   * @example
   * await aiService.deepseekStream(
   *   { messages: [{ role: 'user', content: 'Hello!' }] },
   *   {
   *     onToken:          (tok)          => append(tok),
   *     onStreamComplete: (full, data)   => save(full),
   *     onError:          (err)          => toast.error(err),
   *   },
   *   abortController.signal,
   * );
   */
  async deepseekStream(
    request: DeepSeekStreamRequest,
    callbacks: DeepSeekStreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void> {
    const url = `${this.baseUrl}/api/v2/chat/completions/`;
    const body = {
      messages: request.messages,
      model: request.model ?? 'deepseek-chat',
      stream: true,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      session_id: request.session_id,
      optimization_type: request.optimization_type,
    };

    let response: Response;
    try {
      response = await this.fetchSSE(url, body, signal);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      
      // Handle rate limiting
      if (err?.status === 429) {
        const retryAfter = err?.retryAfter ?? 60;
        callbacks.onError?.(`Rate limited. Please try again in ${retryAfter} seconds.`);
        return;
      }
      
      callbacks.onError?.(err?.message ?? 'Network error');
      return;
    }

    if (!response.ok) {
      // Handle 402 Insufficient Credits
      if (response.status === 402) {
        const errData = await response.json().catch(() => ({}));
        callbacks.onError?.(
          `Insufficient credits: need ${(errData as any).credits_required ?? '?'}, ` +
          `have ${(errData as any).credits_available ?? '?'}`
        );
        return;
      }

      const errData = await response.json().catch(() => ({}));
      callbacks.onError?.(
        (errData as any).detail ?? (errData as any).error ?? `HTTP ${response.status}`,
      );
      return;
    }

    // Sync credit headers from response
    this.syncCreditHeadersFromResponse(response);

    let accumulated = '';
    let streamStarted = false;
    let creditsConsumed = 0;
    this.lastSSEEvent = null;

    const onLine = (line: string) => {
      const parsed = this.parseSSELine(line);
      if (!parsed) return;

      // Track event type
      if (parsed.eventType) {
        this.lastSSEEvent = parsed.eventType;
        return;
      }

      if (!parsed.data) return;
      const data = parsed.data;

      if (data.stream_start && !streamStarted) {
        streamStarted = true;
        callbacks.onStreamStart?.(data);
        return;
      }

      // Stream complete — extract credits_consumed
      if (data.stream_complete || this.lastSSEEvent === 'stream_complete') {
        if (data.credits_consumed !== undefined) {
          creditsConsumed = data.credits_consumed;
          useCreditsStore.getState().syncFromHeaders(
            null,
            creditsConsumed,
            false
          );
        }
        callbacks.onStreamComplete?.(accumulated, data);
        this.lastSSEEvent = null;
        return;
      }

      if (data.error) {
        callbacks.onError?.(String(data.error));
        return;
      }

      const delta = data?.choices?.[0]?.delta?.content;
      if (delta) {
        accumulated += delta;
        callbacks.onToken?.(delta);
      }
    };

    try {
      await this.consumeSSEStream(response, onLine, () =>
        callbacks.onStreamComplete?.(accumulated),
      );
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        callbacks.onError?.(err?.message ?? 'Stream error');
      }
    }
  }
}

export const aiService = new AIService();
