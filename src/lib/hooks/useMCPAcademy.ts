'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mcpKnowledgeService } from '@/lib/api/mcp-knowledge';

// ─── Query Key Factory ────────────────────────────────

export const academyKeys = {
  all: ['academy'] as const,
  courses: (difficulty?: string) => [...academyKeys.all, 'courses', difficulty] as const,
  courseDetail: (slug: string) => [...academyKeys.all, 'course', slug] as const,
  progress: () => [...academyKeys.all, 'progress'] as const,
};

// ─── List Courses ─────────────────────────────────────

export function useAcademyCoursesV2(difficulty?: string) {
  return useQuery({
    queryKey: academyKeys.courses(difficulty),
    queryFn: () => mcpKnowledgeService.getCourses(difficulty),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Course Detail ────────────────────────────────────

export function useAcademyCourseDetailV2(slug: string) {
  return useQuery({
    queryKey: academyKeys.courseDetail(slug),
    queryFn: () => mcpKnowledgeService.getCourseDetail(slug),
    enabled: !!slug,
  });
}

// ─── User Progress ────────────────────────────────────

export function useAcademyProgressV2() {
  return useQuery({
    queryKey: academyKeys.progress(),
    queryFn: async () => {
      const res = await mcpKnowledgeService.getProgress();
      return res.user_progress ?? [];
    },
  });
}

// ─── Enroll in Course ─────────────────────────────────

export function useEnrollCourseV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => mcpKnowledgeService.enrollCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academyKeys.progress() });
      qc.invalidateQueries({ queryKey: academyKeys.courses() });
    },
  });
}

// ─── Complete Lesson ──────────────────────────────────

export function useCompleteLessonV2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { course_id: string; lesson_id: string }) =>
      mcpKnowledgeService.completeLesson(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academyKeys.progress() });
    },
  });
}
