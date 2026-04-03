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
  data: Record<string, unknown>
}

export interface PlanningEventData {
  query: string
  search_terms: string[]
  stage: 'planning'
}

export interface SearchingEventData {
  searches_completed: number
  urls_found: number
  stage: 'searching'
}

export interface FetchingEventData {
  urls_processed: number
  total_urls: number
  progress_percent: number
  stage: 'fetching'
}

export interface SynthesisEventData {
  cards_generated: number
  cards_rejected: number
  stage: 'synthesis'
}

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
