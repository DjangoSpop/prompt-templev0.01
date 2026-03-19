'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
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

const MCP_BASE = '/api/v2/mcp';

// ─── CATEGORIES ──────────────────────────────────────────

export function useMCPCategories() {
  return useQuery<PaginatedResponse<MCPCategory>>({
    queryKey: ['mcp-categories'],
    queryFn: () => apiClient.get(`${MCP_BASE}/categories/`),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── PROMPTS ─────────────────────────────────────────────

export function useMCPPrompts(filters?: MCPPromptFilters) {
  return useQuery<PaginatedResponse<MCPPromptListItem>>({
    queryKey: ['mcp-prompts', filters],
    queryFn: () => apiClient.get(`${MCP_BASE}/prompts/`, { params: filters as Record<string, string | number | boolean> }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMCPFeaturedPrompts() {
  return useQuery<PaginatedResponse<MCPPromptListItem>>({
    queryKey: ['mcp-prompts-featured'],
    queryFn: () => apiClient.get(`${MCP_BASE}/prompts/featured/`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMCPPromptDetail(slug: string) {
  return useQuery<MCPPromptDetail>({
    queryKey: ['mcp-prompt', slug],
    queryFn: () => apiClient.get(`${MCP_BASE}/prompts/${slug}/`),
    enabled: !!slug,
  });
}

// ─── DOCUMENTS ───────────────────────────────────────────

export function useMCPDocuments(filters?: MCPDocumentFilters) {
  return useQuery<PaginatedResponse<MCPDocumentListItem>>({
    queryKey: ['mcp-docs', filters],
    queryFn: () => apiClient.get(`${MCP_BASE}/documents/`, { params: filters as Record<string, string | number | boolean> }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMCPDocumentDetail(slug: string) {
  return useQuery<MCPDocumentDetail>({
    queryKey: ['mcp-doc', slug],
    queryFn: () => apiClient.get(`${MCP_BASE}/documents/${slug}/`),
    enabled: !!slug,
  });
}

// ─── SEARCH ──────────────────────────────────────────────

export function useMCPSearch(query: string) {
  return useQuery<MCPSearchResults>({
    queryKey: ['mcp-search', query],
    queryFn: () => apiClient.get(`${MCP_BASE}/search/`, { params: { q: query } }),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}

// ─── ACADEMY ─────────────────────────────────────────────

export function useAcademyCourses() {
  return useQuery<PaginatedResponse<AcademyCourse>>({
    queryKey: ['academy-courses'],
    queryFn: () => apiClient.get(`${MCP_BASE}/academy/courses/`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademyCourseDetail(slug: string) {
  return useQuery<AcademyCourseDetail>({
    queryKey: ['academy-course', slug],
    queryFn: () => apiClient.get(`${MCP_BASE}/academy/courses/${slug}/`),
    enabled: !!slug,
  });
}

export function useAcademyProgress() {
  return useQuery<AcademyEnrollment[]>({
    queryKey: ['academy-progress'],
    queryFn: async () => {
      const res = await apiClient.get<AcademyEnrollment[] | PaginatedResponse<AcademyEnrollment>>(`${MCP_BASE}/academy/progress/`);
      // Handle both paginated and plain array responses
      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object' && 'results' in res) return (res as PaginatedResponse<AcademyEnrollment>).results;
      return [];
    },
  });
}

export function useEnrollCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      apiClient.post(`${MCP_BASE}/academy/enroll/`, { course_id: courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academy-progress'] });
      qc.invalidateQueries({ queryKey: ['academy-courses'] });
    },
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { lesson_id: string; quiz_score?: number }) =>
      apiClient.post(`${MCP_BASE}/academy/complete-lesson/`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academy-progress'] });
    },
  });
}
