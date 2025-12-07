// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_URL ?? 'http://localhost:8000'; // set in .env

function buildTargetUrl(req: NextRequest, path: string[]) {
  const suffix = path.join('/');                // e.g. "api/v2/core/config"
  const qs = req.nextUrl.searchParams.toString();
  // Preserve trailing slash from the incoming request. Next.js catch-all
  // route parameters (`params.path`) do not include an empty final segment
  // for a trailing slash, so detect it on the original pathname and
  // append it to the proxied target when present. Also, to avoid Django's
  // APPEND_SLASH behavior returning 301 redirects for API endpoints,
  // always ensure API paths end with a trailing slash when proxying.
  const incomingPath = req.nextUrl.pathname || '';
  const hasTrailingSlash = incomingPath.endsWith('/');

  let finalSuffix = suffix;
  // For backend API routes, ensure trailing slash to avoid 301 redirects
  if ((finalSuffix.startsWith('api/') || finalSuffix.startsWith('/api/')) && !finalSuffix.endsWith('/')) {
    finalSuffix = `${finalSuffix}/`;
  } else if (hasTrailingSlash && !finalSuffix.endsWith('/')) {
    finalSuffix = `${finalSuffix}/`;
  }

  // Normalize leading/trailing slashes when building the target
  const normalizedBase = BACKEND_BASE.replace(/\/$/, '');
  finalSuffix = finalSuffix.replace(/^\//, '');

  return `${normalizedBase}/${finalSuffix}${qs ? `?${qs}` : ''}`;
}

const ALLOWED_HEADERS = [
  'authorization', 'content-type', 'x-client-version', 'x-client-name', 'x-request-id', 'x-requested-with',
  'accept', 'accept-language', 'cache-control', 'pragma'
];

export async function OPTIONS(req: NextRequest) {
  // Dynamically allow requested headers to avoid preflight failures
  const origin = req.headers.get('origin') ?? '*';
  const requested = req.headers.get('access-control-request-headers');
  const allowHeaders = requested ? requested : ALLOWED_HEADERS.join(', ');

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD',
      'Access-Control-Allow-Headers': allowHeaders,
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
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
    // Forward useful headers: whitelist plus any `x-` custom headers
    const forwardHeaders = Object.fromEntries(
      [...req.headers].filter(([k]) => {
        const key = k.toLowerCase();
        if (ALLOWED_HEADERS.includes(key)) return true;
        if (key.startsWith('x-')) return true;
        return false;
      })
    );

    const init: RequestInit = {
      method: req.method,
      headers: forwardHeaders,
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
    // Mirror origin from the request to support credentialed requests from the frontend
    const origin = req.headers.get('origin') ?? '*';
    resp.headers.set('Access-Control-Allow-Origin', origin);
    // If the request included an Authorization header, allow credentials
    if (req.headers.get('authorization')) {
      resp.headers.set('Access-Control-Allow-Credentials', 'true');
      resp.headers.set('Vary', 'Origin');
    }
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