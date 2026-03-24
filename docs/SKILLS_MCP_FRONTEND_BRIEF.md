# Skills & MCP Knowledge — Frontend Developer Brief

> **Version:** 1.0
> **Date:** 2026-03-25
> **Scope:** `/skills`, `/mcp`, `/mcp/academy` routes and all supporting layers

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DATA FLOW                            │
│                                                         │
│  API (Django)          Services           Hooks         │
│  /api/v2/skills/  →  SkillsService    →  useSkills()   │
│  /api/v2/mcp/     →  MCPKnowledge     →  useMCPContent │
│                      Service              hooks         │
│                                                         │
│  Hooks                Components          Pages         │
│  useSkills()     →  SkillCard          →  /skills      │
│  useMCPPrompts() →  MCPPromptCard      →  /mcp/prompts │
│  useAcademy*()   →  CourseCard         →  /mcp/academy │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Location | Role |
|-------|----------|------|
| **Types** | `src/types/mcp.ts` | All interfaces: `Skill`, `SkillType`, `MCPTool`, `MCPPackage`, filters, stats |
| **Utilities** | `src/lib/mcp-utils.ts` | Display configs: `SKILL_TYPE_CONFIG`, `MCP_TRANSPORT_LABELS`, `DIFFICULTY_CONFIG` |
| **API Services** | `src/lib/api/skills.ts`, `mcp-knowledge.ts` | Axios clients extending `BaseApiClient`, registered in `api/index.ts` |
| **Hooks** | `src/lib/hooks/useSkills.ts`, `useMCPAcademy.ts` + `src/hooks/useMCPContent.ts` | React Query wrappers with query key factories |
| **Components** | `src/components/skills/`, `src/components/mcp/` | Presentational cards, badges, filters, tools list |
| **Pages** | `src/app/(shell)/skills/`, `src/app/(shell)/mcp/` | Route handlers within the sidebar shell layout |

---

## 2. File Map

### Types & Utils
```
src/types/mcp.ts                 ← Skill, SkillType, MCPTransport, MCPTool, MCPPackage,
                                    SkillBookmark, SkillFilters, SkillsStats
                                    (+ existing MCP document/prompt/academy types)

src/lib/mcp-utils.ts             ← SKILL_TYPE_CONFIG (10 types → label/color/bg)
                                    MCP_TRANSPORT_LABELS (stdio/sse/streamable-http)
                                    DIFFICULTY_CONFIG (beginner→expert)
```

### API Services
```
src/lib/api/skills.ts            ← SkillsService (extends BaseApiClient)
  getSkills(filters?)               → GET /api/v2/skills/
  getSkillCategories()              → GET /api/v2/skills/categories/
  getFeaturedSkills(limit?)         → GET /api/v2/skills/featured/
  getTrendingSkills(limit?, days?)  → GET /api/v2/skills/trending/
  getMCPServers(search?)            → GET /api/v2/skills/mcp_servers/
  getSkillsStats()                  → GET /api/v2/skills/stats/
  getMyBookmarks()                  → GET /api/v2/skills/my_bookmarks/
  bookmarkSkill(id)                 → POST /api/v2/skills/{id}/bookmark/
  unbookmarkSkill(id)               → DELETE /api/v2/skills/{id}/bookmark/

src/lib/api/mcp-knowledge.ts     ← MCPKnowledgeService (extends BaseApiClient)
  getCategories()                   → GET /api/v2/mcp/categories/
  getDocuments(filters?)            → GET /api/v2/mcp/documents/
  getDocumentDetail(slug)           → GET /api/v2/mcp/documents/{slug}/
  getPrompts(filters?)              → GET /api/v2/mcp/prompts/
  getFeaturedPrompts()              → GET /api/v2/mcp/prompts/featured/
  getPromptDetail(slug)             → GET /api/v2/mcp/prompts/{slug}/
  search(query, type?)              → POST /api/v2/mcp/search/
  getCourses(difficulty?)           → GET /api/v2/mcp/academy/courses/
  getCourseDetail(slug)             → GET /api/v2/mcp/academy/courses/{slug}/
  enrollCourse(courseId)            → POST /api/v2/mcp/academy/enroll/
  getProgress(courseId?)            → GET /api/v2/mcp/academy/progress/
  completeLesson(data)              → POST /api/v2/mcp/academy/complete-lesson/

src/lib/api/index.ts             ← Both registered as api.skills, api.mcpKnowledge
```

### React Query Hooks
```
src/lib/hooks/useSkills.ts       ← Query key factory: skillKeys.*
  useSkills(filters?)               skills list, 2min stale
  useSkillCategories()              categories, 5min stale
  useFeaturedSkills(limit?)         featured, 5min stale
  useTrendingSkills(limit?, days?)  trending, 2min stale
  useMCPServers(search?)            mcp servers, 2min stale
  useSkillsStats()                  stats, 5min stale
  useMyBookmarks()                  bookmarks, 1min stale
  useBookmarkSkill()                mutation → invalidates bookmarks
  useUnbookmarkSkill()              mutation → invalidates bookmarks

src/hooks/useMCPContent.ts       ← Existing hooks (unchanged, uses apiClient)
  useMCPCategories()
  useMCPPrompts(filters?)
  useMCPFeaturedPrompts()
  useMCPPromptDetail(slug)
  useMCPDocuments(filters?)
  useMCPDocumentDetail(slug)
  useMCPSearch(query)
  useAcademyCourses()
  useAcademyCourseDetail(slug)
  useAcademyProgress()
  useEnrollCourse()
  useCompleteLesson()

src/lib/hooks/useMCPAcademy.ts   ← V2 academy hooks (uses mcpKnowledgeService)
  useAcademyCoursesV2(difficulty?)
  useAcademyCourseDetailV2(slug)
  useAcademyProgressV2()
  useEnrollCourseV2()
  useCompleteLessonV2()
```

### Components
```
src/components/skills/
  SkillCard.tsx              Card for any skill type (title, desc, type badge, difficulty, tags, stats)
  MCPServerCard.tsx          Specialized card for mcp_server skills (stars, transport, packages, tools)
  SkillTypeBadge.tsx         Colored badge from SKILL_TYPE_CONFIG
  SkillFilters.tsx           Sidebar with category/type/difficulty filters (URL param driven)
  SkillBookmarkButton.tsx    Heart toggle using bookmark mutations
  MCPToolsList.tsx           Expandable list of MCP tools with input schemas
  SkillsStatsBar.tsx         Horizontal stats strip (total skills, servers, techniques, frameworks)

src/components/mcp/          (pre-existing, reused as-is)
  MCPPromptCard.tsx          Prompt card with badges, tags, quality score
  MCPDocumentCard.tsx        Document card with excerpt
  MCPCategoryCard.tsx        Category card with prompt/doc counts
  MCPFilterSidebar.tsx       Prompts filter sidebar (category, difficulty, use case)
  MCPDifficultyBadge.tsx     Difficulty level badge
  MCPModelBadges.tsx         AI model compatibility badges
  MCPPromptPreview.tsx       Live template preview with variable substitution
  MCPPromptVariableForm.tsx  Form to fill template variables
  MCPHeroSection.tsx         Hero banner
```

### Pages & Routes
```
src/app/(shell)/skills/
  page.tsx                   Suspense wrapper → SkillsView
  SkillsView.tsx             Main page: hero, stats bar, tabs (All|MCP Servers|Bookmarks),
                             filters sidebar, paginated card grid
  [slug]/
    page.tsx                 → SkillDetailView
    SkillDetailView.tsx      Detail: header, MCP server info (transport, packages, tools),
                             markdown content, sidebar (stats, bookmark, source, tags)

src/app/(shell)/mcp/
  page.tsx                   Landing: hero + search, quick links, category grid, featured prompts
  prompts/
    page.tsx                 Suspense wrapper → MCPPromptsView
    MCPPromptsView.tsx       Prompts listing with MCPFilterSidebar + MCPPromptCard grid
    [slug]/
      page.tsx               Prompt detail: variable form + live preview + example output
  docs/
    page.tsx                 Suspense wrapper → MCPDocsView
    MCPDocsView.tsx          Documents listing with category sidebar + MCPDocumentCard grid
    [slug]/
      page.tsx               Document detail: markdown content
  academy/
    page.tsx                 Course listing with difficulty tabs + CourseCard grid + progress bars
    [slug]/
      page.tsx               Course detail: header, enroll button, lesson list with completion state
```

---

## 3. Key Patterns

### Filter State via URL Search Params
All listing pages drive filters through URL search params (not React state). This enables:
- Shareable/bookmarkable filter URLs
- Browser back/forward navigation preserves filters
- Pattern: `useSearchParams()` → build filters object → pass to hook

```typescript
const searchParams = useSearchParams();
const filters = {
  category: searchParams.get('category') || undefined,
  difficulty: searchParams.get('difficulty') || undefined,
  page: Number(searchParams.get('page')) || 1,
};
const { data } = useSkills(filters);
```

**Important:** `useSearchParams()` requires a `<Suspense>` boundary in Next.js 15. All pages using it have a server-component `page.tsx` wrapping a client `*View.tsx`.

### Bookmark Optimistic Flow
```
User clicks bookmark →
  useBookmarkSkill().mutate(id) →
    POST /skills/{id}/bookmark/ →
      onSuccess: invalidateQueries(['skills', 'bookmarks'])
```
The bookmarks tab auto-refreshes when the mutation settles.

### Conditional Card Rendering
The skills grid renders `MCPServerCard` for `skill_type === 'mcp_server'` and `SkillCard` for everything else:
```tsx
{skills.map((skill) =>
  skill.skill_type === 'mcp_server'
    ? <MCPServerCard key={skill.id} skill={skill} />
    : <SkillCard key={skill.id} skill={skill} />
)}
```

### Markdown Rendering
Skill detail pages and MCP document detail pages render markdown content using `react-markdown` (v10.1.0, already installed). Styled with Tailwind prose classes matching the pharaonic theme:
```tsx
<div className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-[var(--fg)] prose-a:text-[#C9A227]
                prose-code:text-[#C9A227] prose-pre:bg-[var(--bg)]">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>
```

---

## 4. Iteration Guide

### Adding a New Skill Type
1. Add the value to `SkillType` union in `src/types/mcp.ts`
2. Add a row to `SKILL_TYPE_CONFIG` in `src/lib/mcp-utils.ts` (label, color, bg)
3. Done — `SkillTypeBadge` and `SkillFilters` auto-pick it up

### Adding a New API Endpoint
1. Add the method to `SkillsService` or `MCPKnowledgeService`
2. Add a hook in `useSkills.ts` or `useMCPAcademy.ts` with a new query key
3. Call the hook from the relevant component/page

### Adding a New Filter
1. Add the param to the `SkillFilters` interface in `src/types/mcp.ts`
2. Add the URLSearchParams mapping in `SkillsService.getSkills()`
3. Add the filter UI section in `src/components/skills/SkillFilters.tsx`
4. Add the search param reading in `SkillsView.tsx` filters builder

### Adding a Skill Detail Endpoint
Currently the detail view uses `useSkills({ search: slug })` as a workaround since there's no dedicated `GET /skills/{slug}/` endpoint. When the backend adds one:
1. Add `getSkillDetail(slug)` to `SkillsService`
2. Add `useSkillDetail(slug)` hook with `skillKeys.detail(slug)` query key
3. Update `SkillDetailView.tsx` to use it

### Adding Search to MCP Landing
The MCP landing page has a search form that currently redirects to `/mcp/prompts?search=`. To implement unified search:
1. Use `useMCPSearch(query)` from `useMCPContent.ts` (already exists)
2. Render mixed results (documents, prompts, courses) in a tabbed results view

### Adding Ratings/Reviews to Skills
1. Add rating fields to the `Skill` interface
2. Add `rateSkill(id, rating)` to `SkillsService`
3. Add `useRateSkill()` mutation hook
4. Create a `SkillRating` component and embed in `SkillDetailView`

---

## 5. Sidebar Navigation

Two new items added to `src/components/sidebar/AppSidebar.tsx` under the `resources` category:

| ID | Label | Route | Icon | Badge |
|----|-------|-------|------|-------|
| `skills` | Skills & MCP | `/skills` | Sparkles | New |
| `mcp-knowledge` | MCP Knowledge | `/mcp` | Library | New |

To modify: edit the `navigationItems` array in `AppSidebar.tsx` (lines 273-290).

---

## 6. Design Tokens

All components follow the pharaonic theme:
- **Card:** `bg-[var(--card)]`, `border-[var(--border)]`
- **Text:** `text-[var(--fg)]`, opacity variants `/60`, `/50`, `/40`
- **Gold accent:** `#C9A227` (hover borders, featured badges, active states, CTAs)
- **Hover lift:** `motion.div whileHover={{ y: -3 }}` on cards
- **Verified:** emerald green — `bg-emerald-500/10 text-emerald-600`
- **Premium:** navy — `bg-[#1E3A8A]/10 text-[#1E3A8A]`

---

## 7. Error Handling & Safety

- All data access uses optional chaining (`skill.category?.name`)
- Array accesses guarded with `Array.isArray()` checks
- Empty states rendered for zero-result queries
- Loading skeletons use `animate-pulse` matching card dimensions
- `useSearchParams()` always wrapped in `<Suspense>` boundary
- Mutations invalidate related query keys on success
- Pre-existing 275 TS errors are unrelated to this feature (legacy API types, billing hooks)
