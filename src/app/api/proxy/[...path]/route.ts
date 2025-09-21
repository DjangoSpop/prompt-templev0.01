// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_URL ?? 'http://localhost:8000'; // set in .env

function buildTargetUrl(req: NextRequest, path: string[]) {
  const suffix = path.join('/');                // e.g. "api/v2/core/config"
  const qs = req.nextUrl.searchParams.toString();

  // Preserve trailing slash from the incoming request. Next.js catch-all
  // route parameters (`params.path`) do not include an empty final segment
  // for a trailing slash, so detect it on the original pathname and
  // append it to the proxied target when present. This prevents Django's
  // APPEND_SLASH behavior from rejecting POSTs that need a trailing slash.
  const incomingPath = req.nextUrl.pathname || '';
  const hasTrailingSlash = incomingPath.endsWith('/');

  return `${BACKEND_BASE}/${suffix}${hasTrailingSlash ? '/' : ''}${qs ? `?${qs}` : ''}`;
}

const ALLOWED_HEADERS = [
  'authorization', 'content-type', 'x-client-version', 'x-request-id', 'x-requested-with',
  'accept', 'accept-language', 'cache-control', 'pragma'
];

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',               // or specific origin in prod
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': '86400'
    }
  });
}

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = buildTargetUrl(req, path);
  // Log the target for debugging (visible in Next.js server output)
  console.log(`[proxy] ${req.method} -> ${target}`);

  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const init: RequestInit = {
      method: req.method,
      headers: Object.fromEntries(
        [...req.headers].filter(([k]) => ALLOWED_HEADERS.includes(k.toLowerCase()))
      ),
      // Important for POST/PUT/PATCH
      body: ['GET','HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: 'manual',
      signal: controller.signal, // Add timeout signal
    };

    const res = await fetch(target, init);
    clearTimeout(timeoutId);
    
    const blob = await res.blob();

    // Mirror status and headers (whitelist)
    const resp = new NextResponse(blob, { status: res.status });
    resp.headers.set('Content-Type', res.headers.get('Content-Type') ?? 'application/json');
    resp.headers.set('Access-Control-Allow-Origin', '*'); // match OPTIONS
    return resp;
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err instanceof Error ? err : new Error(String(err));

    // Handle timeout or other errors
  if ((error as Error).name === 'AbortError') {
      return new NextResponse(
        JSON.stringify({ error: 'Request timeout', message: 'The backend request timed out' }),
        { 
          status: 504,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Proxy request failed', message: error.message || 'Unknown error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;