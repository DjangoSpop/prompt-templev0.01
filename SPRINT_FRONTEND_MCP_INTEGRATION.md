# 🏛️ FRONTEND SPRINT: MCP Knowledge Base, Prompt Library & Academy
## Prompt Temple — Next.js 15 Implementation Sprint for Claude Code

> **Sprint Owner:** Django  
> **Sprint Type:** Frontend Feature Build (7 pages + components + hooks)  
> **Priority:** HIGH — Backend is LIVE on Heroku, frontend is the blocker  
> **API Base:** `https://prompt-temple-2777469a4e35.herokuapp.com/api/v2/mcp/`  
> **Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · Framer Motion · React Query · shadcn/ui  
> **Design System:** Pharaonic Egyptian Theme (already implemented)

---

## 📋 CURRENT STATE

### Backend (LIVE ✅)
| Data | Count | Status |
|------|-------|--------|
| Categories | 12 | ✅ Seeded |
| Knowledge Documents | 49 | ✅ Seeded |
| Prompt Templates | 125 | ✅ Seeded |
| Featured Prompts | 4 | ✅ Marked |
| Premium Prompts | ~25 | ✅ Flagged |
| Crawl Sources | 10 | ✅ Registered |
| Academy Course | 1 (12 lessons + quiz) | ✅ Published |
| Celery Beat | Auto-crawl hourly | ✅ Scheduled |

### Frontend (Current)
- Pharaonic theme system: **implemented** (CSS vars, light/dark mode, design tokens)
- Existing pages: dashboard, library, optimizer, auth
- API client: `src/lib/api/client-v2.ts` with JWT + refresh
- Components: `EnhancedTemplateCard`, `SearchBar`, `CategoryChips`, `TempleNavbar`
- Existing route groups: `(app)/` for auth'd, `(shell)/` for shell layout

### Design Tokens (Already in globals.css)
```css
/* Light Mode */
--bg: #FBF6E9;          /* Papyrus */
--fg: #0E1B2A;          /* Deep ink */
--primary: #0E3A8C;     /* Egyptian Blue / Lapis */
--accent: #C9A227;      /* Gold */
--card: #FFFFFF;
--border: #E6DEC9;      /* Sand */

/* Dark Mode */
--bg: #0E0F12;          /* Basalt */
--fg: #EDEFF3;          /* Moonlight */
--primary: #6CA0FF;     /* Lighter blue */
--accent: #E9C25A;      /* Soft gold */
--card: #161A22;
--border: #2A2E38;
```

**Tailwind aliases already configured:** `lapis`, `gold`, `sand`, `papyrus`, `obsidian`, `nile-teal`

---

## 🗂️ FILE STRUCTURE TO CREATE

```
src/
├── app/
│   ├── (shell)/
│   │   ├── mcp/
│   │   │   ├── page.tsx                          # MCP Library Hub
│   │   │   ├── prompts/
│   │   │   │   ├── page.tsx                      # Prompt Browser (filterable grid)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx                  # Prompt Detail + Variable Form
│   │   │   ├── docs/
│   │   │   │   ├── page.tsx                      # Knowledge Article List
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx                  # Full Article View (render MD)
│   │   │   └── search/
│   │   │       └── page.tsx                      # MCP Search Results
│   │   └── academy/
│   │       ├── page.tsx                          # Academy Course Catalog
│   │       ├── [slug]/
│   │       │   ├── page.tsx                      # Course Detail + Lesson List
│   │       │   └── [lessonSlug]/
│   │       │       └── page.tsx                  # Lesson View (render MD)
│   │       └── certificate/
│   │           └── [id]/
│   │               └── page.tsx                  # Shareable Certificate
├── components/
│   ├── mcp/
│   │   ├── MCPCategoryCard.tsx                   # Category card with icon + counts
│   │   ├── MCPPromptCard.tsx                     # Prompt template card
│   │   ├── MCPPromptVariableForm.tsx             # Dynamic variable form
│   │   ├── MCPPromptPreview.tsx                  # Live rendered preview
│   │   ├── MCPDocumentCard.tsx                   # Knowledge article card
│   │   ├── MCPSearchBar.tsx                      # MCP-specific search
│   │   ├── MCPFilterSidebar.tsx                  # Filter panel (category, difficulty, use_case)
│   │   ├── MCPDifficultyBadge.tsx                # beginner/intermediate/advanced/expert pill
│   │   ├── MCPModelBadges.tsx                    # claude/gpt4/deepseek target model badges
│   │   └── MCPHeroSection.tsx                    # MCP Library hero banner
│   └── academy/
│       ├── CourseCard.tsx                         # Course card with progress
│       ├── LessonList.tsx                         # Grouped lesson list with progress
│       ├── LessonViewer.tsx                       # MD renderer for lesson content
│       ├── QuizRenderer.tsx                       # Interactive quiz from MD
│       ├── ProgressBar.tsx                        # Course progress bar
│       ├── EnrollButton.tsx                       # Enroll/Continue CTA
│       └── CertificateView.tsx                    # Pharaonic certificate design
├── hooks/
│   └── useMCPContent.ts                          # All React Query hooks
├── types/
│   └── mcp.ts                                    # TypeScript interfaces
└── lib/
    └── mcp-utils.ts                              # Variable replacement, slug helpers
```

---

## 📦 SPRINT 1: TYPES + HOOKS + UTILITIES

### 1.1 TypeScript Interfaces

**File:** `src/types/mcp.ts`

```typescript
// ─────────────────────────────────────────────────────────
// MCP KNOWLEDGE BASE TYPES
// ─────────────────────────────────────────────────────────

export interface MCPCategory {
  id: string;
  name: string;
  slug: string;
  category_type: MCPCategoryType;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  document_count: number;
  prompt_count: number;
}

export type MCPCategoryType =
  | 'mcp_servers'
  | 'mcp_clients'
  | 'mcp_prompts'
  | 'agent_patterns'
  | 'agent_frameworks'
  | 'a2a_protocol'
  | 'tool_integration'
  | 'context_engineering'
  | 'security'
  | 'enterprise'
  | 'tutorials'
  | 'use_cases';

export interface PromptVariable {
  name: string;
  description: string;
  example: string;
}

export type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PromptUseCase =
  | 'mcp_server_build'
  | 'mcp_client_config'
  | 'agent_design'
  | 'tool_creation'
  | 'prompt_engineering'
  | 'multi_agent'
  | 'context_engineering'
  | 'security_audit'
  | 'migration'
  | 'testing'
  | 'monitoring'
  | 'enterprise_deploy'
  | 'workflow_automation'
  | 'data_pipeline'
  | 'code_review'
  | 'customer_support'
  | 'content_creation'
  | 'research_agent'
  | 'devops_agent'
  | 'marketing_agent';

/** Prompt list item (no full template text) */
export interface MCPPromptListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  category_name: string;
  category_icon: string;
  description: string;
  use_case: PromptUseCase;
  difficulty: PromptDifficulty;
  target_models: string[];
  tags: string[];
  quality_score: number;
  is_featured: boolean;
  is_premium: boolean;
  credit_cost: number;
  usage_count: number;
  avg_rating: number | null;
  created_at: string;
}

/** Full prompt detail (includes template + variables) */
export interface MCPPromptDetail extends MCPPromptListItem {
  prompt_template: string;
  example_output: string;
  variables: PromptVariable[];
  conversion_rate: number | null;
  is_active: boolean;
  updated_at: string;
}

export type DocumentSourceType = 'manual' | 'crawled' | 'curated' | 'generated' | 'community';

/** Knowledge document list item */
export interface MCPDocumentListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  category_name: string;
  category_icon: string;
  excerpt: string;
  summary: string;
  source_type: DocumentSourceType;
  status: string;
  quality_score: number;
  tags: string[];
  mcp_version: string;
  view_count: number;
  created_at: string;
  published_at: string | null;
}

/** Full document detail */
export interface MCPDocumentDetail extends MCPDocumentListItem {
  content_md: string;
}

// ─────────────────────────────────────────────────────────
// ACADEMY TYPES
// ─────────────────────────────────────────────────────────

export type AcademyLevel = 'awareness' | 'practitioner' | 'expert' | 'architect';
export type LessonContentType = 'article' | 'video' | 'quiz' | 'exercise' | 'prompt_lab';

export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: AcademyLevel;
  thumbnail_url: string;
  is_free: boolean;
  credit_cost: number;
  total_lessons: number;
  estimated_minutes: number;
  total_enrollments: number;
  completion_rate: number;
  is_published: boolean;
  display_order: number;
}

export interface AcademyCourseDetail extends AcademyCourse {
  lessons: AcademyLesson[];
}

export interface AcademyLesson {
  id: string;
  title: string;
  slug: string;
  content_type: LessonContentType;
  content_md?: string;
  section_number: number;
  lesson_number: number;
  estimated_minutes: number;
  is_free_preview: boolean;
  is_published: boolean;
}

export interface AcademyEnrollment {
  id: string;
  course: string;
  course_title: string;
  course_slug: string;
  completed_lessons: string[];
  progress_percentage: number;
  quiz_scores: Record<string, number>;
  is_completed: boolean;
  completed_at: string | null;
  certificate_id: string;
  enrolled_at: string;
  last_activity_at: string;
}

// ─────────────────────────────────────────────────────────
// SEARCH + PAGINATION
// ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MCPSearchResults {
  query: string;
  results: {
    documents: MCPDocumentListItem[];
    prompts: MCPPromptListItem[];
    courses: AcademyCourse[];
  };
}

// ─────────────────────────────────────────────────────────
// FILTER PARAMS
// ─────────────────────────────────────────────────────────

export interface MCPPromptFilters {
  category?: string;
  use_case?: PromptUseCase;
  difficulty?: PromptDifficulty;
  is_premium?: string;      // 'true' | 'false'
  tags?: string;             // comma-separated
  search?: string;
  ordering?: string;
  page?: number;
}

export interface MCPDocumentFilters {
  category?: string;
  source_type?: DocumentSourceType;
  tags?: string;
  search?: string;
  ordering?: string;
  page?: number;
}
```

### 1.2 React Query Hooks

**File:** `src/hooks/useMCPContent.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client-v2';
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
    staleTime: 5 * 60 * 1000, // 5 min — categories rarely change
  });
}

// ─── PROMPTS ─────────────────────────────────────────────

export function useMCPPrompts(filters?: MCPPromptFilters) {
  return useQuery<PaginatedResponse<MCPPromptListItem>>({
    queryKey: ['mcp-prompts', filters],
    queryFn: () => apiClient.get(`${MCP_BASE}/prompts/`, { params: filters }),
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
    queryFn: () => apiClient.get(`${MCP_BASE}/documents/`, { params: filters }),
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
    queryFn: () => apiClient.get(`${MCP_BASE}/academy/progress/`),
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
```

### 1.3 Utility Functions

**File:** `src/lib/mcp-utils.ts`

```typescript
import type { PromptDifficulty, PromptUseCase, AcademyLevel } from '@/types/mcp';

/**
 * Replace {{variables}} in a prompt template with user values.
 * Unfilled variables remain as highlighted placeholders.
 */
export function renderPromptTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.trim() || match;
  });
}

/**
 * Extract all {{variable}} names from a template string.
 */
export function extractVariableNames(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

/**
 * Difficulty badge color mapping.
 */
export const DIFFICULTY_CONFIG: Record<
  PromptDifficulty,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: 'Beginner',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  expert: {
    label: 'Expert',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
};

/**
 * Use case display name mapping.
 */
export const USE_CASE_LABELS: Record<PromptUseCase, string> = {
  mcp_server_build: 'Build an MCP Server',
  mcp_client_config: 'MCP Client Config',
  agent_design: 'Design an AI Agent',
  tool_creation: 'Create MCP Tools',
  prompt_engineering: 'Prompt Engineering',
  multi_agent: 'Multi-Agent Orchestration',
  context_engineering: 'Context Engineering',
  security_audit: 'Security Audit',
  migration: 'API-to-MCP Migration',
  testing: 'Testing & Validation',
  monitoring: 'Monitoring & Observability',
  enterprise_deploy: 'Enterprise Deployment',
  workflow_automation: 'Workflow Automation',
  data_pipeline: 'Data Pipeline',
  code_review: 'Code Review Agent',
  customer_support: 'Support Agent',
  content_creation: 'Content Creation',
  research_agent: 'Research Agent',
  devops_agent: 'DevOps Agent',
  marketing_agent: 'Marketing Agent',
};

/**
 * Academy level config.
 */
export const LEVEL_CONFIG: Record<
  AcademyLevel,
  { label: string; color: string; bg: string }
> = {
  awareness: {
    label: 'Awareness',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  practitioner: {
    label: 'Practitioner',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  expert: {
    label: 'Expert',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  architect: {
    label: 'Architect',
    color: 'text-[#C9A227]',
    bg: 'bg-[#C9A227]/10',
  },
};

/**
 * Section titles for the MCP Awareness course.
 * Extend as new courses are added.
 */
export const COURSE_SECTION_TITLES: Record<number, string> = {
  1: 'The Big Picture',
  2: 'Core Concepts',
  3: 'The Agentic World',
  4: 'Getting Started',
};

/**
 * AI model badge colors.
 */
export const MODEL_COLORS: Record<string, string> = {
  claude: 'bg-[#D97706]/10 text-[#D97706]',
  gpt4: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  deepseek: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  gemini: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
};
```

---

## 📦 SPRINT 2: SHARED COMPONENTS

### 2.1 MCPCategoryCard

**File:** `src/components/mcp/MCPCategoryCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPCategory } from '@/types/mcp';

interface Props {
  category: MCPCategory;
}

export function MCPCategoryCard({ category }: Props) {
  return (
    <Link href={`/mcp/prompts?category=${category.slug}`}>
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(201,162,39,0.15)' }}
        className="group relative overflow-hidden rounded-xl border border-[var(--border)]
                   bg-[var(--card)] p-5 transition-colors hover:border-[#C9A227]/40
                   cursor-pointer"
      >
        {/* Accent left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A]
                        group-hover:bg-[#C9A227] transition-colors" />

        <div className="pl-3">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="mt-2 font-semibold text-[var(--fg)] line-clamp-1">
            {category.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--fg)]/60">
            {category.prompt_count} prompts · {category.document_count} articles
          </p>
          <p className="mt-2 text-sm text-[var(--fg)]/70 line-clamp-2">
            {category.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
```

### 2.2 MCPPromptCard

**File:** `src/components/mcp/MCPPromptCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPPromptListItem } from '@/types/mcp';
import { DIFFICULTY_CONFIG, USE_CASE_LABELS } from '@/lib/mcp-utils';
import { MCPDifficultyBadge } from './MCPDifficultyBadge';
import { MCPModelBadges } from './MCPModelBadges';

interface Props {
  prompt: MCPPromptListItem;
}

export function MCPPromptCard({ prompt }: Props) {
  return (
    <Link href={`/mcp/prompts/${prompt.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative flex flex-col h-full rounded-xl border
                   border-[var(--border)] bg-[var(--card)] p-5
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        {/* Top row: badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {prompt.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium
                             text-[#C9A227]">
                ★ Featured
              </span>
            )}
            {prompt.is_premium && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-[#1E3A8A]/10 px-2.5 py-0.5 text-xs font-medium
                             text-[#1E3A8A] dark:text-[#6CA0FF]">
                🔒 Premium
              </span>
            )}
          </div>
          <MCPDifficultyBadge difficulty={prompt.difficulty} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3 flex-1">
          {prompt.description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--fg)]/50 mb-3">
          <span>{prompt.category_icon}</span>
          <span>{prompt.category_name}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs
                         text-[var(--fg)]/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom: quality + cost + models */}
        <div className="flex items-center justify-between pt-3 border-t
                        border-[var(--border)]">
          <div className="flex items-center gap-3 text-xs text-[var(--fg)]/50">
            <span>⭐ {prompt.quality_score.toFixed(2)}</span>
            <span>💰 {prompt.credit_cost} credit{prompt.credit_cost !== 1 ? 's' : ''}</span>
          </div>
          <MCPModelBadges models={prompt.target_models} />
        </div>
      </motion.div>
    </Link>
  );
}
```

### 2.3 MCPDifficultyBadge

**File:** `src/components/mcp/MCPDifficultyBadge.tsx`

```typescript
import type { PromptDifficulty } from '@/types/mcp';
import { DIFFICULTY_CONFIG } from '@/lib/mcp-utils';

interface Props {
  difficulty: PromptDifficulty;
}

export function MCPDifficultyBadge({ difficulty }: Props) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
```

### 2.4 MCPModelBadges

**File:** `src/components/mcp/MCPModelBadges.tsx`

```typescript
import { MODEL_COLORS } from '@/lib/mcp-utils';

interface Props {
  models: string[];
}

export function MCPModelBadges({ models }: Props) {
  return (
    <div className="flex gap-1">
      {models.slice(0, 3).map((model) => (
        <span
          key={model}
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${MODEL_COLORS[model] || 'bg-gray-100 text-gray-600'}`}
        >
          {model}
        </span>
      ))}
    </div>
  );
}
```

### 2.5 MCPPromptVariableForm

**File:** `src/components/mcp/MCPPromptVariableForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import type { PromptVariable } from '@/types/mcp';

interface Props {
  variables: PromptVariable[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function MCPPromptVariableForm({ variables, values, onChange }: Props) {
  const updateValue = (name: string, value: string) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--fg)]/80 uppercase tracking-wider">
        Fill in Variables
      </h3>
      {variables.map((v) => (
        <div key={v.name}>
          <label className="block text-sm font-medium text-[var(--fg)] mb-1">
            {v.description}
          </label>
          <input
            type="text"
            placeholder={v.example}
            value={values[v.name] || ''}
            onChange={(e) => updateValue(v.name, e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)]
                       px-3 py-2 text-sm text-[var(--fg)]
                       placeholder:text-[var(--fg)]/30
                       focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40
                       focus:border-[#C9A227]"
          />
          <p className="mt-1 text-xs text-[var(--fg)]/40">
            e.g., {v.example}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 2.6 MCPPromptPreview

**File:** `src/components/mcp/MCPPromptPreview.tsx`

```typescript
'use client';

import { useMemo } from 'react';
import { renderPromptTemplate } from '@/lib/mcp-utils';

interface Props {
  template: string;
  values: Record<string, string>;
}

export function MCPPromptPreview({ template, values }: Props) {
  const rendered = useMemo(
    () => renderPromptTemplate(template, values),
    [template, values],
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
      <h3 className="text-sm font-semibold text-[var(--fg)]/80 uppercase tracking-wider mb-3">
        Live Preview
      </h3>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono
                        text-[var(--fg)]/80 bg-transparent p-0">
          {rendered.split(/(\{\{\w+\}\})/).map((part, i) =>
            part.match(/^\{\{\w+\}\}$/) ? (
              <span
                key={i}
                className="inline rounded bg-[#C9A227]/20 px-1 py-0.5
                           text-[#C9A227] font-semibold"
              >
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </pre>
      </div>
    </div>
  );
}
```

### 2.7 MCPFilterSidebar

**File:** `src/components/mcp/MCPFilterSidebar.tsx`

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMCPCategories } from '@/hooks/useMCPContent';
import { DIFFICULTY_CONFIG, USE_CASE_LABELS } from '@/lib/mcp-utils';
import type { PromptDifficulty, PromptUseCase } from '@/types/mcp';

export function MCPFilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: catData } = useMCPCategories();

  const currentCategory = params.get('category') || '';
  const currentDifficulty = params.get('difficulty') || '';
  const currentUseCase = params.get('use_case') || '';

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page on filter change
    router.push(`/mcp/prompts?${newParams.toString()}`);
  };

  return (
    <aside className="w-64 shrink-0 space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Category
        </h4>
        <div className="space-y-1">
          <FilterButton
            label="All Categories"
            active={!currentCategory}
            onClick={() => setFilter('category', '')}
          />
          {catData?.results.map((cat) => (
            <FilterButton
              key={cat.id}
              label={`${cat.icon} ${cat.name}`}
              count={cat.prompt_count}
              active={currentCategory === cat.slug}
              onClick={() => setFilter('category', cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Difficulty
        </h4>
        <div className="space-y-1">
          <FilterButton
            label="All Levels"
            active={!currentDifficulty}
            onClick={() => setFilter('difficulty', '')}
          />
          {(Object.keys(DIFFICULTY_CONFIG) as PromptDifficulty[]).map((d) => (
            <FilterButton
              key={d}
              label={DIFFICULTY_CONFIG[d].label}
              active={currentDifficulty === d}
              onClick={() => setFilter('difficulty', d)}
            />
          ))}
        </div>
      </div>

      {/* Use Case Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Use Case
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          <FilterButton
            label="All Use Cases"
            active={!currentUseCase}
            onClick={() => setFilter('use_case', '')}
          />
          {(Object.entries(USE_CASE_LABELS) as [PromptUseCase, string][]).map(
            ([key, label]) => (
              <FilterButton
                key={key}
                label={label}
                active={currentUseCase === key}
                onClick={() => setFilter('use_case', key)}
              />
            ),
          )}
        </div>
      </div>

      {/* Premium Toggle */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Access
        </h4>
        <div className="space-y-1">
          <FilterButton label="All" active={!params.get('is_premium')} onClick={() => setFilter('is_premium', '')} />
          <FilterButton label="Free Only" active={params.get('is_premium') === 'false'} onClick={() => setFilter('is_premium', 'false')} />
          <FilterButton label="Premium Only" active={params.get('is_premium') === 'true'} onClick={() => setFilter('is_premium', 'true')} />
        </div>
      </div>
    </aside>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5
                  text-sm transition-colors text-left
                  ${active
                    ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] font-medium'
                    : 'text-[var(--fg)]/60 hover:bg-[var(--bg)] hover:text-[var(--fg)]'
                  }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-[var(--fg)]/30">{count}</span>
      )}
    </button>
  );
}
```

### 2.8 MCPDocumentCard

**File:** `src/components/mcp/MCPDocumentCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPDocumentListItem } from '@/types/mcp';

interface Props {
  doc: MCPDocumentListItem;
}

export function MCPDocumentCard({ doc }: Props) {
  return (
    <Link href={`/mcp/docs/${doc.slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group rounded-xl border border-[var(--border)] bg-[var(--card)]
                   p-5 hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{doc.category_icon}</span>
          <span className="text-xs text-[var(--fg)]/50">{doc.category_name}</span>
          <span className="text-xs text-[var(--fg)]/30">·</span>
          <span className="text-xs text-[var(--fg)]/30">⭐ {doc.quality_score.toFixed(2)}</span>
        </div>

        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#6CA0FF] transition-colors">
          {doc.title}
        </h3>

        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3">
          {doc.summary || doc.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--fg)]/50">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
```

### 2.9 MCPHeroSection

**File:** `src/components/mcp/MCPHeroSection.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function MCPHeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/90 to-[#0E1B2A] p-8 md:p-12 mb-8">
      {/* Subtle pyramid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent border-b-[#C9A227]" />
        <div className="absolute bottom-4 left-12 w-0 h-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#C9A227]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl"
      >
        <span className="inline-block rounded-full bg-[#C9A227]/20 px-3 py-1 text-xs font-medium text-[#C9A227] mb-4">
          🏛️ The Agentic AI Era
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Master MCP & AI Agents
        </h1>
        <p className="text-base md:text-lg text-white/70 mb-6 max-w-xl">
          125+ professional prompt templates, 49 expert knowledge articles, and a
          free Academy course — everything you need to build with the Model Context Protocol.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mcp/prompts"
            className="rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
          >
            Browse Prompts →
          </Link>
          <Link
            href="/academy"
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Start Academy (Free)
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
```

---

## 📦 SPRINT 3: PAGE IMPLEMENTATIONS

### 3.1 MCP Library Hub (`/mcp`)

**File:** `src/app/(shell)/mcp/page.tsx`

```typescript
'use client';

import { useMCPCategories, useMCPFeaturedPrompts, useMCPDocuments } from '@/hooks/useMCPContent';
import { MCPHeroSection } from '@/components/mcp/MCPHeroSection';
import { MCPCategoryCard } from '@/components/mcp/MCPCategoryCard';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPDocumentCard } from '@/components/mcp/MCPDocumentCard';
import Link from 'next/link';

export default function MCPLibraryPage() {
  const { data: categories, isLoading: catLoading } = useMCPCategories();
  const { data: featured, isLoading: featLoading } = useMCPFeaturedPrompts();
  const { data: latestDocs } = useMCPDocuments({ ordering: '-created_at' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <MCPHeroSection />

      {/* Featured Prompts */}
      {featured?.results && featured.results.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--fg)]">★ Featured Prompts</h2>
            <Link href="/mcp/prompts?ordering=-quality_score" className="text-sm text-[#1E3A8A] dark:text-[#6CA0FF] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.results.slice(0, 8).map((p) => (
              <MCPPromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--fg)] mb-4">Explore by Category</h2>
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-[var(--bg)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.results.map((cat) => (
              <MCPCategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Knowledge Articles */}
      {latestDocs?.results && latestDocs.results.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--fg)]">📚 Latest Knowledge</h2>
            <Link href="/mcp/docs" className="text-sm text-[#1E3A8A] dark:text-[#6CA0FF] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestDocs.results.slice(0, 6).map((doc) => (
              <MCPDocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}

      {/* Academy CTA */}
      <section className="rounded-2xl border-2 border-dashed border-[#C9A227]/30 bg-[#C9A227]/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">
          🎓 Prompt Temple Academy
        </h2>
        <p className="text-[var(--fg)]/60 mb-4 max-w-lg mx-auto">
          Learn MCP from zero to agent builder. Free course with 12 lessons, hands-on exercises, and a certificate.
        </p>
        <Link
          href="/academy"
          className="inline-block rounded-lg bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
        >
          Start Learning for Free →
        </Link>
      </section>
    </div>
  );
}
```

### 3.2 Prompt Browser (`/mcp/prompts`)

**File:** `src/app/(shell)/mcp/prompts/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useMCPPrompts } from '@/hooks/useMCPContent';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPFilterSidebar } from '@/components/mcp/MCPFilterSidebar';
import type { MCPPromptFilters } from '@/types/mcp';

export default function MCPPromptsPage() {
  const params = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');

  const filters: MCPPromptFilters = {
    category: params.get('category') || undefined,
    use_case: (params.get('use_case') as MCPPromptFilters['use_case']) || undefined,
    difficulty: (params.get('difficulty') as MCPPromptFilters['difficulty']) || undefined,
    is_premium: params.get('is_premium') || undefined,
    search: params.get('search') || undefined,
    ordering: params.get('ordering') || '-quality_score',
    page: Number(params.get('page')) || 1,
  };

  const { data, isLoading } = useMCPPrompts(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--fg)]">MCP Prompt Library</h1>
        <p className="text-sm text-[var(--fg)]/60 mt-1">
          {data?.count ?? '...'} professional prompt templates for the agentic AI era
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newParams = new URLSearchParams(params.toString());
            if (searchQuery) newParams.set('search', searchQuery);
            else newParams.delete('search');
            newParams.delete('page');
            window.history.pushState(null, '', `/mcp/prompts?${newParams.toString()}`);
          }}
        >
          <input
            type="text"
            placeholder="Search prompts... (e.g., kubernetes, security, python)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)]
                       px-4 py-3 text-sm text-[var(--fg)]
                       placeholder:text-[var(--fg)]/30
                       focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
          />
        </form>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <MCPFilterSidebar />
        </div>

        {/* Main grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-52 rounded-xl bg-[var(--bg)] animate-pulse" />
              ))}
            </div>
          ) : data?.results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-[var(--fg)]/50">No prompts match your filters.</p>
              <p className="text-sm text-[var(--fg)]/30 mt-1">Try adjusting your search or removing filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data?.results.map((p) => (
                  <MCPPromptCard key={p.id} prompt={p} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.count > 20 && (
                <div className="flex justify-center gap-2 mt-8">
                  {data.previous && (
                    <PaginationButton
                      label="← Previous"
                      page={(filters.page || 1) - 1}
                    />
                  )}
                  <span className="px-4 py-2 text-sm text-[var(--fg)]/50">
                    Page {filters.page || 1} of {Math.ceil(data.count / 20)}
                  </span>
                  {data.next && (
                    <PaginationButton
                      label="Next →"
                      page={(filters.page || 1) + 1}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationButton({ label, page }: { label: string; page: number }) {
  const params = useSearchParams();
  const newParams = new URLSearchParams(params.toString());
  newParams.set('page', String(page));

  return (
    <a
      href={`/mcp/prompts?${newParams.toString()}`}
      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm
                 text-[var(--fg)]/70 hover:bg-[var(--bg)] transition-colors"
    >
      {label}
    </a>
  );
}
```

### 3.3 Prompt Detail (`/mcp/prompts/[slug]`)

**File:** `src/app/(shell)/mcp/prompts/[slug]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMCPPromptDetail } from '@/hooks/useMCPContent';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { MCPModelBadges } from '@/components/mcp/MCPModelBadges';
import { MCPPromptVariableForm } from '@/components/mcp/MCPPromptVariableForm';
import { MCPPromptPreview } from '@/components/mcp/MCPPromptPreview';
import { renderPromptTemplate, USE_CASE_LABELS } from '@/lib/mcp-utils';
import { motion } from 'framer-motion';

export default function MCPPromptDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: prompt, isLoading } = useMCPPromptDetail(slug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 w-2/3 bg-[var(--bg)] animate-pulse rounded mb-4" />
        <div className="h-64 bg-[var(--bg)] animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-[var(--fg)]/50">Prompt not found</h1>
      </div>
    );
  }

  const handleCopy = () => {
    const rendered = renderPromptTemplate(prompt.prompt_template, values);
    navigator.clipboard.writeText(rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <MCPDifficultyBadge difficulty={prompt.difficulty} />
          {prompt.is_featured && (
            <span className="rounded-full bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium text-[#C9A227]">
              ★ Featured
            </span>
          )}
          {prompt.is_premium && (
            <span className="rounded-full bg-[#1E3A8A]/10 px-2.5 py-0.5 text-xs font-medium text-[#1E3A8A] dark:text-[#6CA0FF]">
              🔒 Premium · {prompt.credit_cost} credits
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">
          {prompt.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-[var(--fg)]/50 flex-wrap">
          <span>{prompt.category_icon} {prompt.category_name}</span>
          <span>·</span>
          <span>{USE_CASE_LABELS[prompt.use_case]}</span>
          <span>·</span>
          <span>⭐ {prompt.quality_score.toFixed(2)}</span>
          <span>·</span>
          <MCPModelBadges models={prompt.target_models} />
        </div>

        <p className="mt-4 text-[var(--fg)]/70">{prompt.description}</p>
      </motion.div>

      {/* Two-column: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Variable Form */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          {prompt.variables && prompt.variables.length > 0 ? (
            <MCPPromptVariableForm
              variables={prompt.variables}
              values={values}
              onChange={setValues}
            />
          ) : (
            <p className="text-sm text-[var(--fg)]/50">
              This prompt has no customizable variables. Copy it directly!
            </p>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="mt-6 w-full rounded-lg bg-[#C9A227] py-3 text-sm font-semibold
                       text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
          >
            {copied ? '✅ Copied to Clipboard!' : '📋 Copy Prompt'}
          </button>
        </div>

        {/* Right: Live Preview */}
        <MCPPromptPreview template={prompt.prompt_template} values={values} />
      </div>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[var(--bg)] border border-[var(--border)]
                       px-3 py-1 text-xs text-[var(--fg)]/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 Knowledge Articles (`/mcp/docs` + `/mcp/docs/[slug]`)

**File:** `src/app/(shell)/mcp/docs/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useMCPDocuments, useMCPCategories } from '@/hooks/useMCPContent';
import { MCPDocumentCard } from '@/components/mcp/MCPDocumentCard';

export default function MCPDocsPage() {
  const params = useSearchParams();
  const filters = {
    category: params.get('category') || undefined,
    search: params.get('search') || undefined,
    ordering: params.get('ordering') || '-quality_score',
    page: Number(params.get('page')) || 1,
  };

  const { data, isLoading } = useMCPDocuments(filters);
  const { data: categories } = useMCPCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-1">MCP Knowledge Base</h1>
      <p className="text-sm text-[var(--fg)]/60 mb-6">
        {data?.count ?? '...'} expert articles on MCP, agentic AI, and context engineering
      </p>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        <CategoryPill label="All" slug="" active={!filters.category} />
        {categories?.results.map((c) => (
          <CategoryPill
            key={c.id}
            label={`${c.icon} ${c.name}`}
            slug={c.slug}
            active={filters.category === c.slug}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((doc) => (
            <MCPDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  slug,
  active,
}: {
  label: string;
  slug: string;
  active: boolean;
}) {
  const href = slug ? `/mcp/docs?category=${slug}` : '/mcp/docs';
  return (
    <a
      href={href}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors
        ${active
          ? 'bg-[#1E3A8A] text-white'
          : 'bg-[var(--card)] border border-[var(--border)] text-[var(--fg)]/60 hover:border-[#C9A227]/40'
        }`}
    >
      {label}
    </a>
  );
}
```

**File:** `src/app/(shell)/mcp/docs/[slug]/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useMCPDocumentDetail } from '@/hooks/useMCPContent';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function MCPDocDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: doc, isLoading } = useMCPDocumentDetail(slug);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-2/3 bg-[var(--bg)] animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-4 bg-[var(--bg)] animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-[var(--fg)]/50">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--fg)]/50 mb-2">
          <span>{doc.category_icon} {doc.category_name}</span>
          <span>·</span>
          <span>⭐ {doc.quality_score.toFixed(2)}</span>
          {doc.mcp_version && (
            <>
              <span>·</span>
              <span>MCP {doc.mcp_version}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">{doc.title}</h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {doc.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--fg)]/50">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Markdown Content */}
      <article className="prose prose-sm sm:prose dark:prose-invert max-w-none
                          prose-headings:text-[var(--fg)] prose-a:text-[#1E3A8A]
                          dark:prose-a:text-[#6CA0FF] prose-code:text-[#C9A227]
                          prose-pre:bg-[#0E0F12] prose-pre:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {doc.content_md}
        </ReactMarkdown>
      </article>
    </div>
  );
}
```

**Note:** Requires `npm install react-markdown rehype-highlight remark-gfm`

### 3.5 Academy Pages

**File:** `src/app/(shell)/academy/page.tsx`

```typescript
'use client';

import { useAcademyCourses } from '@/hooks/useMCPContent';
import { CourseCard } from '@/components/academy/CourseCard';
import { motion } from 'framer-motion';

export default function AcademyPage() {
  const { data, isLoading } = useAcademyCourses();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-[#C9A227]/10 via-[#EBD5A7]/20 to-transparent border border-[#C9A227]/20 p-8 md:p-12 text-center mb-8"
      >
        <span className="text-4xl mb-4 block">🎓</span>
        <h1 className="text-3xl font-bold text-[var(--fg)] mb-2">
          Prompt Temple Academy
        </h1>
        <p className="text-[var(--fg)]/60 max-w-lg mx-auto">
          Master MCP and the agentic AI revolution. Free courses, hands-on exercises, and certificates.
        </p>
      </motion.div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.results.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**File:** `src/components/academy/CourseCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LEVEL_CONFIG } from '@/lib/mcp-utils';
import type { AcademyCourse } from '@/types/mcp';

interface Props {
  course: AcademyCourse;
}

export function CourseCard({ course }: Props) {
  const level = LEVEL_CONFIG[course.level];

  return (
    <Link href={`/academy/${course.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${level.color} ${level.bg}`}>
            {level.label}
          </span>
          {course.is_free && (
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Free
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">{course.title}</h3>
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-4">{course.description}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--fg)]/50">
          <span>📖 {course.total_lessons} lessons</span>
          <span>⏱️ {course.estimated_minutes} min</span>
          <span>👥 {course.total_enrollments} enrolled</span>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[#C9A227]">
            Start Learning →
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
```

**File:** `src/app/(shell)/academy/[slug]/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useAcademyCourseDetail, useAcademyProgress, useEnrollCourse } from '@/hooks/useMCPContent';
import { LEVEL_CONFIG, COURSE_SECTION_TITLES } from '@/lib/mcp-utils';
import { LessonList } from '@/components/academy/LessonList';
import { EnrollButton } from '@/components/academy/EnrollButton';
import type { AcademyLesson, AcademyEnrollment } from '@/types/mcp';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useAcademyCourseDetail(slug);
  const { data: progressList } = useAcademyProgress();
  const enrollMutation = useEnrollCourse();

  const enrollment: AcademyEnrollment | undefined = progressList?.find(
    (e) => e.course_slug === slug,
  );

  if (isLoading || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-10 w-1/2 bg-[var(--bg)] animate-pulse rounded mb-4" />
        <div className="h-48 bg-[var(--bg)] animate-pulse rounded-xl" />
      </div>
    );
  }

  // Group lessons by section
  const sections: Record<number, AcademyLesson[]> = {};
  course.lessons?.forEach((lesson) => {
    if (!sections[lesson.section_number]) sections[lesson.section_number] = [];
    sections[lesson.section_number].push(lesson);
  });

  const level = LEVEL_CONFIG[course.level];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${level.color} ${level.bg}`}>
            {level.label}
          </span>
          {course.is_free && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Free
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">{course.title}</h1>
        <p className="mt-2 text-[var(--fg)]/60">{course.description}</p>

        <div className="flex items-center gap-4 mt-4 text-sm text-[var(--fg)]/50">
          <span>📖 {course.total_lessons} lessons</span>
          <span>⏱️ {course.estimated_minutes} min</span>
          <span>👥 {course.total_enrollments} enrolled</span>
        </div>

        {/* Progress bar */}
        {enrollment && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--fg)]/50 mb-1">
              <span>Progress</span>
              <span>{Math.round(enrollment.progress_percentage)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg)]">
              <div
                className="h-full rounded-full bg-[#C9A227] transition-all"
                style={{ width: `${enrollment.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enroll CTA */}
      {!enrollment && (
        <EnrollButton
          courseId={course.id}
          isFree={course.is_free}
          onEnroll={() => enrollMutation.mutate(course.id)}
          isLoading={enrollMutation.isPending}
        />
      )}

      {/* Lessons grouped by section */}
      <div className="space-y-6 mt-6">
        {Object.entries(sections)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([sectionNum, lessons]) => (
            <div key={sectionNum}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-3">
                Section {sectionNum}: {COURSE_SECTION_TITLES[Number(sectionNum)] || `Section ${sectionNum}`}
              </h2>
              <LessonList
                lessons={lessons}
                courseSlug={slug}
                completedLessons={enrollment?.completed_lessons || []}
                isEnrolled={!!enrollment}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
```

**File:** `src/components/academy/EnrollButton.tsx`

```typescript
'use client';

interface Props {
  courseId: string;
  isFree: boolean;
  onEnroll: () => void;
  isLoading: boolean;
}

export function EnrollButton({ courseId, isFree, onEnroll, isLoading }: Props) {
  return (
    <button
      onClick={onEnroll}
      disabled={isLoading}
      className="w-full sm:w-auto rounded-lg bg-[#C9A227] px-8 py-3 text-sm
                 font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90
                 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Enrolling...' : isFree ? 'Enroll for Free' : 'Enroll Now'}
    </button>
  );
}
```

**File:** `src/components/academy/LessonList.tsx`

```typescript
'use client';

import Link from 'next/link';
import type { AcademyLesson } from '@/types/mcp';

interface Props {
  lessons: AcademyLesson[];
  courseSlug: string;
  completedLessons: string[];
  isEnrolled: boolean;
}

export function LessonList({ lessons, courseSlug, completedLessons, isEnrolled }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
      {lessons.map((lesson) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isAccessible = isEnrolled || lesson.is_free_preview;

        const contentTypeIcons: Record<string, string> = {
          article: '📖',
          video: '🎬',
          quiz: '❓',
          exercise: '🛠️',
          prompt_lab: '⚡',
        };

        return (
          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
            {/* Status icon */}
            <span className="text-lg w-6 text-center">
              {isCompleted ? '✅' : isAccessible ? '○' : '🔒'}
            </span>

            {/* Lesson info */}
            <div className="flex-1 min-w-0">
              {isAccessible ? (
                <Link
                  href={`/academy/${courseSlug}/${lesson.slug}`}
                  className="text-sm font-medium text-[var(--fg)] hover:text-[#1E3A8A] dark:hover:text-[#6CA0FF] transition-colors"
                >
                  {lesson.section_number}.{lesson.lesson_number} {lesson.title}
                </Link>
              ) : (
                <span className="text-sm text-[var(--fg)]/40">
                  {lesson.section_number}.{lesson.lesson_number} {lesson.title}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-[var(--fg)]/40 shrink-0">
              <span>{contentTypeIcons[lesson.content_type] || '📖'}</span>
              <span>{lesson.estimated_minutes} min</span>
              {lesson.is_free_preview && !isEnrolled && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  FREE
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 3.6 Lesson View (`/academy/[slug]/[lessonSlug]`)

**File:** `src/app/(shell)/academy/[slug]/[lessonSlug]/page.tsx`

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAcademyCourseDetail, useCompleteLesson, useAcademyProgress } from '@/hooks/useMCPContent';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const router = useRouter();
  const { data: course } = useAcademyCourseDetail(slug);
  const { data: progressList } = useAcademyProgress();
  const completeMutation = useCompleteLesson();

  const lesson = course?.lessons?.find((l) => l.slug === lessonSlug);
  const enrollment = progressList?.find((e) => e.course_slug === slug);
  const isCompleted = enrollment?.completed_lessons.includes(lesson?.id || '');

  // Find next/prev lessons
  const sortedLessons = course?.lessons
    ?.slice()
    .sort((a, b) => a.section_number - b.section_number || a.lesson_number - b.lesson_number);
  const currentIndex = sortedLessons?.findIndex((l) => l.slug === lessonSlug) ?? -1;
  const prevLesson = currentIndex > 0 ? sortedLessons?.[currentIndex - 1] : null;
  const nextLesson = sortedLessons && currentIndex < sortedLessons.length - 1
    ? sortedLessons[currentIndex + 1]
    : null;

  if (!lesson || !lesson.content_md) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--fg)]/50">Loading lesson...</p>
      </div>
    );
  }

  const handleComplete = () => {
    if (!lesson || !enrollment) return;
    completeMutation.mutate(
      { lesson_id: lesson.id },
      {
        onSuccess: () => {
          if (nextLesson) {
            router.push(`/academy/${slug}/${nextLesson.slug}`);
          }
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-[var(--fg)]/40 mb-4">
        <a href="/academy" className="hover:text-[var(--fg)]">Academy</a>
        <span className="mx-2">›</span>
        <a href={`/academy/${slug}`} className="hover:text-[var(--fg)]">{course?.title}</a>
        <span className="mx-2">›</span>
        <span className="text-[var(--fg)]/60">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-1">
        {lesson.section_number}.{lesson.lesson_number} {lesson.title}
      </h1>
      <p className="text-xs text-[var(--fg)]/40 mb-6">
        ⏱️ {lesson.estimated_minutes} min · {lesson.content_type}
      </p>

      {/* Lesson Content */}
      <article className="prose prose-sm sm:prose dark:prose-invert max-w-none
                          prose-headings:text-[var(--fg)] prose-a:text-[#1E3A8A]
                          dark:prose-a:text-[#6CA0FF] prose-code:text-[#C9A227]
                          prose-pre:bg-[#0E0F12] mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {lesson.content_md}
        </ReactMarkdown>
      </article>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
        {prevLesson ? (
          <a
            href={`/academy/${slug}/${prevLesson.slug}`}
            className="text-sm text-[var(--fg)]/60 hover:text-[var(--fg)]"
          >
            ← {prevLesson.title}
          </a>
        ) : <div />}

        <div className="flex gap-3">
          {enrollment && !isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="rounded-lg bg-[#C9A227] px-5 py-2 text-sm font-semibold
                         text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors
                         disabled:opacity-50"
            >
              {completeMutation.isPending ? 'Saving...' : 'Mark as Complete ✅'}
            </button>
          )}
          {isCompleted && (
            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-5 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ✅ Completed
            </span>
          )}
        </div>

        {nextLesson ? (
          <a
            href={`/academy/${slug}/${nextLesson.slug}`}
            className="text-sm text-[#1E3A8A] dark:text-[#6CA0FF] font-medium hover:underline"
          >
            {nextLesson.title} →
          </a>
        ) : <div />}
      </div>
    </div>
  );
}
```

---

## 📦 SPRINT 4: NAVIGATION INTEGRATION

### 4.1 Add MCP and Academy Links to TempleNavbar

**File to modify:** `src/components/TempleNavbar.tsx` (or `EnhancedAppShell.tsx`)

Add these navigation items:

```typescript
// In the main navigation items array, add:
{ label: 'MCP Library', href: '/mcp', icon: '⚡' },
{ label: 'Academy', href: '/academy', icon: '🎓' },
```

### 4.2 Add to Sidebar Navigation (if using the Discord-style sidebar)

```typescript
// In the sidebar server/channel list:
{
  name: 'MCP & Agents',
  icon: '⚡',
  channels: [
    { name: 'Browse Prompts', href: '/mcp/prompts' },
    { name: 'Knowledge Base', href: '/mcp/docs' },
    { name: 'Search', href: '/mcp/search' },
  ],
},
{
  name: 'Academy',
  icon: '🎓',
  channels: [
    { name: 'Courses', href: '/academy' },
  ],
},
```

---

## 📦 SPRINT 5: NPM DEPENDENCIES

```bash
npm install react-markdown rehype-highlight remark-gfm
```

**Already installed (verify):** `@tanstack/react-query`, `framer-motion`, `tailwindcss`

**No new heavy dependencies.** These are all lightweight markdown rendering packages.

---

## ✅ ACCEPTANCE CRITERIA

| Page | URL | Criteria | Status |
|------|-----|----------|--------|
| MCP Hub | `/mcp` | Hero, featured carousel, categories grid, latest docs, Academy CTA | ⬜ |
| Prompt Browser | `/mcp/prompts` | Filterable grid, sidebar filters, pagination, search | ⬜ |
| Prompt Detail | `/mcp/prompts/[slug]` | Variable form, live preview, copy button, metadata | ⬜ |
| Docs List | `/mcp/docs` | Category pills, article cards, pagination | ⬜ |
| Doc Detail | `/mcp/docs/[slug]` | Full markdown render with syntax highlighting | ⬜ |
| Academy Catalog | `/academy` | Course cards with level/duration/enrollment | ⬜ |
| Course Detail | `/academy/[slug]` | Lesson list grouped by section, progress bar, enroll | ⬜ |
| Lesson View | `/academy/[slug]/[lesson]` | MD render, complete button, prev/next nav | ⬜ |
| Search | `/mcp/search` | Combined results (docs + prompts + courses) | ⬜ |
| Navigation | Navbar + Sidebar | MCP Library and Academy links added | ⬜ |
| Mobile | All pages | Responsive at 320px, filter sidebar hidden on mobile | ⬜ |
| Dark Mode | All pages | Full dark mode support using CSS vars | ⬜ |
| Loading States | All pages | Skeleton shimmer animations | ⬜ |
| Empty States | Filtered views | "No results" message when filters yield nothing | ⬜ |

---

## 📊 DEFINITION OF DONE

- [ ] All 9 pages render without errors
- [ ] API calls use correct base URL and endpoints
- [ ] Pharaonic theme applied consistently (gold, lapis, sand)
- [ ] Variable form produces correct prompt output
- [ ] Copy-to-clipboard works on prompt detail
- [ ] Academy enrollment creates enrollment record
- [ ] Lesson completion updates progress
- [ ] Markdown renders with code syntax highlighting
- [ ] All pages work in both light and dark mode
- [ ] Mobile responsive (test at 375px width)
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] Navigation links added to existing navbar/sidebar

---

## 📅 ESTIMATED TIMELINE

| Sprint | Days | Deliverable |
|--------|------|-------------|
| Sprint 1: Types + Hooks + Utils | 0.5 day | Foundation layer |
| Sprint 2: Components (10 components) | 1.5 days | Reusable UI pieces |
| Sprint 3: Pages (9 pages) | 2-3 days | All routes working |
| Sprint 4: Navigation integration | 0.5 day | Links in navbar/sidebar |
| Sprint 5: Dependencies + polish | 0.5 day | npm install, test all flows |

**Total: ~5-6 working days**

---

*Sprint file generated for Prompt Temple. Hand directly to Claude Code for implementation.*
