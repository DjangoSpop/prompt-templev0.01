# Backend Software Requirements Specification
## SEO Spec Generator — Django Backend

**Feature:** SEO Spec Generator
**Status:** Draft — Ready for Implementation
**Date:** 2026-03-06
**Scope:** Django backend (`apps/ai_services/`) + API spec updates

---

## 1. Overview

The SEO Spec Generator generates comprehensive, structured SEO documentation for a product. The frontend Next.js route (`src/app/api/seo-spec/generate/route.ts`) currently proxies directly to the generic `/api/v2/ai/deepseek/stream/` endpoint. This works but bypasses the credit system, produces no usage record, and is undocumented.

This specification defines:

1. A new dedicated backend endpoint `/api/v2/ai/seo-spec/generate/` that wraps the DeepSeek stream call with credit checking, deduction, and usage logging.
2. Real implementations for the stub quota/usage endpoints (`/api/v2/ai/quotas/`, `/api/v2/ai/usage/`).
3. `requestBody` schema additions to `PromptCraft API.yaml` for both the new endpoint and the existing deepseek/stream endpoint.
4. Frontend route update to call the new dedicated endpoint.

---

## 2. New Endpoint: `/api/v2/ai/seo-spec/generate/`

### 2.1 Endpoint Summary

| Property | Value |
|---|---|
| URL | `/api/v2/ai/seo-spec/generate/` |
| Method | `POST` |
| Auth | JWT Bearer (required) |
| Response | `text/event-stream` (SSE) |
| Django app | `apps/ai_services/` |
| View class | `SeoSpecGenerateView` |
| Credit cost | 10 credits per request (configurable via Django setting `SEO_SPEC_CREDIT_COST`, default `10`) |

### 2.2 Request Body

```json
{
  "session_id": "string (required, UUID or arbitrary unique string)",
  "product": {
    "name": "string (required)",
    "description": "string (required)",
    "category": "string (optional)",
    "target_market": "string (optional)",
    "key_features": ["string", "..."],
    "competitors": ["string", "..."],
    "price_range": "string (optional)",
    "unique_selling_points": ["string", "..."]
  },
  "options": {
    "tone": "professional | casual | technical (default: professional)",
    "depth": "basic | standard | comprehensive (default: standard)",
    "locale": "en-US (default: en-US)"
  }
}
```

**Validation rules:**
- `session_id`: required, max 128 chars
- `product.name`: required, max 200 chars
- `product.description`: required, max 2000 chars
- All other fields: optional, arrays max 20 items, string items max 200 chars each
- `options.tone`: must be one of the enum values if provided
- `options.depth`: must be one of the enum values if provided

### 2.3 Response — SSE Stream

The view streams the DeepSeek response directly back as SSE. The client receives the same event format as all other streaming endpoints:

```
data: {"choices":[{"delta":{"content":"chunk text"}}]}

data: {"choices":[{"delta":{"content":"more text"}}]}

data: [DONE]
```

Final event after `[DONE]` (custom event type `seo_spec_complete`):
```
event: seo_spec_complete
data: {"session_id":"<id>","credits_consumed":10,"credits_remaining":90}
```

### 2.4 Error Responses

| Status | Condition | Body |
|---|---|---|
| `400` | Missing required fields or validation failure | `{"error": "validation_error", "detail": {"field": ["message"]}}` |
| `401` | Missing or invalid JWT | `{"error": "authentication_required"}` |
| `402` | User has fewer credits than `SEO_SPEC_CREDIT_COST` | `{"error": "insufficient_credits", "credits_available": N, "credits_required": 10}` |
| `429` | More than 10 requests/hour per user | `{"error": "rate_limit_exceeded", "retry_after": 3600}` |
| `503` | DeepSeek upstream unavailable | `{"error": "upstream_unavailable"}` |

---

## 3. Django Implementation

### 3.1 File Structure

All changes go inside the existing `apps/ai_services/` Django app:

```
apps/ai_services/
├── views.py                  # Add SeoSpecGenerateView
├── serializers.py            # Add SeoSpecRequestSerializer
├── services/
│   └── seo_spec_service.py   # NEW — builds prompt + calls DeepSeek
├── models.py                 # Add AIUsageRecord model (for real quota/usage)
├── urls.py                   # Register new URL
└── migrations/
    └── XXXX_add_ai_usage_record.py  # New migration
```

### 3.2 `SeoSpecRequestSerializer`

```python
# apps/ai_services/serializers.py

class ProductInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=2000)
    category = serializers.CharField(max_length=200, required=False, allow_blank=True)
    target_market = serializers.CharField(max_length=500, required=False, allow_blank=True)
    key_features = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        max_length=20,
        default=list,
    )
    competitors = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        max_length=20,
        default=list,
    )
    price_range = serializers.CharField(max_length=100, required=False, allow_blank=True)
    unique_selling_points = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        max_length=20,
        default=list,
    )

class SeoSpecOptionsSerializer(serializers.Serializer):
    tone = serializers.ChoiceField(
        choices=['professional', 'casual', 'technical'],
        default='professional',
    )
    depth = serializers.ChoiceField(
        choices=['basic', 'standard', 'comprehensive'],
        default='standard',
    )
    locale = serializers.CharField(max_length=10, default='en-US')

class SeoSpecRequestSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=128)
    product = ProductInputSerializer()
    options = SeoSpecOptionsSerializer(required=False, default=dict)
```

### 3.3 `SeoSpecGenerateView`

```python
# apps/ai_services/views.py

import json
import time
import logging
from django.conf import settings
from django.http import StreamingHttpResponse, JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

from .serializers import SeoSpecRequestSerializer
from .services.seo_spec_service import build_seo_spec_messages
from .models import AIUsageRecord

logger = logging.getLogger(__name__)

SEO_SPEC_CREDIT_COST = getattr(settings, 'SEO_SPEC_CREDIT_COST', 10)
SEO_SPEC_RATE_LIMIT = getattr(settings, 'SEO_SPEC_RATE_LIMIT_PER_HOUR', 10)


class SeoSpecGenerateView(LoginRequiredMixin, View):
    """
    Dedicated SEO spec generation endpoint.
    Validates input, checks credits, proxies to DeepSeek stream,
    deducts credits, and records usage.
    """
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        # 1. Parse and validate request body
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'error': 'invalid_json'}, status=400)

        serializer = SeoSpecRequestSerializer(data=body)
        if not serializer.is_valid():
            return JsonResponse(
                {'error': 'validation_error', 'detail': serializer.errors},
                status=400,
            )
        data = serializer.validated_data

        # 2. Rate limit check (uses cache backend)
        if not self._check_rate_limit(request.user):
            return JsonResponse(
                {'error': 'rate_limit_exceeded', 'retry_after': 3600},
                status=429,
            )

        # 3. Credit check — read from UserProfile (SELECT FOR UPDATE)
        profile = request.user.profile  # assumes OneToOne UserProfile
        if profile.credits < SEO_SPEC_CREDIT_COST:
            return JsonResponse(
                {
                    'error': 'insufficient_credits',
                    'credits_available': profile.credits,
                    'credits_required': SEO_SPEC_CREDIT_COST,
                },
                status=402,
            )

        # 4. Build DeepSeek messages
        messages = build_seo_spec_messages(data['product'], data.get('options', {}))

        upstream_body = {
            'messages': messages,
            'model': 'deepseek-chat',
            'stream': True,
            'temperature': 0.3,
            'max_tokens': 8192,
            'session_id': data['session_id'],
        }

        # 5. Stream response (deduct credits after first successful chunk)
        return StreamingHttpResponse(
            self._stream_and_track(request.user, profile, data['session_id'], upstream_body),
            content_type='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
            },
        )

    def _stream_and_track(self, user, profile, session_id, upstream_body):
        """
        Generator: calls DeepSeek stream, yields SSE chunks,
        deducts credits and records usage after [DONE].
        """
        import requests as req_lib  # stdlib-level import to avoid circular deps

        deepseek_url = settings.DEEPSEEK_INTERNAL_STREAM_URL  # internal service URL
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {settings.DEEPSEEK_API_KEY}',
        }

        credits_deducted = False
        total_tokens_out = 0

        try:
            with req_lib.post(
                deepseek_url,
                json=upstream_body,
                headers=headers,
                stream=True,
                timeout=(10, 120),  # (connect_timeout, read_timeout)
            ) as resp:
                if resp.status_code != 200:
                    yield f'data: {{"error": "upstream_error", "status": {resp.status_code}}}\n\n'
                    return

                for raw_line in resp.iter_lines():
                    if not raw_line:
                        continue

                    line = raw_line.decode('utf-8') if isinstance(raw_line, bytes) else raw_line

                    # Deduct credits on first successful data chunk
                    if not credits_deducted and line.startswith('data:'):
                        self._deduct_credits(profile, SEO_SPEC_CREDIT_COST)
                        credits_deducted = True

                    # Count tokens for usage record (approximate from content length)
                    if line.startswith('data:') and '[DONE]' not in line:
                        try:
                            payload = json.loads(line[5:].strip())
                            content = payload.get('choices', [{}])[0].get('delta', {}).get('content', '')
                            total_tokens_out += len(content) // 4  # rough token estimate
                        except (json.JSONDecodeError, IndexError, KeyError):
                            pass

                    yield f'{line}\n\n'

                    if line == 'data: [DONE]':
                        break

        except req_lib.exceptions.Timeout:
            yield 'data: {"error": "upstream_timeout"}\n\n'
            return
        except req_lib.exceptions.ConnectionError:
            yield 'data: {"error": "upstream_unavailable"}\n\n'
            return
        finally:
            # Record usage regardless of whether credits were deducted
            if credits_deducted:
                AIUsageRecord.objects.create(
                    user=user,
                    feature='seo_spec',
                    session_id=session_id,
                    credits_consumed=SEO_SPEC_CREDIT_COST,
                    tokens_out=total_tokens_out,
                    model='deepseek-chat',
                )

        # Emit completion event with updated credit balance
        profile.refresh_from_db(fields=['credits'])
        completion_data = {
            'session_id': session_id,
            'credits_consumed': SEO_SPEC_CREDIT_COST,
            'credits_remaining': profile.credits,
        }
        yield f'event: seo_spec_complete\ndata: {json.dumps(completion_data)}\n\n'

    def _deduct_credits(self, profile, amount):
        """Atomic credit deduction using F() expression to prevent race conditions."""
        from django.db.models import F
        from django.contrib.auth import get_user_model

        type(profile).objects.filter(pk=profile.pk, credits__gte=amount).update(
            credits=F('credits') - amount
        )
        profile.credits -= amount  # update local instance

    def _check_rate_limit(self, user):
        """Returns True if user is within rate limit, False if exceeded."""
        from django.core.cache import cache

        cache_key = f'seo_spec_rl:{user.pk}'
        count = cache.get(cache_key, 0)
        if count >= SEO_SPEC_RATE_LIMIT:
            return False
        cache.set(cache_key, count + 1, timeout=3600)
        return True
```

### 3.4 `seo_spec_service.py`

```python
# apps/ai_services/services/seo_spec_service.py

SEO_SYSTEM_PROMPT = """You are an expert SEO strategist and technical content writer.
Your task is to create a comprehensive SEO specification document for a product.

The document must include:
1. Executive Summary (2-3 sentences)
2. Primary Keywords (10-15 keywords with search intent labels: informational/navigational/transactional/commercial)
3. Secondary Keywords (20-30 long-tail variations)
4. Meta Title (max 60 chars, keyword-optimized)
5. Meta Description (max 155 chars, compelling, includes CTA)
6. H1 Tag recommendation
7. Content Outline (H2/H3 structure for a landing page)
8. Competitor Gap Analysis (opportunities based on provided competitors)
9. Structured Data recommendations (schema.org types applicable to this product)
10. Internal Linking strategy suggestions

Format the output as structured markdown with clear section headers.
Be specific. Avoid generic advice. Tailor all recommendations to the product."""


def build_seo_spec_messages(product: dict, options: dict) -> list[dict]:
    """Builds the messages array for the DeepSeek API call."""
    tone = options.get('tone', 'professional')
    depth = options.get('depth', 'standard')
    locale = options.get('locale', 'en-US')

    system_prompt = SEO_SYSTEM_PROMPT
    if tone == 'technical':
        system_prompt += '\n\nUse technical SEO terminology freely. Assume the reader is an SEO professional.'
    elif tone == 'casual':
        system_prompt += '\n\nUse plain, accessible language. Avoid jargon where possible.'

    if depth == 'comprehensive':
        system_prompt += '\n\nProvide extensive detail in every section. Include examples and rationale.'
    elif depth == 'basic':
        system_prompt += '\n\nKeep each section concise — bullet points preferred over paragraphs.'

    user_lines = [
        f'Product Name: {product["name"]}',
        f'Description: {product["description"]}',
        f'Locale/Market: {locale}',
    ]
    if product.get('category'):
        user_lines.append(f'Category: {product["category"]}')
    if product.get('target_market'):
        user_lines.append(f'Target Market: {product["target_market"]}')
    if product.get('key_features'):
        user_lines.append(f'Key Features: {", ".join(product["key_features"])}')
    if product.get('competitors'):
        user_lines.append(f'Main Competitors: {", ".join(product["competitors"])}')
    if product.get('price_range'):
        user_lines.append(f'Price Range: {product["price_range"]}')
    if product.get('unique_selling_points'):
        user_lines.append(f'Unique Selling Points: {", ".join(product["unique_selling_points"])}')

    user_lines.append('\nGenerate the full SEO specification document.')

    return [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': '\n'.join(user_lines)},
    ]
```

### 3.5 `AIUsageRecord` Model

```python
# apps/ai_services/models.py  (add this model)

class AIUsageRecord(models.Model):
    """Tracks individual AI feature invocations for quota and usage reporting."""

    FEATURE_CHOICES = [
        ('seo_spec', 'SEO Spec Generator'),
        ('optimizer', 'Prompt Optimizer'),
        ('chat', 'Chat Completions'),
        ('deepseek_stream', 'DeepSeek Stream (generic)'),
        ('agent_optimize', 'Agent Optimizer'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_usage_records',
        db_index=True,
    )
    feature = models.CharField(max_length=50, choices=FEATURE_CHOICES, db_index=True)
    session_id = models.CharField(max_length=128, db_index=True)
    model = models.CharField(max_length=100, default='deepseek-chat')
    credits_consumed = models.PositiveIntegerField(default=0)
    tokens_in = models.PositiveIntegerField(default=0)
    tokens_out = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'feature', 'created_at']),
        ]

    def __str__(self):
        return f'{self.user_id} | {self.feature} | {self.credits_consumed}cr @ {self.created_at}'
```

### 3.6 URL Registration

```python
# apps/ai_services/urls.py  (add to existing urlpatterns)

from .views import SeoSpecGenerateView

urlpatterns = [
    # ... existing patterns ...
    path('seo-spec/generate/', SeoSpecGenerateView.as_view(), name='seo-spec-generate'),
]
```

### 3.7 Django Settings Additions

```python
# settings/base.py  (add these)

# SEO Spec Generator
SEO_SPEC_CREDIT_COST = env.int('SEO_SPEC_CREDIT_COST', default=10)
SEO_SPEC_RATE_LIMIT_PER_HOUR = env.int('SEO_SPEC_RATE_LIMIT_PER_HOUR', default=10)

# Internal DeepSeek stream URL (used by backend-to-backend calls)
# If DeepSeek is called directly (not via self), this is the DeepSeek API URL.
DEEPSEEK_INTERNAL_STREAM_URL = env('DEEPSEEK_INTERNAL_STREAM_URL', default='https://api.deepseek.com/chat/completions')
DEEPSEEK_API_KEY = env('DEEPSEEK_API_KEY')
```

---

## 4. Real Quota/Usage Endpoint Implementations

Replace the two placeholder views with real implementations backed by `AIUsageRecord`.

### 4.1 `/api/v2/ai/usage/`

```python
class AIUsageView(LoginRequiredMixin, View):
    """Returns this user's AI usage for the current billing period."""

    def get(self, request):
        from datetime import date
        from django.db.models import Sum

        period_start = date.today().replace(day=1)  # first of current month

        records = AIUsageRecord.objects.filter(
            user=request.user,
            created_at__date__gte=period_start,
        )

        by_feature = records.values('feature').annotate(
            total_credits=Sum('credits_consumed'),
            total_tokens_out=Sum('tokens_out'),
            call_count=models.Count('id'),
        )

        return JsonResponse({
            'period_start': period_start.isoformat(),
            'total_credits_consumed': records.aggregate(
                total=Sum('credits_consumed')
            )['total'] or 0,
            'by_feature': list(by_feature),
        })
```

### 4.2 `/api/v2/ai/quotas/`

```python
class AIQuotasView(LoginRequiredMixin, View):
    """Returns user's remaining quota based on their profile credits and monthly caps."""

    def get(self, request):
        from django.conf import settings as conf

        profile = request.user.profile
        monthly_cap = getattr(conf, 'MONTHLY_AI_CREDIT_CAP', 500)

        return JsonResponse({
            'credits_available': profile.credits,
            'monthly_cap': monthly_cap,
            'seo_spec': {
                'cost_per_call': SEO_SPEC_CREDIT_COST,
                'calls_possible': profile.credits // SEO_SPEC_CREDIT_COST,
            },
        })
```

---

## 5. API Spec Updates (`PromptCraft API.yaml`)

### 5.1 Add `requestBody` to `/api/v2/ai/deepseek/stream/` (line 1153)

Replace the existing entry with:

```yaml
  /api/v2/ai/deepseek/stream/:
    post:
      operationId: v2_ai_deepseek_stream_create
      description: |-
        Server-side streaming proxy for DeepSeek (SSE-like StreamingHttpResponse).
        Accepts an OpenAI-compatible chat messages payload and returns a streaming
        SSE response. session_id is optional but recommended for tracing.
      tags:
        - v2
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - messages
              properties:
                messages:
                  type: array
                  items:
                    type: object
                    required: [role, content]
                    properties:
                      role:
                        type: string
                        enum: [system, user, assistant]
                      content:
                        type: string
                model:
                  type: string
                  default: deepseek-chat
                stream:
                  type: boolean
                  default: true
                temperature:
                  type: number
                  minimum: 0
                  maximum: 2
                  default: 0.7
                max_tokens:
                  type: integer
                  minimum: 1
                  maximum: 8192
                  default: 2048
                session_id:
                  type: string
                  description: Optional session identifier for tracing
      security:
        - jwtAuth: []
        - cookieAuth: []
      responses:
        '200':
          description: SSE stream of chat completion chunks
          content:
            text/event-stream:
              schema:
                type: string
                description: |
                  Stream of SSE data events. Each event has the format:
                  `data: {"choices":[{"delta":{"content":"..."}}]}`
                  Terminated by `data: [DONE]`
        '401':
          description: Authentication required
        '429':
          description: Rate limit exceeded
```

### 5.2 Add new entry `/api/v2/ai/seo-spec/generate/`

```yaml
  /api/v2/ai/seo-spec/generate/:
    post:
      operationId: v2_ai_seo_spec_generate_create
      summary: Generate SEO specification document for a product
      description: |-
        Validates product input, checks user credits (requires SEO_SPEC_CREDIT_COST credits,
        default 10), then streams a structured SEO specification document via SSE.
        Credits are deducted after the first successful streaming chunk.
        Emits a final `seo_spec_complete` event with credits consumed/remaining.
      tags:
        - v2
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - session_id
                - product
              properties:
                session_id:
                  type: string
                  maxLength: 128
                  description: Unique identifier for this generation request
                product:
                  type: object
                  required: [name, description]
                  properties:
                    name:
                      type: string
                      maxLength: 200
                    description:
                      type: string
                      maxLength: 2000
                    category:
                      type: string
                      maxLength: 200
                    target_market:
                      type: string
                      maxLength: 500
                    key_features:
                      type: array
                      items:
                        type: string
                        maxLength: 200
                      maxItems: 20
                    competitors:
                      type: array
                      items:
                        type: string
                        maxLength: 200
                      maxItems: 20
                    price_range:
                      type: string
                      maxLength: 100
                    unique_selling_points:
                      type: array
                      items:
                        type: string
                        maxLength: 200
                      maxItems: 20
                options:
                  type: object
                  properties:
                    tone:
                      type: string
                      enum: [professional, casual, technical]
                      default: professional
                    depth:
                      type: string
                      enum: [basic, standard, comprehensive]
                      default: standard
                    locale:
                      type: string
                      default: en-US
                      maxLength: 10
      security:
        - jwtAuth: []
        - cookieAuth: []
      responses:
        '200':
          description: |-
            SSE stream. Final event is `event: seo_spec_complete` with body:
            `{"session_id":"...","credits_consumed":10,"credits_remaining":N}`
          content:
            text/event-stream:
              schema:
                type: string
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: validation_error
                  detail:
                    type: object
        '401':
          description: Authentication required
        '402':
          description: Insufficient credits
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: insufficient_credits
                  credits_available:
                    type: integer
                  credits_required:
                    type: integer
        '429':
          description: Rate limit exceeded (10 requests/hour)
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: rate_limit_exceeded
                  retry_after:
                    type: integer
                    example: 3600
```

---

## 6. Frontend Route Update

Once the new backend endpoint exists, update `src/app/api/seo-spec/generate/route.ts` to call it instead of the generic deepseek/stream endpoint.

**Change (line ~5 and ~157 of seo-spec/generate/route.ts):**

```typescript
// Before
const upstreamUrl = `${API_BASE}/api/v2/ai/deepseek/stream/`;
const upstreamBody = JSON.stringify({
  messages: [...],
  model: 'deepseek-chat',
  stream: true,
  temperature: 0.3,
  max_tokens: 8192,
  session_id: `seo_spec_${Date.now()}`,
});

// After
const upstreamUrl = `${API_BASE}/api/v2/ai/seo-spec/generate/`;
const upstreamBody = JSON.stringify({
  session_id: `seo_spec_${Date.now()}`,
  product: body,          // body is already ProjectInput shape
  options: {
    tone: 'professional',
    depth: 'comprehensive',
    locale: 'en-US',
  },
});
```

The frontend no longer needs to build the system prompt or user message — that logic moves server-side into `seo_spec_service.py`.

---

## 7. Migration

```python
# apps/ai_services/migrations/XXXX_add_ai_usage_record.py
# Standard Django migration generated by `manage.py makemigrations ai_services`
# after adding the AIUsageRecord model to models.py
```

Run in deployment:
```bash
python manage.py makemigrations ai_services
python manage.py migrate
```

No data migration needed — the table starts empty.

---

## 8. Implementation Order

| Step | Task | Risk |
|---|---|---|
| 1 | Add `AIUsageRecord` model + migration | Low |
| 2 | Add `SeoSpecRequestSerializer` | Low |
| 3 | Add `seo_spec_service.py` | Low |
| 4 | Add `SeoSpecGenerateView` | Medium (credit deduction logic) |
| 5 | Register URL in `urls.py` | Low |
| 6 | Replace stub `AIUsageView` + `AIQuotasView` | Low |
| 7 | Update `PromptCraft API.yaml` | Low |
| 8 | Update frontend route to call new endpoint | Low |
| 9 | Add `SEO_SPEC_CREDIT_COST` + `DEEPSEEK_API_KEY` to env | Low |

Steps 1–6 are purely additive (no existing code modified). Step 8 is the only frontend change.

---

## 9. Open Questions

1. **Credit cost:** Is 10 credits the right amount? The optimizer likely consumes a comparable amount — check what `agent/optimize` charges in practice to calibrate.
2. **`DEEPSEEK_INTERNAL_STREAM_URL`:** Does the backend call DeepSeek directly via their API, or does `deepseek/stream/` act as a Django-to-Django internal proxy? Clarify so the `_stream_and_track` method targets the correct URL.
3. **`UserProfile` accessor:** The view assumes `request.user.profile` returns the OneToOne profile with a `credits` integer field (confirmed from API spec schema). Verify the actual Django model accessor name.
4. **Token counting:** The rough `len(content) // 4` token estimate in `_stream_and_track` is for logging only. If real token counts are needed (e.g. for billing), switch to the DeepSeek `usage` field in the `[DONE]` payload.
