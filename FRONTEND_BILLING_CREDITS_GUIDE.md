# Frontend Billing & Credits Integration Guide
## Prompt Temple — Next.js Presentation Layer

**API Base:** `https://api.prompt-temple.com/api/v2`  
**Auth:** `Authorization: Bearer <access_token>` on all authenticated endpoints  
**Test Stripe keys active** — use card `4242 4242 4242 4242`, any future date, any CVC

---

## 1. Architecture Overview

```
Next.js Frontend
     │
     ├── /billing/plans        → GET /api/v2/billing/plans/
     ├── /billing/upgrade      → POST /api/v2/billing/checkout-session/{PRO|POWER}/
     ├── /billing/portal       → POST /api/v2/billing/portal/
     ├── /billing/success      → GET /api/v2/billing/me/subscription/
     │
     ├── Any AI feature call   → checks entitlements first
     │                           GET /api/v2/billing/me/entitlements/
     │
     └── Usage dashboard       → GET /api/v2/billing/me/usage/
                                  GET /api/v2/ai/usage/
```

### Credit lifecycle

```
User upgrades (PRO/POWER)
     │
     ▼
Stripe Checkout → payment succeeds
     │
     ▼ (webhook: checkout.session.completed)
Backend: subscription status = "active"
         credits_balance = plan.monthly_credits (1000 or 4000)
     │
     ▼
User uses AI feature (stream/generate/optimize…)
     Backend: reserve credits → run AI → settle credits
     │
     ▼ (webhook: invoice.paid — every month)
Backend: credits_balance reset to plan.monthly_credits
```

---

## 2. Plan Data

### GET `/api/v2/billing/plans/`
Public — no auth required.

#### Response
```json
{
  "plans": [
    {
      "id": "uuid",
      "plan_code": "FREE",
      "name": "Free",
      "price": "0.00",
      "currency": "USD",
      "billing_interval": "monthly",
      "monthly_credits": 20,
      "max_requests_per_hour": 10,
      "max_requests_per_day": 30,
      "max_input_tokens": 2048,
      "max_output_tokens": 500,
      "allowed_models": ["deepseek-chat"],
      "daily_template_limit": 5,
      "daily_copy_limit": 3,
      "premium_templates_access": false,
      "ads_free": false,
      "priority_support": false,
      "analytics_access": false,
      "api_access": false,
      "collaboration_features": false,
      "stripe_price_id": "",
      "is_popular": false,
      "features_list": ["20 AI credits/month", "5 templates/day", ...]
    },
    {
      "plan_code": "PRO",
      "name": "Prompt Temple Pro",
      "price": "13.99",
      "monthly_credits": 1000,
      "stripe_price_id": "price_1T83HKL9S3eDLXqLjz4CRt2q",
      "is_popular": true,
      ...
    },
    {
      "plan_code": "POWER",
      "name": "Prompt Temple Power",
      "price": "39.00",
      "monthly_credits": 4000,
      "stripe_price_id": "price_1T83JTL9S3eDLXqLHYPBYD8D",
      ...
    }
  ]
}
```

#### Usage in Next.js
```ts
// lib/api/billing.ts
export async function getPlans() {
  const res = await fetch(`${API_BASE}/billing/plans/`, { next: { revalidate: 3600 } });
  return res.json(); // cache for 1 hour — plans rarely change
}
```

---

## 3. User Subscription State

### GET `/api/v2/billing/me/subscription/`
**Auth required.**

Returns full subscription including credit balance.

#### Response
```json
{
  "subscription": {
    "id": "uuid",
    "status": "active",             // active | pending | cancelled | expired | past_due
    "is_active": true,
    "is_premium": true,             // true if PRO or POWER
    "plan": { ...full plan object },
    "credits_balance": 980,
    "credits_reserved": 20,
    "credits_available": 960,       // balance - reserved
    "credits_refilled_at": "2026-03-01T00:00:00Z",
    "current_period_start": "2026-03-01T00:00:00Z",
    "current_period_end": "2026-04-01T00:00:00Z",
    "next_billing_date": "2026-04-01T00:00:00Z",
    "days_remaining": 26,
    "auto_renew": true,
    "stripe_customer_id": "cus_xxx"
  }
}
```

> **Note:** `status = "pending"` means checkout was initiated but payment not confirmed yet. Show a "Complete payment" banner, not the upgraded UI.

---

## 4. Entitlements — The Key Object for UI Gating

### GET `/api/v2/billing/me/entitlements/`
**Auth required.** This is the single source of truth for what the user can do.  
**Cache client-side for 60 seconds max** — changes after payment via webhook.

#### Response
```json
{
  "entitlements": {
    "plan_code": "PRO",
    "plan_name": "Prompt Temple Pro",
    "credits_balance": 980,
    "credits_available": 960,
    "monthly_credits": 1000,
    "max_requests_per_hour": 60,
    "max_requests_per_day": 500,
    "max_input_tokens": 8192,
    "max_output_tokens": 2000,
    "allowed_models": ["deepseek-chat", "gpt-4o-mini"],
    "daily_template_limit": 100,
    "daily_copy_limit": 50,
    "premium_templates": true,
    "ads_free": true,
    "priority_support": false,
    "analytics": true,
    "api_access": true,
    "collaboration": false,
    "streaming_enabled": true
  }
}
```

#### React hook
```ts
// hooks/useEntitlements.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';

export function useEntitlements() {
  const { data, error, mutate } = useSWR(
    '/api/v2/billing/me/entitlements/',
    fetcher,
    { refreshInterval: 60_000 }  // re-check every 60s
  );
  return {
    entitlements: data?.entitlements,
    isPremium: ['PRO', 'POWER'].includes(data?.entitlements?.plan_code),
    isLoading: !data && !error,
    refresh: mutate,
  };
}
```

#### UI gating pattern
```tsx
function AIGenerateButton({ feature }: { feature: string }) {
  const { entitlements, isPremium } = useEntitlements();

  if (!entitlements) return <Skeleton />;

  if (entitlements.credits_available === 0) {
    return (
      <UpgradePrompt
        message="You've used all your credits for this month"
        planCode={entitlements.plan_code}
      />
    );
  }

  if (!isPremium && feature === 'optimization') {
    return <UpgradePrompt message="Prompt optimization requires Pro or Power" />;
  }

  return <Button onClick={runFeature}>Generate</Button>;
}
```

---

## 5. Checkout Flow

### Step A — POST `/api/v2/billing/checkout-session/{plan_code}/`
**Auth required.**  
`plan_code` must be `PRO` or `POWER` (case-insensitive).

#### Request body (optional)
```json
{
  "success_url": "https://www.prompt-temple.com/billing/success",
  "cancel_url":  "https://www.prompt-temple.com/billing/cancel"
}
```

If omitted, backend defaults to `FRONTEND_URL/billing/success?session_id={CHECKOUT_SESSION_ID}`.

#### Response `200`
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "plan_code": "PRO",
  "plan_name": "Prompt Temple Pro"
}
```

#### Error responses
| Code | `error` field | Meaning |
|------|--------------|---------|
| `400` | `plan_code must be 'PRO' or 'POWER'` | Invalid plan |
| `503` | `stripe_price_id_missing` | Price not yet configured in DB |
| `503` | `payment_not_configured` | `STRIPE_SECRET_KEY` missing |
| `502` | `stripe_error` | Stripe API error |

#### Next.js implementation
```ts
// app/billing/upgrade/page.tsx
async function startCheckout(planCode: 'PRO' | 'POWER') {
  const res = await fetch(`${API_BASE}/billing/checkout-session/${planCode}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      success_url: `${SITE_URL}/billing/success`,
      cancel_url:  `${SITE_URL}/billing/cancel`,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.error);
  }

  const { checkout_url } = await res.json();
  window.location.href = checkout_url; // Redirect to Stripe Checkout
}
```

### Step B — Success page
After Stripe redirects back to `/billing/success`, **refetch entitlements** — the webhook may take 1-2 seconds to fire.

```tsx
// app/billing/success/page.tsx
'use client';
import { useEffect } from 'react';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useRouter } from 'next/navigation';

export default function BillingSuccess() {
  const { entitlements, refresh } = useEntitlements();
  const router = useRouter();

  useEffect(() => {
    // Poll until plan is activated (webhook may have small delay)
    const interval = setInterval(async () => {
      await refresh();
      if (entitlements?.plan_code !== 'FREE') {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (entitlements?.plan_code === 'FREE') {
    return (
      <div>
        <Spinner />
        <p>Activating your plan… (usually takes 2-3 seconds)</p>
      </div>
    );
  }

  return (
    <div>
      <h1>🎉 Welcome to {entitlements?.plan_name}!</h1>
      <p>You have {entitlements?.credits_balance} credits ready to use.</p>
      <Button onClick={() => router.push('/dashboard')}>Start creating</Button>
    </div>
  );
}
```

---

## 6. Stripe Billing Portal (Manage / Cancel)

### POST `/api/v2/billing/portal/`
**Auth required.** Opens Stripe's hosted portal for managing/cancelling subscription.

#### Request body (optional)
```json
{ "return_url": "https://www.prompt-temple.com/billing" }
```

#### Response `200`
```json
{ "portal_url": "https://billing.stripe.com/p/session/..." }
```

```ts
async function openPortal() {
  const res = await fetch(`${API_BASE}/billing/portal/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const { portal_url } = await res.json();
  window.location.href = portal_url;
}
```

---

## 7. Credits Usage Dashboard

### GET `/api/v2/billing/me/usage/`
**Auth required.** Credits consumed this billing period by feature.

#### Response
```json
{
  "usage": {
    "period_start": "2026-03-01",
    "credits_consumed_this_period": 40,
    "credits_remaining": 960,
    "by_feature": [
      { "feature": "optimizer",       "total_credits": 25, "total_tokens_out": 1200, "call_count": 5 },
      { "feature": "deepseek_stream", "total_credits": 10, "total_tokens_out": 800,  "call_count": 2 },
      { "feature": "seo_spec",        "total_credits": 5,  "total_tokens_out": 300,  "call_count": 1 }
    ]
  }
}
```

### GET `/api/v2/ai/usage/`
Same data but sourced from the AI services app. Use either; both are equivalent.

---

## 8. Credits per AI Feature

| Feature | Endpoint | Credit cost | Plan required |
|---------|----------|-------------|---------------|
| DeepSeek stream chat | `POST /api/v2/ai/deepseek/stream/` | ~5 credits | FREE+ |
| Prompt optimization | `POST /api/v2/ai/optimization/` | ~5 credits | FREE+ |
| Prompt optimization (stream) | `POST /api/v2/ai/optimization/stream/` | ~5 credits | FREE+ |
| SEO spec generator | `POST /api/v2/ai/seo-spec/stream/` | 10 credits | FREE+ |
| Assistant run | `POST /api/v2/ai/assistant/run/` | varies | FREE+ |
| AI generate | `POST /api/v2/ai/generate/` | varies | FREE+ |

> Credits are **reserved** at request start and **settled** on completion. If the request fails, credits are **fully refunded**. The `credits_available` field (balance minus reserved) is what to show users.

### Credit cost display component
```tsx
function CreditBadge({ cost }: { cost: number }) {
  const { entitlements } = useEntitlements();
  const enough = (entitlements?.credits_available ?? 0) >= cost;

  return (
    <span className={enough ? 'text-green-600' : 'text-red-500'}>
      {cost} credit{cost !== 1 ? 's' : ''}
      {!enough && ' — upgrade to continue'}
    </span>
  );
}
```

---

## 9. Credit Exhaustion — Upgrade Prompt

Show this when `credits_available === 0` or an AI endpoint returns `402`:

```tsx
// components/billing/UpgradePrompt.tsx
export function UpgradePrompt({ planCode }: { planCode: string }) {
  const isOnPro = planCode === 'PRO';

  return (
    <div className="rounded-lg border border-amber-400 bg-amber-50 p-4">
      <h3 className="font-semibold">Credits exhausted</h3>
      <p className="text-sm text-gray-600 mt-1">
        {isOnPro
          ? 'Upgrade to Power for 4,000 credits/month'
          : 'Upgrade to Pro for 1,000 credits/month at $13.99'}
      </p>
      <Button
        variant="primary"
        onClick={() => startCheckout(isOnPro ? 'POWER' : 'PRO')}
        className="mt-3"
      >
        {isOnPro ? 'Upgrade to Power — $39/mo' : 'Upgrade to Pro — $13.99/mo'}
      </Button>
    </div>
  );
}
```

---

## 10. Plan Comparison Table Component

```tsx
// components/billing/PlanTable.tsx
const PLAN_HIGHLIGHTS = {
  FREE:  { color: 'gray',   cta: null,      price: '$0',      credits: '20/mo' },
  PRO:   { color: 'blue',   cta: 'PRO',     price: '$13.99',  credits: '1,000/mo' },
  POWER: { color: 'purple', cta: 'POWER',   price: '$39.00',  credits: '4,000/mo' },
};

export function PlanTable() {
  const { data } = useSWR('/api/v2/billing/plans/', fetcher);
  const { entitlements } = useEntitlements();

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.plans.map((plan) => {
        const hl = PLAN_HIGHLIGHTS[plan.plan_code];
        const isCurrent = entitlements?.plan_code === plan.plan_code;

        return (
          <div key={plan.plan_code}
            className={`rounded-xl p-6 border-2 ${plan.is_popular ? 'border-blue-500' : 'border-gray-200'}`}>
            {plan.is_popular && <span className="badge">Most Popular</span>}

            <h2>{plan.name}</h2>
            <p className="text-3xl font-bold">{hl.price}<span className="text-sm">/mo</span></p>
            <p className="text-sm text-gray-500">{hl.credits} AI credits</p>

            <ul className="mt-4 space-y-2 text-sm">
              {plan.features_list.map(f => <li key={f}>✓ {f}</li>)}
            </ul>

            {isCurrent ? (
              <Button variant="outline" className="mt-6 w-full" onClick={openPortal}>
                Manage plan
              </Button>
            ) : hl.cta ? (
              <Button variant="primary" className="mt-6 w-full"
                onClick={() => startCheckout(hl.cta as 'PRO' | 'POWER')}>
                Get {plan.name}
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 11. Subscription Status Banner

Show at top of dashboard when subscription needs attention:

```tsx
function SubscriptionBanner() {
  const { data } = useSWR('/api/v2/billing/me/subscription/', fetcher);
  const sub = data?.subscription;

  if (!sub || sub.status === 'active') return null;

  const messages = {
    pending:  { type: 'warning', text: 'Payment pending — complete your checkout to activate your plan.' },
    past_due: { type: 'error',   text: 'Payment failed — update your payment method to keep access.' },
    cancelled:{ type: 'info',    text: 'Your subscription has been cancelled. Upgrade to regain access.' },
    expired:  { type: 'info',    text: 'Your subscription has expired.' },
  };

  const msg = messages[sub.status];
  if (!msg) return null;

  return (
    <Alert type={msg.type}>
      {msg.text}
      {sub.status === 'past_due' && (
        <Button onClick={openPortal} size="sm" className="ml-4">Update payment</Button>
      )}
    </Alert>
  );
}
```

---

## 12. Webhook Events (backend handles — frontend just re-fetches)

| Stripe event | Backend action | Frontend should |
|---|---|---|
| `checkout.session.completed` | Sets status=`active`, refills credits | Poll `/me/entitlements/` on success page |
| `invoice.paid` | Refills credits to `monthly_credits` | Show "Credits refilled" toast if balance changed |
| `invoice.payment_failed` | — (status stays active briefly) | Portal banner if `past_due` |
| `customer.subscription.updated` | Syncs `status` field | Re-fetch subscription on portal return |
| `customer.subscription.deleted` | Downgrades to FREE | Re-fetch after portal session ends |

---

## 13. Environment Variables for Next.js

```env
# .env.local
NEXT_PUBLIC_API_BASE=https://api.prompt-temple.com/api/v2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51T7z8ZL9S3eDLXqLQXzEFn85n5A3DJYZECyTSCe0Hsbp4Rt4QgTOVZc5LmCB7szDd2wjOIxTaKcp1751OVS5ayop00CUy2FqCM
NEXT_PUBLIC_SITE_URL=https://www.prompt-temple.com
```

> The backend handles all Stripe server-side calls. You do **not** need `stripe` npm package on the frontend — just redirect to `checkout_url`.

---

## 14. Quick Reference — All Billing Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/billing/plans/` | No | List all plans with prices |
| GET  | `/billing/plans/<uuid>/` | No | Single plan detail |
| GET  | `/billing/me/subscription/` | Yes | Current user subscription + credit balance |
| GET  | `/billing/me/entitlements/` | Yes | All capability limits (use this for gating) |
| GET  | `/billing/me/usage/` | Yes | Credits consumed this billing period |
| POST | `/billing/checkout-session/PRO/` | Yes | Create Stripe Checkout for Pro |
| POST | `/billing/checkout-session/POWER/` | Yes | Create Stripe Checkout for Power |
| POST | `/billing/checkout/` | Yes | Generic checkout (body: `plan_id` or `plan_code`) |
| POST | `/billing/portal/` | Yes | Open Stripe Billing Portal |
| POST | `/billing/webhooks/stripe/` | No (Stripe sig) | Stripe webhook receiver |
