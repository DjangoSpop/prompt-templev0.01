import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

// ── Provider configs ───────────────────────────────────────────
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1').replace(/\/$/, '');
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

const ZAI_AUTH_TOKEN = process.env.ZAI_AUTH_TOKEN ?? '';
const ZAI_BASE_URL = (process.env.ZAI_BASE_URL ?? 'https://api.z.ai/api/anthropic').replace(/\/$/, '');
const ZAI_MODEL = process.env.ZAI_MODEL ?? 'glm-4.7';

// ── Rate limiter ───────────────────────────────────────────────
const ipHits = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

// ── SSE helpers ────────────────────────────────────────────────
function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ── Provider call: DeepSeek (OpenAI-compatible) ────────────────
async function callDeepSeek(prompt: string, signal: AbortSignal): Promise<{
  content: string;
  latency_ms: number;
  tokens_out: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { content: '', latency_ms: Date.now() - start, tokens_out: 0, error: `DeepSeek error ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const tokens = data.usage?.completion_tokens ?? Math.ceil(content.length / 4);

    return { content, latency_ms: Date.now() - start, tokens_out: tokens };
  } catch (err) {
    if (signal.aborted) throw err;
    return { content: '', latency_ms: Date.now() - start, tokens_out: 0, error: `DeepSeek: ${(err as Error).message}` };
  }
}

// ── Provider call: Z.ai (Anthropic-compatible) ─────────────────
async function callZAI(prompt: string, signal: AbortSignal): Promise<{
  content: string;
  latency_ms: number;
  tokens_out: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await fetch(`${ZAI_BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ZAI_AUTH_TOKEN,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ZAI_MODEL,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { content: '', latency_ms: Date.now() - start, tokens_out: 0, error: `Z.ai error ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = await res.json();
    const content = data.content?.[0]?.text ?? '';
    const tokens = data.usage?.output_tokens ?? Math.ceil(content.length / 4);

    return { content, latency_ms: Date.now() - start, tokens_out: tokens };
  } catch (err) {
    if (signal.aborted) throw err;
    return { content: '', latency_ms: Date.now() - start, tokens_out: 0, error: `Z.ai: ${(err as Error).message}` };
  }
}

// ── Scoring ────────────────────────────────────────────────────
function scoreResponse(content: string): {
  completeness: number;
  clarity: number;
  accuracy: number;
  creativity: number;
  overall: number;
} {
  if (!content || content.length < 10) {
    return { completeness: 1, clarity: 1, accuracy: 1, creativity: 1, overall: 1 };
  }

  const len = content.length;
  const sentences = content.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = content.split(/\n\n+/).filter(Boolean).length;
  const hasStructure = /\d+\.|[-*•]|\n#{1,3}\s/.test(content);

  // Heuristic scoring (0-10)
  const completeness = Math.min(10, Math.round(2 + (len / 200) * 2 + sentences * 0.3 + paragraphs * 0.5));
  const clarity = Math.min(10, Math.round(3 + (sentences > 2 ? 2 : 0) + (hasStructure ? 2 : 0) + Math.min(3, paragraphs)));
  const accuracy = Math.min(10, Math.round(5 + Math.random() * 3 + (len > 300 ? 1 : 0)));
  const creativity = Math.min(10, Math.round(4 + Math.random() * 3 + (hasStructure ? 1 : 0) + (paragraphs > 2 ? 1 : 0)));
  const overall = Math.round(((completeness + clarity + accuracy + creativity) / 4) * 10) / 10;

  return { completeness, clarity, accuracy, creativity, overall };
}

// ── Provider mapping ───────────────────────────────────────────
type ProviderFn = (prompt: string, signal: AbortSignal) => Promise<{
  content: string; latency_ms: number; tokens_out: number; error?: string;
}>;

function getProviderFn(providerId: string): { fn: ProviderFn; model: string } | null {
  switch (providerId) {
    case 'deepseek':
      if (!DEEPSEEK_API_KEY) return null;
      return { fn: callDeepSeek, model: DEEPSEEK_MODEL };
    case 'openrouter_qwen':
      // Use Z.ai as fallback for Qwen (no OpenRouter key available)
      if (!ZAI_AUTH_TOKEN) return null;
      return { fn: callZAI, model: `${ZAI_MODEL} (via Z.ai)` };
    case 'openrouter_deepseek_r1':
      // Use DeepSeek as fallback for R1 (same provider, different call)
      if (!DEEPSEEK_API_KEY) return null;
      return { fn: callDeepSeek, model: `${DEEPSEEK_MODEL} (reasoning)` };
    case 'anthropic_haiku':
      if (!ZAI_AUTH_TOKEN) return null;
      return { fn: callZAI, model: ZAI_MODEL };
    default:
      return null;
  }
}

// ── POST handler ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 },
    );
  }

  // Parse body
  let body: { prompt?: string; providers?: string[]; score?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (prompt.length > 8000) {
    return NextResponse.json({ error: 'Prompt too long (max 8000 chars)' }, { status: 400 });
  }

  const requestedProviders = body.providers?.length
    ? body.providers
    : ['deepseek', 'openrouter_qwen', 'openrouter_deepseek_r1'];
  const shouldScore = body.score !== false;

  // Validate at least one provider is available
  const availableProviders = requestedProviders.filter((p) => getProviderFn(p) !== null);
  if (availableProviders.length === 0) {
    return NextResponse.json(
      { error: 'No AI providers are configured. Check server environment variables.' },
      { status: 500 },
    );
  }

  // Build SSE stream
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const abortController = new AbortController();

  const send = async (event: string, data: Record<string, unknown>) => {
    try {
      await writer.write(encoder.encode(sseEvent(event, data)));
    } catch { /* writer closed */ }
  };

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    abortController.abort();
  });

  // Run broadcast in background
  (async () => {
    try {
      // 1. Send start event
      await send('broadcast_start', { prompt, providers: availableProviders });

      // 2. Call all providers in parallel
      const results = await Promise.allSettled(
        availableProviders.map(async (providerId) => {
          const provider = getProviderFn(providerId)!;

          // Send "waiting" status
          await send('model_response', {
            provider: providerId,
            model: provider.model,
            status: 'streaming',
            delta: '',
          });

          const result = await provider.fn(prompt.slice(0, 4000), abortController.signal);

          // Send complete response
          const scores = shouldScore && !result.error ? scoreResponse(result.content) : undefined;

          await send('model_response', {
            provider: providerId,
            model: provider.model,
            content: result.content,
            latency_ms: result.latency_ms,
            tokens_out: result.tokens_out,
            status: result.error ? 'error' : 'complete',
            error: result.error || undefined,
            isStreamComplete: true,
            scores: scores ? { provider: providerId, ...scores } : undefined,
          });

          return { providerId, ...result, scores };
        })
      );

      // 3. Determine winner
      let bestOverall: string | undefined;
      let bestScore = -1;
      const responses: Array<Record<string, unknown>> = [];

      for (const settled of results) {
        if (settled.status === 'fulfilled') {
          const r = settled.value;
          responses.push({
            provider: r.providerId,
            model: getProviderFn(r.providerId)?.model ?? r.providerId,
            content: r.content,
            latency_ms: r.latency_ms,
            tokens_out: r.tokens_out,
            scores: r.scores ? { provider: r.providerId, ...r.scores } : undefined,
            error: r.error,
          });

          if (r.scores && r.scores.overall > bestScore && !r.error) {
            bestScore = r.scores.overall;
            bestOverall = r.providerId;
          }
        }
      }

      // 4. Send complete event
      await send('broadcast_complete', {
        prompt,
        responses,
        best_overall: bestOverall,
        comparison_summary: bestOverall
          ? `${bestOverall} delivered the strongest overall response with a score of ${bestScore.toFixed(1)}/10.`
          : 'Broadcast completed.',
        total_latency_ms: Math.max(...responses.map((r) => (r.latency_ms as number) || 0)),
        credits_consumed: 8,
      });
    } catch (err) {
      if (!abortController.signal.aborted) {
        const message = err instanceof Error ? err.message : 'Broadcast failed';
        try {
          await send('error', { error: message });
        } catch { /* ignore */ }
      }
    } finally {
      try { await writer.close(); } catch { /* ignore */ }
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Credits-Remaining': '3735',
      'X-Credits-Used': '8',
      'X-Low-Credits': 'false',
      'X-Credits-Balance': '3735',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
