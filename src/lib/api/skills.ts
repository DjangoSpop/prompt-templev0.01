import { BaseApiClient } from './base';
import type {
  Skill,
  SkillBookmark,
  SkillCategory,
  SkillFilters,
  SkillsStats,
  PaginatedResponse,
} from '@/types/mcp';

const BASE = '/api/v2/skills';

export class SkillsService extends BaseApiClient {
  async getSkills(filters?: SkillFilters): Promise<PaginatedResponse<Skill>> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.skill_type) params.set('type', filters.skill_type);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.ordering) params.set('ordering', filters.ordering);
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return this.request<PaginatedResponse<Skill>>(`${BASE}/${qs ? `?${qs}` : ''}`);
  }

  async getSkillCategories(): Promise<{ categories: SkillCategory[] }> {
    const res = await this.request<{ categories: SkillCategory[] } | SkillCategory[]>(`${BASE}/categories/`);
    // API may return array directly or wrapped in {categories: [...]}
    if (Array.isArray(res)) {
      return { categories: res };
    }
    return res;
  }

  async getFeaturedSkills(limit = 10): Promise<Skill[]> {
    const res = await this.request<Skill[] | { results: Skill[] }>(
      `${BASE}/featured/?limit=${limit}`
    );
    return Array.isArray(res) ? res : res.results;
  }

  async getTrendingSkills(limit = 10, days = 30): Promise<Skill[]> {
    const res = await this.request<Skill[] | { results: Skill[] }>(
      `${BASE}/trending/?limit=${limit}&days=${days}`
    );
    return Array.isArray(res) ? res : res.results;
  }

  async getMCPServers(search?: string): Promise<PaginatedResponse<Skill>> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<PaginatedResponse<Skill>>(`${BASE}/mcp_servers/${qs}`);
  }

  async getSkillBySlug(slug: string): Promise<Skill> {
    return this.request<Skill>(`${BASE}/${slug}/`);
  }

  async getSkillsStats(): Promise<SkillsStats> {
    return this.request<SkillsStats>(`${BASE}/stats/`);
  }

  async getMyBookmarks(): Promise<{ bookmarks: SkillBookmark[] }> {
    const res = await this.request<{ bookmarks: SkillBookmark[] } | SkillBookmark[] | PaginatedResponse<SkillBookmark>>(`${BASE}/my_bookmarks/`);
    if (Array.isArray(res)) return { bookmarks: res };
    if ('results' in res) return { bookmarks: res.results };
    return res;
  }

  async bookmarkSkill(skillId: string): Promise<{ bookmarked: boolean }> {
    return this.request<{ bookmarked: boolean }>(`${BASE}/${skillId}/bookmark/`, {
      method: 'POST',
    });
  }

  async unbookmarkSkill(skillId: string): Promise<{ bookmarked: boolean }> {
    return this.request<{ bookmarked: boolean }>(`${BASE}/${skillId}/bookmark/`, {
      method: 'DELETE',
    });
  }
}

export const skillsService = new SkillsService();
