# PromptCraft API Reference — Frontend Developer Handoff

> **Backend Version:** v2
> **Base URL:** `https://api.prompt-temple.com/api/v2/`
> **Last Updated:** 2026-03-24
> **Auth:** JWT Bearer Token
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Authentication](#2-authentication)
3. [User Profile & Settings](#3-user-profile--settings)
4. [Social OAuth](#4-social-oauth)
5. [Templates](#5-templates)
6. [AI Services](#6-ai-services)
7. [Chat & Template Extraction](#7-chat--template-extraction)
8. [Ask-Me Prompt Builder](#8-ask-me-prompt-builder)
9. [RAG & Research](#9-rag--research)
10. [Broadcast](#10-broadcast)
11. [Orchestrator](#11-orchestrator)
12. [Billing & Subscriptions](#12-billing--subscriptions)
13. [Prompt History & Saved Prompts](#13-prompt-history--saved-prompts)
14. [Skills & MCP Knowledge](#14-skills--mcp-knowledge)
15. [MCP Academy](#15-mcp-academy)
16. [Gamification](#16-gamification)
17. [Analytics](#17-analytics)
18. [Data Types & Enums](#18-data-types--enums)
19. [Error Handling](#19-error-handling)
20. [Streaming (SSE)](#20-streaming-sse)
21. [Rate Limits & Quotas](#21-rate-limits--quotas)
22. [Common Flows](#22-common-flows)

---

## 1. Quick Start

### Headers

Every authenticated request must include:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Base URLs

| Environment | URL |
|-------------|-----|
| Production  | `https://api.prompt-temple.com/api/v2/` |
| Staging     | `https://staging-api.prompt-temple.com/api/v2/` |
| Local       | `http://localhost:8000/api/v2/` |

### Health Check

```
GET /health/
→ { "status": "ok" }

GET /api/v2/core/health/
→ { "status": "healthy", "services": { "database": true, "redis": true, "ai_providers": true } }
```

---

## 2. Authentication

**Base path:** `/api/v2/auth/`

### Register

```
POST /auth/register/
```

**Request:**

```json
{
  "username": "string (required, unique)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 8 chars)",
  "password_confirm": "string (required, must match password)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "bio": "string (optional, max 500)",
  "theme_preference": "light | dark | system (optional, default: system)",
  "language_preference": "string (optional, default: en)"
}
```

**Response `201`:**

```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "avatar_url": "string | null",
    "credits": 100,
    "level": 1,
    "experience_points": 0,
    "daily_streak": 0,
    "user_rank": "Prompt Novice",
    "is_premium": false,
    "theme_preference": "system",
    "language_preference": "en",
    "created_at": "ISO 8601"
  },
  "tokens": {
    "access": "string (JWT, expires ~5min)",
    "refresh": "string (JWT, expires ~7days)"
  },
  "billing": {
    "plan_code": "FREE",
    "credits_balance": 100,
    "monthly_credits": 20,
    "max_requests_per_hour": 10,
    "max_requests_per_day": 30
  }
}
```

### Login

```
POST /auth/login/
```

**Request:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response `200`:** Same shape as register response.

### Logout

```
POST /auth/logout/
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
{ "detail": "Successfully logged out" }
```

### Refresh Token

```
POST /auth/refresh/
```

**Request:**

```json
{
  "refresh": "string (required, refresh JWT)"
}
```

**Response `200`:**

```json
{
  "access": "string (new access JWT)"
}
```

### Check Username Availability

```
GET /auth/check-username/?username=alice
```

**Response `200`:**

```json
{
  "available": true,
  "username": "alice"
}
```

### Check Email Availability

```
GET /auth/check-email/?email=alice@example.com
```

**Response `200`:**

```json
{
  "available": true,
  "email": "alice@example.com"
}
```

---

## 3. User Profile & Settings

**Base path:** `/api/v2/auth/`

### Get Profile

```
GET /auth/profile/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar_url": "string | null",
  "bio": "string",
  "credits": 100,
  "level": 1,
  "experience_points": 0,
  "daily_streak": 0,
  "user_rank": "Prompt Novice",
  "is_premium": false,
  "premium_expires_at": "ISO 8601 | null",
  "theme_preference": "system",
  "language_preference": "en",
  "ai_assistance_enabled": true,
  "analytics_enabled": true,
  "templates_created": 0,
  "templates_completed": 0,
  "total_prompts_generated": 0,
  "billing": {
    "plan_code": "FREE",
    "credits_balance": 100,
    "status": "active"
  },
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

### Update Profile

```
PUT /auth/profile/update/
Authorization: Bearer <token>
```

**Request (all fields optional):**

```json
{
  "first_name": "string",
  "last_name": "string",
  "bio": "string (max 500)",
  "theme_preference": "light | dark | system",
  "language_preference": "string",
  "ai_assistance_enabled": "boolean",
  "analytics_enabled": "boolean"
}
```

**Response `200`:** Updated user object.

### Change Password

```
POST /auth/change-password/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min 8 chars)",
  "new_password_confirm": "string (required, must match)"
}
```

**Response `200`:**

```json
{ "detail": "Password changed successfully" }
```

### Get User Stats

```
GET /auth/stats/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "level": 1,
  "experience_points": 0,
  "credits": 100,
  "daily_streak": 0,
  "templates_created": 0,
  "completion_rate": 0.0,
  "total_prompts_generated": 0,
  "user_rank": "Prompt Novice"
}
```

---

## 4. Social OAuth

**Base path:** `/api/v2/auth/social/`

### List Providers

```
GET /auth/social/providers/
```

**Response `200`:**

```json
{
  "providers": [
    { "name": "Google", "id": "google", "icon_url": "string" },
    { "name": "GitHub", "id": "github", "icon_url": "string" }
  ]
}
```

### Initiate OAuth

```
GET /auth/social/<provider>/initiate/?redirect_uri=https://prompt-temple.com/auth/callback/google
```

**`provider`**: `google` | `github`

**Response `200`:**

```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Frontend should redirect the user to `authorization_url`.

### OAuth Callback

After the user authorizes, they are redirected back with `code` and `state` query params.

```
POST /auth/social/callback/
```

**Request:**

```json
{
  "provider": "google | github",
  "code": "string (from redirect)",
  "state": "string (from redirect)"
}
```

**Response `200`:**

```json
{
  "user": { ... },
  "tokens": { "access": "...", "refresh": "..." }
}
```

### Link Account

```
POST /auth/social/link/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "provider": "google | github",
  "code": "string",
  "state": "string"
}
```

**Response `200`:**

```json
{ "detail": "Account linked" }
```

### Unlink Account

```
POST /auth/social/unlink/
Authorization: Bearer <token>
```

**Request:**

```json
{ "provider": "google | github" }
```

**Response `200`:**

```json
{ "detail": "Account unlinked" }
```

---

## 5. Templates

**Base path:** `/api/v2/templates/`

### List Templates (Paginated)

```
GET /templates/templates/?category=writing&search=blog&page=1&page_size=20
```

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | Filter by category slug |
| `search` | string | — | Full-text search |
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page |

**Response `200`:**

```json
{
  "count": 150,
  "next": "https://api.prompt-temple.com/api/v2/templates/templates/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "Blog Post Generator",
      "description": "Generate professional blog posts...",
      "category": {
        "id": 1,
        "name": "Writing",
        "slug": "writing",
        "icon": "pencil",
        "color": "#6366F1"
      },
      "template_content": "Write a {tone} blog post about {topic}...",
      "author": {
        "id": "uuid",
        "username": "string"
      },
      "fields": [
        {
          "id": "uuid",
          "label": "Topic",
          "placeholder": "Enter your topic",
          "field_type": "text",
          "is_required": true,
          "default_value": "",
          "validation_pattern": "",
          "help_text": "The main subject of your blog post",
          "options": [],
          "order": 0
        }
      ],
      "version": "1.0.0",
      "tags": ["blog", "writing", "content"],
      "is_ai_generated": false,
      "usage_count": 42,
      "average_rating": 4.5,
      "is_public": true,
      "is_featured": false,
      "is_premium_required": false,
      "required_subscription": "free",
      "token_cost": 0,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

### Get Template Detail

```
GET /templates/templates/<uuid:id>/
```

**Response `200`:** Full template object (same shape as list item, with all fields populated).

### Create Template

```
POST /templates/templates/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "title": "string (required, max 200)",
  "description": "string (required)",
  "category": "int (required, category ID)",
  "template_content": "string (required, use {field_name} for variables)",
  "fields": [
    {
      "label": "string (required)",
      "placeholder": "string",
      "field_type": "text | textarea | dropdown | checkbox | radio | number",
      "is_required": true,
      "default_value": "string",
      "help_text": "string",
      "options": ["option1", "option2"],
      "order": 0
    }
  ],
  "tags": ["string"],
  "is_public": true
}
```

**Response `201`:** Created template object.

### Update Template

```
PUT /templates/templates/<uuid:id>/
Authorization: Bearer <token>
```

**Request:** Same shape as create (all fields optional).
**Response `200`:** Updated template object.

### Delete Template

```
DELETE /templates/templates/<uuid:id>/
Authorization: Bearer <token>
```

**Response `204`:** No content.

### List Categories

```
GET /templates/template-categories/
```

**Response `200`:**

```json
[
  {
    "id": 1,
    "name": "Writing",
    "slug": "writing",
    "description": "Templates for content writing",
    "icon": "pencil",
    "color": "#6366F1",
    "is_active": true,
    "template_count": 42,
    "order": 0
  }
]
```

### Semantic Search

```
GET /templates/search/prompts/?q=email marketing&category=business&top_k=10
```

**Response `200`:**

```json
{
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "similarity_score": 0.92
    }
  ]
}
```

### Featured Prompts

```
GET /templates/prompts/featured/
```

**Response `200`:**

```json
{
  "featured_prompts": [ /* Template objects */ ]
}
```

### Similar Prompts

```
GET /templates/prompts/<uuid:id>/similar/
```

**Response `200`:**

```json
{
  "similar_prompts": [ /* Template objects with similarity_score */ ]
}
```

### Intent Processing

```
POST /templates/intent/process/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required, user's natural language request)",
  "context": "string (optional)"
}
```

**Response `200`:**

```json
{
  "intent": "string",
  "category": "string",
  "confidence": 0.85,
  "recommended_templates": [ /* Template objects */ ]
}
```

### Performance Metrics

```
GET /templates/metrics/performance/
```

**Response `200`:**

```json
{
  "templates_count": 150,
  "avg_rating": 4.2,
  "total_usage": 5000,
  "trending": [ /* Template summaries */ ]
}
```

### Validate Template (SSE Stream)

```
GET /templates/templates/<uuid:id>/validate/stream/
Authorization: Bearer <token>
Accept: text/event-stream
```

Returns an SSE stream of validation results. See [Streaming (SSE)](#20-streaming-sse) for format.

### System Status

```
GET /templates/status/
```

**Response `200`:**

```json
{
  "status": "ok",
  "version": "string",
  "database_ok": true,
  "redis_ok": true
}
```

---

## 6. AI Services

**Base path:** `/api/v2/ai/`

### List Providers

```
GET /ai/providers/
```

**Response `200`:**

```json
{
  "providers": [
    {
      "id": "deepseek",
      "name": "DeepSeek",
      "models": [
        { "id": "deepseek-chat", "name": "DeepSeek Chat", "max_tokens": 4096 }
      ]
    }
  ]
}
```

### List Models

```
GET /ai/models/?provider=deepseek
```

**Response `200`:**

```json
{
  "models": [
    {
      "id": "deepseek-chat",
      "name": "DeepSeek Chat",
      "provider": "deepseek",
      "max_tokens": 4096,
      "supports_streaming": true
    }
  ]
}
```

### Generate Text

```
POST /ai/generate/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required)",
  "model": "string (required, e.g. deepseek-chat)",
  "max_tokens": "int (optional, default: 2048)",
  "temperature": "float (optional, 0.0-2.0, default: 0.7)",
  "top_p": "float (optional, 0.0-1.0)"
}
```

**Response `200`:**

```json
{
  "generated_text": "string",
  "tokens_used": 150,
  "cost": 0.0015
}
```

### Get Usage

```
GET /ai/usage/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "total_credits_used": 250,
  "by_model": {
    "deepseek-chat": 200,
    "gpt-4": 50
  },
  "by_date": {
    "2026-03-24": 25,
    "2026-03-23": 30
  }
}
```

### Get Quotas

```
GET /ai/quotas/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "daily_limit": 30,
  "monthly_limit": 600,
  "used_today": 5,
  "remaining": 25
}
```

### Get Suggestions

```
GET /ai/suggestions/?prompt=Write a professional email
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "suggestions": [
    "Add the recipient's name for personalization",
    "Specify the email's purpose in the opening line",
    "Include a clear call to action"
  ]
}
```

### Optimize Prompt

```
POST /ai/optimization/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required)",
  "focus": "string (optional, e.g. clarity, creativity, technical)",
  "length": "string (optional, e.g. short, medium, long)"
}
```

**Response `200`:**

```json
{
  "optimized_prompt": "string",
  "improvements": ["Added specificity", "Better structure"],
  "tokens_used": 200
}
```

### Optimize Prompt (SSE Stream)

```
POST /ai/optimization/stream/
Authorization: Bearer <token>
```

**Request:** Same as `/optimization/`.
**Response:** SSE stream. See [Streaming (SSE)](#20-streaming-sse).

### DeepSeek Chat

```
POST /ai/deepseek/chat/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Explain prompt engineering." }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Response `200`:**

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Prompt engineering is..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

### DeepSeek Stream

```
GET /ai/deepseek/stream/?prompt=Explain prompt engineering
Authorization: Bearer <token>
Accept: text/event-stream
```

Returns SSE stream of model response chunks.

### DeepSeek Test

```
GET /ai/deepseek/test/
```

**Response `200`:**

```json
{
  "status": "ok",
  "model": "deepseek-chat",
  "available_tokens": 4096
}
```

---

## 7. Chat & Template Extraction

**Base path:** `/api/v2/chat/`

### Chat Completions (SSE Stream)

```
POST /chat/completions/
Authorization: Bearer <token>
Accept: text/event-stream
```

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "Create a marketing email template for product launches" }
  ],
  "model": "deepseek-chat (optional)",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Response:** SSE stream of response chunks. Templates are automatically extracted from assistant messages.

### Chat Completions (Non-streaming)

```
POST /chat/completions/basic/
Authorization: Bearer <token>
```

**Request:** Same as above.

**Response `200`:**

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Here's a marketing email template..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 500,
    "total_tokens": 530
  }
}
```

### Check Extraction Status

```
GET /chat/templates/status/?session_id=<uuid>
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "extraction_status": "completed",
  "templates_found": 2,
  "processing": false
}
```

### List Extracted Templates

```
GET /chat/templates/extracted/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "Product Launch Email",
      "description": "A professional email template for...",
      "template_content": "Subject: {product_name} is here!...",
      "category_suggestion": "marketing",
      "extraction_method": "langchain",
      "confidence_score": 0.92,
      "quality_rating": "high",
      "keywords_extracted": ["marketing", "email", "launch"],
      "use_cases": ["Product launches", "Announcements"],
      "status": "pending",
      "created_at": "ISO 8601"
    }
  ]
}
```

### Get Extracted Template Detail

```
GET /chat/templates/extracted/<uuid:id>/
Authorization: Bearer <token>
```

**Response `200`:** Full extracted template object.

### List Chat Sessions

```
GET /chat/sessions/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Marketing Templates",
      "ai_model": "deepseek-chat",
      "total_messages": 12,
      "total_tokens_used": 3500,
      "extracted_templates_count": 3,
      "is_active": true,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

## 8. Ask-Me Prompt Builder

**Base path:** `/api/v2/ai/askme/`

An interactive, guided prompt builder that asks the user questions to construct an optimal prompt.

### Start Session

```
POST /ai/askme/start/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "topic": "string (required, what the user wants a prompt for)",
  "context": "string (optional, additional background)"
}
```

**Response `200`:**

```json
{
  "session_id": "uuid",
  "first_question": "What specific outcome do you want from this prompt?",
  "conversation_state": "in_progress"
}
```

### Answer Question

```
POST /ai/askme/answer/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "session_id": "uuid (required)",
  "answer": "string (required)"
}
```

**Response `200`:**

```json
{
  "next_question": "Who is the target audience?",
  "questions_remaining": 3
}
```

### Submit All Answers

```
POST /ai/askme/submit-all/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "session_id": "uuid (required)",
  "answers": {
    "question_1": "answer_1",
    "question_2": "answer_2"
  }
}
```

**Response `200`:**

```json
{
  "status": "submitted",
  "prompt_preview": "string (draft prompt based on answers)"
}
```

### Finalize Prompt

```
POST /ai/askme/finalize/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "session_id": "uuid (required)"
}
```

**Response `200`:**

```json
{
  "final_prompt": "string (the fully constructed prompt)",
  "title": "string (suggested title)",
  "category": "string (suggested category)"
}
```

### Stream Prompt Generation

```
GET /ai/askme/stream/?session_id=<uuid>
Authorization: Bearer <token>
Accept: text/event-stream
```

Returns SSE stream of prompt generation. See [Streaming (SSE)](#20-streaming-sse).

### List Sessions

```
GET /ai/askme/sessions/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "topic": "string",
      "status": "in_progress | completed | finalized",
      "created_at": "ISO 8601"
    }
  ]
}
```

### Get Session Detail

```
GET /ai/askme/sessions/<uuid:id>/
Authorization: Bearer <token>
```

**Response `200`:** Full session with all Q&A history.

### Delete Session

```
DELETE /ai/askme/sessions/<uuid:id>/delete/
Authorization: Bearer <token>
```

**Response `204`:** No content.

---

## 9. RAG & Research

**Base path:** `/api/v2/ai/`

### Retrieve Context

```
POST /ai/rag/retrieve/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "query": "string (required)",
  "top_k": 5,
  "similarity_threshold": 0.7
}
```

**Response `200`:**

```json
{
  "results": [
    {
      "chunk": "string (matched text segment)",
      "similarity_score": 0.95,
      "source": "string (document source)"
    }
  ]
}
```

### RAG Answer

```
POST /ai/rag/answer/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "question": "string (required)",
  "context": "string (required)"
}
```

**Response `200`:**

```json
{
  "answer": "string",
  "sources": ["source1", "source2"],
  "confidence": 0.88
}
```

### RAG Search

```
POST /ai/rag/search/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "query": "string (required)",
  "filter": "string (optional)",
  "limit": 10
}
```

**Response `200`:**

```json
{
  "results": [ /* Document objects with relevance scores */ ]
}
```

### Agent Optimize

```
POST /ai/agent/optimize/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required)",
  "knowledge_base": "string (optional)"
}
```

**Response `200`:**

```json
{
  "optimized_prompt": "string",
  "sources_used": ["source1", "source2"]
}
```

---

## 10. Broadcast

**Base path:** `/api/v2/ai/broadcast/`

Send the same prompt to multiple AI models simultaneously and compare results.

### Create Broadcast

```
POST /ai/broadcast/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required)",
  "models": ["deepseek-chat", "gpt-4", "claude-3"]
}
```

**Response `200`:**

```json
{
  "broadcast_id": "uuid",
  "results": {
    "deepseek-chat": {
      "text": "string",
      "tokens_used": 200,
      "latency_ms": 1500
    },
    "gpt-4": {
      "text": "string",
      "tokens_used": 180,
      "latency_ms": 2000
    }
  }
}
```

### Stream Broadcast Results

```
GET /ai/broadcast/stream/?broadcast_id=<uuid>
Authorization: Bearer <token>
Accept: text/event-stream
```

Returns SSE stream with results from each model as they complete.

---

## 11. Orchestrator

**Base path:** `/api/v2/orchestrator/`

Intelligent routing layer that detects user intent and matches to templates.

### Detect Intent

```
POST /orchestrator/intent/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "user_input": "string (required, natural language)",
  "context": "string (optional)"
}
```

**Response `200`:**

```json
{
  "detected_intent": "template_search",
  "category": "writing",
  "confidence": 0.92,
  "templates_suggested": [ /* Template objects */ ]
}
```

### Assess Prompt Quality

```
POST /orchestrator/assess/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "prompt": "string (required)",
  "rubric": "string (optional, assessment criteria)"
}
```

**Response `200`:**

```json
{
  "quality_score": 7.5,
  "suggestions": [
    "Add more context about the target audience",
    "Include an output format specification"
  ],
  "categories_detected": ["writing", "marketing"]
}
```

### Render Template

```
POST /orchestrator/render/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "template_id": "uuid (required)",
  "field_values": {
    "topic": "AI in healthcare",
    "tone": "professional",
    "length": "500 words"
  }
}
```

**Response `200`:**

```json
{
  "rendered_prompt": "Write a professional article about AI in healthcare, approximately 500 words...",
  "preview": "string (shortened preview)"
}
```

### Search Templates

```
POST /orchestrator/search/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "query": "string (required)",
  "category": "string (optional)",
  "filters": {}
}
```

**Response `200`:**

```json
{
  "results": [ /* Template objects */ ],
  "count": 15
}
```

---

## 12. Billing & Subscriptions

**Base path:** `/api/v2/billing/`

### List Plans

```
GET /billing/plans/
```

**Response `200`:**

```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Free",
      "plan_type": "free",
      "plan_code": "FREE",
      "billing_interval": "monthly",
      "price": "0.00",
      "currency": "USD",
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
      "features_list": ["20 credits/month", "Basic templates"],
      "is_active": true,
      "is_popular": false,
      "description": "Get started for free"
    },
    {
      "id": "uuid",
      "name": "Pro",
      "plan_code": "PRO",
      "price": "9.99",
      "monthly_credits": 500,
      "is_popular": true
    },
    {
      "id": "uuid",
      "name": "Power",
      "plan_code": "POWER",
      "price": "29.99",
      "monthly_credits": 2000
    }
  ]
}
```

### Get My Subscription

```
GET /billing/me/subscription/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "subscription": {
    "id": "uuid",
    "plan": { /* SubscriptionPlan object */ },
    "status": "active",
    "started_at": "ISO 8601",
    "expires_at": "ISO 8601 | null",
    "is_trial": false,
    "credits_balance": 450,
    "credits_reserved": 0,
    "auto_renew": true,
    "next_billing_date": "ISO 8601 | null",
    "stripe_subscription_id": "string",
    "created_at": "ISO 8601"
  }
}
```

### Get My Entitlements

```
GET /billing/me/entitlements/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "entitlements": {
    "plan_code": "PRO",
    "credits_balance": 450,
    "monthly_credits": 500,
    "max_requests_per_hour": 100,
    "max_requests_per_day": 1000,
    "max_input_tokens": 8192,
    "max_output_tokens": 4096,
    "allowed_models": ["deepseek-chat", "gpt-4", "claude-3"],
    "premium_templates_access": true,
    "ads_free": true,
    "analytics_access": true,
    "api_access": true,
    "collaboration_features": true
  }
}
```

### Get My Usage

```
GET /billing/me/usage/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "usage": {
    "credits_consumed": 50,
    "by_feature": {
      "ai_generation": 30,
      "template_render": 15,
      "optimization": 5
    },
    "period_start": "ISO 8601",
    "period_end": "ISO 8601"
  }
}
```

### Cost Preview

```
POST /billing/cost-preview/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "feature": "string (e.g. ai_generation, optimization)",
  "usage_estimate": 10
}
```

**Response `200`:**

```json
{
  "estimated_cost": 5.0,
  "credits_required": 10
}
```

### Create Checkout Session

```
POST /billing/checkout/
Authorization: Bearer <token>
```

**Request (one of):**

```json
{
  "plan_id": "uuid"
}
```

or

```json
{
  "plan_code": "PRO | POWER"
}
```

**Response `200`:**

```json
{
  "session_id": "uuid",
  "stripe_session_id": "cs_live_..."
}
```

Frontend should redirect to Stripe Checkout using the `stripe_session_id`:

```js
const stripe = Stripe('pk_live_...');
stripe.redirectToCheckout({ sessionId: response.stripe_session_id });
```

### Get Customer Portal

```
GET /billing/portal/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "portal_url": "https://billing.stripe.com/session/..."
}
```

Frontend should redirect to this URL for subscription management.

### Stripe Webhook (Backend Only)

```
POST /billing/webhooks/stripe/
```

This endpoint is called by Stripe directly. The frontend does not need to call this.

---

## 13. Prompt History & Saved Prompts

**Base path:** `/api/v2/history/`

### List History (Paginated)

```
GET /history/history/?page=1&search=marketing
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "count": 50,
  "next": "string | null",
  "previous": "string | null",
  "results": [
    {
      "id": "uuid",
      "prompt_text": "string",
      "result_text": "string",
      "model_used": "deepseek-chat",
      "tokens_used": 150,
      "created_at": "ISO 8601"
    }
  ]
}
```

### Get History Item

```
GET /history/history/<uuid:id>/
Authorization: Bearer <token>
```

### Save Prompt

```
POST /history/saved-prompts/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "title": "string (required)",
  "content": "string (required)",
  "category": "string (optional)",
  "tags": ["string"]
}
```

**Response `201`:** Created saved prompt object.

### List Saved Prompts

```
GET /history/saved-prompts/?category=writing&tag=blog
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "category": "string",
      "tags": ["string"],
      "created_at": "ISO 8601"
    }
  ]
}
```

### Discover Public Prompts

```
GET /history/saved-prompts/discover/?category=writing&sort=popular
```

**Response `200`:**

```json
{
  "featured_prompts": [ /* SavedPrompt objects */ ]
}
```

### List Categories

```
GET /history/saved-prompts/categories/
```

**Response `200`:**

```json
{
  "categories": ["writing", "coding", "marketing", "education"]
}
```

### Copy from Template

```
POST /history/saved-prompts/copy-from-template/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "template_id": "uuid (required)",
  "field_values": {
    "field_1": "value_1"
  }
}
```

**Response `201`:**

```json
{
  "copied_prompt": { /* SavedPrompt object */ }
}
```

### List Iterations

```
GET /history/iterations/?prompt_id=<uuid>
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "iterations": [
    {
      "id": "uuid",
      "prompt_id": "uuid",
      "version": 1,
      "content": "string",
      "changes": "string",
      "created_at": "ISO 8601"
    }
  ]
}
```

### List Conversation Threads

```
GET /history/threads/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "threads": [
    {
      "id": "uuid",
      "title": "string",
      "message_count": 12,
      "last_message_at": "ISO 8601",
      "created_at": "ISO 8601"
    }
  ]
}
```

---

## 14. Skills & MCP Knowledge

### Skills

**Base path:** `/api/v2/skills/`

### List Skills (Paginated)

```
GET /skills/?category=mcp-servers&type=mcp_server&difficulty=intermediate&search=filesystem
```

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | Filter by category slug |
| `type` | string | — | Filter by skill_type (see [Enums](#18-data-types--enums)) |
| `difficulty` | string | — | `beginner` / `intermediate` / `advanced` / `expert` |
| `search` | string | — | Full-text search |
| `page` | int | 1 | Page number |

**Response `200`:**

```json
{
  "count": 200,
  "next": "string | null",
  "previous": "string | null",
  "results": [
    {
      "id": "uuid",
      "title": "Filesystem MCP Server",
      "slug": "filesystem-mcp-server",
      "description": "Read and write files via MCP protocol",
      "content": "markdown content...",
      "category": {
        "id": "uuid",
        "name": "MCP Servers",
        "slug": "mcp-servers",
        "icon": "server"
      },
      "skill_type": "mcp_server",
      "difficulty": "intermediate",
      "tags": ["filesystem", "mcp", "tools"],
      "source_url": "https://github.com/...",
      "mcp_server_name": "io.github.modelcontextprotocol/filesystem",
      "mcp_version": "2025-11-05",
      "mcp_transport": "stdio",
      "mcp_packages": [
        { "registry": "npm", "name": "@modelcontextprotocol/server-filesystem", "version": "1.0.0" }
      ],
      "mcp_tools": [
        {
          "name": "read_file",
          "description": "Read the contents of a file",
          "input_schema": {
            "type": "object",
            "properties": {
              "path": { "type": "string", "description": "File path to read" }
            },
            "required": ["path"]
          }
        }
      ],
      "github_stars": 1500,
      "github_language": "TypeScript",
      "is_featured": true,
      "is_verified": true,
      "view_count": 5000,
      "save_count": 300,
      "use_count": 800,
      "relevance_score": 0.95,
      "published_at": "ISO 8601",
      "created_at": "ISO 8601"
    }
  ]
}
```

### List Skill Categories

```
GET /skills/categories/
```

**Response `200`:**

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "MCP Servers",
      "slug": "mcp-servers",
      "description": "Model Context Protocol server integrations",
      "icon": "server",
      "parent": null,
      "is_active": true,
      "sort_order": 0
    }
  ]
}
```

### Bookmark Skill

```
POST /skills/<uuid:id>/bookmark/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{ "bookmarked": true }
```

### Remove Bookmark

```
DELETE /skills/<uuid:id>/bookmark/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{ "bookmarked": false }
```

### Featured Skills

```
GET /skills/featured/?limit=10
```

### Trending Skills

```
GET /skills/trending/?limit=10&days=30
```

### MCP Servers

```
GET /skills/mcp_servers/?search=filesystem
```

Returns only skills where `skill_type == "mcp_server"`.

### Skills Stats

```
GET /skills/stats/
```

**Response `200`:**

```json
{
  "total_skills": 500,
  "by_type": {
    "mcp_server": 120,
    "prompt_technique": 80,
    "framework": 50
  },
  "by_difficulty": {
    "beginner": 100,
    "intermediate": 200,
    "advanced": 150,
    "expert": 50
  }
}
```

### My Bookmarks

```
GET /skills/my_bookmarks/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "bookmarks": [
    {
      "id": "uuid",
      "skill": { /* Skill object */ },
      "created_at": "ISO 8601"
    }
  ]
}
```

### MCP Knowledge Base

**Base path:** `/api/v2/mcp/`

### List Documents

```
GET /mcp/documents/?category=getting-started&page=1
```

**Response `200`:**

```json
{
  "count": 50,
  "results": [
    {
      "id": "uuid",
      "title": "Introduction to MCP",
      "slug": "introduction-to-mcp",
      "category": {
        "id": "uuid",
        "name": "Getting Started",
        "slug": "getting-started"
      },
      "summary": "string",
      "excerpt": "string (max 500 chars)",
      "content_md": "# Introduction\n\nThe Model Context Protocol...",
      "source_type": "curated",
      "author": "string",
      "status": "published",
      "quality_score": 0.9,
      "tags": ["mcp", "introduction", "basics"],
      "mcp_version": "2025-11-05",
      "view_count": 1200,
      "published_at": "ISO 8601"
    }
  ]
}
```

### Get Document by Slug

```
GET /mcp/documents/<slug>/
```

### List MCP Prompts

```
GET /mcp/prompts/?category=server-setup&page=1
```

### Featured MCP Prompts

```
GET /mcp/prompts/featured/
```

### Get MCP Prompt by Slug

```
GET /mcp/prompts/<slug>/
```

### List MCP Categories

```
GET /mcp/categories/
```

### Search MCP Knowledge

```
POST /mcp/search/
```

**Request:**

```json
{
  "query": "string (required)",
  "type": "document | prompt | course (optional)"
}
```

**Response `200`:**

```json
{
  "results": [ /* Mixed document/prompt/course objects */ ]
}
```

---

## 15. MCP Academy

**Base path:** `/api/v2/mcp/academy/`

### List Courses

```
GET /mcp/academy/courses/?difficulty=beginner
```

**Response `200`:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "MCP Fundamentals",
      "slug": "mcp-fundamentals",
      "description": "Learn the basics of Model Context Protocol",
      "difficulty": "beginner",
      "lessons": [
        {
          "id": "uuid",
          "title": "What is MCP?",
          "order": 1,
          "content_md": "string"
        }
      ],
      "estimated_duration_minutes": 60,
      "enrollment_count": 500
    }
  ]
}
```

### Get Course Detail

```
GET /mcp/academy/courses/<slug>/
```

### Enroll in Course

```
POST /mcp/academy/enroll/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "course_id": "uuid (required)"
}
```

**Response `200`:**

```json
{
  "enrolled": true,
  "progress": {}
}
```

### Get My Progress

```
GET /mcp/academy/progress/?course_id=<uuid>
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "user_progress": [
    {
      "course_id": "uuid",
      "completed_lessons": ["lesson-uuid-1", "lesson-uuid-2"],
      "progress_percent": 40,
      "last_activity": "ISO 8601"
    }
  ]
}
```

### Complete Lesson

```
POST /mcp/academy/complete-lesson/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "course_id": "uuid (required)",
  "lesson_id": "uuid (required)"
}
```

**Response `200`:**

```json
{
  "completed": true,
  "progress": 60
}
```

---

## 16. Gamification

**Base path:** `/api/v2/gamification/`

### Achievements

```
GET /gamification/achievements/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "achievements": [
    {
      "id": "uuid",
      "name": "First Prompt",
      "description": "Create your first prompt",
      "icon": "star",
      "xp_reward": 50,
      "unlocked": true,
      "unlocked_at": "ISO 8601 | null"
    }
  ]
}
```

### Badges

```
GET /gamification/badges/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "badges": [
    {
      "id": "uuid",
      "name": "Prompt Master",
      "description": "Create 100 prompts",
      "icon_url": "string",
      "tier": "gold",
      "earned": false,
      "progress": 42,
      "target": 100
    }
  ]
}
```

### Leaderboard

```
GET /gamification/leaderboard/?period=week&limit=100
```

**Response `200`:**

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "username": "string",
        "avatar_url": "string | null"
      },
      "points": 5000,
      "level": 15
    }
  ]
}
```

### Daily Challenges

```
GET /gamification/daily-challenges/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "challenge": {
    "id": "uuid",
    "title": "Template Creator",
    "description": "Create 3 templates today",
    "progress": 1,
    "target": 3,
    "completed": false,
    "expires_at": "ISO 8601"
  },
  "rewards": {
    "xp": 100,
    "credits": 10
  }
}
```

### User Level

```
GET /gamification/user-level/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "level": 5,
  "xp": 1200,
  "xp_to_next": 800,
  "rank": "Prompt Artisan",
  "progress_percent": 60
}
```

### Streak

```
GET /gamification/streak/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "current_streak": 7,
  "longest_streak": 14,
  "last_activity_date": "2026-03-24"
}
```

---

## 17. Analytics

**Base path:** `/api/v2/analytics/`

### Dashboard

```
GET /analytics/dashboard/?period=30d
Authorization: Bearer <token>
```

**Query params:** `period` = `7d` | `30d` | `90d`

**Response `200`:**

```json
{
  "dashboard": {
    "active_users": 150,
    "templates_created": 42,
    "avg_rating": 4.3,
    "trending": [ /* Template summaries */ ]
  }
}
```

### User Insights

```
GET /analytics/user-insights/
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "user_behavior": { /* Activity patterns */ },
  "template_preferences": { /* Most used categories */ },
  "ai_usage_patterns": { /* Model preferences, peak hours */ }
}
```

### Template Analytics

```
GET /analytics/template-analytics/?template_id=<uuid>
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "usage_count": 150,
  "completion_rate": 0.85,
  "avg_rating": 4.5,
  "trending": true
}
```

### Recommendations

```
GET /analytics/recommendations/?type=template
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "recommendations": [ /* Template objects tailored to user */ ]
}
```

### Track Event

```
POST /analytics/track/
Authorization: Bearer <token>
```

**Request:**

```json
{
  "event_name": "string (required)",
  "category": "string (required)",
  "properties": {
    "template_id": "uuid",
    "action": "copy"
  }
}
```

**Response `200`:**

```json
{ "tracked": true }
```

---

## 18. Data Types & Enums

### Subscription Plan Codes

| Code | Description |
|------|-------------|
| `FREE` | Free tier, limited features |
| `PRO` | Professional tier |
| `POWER` | Power user tier |

### Subscription Plan Types

| Value | Description |
|-------|-------------|
| `free` | No cost |
| `basic` | Entry-level paid |
| `premium` | Mid-tier paid |
| `enterprise` | Business tier |

### Subscription Statuses

| Value | Description |
|-------|-------------|
| `active` | Currently active |
| `pending` | Awaiting payment |
| `cancelled` | User cancelled |
| `expired` | Past expiry date |
| `suspended` | Payment failed |
| `trial` | Trial period |
| `past_due` | Payment overdue |

### Billing Intervals

| Value | Description |
|-------|-------------|
| `monthly` | Billed monthly |
| `yearly` | Billed annually |
| `lifetime` | One-time payment |

### Template Required Subscription

| Value | Description |
|-------|-------------|
| `free` | Available to all |
| `basic` | Basic plan+ |
| `premium` | Premium plan+ |
| `enterprise` | Enterprise only |

### Template Field Types

| Value | Description | UI Component |
|-------|-------------|--------------|
| `text` | Single-line text | `<input type="text">` |
| `textarea` | Multi-line text | `<textarea>` |
| `dropdown` | Select from options | `<select>` |
| `checkbox` | Boolean toggle | `<input type="checkbox">` |
| `radio` | Single choice from options | `<input type="radio">` |
| `number` | Numeric input | `<input type="number">` |

### Skill Types

| Value | Description |
|-------|-------------|
| `mcp_server` | MCP server integration |
| `mcp_tool` | Single MCP tool |
| `prompt_technique` | Prompting method (CoT, few-shot, etc.) |
| `agentic_pattern` | Agent design pattern (ReAct, loop, etc.) |
| `framework` | Library/SDK (LangChain, etc.) |
| `model_technique` | Model-specific technique |
| `rag_pattern` | RAG architecture pattern |
| `workflow` | Complete pipeline/workflow |
| `best_practice` | Industry best practice |
| `tutorial` | How-to guide or course |

### Skill Difficulty Levels

| Value | Description |
|-------|-------------|
| `beginner` | New to concept |
| `intermediate` | Some experience needed |
| `advanced` | Requires deep knowledge |
| `expert` | Mastery level |

### MCP Transport Types

| Value | Description |
|-------|-------------|
| `stdio` | Direct process execution (local) |
| `sse` | HTTP Server-Sent Events (remote) |
| `streamable-http` | Bidirectional HTTP (remote) |

### Chat Message Roles

| Value | Description |
|-------|-------------|
| `user` | User message |
| `assistant` | AI response |
| `system` | System instruction |

### Extraction Methods

| Value | Description |
|-------|-------------|
| `langchain` | AI-powered extraction |
| `regex` | Pattern-based extraction |
| `manual` | User-created |

### Extracted Template Quality Ratings

| Value | Description |
|-------|-------------|
| `high` | Confidence >= 0.8 |
| `medium` | Confidence 0.5-0.8 |
| `low` | Confidence < 0.5 |

### Extracted Template Statuses

| Value | Description |
|-------|-------------|
| `pending` | Awaiting review |
| `approved` | Approved for use |
| `rejected` | Rejected |
| `needs_revision` | Requires changes |

### MCP Document Source Types

| Value | Description |
|-------|-------------|
| `manual` | Manually created |
| `crawled` | Web crawler sourced |
| `curated` | Hand-selected |
| `generated` | AI-generated |
| `community` | Community-contributed |

### MCP Document Statuses

| Value | Description |
|-------|-------------|
| `draft` | Work in progress |
| `review` | Under review |
| `approved` | Approved |
| `published` | Live and visible |
| `archived` | Hidden from public |

### Social Auth Providers

| Value | Description |
|-------|-------------|
| `google` | Google OAuth2 |
| `github` | GitHub OAuth2 |

### Theme Preferences

| Value | Description |
|-------|-------------|
| `light` | Light mode |
| `dark` | Dark mode |
| `system` | Follow OS setting |

### User Ranks (by level)

| Range | Rank |
|-------|------|
| 1-4 | Prompt Novice |
| 5-9 | Prompt Apprentice |
| 10-14 | Prompt Artisan |
| 15-19 | Prompt Expert |
| 20+ | Prompt Master |

### UUID Format

All resource IDs use UUID v4: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Timestamp Format

All timestamps use ISO 8601: `2026-03-24T14:30:00.000Z`

### Pagination Format

All paginated endpoints return:

```json
{
  "count": 150,
  "next": "https://api.prompt-temple.com/api/v2/...?page=2",
  "previous": null,
  "results": [ ... ]
}
```

---

## 19. Error Handling

### Standard Error Shape

All API errors follow a consistent format:

```json
{
  "error": "Short error description",
  "detail": "Longer explanation (optional)",
  "code": "ERROR_CODE (optional)",
  "status_code": 400
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Successful read/update |
| `201` | Created | Successful create |
| `204` | No Content | Successful delete |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing/invalid/expired token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side failure |

### Validation Errors (400)

```json
{
  "errors": {
    "username": ["This field is required."],
    "email": ["Enter a valid email address.", "A user with this email already exists."],
    "password": ["This password is too short. It must contain at least 8 characters."]
  }
}
```

### Authentication Error (401)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    { "token_class": "AccessToken", "token_type": "access", "message": "Token is expired" }
  ]
}
```

**Frontend handling:** When you receive a `401`, attempt a token refresh using the refresh token. If refresh also fails, redirect to login.

### Permission Error (403)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Rate Limit Error (429)

```json
{
  "detail": "Request throttled. Expected available in 60 seconds.",
  "retry_after": 60
}
```

**Frontend handling:** Show a cooldown timer. Retry after the `retry_after` seconds.

---

## 20. Streaming (SSE)

Several endpoints return **Server-Sent Events (SSE)** streams for real-time data.

### How to Connect

```js
const eventSource = new EventSource(
  'https://api.prompt-temple.com/api/v2/ai/deepseek/stream/?prompt=Hello',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

// Note: native EventSource doesn't support headers.
// Use a library like 'eventsource' (Node) or fetch-based SSE for auth headers.
```

### Recommended: Fetch-based SSE

```js
const response = await fetch('/api/v2/ai/optimization/stream/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify({ prompt: 'Your prompt here' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE format: "data: {...}\n\n"
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Handle data.chunk, data.progress, etc.
    }
  }
}
```

### SSE Event Format

```
data: {"chunk": "partial text", "progress": 25}

data: {"chunk": "more text", "progress": 50}

data: {"chunk": "final text", "progress": 100, "done": true}

data: [DONE]
```

### SSE Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /ai/deepseek/stream/` | GET | JWT | Stream DeepSeek response |
| `POST /ai/optimization/stream/` | POST | JWT | Stream prompt optimization |
| `POST /chat/completions/` | POST | JWT | Stream chat response |
| `GET /ai/askme/stream/` | GET | JWT | Stream Ask-Me prompt generation |
| `GET /ai/broadcast/stream/` | GET | JWT | Stream multi-model broadcast |
| `GET /templates/templates/<id>/validate/stream/` | GET | JWT | Stream template validation |

---

## 21. Rate Limits & Quotas

### Global Rate Limits

| Scope | Limit |
|-------|-------|
| All endpoints (per IP) | 1000 requests/hour |
| Auth endpoints (per IP) | 5 attempts per 5 minutes |

### Per-Plan Quotas

| Feature | FREE | PRO | POWER |
|---------|------|-----|-------|
| Monthly credits | 20 | 500 | 2000 |
| Requests/hour | 10 | 100 | 500 |
| Requests/day | 30 | 1000 | 5000 |
| Max input tokens | 2048 | 8192 | 32768 |
| Max output tokens | 500 | 4096 | 16384 |
| Daily template limit | 5 | 50 | unlimited |
| Daily copy limit | 3 | 30 | unlimited |
| Premium templates | no | yes | yes |
| Analytics access | no | yes | yes |
| API access | no | yes | yes |
| Collaboration | no | no | yes |
| Ad-free | no | yes | yes |
| Priority support | no | no | yes |

### Credit Costs

Credits are deducted per AI operation. Check `/billing/cost-preview/` before expensive operations.

---

## 22. Common Flows

### Flow 1: User Registration & Onboarding

```
1. POST /auth/register/         → Get tokens + user object
2. Store tokens (access in memory, refresh in httpOnly cookie or secure storage)
3. GET /auth/profile/            → Full profile with billing info
4. GET /billing/plans/           → Show available plans
5. GET /gamification/user-level/ → Show initial gamification state
6. GET /skills/featured/         → Show featured skills on dashboard
```

### Flow 2: Token Refresh

```
1. API call returns 401 (token expired)
2. POST /auth/refresh/ with refresh token
3. If 200 → Store new access token, retry original request
4. If 401 → Refresh token also expired, redirect to login
```

### Flow 3: Template Discovery & Usage

```
1. GET /templates/template-categories/     → List categories for sidebar
2. GET /templates/templates/?category=...   → Browse templates
3. GET /templates/templates/<id>/           → View template detail + fields
4. User fills in field values
5. POST /orchestrator/render/               → Get rendered prompt
6. POST /ai/generate/                       → Generate AI response
7. POST /history/saved-prompts/             → Optionally save to library
```

### Flow 4: Chat with Template Extraction

```
1. POST /chat/completions/    → Stream AI response (SSE)
2. Render streamed chunks in real-time
3. GET /chat/templates/status/?session_id=...  → Check if templates were extracted
4. GET /chat/templates/extracted/              → List extracted templates
5. User reviews and approves/rejects templates
```

### Flow 5: Ask-Me Guided Prompt Builder

```
1. POST /ai/askme/start/          → Get first question
2. POST /ai/askme/answer/         → Answer, get next question (repeat)
3. POST /ai/askme/finalize/       → Get final generated prompt
   OR
   GET /ai/askme/stream/          → Stream the final prompt via SSE
4. POST /history/saved-prompts/   → Save to library
```

### Flow 6: Upgrade to Premium

```
1. GET /billing/plans/               → Show plan comparison
2. POST /billing/checkout/           → Get Stripe session
3. Redirect to Stripe Checkout
4. Stripe redirects back to success/cancel URL
5. GET /billing/me/entitlements/     → Verify new entitlements
6. GET /auth/profile/                → Updated profile with billing
```

### Flow 7: Manage Subscription

```
1. GET /billing/me/subscription/     → Current subscription status
2. GET /billing/me/usage/            → Current period usage
3. GET /billing/portal/              → Get Stripe portal URL
4. Redirect to Stripe Customer Portal for self-service management
```

### Flow 8: Skills & MCP Learning

```
1. GET /skills/categories/            → Browse skill categories
2. GET /skills/?type=mcp_server       → List MCP servers
3. GET /skills/<id>/                  → View skill detail with MCP tools
4. POST /skills/<id>/bookmark/        → Save to learning list
5. GET /mcp/academy/courses/          → Browse courses
6. POST /mcp/academy/enroll/          → Enroll in course
7. POST /mcp/academy/complete-lesson/ → Track progress
```

### Flow 9: Social Login

```
1. GET /auth/social/providers/                   → Get available providers
2. GET /auth/social/google/initiate/?redirect_uri=... → Get auth URL
3. Redirect user to authorization_url
4. User authorizes → Redirected back with code + state
5. POST /auth/social/callback/                   → Exchange code for tokens
6. Store tokens, proceed to dashboard
```

---

## Appendix: CORS & Frontend Configuration

### Allowed Origins (Production)

```
https://prompt-temple.com
https://www.prompt-temple.com
```

### Required Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.prompt-temple.com/api/v2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
```

### Axios/Fetch Interceptor Pattern

```js
// Recommended: Set up an API client with automatic token refresh

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

> **Questions?** This document covers every endpoint the backend exposes. If an endpoint is not listed here, it does not exist. Contact the backend team for any clarifications.
