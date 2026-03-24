import { BaseApiClient } from './base';
import type {
  MCPCategory,
  MCPPromptListItem,
  MCPPromptDetail,
  MCPDocumentListItem,
  MCPDocumentDetail,
  MCPPromptFilters,
  MCPDocumentFilters,
  MCPSearchResults,
  AcademyCourse,
  AcademyCourseDetail,
  AcademyEnrollment,
  PaginatedResponse,
} from '@/types/mcp';

const BASE = '/api/v2/mcp';

export class MCPKnowledgeService extends BaseApiClient {
  // ─── CATEGORIES ──────────────────────────────────────
  async getCategories(): Promise<PaginatedResponse<MCPCategory>> {
    return this.request<PaginatedResponse<MCPCategory>>(`${BASE}/categories/`);
  }

  // ─── DOCUMENTS ───────────────────────────────────────
  async getDocuments(filters?: MCPDocumentFilters): Promise<PaginatedResponse<MCPDocumentListItem>> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.source_type) params.set('source_type', filters.source_type);
    if (filters?.tags) params.set('tags', filters.tags);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.ordering) params.set('ordering', filters.ordering);
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return this.request<PaginatedResponse<MCPDocumentListItem>>(`${BASE}/documents/${qs ? `?${qs}` : ''}`);
  }

  async getDocumentDetail(slug: string): Promise<MCPDocumentDetail> {
    return this.request<MCPDocumentDetail>(`${BASE}/documents/${slug}/`);
  }

  // ─── PROMPTS ─────────────────────────────────────────
  async getPrompts(filters?: MCPPromptFilters): Promise<PaginatedResponse<MCPPromptListItem>> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.use_case) params.set('use_case', filters.use_case);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.is_premium) params.set('is_premium', filters.is_premium);
    if (filters?.tags) params.set('tags', filters.tags);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.ordering) params.set('ordering', filters.ordering);
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return this.request<PaginatedResponse<MCPPromptListItem>>(`${BASE}/prompts/${qs ? `?${qs}` : ''}`);
  }

  async getFeaturedPrompts(): Promise<PaginatedResponse<MCPPromptListItem>> {
    return this.request<PaginatedResponse<MCPPromptListItem>>(`${BASE}/prompts/featured/`);
  }

  async getPromptDetail(slug: string): Promise<MCPPromptDetail> {
    return this.request<MCPPromptDetail>(`${BASE}/prompts/${slug}/`);
  }

  // ─── SEARCH ──────────────────────────────────────────
  async search(query: string, type?: string): Promise<MCPSearchResults> {
    return this.request<MCPSearchResults>(`${BASE}/search/`, {
      method: 'POST',
      data: { query, ...(type ? { type } : {}) },
    });
  }

  // ─── ACADEMY ─────────────────────────────────────────
  async getCourses(difficulty?: string): Promise<PaginatedResponse<AcademyCourse>> {
    const qs = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : '';
    return this.request<PaginatedResponse<AcademyCourse>>(`${BASE}/academy/courses/${qs}`);
  }

  async getCourseDetail(slug: string): Promise<AcademyCourseDetail> {
    return this.request<AcademyCourseDetail>(`${BASE}/academy/courses/${slug}/`);
  }

  async enrollCourse(courseId: string): Promise<{ enrolled: boolean; progress: Record<string, unknown> }> {
    return this.request<{ enrolled: boolean; progress: Record<string, unknown> }>(`${BASE}/academy/enroll/`, {
      method: 'POST',
      data: { course_id: courseId },
    });
  }

  async getProgress(courseId?: string): Promise<{ user_progress: AcademyEnrollment[] }> {
    const qs = courseId ? `?course_id=${courseId}` : '';
    return this.request<{ user_progress: AcademyEnrollment[] }>(`${BASE}/academy/progress/${qs}`);
  }

  async completeLesson(data: { course_id: string; lesson_id: string }): Promise<{ completed: boolean; progress: number }> {
    return this.request<{ completed: boolean; progress: number }>(`${BASE}/academy/complete-lesson/`, {
      method: 'POST',
      data,
    });
  }
}

export const mcpKnowledgeService = new MCPKnowledgeService();
