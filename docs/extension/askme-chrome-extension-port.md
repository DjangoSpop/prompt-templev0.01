# AskMe — Chrome MV3 Extension Port Guide

> **Purpose of this document.** This is a self-contained port specification for re-implementing the Prompt Temple "AskMe" feature as a Chrome Manifest V3 extension. It captures the business logic, state machine, API contract, streaming protocol, error handling, credit accounting, and prompts flow as they exist in the Next.js web app today — with concrete file:line references — so that an extension developer (or Claude Code) can reproduce the behavior without reading the web source.
>
> The extension goal: while a user is working with **any LLM surface** (chat.openai.com, claude.ai, gemini.google.com, perplexity, local tools, etc.), they can invoke an AskMe session from the browser action or a content-script injected button, answer a short guided Q&A, and receive a fully-structured optimized prompt they can paste back into the LLM's input. All calls go to the same Prompt Temple backend (`api.prompt-temple.com`), so behavior, credit cost, prompt quality, and persistence (PromptHistory) are identical across web and extension.

---

## 1. Feature summary

AskMe is a **4-step guided prompt builder** that turns a rough user intent into a production-quality prompt through an iterative Q&A loop.

```
┌────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────┐
│ intent │ ──▶ │  questions   │ ──▶ │  submitting  │ ──▶ │ result │
└────────┘     └──────────────┘     └──────────────┘     └────────┘
  -2 credits      free (local)         -3 credits         display + copy
```

- **intent** → user types a goal + optional context, session is started on the backend (2 credits). Backend returns a list of clarifying questions typed by intent.
- **questions** → user answers N questions locally (no per-answer network cost). The UI advances through `required` questions and lets the user submit early when `good_enough_to_run` is true.
- **submitting** → all answers are POSTed in a single atomic call that deducts 3 credits, runs the backend LLM (DeepSeek) synthesis, saves the result to PromptHistory, and returns the final prompt plus quality metrics.
- **result** → the final prompt, quality score, spec coverage, and an improvement comparison are shown. The user can copy, regenerate, or open the saved record in their library.

**Total session cost:** `2 (start) + 3 (submit-all) = 5 credits per completed session.`

**Reference files in the Next.js app:**
- [src/app/(shell)/askme/page.tsx](../../src/app/(shell)/askme/page.tsx) — route entry
- [src/components/askme/AskMeWizard.tsx](../../src/components/askme/AskMeWizard.tsx) — full standalone wizard (the reference implementation for the extension)
- [src/components/askme/AskMeQuestion.tsx](../../src/components/askme/AskMeQuestion.tsx) — per-question renderer (5 input kinds)
- [src/components/askme/PromptComparison.tsx](../../src/components/askme/PromptComparison.tsx) — result display
- [src/components/ai/AskMeModal.tsx](../../src/components/ai/AskMeModal.tsx) — modal variant with SSE typewriter stream (**the best reference for the extension popup**, since the extension will always render in a popover/panel, not a page)
- [src/hooks/api/useAskMe.ts](../../src/hooks/api/useAskMe.ts) — TanStack Query mutations
- [src/lib/api/typed-client.ts](../../src/lib/api/typed-client.ts) lines 530–588, 1030–1112 — typed API client and types

---

## 2. State machine (authoritative)

```ts
type WizardStep = 'intent' | 'questions' | 'submitting' | 'result';
```

Transitions (from [AskMeWizard.tsx:29-166](../../src/components/askme/AskMeWizard.tsx#L29-L166)):

| From         | Event                                  | Side effects                                               | To           |
|--------------|----------------------------------------|------------------------------------------------------------|--------------|
| `intent`     | user clicks **Analyze**                | `deductOptimistic(2)` → `POST /askme/start/`               | `questions`  |
| `intent`     | `start` fails                          | `refundOptimistic(2)`, toast                               | `intent`     |
| `questions`  | user answers a question                | append to local `Map<qid, value>`                          | `questions`  |
| `questions`  | `allRequiredAnswered` + user submits   | `deductOptimistic(3)` → `POST /askme/submit-all/`          | `submitting` |
| `submitting` | submit-all succeeds                    | set `finalResult`, toast "Saved"                           | `result`     |
| `submitting` | 409 with existing prompt               | reuse the existing prompt, do NOT refund                   | `result`     |
| `submitting` | 404 session expired                    | `refundOptimistic(3)`, reset                               | `intent`     |
| `submitting` | 400 missing qids                       | `refundOptimistic(3)`, highlight missing                   | `questions`  |
| `submitting` | other error                            | `refundOptimistic(3)`, toast                               | `questions`  |
| `result`     | user clicks **Start Over**             | clear all state                                            | `intent`     |

**`canSubmit` computation** ([AskMeWizard.tsx:55-60](../../src/components/askme/AskMeWizard.tsx#L55-L60)):
```ts
const allRequiredAnswered = userQuestions
  .filter(q => q.required)
  .every(q => localAnswers.has(q.qid));

const canSubmit =
  (allRequiredAnswered && answeredQuestions.length > 0) ||
  (session?.good_enough_to_run ?? false);
```

**Important:** the wizard slices `session.questions` at `firstUserQIdx` — the backend returns the user's original intent as question index 0 (already `is_answered: true`), so the UI skips past it. Port this as:
```ts
const firstUnansweredIdx = session.questions.findIndex(q => !q.is_answered);
const startIdx = firstUnansweredIdx >= 0 ? firstUnansweredIdx : 0;
```

---

## 3. Data types (copy verbatim)

From [src/lib/api/typed-client.ts:1033-1112](../../src/lib/api/typed-client.ts#L1033-L1112) — use these as-is:

```ts
export type AskMeQuestionKind = 'long_text' | 'short_text' | 'choice' | 'boolean' | 'number';

export interface AskMeQuestion {
  qid: string;                 // unique id, ship back in the answer payload
  title: string;               // the question to render
  help_text?: string;          // optional helper paragraph
  kind: AskMeQuestionKind;
  options: string[];           // for kind === 'choice' | 'boolean'
  variable: string;            // template variable name used internally
  required: boolean;           // must be answered before submit-all
  suggested: string;           // placeholder / default
  is_answered: boolean;        // true for qid 0 (user's intent)
  answer: string;              // current value; empty when unanswered
}

export interface AskMeSession {
  session_id: string;
  questions: AskMeQuestion[];
  good_enough_to_run: boolean; // allow early submit
  preview_prompt: string | null;
}

export interface AskMeSubmitAllResult {
  session_id: string;
  prompt: string;              // the generated prompt — this is the payload the user pastes into the LLM
  prompt_history_id?: string;  // saved PromptHistory record — link to /library
  comparison?: {
    original_intent?: string;
    original_length?: number;
    optimized_length?: number;
    improvement_ratio?: number;     // e.g. 19.3 = 19x longer
    quality_indicators?: string[];  // e.g. ["Structured sections", "Clear examples"]
    spec_completeness?: number;     // 0..1
  };
  metadata?: {
    spec?: Record<string, unknown>;
    variables_used?: string[];
    completion_percentage?: number;
    answered_qids?: string[];
  };
  explanation?: string;
  title?: string;
  category?: string;
  original_intent?: string;
  spec_completeness?: number;
  quality_score?: number;             // 0..10
  optimized_length?: number;
  credits_used?: number;              // echoed for UI display
}
```

---

## 4. API contract

**Base URL.** In web: `process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com'`. In the extension, expose this as a manifest permission and read it from `chrome.storage.local` so QA can point at staging.

**Auth.** Bearer token. In web it lives in `localStorage.getItem('access_token')` ([AskMeModal.tsx:216](../../src/components/ai/AskMeModal.tsx#L216)). In the extension, store it in `chrome.storage.local` (`extensionStorage.access_token`) and attach via `Authorization: Bearer <token>` on every fetch. The backend also accepts the token as a query param `?token=...` on SSE endpoints (see §5).

### 4.1 Endpoints

| Endpoint                              | Method | Auth | Credits | Purpose                                                          |
|---------------------------------------|--------|------|---------|------------------------------------------------------------------|
| `/api/v2/ai/askme/start/`             | POST   | ✅   | **2**   | Initialize a session from a goal (+ optional context)            |
| `/api/v2/ai/askme/answer/` *(deprecated)* | POST | ✅ | 0       | Submit a single answer (kept for back-compat; do not use)        |
| `/api/v2/ai/askme/submit-all/`        | POST   | ✅   | **3**   | Atomically record all answers, synthesize final prompt, save     |
| `/api/v2/ai/askme/finalize/`          | POST   | ✅   | 3       | Legacy finalize (use submit-all instead)                         |
| `/api/v2/ai/askme/stream/`            | GET    | ✅ via `?token=` | 0 (piggybacks on submit-all) | SSE typewriter stream  |
| `/api/v2/ai/askme/sessions/`          | GET    | ✅   | 0       | List the user's recent sessions                                  |
| `/api/v2/ai/askme/sessions/{id}/delete/` | DELETE | ✅ | 0     | Delete a session                                                 |

### 4.2 Request / response shapes

**POST `/api/v2/ai/askme/start/`**
```json
// request
{ "goal": "Write cold outreach emails to SaaS CTOs", "context": "Product: observability tool" }

// response  (200)
{
  "session_id": "b4c2...uuid",
  "questions": [
    { "qid": "q0_intent", "title": "Your goal", "kind": "long_text", "is_answered": true, "answer": "Write cold outreach...", "required": true, "options": [], "variable": "intent", "suggested": "" },
    { "qid": "q1_audience", "title": "Who is the target audience?", "kind": "short_text", "is_answered": false, "answer": "", "required": true, "options": [], "variable": "audience", "suggested": "SaaS CTO" },
    { "qid": "q2_tone", "title": "Tone", "kind": "choice", "options": ["Direct", "Playful", "Formal"], "is_answered": false, "answer": "", "required": false, "variable": "tone", "suggested": "Direct" }
  ],
  "good_enough_to_run": false,
  "preview_prompt": null
}
```

**POST `/api/v2/ai/askme/submit-all/`**
```json
// request
{
  "session_id": "b4c2...uuid",
  "answers": [
    { "qid": "q1_audience", "value": "Heads of Platform at Series B SaaS" },
    { "qid": "q2_tone",     "value": "Direct" }
  ]
}

// response  (200)
{
  "session_id": "b4c2...uuid",
  "prompt": "You are an expert B2B copywriter...\n\n## Context\n...",
  "prompt_history_id": "ph_9f2a...",
  "comparison": {
    "original_intent": "Write cold outreach emails to SaaS CTOs",
    "original_length": 42,
    "optimized_length": 812,
    "improvement_ratio": 19.3,
    "spec_completeness": 0.88,
    "quality_indicators": ["Clear role", "Explicit constraints", "Few-shot examples"]
  },
  "quality_score": 8.6,
  "credits_used": 3
}
```

### 4.3 Error matrix (submit-all)

From [AskMeWizard.tsx:108-147](../../src/components/askme/AskMeWizard.tsx#L108-L147). **Port these exactly** — the UX depends on them:

| Status | Body                        | Handling                                                                          |
|--------|-----------------------------|-----------------------------------------------------------------------------------|
| 200    | `AskMeSubmitAllResult`      | success → `result` step, toast                                                    |
| 400    | `{ missing_qids: string[] }`| refund 3 credits, highlight missing, return to `questions` step                   |
| 404    | session not found           | refund 3 credits, reset to `intent` step, toast "Session expired"                 |
| 409    | `AskMeSubmitAllResult`      | **do not refund** — session was already finalized; display the returned prompt    |
| other  | —                           | refund 3 credits, return to `questions`, toast generic error                      |

---

## 5. Streaming protocol (SSE typewriter)

The web app calls `submit-all` first (atomic, authoritative source of truth), then optionally opens an SSE connection to animate the prompt onto the screen as a typewriter. **The SSE stream is a UX enhancement — never the source of truth.** If the stream fails, fall back to displaying `finalResult.prompt` directly.

**URL:** `GET {baseUrl}/api/v2/ai/askme/stream/?session_id={id}&mode=compose&token={accessToken}`

**Reference:** [AskMeModal.tsx:208-282](../../src/components/ai/AskMeModal.tsx#L208-L282).

**Event sequence:**
```
event: thinking
data: {"step": "Crafting your optimized prompt..."}

event: token
data: {"t": "Y"}

event: token
data: {"t": "o"}

event: token
data: {"t": "u"}
...

event: prompt_done
data: {"content": "<full final prompt as a safety net>"}

event: status
data: {"is_complete": true, "can_finalize": true}

event: complete
data: {}
```

**Client handling:**
- `thinking` → show spinner / "Composing…" label
- `token` → append `data.t` to accumulator, render as typewriter
- `prompt_done` → **replace** accumulator with `data.content` (guards against dropped tokens)
- `complete` → close EventSource; after ~800ms pause, transition to `result` step
- `error` or `onerror` → close EventSource, fall back immediately to the `finalResult` from submit-all

### 5.1 MV3 gotcha: SSE in service workers

**EventSource is NOT available in MV3 service workers.** Two options:

1. **Run SSE in an extension page / popup / side-panel.** `EventSource` works normally in any `chrome-extension://` page context. This is the simplest and recommended path — the AskMe wizard renders in the popup or a side panel, and the popup owns the EventSource directly. Close it in a `beforeunload` / `pagehide` handler.

2. **Skip the stream in the extension entirely.** Because submit-all already returns the full prompt, the typewriter is purely cosmetic. Rendering the prompt instantly (with a fade-in) is a perfectly acceptable extension UX — the user sees their optimized prompt in one atomic reveal. **This is the recommended path for v1 of the extension.**

If the extension later adds a background-script prefetch flow, you can implement a manual SSE parser using `fetch(url, { headers: { Accept: 'text/event-stream' }})` and a `ReadableStream` reader (`resp.body.getReader()` + `TextDecoder`), parsing `event: ...\ndata: ...\n\n` chunks by hand. This *does* work in MV3 service workers.

---

## 6. Credit accounting

The web app uses **optimistic deduction** via a Zustand store ([src/store/credits.ts](../../src/store/credits.ts)). Port the same pattern to `chrome.storage.local`:

```ts
// before the network call
await deductOptimistic(2);            // updates chrome.storage.local.credits_available
// fire request
try {
  const session = await askmeStart({ goal });
} catch (err) {
  await refundOptimistic(2);          // on any failure
  throw err;
}
```

**Authoritative sync:** every response from the backend carries an `X-Credits-Remaining` header. After every mutation, read that header and overwrite the local balance — the optimistic value is only a placeholder for the ~300ms round trip. Expose the current balance via a `chrome.runtime.onMessage` broadcast so the popup and the content-script overlay both re-render.

**Insufficient credits:** when the backend returns 402, the web app opens an upgrade modal. In the extension, open `https://prompt-temple.com/upgrade` in a new tab (or inside the side panel) and leave a retry CTA in the AskMe UI.

---

## 7. Question renderer (5 input kinds)

From [AskMeQuestion.tsx](../../src/components/askme/AskMeQuestion.tsx). Render based on `question.kind`:

- **`choice`** — vertical button group; mutually exclusive; `options[]` are the labels
- **`boolean`** — two buttons (the `options[]` array, typically `["Yes", "No"]`)
- **`long_text`** — textarea; `Shift+Enter` for newline; `Cmd/Ctrl+Enter` to submit
- **`number`** — HTML5 `<input type="number">`
- **`short_text`** — plain `<input type="text">` (default fallback)

All kinds share: `title`, `help_text`, `required` badge, `suggested` as placeholder, and a single `onAnswer(value: string)` callback. **Answers are always stored as strings** — the backend handles type coercion.

Keyboard affordances (important for the extension, where the user is in "keyboard flow" with an LLM):
- `Enter` → next question (except `long_text`, which requires `Cmd/Ctrl+Enter`)
- `Escape` → close popup / cancel session (extension-only addition — web uses modal close button)

---

## 8. Chrome MV3 architecture

### 8.1 Recommended file layout

```
extension/
├── manifest.json
├── background/
│   └── service-worker.ts      # auth token storage, credit sync, message router
├── popup/
│   ├── popup.html             # entry — mounts the AskMe wizard
│   ├── popup.tsx              # renders <AskMeWizard /> ported from AskMeWizard.tsx
│   └── popup.css
├── content/
│   ├── content-script.ts      # injects "Optimize with AskMe" button on LLM sites
│   └── overlay.tsx            # floating panel variant of the wizard (optional v2)
├── lib/
│   ├── api-client.ts          # ported from src/lib/api/typed-client.ts (askme methods only)
│   ├── types.ts               # verbatim copy of the AskMe* interfaces
│   ├── credits-store.ts       # chrome.storage.local wrapper matching the Zustand API
│   └── llm-targets.ts         # selectors for ChatGPT / Claude / Gemini / Perplexity input fields
└── ui/
    ├── AskMeWizard.tsx        # ported (remove framer-motion, keep logic)
    ├── AskMeQuestion.tsx      # ported verbatim (5 kinds)
    └── PromptComparison.tsx   # ported verbatim
```

### 8.2 manifest.json essentials

```json
{
  "manifest_version": 3,
  "name": "Prompt Temple AskMe",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": "icons/icon-128.png"
  },
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://api.prompt-temple.com/*",
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://www.perplexity.ai/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://www.perplexity.ai/*"
      ],
      "js": ["content/content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "side_panel": {
    "default_path": "popup/popup.html"
  }
}
```

### 8.3 Message routing

The service worker is the single source of truth for auth + credits; popups and content scripts talk to it via `chrome.runtime.sendMessage`.

```ts
// messages.ts
export type Message =
  | { type: 'askme/start';      goal: string; context?: string }
  | { type: 'askme/submit-all'; session_id: string; answers: { qid: string; value: string }[] }
  | { type: 'credits/get' }
  | { type: 'auth/get-token' }
  | { type: 'auth/set-token';   token: string }
  | { type: 'prompt/paste';     prompt: string };   // content script paste request
```

The popup sends `askme/start` when the user clicks Analyze. The service worker handles the fetch, applies optimistic credit deduction, stores the session in `chrome.storage.session` (so it survives popup close), and replies with the `AskMeSession`. Same for submit-all.

### 8.4 "Paste into LLM" integration

This is the key extension value-add: after `result`, the user clicks **Paste into ChatGPT** (or whatever LLM they're on), and the content script writes the optimized prompt into the active textarea.

```ts
// content-script.ts — selectors per surface
const TARGETS: Record<string, string> = {
  'chat.openai.com':   '#prompt-textarea',
  'chatgpt.com':       '#prompt-textarea',
  'claude.ai':         'div[contenteditable="true"].ProseMirror',
  'gemini.google.com': 'rich-textarea .ql-editor',
  'www.perplexity.ai': 'textarea[placeholder*="Ask"]',
};

chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  if (msg.type === 'prompt/paste') {
    const sel = TARGETS[location.hostname];
    const el = sel ? document.querySelector<HTMLElement>(sel) : null;
    if (!el) { sendResponse({ ok: false, reason: 'target-not-found' }); return; }

    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      el.focus();
      el.value = msg.prompt;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable (Claude, Gemini)
      el.focus();
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, msg.prompt);
    }
    sendResponse({ ok: true });
  }
});
```

Maintain `TARGETS` in `lib/llm-targets.ts` so new surfaces can be added without touching the content script logic.

### 8.5 Iteration loop on the LLM side

The extension's power move: **let the user iterate**. After the first generation, the result screen should offer:

1. **Paste** — send the prompt to the LLM and let the user run it
2. **Refine** — re-open the `questions` step with the previous answers pre-filled, add/change fields, and call `submit-all` again (this deducts another 3 credits and returns a new `AskMeSubmitAllResult` — the session_id stays the same, so the backend has the full context)
3. **Start over** — clear state, new session (2+3 credits)
4. **Save to library** — already happened automatically via `prompt_history_id`; show a link to `https://prompt-temple.com/library/{prompt_history_id}`

Flow B (Refine) is the iteration loop the user asked for. The backend already supports it: submitting new answers to an existing `session_id` generates a fresh prompt using the updated spec. Cap at N refines per session client-side if you want (the web app does not).

---

## 9. Storage schema (chrome.storage.local)

```ts
interface ExtensionStorage {
  access_token: string;                // bearer token, synced from popup login
  refresh_token?: string;
  credits_available: number;           // optimistic balance
  credits_last_sync: number;           // epoch ms
  api_base_url: string;                // default 'https://api.prompt-temple.com'
  active_session?: {                   // survives popup close
    session_id: string;
    started_at: number;
    goal: string;
    questions: AskMeQuestion[];
    local_answers: Record<string, string>;  // Map serialized
    first_user_q_idx: number;
    step: WizardStep;
    final_result?: AskMeSubmitAllResult;
  };
  recent_sessions: Array<{ session_id: string; title: string; finished_at: number }>;  // last 10
}
```

Serialize `localAnswers` from `Map` to `Record<string, string>` when persisting — `chrome.storage` only accepts JSON-serializable values.

---

## 10. Porting checklist

Use this as a line-item checklist during implementation. Each item maps to a reference in the web app.

- [ ] **Types** — copy `AskMeQuestion`, `AskMeQuestionKind`, `AskMeSession`, `AskMeSubmitAllResult` verbatim from [typed-client.ts:1033-1112](../../src/lib/api/typed-client.ts#L1033-L1112).
- [ ] **API client** — port `askmeStart`, `askmeSubmitAll`, `getAskmeSessions`, `deleteAskmeSession` from [typed-client.ts:534-588](../../src/lib/api/typed-client.ts#L534-L588). Include the `X-Credits-Remaining` header read.
- [ ] **State machine** — reproduce `WizardStep` and the derived state block from [AskMeWizard.tsx:27-60](../../src/components/askme/AskMeWizard.tsx#L27-L60) exactly.
- [ ] **handleStartConfirm** — credit deduction, first-unanswered-index detection, error refund ([AskMeWizard.tsx:64-82](../../src/components/askme/AskMeWizard.tsx#L64-L82)).
- [ ] **Local answer map** — `Map<qid, value>`; clear `missingQids` when the user answers a previously-flagged qid ([AskMeWizard.tsx:84-91](../../src/components/askme/AskMeWizard.tsx#L84-L91)).
- [ ] **triggerSubmitAll + full error matrix** — 409 reuse, 404 expired, 400 missing_qids, generic fallback ([AskMeWizard.tsx:93-150](../../src/components/askme/AskMeWizard.tsx#L93-L150)).
- [ ] **Question renderer** — 5 kinds, `Cmd/Ctrl+Enter` for long_text, `Enter` for short_text ([AskMeQuestion.tsx](../../src/components/askme/AskMeQuestion.tsx)).
- [ ] **PromptComparison** — render `comparison.original_length`, `optimized_length`, `improvement_ratio`, `spec_completeness`, `quality_indicators[]`, `quality_score` ([PromptComparison.tsx](../../src/components/askme/PromptComparison.tsx)).
- [ ] **Credits store** — optimistic deduct/refund; sync from `X-Credits-Remaining`.
- [ ] **Session persistence** — `chrome.storage.local.active_session` so the popup can close and reopen mid-flow.
- [ ] **Content-script paste** — `TARGETS` map, `insertText` for contenteditable, `input` event dispatch for textareas.
- [ ] **Refine loop** — "Refine" button on `result` re-opens `questions` with the same `session_id` and prior answers pre-filled.
- [ ] **Settings page** — API base URL, sign out, "open library" link.
- [ ] **SSE** — **skip for v1** (recommended). Revisit once manual SSE parsing in the service worker becomes necessary.

---

## 11. Open questions for the extension team

1. **Auth bootstrap.** How does the extension obtain the access token for the first time? Options: (a) in-popup email/password form against `/api/v2/auth/login/`, (b) "Sign in on web" CTA that opens `prompt-temple.com` and reads the token back via a `chrome.runtime.sendMessage` bridge injected on that domain, (c) OAuth device flow. The web app currently uses (a); the extension should probably offer (b) for friction reasons.
2. **Token refresh.** The web app refreshes tokens through the auth hooks; the service worker will need to do the same on a timer or on 401.
3. **Side panel vs popup.** Chrome 114+ supports `chrome.sidePanel` which is a much better UX for a multi-step wizard (survives tab switches). Recommend using the side panel as the default entry and keeping the popup as a compact launcher.
4. **Refine-loop UX.** How many refines before we force "Start over"? Three feels right — after three refines the session has enough drift that a fresh start produces better output.
5. **Telemetry.** The web app tracks `askme_start`, `askme_submit_all`, `askme_refine` via `apiClient.trackEvent`. Port the same taxonomy via the service worker so the team can compare web vs extension funnels.

---

## 12. Reference map (copy these back and forth)

| Feature aspect         | Web file                                                                                     | Lines      |
|------------------------|----------------------------------------------------------------------------------------------|------------|
| Route / page           | [src/app/(shell)/askme/page.tsx](../../src/app/(shell)/askme/page.tsx)                       | all        |
| Wizard state machine   | [src/components/askme/AskMeWizard.tsx](../../src/components/askme/AskMeWizard.tsx)           | 27–166     |
| Question renderer      | [src/components/askme/AskMeQuestion.tsx](../../src/components/askme/AskMeQuestion.tsx)       | all        |
| Result display         | [src/components/askme/PromptComparison.tsx](../../src/components/askme/PromptComparison.tsx) | all        |
| Modal + SSE reference  | [src/components/ai/AskMeModal.tsx](../../src/components/ai/AskMeModal.tsx)                   | 163–341    |
| Mutation hooks         | [src/hooks/api/useAskMe.ts](../../src/hooks/api/useAskMe.ts)                                 | all        |
| API client methods     | [src/lib/api/typed-client.ts](../../src/lib/api/typed-client.ts)                             | 530–588    |
| Type definitions       | [src/lib/api/typed-client.ts](../../src/lib/api/typed-client.ts)                             | 1030–1112  |
| Credit store           | [src/store/credits.ts](../../src/store/credits.ts)                                           | all        |
| Cost confirmation UI   | [src/components/credits/CostConfirmation.tsx](../../src/components/credits/CostConfirmation.tsx) | all    |

---

## 13. Appendix — minimal working popup skeleton

This is the shortest possible MV3 popup that exercises the full AskMe flow end to end. Expand from here.

```tsx
// popup/popup.tsx — no framework dependencies beyond React 18
import { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import type { AskMeSession, AskMeSubmitAllResult, AskMeQuestion } from '../lib/types';
import { askmeStart, askmeSubmitAll } from '../lib/api-client';

type Step = 'intent' | 'questions' | 'submitting' | 'result';

function AskMePopup() {
  const [step, setStep] = useState<Step>('intent');
  const [goal, setGoal] = useState('');
  const [session, setSession] = useState<AskMeSession | null>(null);
  const [firstIdx, setFirstIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AskMeSubmitAllResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userQs = session?.questions.slice(firstIdx) ?? [];
  const current = userQs.find(q => !(q.qid in answers));
  const allRequired = userQs.filter(q => q.required).every(q => q.qid in answers);

  const start = useCallback(async () => {
    try {
      const s = await askmeStart({ goal });
      const firstUnanswered = s.questions.findIndex(q => !q.is_answered);
      setFirstIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      setSession(s);
      setStep('questions');
    } catch (e: any) { setError(e.message); }
  }, [goal]);

  const answer = (q: AskMeQuestion, value: string) => {
    setAnswers(a => ({ ...a, [q.qid]: value }));
  };

  const submit = useCallback(async () => {
    if (!session) return;
    setStep('submitting');
    try {
      const res = await askmeSubmitAll({
        session_id: session.session_id,
        answers: Object.entries(answers).map(([qid, value]) => ({ qid, value })),
      });
      setResult(res);
      setStep('result');
    } catch (e: any) {
      setError(e.message);
      setStep('questions');
    }
  }, [session, answers]);

  const paste = () => {
    if (!result) return;
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'prompt/paste', prompt: result.prompt });
    });
  };

  if (step === 'intent') return (
    <div>
      <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="What do you want to ask the LLM?" />
      <button disabled={!goal.trim()} onClick={start}>Analyze (2 credits)</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );

  if (step === 'questions' && current) return (
    <div>
      <h3>{current.title}</h3>
      {current.help_text && <p>{current.help_text}</p>}
      {/* minimal: just short_text, port the full 5-kind switch for production */}
      <input autoFocus placeholder={current.suggested}
        onKeyDown={e => e.key === 'Enter' && answer(current, (e.target as HTMLInputElement).value)} />
      <button disabled={!allRequired} onClick={submit}>Build my prompt (3 credits)</button>
    </div>
  );

  if (step === 'submitting') return <div>Crafting your optimized prompt…</div>;

  if (step === 'result' && result) return (
    <div>
      <pre>{result.prompt}</pre>
      <p>Quality: {result.quality_score?.toFixed(1)}/10 · Spec coverage: {Math.round((result.spec_completeness ?? 0) * 100)}%</p>
      <button onClick={paste}>Paste into active tab</button>
      <button onClick={() => navigator.clipboard.writeText(result.prompt)}>Copy</button>
    </div>
  );

  return null;
}

createRoot(document.getElementById('root')!).render(<AskMePopup />);
```

This skeleton is ~80 lines and hits the full happy path: `intent → questions → submitting → result → paste`. From here, layer in the five question kinds, the error matrix, optimistic credit deduction, and session persistence per the checklist in §10.

---

**End of port guide.** Questions or inconsistencies found while implementing should be resolved by cross-checking against the `src/components/askme/*` files in this repo — they are the canonical behavior reference.
