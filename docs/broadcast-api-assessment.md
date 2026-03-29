# Broadcast Feature - API & Implementation Assessment

> Last updated: 2026-03-29

---

## 1. Frontend Implementation Status: COMPLETE

All frontend code is production-ready and waiting for backend integration.

### Types (`src/types/broadcast.ts`)
- `BroadcastRequest` - prompt, providers[], score flag
- `BroadcastResult` - aggregated response with comparison_summary, best_overall
- `BroadcastModelState` - per-model streaming state (status, content, scores, latency, tokens)
- `ModelStreamUpdate` - SSE delta payload
- `ModelScores` - completeness, clarity, accuracy, creativity, overall (0-10 each)
- `ProviderId` - union type for 4 configured providers
- `AVAILABLE_PROVIDERS` - provider registry with name, model, icon, color, description

### API Client (`src/lib/api/broadcast.ts`)
- `broadcastToAll(request)` - POST `/api/v2/ai/broadcast/` (non-streaming)
- `streamBroadcast(request, onUpdate, signal)` - POST `/api/v2/ai/broadcast/stream/` (SSE)
- SSE parser handles `broadcast_start`, `model_response`, `broadcast_complete`, `error` events
- Credit header sync: `X-Credits-Remaining`, `X-Credits-Used`, `X-Low-Credits`, `X-Credits-Balance`, `X-Credits-Reserved`
- Error handling: 402 (insufficient credits / no subscription), generic fallback

### React Hook (`src/lib/hooks/useBroadcast.ts`)
- Full state machine: idle -> streaming -> complete | error
- Optimistic credit deduction (8 credits) with refund on error
- Stream delta merging (handles `delta`, `content_delta`, `text` field variants)
- AbortController support for cancellation
- Invalidates `/billing` queries on completion

### Components (`src/components/broadcast/`)
| Component | Purpose |
|-----------|---------|
| `BroadcastComposer` | Prompt input, provider selection, credit validation, submit |
| `RacingGrid` | Real-time model race with progress bars and streaming content |
| `ModelCard` | Individual model result with scores, expand/collapse, copy |
| `ScoringPanel` | Radar chart comparing all models across 4 axes |
| `ShareComparison` | Social sharing with OG metadata and copy-to-clipboard |

### Additional Frontend
- **OG Image**: `src/app/api/og/share/broadcast/route.tsx` - dynamic social card
- **Share Page**: `src/app/share/page.tsx` - supports `type=broadcast` parameter
- **i18n**: `public/locales/en/broadcast.json` + `public/locales/ar/broadcast.json` (82 keys)
- **Credit Cost**: `src/lib/api/helpers/credit-costs.ts` - `aiBroadcast: 8`

---

## 2. Backend Implementation Status: NOT IMPLEMENTED

The following backend endpoints and services must be built.

### Required Endpoints

#### `POST /api/v2/ai/broadcast/`
Non-streaming broadcast. Sends prompt to all selected providers, waits for all responses, returns aggregated result.

**Request:**
```json
{
  "prompt": "string",
  "providers": ["deepseek", "openrouter_qwen", "openrouter_deepseek_r1", "anthropic_haiku"],
  "score": true
}
```

**Response:**
```json
{
  "prompt": "string",
  "responses": [
    {
      "provider": "deepseek",
      "model": "deepseek-chat",
      "content": "string",
      "latency_ms": 1234,
      "tokens_out": 456,
      "scores": {
        "completeness": 8,
        "clarity": 7,
        "accuracy": 9,
        "creativity": 6,
        "overall": 7.5
      },
      "error": null
    }
  ],
  "best_overall": "deepseek",
  "comparison_summary": "string"
}
```

#### `POST /api/v2/ai/broadcast/stream/`
SSE streaming broadcast. Same request body, but returns Server-Sent Events.

**SSE Events:**
```
event: broadcast_start
data: {"providers": ["deepseek", "openrouter_qwen"]}

event: model_response
data: {"provider": "deepseek", "status": "streaming", "delta": "partial text...", "latency_ms": null, "tokens_out": null}

event: model_response
data: {"provider": "deepseek", "status": "complete", "content": "full text", "latency_ms": 1234, "tokens_out": 456, "scores": {...}}

event: broadcast_complete
data: {"best_overall": "deepseek", "comparison_summary": "..."}

event: error
data: {"code": "insufficient_credits", "message": "You need 8 credits"}
```

### Required Services

#### Broadcast Service (`broadcast_service.py`)
- Async parallel dispatch to all selected providers
- Per-provider timeout (recommended: 30s)
- Per-provider error isolation (one failing must not fail all)
- Response aggregation

#### Scoring Engine
- Evaluate each response on 4 axes: completeness, clarity, accuracy, creativity (0-10)
- Compute overall as average of 4 scores
- Determine `best_overall` provider
- Options: LLM-as-judge (use a fast model to score) or rule-based heuristics

#### Credit Middleware
- Validate user has >= 8 credits before starting
- Deduct 8 credits on broadcast start
- Refund on complete failure (all providers error)
- Return credit headers in response:
  - `X-Credits-Remaining`
  - `X-Credits-Used`
  - `X-Low-Credits` (boolean, true if < 10 remaining)
  - `X-Credits-Balance`
  - `X-Credits-Reserved`
- Return 402 with `{"error": "insufficient_credits"}` or `{"error": "no_subscription"}`

### Provider Integrations

| Provider ID | API | Model | Auth |
|-------------|-----|-------|------|
| `deepseek` | DeepSeek API (OpenAI-compatible) | `deepseek-chat` | `DEEPSEEK_API_KEY` |
| `openrouter_qwen` | OpenRouter API | `qwen/qwen3-next-80b-a3b-instruct:free` | `OPENROUTER_API_KEY` |
| `openrouter_deepseek_r1` | OpenRouter API | `deepseek/deepseek-r1-0528:free` | `OPENROUTER_API_KEY` |
| `anthropic_haiku` | Anthropic Messages API | `claude-3-haiku-20240307` | `ANTHROPIC_API_KEY` |

**Notes:**
- OpenRouter models marked `:free` have no per-token cost but may have rate limits
- Anthropic Haiku requires direct API key; marked `requiresKey: true` in frontend
- All providers support streaming responses

---

## 3. Production Readiness Checklist

### Backend (Must Build)
- [ ] Django views + URL routing for both endpoints
- [ ] Async parallel provider dispatch (asyncio / Django Channels)
- [ ] SSE response wrapper (StreamingHttpResponse, content-type: text/event-stream)
- [ ] Scoring logic implementation
- [ ] Credit middleware integration
- [ ] Per-user rate limiting (recommended: 5 broadcasts/minute)
- [ ] Per-provider error isolation and timeout handling
- [ ] Request validation (prompt length, valid provider IDs)
- [ ] Logging and monitoring (latency per provider, error rates)

### Frontend (Done - Minor Polish)
- [x] Types and interfaces
- [x] API client with SSE parsing
- [x] React hook with state management
- [x] All 6 UI components
- [x] Mobile responsive layout (updated 2026-03-29)
- [x] TempleCard theme integration (updated 2026-03-29)
- [x] Dark mode support
- [x] i18n (EN + AR)
- [x] OG image generation
- [x] Share functionality
- [x] Credit validation and optimistic updates

### Environment Variables Required
```env
# Backend
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=

# Frontend (already configured)
NEXT_PUBLIC_APP_URL=
```

### Testing Plan
1. Unit test scoring engine with known inputs
2. Integration test each provider individually
3. Test SSE streaming with mock delayed responses
4. Test credit deduction/refund flow
5. Test 402 responses trigger frontend upgrade modal
6. Load test parallel provider calls (3-4 concurrent per user)
7. Test provider timeout and partial failure scenarios
