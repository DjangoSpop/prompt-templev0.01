import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';
  const body = await request.text();

  // Proxy to Django SSE endpoint
  const upstream = await fetch(`${API_BASE}/api/v2/ai/optimization/stream/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: authHeader,
      'Cache-Control': 'no-cache',
    },
    body,
  });

  if (!upstream.ok && !upstream.headers.get('content-type')?.includes('event-stream')) {
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pass-through SSE stream
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
    },
  });
}
