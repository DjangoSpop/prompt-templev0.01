# AI Service — Prompt Optimization

Base path: `/api/v2/ai/`
Auth: `Authorization: Bearer <jwt>`

---

## Provider Architecture

```
Request
  └── RAGAgent._optimize_with_langchain()
        ├── [1] zai_claude   →  POST https://api.z.ai/api/anthropic         (claude-sonnet-4-5-20250929)
        ├── [2] deepseek     →  POST https://api.deepseek.com/v1             (deepseek-chat)
        └── [3] openrouter   →  POST https://openrouter.ai/api/v1            (nvidia/nemotron free)
              └── all failed → keyword fallback
```

All providers fire **in parallel**. First valid response wins. Total timeout: **8 seconds**.

### LangChain Orchestrator (chains / streaming)
```
LangChainOrchestrator.llm
  ├── [1] zai_claude   →  ChatAnthropic @ https://api.z.ai/api/anthropic
  ├── [2] zai_glm      →  ChatOpenAI    @ https://api.z.ai/api/paas/v4
  └── [3] deepseek     →  ChatOpenAI    @ https://api.deepseek.com/v1
```

---

## Heroku Config Vars

| Var | Purpose | Default in code |
|-----|---------|-----------------|
| `ANTHROPIC_AUTH_TOKEN` | ZAI API key for Claude endpoint | hardcoded fallback |
| `ZAI_API_KEY` | ZAI API key for GLM endpoint | hardcoded fallback |
| `DEEPSEEK_API_KEY` | DeepSeek API key | hardcoded fallback |
| `OPENROUTER_API_KEY` | OpenRouter key | none (provider skipped) |
| `ZAI_CLAUDE_MODEL` | Override Claude model | `claude-sonnet-4-5-20250929` |
| `ZAI_ANTHROPIC_BASE_URL` | Override Anthropic endpoint | `https://api.z.ai/api/anthropic` |

> `ANTHROPIC_AUTH_TOKEN` and `ZAI_API_KEY` are the **same credential** — set both to your ZAI key.

---

## Active Endpoints

### 1. Optimize Prompt (JSON)

```
POST /api/v2/ai/optimization/
```

**Request**
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
| `mode` | `"fast"` \| `"deep"` | no | fast=3 credits, deep=8 credits |
| `provider` | `"auto"` \| `"zai_claude"` \| `"deepseek"` \| `"openrouter"` | no | default `auto` |
| `context` | object | no | extra context passed to the agent |

**Response 200**
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

**Error responses**
| Status | Body | Cause |
|--------|------|-------|
| 400 | `{"error": "original … is required"}` | missing prompt |
| 402 | `{"error": "insufficient_credits", "credits_available": N, "credits_required": N}` | not enough credits |
| 402 | `{"error": "no_subscription"}` | no active subscription |
| 500 | `{"error": "…"}` | unhandled exception |

---

### 2. Optimize Prompt (SSE Stream)

```
POST /api/v2/ai/optimization/stream/
```

Same request body as above. Response is `text/event-stream`.

**Event sequence**
```
event: meta
data: {"status": "connected", "run_id": "…"}

event: token
data: {"text": "Write a "}

event: token
data: {"text": "compelling…"}

event: complete
data: {"optimized": "…", "diff_summary": "…", "credits_consumed": 3}

event: error          ← only on failure
data: {"error": "…"}
```

---

### 3. Agent Optimize (lightweight, no credit gate)

```
POST /api/v2/ai/agent/optimize/
```

Direct call to the RAG agent — no credit reservation.
Useful for internal tooling or testing.

**Request**
```json
{ "prompt": "Summarise this article:", "mode": "fast" }
```

**Response 200** — same shape as `/optimization/`.

---

### 4. Agent Stats

```
GET /api/v2/ai/agent/stats/
```

Returns the current provider status and configuration.

```json
{
  "providers": ["zai_claude", "deepseek"],
  "active": true,
  "timeout_s": 8
}
```

---

## System Prompt (controls output quality)

Defined in `rag_service.py → RAGAgent._SYSTEM_PROMPT`.
Currently:

```
You are a prompt engineering expert.
Improve the given prompt to be clearer, more specific, and more effective.
Reply ONLY in this exact format (no extra text):
OPTIMIZED PROMPT:
<improved version>

IMPROVEMENTS:
- <change 1>
- <change 2>
```

**To iterate on quality** — edit `_SYSTEM_PROMPT` in `rag_service.py`.
Key levers:

| Lever | Current value | Try |
|-------|--------------|-----|
| `max_tokens` | 400 | 600 for deeper rewrites |
| `temperature` | 0.7 | 0.4 for more deterministic output |
| `PROVIDER_TIMEOUT` | 8s | 10s if Claude is slow |
| System prompt style | format-constrained | Add few-shot examples for better results |
| Context sent | first 400 chars of RAG docs | 800 chars if RAG is populated |

---

## Iteration Checklist

- [ ] Set `ANTHROPIC_AUTH_TOKEN` + `ZAI_API_KEY` on Heroku (same value — your ZAI key)
- [ ] Confirm logs show `providers: ['zai_claude', 'deepseek']` after deploy
- [ ] Test `POST /api/v2/ai/optimization/` — target: response in < 10s
- [ ] If `zai_claude` times out consistently → increase `PROVIDER_TIMEOUT` to 10
- [ ] If output quality is poor → tune `_SYSTEM_PROMPT` (add examples or domain rules)
- [ ] If credits burn too fast → lower `COST_FAST` in `PromptOptimizationView`
- [ ] Add `OPENROUTER_API_KEY` on Heroku to enable the third fallback provider

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/ai_services/rag_service.py` | RAGAgent — provider routing, system prompt, timeout |
| `apps/ai_services/views.py` | PromptOptimizationView, PromptOptimizationSSEView |
| `apps/ai_services/orchestration/langchain_orchestrator.py` | LangChain chains (streaming, RAG) |
| `promptcraft/settings.py` → `ZAI_CONFIG` | All provider URLs and model names |
