# Sprint 5: Multi-AI Broadcaster (Killer Feature)

> **Priority:** 🟠 HIGH | **Duration:** 5–6 Days | **Revenue Impact:** Viral growth + premium upsell

---

## 1. Sprint Objective

Build the feature that **no competitor has**: send one optimized prompt to multiple AI models simultaneously and compare results side-by-side. This is the **viral growth feature** — users will screenshot comparisons and share them, driving organic signups.

---

## 2. Why This Feature Wins

| Competitor | What They Offer | What We Offer |
|-----------|----------------|---------------|
| ChatGPT Plus | Single model (GPT-4) | 3+ models racing side-by-side |
| Claude Pro | Single model (Claude) | Compare Claude vs DeepSeek vs open models |
| Poe | Switch between models one at a time | All models simultaneously with scoring |
| PromptPerfect | Optimize only, no comparison | Optimize + broadcast + auto-score |

**The "Wow Effect":** User submits a prompt → sees 3 AI models racing to respond in real-time → gets a quality comparison → can merge the best parts into one response. This is visually striking, immediately useful, and inherently shareable.

---

## 3. Available Providers (Already Installed)

| Provider | Package | Status | Cost |
|----------|---------|--------|------|
| DeepSeek | `openai` (2.3.0) — OpenAI-compatible | ✅ Working | $0.14/1M in |
| Claude | `langchain-anthropic` (0.3.19) | ❌ Unused | $3/1M in (Haiku) |
| OpenRouter Free | via `openai` client | ⚠️ Configured in views.py | $0 (free tier) |
| OpenAI | `openai` (2.3.0) | ⚠️ Key needed | $0.50/1M in (GPT-4o-mini) |

**Minimum viable broadcast:** DeepSeek + 2 free OpenRouter models = $0 marginal cost beyond DeepSeek.

---

## 4. Implementation Tasks

### Task 1: Broadcast Service (4–5 hrs)

**New file:** `broadcast_service.py`

```python
"""
Multi-AI Broadcast Service

Sends one prompt to multiple AI providers simultaneously,
collects responses, and scores them comparatively.
"""
import asyncio
import time
import logging
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

import httpx
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


@dataclass
class ModelResponse:
    """Response from a single AI model"""
    provider: str
    model: str
    content: str
    tokens_in: int
    tokens_out: int
    latency_ms: int
    error: Optional[str] = None
    scores: Optional[Dict[str, float]] = None


@dataclass
class BroadcastResult:
    """Aggregated result from all models"""
    prompt: str
    responses: List[ModelResponse]
    best_overall: Optional[str] = None
    merged_response: Optional[str] = None
    comparison_summary: Optional[str] = None
    total_latency_ms: int = 0


class BroadcastService:
    """Orchestrates parallel AI calls and comparison scoring"""

    # Provider configurations
    PROVIDERS = {
        'deepseek': {
            'base_url': 'https://api.deepseek.com/v1/chat/completions',
            'model': 'deepseek-chat',
            'key_setting': 'DEEPSEEK_API_KEY',
        },
        'openrouter_qwen': {
            'base_url': 'https://openrouter.ai/api/v1/chat/completions',
            'model': 'qwen/qwen3-next-80b-a3b-instruct:free',
            'key_setting': 'OPENROUTER_API_KEY',
        },
        'openrouter_deepseek_r1': {
            'base_url': 'https://openrouter.ai/api/v1/chat/completions',
            'model': 'deepseek/deepseek-r1-0528:free',
            'key_setting': 'OPENROUTER_API_KEY',
        },
    }

    def __init__(self):
        self.timeout = 30  # seconds per model

    async def broadcast(
        self,
        prompt: str,
        providers: List[str] = None,
        max_tokens: int = 1000,
    ) -> BroadcastResult:
        """
        Send prompt to all providers simultaneously.
        Returns aggregated results with timing.
        """
        if providers is None:
            providers = list(self.PROVIDERS.keys())

        # Filter to only configured providers
        active_providers = []
        for p in providers:
            if p in self.PROVIDERS:
                key_setting = self.PROVIDERS[p]['key_setting']
                api_key = getattr(settings, key_setting, '') or ''
                # Check nested config objects too
                if not api_key:
                    config_name = key_setting.replace('_API_KEY', '_CONFIG')
                    config = getattr(settings, config_name, {}) or {}
                    api_key = config.get('API_KEY', '')
                if api_key:
                    active_providers.append(p)

        if not active_providers:
            return BroadcastResult(prompt=prompt, responses=[], total_latency_ms=0)

        start_time = time.time()

        # Fire all requests simultaneously
        tasks = [
            self._call_provider(p, prompt, max_tokens)
            for p in active_providers
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        model_responses = []
        for provider_name, result in zip(active_providers, responses):
            if isinstance(result, Exception):
                model_responses.append(ModelResponse(
                    provider=provider_name,
                    model=self.PROVIDERS[provider_name]['model'],
                    content='',
                    tokens_in=0, tokens_out=0, latency_ms=0,
                    error=str(result),
                ))
            else:
                model_responses.append(result)

        total_latency = int((time.time() - start_time) * 1000)

        return BroadcastResult(
            prompt=prompt,
            responses=model_responses,
            total_latency_ms=total_latency,
        )

    async def _call_provider(self, provider_name: str, prompt: str, max_tokens: int) -> ModelResponse:
        """Call a single AI provider"""
        config = self.PROVIDERS[provider_name]
        start = time.time()

        # Get API key
        key_setting = config['key_setting']
        api_key = getattr(settings, key_setting, '')
        if not api_key:
            config_name = key_setting.replace('_API_KEY', '_CONFIG')
            api_key = (getattr(settings, config_name, {}) or {}).get('API_KEY', '')

        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        }
        if 'openrouter' in provider_name:
            headers['HTTP-Referer'] = 'https://prompttemple.com'
            headers['X-Title'] = 'Prompt Temple'

        body = {
            'model': config['model'],
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens,
            'temperature': 0.7,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(config['base_url'], headers=headers, json=body)
                resp.raise_for_status()
                data = resp.json()

                choice = data['choices'][0]['message']['content']
                usage = data.get('usage', {})

                return ModelResponse(
                    provider=provider_name,
                    model=config['model'],
                    content=choice,
                    tokens_in=usage.get('prompt_tokens', 0),
                    tokens_out=usage.get('completion_tokens', 0),
                    latency_ms=int((time.time() - start) * 1000),
                )

        except Exception as e:
            return ModelResponse(
                provider=provider_name,
                model=config['model'],
                content='',
                tokens_in=0, tokens_out=0,
                latency_ms=int((time.time() - start) * 1000),
                error=str(e),
            )

    async def score_responses(self, broadcast_result: BroadcastResult) -> BroadcastResult:
        """Use DeepSeek to score and compare all responses"""
        successful = [r for r in broadcast_result.responses if not r.error and r.content]
        if len(successful) < 2:
            return broadcast_result

        comparison_prompt = f"""Compare these AI responses to the same prompt and score each on a scale of 1-10.

ORIGINAL PROMPT: {broadcast_result.prompt[:500]}

{chr(10).join([f'RESPONSE {i+1} ({r.provider}/{r.model}):{chr(10)}{r.content[:800]}' for i, r in enumerate(successful)])}

Score each response on: completeness (1-10), clarity (1-10), accuracy (1-10), creativity (1-10).

Return JSON:
{{
    "scores": [
        {{"provider": "name", "completeness": 8, "clarity": 9, "accuracy": 8, "creativity": 7, "overall": 8.0}},
        ...
    ],
    "best_overall": "provider_name",
    "comparison_summary": "Brief analysis of strengths/weaknesses"
}}

Return ONLY valid JSON."""

        try:
            from .orchestration.langchain_orchestrator import get_orchestrator
            orchestrator = get_orchestrator()
            result = await orchestrator.llm.ainvoke(comparison_prompt)
            content = result.content if hasattr(result, 'content') else str(result)

            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0]
            parsed = json.loads(content.strip())

            # Apply scores to responses
            for score_data in parsed.get('scores', []):
                for resp in broadcast_result.responses:
                    if resp.provider == score_data.get('provider'):
                        resp.scores = score_data

            broadcast_result.best_overall = parsed.get('best_overall')
            broadcast_result.comparison_summary = parsed.get('comparison_summary')

        except Exception as e:
            logger.error(f"Response scoring failed: {e}")

        return broadcast_result


# Singleton
_broadcast_service = None

def get_broadcast_service() -> BroadcastService:
    global _broadcast_service
    if _broadcast_service is None:
        _broadcast_service = BroadcastService()
    return _broadcast_service
```

### Task 2: Broadcast API Endpoint (2–3 hrs)

**File:** `views.py`

```python
class BroadcastView(AICreditGateMixin, APIView):
    """
    POST /ai/broadcast/

    Send one prompt to multiple AI models simultaneously.
    Credit cost: 8
    """
    permission_classes = [permissions.IsAuthenticated]
    CREDIT_COST = 8

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        providers = request.data.get('providers', None)  # None = all
        include_scoring = request.data.get('score', True)

        if not prompt:
            return Response({'error': 'prompt is required'}, status=400)

        # Reserve credits
        try:
            sub = self.reserve_credits(request.user, cost=self.CREDIT_COST)
        except InsufficientCreditsError as e:
            return Response({'error': 'insufficient_credits', 'credits_available': e.available}, status=402)
        except NoSubscriptionError:
            return Response({'error': 'no_subscription'}, status=402)

        try:
            from .broadcast_service import get_broadcast_service
            service = get_broadcast_service()

            # Run broadcast
            from asgiref.sync import async_to_sync
            result = async_to_sync(service.broadcast)(prompt, providers)

            # Score if requested
            if include_scoring and len([r for r in result.responses if not r.error]) >= 2:
                result = async_to_sync(service.score_responses)(result)

            self.settle_credits(sub, reserved=self.CREDIT_COST, actual=self.CREDIT_COST)

            # Build response
            response_data = {
                'prompt': prompt,
                'responses': [
                    {
                        'provider': r.provider,
                        'model': r.model,
                        'content': r.content,
                        'latency_ms': r.latency_ms,
                        'tokens_out': r.tokens_out,
                        'scores': r.scores,
                        'error': r.error,
                    }
                    for r in result.responses
                ],
                'best_overall': result.best_overall,
                'comparison_summary': result.comparison_summary,
                'total_latency_ms': result.total_latency_ms,
                'credits_consumed': self.CREDIT_COST,
            }

            AIUsageRecord.objects.create(
                user=request.user, feature='other', session_id='broadcast',
                model='multi-model', status='success',
                credits_consumed=self.CREDIT_COST,
                latency_ms=result.total_latency_ms,
            )

            return Response(response_data)

        except Exception as e:
            self.refund_reservation(sub, self.CREDIT_COST)
            logger.error(f"Broadcast failed: {e}")
            return Response({'error': 'broadcast_failed', 'detail': str(e)}, status=500)
```

### Task 3: SSE Streaming Broadcast (3–4 hrs)

**New endpoint:** `POST /ai/broadcast/stream/`

Streams each model's response as it arrives — the "racing" effect:

```python
class BroadcastStreamView(AICreditGateMixin, APIView):
    """SSE streaming broadcast — models race to respond"""
    permission_classes = [permissions.IsAuthenticated]
    CREDIT_COST = 8

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'prompt is required'}, status=400)

        try:
            sub = self.reserve_credits(request.user, cost=self.CREDIT_COST)
        except (InsufficientCreditsError, NoSubscriptionError) as e:
            return Response({'error': str(e)}, status=402)

        def stream():
            import asyncio
            from .broadcast_service import get_broadcast_service

            yield f'event: broadcast_start\ndata: {json.dumps({"prompt": prompt[:100]})}\n\n'

            service = get_broadcast_service()
            loop = asyncio.new_event_loop()

            try:
                result = loop.run_until_complete(service.broadcast(prompt))

                # Emit each response as it completes (already parallel)
                for resp in result.responses:
                    event_data = {
                        'provider': resp.provider,
                        'model': resp.model,
                        'content': resp.content,
                        'latency_ms': resp.latency_ms,
                        'error': resp.error,
                    }
                    yield f'event: model_response\ndata: {json.dumps(event_data)}\n\n'

                # Score
                if len([r for r in result.responses if not r.error]) >= 2:
                    result = loop.run_until_complete(service.score_responses(result))

                self.settle_credits(sub, reserved=self.CREDIT_COST, actual=self.CREDIT_COST)

                completion = {
                    'best_overall': result.best_overall,
                    'comparison_summary': result.comparison_summary,
                    'credits_consumed': self.CREDIT_COST,
                }
                yield f'event: broadcast_complete\ndata: {json.dumps(completion)}\n\n'

            except Exception as exc:
                self.refund_reservation(sub, self.CREDIT_COST)
                yield f'event: error\ndata: {json.dumps({"error": str(exc)})}\n\n'
            finally:
                loop.close()

        response = StreamingHttpResponse(stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
```

### Task 4: URL Configuration (15 min)

```python
# urls.py
path('broadcast/', views.BroadcastView.as_view(), name='ai-broadcast'),
path('broadcast/stream/', views.BroadcastStreamView.as_view(), name='ai-broadcast-stream'),
```

### Task 5: Add Claude via langchain-anthropic (1 hr)

The `langchain-anthropic` package (0.3.19) is already installed. Add Claude Haiku as a provider:

```python
# In broadcast_service.py PROVIDERS dict:
'anthropic_haiku': {
    'base_url': 'https://api.anthropic.com/v1/messages',
    'model': 'claude-3-haiku-20240307',
    'key_setting': 'ANTHROPIC_API_KEY',
    'is_anthropic': True,  # Different API format
},
```

Handle Anthropic's different API format in `_call_provider()`:

```python
if config.get('is_anthropic'):
    body = {
        'model': config['model'],
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': max_tokens,
    }
    headers['x-api-key'] = api_key
    headers['anthropic-version'] = '2023-06-01'
    del headers['Authorization']
    # Parse Anthropic response format
    data = resp.json()
    choice = data['content'][0]['text']
```

---

## 5. Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | Broadcast sends to 3+ providers in parallel | Logs show simultaneous API calls |
| 2 | Total latency ≈ slowest single provider (not cumulative) | 3 models in ~3-5 seconds total, not 9-15 |
| 3 | Scoring compares responses with specific metrics | JSON has completeness, clarity, accuracy per model |
| 4 | SSE stream delivers model responses as they arrive | EventSource shows progressive model results |
| 5 | Credits charged once (8 credits) for multi-model call | AIUsageRecord shows 8, not 8 × 3 |
| 6 | Failed providers don't block successful ones | One provider timeout → other 2 still return |
| 7 | Pro-tier only (free users get 402) | Free user sees upgrade prompt |

---

## 6. Definition of Done

- [ ] `POST /ai/broadcast/` returns responses from 3+ models
- [ ] Parallel execution (total time < 2× slowest model)
- [ ] Scoring endpoint rates responses on 4 dimensions
- [ ] SSE streaming delivers real-time model racing effect
- [ ] Credit gating: 8 credits per broadcast
- [ ] Error isolation: failed providers don't crash broadcast
- [ ] URL routes configured and documented
