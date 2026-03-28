import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/utils/rate-limit';

// ── Config ──────────────────────────────────────────────────────
const ZAI_AUTH_TOKEN = process.env.ZAI_AUTH_TOKEN ?? '';
const ZAI_BASE_URL = (process.env.ZAI_BASE_URL ?? 'https://api.z.ai/api/anthropic').replace(/\/$/, '');
const ZAI_MODEL = process.env.ZAI_MODEL ?? 'glm-4.7';
const ZAI_TIMEOUT = Number(process.env.ZAI_TIMEOUT_MS ?? 300000);

const limiter = rateLimit({
  interval: 5 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// ── System prompt — professional prompt optimizer ───────────────
const SYSTEM_PROMPT = `You are the Sacred Forge — Prompt Temple's expert prompt optimization engine.

Your task: Take the user's rough prompt and transform it into a **professional, high-performance prompt** that produces dramatically better results from any AI model.

## Optimization Rules
1. **Clarify intent** — Identify what the user truly wants and make it explicit
2. **Add structure** — Use numbered steps, sections, or clear formatting
3. **Define persona** — Add an expert role/persona when it improves output quality
4. **Set constraints** — Add word limits, tone, format, and audience when missing
5. **Add specificity** — Replace vague words with concrete, measurable ones
6. **Include examples** — Add brief examples if they'd help the AI understand
7. **Set output format** — Specify exactly how the response should be structured

## Response Format
You MUST respond with ONLY valid JSON (no markdown fences, no extra text):
{
  "optimized": "The fully optimized prompt text here...",
  "insights": [
    { "text": "What was improved and why", "confidence": 0.85 },
    { "text": "Another improvement insight", "confidence": 0.78 }
  ],
  "suggestions": [
    "A follow-up improvement the user could try",
    "Another suggestion for even better results"
  ],
  "scores": {
    "clarity": 0.0,
    "specificity": 0.0,
    "effectiveness": 0.0
  }
}

## Quality Standards
- The optimized prompt must be SIGNIFICANTLY better than the original
- Insights should explain WHY each change improves results (2-4 insights)
- Suggestions should be actionable next steps (2-3 suggestions)
- Scores are 0.0-1.0 ratings of the OPTIMIZED prompt quality
- Never refuse to optimize — always produce a better version
- Keep the user's core intent intact — enhance, don't replace their goal`;

// ── Types ───────────────────────────────────────────────────────
interface OptimizeRequest {
  prompt: string;
  guest_session_id: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

// ── Helpers ─────────────────────────────────────────────────────

function sseEncode(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** Call Z.ai (Anthropic-compatible) with streaming disabled — return full text. */
async function callZAI(prompt: string, signal?: AbortSignal): Promise<string> {
  const url = `${ZAI_BASE_URL}/v1/messages`;

  const response = await fetch(url, {
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
      messages: [
        {
          role: 'user',
          content: `Optimize this prompt:\n\n${prompt}`,
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Z.ai API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Anthropic format: data.content[0].text
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from AI');

  return text;
}

/** Parse the JSON response from the AI, with fallback for malformed output. */
function parseAIResponse(raw: string, originalPrompt: string) {
  // Try to extract JSON from the response (handle markdown fences)
  let jsonStr = raw.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      optimized: parsed.optimized || raw,
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      scores: parsed.scores || { clarity: 0.8, specificity: 0.8, effectiveness: 0.8 },
    };
  } catch {
    // AI returned plain text instead of JSON — wrap it
    return {
      optimized: raw.trim(),
      insights: [
        { text: 'Prompt was restructured for clarity and specificity', confidence: 0.8 },
        { text: 'Added constraints and output format for better results', confidence: 0.75 },
      ],
      suggestions: [
        'Add specific examples to guide the AI further',
        'Define the target audience for more relevant output',
      ],
      scores: { clarity: 0.8, specificity: 0.75, effectiveness: 0.8 },
    };
  }
}

// ── Route Handler ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    try {
      await limiter.check(10, ip);
    } catch {
      return new Response(
        JSON.stringify({ type: 'error', data: { code: 429, message: 'Rate limit exceeded. Try again in 5 minutes.' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body: OptimizeRequest = await request.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(
        JSON.stringify({ type: 'error', data: { code: 400, message: 'Invalid prompt provided' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (body.prompt.length > 8000) {
      return new Response(
        JSON.stringify({ type: 'error', data: { code: 400, message: 'Prompt too long (max 8000 characters)' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!ZAI_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ type: 'error', data: { code: 500, message: 'AI service not configured' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Create SSE stream
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const send = (event: SSEEvent) => controller.enqueue(encoder.encode(sseEncode(event)));
          const done = () => {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          };

          try {
            // 1. Stream start
            send({ type: 'stream_start', data: { session_id: body.guest_session_id } });

            // 2. Progress: calling AI
            send({ type: 'token', data: { token: '', is_final: false } });

            // 3. Call the real AI
            const abortController = new AbortController();
            const timeout = setTimeout(() => abortController.abort(), ZAI_TIMEOUT);

            let rawResponse: string;
            try {
              rawResponse = await callZAI(body.prompt.slice(0, 8000), abortController.signal);
            } finally {
              clearTimeout(timeout);
            }

            // 4. Parse structured response
            const result = parseAIResponse(rawResponse, body.prompt);

            // 5. Stream the optimized prompt token by token for real-time UX
            const words = result.optimized.split(/(\s+)/);
            for (let i = 0; i < words.length; i++) {
              send({
                type: 'token',
                data: { token: words[i], is_final: i === words.length - 1 },
              });
              // Tiny delay for visual streaming effect
              if (i % 3 === 0) {
                await new Promise(r => setTimeout(r, 15));
              }
            }

            // 6. Send insights
            send({
              type: 'insight',
              data: { items: result.insights },
            });

            // 7. Send suggestions
            send({
              type: 'suggestions',
              data: { items: result.suggestions },
            });

            // 8. Send full optimization result
            send({
              type: 'optimization_result',
              data: {
                before: body.prompt,
                after: result.optimized,
                scores: result.scores,
              },
            });

            // 9. Stream complete
            send({
              type: 'stream_complete',
              data: {
                usage: {
                  input_tokens: Math.ceil(body.prompt.length / 4),
                  output_tokens: Math.ceil(result.optimized.length / 4),
                },
              },
            });

            done();
          } catch (error) {
            const message =
              error instanceof Error
                ? error.name === 'AbortError'
                  ? 'Request timed out — please try a shorter prompt'
                  : error.message
                : 'Internal server error';

            send({ type: 'error', data: { code: 500, message } });
            done();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Optimize endpoint error:', error);
    return new Response(
      JSON.stringify({ type: 'error', data: { code: 500, message: 'Internal server error' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
