import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime (not edge) for full fetch + streaming support
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Pro: up to 60s

// ── Config ──────────────────────────────────────────────────────
const ZAI_AUTH_TOKEN = process.env.ZAI_AUTH_TOKEN ?? '';
const ZAI_BASE_URL = (process.env.ZAI_BASE_URL ?? 'https://api.z.ai/api/anthropic').replace(/\/$/, '');
const ZAI_MODEL = process.env.ZAI_MODEL ?? 'glm-4.7';

// ── Simple in-memory rate limit (resets on cold start, which is fine) ──
const ipHits = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string, limit = 10, windowMs = 300_000): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

// ── System prompt ───────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Sacred Forge — Prompt Temple's expert prompt optimization engine.

Your task: Take the user's rough prompt and transform it into a professional, high-performance prompt that produces dramatically better results from any AI model.

Optimization Rules:
1. Clarify intent — Identify what the user truly wants and make it explicit
2. Add structure — Use numbered steps, sections, or clear formatting
3. Define persona — Add an expert role/persona when it improves output quality
4. Set constraints — Add word limits, tone, format, and audience when missing
5. Add specificity — Replace vague words with concrete, measurable ones
6. Set output format — Specify exactly how the response should be structured

You MUST respond with ONLY valid JSON (no markdown fences, no extra text before or after):
{"optimized":"The fully optimized prompt text...","insights":[{"text":"What was improved and why","confidence":0.85}],"suggestions":["A follow-up improvement"],"scores":{"clarity":0.9,"specificity":0.85,"effectiveness":0.9}}

Rules:
- optimized: the rewritten prompt, significantly better than original
- insights: 2-4 items explaining WHY each change helps (confidence 0-1)
- suggestions: 2-3 actionable next steps
- scores: 0-1 ratings of the OPTIMIZED prompt
- Never refuse. Always produce a better version.
- Keep the user's core intent intact.`;

// ── Helpers ─────────────────────────────────────────────────────

/** Call Z.ai and return parsed result */
async function callZAI(prompt: string): Promise<{
  optimized: string;
  insights: Array<{ text: string; confidence: number }>;
  suggestions: string[];
  scores: { clarity: number; specificity: number; effectiveness: number };
}> {
  const url = `${ZAI_BASE_URL}/v1/messages`;

  console.log('[try-optimize] Calling Z.ai:', { url, model: ZAI_MODEL, promptLen: prompt.length });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ZAI_AUTH_TOKEN,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ZAI_MODEL,
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Optimize this prompt:\n\n${prompt}` }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error('[try-optimize] Z.ai error:', res.status, errBody);
    throw new Error(`AI returned ${res.status}`);
  }

  const data = await res.json();
  const rawText: string = data?.content?.[0]?.text ?? '';

  console.log('[try-optimize] Z.ai responded, length:', rawText.length);

  if (!rawText) throw new Error('Empty AI response');

  // Parse JSON (strip markdown fences if present)
  let jsonStr = rawText.trim();
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      optimized: parsed.optimized || rawText,
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      scores: parsed.scores || { clarity: 0.8, specificity: 0.8, effectiveness: 0.8 },
    };
  } catch {
    // Fallback: AI returned plain text
    return {
      optimized: rawText,
      insights: [
        { text: 'Prompt restructured for clarity and specificity', confidence: 0.8 },
        { text: 'Added constraints for better AI output', confidence: 0.75 },
      ],
      suggestions: ['Add examples to guide the AI', 'Define your target audience'],
      scores: { clarity: 0.8, specificity: 0.75, effectiveness: 0.8 },
    };
  }
}

// ── SSE encoder helper ──────────────────────────────────────────
function sseEvent(type: string, data: Record<string, unknown>): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

// ── POST handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Validate env
  if (!ZAI_AUTH_TOKEN) {
    console.error('[try-optimize] ZAI_AUTH_TOKEN is missing');
    return NextResponse.json(
      { type: 'error', data: { code: 500, message: 'AI service not configured' } },
      { status: 500 },
    );
  }

  // 2. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRate(ip)) {
    return NextResponse.json(
      { type: 'error', data: { code: 429, message: 'Rate limit exceeded. Try again in 5 minutes.' } },
      { status: 429 },
    );
  }

  // 3. Parse body
  let body: { prompt?: string; guest_session_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { type: 'error', data: { code: 400, message: 'Invalid JSON' } },
      { status: 400 },
    );
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const sessionId = body.guest_session_id ?? 'anon';

  if (!prompt) {
    return NextResponse.json(
      { type: 'error', data: { code: 400, message: 'Prompt is required' } },
      { status: 400 },
    );
  }

  if (prompt.length > 8000) {
    return NextResponse.json(
      { type: 'error', data: { code: 400, message: 'Prompt too long (max 8000 chars)' } },
      { status: 400 },
    );
  }

  // 4. Build SSE response using TransformStream (Vercel-compatible)
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = async (type: string, data: Record<string, unknown>) => {
    await writer.write(encoder.encode(sseEvent(type, data)));
  };

  // Run the optimization in the background while streaming
  (async () => {
    try {
      // Stream start
      await send('stream_start', { session_id: sessionId });

      // Call AI
      const result = await callZAI(prompt.slice(0, 8000));

      // Stream optimized text word-by-word
      const words = result.optimized.split(/(\s+)/);
      for (let i = 0; i < words.length; i++) {
        await send('token', { token: words[i], is_final: i === words.length - 1 });
      }

      // Send insights
      await send('insight', { items: result.insights });

      // Send suggestions
      await send('suggestions', { items: result.suggestions });

      // Send full result
      await send('optimization_result', {
        before: prompt,
        after: result.optimized,
        scores: result.scores,
      });

      // Complete
      await send('stream_complete', {
        usage: {
          input_tokens: Math.ceil(prompt.length / 4),
          output_tokens: Math.ceil(result.optimized.length / 4),
        },
      });

      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (error) {
      console.error('[try-optimize] Stream error:', error);
      const msg = error instanceof Error ? error.message : 'Internal server error';
      try {
        await send('error', { code: 500, message: msg });
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch { /* writer may already be closed */ }
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
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
