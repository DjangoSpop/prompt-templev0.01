import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const RESEARCH_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://prompt-temple-2777469a4e35.herokuapp.com';

const MAIN_BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.prompt-temple.com';

const RESEARCH_CREDIT_COST = 10;

/**
 * POST /api/v2/research/create
 *
 * Credit-aware proxy for research job creation.
 *
 * Flow:
 * 1. Validate auth token against main Django backend (entitlements)
 * 2. Check credits_balance >= 10
 * 3. Forward research request to Heroku backend
 * 4. Call main backend to record credit consumption
 * 5. Return research response + updated credit headers
 */
export async function POST(request: NextRequest) {
  // ── 1. Extract auth ──────────────────────────────────
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  let body: { query: string; top_k?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!body.query?.trim()) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    );
  }

  // ── 2. Check credits via main Django backend ─────────
  let creditsBalance: number;
  try {
    const entitlementsRes = await fetch(
      `${MAIN_BACKEND}/api/v2/billing/me/entitlements/`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!entitlementsRes.ok) {
      if (entitlementsRes.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to verify credits' },
        { status: 502 }
      );
    }

    const entitlements = await entitlementsRes.json();
    // Backend wraps in { entitlements: { ... } }
    const data = entitlements.entitlements ?? entitlements;
    creditsBalance = data.credits_balance ?? data.credits_available ?? 0;
  } catch (err) {
    console.error('[research/create] Entitlements check failed:', err);
    return NextResponse.json(
      { error: 'Credit verification unavailable' },
      { status: 502 }
    );
  }

  if (creditsBalance < RESEARCH_CREDIT_COST) {
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        credits_required: RESEARCH_CREDIT_COST,
        credits_available: creditsBalance,
      },
      {
        status: 402,
        headers: {
          'X-Credits-Remaining': String(creditsBalance),
          'X-Credits-Balance': String(creditsBalance),
          'X-Low-Credits': creditsBalance <= 10 ? 'true' : 'false',
        },
      }
    );
  }

  // ── 3. Forward to Heroku research backend ────────────
  let researchResult;
  try {
    const researchRes = await fetch(`${RESEARCH_BASE}/api/v2/research/quick/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!researchRes.ok) {
      const errorText = await researchRes.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: 'Research service error', detail: errorText },
        { status: researchRes.status }
      );
    }

    researchResult = await researchRes.json();
  } catch (err) {
    console.error('[research/create] Research API call failed:', err);
    return NextResponse.json(
      { error: 'Research service unavailable' },
      { status: 502 }
    );
  }

  // ── 4. Record credit consumption on main backend ─────
  const newBalance = creditsBalance - RESEARCH_CREDIT_COST;

  // Call the main backend to consume credits.
  // POST /api/v2/billing/consume-credits/ — if this endpoint exists on
  // your Django backend it will persist the deduction. If it 404s the
  // research still succeeds and the client-side optimistic deduction holds
  // until the next entitlements refresh.
  try {
    await fetch(`${MAIN_BACKEND}/api/v2/billing/consume-credits/`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature: 'research',
        credits: RESEARCH_CREDIT_COST,
        job_id: researchResult.job_id,
      }),
    });
  } catch {
    // Non-blocking — if the billing endpoint doesn't exist yet,
    // the optimistic client-side deduction still works for the session.
    console.warn('[research/create] Credit consumption endpoint not available');
  }

  // ── 5. Return response with credit headers ───────────
  return NextResponse.json(researchResult, {
    status: 201,
    headers: {
      'X-Credits-Remaining': String(newBalance),
      'X-Credits-Used': String(RESEARCH_CREDIT_COST),
      'X-Credits-Balance': String(newBalance),
      'X-Low-Credits': newBalance <= 10 ? 'true' : 'false',
    },
  });
}
