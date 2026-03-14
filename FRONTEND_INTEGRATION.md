
> **Audience:** Frontend developers integrating with the PromptCraft API.
> **Base URL:** `https://<your-heroku-app>.herokuapp.com`
> **Auth header:** `Authorization: Bearer <jwt_token>` on every request unless noted.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [AI Optimization — Core Flow](#2-ai-optimization--core-flow)
3. [SSE Streaming — How to Implement](#3-sse-streaming--how-to-implement)
4. [Prompt Versioning (GitHub-like)](#4-prompt-versioning-github-like)
5. [Saved Prompts — User Library](#5-saved-prompts--user-library)
6. [Prompt Iterations — Version Control](#6-prompt-iterations--version-control)
7. [Conversation Threads](#7-conversation-threads)
8. [Full Workflow: Save → Iterate → Version](#8-full-workflow-save--iterate--version)
9. [Common Issues & Fixes](#9-common-issues--fixes)
10. [Endpoint Quick Reference](#10-endpoint-quick-reference)

---

## 1. Architecture Overview

```
Frontend
  │
  ├── POST /api/v2/ai/optimization/          ← JSON (fallback, use this for simple calls)
  ├── POST /api/v2/ai/optimization/stream/   ← SSE stream (preferred for UX)
  │
  └── /api/v2/history/                       ← Prompt versioning namespace
        ├── saved-prompts/                   ← User's saved prompt library
        ├── iterations/                      ← Version history (like git commits)
        └── threads/                         ← Multi-turn conversation groups
```

**Provider fallback chain** (handled entirely server-side, frontend doesn't control this):

```
ZAI Claude → DeepSeek → OpenRouter keyword fallback
```

All three fire in parallel; the first valid response within 8 s wins.
**The frontend never needs to select a provider manually** — leave `provider: "auto"`.

---

## 2. AI Optimization — Core Flow

### 2a. JSON endpoint (simple, synchronous)

```
POST /api/v2/ai/optimization/
Content-Type: application/json
Authorization: Bearer <token>
```

**Request body**

```json
{
  "original": "Write a blog post about AI",
  "mode": "fast",
  "provider": "auto",
  "context": {},
  "session_id": "optional-uuid"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `original` | string | yes | max 10 000 chars |
| `mode` | `"fast"` \| `"deep"` | no | `fast` = 3 credits, `deep` = 8 credits |
| `provider` | `"auto"` \| `"zai_claude"` \| `"deepseek"` \| `"openrouter"` | no | always use `"auto"` |
| `context` | object | no | extra metadata for RAG |
| `session_id` | string (UUID) | no | ties request to an AskMe or existing session |

**Success response (200)**

```json
{
  "optimized": "Write a compelling, SEO-optimised blog post...",
  "diff_summary": "- Added specificity\n- Clarified intent",
  "citations": [],
  "usage": { "tokens_in": 12, "tokens_out": 38, "credits": 3 },
  "run_id": "a7889b47-...",
  "processing_time_ms": 4210,
  "credits_consumed": 3,
  "credits_remaining": 3925,
  "from_cache": false,
  "success": true
}
```

**Error responses you must handle**

| HTTP | Body key | Meaning | UX action |
|------|----------|---------|-----------|
| 400 | `error` | Missing/invalid `original` field | Show validation error |
| 402 | `error: "insufficient_credits"` | Not enough credits | Redirect to billing / show upgrade modal |
| 402 | `error: "no_subscription"` | No active subscription | Show subscription prompt |
| 500 | `error` | Server-side failure | Show generic retry message |

---

### 2b. Agent optimize (no credit gate — for internal/testing only)

```
POST /api/v2/ai/agent/optimize/
```

```json
{ "prompt": "Summarise this article:", "mode": "fast" }
```

Same response shape as `/optimization/`. Use only for internal tooling — does not deduct credits.

---

## 3. SSE Streaming — How to Implement

**Critical:** The backend runs on Gunicorn (WSGI). **WebSockets are not supported.**
All streaming must use `text/event-stream` (SSE). Do not use `ws://` or socket.io clients.

### Endpoint

```
POST /api/v2/ai/optimization/stream/
```

Same request body as the JSON endpoint.

### Frontend implementation (vanilla JS)

```js
async function optimizeStream(promptText, onToken, onComplete, onError) {
  const token = localStorage.getItem('access_token'); // your JWT

  const response = await fetch('/api/v2/ai/optimization/stream/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ original: promptText, mode: 'fast', provider: 'auto' }),
  });

  if (!response.ok) {
    const err = await response.json();
    onError(err);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = JSON.parse(line.slice(6));

        // Route by event type (look for "event:" line before "data:")
        // Simplified: check payload shape
        if (payload.text !== undefined) {
          onToken(payload.text);           // append to UI
        } else if (payload.optimized !== undefined) {
          onComplete(payload);             // final result
        } else if (payload.error !== undefined) {
          onError(payload);
        }
      }
    }
  }
}
```

### SSE event sequence

```
event: meta
data: {"status": "connected", "run_id": "uuid"}

event: token
data: {"text": "Write a "}

event: token
data: {"text": "compelling…"}

event: complete
data: {"optimized": "...", "diff_summary": "...", "credits_consumed": 3, "credits_remaining": 3922}

event: error        ← only on failure
data: {"error": "..."}
```

> **Parse `event:` lines** — the parser above is simplified. For a robust implementation,
> track `event:` and `data:` pairs together before dispatching.

---

## 4. Prompt Versioning (GitHub-like)

The system mirrors Git concepts using three models:

| Git concept | API model | Description |
|-------------|-----------|-------------|
| Repository | `PromptHistory` | Root anchor for a prompt's full history |
| Commit | `PromptIteration` | A single version snapshot with diff & metadata |
| Branch tip / HEAD | `is_active = true` | The currently selected version |
| Bookmark / tag | `is_bookmarked = true` | Mark important versions |
| Fork | `SavedPrompt.duplicate` | Copy a prompt into a new personal entry |
| Linked list / chain | `previous_iteration` FK | Self-referential pointer to the prior version |
| Diff size | `diff_size` | Character count delta vs previous version (auto-computed) |
| Version tag | `version_tag` | Semantic label e.g. `"v1.0"`, `"draft-2"` |

### How the chain works

```
PromptHistory (root)
  └── PromptIteration #1  (previous_iteration = null, is_active = false)
        └── PromptIteration #2  (previous_iteration = #1, is_active = false)
              └── PromptIteration #3  (previous_iteration = #2, is_active = true) ← HEAD
```

- `iteration_number` is auto-incremented by the API (do not send it).
- `diff_size` is auto-computed on save (do not send it).
- Only one iteration per `PromptHistory` has `is_active = true` at any time.

---

## 5. Saved Prompts — User Library

Base path: `GET|POST /api/v2/history/saved-prompts/`

### 5a. List saved prompts

```
GET /api/v2/history/saved-prompts/
```

Query params:
- `category=coding` — filter by category string
- `is_favorite=true` — filter favorites
- `is_public=true` — filter public prompts
- `search=my query` — search title, content, description
- `ordering=-updated_at` — sort field (prefix `-` for descending)

**Response shape (list item)**

```json
{
  "id": "uuid",
  "title": "My blog prompt",
  "content": "Write a blog post about...",
  "description": "Used for tech posts",
  "category": "writing",
  "tags": ["blog", "tech"],
  "use_count": 5,
  "is_favorite": true,
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-13T09:00:00Z"
}
```

### 5b. Create saved prompt

```
POST /api/v2/history/saved-prompts/
```

```json
{
  "title": "Blog post helper",
  "content": "Write a compelling blog post about {topic}",
  "description": "General purpose blog template",
  "category": "writing",
  "tags": ["blog", "content"],
  "is_favorite": false,
  "is_public": false,
  "metadata": {}
}
```

| Field | Max length | Required |
|-------|-----------|----------|
| `title` | 200 chars | yes |
| `content` | 50 000 chars | yes |
| `description` | — | no |
| `category` | 100 chars | no |
| `tags` | max 20 items | no |
| `metadata` | JSON object | no |

### 5c. Action endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `.../saved-prompts/{id}/toggle-favorite/` | Toggle ⭐ favorite |
| `POST` | `.../saved-prompts/{id}/use/` | Record usage (increments use_count) |
| `POST` | `.../saved-prompts/{id}/duplicate/` | Fork prompt into a copy |
| `GET` | `.../saved-prompts/favorites/` | All favorites |
| `GET` | `.../saved-prompts/public/` | All public prompts |
| `GET` | `.../saved-prompts/discover/` | Public template library **(no auth)** |
| `GET` | `.../saved-prompts/categories/` | Category list for filter UI **(no auth)** |
| `POST` | `.../saved-prompts/copy-from-template/` | Copy template → personal library |
| `GET` | `.../saved-prompts/stats/` | User's saved prompt statistics |
| `GET` | `.../saved-prompts/{id}/iterations/` | List all versions of this prompt |
| `POST` | `.../saved-prompts/{id}/iterations/` | Create a new version |

#### duplicate — fork a prompt

```
POST /api/v2/history/saved-prompts/{id}/duplicate/
Content-Type: application/json

{ "new_title": "Blog post helper v2" }   ← optional, defaults to "Original (Copy)"
```

Returns `201` with the new `SavedPrompt` object.

#### copy-from-template

```
POST /api/v2/history/saved-prompts/copy-from-template/
Content-Type: application/json

{ "template_id": "uuid-of-public-template" }
```

Copies a public Template into the user's personal `SavedPrompt` library.
Increments the template's `usage_count` server-side.

#### stats

```
GET /api/v2/history/saved-prompts/stats/
```

```json
{
  "total": 42,
  "favorites": 8,
  "public": 3,
  "total_uses": 127,
  "top_categories": [
    {"category": "writing", "count": 15},
    {"category": "coding", "count": 12}
  ]
}
```

---

## 6. Prompt Iterations — Version Control

Base path: `/api/v2/history/iterations/`

### 6a. Create a new iteration (version/commit)

**Option A — via saved prompt (recommended)**

```
POST /api/v2/history/saved-prompts/{saved_prompt_id}/iterations/
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "prompt_text": "Write a compelling, SEO-optimised blog post about {topic}...",
  "previous_iteration": "uuid-of-previous-iteration-or-null",
  "interaction_type": "optimization",
  "ai_response": "Here is the optimized version...",
  "response_model": "claude-sonnet-4-5-20250929",
  "tokens_input": 45,
  "tokens_output": 120,
  "response_time_ms": 2300,
  "credits_spent": 3,
  "version_tag": "v1.1",
  "changes_summary": "Added SEO focus and CTA",
  "user_rating": 4,
  "feedback_notes": "Good but needs a stronger opening",
  "parameters": { "temperature": 0.7, "max_tokens": 400 },
  "tags": ["seo", "blog"],
  "metadata": {}
}
```

> **Note:** `parent_prompt` is injected automatically by the server when using the
> `/saved-prompts/{id}/iterations/` route. Do not send it.
> `iteration_number` and `diff_size` are also computed server-side — do not send them.

**Option B — direct iteration create**

```
POST /api/v2/history/iterations/
```

Same body as above but you must include `parent_prompt` (a `PromptHistory` UUID).
Use Option A whenever possible.

**Required fields**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `prompt_text` | string | yes | The version text |
| `interaction_type` | enum | no | Default: `"manual"` |
| `previous_iteration` | UUID \| null | no | Link to prior version |

**`interaction_type` values**

| Value | When to use |
|-------|-------------|
| `"manual"` | User edited the prompt themselves |
| `"optimization"` | AI optimization was run |
| `"refinement"` | User refined based on AI response |
| `"extension"` | User added new sections |
| `"correction"` | User corrected an AI error |
| `"experiment"` | Trying an experimental variation |

**Response (201)**

```json
{
  "id": "uuid",
  "user": 42,
  "parent_prompt": "uuid",
  "previous_iteration": "uuid-or-null",
  "iteration_number": 3,
  "version_tag": "v1.1",
  "prompt_text": "Write a compelling...",
  "system_message": "",
  "ai_response": "Here is the optimized version...",
  "response_model": "claude-sonnet-4-5-20250929",
  "interaction_type": "optimization",
  "tokens_input": 45,
  "tokens_output": 120,
  "response_time_ms": 2300,
  "credits_spent": 3,
  "user_rating": 4,
  "feedback_notes": "...",
  "changes_summary": "Added SEO focus",
  "diff_size": 87,
  "parameters": {},
  "tags": [],
  "metadata": {},
  "is_active": true,
  "is_bookmarked": false,
  "is_deleted": false,
  "created_at": "2026-03-13T10:00:00Z",
  "updated_at": "2026-03-13T10:00:00Z",
  "iteration_chain_length": 3,
  "has_next_iteration": false
}
```

### 6b. List iterations

```
GET /api/v2/history/iterations/
```

Filter params:
- `parent_prompt=<history-uuid>` — filter by root prompt
- `interaction_type=optimization` — filter by type
- `is_bookmarked=true` — bookmarked only
- `is_active=true` — active (HEAD) only
- `search=some text` — full text in prompt_text, ai_response, feedback_notes
- `ordering=iteration_number` — sort by iteration number (ascending)

### 6c. Action endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `.../iterations/{id}/set-active/` | Checkout a version (set as HEAD) |
| `POST` | `.../iterations/{id}/toggle-bookmark/` | Bookmark/unbookmark a version |
| `GET` | `.../iterations/bookmarked/` | All bookmarked versions |

#### set-active — checkout a version

```
POST /api/v2/history/iterations/{id}/set-active/
```

No body needed. All other iterations under the same `parent_prompt` become inactive.
Returns the full iteration object.

#### toggle-bookmark

```
POST /api/v2/history/iterations/{id}/toggle-bookmark/
```

```json
{
  "id": "uuid",
  "is_bookmarked": true,
  "message": "Iteration bookmarked"
}
```

### 6d. List versions via SavedPrompt (recommended path)

```
GET /api/v2/history/saved-prompts/{saved_prompt_id}/iterations/
```

```json
{
  "iterations": [ ...array of PromptIteration objects... ],
  "count": 3
}
```

This is the cleanest way to render a version history timeline for a specific saved prompt.

---

## 7. Conversation Threads

Groups iterations into named multi-turn conversations.

Base path: `/api/v2/history/threads/`

### Create thread

```
POST /api/v2/history/threads/
Content-Type: application/json

{
  "title": "Blog post optimization session",
  "description": "Iterating on a tech blog post",
  "status": "active"
}
```

**`status` values:** `"active"` | `"archived"` | `"completed"`

### Add iteration to thread

```
POST /api/v2/history/threads/{thread_id}/add-iteration/
Content-Type: application/json

{ "iteration_id": "uuid-of-iteration" }
```

Server auto-increments `total_iterations`, `total_tokens`, `total_credits`.

### List threads

```
GET /api/v2/history/threads/
```

Filter: `status=active`, `is_shared=true`
Order: `ordering=-last_activity_at`

**Response item**

```json
{
  "id": "uuid",
  "user": 42,
  "title": "Blog post session",
  "description": "...",
  "total_iterations": 5,
  "total_tokens": 1840,
  "total_credits": 15,
  "status": "active",
  "is_shared": false,
  "created_at": "2026-03-13T08:00:00Z",
  "updated_at": "2026-03-13T10:00:00Z",
  "last_activity_at": "2026-03-13T10:00:00Z"
}
```

---

## 8. Full Workflow: Save → Iterate → Version

This is the recommended end-to-end flow for the version control feature.

```
Step 1 — User writes or pastes a prompt
          POST /api/v2/history/saved-prompts/
          → returns saved_prompt.id

Step 2 — Run AI optimization (SSE stream for best UX)
          POST /api/v2/ai/optimization/stream/
          → stream tokens to UI, get final "optimized" text

Step 3 — Save the result as version #1
          POST /api/v2/history/saved-prompts/{id}/iterations/
          body: { prompt_text: <optimized>, interaction_type: "optimization",
                  ai_response: <raw AI text>, ... }
          → returns iteration.id, iteration_number: 1

Step 4 — User refines and runs again → version #2
          POST /api/v2/history/saved-prompts/{id}/iterations/
          body: { prompt_text: <refined>, previous_iteration: <v1 id>,
                  interaction_type: "refinement", ... }
          → iteration_number: 2, diff_size auto-computed

Step 5 — User rates version #2 (PATCH)
          PATCH /api/v2/history/iterations/{v2-id}/
          body: { user_rating: 5, feedback_notes: "Perfect for tech posts" }

Step 6 — User wants to go back to v1
          POST /api/v2/history/iterations/{v1-id}/set-active/
          → v1 becomes HEAD, v2 becomes inactive

Step 7 — Show history timeline
          GET /api/v2/history/saved-prompts/{id}/iterations/
          → renders version list with diff_size and iteration_number
```

---

## 9. Common Issues & Fixes

### Issue 1: CORS / auth on SSE stream

SSE `fetch()` calls require the same `Authorization` header as regular requests.
Do **not** use `EventSource` — it cannot set custom headers.
Use `fetch()` + `ReadableStream` as shown in Section 3.

### Issue 2: Not passing `previous_iteration`

Without `previous_iteration`, the chain is broken — `diff_size` will be 0 and
`has_next_iteration` won't work. Always pass the UUID of the last iteration.

### Issue 3: Sending `iteration_number` or `diff_size`

These are **read-only** and computed server-side. Sending them is silently ignored,
but it signals a misunderstanding — remove them from your request bodies.

### Issue 4: Using WebSockets instead of SSE

The server runs Gunicorn (WSGI). Requests to `/ws/*` return an error.
All real-time features use SSE (`text/event-stream`).

### Issue 5: Forgetting to call `/use/` after using a prompt

The `use_count` and `last_used_at` fields are not updated automatically when you
display or copy a prompt. Call `POST .../saved-prompts/{id}/use/` explicitly.

### Issue 6: `402 no_subscription` on optimization

The optimization endpoints check for an active subscription before consuming credits.
Detect this error code and show a subscription / upgrade prompt.

### Issue 7: `history_id` in SavedPrompt metadata

When you POST a first iteration via `/saved-prompts/{id}/iterations/`, the server
auto-creates a `PromptHistory` record and stores its UUID in `saved_prompt.metadata.history_id`.
This is an internal detail — never write to `metadata.history_id` yourself.

### Issue 8: Pagination

All list endpoints are paginated. Response shape:

```json
{
  "count": 100,
  "next": "https://.../api/v2/history/saved-prompts/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

Use `next` URL to load more. Default page size is 20.

### Issue 9: Soft deletes

`DELETE` requests do not physically remove records — they set `is_deleted = true`.
Records with `is_deleted = true` are filtered from all list endpoints automatically.
There is no undo endpoint — this is intentional.

---

## 10. Endpoint Quick Reference

All paths are under `https://<host>/api/v2/`.

### AI Services (`/api/v2/ai/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `ai/optimization/` | yes | Optimize prompt (JSON, synchronous) |
| `POST` | `ai/optimization/stream/` | yes | Optimize prompt (SSE stream) |
| `POST` | `ai/agent/optimize/` | yes | Raw agent optimize (no credit gate) |
| `GET` | `ai/agent/stats/` | yes | Provider status |
| `POST` | `ai/deepseek/stream/` | yes | DeepSeek chat stream |
| `POST` | `ai/broadcast/stream/` | yes | Multi-AI broadcaster SSE |
| `POST` | `ai/seo-spec/generate/` | yes | SEO spec generator SSE |
| `GET/POST` | `ai/askme/*` | yes | Ask-Me prompt builder |

### Prompt History & Versioning (`/api/v2/history/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `history/saved-prompts/` | yes | List user's saved prompts |
| `POST` | `history/saved-prompts/` | yes | Create saved prompt |
| `GET` | `history/saved-prompts/{id}/` | yes | Get single saved prompt |
| `PATCH` | `history/saved-prompts/{id}/` | yes | Update saved prompt |
| `DELETE` | `history/saved-prompts/{id}/` | yes | Soft-delete saved prompt |
| `POST` | `history/saved-prompts/{id}/toggle-favorite/` | yes | Toggle favorite |
| `POST` | `history/saved-prompts/{id}/use/` | yes | Record usage |
| `POST` | `history/saved-prompts/{id}/duplicate/` | yes | Fork prompt |
| `GET` | `history/saved-prompts/{id}/iterations/` | yes | List versions |
| `POST` | `history/saved-prompts/{id}/iterations/` | yes | Create version |
| `GET` | `history/saved-prompts/favorites/` | yes | Favorites list |
| `GET` | `history/saved-prompts/public/` | yes | Public prompts |
| `GET` | `history/saved-prompts/discover/` | **no** | Template library |
| `GET` | `history/saved-prompts/categories/` | **no** | Category list |
| `POST` | `history/saved-prompts/copy-from-template/` | yes | Copy template |
| `GET` | `history/saved-prompts/stats/` | yes | User stats |
| `GET` | `history/iterations/` | yes | All user iterations |
| `POST` | `history/iterations/` | yes | Create iteration (direct) |
| `GET` | `history/iterations/{id}/` | yes | Get single iteration |
| `PATCH` | `history/iterations/{id}/` | yes | Update (rating, notes) |
| `DELETE` | `history/iterations/{id}/` | yes | Soft-delete iteration |
| `POST` | `history/iterations/{id}/set-active/` | yes | Checkout version |
| `POST` | `history/iterations/{id}/toggle-bookmark/` | yes | Bookmark toggle |
| `GET` | `history/iterations/bookmarked/` | yes | All bookmarks |
| `GET` | `history/threads/` | yes | List threads |
| `POST` | `history/threads/` | yes | Create thread |
| `GET` | `history/threads/{id}/` | yes | Get thread |
| `PATCH` | `history/threads/{id}/` | yes | Update thread |
| `DELETE` | `history/threads/{id}/` | yes | Soft-delete thread |
| `POST` | `history/threads/{id}/add-iteration/` | yes | Add iteration to thread |

---

*Last updated: 2026-03-13 — generated from `apps/prompt_history/` and `apps/ai_services/` source code.*
