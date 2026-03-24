'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsService } from '@/lib/api/skills';
import type { SkillFilters } from '@/types/mcp';

// ─── Query Key Factory ────────────────────────────────

export const skillKeys = {
  all: ['skills'] as const,
  lists: (filters?: SkillFilters) => [...skillKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...skillKeys.all, 'detail', slug] as const,
  categories: () => [...skillKeys.all, 'categories'] as const,
  featured: () => [...skillKeys.all, 'featured'] as const,
  trending: () => [...skillKeys.all, 'trending'] as const,
  mcpServers: (search?: string) => [...skillKeys.all, 'mcp-servers', search] as const,
  stats: () => [...skillKeys.all, 'stats'] as const,
  bookmarks: () => [...skillKeys.all, 'bookmarks'] as const,
};

// ─── Skill Detail ────────────────────────────────────

export function useSkillDetail(slug: string) {
  return useQuery({
    queryKey: skillKeys.detail(slug),
    queryFn: () => skillsService.getSkillBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── List Skills ──────────────────────────────────────

export function useSkills(filters?: SkillFilters) {
  return useQuery({
    queryKey: skillKeys.lists(filters),
    queryFn: () => skillsService.getSkills(filters),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Skill Categories ─────────────────────────────────

export function useSkillCategories() {
  return useQuery({
    queryKey: skillKeys.categories(),
    queryFn: () => skillsService.getSkillCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Featured Skills ──────────────────────────────────

export function useFeaturedSkills(limit = 10) {
  return useQuery({
    queryKey: skillKeys.featured(),
    queryFn: () => skillsService.getFeaturedSkills(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Trending Skills ──────────────────────────────────

export function useTrendingSkills(limit = 10, days = 30) {
  return useQuery({
    queryKey: skillKeys.trending(),
    queryFn: () => skillsService.getTrendingSkills(limit, days),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── MCP Servers ──────────────────────────────────────

export function useMCPServers(search?: string) {
  return useQuery({
    queryKey: skillKeys.mcpServers(search),
    queryFn: () => skillsService.getMCPServers(search),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Skills Stats ─────────────────────────────────────

export function useSkillsStats() {
  return useQuery({
    queryKey: skillKeys.stats(),
    queryFn: () => skillsService.getSkillsStats(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── My Bookmarks ─────────────────────────────────────

export function useMyBookmarks() {
  return useQuery({
    queryKey: skillKeys.bookmarks(),
    queryFn: async () => {
      try {
        return await skillsService.getMyBookmarks();
      } catch {
        // Bookmarks are auth-gated; return empty for unauthenticated users
        return { bookmarks: [] };
      }
    },
    staleTime: 60 * 1000,
  });
}

// ─── Bookmark Mutation ────────────────────────────────

export function useBookmarkSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => skillsService.bookmarkSkill(skillId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: skillKeys.bookmarks() });
    },
  });
}

// ─── Unbookmark Mutation ──────────────────────────────

export function useUnbookmarkSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => skillsService.unbookmarkSkill(skillId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: skillKeys.bookmarks() });
    },
  });
}
