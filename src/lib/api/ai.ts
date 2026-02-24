import { BaseApiClient } from './base';

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
    // POST /api/v2/ai/deepseek/stream/ — DeepSeek SSE proxy (the optimization/stream/ path does not exist)
    const url = `${this.baseUrl}/api/v2/ai/deepseek/stream/`;

    const systemPrompt =
      'You are an expert AI prompt engineer. ' +
      'Analyze the user\'s prompt and rewrite it to be clearer, more specific, and more effective for AI models. ' +
      'Respond with ONLY the improved prompt text — no preamble, no explanations, no markdown fences.';

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Optimize this prompt:\n\n${request.original}` },
      ],
      model: request.model ?? 'deepseek-chat',
      stream: true,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      session_id: request.session_id ?? `optimize_${Date.now()}`,
    };

    let response: Response;
    try {
      response = await this.fetchSSE(url, body, signal);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      callbacks.onError?.(err?.message ?? 'Network error');
      return;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      callbacks.onError?.(
        (errData as any).detail ?? (errData as any).error ?? `HTTP ${response.status}`,
      );
      return;
    }

    const onLine = (line: string) =>
      this.handleOptimizationLine(line, callbacks);

    try {
      await this.consumeSSEStream(response, onLine, () =>
        callbacks.onComplete?.(),
      );
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        callbacks.onError?.(err?.message ?? 'Stream error');
      }
    }
  }

  private handleOptimizationLine(
    line: string,
    callbacks: OptimizeStreamCallbacks,
  ): void {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) return; // ignore blank / comments

    // Named events — currently only logged; add special handling if needed
    if (trimmed.startsWith('event: ')) return;

    if (trimmed.startsWith('data: ')) {
      const raw = trimmed.slice(6).trim();
      if (raw === '[DONE]') {
        callbacks.onComplete?.();
        return;
      }
      try {
        const parsed = JSON.parse(raw);

        // Progress heartbeat: { step, message }
        if (parsed.step && parsed.message) {
          callbacks.onProgress?.(String(parsed.step), String(parsed.message));
          return;
        }

        // Template opportunity sidecar
        if (parsed.template_opportunity) {
          // Surface inside result so caller can handle it
          callbacks.onResult?.({ optimized: '', template_opportunity: parsed.template_opportunity });
          return;
        }

        // Full optimisation result
        if (parsed.optimized) {
          callbacks.onResult?.(parsed as OptimizeStreamResult);
          return;
        }

        // OpenAI-compatible streaming token
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          callbacks.onToken?.(delta);
          return;
        }

        // Stream complete signal from backend
        if (parsed.stream_complete) {
          callbacks.onComplete?.();
          return;
        }

        // Backend-reported error
        if (parsed.error) {
          callbacks.onError?.(String(parsed.error));
        }
      } catch {
        // Non-JSON SSE data — silently ignore
      }
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
      callbacks.onError?.(err?.message ?? 'Network error');
      return;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      callbacks.onError?.(
        (errData as any).detail ?? (errData as any).error ?? `HTTP ${response.status}`,
      );
      return;
    }

    let accumulated = '';
    let streamStarted = false;

    const onLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) return;
      if (trimmed.startsWith('event: ')) return;

      if (trimmed.startsWith('data: ')) {
        const raw = trimmed.slice(6).trim();
        if (raw === '[DONE]') {
          callbacks.onStreamComplete?.(accumulated);
          return;
        }
        try {
          const parsed = JSON.parse(raw);

          if (parsed.stream_start && !streamStarted) {
            streamStarted = true;
            callbacks.onStreamStart?.(parsed);
            return;
          }

          if (parsed.stream_complete) {
            callbacks.onStreamComplete?.(accumulated, parsed);
            return;
          }

          if (parsed.error) {
            callbacks.onError?.(String(parsed.error));
            return;
          }

          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            callbacks.onToken?.(delta);
          }
        } catch {
          // ignore
        }
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
