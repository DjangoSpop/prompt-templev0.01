/**
 * REST fetchers for onboarding slider data.
 * All public endpoints — no auth required.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

export interface PromptCard {
  id: string;
  title: string;
  slug: string;
  category_name: string;
  category_icon: string;
  description: string;
  use_case: string;
  difficulty: string;
  tags: string[];
  quality_score: number;
  is_featured: boolean;
  is_premium: boolean;
  credit_cost: number;
  usage_count: number;
  avg_rating: number | null;
}

export interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  category_type: string;
  description: string;
  icon: string;
  document_count: number;
  prompt_count: number;
}

export interface CourseCard {
  id: string;
  title: string;
  description: string;
  level: string;
  is_free: boolean;
  total_lessons: number;
  estimated_minutes: number;
  total_enrollments: number;
}

export async function fetchFeaturedPrompts(limit = 8): Promise<PromptCard[]> {
  const res = await fetch(`${API_BASE}/api/v2/mcp/prompts/featured/?page_size=${limit}`);
  if (!res.ok) throw new Error(`Featured prompts fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchCategories(): Promise<CategoryCard[]> {
  const res = await fetch(`${API_BASE}/api/v2/mcp/categories/`);
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchCourses(): Promise<CourseCard[]> {
  const res = await fetch(`${API_BASE}/api/v2/mcp/academy/courses/`);
  if (!res.ok) throw new Error(`Courses fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function searchMCP(query: string) {
  const res = await fetch(
    `${API_BASE}/api/v2/mcp/search/?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}
