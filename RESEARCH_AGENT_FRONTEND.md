# Research Agent Frontend Implementation Spec

> **Target:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui  
> **Backend:** Django REST + SSE streaming (live on Heroku)  
> **Base URL:** `NEXT_PUBLIC_API_URL` (production: `https://prompt-temple-2777469a4e35.herokuapp.com`)

---

## 1. Architecture Overview

```
src/
  app/(app)/research/
    page.tsx                  # Research dashboard (job list + new query)
    [jobId]/
      page.tsx                # Job detail with live SSE streaming
    layout.tsx                # Shared layout with sidebar nav
  components/research/
    ResearchInput.tsx          # Query input with submit button
    JobCard.tsx                # Job summary card for list view
    JobTimeline.tsx            # Pipeline stage progress indicator
    InsightCard.tsx            # Individual insight card with citations
    CitationBadge.tsx          # Citation pill with link
    AnswerRenderer.tsx         # Markdown answer with citation tooltips
    SSEStreamView.tsx          # Real-time SSE event display
    ResearchStats.tsx          # System health/stats dashboard widget
  lib/
    api/research.ts            # API client (aligned to actual backend)
    hooks/useResearch.ts       # React Query hooks
    hooks/useResearchSSE.ts    # SSE streaming hook (EventSource-based)
    stores/researchStore.ts    # Zustand store for research UI state
    types/research.ts          # TypeScript types (matches backend exactly)
```

---

## 2. TypeScript Types (`src/lib/types/research.ts`)

These types match the **actual production API responses** exactly.

```typescript
// ─── Job ────────────────────────────────────────────────
export interface ResearchJob {
  id: string                          // UUID
  query: string
  top_k: number
  status: 'queued' | 'running' | 'done' | 'error'
  stage: '' | 'planning' | 'searching' | 'fetching' | 'chunking' | 'retrieving' | 'synthesizing'
  error: string
  created_at: string                  // ISO 8601
  finished_at: string | null
  // Extended fields (detail/retrieve endpoints)
  answer?: ResearchAnswer | null
  docs_count?: number
  chunks_count?: number
}

// ─── Answer ─────────────────────────────────────────────
export interface ResearchAnswer {
  answer_md: string                   // Full markdown with citations
  citations: Citation[]
  created_at: string
}

export interface Citation {
  n: number                           // Citation number [^n]
  url: string
  title: string
  score: number                       // 0.0 - 1.0
}

// ─── Source Document ────────────────────────────────────
export interface SourceDoc {
  id: number
  url: string
  title: string
  text: string                        // May be truncated in list view
  status_code: number | null
  fetched_ms: number | null
  domain: string
  snippet: string
  word_count: number | null
  fetch_error: string
  created_at: string
  text_truncated?: boolean            // Present when text is truncated
}

// ─── Chunk ──────────────────────────────────────────────
export interface Chunk {
  id: number
  text: string
  tokens: number
  url: string
  title: string
  score?: number                      // Present in retrieval results
  created_at: string
}

// ─── SSE Events ─────────────────────────────────────────
export type SSEEventType =
  | 'stream_start'
  | 'planning'
  | 'searching'
  | 'clustering'
  | 'fetching'
  | 'synthesis'
  | 'card'
  | 'update'
  | 'end'
  | 'error'
  | 'heartbeat'
  | 'answer'
  | 'complete'
  | 'timeout'

export interface SSEEvent {
  event: SSEEventType
  data: Record<string, any>
}

// Planning event data
export interface PlanningEventData {
  query: string
  search_terms: string[]
  stage: 'planning'
}

// Searching event data
export interface SearchingEventData {
  searches_completed: number
  urls_found: number
  stage: 'searching'
}

// Fetching event data
export interface FetchingEventData {
  urls_processed: number
  total_urls: number
  progress_percent: number
  stage: 'fetching'
}

// Synthesis event data
export interface SynthesisEventData {
  cards_generated: number
  cards_rejected: number
  stage: 'synthesis'
}

// Card event data (individual insight card streamed live)
export interface CardEventData {
  id: string
  title: string
  content: string
  citations: Citation[]
  confidence: number
  authority: number
  domain_cluster: string | null
  tags: string[]
}

// End event data
export interface EndEventData {
  total_cards: number
  processing_time_ms: number
  completed_at: string
}

// ─── API Request/Response ───────────────────────────────
export interface CreateJobRequest {
  query: string
  top_k?: number                      // 1-20, default 6
}

export interface QuickResearchResponse {
  job_id: string
  query: string
  status: string
  stream_url: string
  cards_stream_url: string
  progress_url: string
}

export interface IntentFastResponse {
  intent_id: string
  query: string
  status: string
  stream_url: string
  cards_stream_url: string
  warm_card?: WarmCard
}

export interface WarmCard {
  id: string
  title: string
  content: string
  type: 'warm'
  confidence: number
  authority: number
  citations: never[]
  generated_at: string
}

export interface JobSummary {
  id: string
  query: string
  status: string
  stage: string
  created_at: string
  finished_at: string | null
  has_answer: boolean
  query_truncated?: boolean
}

export interface SystemHealth {
  timestamp: string
  database: boolean
  embeddings: boolean
  search: boolean
  synthesis: boolean
  overall: boolean
}

export interface SystemStats {
  total_jobs: number
  jobs_last_24h: number
  completed_jobs: number
  failed_jobs: number
  total_documents: number
  total_chunks: number
  avg_processing_time_seconds?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

---

## 3. API Client (`src/lib/api/research.ts`)

Uses the existing `BaseApiClient` pattern with JWT auth.

```typescript
import { BaseApiClient } from '@/lib/api/base'
import type {
  CreateJobRequest,
  QuickResearchResponse,
  IntentFastResponse,
  ResearchJob,
  JobSummary,
  SourceDoc,
  Chunk,
  SystemHealth,
  SystemStats,
  PaginatedResponse,
} from '@/lib/types/research'

class ResearchClient extends BaseApiClient {
  // ─── Job Creation ─────────────────────────────────────
  async quickResearch(data: CreateJobRequest): Promise<QuickResearchResponse> {
    return this.post('/api/v2/research/quick/', data)
  }

  async intentFast(data: CreateJobRequest): Promise<IntentFastResponse> {
    return this.post('/api/v2/research/intent_fast/', data)
  }

  async batchResearch(queries: string[], top_k = 6) {
    return this.post('/api/v2/research/batch/', { queries, top_k })
  }

  // ─── Job Retrieval ────────────────────────────────────
  async getJob(jobId: string): Promise<ResearchJob> {
    return this.get(`/api/v2/research/jobs/${jobId}/`)
  }

  async listJobs(params?: {
    status?: string
    page?: number
    page_size?: number
  }): Promise<PaginatedResponse<JobSummary>> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    const qs = query.toString()
    return this.get(`/api/v2/research/jobs/${qs ? `?${qs}` : ''}`)
  }

  async getJobProgress(jobId: string) {
    return this.get(`/api/v2/research/jobs/${jobId}/progress/`)
  }

  // ─── Job Data ─────────────────────────────────────────
  async getJobDocs(jobId: string): Promise<SourceDoc[]> {
    return this.get(`/api/v2/research/jobs/${jobId}/docs/`)
  }

  async getJobChunks(jobId: string, page = 1): Promise<PaginatedResponse<Chunk>> {
    return this.get(`/api/v2/research/jobs/${jobId}/chunks/?page=${page}`)
  }

  // ─── System ───────────────────────────────────────────
  async getHealth(): Promise<SystemHealth> {
    return this.get('/api/v2/research/health/')
  }

  async getStats(): Promise<SystemStats> {
    return this.get('/api/v2/research/stats/')
  }

  // ─── SSE Stream URL Builder ───────────────────────────
  getStreamUrl(jobId: string): string {
    const base = this.baseURL || process.env.NEXT_PUBLIC_API_URL
    return `${base}/api/v2/research/jobs/${jobId}/stream/`
  }

  getCardsStreamUrl(jobId: string): string {
    const base = this.baseURL || process.env.NEXT_PUBLIC_API_URL
    return `${base}/api/v2/research/jobs/${jobId}/cards/stream/`
  }
}

export const researchClient = new ResearchClient()
```

---

## 4. SSE Streaming Hook (`src/lib/hooks/useResearchSSE.ts`)

Real-time EventSource-based hook for live pipeline progress.

```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SSEEvent, SSEEventType, CardEventData } from '@/lib/types/research'

interface UseResearchSSEOptions {
  jobId: string | null
  enabled?: boolean
  onCard?: (card: CardEventData) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

interface SSEState {
  events: SSEEvent[]
  currentStage: string
  progress: number                 // 0-100
  cards: CardEventData[]
  isStreaming: boolean
  error: string | null
  processingTimeMs: number | null
}

export function useResearchSSE({
  jobId,
  enabled = true,
  onCard,
  onComplete,
  onError,
}: UseResearchSSEOptions) {
  const [state, setState] = useState<SSEState>({
    events: [],
    currentStage: '',
    progress: 0,
    cards: [],
    isStreaming: false,
    error: null,
    processingTimeMs: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setState(prev => ({ ...prev, isStreaming: false }))
  }, [])

  useEffect(() => {
    if (!jobId || !enabled) return

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const url = `${baseUrl}/api/v2/research/jobs/${jobId}/stream/`

    const es = new EventSource(url)
    eventSourceRef.current = es
    setState(prev => ({ ...prev, isStreaming: true, error: null }))

    // Stage progression mapping
    const stageProgress: Record<string, number> = {
      planning: 10,
      searching: 25,
      fetching: 45,
      clustering: 55,
      chunking: 60,
      retrieving: 70,
      synthesis: 85,
      end: 100,
      complete: 100,
    }

    const handleEvent = (eventType: SSEEventType, data: any) => {
      const event: SSEEvent = { event: eventType, data }

      setState(prev => {
        const next = { ...prev, events: [...prev.events, event] }

        switch (eventType) {
          case 'planning':
          case 'searching':
          case 'fetching':
          case 'synthesis':
            next.currentStage = data.stage || eventType
            next.progress = stageProgress[eventType] || prev.progress
            // Use fetching progress_percent if available
            if (eventType === 'fetching' && data.progress_percent) {
              next.progress = 30 + (data.progress_percent * 0.3)
            }
            break

          case 'card':
            next.cards = [...prev.cards, data as CardEventData]
            onCard?.(data as CardEventData)
            break

          case 'end':
          case 'complete':
            next.progress = 100
            next.isStreaming = false
            next.processingTimeMs = data.processing_time_ms || null
            onComplete?.()
            break

          case 'error':
            next.error = data.message || data.error || 'Unknown error'
            next.isStreaming = false
            onError?.(next.error!)
            break

          case 'heartbeat':
            // Keep connection alive, no UI change
            break

          case 'answer':
            // Full answer received via SSE
            next.progress = 95
            break
        }

        return next
      })
    }

    // Register event listeners for all event types
    const eventTypes: SSEEventType[] = [
      'stream_start', 'planning', 'searching', 'clustering',
      'fetching', 'synthesis', 'card', 'update', 'end',
      'error', 'heartbeat', 'answer', 'complete', 'timeout',
    ]

    for (const type of eventTypes) {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          handleEvent(type, data)
        } catch {
          handleEvent(type, { raw: e.data })
        }
      })
    }

    // Handle generic message events
    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        disconnect()
        return
      }
      try {
        const data = JSON.parse(e.data)
        handleEvent('update', data)
      } catch { /* ignore parse errors */ }
    }

    es.onerror = () => {
      // EventSource auto-reconnects; only close after final events
      setState(prev => {
        if (prev.progress >= 100 || prev.error) {
          disconnect()
        }
        return prev
      })
    }

    return () => disconnect()
  }, [jobId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, disconnect }
}
```

---

## 5. React Query Hooks (`src/lib/hooks/useResearch.ts`)

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { researchClient } from '@/lib/api/research'
import type { CreateJobRequest } from '@/lib/types/research'

// ─── Keys ────────────────────────────────────────────────
export const researchKeys = {
  all: ['research'] as const,
  jobs: () => [...researchKeys.all, 'jobs'] as const,
  job: (id: string) => [...researchKeys.all, 'job', id] as const,
  jobDocs: (id: string) => [...researchKeys.all, 'docs', id] as const,
  health: () => [...researchKeys.all, 'health'] as const,
  stats: () => [...researchKeys.all, 'stats'] as const,
}

// ─── Queries ─────────────────────────────────────────────
export function useResearchJobs(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: [...researchKeys.jobs(), params],
    queryFn: () => researchClient.listJobs(params),
    staleTime: 30_000,
  })
}

export function useResearchJob(jobId: string | null) {
  return useQuery({
    queryKey: researchKeys.job(jobId!),
    queryFn: () => researchClient.getJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Auto-refetch while job is running
      const status = query.state.data?.status
      if (status === 'queued' || status === 'running') return 3000
      return false
    },
  })
}

export function useResearchJobDocs(jobId: string) {
  return useQuery({
    queryKey: researchKeys.jobDocs(jobId),
    queryFn: () => researchClient.getJobDocs(jobId),
    enabled: !!jobId,
  })
}

export function useResearchHealth() {
  return useQuery({
    queryKey: researchKeys.health(),
    queryFn: () => researchClient.getHealth(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function useResearchStats() {
  return useQuery({
    queryKey: researchKeys.stats(),
    queryFn: () => researchClient.getStats(),
    staleTime: 30_000,
  })
}

// ─── Mutations ───────────────────────────────────────────
export function useCreateResearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJobRequest) => researchClient.quickResearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() })
    },
  })
}

export function useCreateFastIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJobRequest) => researchClient.intentFast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() })
    },
  })
}
```

---

## 6. Zustand Store (`src/lib/stores/researchStore.ts`)

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CardEventData, ResearchJob } from '@/lib/types/research'

interface ResearchState {
  // Active job
  activeJobId: string | null
  activeJob: ResearchJob | null
  streamingCards: CardEventData[]

  // UI state
  queryInput: string
  selectedTab: 'results' | 'sources' | 'chunks'
  isSubmitting: boolean

  // Actions
  setActiveJob: (jobId: string, job?: ResearchJob) => void
  clearActiveJob: () => void
  addStreamingCard: (card: CardEventData) => void
  setQueryInput: (query: string) => void
  setSelectedTab: (tab: 'results' | 'sources' | 'chunks') => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export const useResearchStore = create<ResearchState>()(
  devtools(
    (set) => ({
      activeJobId: null,
      activeJob: null,
      streamingCards: [],
      queryInput: '',
      selectedTab: 'results',
      isSubmitting: false,

      setActiveJob: (jobId, job) =>
        set({ activeJobId: jobId, activeJob: job ?? null, streamingCards: [] }),

      clearActiveJob: () =>
        set({ activeJobId: null, activeJob: null, streamingCards: [] }),

      addStreamingCard: (card) =>
        set((s) => ({ streamingCards: [...s.streamingCards, card] })),

      setQueryInput: (query) => set({ queryInput: query }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),

      reset: () =>
        set({
          activeJobId: null,
          activeJob: null,
          streamingCards: [],
          queryInput: '',
          selectedTab: 'results',
          isSubmitting: false,
        }),
    }),
    { name: 'research-store' }
  )
)
```

---

## 7. Component Specs

### 7.1 ResearchInput

```
File: src/components/research/ResearchInput.tsx
Props: { onSubmit: (query: string, topK?: number) => void, isLoading: boolean }
UI:   - Textarea with placeholder "Ask a research question..."
      - Top-K slider (1-10, default 6) in a collapsible "Advanced" section
      - Submit button with loading spinner
      - Character count indicator
Libs: shadcn Button, Input; framer-motion for submit animation
```

### 7.2 JobTimeline

```
File: src/components/research/JobTimeline.tsx
Props: { stage: string, progress: number, events: SSEEvent[] }
UI:   - Horizontal stepper: Planning > Searching > Fetching > Analyzing > Synthesizing
      - Active step highlighted in gold, completed in green
      - Progress bar below showing overall %
      - Small event log (collapsible) showing raw SSE events
Libs: Radix Progress, Lucide icons, framer-motion
```

### 7.3 InsightCard

```
File: src/components/research/InsightCard.tsx
Props: { card: CardEventData, isStreaming?: boolean }
UI:   - Card with gold-accent top border
      - Title + domain badge
      - Markdown content (react-markdown + remark-gfm + rehype-highlight)
      - Citation pills at bottom (clickable, open source URL)
      - Confidence/Authority meters (small progress bars)
      - Fade-in animation when streaming
Libs: shadcn Card, Badge, Tooltip; react-markdown; framer-motion
```

### 7.4 AnswerRenderer

```
File: src/components/research/AnswerRenderer.tsx
Props: { answer: ResearchAnswer }
UI:   - Full markdown rendering with syntax highlighting
      - Citation footnotes [^n] rendered as hover tooltips showing source title + URL
      - "Copy" button for the full answer
      - Citation list at bottom with clickable links
Libs: react-markdown, remark-gfm, rehype-highlight, shadcn Tooltip
```

### 7.5 JobCard

```
File: src/components/research/JobCard.tsx
Props: { job: JobSummary, onClick: () => void }
UI:   - Compact card for job list: query text, status badge, timestamp
      - Status colors: queued=gray, running=gold (pulsing), done=green, error=red
      - Time ago via date-fns (formatDistanceToNow)
Libs: shadcn Card, Badge; date-fns
```

### 7.6 ResearchStats

```
File: src/components/research/ResearchStats.tsx
Props: (none - fetches own data)
UI:   - Small stat cards: Total Jobs, Completed, Failed, Avg Time
      - Health indicator dots (green/red) for each subsystem
      - Auto-refreshes every 60s
Libs: shadcn Card; useResearchHealth + useResearchStats hooks
```

---

## 8. Page Implementation

### 8.1 Research Dashboard (`src/app/(app)/research/page.tsx`)

```
Layout:
  ┌─────────────────────────────────────────┐
  │  Research Agent           [Health: ●●●●] │
  ├─────────────────────────────────────────┤
  │  ┌─────────────────────────────────┐    │
  │  │  [Research Input]               │    │
  │  │  Ask anything... [Submit]       │    │
  │  └─────────────────────────────────┘    │
  ├─────────────────────────────────────────┤
  │  Recent Research                        │
  │  ┌──────┐ ┌──────┐ ┌──────┐            │
  │  │ Job1 │ │ Job2 │ │ Job3 │            │
  │  │ done │ │ run  │ │ err  │            │
  │  └──────┘ └──────┘ └──────┘            │
  │  [Load more]                            │
  └─────────────────────────────────────────┘

Flow:
  1. User types query, clicks Submit
  2. Call quickResearch() or intentFast()
  3. Navigate to /research/[jobId] with the new job ID
  4. Job list auto-refreshes (React Query invalidation)
```

### 8.2 Job Detail (`src/app/(app)/research/[jobId]/page.tsx`)

```
Layout:
  ┌─────────────────────────────────────────┐
  │  [< Back]  "What are microservices..."  │
  ├─────────────────────────────────────────┤
  │  [Planning ● > Searching ● > Fetching   │
  │   ● > Analyzing ○ > Synthesizing ○]     │
  │  ═══════════════════▓▓▓░░░░ 65%         │
  ├─────────────────────────────────────────┤
  │  Tabs: [Results] [Sources] [Chunks]     │
  ├─────────────────────────────────────────┤
  │  Results tab:                           │
  │  ┌─ InsightCard ─────────────────────┐  │
  │  │ Microservices — paloaltonetworks  │  │
  │  │ Microservices architecture is...  │  │
  │  │ [^1 Palo Alto] [^2 Palo Alto]    │  │
  │  │ Confidence: ████░ 85%             │  │
  │  └──────────────────────────────────┘  │
  │  ┌─ InsightCard ─────────────────────┐  │
  │  │ (more cards...)                   │  │
  │  └──────────────────────────────────┘  │
  │                                         │
  │  ── Full Answer ──                      │
  │  [Rendered Markdown with citations]     │
  │                                         │
  │  Sources tab:                           │
  │  - List of SourceDoc cards              │
  │                                         │
  │  Chunks tab:                            │
  │  - Paginated list of text chunks        │
  └─────────────────────────────────────────┘

Flow:
  1. Load job via useResearchJob(jobId) - auto-refetches while running
  2. Connect SSE via useResearchSSE({ jobId })
  3. Cards appear in real-time as SSE card events arrive
  4. When job completes, show full answer via AnswerRenderer
  5. Sources/Chunks tabs load on-demand
```

---

## 9. API Endpoint Reference

All endpoints are relative to `NEXT_PUBLIC_API_URL`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v2/research/quick/` | Optional | Create job, get stream URLs |
| `POST` | `/api/v2/research/intent_fast/` | Optional | Create job + warm card |
| `POST` | `/api/v2/research/batch/` | Optional | Create multiple jobs |
| `GET` | `/api/v2/research/jobs/` | Optional | List jobs (paginated) |
| `GET` | `/api/v2/research/jobs/{id}/` | Optional | Job detail + answer |
| `GET` | `/api/v2/research/jobs/{id}/progress/` | Optional | Progress info |
| `GET` | `/api/v2/research/jobs/{id}/docs/` | Optional | Source documents |
| `GET` | `/api/v2/research/jobs/{id}/chunks/` | Optional | Chunks (paginated) |
| `GET` | `/api/v2/research/jobs/{id}/stream/` | None | SSE event stream |
| `GET` | `/api/v2/research/jobs/{id}/cards/stream/` | None | SSE card-only stream |
| `GET` | `/api/v2/research/health/` | None | System health |
| `GET` | `/api/v2/research/stats/` | None | System stats |

### Request/Response Examples

**POST /api/v2/research/quick/**
```json
// Request
{ "query": "What are microservices?", "top_k": 3 }

// Response (201)
{
  "job_id": "a532482b-...",
  "query": "What are microservices?",
  "status": "queued",
  "stream_url": "/api/v2/research/jobs/a532482b-.../stream/",
  "cards_stream_url": "/api/v2/research/jobs/a532482b-.../cards/stream/",
  "progress_url": "/api/v2/research/jobs/a532482b-.../progress/"
}
```

**GET /api/v2/research/jobs/{id}/** (completed job)
```json
{
  "id": "a532482b-...",
  "query": "What are microservices and why use them?",
  "top_k": 3,
  "status": "done",
  "stage": "",
  "error": "",
  "created_at": "2026-04-03T15:15:04.325Z",
  "finished_at": "2026-04-03T15:15:38.464Z",
  "answer": {
    "answer_md": "# Research Insights: What are microservices...\n\n## Executive Summary\n\n...",
    "citations": [
      { "n": 1, "url": "https://...", "title": "...", "score": 1.0 },
      { "n": 2, "url": "https://...", "title": "...", "score": 1.0 }
    ],
    "created_at": "2026-04-03T15:15:38.458Z"
  },
  "docs_count": 6,
  "chunks_count": 44
}
```

---

## 10. SSE Event Protocol

Connect to: `GET /api/v2/research/jobs/{id}/stream/`  
Content-Type: `text/event-stream`

### Event Sequence (typical)

```
event: stream_start
data: {"job_id": "...", "timestamp": "..."}

event: planning
data: {"query": "...", "search_terms": [], "stage": "planning"}

event: searching
data: {"searches_completed": 1, "urls_found": 8, "stage": "searching"}

event: fetching
data: {"urls_processed": 0, "total_urls": 6, "progress_percent": 0, "stage": "fetching"}

event: fetching
data: {"urls_processed": 6, "total_urls": 6, "progress_percent": 100, "stage": "fetching"}

event: card
data: {"id": "card_abc123", "title": "...", "content": "...", "citations": [...], "confidence": 0.85, "authority": 0.90, "domain_cluster": "example.com", "tags": ["example.com"]}

event: card
data: {"id": "card_def456", "title": "...", ...}

event: synthesis
data: {"cards_generated": 3, "cards_rejected": 1, "stage": "synthesis"}

event: end
data: {"total_cards": 3, "processing_time_ms": 34139, "completed_at": "..."}

event: answer
data: {"answer_md": "# Research Insights...", "citations": [...], "created_at": "..."}

event: complete
data: {"job_id": "..."}

data: [DONE]
```

### Error Events

```
event: error
data: {"message": "Search provider timeout", "stage": "searching"}
```

---

## 11. Styling Guidelines

Follow the existing Pharaonic/Egyptian theme:

```
Primary:     nile-800 (#1A365D)    — headers, buttons
Accent:      gold-500 (#D4AF37)    — highlights, active states, borders
Background:  papyrus-50 (#FAF6EE)  — page background
Surface:     white / sandstone-100  — cards
Text:        charcoal-900          — body text
Muted:       charcoal-500          — secondary text

Status colors:
  queued:    gray-400
  running:   gold-500 (with pulse animation)
  done:      emerald-500
  error:     red-500

Use existing utilities:
  .glass         — glass morphism for cards
  .gold-border   — gold accent border
  .temple-gradient — gradient backgrounds
```

---

## 12. Performance Expectations

| Metric | Typical | Maximum |
|--------|---------|---------|
| Job creation → first SSE event | < 2s | 5s |
| Search phase | 1-3s | 8s |
| Fetch phase | 2-5s | 15s |
| Embedding phase | 1-3s | 10s |
| Synthesis (DeepSeek) | 5-15s per card | 30s |
| Total end-to-end | 15-40s | 120s |
| Job timeout (server) | - | 300s (5 min) |

---

## 13. Implementation Order

1. **Types** — `src/lib/types/research.ts`
2. **API Client** — `src/lib/api/research.ts`
3. **React Query hooks** — `src/lib/hooks/useResearch.ts`
4. **SSE hook** — `src/lib/hooks/useResearchSSE.ts`
5. **Zustand store** — `src/lib/stores/researchStore.ts`
6. **Components** (in order):
   - `ResearchInput.tsx`
   - `JobCard.tsx`
   - `JobTimeline.tsx`
   - `InsightCard.tsx`
   - `CitationBadge.tsx`
   - `AnswerRenderer.tsx`
   - `ResearchStats.tsx`
7. **Pages**:
   - `src/app/(app)/research/layout.tsx`
   - `src/app/(app)/research/page.tsx`
   - `src/app/(app)/research/[jobId]/page.tsx`
8. **Navigation** — Add "Research" link to sidebar/nav

---

## 14. Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://prompt-temple-2777469a4e35.herokuapp.com
```

No additional env vars needed — the research endpoints use the same base URL and auth as the rest of the app.

---

## 15. Testing Checklist

- [ ] Submit a query and see job created
- [ ] SSE stream connects and shows real-time progress
- [ ] Pipeline stages update in JobTimeline
- [ ] InsightCards appear as SSE card events arrive
- [ ] Full answer renders with markdown and citations
- [ ] Citation links open correct source URLs
- [ ] Job list shows history with correct status badges
- [ ] Error states handled (network error, job failure)
- [ ] Health check widget shows green/red indicators
- [ ] Mobile responsive layout works
- [ ] Dark mode styling correct
