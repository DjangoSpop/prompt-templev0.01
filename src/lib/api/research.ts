import { BaseApiClient } from '@/lib/api/base';
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

class ResearchClient extends BaseApiClient {
  constructor() {
    super(RESEARCH_BASE_URL);
  }

  // ─── Job Creation ─────────────────────────────────────
  async quickResearch(data: CreateJobRequest): Promise<QuickResearchResponse> {
    return this.request<QuickResearchResponse>('/api/v2/research/quick/', {
      method: 'POST',
      data,
    });
  }

  async intentFast(data: CreateJobRequest): Promise<IntentFastResponse> {
    return this.request<IntentFastResponse>('/api/v2/research/intent_fast/', {
      method: 'POST',
      data,
    });
  }

  async batchResearch(queries: string[], top_k = 6) {
    return this.request('/api/v2/research/batch/', {
      method: 'POST',
      data: { queries, top_k },
    });
  }

  // ─── Job Retrieval ────────────────────────────────────
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

  // ─── Job Data ─────────────────────────────────────────
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

  // ─── System ───────────────────────────────────────────
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/api/v2/research/health/');
  }

  async getStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/v2/research/stats/');
  }

  // ─── SSE Stream URL Builder ───────────────────────────
  getStreamUrl(jobId: string): string {
    return `${RESEARCH_BASE_URL}/api/v2/research/jobs/${jobId}/stream/`;
  }

  getCardsStreamUrl(jobId: string): string {
    return `${RESEARCH_BASE_URL}/api/v2/research/jobs/${jobId}/cards/stream/`;
  }
}

export const researchClient = new ResearchClient();
