import { BaseApiClient } from '@/lib/api/base';
import { useCreditsStore } from '@/store/credits';
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
} from '@/lib/types/research';

const RESEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://prompt-temple-2777469a4e35.herokuapp.com';

/**
 * Sync credit headers from a fetch Response into the Zustand credits store.
 */
function syncCreditsFromResponse(res: Response) {
  if (typeof window === 'undefined') return;

  const remaining = res.headers.get('X-Credits-Remaining');
  const used = res.headers.get('X-Credits-Used');
  const low = res.headers.get('X-Low-Credits');
  const balance = res.headers.get('X-Credits-Balance');
  const reserved = res.headers.get('X-Credits-Reserved');

  if (remaining !== null || balance !== null || low !== null) {
    useCreditsStore.getState().syncFromHeaders(
      remaining !== null ? Number(remaining) : null,
      used !== null ? Number(used) : null,
      low === 'true',
      balance !== null ? Number(balance) : null,
      reserved !== null ? Number(reserved) : null
    );
  }
}

/**
 * Get the auth header from localStorage (same pattern as broadcast.ts).
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

class ResearchClient extends BaseApiClient {
  constructor() {
    super(RESEARCH_BASE_URL);
  }

  // ─── Job Creation (routed through Next.js proxy for credit handling) ──
  async quickResearch(data: CreateJobRequest): Promise<QuickResearchResponse> {
    const res = await fetch('/api/v2/research/create', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    // Sync credit headers from the proxy response
    syncCreditsFromResponse(res);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const err = new Error(error.error || 'Research request failed');
      (err as any).status = res.status;
      (err as any).code = error.code;
      (err as any).response = error;
      throw err;
    }

    return res.json();
  }

  async intentFast(data: CreateJobRequest): Promise<IntentFastResponse> {
    // intent_fast also goes through the proxy for credit deduction
    // Reuses the same proxy — the proxy calls /quick/ on Heroku
    const res = await fetch('/api/v2/research/create', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    syncCreditsFromResponse(res);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const err = new Error(error.error || 'Research request failed');
      (err as any).status = res.status;
      (err as any).code = error.code;
      (err as any).response = error;
      throw err;
    }

    return res.json();
  }

  async batchResearch(queries: string[], top_k = 6) {
    return this.request('/api/v2/research/batch/', {
      method: 'POST',
      data: { queries, top_k },
    });
  }

  // ─── Job Retrieval (direct to Heroku — no credits needed) ─────────
  async getJob(jobId: string): Promise<ResearchJob> {
    return this.request<ResearchJob>(`/api/v2/research/jobs/${jobId}/`);
  }

  async listJobs(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<JobSummary>> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();
    return this.request<PaginatedResponse<JobSummary>>(
      `/api/v2/research/jobs/${qs ? `?${qs}` : ''}`
    );
  }

  async getJobProgress(jobId: string) {
    return this.request(`/api/v2/research/jobs/${jobId}/progress/`);
  }

  // ─── Job Data (direct to Heroku) ──────────────────────
  async getJobDocs(jobId: string): Promise<SourceDoc[]> {
    return this.request<SourceDoc[]>(`/api/v2/research/jobs/${jobId}/docs/`);
  }

  async getJobChunks(
    jobId: string,
    page = 1
  ): Promise<PaginatedResponse<Chunk>> {
    return this.request<PaginatedResponse<Chunk>>(
      `/api/v2/research/jobs/${jobId}/chunks/?page=${page}`
    );
  }

  // ─── System (direct to Heroku — public endpoints) ─────
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/api/v2/research/health/');
  }

  async getStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/v2/research/stats/');
  }

  // ─── SSE Stream URL Builder (direct to Heroku) ────────
  getStreamUrl(jobId: string): string {
    return `${RESEARCH_BASE_URL}/api/v2/research/jobs/${jobId}/stream/`;
  }

  getCardsStreamUrl(jobId: string): string {
    return `${RESEARCH_BASE_URL}/api/v2/research/jobs/${jobId}/cards/stream/`;
  }
}

export const researchClient = new ResearchClient();
