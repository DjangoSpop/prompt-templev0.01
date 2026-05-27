# PromptGuard Dashboard — Implementation Plan (Parallel Agent Task)

> **For:** the second coding agent working on `promptcord/` in parallel
> **While:** the primary agent (this thread) ships backend Stories 3.A + 3.B in `apps/promptguard/`
> **Goal:** A production-ready dashboard at `www.prompt-temple.com/promptguard/`
> **Scope:** Frontend only — zero edits outside `promptcord/src/app/promptguard/**`
> **Stack:** Existing Next.js app-router project (`promptcord/`)

---

## 0. Read this in full before writing any code

You are working **autonomously** inside the `promptcord/` Next.js
repository at `c:\Users\ahmed el bahi\MyPromptApp\prompt_temple\promptcord\`.

Your single deliverable: a polished, mobile-responsive PromptGuard dashboard
route at `/promptguard/`, ready for production deploy to
`www.prompt-temple.com/promptguard/`.

**Hard constraints — DO NOT VIOLATE:**

- Edit files **only** under `promptcord/src/app/promptguard/**` (one exception: you may add `NEXT_PUBLIC_PROMPTGUARD_API_BASE` to `.env.local` and `.env.example`)
- DO NOT modify any existing route, layout, or component outside this directory
- DO NOT add new top-level dependencies — use what's already in `package.json`
- DO NOT touch `apps/promptguard/**` (that's the primary agent's territory; you'd cause merge conflicts)
- DO NOT change `next.config.js`, `tsconfig.json`, `tailwind.config.*`, or any root-level config

If you find yourself wanting to modify anything outside the allowed paths, **stop and write a `QUESTION:` line in your sprint log** rather than proceeding.

---

## 1. Pre-flight discovery (15 min budget)

Before writing any code, answer these questions by reading the existing
codebase. Record findings in `promptcord/src/app/promptguard/DISCOVERY.md`.

### Q1.1 — What styling system does promptcord use?

```bash
# Look for Tailwind
test -f tailwind.config.ts || test -f tailwind.config.js && echo "TAILWIND" || echo "NO_TAILWIND"

# Look for CSS modules
find src -name "*.module.css" -type f 2>/dev/null | head -3

# Look for styled-components or emotion
grep -E "styled-components|@emotion" package.json | head -3
```

Record the answer. **If Tailwind: use Tailwind utility classes throughout.
If CSS Modules: use those. If neither: use inline styles with a single CSS file at the route root.**

### Q1.2 — Is there a UI component library?

```bash
grep -E "shadcn|radix|chakra|mui|nextui|mantine" package.json
ls -la src/components 2>/dev/null | head -10
```

If shadcn/ui exists, reuse its `Button`, `Card`, `Badge` components rather
than building from scratch. If not, you'll build minimal native components.

### Q1.3 — Which route group should `/promptguard/` live in?

The status snapshot identified three route groups: `(shell)`, `(dashboard)`, `(app)`.
Read the `layout.tsx` in each to see what each provides (auth? nav? theming?).

```bash
ls -la src/app/
cat src/app/\(shell\)/layout.tsx 2>/dev/null | head -30
cat src/app/\(dashboard\)/layout.tsx 2>/dev/null | head -30
cat src/app/\(app\)/layout.tsx 2>/dev/null | head -30
```

**Rule of thumb:**
- If `(dashboard)` has auth + nav: place the route there. Path becomes `/promptguard/`
- If only `(shell)` has the right layout: place there
- If none feel right: place at `src/app/promptguard/page.tsx` with no route group (root-level)

Document your choice in `DISCOVERY.md`. **Do not skip this step** — putting the route in the wrong group means the page lacks the chrome (header, auth, nav) judges expect to see.

### Q1.4 — What's the existing color palette / design token system?

```bash
# Look for design tokens in CSS variables
grep -rn "\-\-color\|\-\-bg\|\-\-text" src/app/globals.css 2>/dev/null | head -10
# Tailwind theme extensions
grep -A 30 "theme" tailwind.config.* 2>/dev/null | head -40
```

If existing tokens match the Pharaonic palette (cream / gold / dark navy), reuse them.
If not, **add a single CSS file** at `src/app/promptguard/promptguard.css` with the tokens defined locally — do NOT modify global tokens.

### Q1.5 — Where's the API base URL set, and what auth (if any)?

```bash
grep -rn "api.prompt-temple.com\|API_BASE\|NEXT_PUBLIC.*API" src/ 2>/dev/null | head -10
grep -rn "fetch\|axios" src/lib/ 2>/dev/null | head -5
```

Document the existing pattern. **The dashboard will follow it exactly** — no
new HTTP client conventions, no new auth shapes.

### Discovery deliverable

Create `promptcord/src/app/promptguard/DISCOVERY.md` with:

```markdown
# Promptcord Discovery (Dashboard Pre-flight)

## Styling
- System: <TAILWIND | CSS_MODULES | INLINE>
- Reasoning: ...

## UI library
- Available: <yes / no / which one>
- Decision: <reuse / build minimal>

## Route placement
- Chosen path: `src/app/<group>/promptguard/page.tsx`
- Reasoning: ...

## Design tokens
- Existing tokens reusable: <yes / no>
- New local tokens needed: <yes / no>

## API client convention
- Base URL config: <env var name>
- Auth shape: <none / Bearer / cookie / other>
- HTTP client: <native fetch / axios / custom>

## Decisions for the implementation that follow from above
- ...
```

**HALT if any pre-flight reveals a major incompatibility** (e.g., promptcord uses Pages router not app-router; or it's a Vite app not Next.js). Write the issue in DISCOVERY.md and stop.

---

## 2. Architecture decisions (locked — apply as written)

These are not preferences. They are constraints that make the parallel work
match the backend API contract and ship within budget.

**AD-1: Single page, four panels, no client-side routing inside.**
The dashboard is one page. Modals or side panels are acceptable for proposal
detail viewing, but no nested routes.

**AD-2: Polling, not SSE.**
Refetch `/dashboard-state` every 2 seconds. SSE would be nicer but it's a
Sprint 4 polish item. Polling is simpler, more reliable, and totally fine
for judges watching a video.

**AD-3: Mock-first development.**
The backend endpoints (`/dashboard-state`, `/proposals/{id}/full`, etc.)
**do not exist yet** — they're being built in parallel. Build against
TypeScript-typed mocks in `src/app/promptguard/lib/mocks.ts`, with a
single env-var flag to swap to live API. This keeps you unblocked.

**AD-4: No client-side caching libraries.**
Don't add SWR, TanStack Query, or anything similar. A bare `useEffect` +
`setInterval` polling hook is sufficient and avoids dep additions.

**AD-5: Pharaonic palette (locked tokens).**
```
--bg:             #0a1426    /* dark navy background */
--card:           #102338    /* card surface */
--card-elevated:  #15314f    /* hover/active state */
--text:           #f3e8c2    /* cream body text */
--text-muted:     #b8a575    /* secondary text */
--accent:         #d4a64a    /* gold accent */
--accent-soft:    #8a6e2f    /* darker gold for borders */
--success:        #5d9b6a    /* score lift, approval */
--danger:         #c05050    /* score drop, regression */
--warn:           #d4a64a    /* awaiting approval */
--border:         rgba(212, 166, 74, 0.18)
```

Use these tokens exactly. Apply via CSS variables on the root of the dashboard route.

**AD-6: No auth on the route for the hackathon demo.**
The dashboard is publicly viewable. Judges will click the URL from Devpost.
Adding auth costs time and adds demo failure modes (login prompts during
recording). Sprint 4 can add auth.

**AD-7: The dashboard speaks to the API at `https://api.prompt-temple.com/api/promptguard/`.**
This is the production backend, separate host from `www.prompt-temple.com`.
CORS must allow this — verify with a test fetch before proceeding past Step 3.

---

## 3. File structure (build in this order)

```
src/app/promptguard/                  ← create this directory
├── DISCOVERY.md                       ← Step 1 deliverable
├── promptguard.css                    ← Step 4: tokens (if not using existing)
├── page.tsx                           ← Step 8: main page
├── layout.tsx                         ← Step 4: route-local layout (header)
├── lib/
│   ├── api.ts                         ← Step 5: typed fetch wrappers
│   ├── mocks.ts                       ← Step 5: mock responses for parallel dev
│   ├── types.ts                       ← Step 5: TypeScript types (API contracts)
│   └── usePolling.ts                  ← Step 6: polling hook
└── components/
    ├── ActiveVersionCard.tsx          ← Step 7a
    ├── EvalScoreCard.tsx              ← Step 7b
    ├── ActivityStream.tsx             ← Step 7c
    ├── PendingProposalCard.tsx        ← Step 7d
    ├── ProposalDetailModal.tsx        ← Step 7e
    ├── PromptDiff.tsx                 ← Step 7f
    └── EmptyState.tsx                 ← Step 7g
```

Build top-down: types → mocks → API client → polling hook → components → page.

---

## 4. Types & API contracts (locked — DO NOT CHANGE)

These TypeScript types are the contract with the backend. The primary agent
(in this thread) is building backend endpoints to match these shapes
exactly. Use them verbatim.

**`src/app/promptguard/lib/types.ts`:**

```typescript
/**
 * PromptGuard API types.
 *
 * IMPORTANT: These are the CONTRACT with the Django backend.
 * Do not change shapes without coordinating with the backend agent.
 */

export type ActiveVersion = {
  id: string;
  version: number;
  label: string;
  activated_at: string | null;  // ISO-8601
  prompt_keys: string[];        // e.g. ["general","technical","creative","business"]
};

export type EvalSummary = {
  overall_score: number;        // typically 0-5
  per_type_scores: Record<string, number>;
  sample_size: number;
  evaluated_at: string;
};

export type IncidentSummary = {
  id: string;
  status: string;               // "open" | "diagnosing" | "evaluating" | "resolved" | ...
  diagnosis: Record<string, unknown>;
  created_at: string;
};

export type PendingProposal = {
  id: string;
  score_delta: number | null;
  baseline_score: number | null;
  candidate_score: number | null;
  rationale_preview: string;
  created_at: string;
};

export type DashboardState = {
  active_version: ActiveVersion | null;
  latest_eval: EvalSummary | null;
  recent_incidents: IncidentSummary[];
  pending_proposals: PendingProposal[];
};

export type ProposalFull = {
  id: string;
  status: string;
  rationale: string;
  baseline_score: number | null;
  candidate_score: number | null;
  score_delta: number | null;
  candidate_system_prompts: Record<string, string>;
  candidate_rag_suffixes: Record<string, string>;
  current_active: {
    version: number;
    label: string;
    system_prompts: Record<string, string>;
    rag_suffixes: Record<string, string>;
  } | null;
  created_at: string;
};

export type ApprovalResponse = {
  ok: boolean;
  new_version: number;
  version_id: string;
};
```

---

## 5. API client + mock data

**`src/app/promptguard/lib/api.ts`:**

```typescript
import type {
  DashboardState,
  ProposalFull,
  ApprovalResponse,
} from './types';
import { MOCK_DASHBOARD_STATE, MOCK_PROPOSAL_FULL } from './mocks';

const API_BASE =
  process.env.NEXT_PUBLIC_PROMPTGUARD_API_BASE ??
  'https://api.prompt-temple.com/api/promptguard';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS === 'true';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PromptGuard API ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function getDashboardState(): Promise<DashboardState> {
  if (USE_MOCKS) return Promise.resolve(MOCK_DASHBOARD_STATE);
  return fetchJson<DashboardState>('/dashboard-state');
}

export async function getProposalFull(id: string): Promise<ProposalFull> {
  if (USE_MOCKS) return Promise.resolve(MOCK_PROPOSAL_FULL);
  return fetchJson<ProposalFull>(`/proposals/${id}/full`);
}

export async function approveProposal(
  id: string,
  approver: string = 'demo-user'
): Promise<ApprovalResponse> {
  if (USE_MOCKS) {
    return Promise.resolve({ ok: true, new_version: 3, version_id: 'mock-v3' });
  }
  return fetchJson<ApprovalResponse>(
    `/proposals/${id}/approve?approver=${encodeURIComponent(approver)}`,
    { method: 'POST' }
  );
}

export async function rejectProposal(
  id: string,
  reason: string = ''
): Promise<{ ok: boolean }> {
  if (USE_MOCKS) return Promise.resolve({ ok: true });
  return fetchJson<{ ok: boolean }>(
    `/proposals/${id}/reject?reason=${encodeURIComponent(reason)}`,
    { method: 'POST' }
  );
}

export async function triggerIncident(): Promise<{
  ok: boolean;
  incident_id: string;
  task_id: string;
  status_url: string;
}> {
  if (USE_MOCKS) {
    return Promise.resolve({
      ok: true,
      incident_id: 'mock-incident',
      task_id: 'mock-task',
      status_url: '/api/promptguard/incidents/mock-incident/status',
    });
  }
  return fetchJson('/incidents/trigger', { method: 'POST' });
}
```

**`src/app/promptguard/lib/mocks.ts`:**

```typescript
import type { DashboardState, ProposalFull } from './types';

/**
 * Mock data used during parallel development before the backend lands.
 * Set NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS=true in .env.local to enable.
 */

export const MOCK_DASHBOARD_STATE: DashboardState = {
  active_version: {
    id: '72a7598a-0000-0000-0000-000000000002',
    version: 2,
    label: 'v2-from-proposal-f029e5ac',
    activated_at: '2026-05-18T22:15:00Z',
    prompt_keys: ['general', 'technical', 'creative', 'business'],
  },
  latest_eval: {
    overall_score: 3.475,
    per_type_scores: {
      general: 3.1,
      technical: 3.8,
      creative: 3.8,
      business: 3.2,
    },
    sample_size: 20,
    evaluated_at: '2026-05-18T22:14:30Z',
  },
  recent_incidents: [
    {
      id: 'inc-0a8c',
      status: 'resolved',
      diagnosis: { baseline: 4.0, current: 2.5 },
      created_at: '2026-05-18T22:10:00Z',
    },
  ],
  pending_proposals: [
    {
      id: 'prop-7f12-pending',
      score_delta: 1.47,
      baseline_score: 2.5,
      candidate_score: 3.97,
      rationale_preview:
        'The current prompt set lacks specificity in technical and business contexts. ' +
        'Recent traces show users receiving vague rewrites without preserved intent. ' +
        'Candidate restores structured guidance and adds output format hints.',
      created_at: '2026-05-26T19:30:00Z',
    },
  ],
};

export const MOCK_PROPOSAL_FULL: ProposalFull = {
  id: 'prop-7f12-pending',
  status: 'awaiting_approval',
  rationale:
    'The current v2 prompt set ("Make the prompt better.") removed all structured ' +
    'guidance, causing flash rewrites to lose specificity. Across 6 of 20 eval cases, ' +
    'the rewrites scored below 2.5/5 on output_format and intent_preservation. ' +
    'The candidate v3 reintroduces role assignment, output schema specification, ' +
    'and explicit intent-preservation language. Expected lift: +1.47 overall.',
  baseline_score: 2.5,
  candidate_score: 3.97,
  score_delta: 1.47,
  candidate_system_prompts: {
    general:
      'You are an expert prompt engineer. Rewrite the user\'s prompt to be ' +
      'specific, intent-preserving, and clear about the desired output format. ' +
      'Preserve the user\'s original goal exactly.',
    technical:
      'You are a senior software engineer rewriting a technical prompt. ' +
      'Add specificity about the technology stack, expected output (code? explanation? ' +
      'design?), and preserve the engineering intent of the original request.',
    creative:
      'You are a creative writing instructor. Rewrite the prompt to enrich ' +
      'sensory and stylistic guidance while preserving the user\'s creative vision.',
    business:
      'You are a business strategy consultant. Rewrite the prompt with ' +
      'industry-aware framing, specific deliverables, and a clear audience.',
  },
  candidate_rag_suffixes: {
    non_stream:
      '\n\nRelevant reference prompts retrieved from the library ' +
      '(use as inspiration, not verbatim copy):\n',
    stream:
      '\n\nRelevant reference prompts retrieved from the library ' +
      '(use as inspiration, not verbatim copy):\n',
  },
  current_active: {
    version: 2,
    label: 'v2-from-proposal-f029e5ac',
    system_prompts: {
      general: 'Make the prompt better.',
      technical: 'Make the prompt better.',
      creative: 'Make the prompt better.',
      business: 'Make the prompt better.',
    },
    rag_suffixes: { non_stream: '', stream: '' },
  },
  created_at: '2026-05-26T19:30:00Z',
};
```

---

## 6. Polling hook

**`src/app/promptguard/lib/usePolling.ts`:**

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';

export type PollingResult<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Polls a fetcher every `intervalMs`. Cancels on unmount.
 * Survives transient errors (data sticks around; error surfaces alongside).
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 2000
): PollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mounted = useRef(true);
  const tickInFlight = useRef(false);

  const tick = async () => {
    if (tickInFlight.current) return;  // avoid overlapping ticks
    tickInFlight.current = true;
    try {
      const v = await fetcher();
      if (mounted.current) {
        setData(v);
        setError(null);
        setIsLoading(false);
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsLoading(false);
      }
    } finally {
      tickInFlight.current = false;
    }
  };

  useEffect(() => {
    mounted.current = true;
    tick();
    const iv = setInterval(tick, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { data, error, isLoading, refetch: tick };
}
```

---

## 7. Components

> **Implementation order: a → g.** Each is self-contained. Use the tokens
> from AD-5. Mobile-responsive (test at 375px width).

### 7a. `ActiveVersionCard.tsx`

```tsx
'use client';
import type { ActiveVersion } from '../lib/types';

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActiveVersionCard({ active }: { active: ActiveVersion | null }) {
  if (!active) {
    return (
      <div className="pg-card">
        <h3 className="pg-card-title">Active Version</h3>
        <p className="pg-muted">No active version found.</p>
      </div>
    );
  }
  return (
    <div className="pg-card">
      <h3 className="pg-card-title">Active Version</h3>
      <div className="pg-version-display">
        <span className="pg-version-num">v{active.version}</span>
        <span className="pg-version-label">{active.label}</span>
      </div>
      <div className="pg-meta">
        Activated <strong>{formatRelative(active.activated_at)}</strong>
      </div>
      <div className="pg-meta">
        Prompt types: {active.prompt_keys.map(k => (
          <span key={k} className="pg-chip">{k}</span>
        ))}
      </div>
    </div>
  );
}
```

### 7b. `EvalScoreCard.tsx`

```tsx
'use client';
import type { EvalSummary } from '../lib/types';

function scoreColor(score: number): string {
  if (score >= 4) return 'var(--success)';
  if (score >= 3) return 'var(--accent)';
  return 'var(--danger)';
}

export function EvalScoreCard({ eval: ev }: { eval: EvalSummary | null }) {
  if (!ev) {
    return (
      <div className="pg-card">
        <h3 className="pg-card-title">Eval Score</h3>
        <p className="pg-muted">No eval data yet.</p>
      </div>
    );
  }
  return (
    <div className="pg-card">
      <h3 className="pg-card-title">Eval Score</h3>
      <div className="pg-score-main" style={{ color: scoreColor(ev.overall_score) }}>
        {ev.overall_score.toFixed(2)}
        <span className="pg-score-denom">/ 5.0</span>
      </div>
      <div className="pg-meta">over {ev.sample_size} samples</div>
      <hr className="pg-divider" />
      <ul className="pg-per-type">
        {Object.entries(ev.per_type_scores).map(([type, score]) => (
          <li key={type}>
            <span className="pg-type-name">{type}</span>
            <span className="pg-type-score" style={{ color: scoreColor(score) }}>
              {score.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 7c. `ActivityStream.tsx`

```tsx
'use client';
import type { IncidentSummary, PendingProposal } from '../lib/types';

type ActivityItem = {
  timestamp: string;
  type: 'incident' | 'proposal' | 'eval';
  message: string;
  severity: 'info' | 'warn' | 'success' | 'danger';
};

function buildActivityFeed(
  incidents: IncidentSummary[],
  pending: PendingProposal[],
): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const inc of incidents) {
    items.push({
      timestamp: inc.created_at,
      type: 'incident',
      message: `incident-${inc.id.slice(-4)} ${inc.status}`,
      severity: inc.status === 'resolved' ? 'success'
              : inc.status === 'open' ? 'danger' : 'warn',
    });
  }
  for (const p of pending) {
    const delta = p.score_delta ?? 0;
    items.push({
      timestamp: p.created_at,
      type: 'proposal',
      message: `proposal awaiting approval (Δ ${delta > 0 ? '+' : ''}${delta.toFixed(2)})`,
      severity: 'warn',
    });
  }
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ActivityStream({
  incidents,
  pending,
}: {
  incidents: IncidentSummary[];
  pending: PendingProposal[];
}) {
  const feed = buildActivityFeed(incidents, pending);

  return (
    <div className="pg-card pg-stream">
      <h3 className="pg-card-title">Agent Activity</h3>
      {feed.length === 0 ? (
        <p className="pg-muted">No recent activity. Run the agent loop to see live events.</p>
      ) : (
        <ul className="pg-stream-list">
          {feed.map((item, idx) => (
            <li key={idx} className={`pg-stream-item pg-sev-${item.severity}`}>
              <span className="pg-stream-time">{formatTime(item.timestamp)}</span>
              <span className="pg-stream-dot" />
              <span className="pg-stream-msg">{item.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 7d. `PendingProposalCard.tsx`

```tsx
'use client';
import { useState } from 'react';
import type { PendingProposal } from '../lib/types';
import { ProposalDetailModal } from './ProposalDetailModal';

export function PendingProposalCard({
  pending,
}: {
  pending: PendingProposal[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (pending.length === 0) {
    return (
      <div className="pg-card">
        <h3 className="pg-card-title">Pending Proposals</h3>
        <p className="pg-muted">No proposals awaiting your review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="pg-card">
        <h3 className="pg-card-title">
          Pending Proposals <span className="pg-badge">{pending.length}</span>
        </h3>
        {pending.map(p => (
          <div key={p.id} className="pg-proposal-row">
            <div className="pg-proposal-headline">
              <span className="pg-proposal-delta" style={{
                color: (p.score_delta ?? 0) > 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                Δ {(p.score_delta ?? 0) > 0 ? '+' : ''}{(p.score_delta ?? 0).toFixed(2)}
              </span>
              <button
                onClick={() => setOpenId(p.id)}
                className="pg-btn-link"
                aria-label={`View proposal ${p.id}`}
              >
                View detail →
              </button>
            </div>
            <p className="pg-rationale-preview">{p.rationale_preview}</p>
          </div>
        ))}
      </div>
      {openId && (
        <ProposalDetailModal id={openId} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
```

### 7e. `ProposalDetailModal.tsx`

```tsx
'use client';
import { useEffect, useState } from 'react';
import { getProposalFull, approveProposal, rejectProposal } from '../lib/api';
import type { ProposalFull } from '../lib/types';
import { PromptDiff } from './PromptDiff';

export function ProposalDetailModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [proposal, setProposal] = useState<ProposalFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProposalFull(id)
      .then(p => { if (!cancelled) setProposal(p); })
      .catch(e => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [id]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      await approveProposal(id);
      onClose();  // dashboard will refresh on next poll
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };
  const handleReject = async () => {
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    setBusy(true);
    try {
      await rejectProposal(id, reason);
      onClose();
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <div className="pg-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        <header className="pg-modal-header">
          <h2>Proposal Detail</h2>
          <button className="pg-btn-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        {error && <div className="pg-error">{error}</div>}

        {!proposal && !error && <p className="pg-muted">Loading proposal…</p>}

        {proposal && (
          <>
            <section className="pg-modal-section">
              <h3>Score</h3>
              <div className="pg-score-comparison">
                <div>Baseline: <strong>{proposal.baseline_score?.toFixed(2) ?? 'n/a'}</strong></div>
                <div>Candidate: <strong>{proposal.candidate_score?.toFixed(2) ?? 'n/a'}</strong></div>
                <div className="pg-score-delta-large" style={{
                  color: (proposal.score_delta ?? 0) > 0 ? 'var(--success)' : 'var(--danger)',
                }}>
                  Δ {(proposal.score_delta ?? 0) > 0 ? '+' : ''}{(proposal.score_delta ?? 0).toFixed(2)}
                </div>
              </div>
            </section>

            <section className="pg-modal-section">
              <h3>Diagnoser Rationale</h3>
              <p className="pg-rationale-full">{proposal.rationale}</p>
            </section>

            <section className="pg-modal-section">
              <h3>Prompt Diff</h3>
              {proposal.current_active && (
                <PromptDiff
                  baseline={proposal.current_active.system_prompts}
                  candidate={proposal.candidate_system_prompts}
                />
              )}
            </section>

            <footer className="pg-modal-footer">
              <button
                className="pg-btn pg-btn-danger"
                onClick={handleReject}
                disabled={busy}
              >
                Reject
              </button>
              <button
                className="pg-btn pg-btn-primary"
                onClick={handleApprove}
                disabled={busy}
              >
                {busy ? 'Approving…' : 'Approve & Activate'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
```

### 7f. `PromptDiff.tsx`

```tsx
'use client';

export function PromptDiff({
  baseline,
  candidate,
}: {
  baseline: Record<string, string>;
  candidate: Record<string, string>;
}) {
  const types = Array.from(new Set([
    ...Object.keys(baseline),
    ...Object.keys(candidate),
  ]));

  return (
    <div className="pg-diff">
      {types.map(type => (
        <div key={type} className="pg-diff-block">
          <h4 className="pg-diff-type">{type}</h4>
          <div className="pg-diff-row pg-diff-old">
            <span className="pg-diff-marker">−</span>
            <pre>{baseline[type] ?? '(missing)'}</pre>
          </div>
          <div className="pg-diff-row pg-diff-new">
            <span className="pg-diff-marker">+</span>
            <pre>{candidate[type] ?? '(missing)'}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 7g. `EmptyState.tsx` (used when dashboard has no data)

```tsx
'use client';

export function EmptyState({
  title,
  message,
  hint,
}: {
  title: string;
  message: string;
  hint?: string;
}) {
  return (
    <div className="pg-empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {hint && <p className="pg-empty-hint">{hint}</p>}
    </div>
  );
}
```

---

## 8. Page + layout

**`src/app/promptguard/layout.tsx`:**

```tsx
import './promptguard.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PromptGuard — Autonomous LLM Quality Engineer',
  description:
    'Monitors and improves production prompts via Gemini + Arize Phoenix. Open source.',
};

export default function PromptGuardLayout({ children }: { children: ReactNode }) {
  return <div className="pg-root">{children}</div>;
}
```

**`src/app/promptguard/page.tsx`:**

```tsx
'use client';
import { usePolling } from './lib/usePolling';
import { getDashboardState } from './lib/api';
import type { DashboardState } from './lib/types';
import { ActiveVersionCard } from './components/ActiveVersionCard';
import { EvalScoreCard } from './components/EvalScoreCard';
import { ActivityStream } from './components/ActivityStream';
import { PendingProposalCard } from './components/PendingProposalCard';
import { EmptyState } from './components/EmptyState';

export default function PromptGuardDashboard() {
  const { data, error, isLoading } = usePolling<DashboardState>(
    getDashboardState,
    2000
  );

  if (isLoading && !data) {
    return (
      <main className="pg-page">
        <p className="pg-muted">Loading PromptGuard state…</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="pg-page">
        <EmptyState
          title="Could not reach PromptGuard"
          message={error.message}
          hint="Backend may be deploying. Refresh in a few seconds."
        />
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="pg-page">
      <header className="pg-header">
        <h1>PromptGuard</h1>
        <p>Autonomous LLM quality engineer · live production state</p>
        {error && (
          <div className="pg-stale-warning">
            ⚠ Backend transiently unreachable — showing last known state.
          </div>
        )}
      </header>

      <div className="pg-grid">
        <aside className="pg-sidebar">
          <ActiveVersionCard active={data.active_version} />
          <EvalScoreCard eval={data.latest_eval} />
          <PendingProposalCard pending={data.pending_proposals} />
        </aside>
        <section className="pg-main">
          <ActivityStream
            incidents={data.recent_incidents}
            pending={data.pending_proposals}
          />
        </section>
      </div>

      <footer className="pg-footer">
        <p>
          PromptGuard runs in production at{' '}
          <a href="https://api.prompt-temple.com" target="_blank" rel="noopener noreferrer">
            api.prompt-temple.com
          </a>{' '}
          · Source on{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
```

**`src/app/promptguard/promptguard.css`** — all the `pg-*` styles. Use the
locked tokens from AD-5. Aim for ~250-350 lines of CSS. Mobile-first:
single-column on viewports <768px, two-column on ≥768px. Test at 375px
(iPhone SE).

---

## 9. Mobile responsiveness

Required breakpoints:

| Viewport | Layout |
|---|---|
| < 768px | Single column. Cards stack. Modal full-screen. |
| ≥ 768px | Two-column grid (sidebar 4/12, main 8/12). Modal max-width 640px. |

**Test at 375px** in Chrome devtools. If any text overflows or columns
collide, fix before submitting.

---

## 10. Accessibility (minimum bar)

- All buttons have visible focus styles (outline + offset)
- Modal traps focus while open; restores focus to trigger on close
- `Escape` closes the modal
- `aria-label` on icon-only buttons (×, view detail)
- Color contrast ratio ≥ 4.5:1 for body text against background
- No critical info conveyed by color alone (score colors paired with text)

Run [axe DevTools](https://www.deque.com/axe/devtools/) once before declaring done — fix any critical/serious findings.

---

## 11. Stretch goal: Phoenix Cloud deep-links (~1-2 hrs after core ships)

After the core dashboard works, add deep-links to Phoenix Cloud traces.

In `ActivityStream`: each item gets a "View in Phoenix →" link that
opens `https://app.phoenix.arize.com/projects/prompt-temple-forge/traces`
(or the specific trace URL if you can derive it from the diagnosis payload).

In `EvalScoreCard`: a small link at the bottom: "View these eval results in Phoenix Cloud →"

This earns the Arize-rubric an additional point on "meaningful partner integration" by making the connection between the dashboard and the partner product visually obvious to judges.

---

## 12. Testing & verification

**Manual tests before declaring done:**

```bash
# 1. Confirm route loads with mocks
NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS=true npm run dev
# Open http://localhost:3000/promptguard/
# Verify: all 4 panels render with mock data; proposal modal opens; diff renders

# 2. Confirm production build succeeds
npm run build
# Should complete without TypeScript errors

# 3. Confirm route loads against real backend (once backend agent has shipped Story 3.B)
NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS=false NEXT_PUBLIC_PROMPTGUARD_API_BASE=https://api.prompt-temple.com/api/promptguard npm run dev
# Open the same URL. Network tab should show real fetches every 2s.

# 4. Mobile responsive check
# Chrome devtools → iPhone SE (375x667). All panels must fit, no horizontal scroll.

# 5. Approve flow smoke test (against MOCKS only — DO NOT run against real prod)
# Click "View detail" on a proposal. Click "Approve". Modal closes. Dashboard refreshes.
```

**Automated:** add one Playwright or simple smoke test if time. Not required for the demo.

---

## 13. Deployment

The `promptcord/` app deploys to Vercel (assumed based on Next.js app-router setup).
**Confirm the deploy target during pre-flight** by checking `vercel.json` or `.vercel/`.

Standard deploy sequence:
```bash
git add src/app/promptguard/
git add .env.example   # IF you added the new env vars
git commit -m "promptguard: dashboard at /promptguard/"
git push origin main  # or whatever your branch convention is
```

Vercel auto-deploys main. Confirm at `https://www.prompt-temple.com/promptguard/`.

**If deployment is NOT Vercel** (Heroku, Cloudflare, etc.) — follow whatever existing deploy flow promptcord uses. **Do not invent new deployment infrastructure.**

---

## 14. Sprint log

Maintain `promptcord/src/app/promptguard/SPRINT_LOG.md`:

```markdown
## <timestamp> — <step> (<file>)
- What I did:
- Decisions:
- Open questions:
```

Append throughout, not at the end. Future you (and the human) reads this.

---

## 15. Stop-and-ask conditions

Halt and write `STOP` in SPRINT_LOG.md if:

1. promptcord is NOT a Next.js app-router project (e.g., Pages router or Vite)
2. CORS blocks `https://api.prompt-temple.com` even from localhost — the backend would need a CORS header change which is the primary agent's territory
3. The existing promptcord layout conflicts with the dashboard (e.g., a global `<div className="container">` that breaks the full-width grid)
4. TypeScript build errors that resist quick fixing
5. `package.json` Node version differs significantly from your local environment

---

## 16. Definition of Done

- [ ] `src/app/promptguard/page.tsx` renders at `localhost:3000/promptguard/` with mocks
- [ ] All four panels (ActiveVersion, EvalScore, ActivityStream, PendingProposal) populate
- [ ] Proposal detail modal opens, shows diff, closes on Escape, closes on outside click
- [ ] Approve and Reject buttons functional (mock or real)
- [ ] Polling every 2s, no memory leaks (verify via React DevTools profiler)
- [ ] Mobile: works cleanly at 375px width
- [ ] `npm run build` succeeds with no TypeScript or ESLint errors
- [ ] Visual: aligned with Pharaonic palette, professional appearance
- [ ] Accessibility: no critical/serious axe findings
- [ ] `DISCOVERY.md` + `SPRINT_LOG.md` exist and are complete
- [ ] Route deploys to `www.prompt-temple.com/promptguard/` and renders against production backend
- [ ] (Stretch) Phoenix Cloud deep-links visible in ActivityStream

---

## 17. Closing log entry

When done, write to SPRINT_LOG.md:

```
## <ISO timestamp> — Dashboard complete
- Time spent: <hours>
- Discoveries that changed plan: <list>
- Components built: 7 + 1 layout + 1 page
- Deployed URL: https://www.prompt-temple.com/promptguard/
- Stretch goals shipped: <list or "none">
- Recommendations for next sprint:
```

Then stop. The primary agent (this thread) will integrate your work with backend Story 3.B once both ship.
