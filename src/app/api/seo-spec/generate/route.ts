import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.prompt-temple.com';

interface ProjectInput {
  productName: string;
  productType: string;
  targetAudience: string;
  targetMarket: string;
  primaryLanguage: string;
  mainFeatures: string;
  primaryBusinessGoal: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  competitors: string;
  contentStrategy: string;
  techStack: string;
  specialConstraints: string;
}

/**
 * Map frontend ProjectInput → backend `product` dict expected by
 * SeoSpecRequestSerializer.
 */
function buildProduct(input: ProjectInput): Record<string, string> {
  return {
    product_name: input.productName,
    product_type: input.productType,
    target_audience: input.targetAudience,
    target_market: input.targetMarket,
    primary_language: input.primaryLanguage,
    main_features: input.mainFeatures,
    primary_business_goal: input.primaryBusinessGoal,
    primary_keywords: input.primaryKeywords,
    secondary_keywords: input.secondaryKeywords,
    competitors: input.competitors,
    content_strategy: input.contentStrategy,
    tech_stack: input.techStack,
    special_constraints: input.specialConstraints,
  };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';

  let body: ProjectInput;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.productName?.trim()) {
    return new Response(JSON.stringify({ error: 'Product name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = `seo_spec_${Date.now()}`;

  const upstreamBody = JSON.stringify({
    session_id: sessionId,
    product: buildProduct(body),
    options: {
      tone: 'professional',
      depth: 'comprehensive',
      locale: body.primaryLanguage || 'en-US',
    },
  });

  try {
    const upstream = await fetch(`${API_BASE}/ai/seo-spec/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: authHeader,
        'Cache-Control': 'no-cache',
      },
      body: upstreamBody,
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => 'Unknown error');

      // Forward structured error responses from the backend
      let errorPayload: string;
      try {
        const parsed = JSON.parse(errorText);
        errorPayload = JSON.stringify(parsed);
      } catch {
        errorPayload = JSON.stringify({ error: errorText || `upstream_error_${upstream.status}` });
      }

      return new Response(errorPayload, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'upstream_unavailable', detail: 'Could not reach backend service' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
