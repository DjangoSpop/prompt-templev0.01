# Frontend Onboarding Slider: GraphQL + REST Intelligence Layer

> **Target**: 30-second "wow" onboarding experience with GSAP + Framer Motion animated card slider
> **Data Sources**: GraphQL (`/api/graphql/`) + REST (`/api/v2/mcp/`)
> **Goal**: Market hook retention — user sees personalized, animated intelligence from first load

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING SLIDER                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Featured │→ │ Category │→ │ Academy  │→ │  Smart   │    │
│  │ Prompts  │  │ Carousel │  │ Preview  │  │ CTA Card │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│       ↑              ↑             ↑             ↑           │
│  REST: featured  REST: cats   REST: courses  GraphQL:        │
│  prompts         + counts    + lessons      user history     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Data Layer: Queries & Hooks

### 1A. REST Endpoints (Public — No Auth Required)

These power the onboarding slider for unauthenticated and new users:

```typescript
// lib/api/onboarding.ts
const API = process.env.NEXT_PUBLIC_API_URL;

// ── Featured Prompts (sorted by quality_score, is_featured=true) ──
export async function fetchFeaturedPrompts(limit = 8) {
  const res = await fetch(`${API}/api/v2/mcp/prompts/featured/`);
  return res.json(); // MCPPromptTemplate[]
}

// ── Categories with counts ──
export async function fetchCategories() {
  const res = await fetch(`${API}/api/v2/mcp/categories/`);
  return res.json(); // MCPCategory[] with document_count, prompt_count
}

// ── Prompts by use_case (for intelligent card routing) ──
export async function fetchPromptsByUseCase(useCase: string, limit = 6) {
  const res = await fetch(
    `${API}/api/v2/mcp/prompts/?use_case=${useCase}&ordering=-quality_score&page_size=${limit}`
  );
  return res.json();
}

// ── Academy courses (social proof: enrollment counts) ──
export async function fetchCourses() {
  const res = await fetch(`${API}/api/v2/mcp/academy/courses/`);
  return res.json(); // AcademyCourse[]
}

// ── Full-text search (for search-triggered slider) ──
export async function searchMCP(query: string) {
  const res = await fetch(
    `${API}/api/v2/mcp/search/?q=${encodeURIComponent(query)}`
  );
  return res.json(); // { documents, prompts, courses }
}
```

### 1B. REST Response Shapes

**Featured Prompt Card** — fields available per item:

```typescript
interface PromptCard {
  id: string;
  title: string;
  slug: string;
  category_name: string;      // "Agent Frameworks", "Tool Integration"
  category_icon: string;      // "🏗️", "🔌"
  description: string;        // 1-2 sentence hook
  use_case: string;           // "workflow_automation", "multi_agent", "customer_support"
  difficulty: string;         // "beginner" | "intermediate" | "advanced" | "expert"
  tags: string[];             // ["n8n", "mcp", "automation"]
  quality_score: number;      // 0-1 (use for sort + visual indicator)
  is_featured: boolean;
  is_premium: boolean;
  credit_cost: number;
  usage_count: number;        // social proof
  avg_rating: number | null;
}
```

**Category Card** — fields for category carousel:

```typescript
interface CategoryCard {
  id: string;
  name: string;               // "Agent Frameworks"
  slug: string;
  category_type: string;      // "agent_frameworks"
  description: string;
  icon: string;               // "🏗️"
  document_count: number;     // annotated count
  prompt_count: number;       // annotated count
}
```

### 1C. GraphQL Queries (Authenticated Users)

For returning users — personalized slider cards based on their prompt history:

```typescript
// lib/graphql/onboarding.ts
import { gql } from '@apollo/client';

// ── User's recent prompt activity (personalization signal) ──
export const GET_USER_ACTIVITY = gql`
  query GetUserActivity($limit: Int!) {
    allPromptHistories(limit: $limit) {
      id
      originalPrompt
      optimizedPrompt
      modelUsed
      intentCategory
      tags
      creditsSpent
      createdAt
    }
  }
`;

// ── User's latest iterations (show "continue where you left off") ──
export const GET_RECENT_ITERATIONS = gql`
  query GetRecentIterations($limit: Int!) {
    allPromptHistories(limit: $limit) {
      id
      originalPrompt
      intentCategory
      tags
      iterations {
        id
        iterationNumber
        promptText
        interactionType
        changesSummary
        isActive
        isBookmarked
        createdAt
      }
    }
  }
`;

// ── Bookmarked iterations (user's curated best) ──
export const GET_BOOKMARKED = gql`
  query GetBookmarked($limit: Int!) {
    bookmarkedIterations(limit: $limit) {
      id
      iterationNumber
      promptText
      aiResponse
      userRating
      tags
      createdAt
    }
  }
`;

// ── Saved prompts (user's library) ──
export const GET_SAVED_PROMPTS = gql`
  query GetSavedPrompts($limit: Int!) {
    allSavedPrompts(limit: $limit) {
      id
      title
      content
      category
      tags
      useCount
      isFavorite
      updatedAt
    }
  }
`;

// ── Conversation threads (show active threads) ──
export const GET_ACTIVE_THREADS = gql`
  query GetActiveThreads {
    allConversationThreads(status: "active", limit: 5) {
      id
      title
      totalIterations
      totalTokens
      lastActivityAt
      messages {
        messageOrder
        iteration {
          promptText
          interactionType
        }
      }
    }
  }
`;
```

---

## 2. Intelligent Card Selection Logic

The slider should show different cards based on user state:

```typescript
// hooks/useOnboardingSlider.ts
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import useSWR from 'swr';

type SliderCard =
  | { type: 'featured_prompt'; data: PromptCard }
  | { type: 'category';        data: CategoryCard }
  | { type: 'course';          data: CourseCard }
  | { type: 'continue';        data: ThreadCard }    // returning user
  | { type: 'bookmarked';      data: IterationCard } // returning user
  | { type: 'cta';             data: { variant: string } };

export function useOnboardingSlider(isAuthenticated: boolean) {
  // ── Public data (always fetch — fast, cached) ──
  const { data: featured }   = useSWR('/api/v2/mcp/prompts/featured/', fetcher);
  const { data: categories }  = useSWR('/api/v2/mcp/categories/', fetcher);
  const { data: courses }     = useSWR('/api/v2/mcp/academy/courses/', fetcher);

  // ── Authenticated data (GraphQL — only if logged in) ──
  const { data: threads } = useQuery(GET_ACTIVE_THREADS, {
    skip: !isAuthenticated,
  });
  const { data: bookmarks } = useQuery(GET_BOOKMARKED, {
    skip: !isAuthenticated,
    variables: { limit: 3 },
  });

  // ── Build card deck based on user state ──
  const cards: SliderCard[] = useMemo(() => {
    const deck: SliderCard[] = [];

    // RETURNING USER: show "continue" cards first
    if (threads?.allConversationThreads?.length) {
      threads.allConversationThreads.slice(0, 2).forEach((t: any) => {
        deck.push({ type: 'continue', data: t });
      });
    }

    // BOOKMARKS: user's curated best
    if (bookmarks?.bookmarkedIterations?.length) {
      bookmarks.bookmarkedIterations.slice(0, 2).forEach((b: any) => {
        deck.push({ type: 'bookmarked', data: b });
      });
    }

    // FEATURED PROMPTS: highest quality, always show
    if (featured?.length) {
      featured.slice(0, 4).forEach((p: any) => {
        deck.push({ type: 'featured_prompt', data: p });
      });
    }

    // CATEGORIES: show top 4 by content volume
    if (categories?.length) {
      const sorted = [...categories].sort(
        (a: any, b: any) => (b.prompt_count + b.document_count) - (a.prompt_count + a.document_count)
      );
      sorted.slice(0, 4).forEach((c: any) => {
        deck.push({ type: 'category', data: c });
      });
    }

    // COURSES: social proof
    if (courses?.length) {
      courses.slice(0, 2).forEach((c: any) => {
        deck.push({ type: 'course', data: c });
      });
    }

    // CTA: always end with action card
    deck.push({ type: 'cta', data: { variant: isAuthenticated ? 'explore' : 'signup' } });

    return deck;
  }, [featured, categories, courses, threads, bookmarks, isAuthenticated]);

  return { cards, isLoading: !featured };
}
```

---

## 3. GSAP + Framer Motion Slider Component

### 3A. Dependencies

```bash
npm install gsap @gsap/react framer-motion
```

### 3B. Core Slider Component

```tsx
// components/onboarding/OnboardingSlider.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOnboardingSlider, SliderCard } from '@/hooks/useOnboardingSlider';

gsap.registerPlugin();

// ── Timing constants (30-second experience) ──
const AUTO_ADVANCE_MS    = 4000;  // 4s per card = ~28s for 7 cards
const CARD_ENTER_MS      = 0.6;
const CARD_EXIT_MS       = 0.4;
const STAGGER_MS         = 0.08;

export function OnboardingSlider({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { cards, isLoading } = useOnboardingSlider(isAuthenticated);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const timerRef     = useRef<NodeJS.Timeout>();
  const activeIndex  = useRef(0);

  // ── GSAP: initial entrance animation ──
  useGSAP(() => {
    if (!containerRef.current || isLoading) return;

    const cards = containerRef.current.querySelectorAll('.slider-card');

    // Staggered entrance from bottom with scale
    gsap.fromTo(cards,
      {
        y: 80,
        opacity: 0,
        scale: 0.9,
        rotateX: 15,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: CARD_ENTER_MS,
        stagger: STAGGER_MS,
        ease: 'power3.out',
        delay: 0.2,
      }
    );

    // Shimmer effect on featured cards
    const featuredCards = containerRef.current.querySelectorAll('.card-featured');
    gsap.fromTo(featuredCards,
      { backgroundPosition: '-200% 0' },
      {
        backgroundPosition: '200% 0',
        duration: 2,
        repeat: -1,
        ease: 'linear',
      }
    );
  }, { scope: containerRef, dependencies: [isLoading, cards.length] });

  // ── Auto-advance with GSAP scroll ──
  const advanceSlider = useCallback(() => {
    if (!trackRef.current || !cards.length) return;

    activeIndex.current = (activeIndex.current + 1) % cards.length;
    const cardWidth = trackRef.current.children[0]?.clientWidth || 320;
    const gap = 24;
    const offset = activeIndex.current * (cardWidth + gap);

    gsap.to(trackRef.current, {
      x: -offset,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    // Scale effect: active card pops, others shrink
    Array.from(trackRef.current.children).forEach((child, i) => {
      gsap.to(child, {
        scale: i === activeIndex.current ? 1 : 0.92,
        opacity: i === activeIndex.current ? 1 : 0.7,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  }, [cards.length]);

  useEffect(() => {
    timerRef.current = setInterval(advanceSlider, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advanceSlider]);

  // ── Pause on hover / touch ──
  const pauseAutoAdvance = () => clearInterval(timerRef.current);
  const resumeAutoAdvance = () => {
    timerRef.current = setInterval(advanceSlider, AUTO_ADVANCE_MS);
  };

  if (isLoading) return <SliderSkeleton />;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-8"
      onMouseEnter={pauseAutoAdvance}
      onMouseLeave={resumeAutoAdvance}
      onTouchStart={pauseAutoAdvance}
      onTouchEnd={resumeAutoAdvance}
    >
      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      {/* Card track */}
      <div
        ref={trackRef}
        className="flex gap-6 px-8 will-change-transform"
        style={{ cursor: 'grab' }}
      >
        {cards.map((card, i) => (
          <SliderCardRenderer key={`${card.type}-${i}`} card={card} index={i} />
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex justify-center gap-2">
        {cards.map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-white/20"
            animate={{
              width: i === activeIndex.current ? 32 : 8,
              backgroundColor: i === activeIndex.current
                ? 'rgb(139, 92, 246)' // violet-500
                : 'rgba(255, 255, 255, 0.2)',
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3C. Individual Card Components (Framer Motion)

```tsx
// components/onboarding/SliderCardRenderer.tsx
'use client';

import { motion } from 'framer-motion';
import type { SliderCard } from '@/hooks/useOnboardingSlider';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  expert:       'bg-red-500/20 text-red-400 border-red-500/30',
};

const USE_CASE_LABELS: Record<string, string> = {
  workflow_automation:  'Workflow',
  multi_agent:         'Multi-Agent',
  mcp_server_build:    'Server Build',
  agent_design:        'Agent Design',
  customer_support:    'Support Agent',
  code_review:         'Code Review',
  data_pipeline:       'Data Pipeline',
  security_audit:      'Security',
  enterprise_deploy:   'Enterprise',
  monitoring:          'Monitoring',
  context_engineering: 'Context Eng.',
  tool_creation:       'Tool Creation',
  research_agent:      'Research',
  marketing_agent:     'Marketing',
};

export function SliderCardRenderer({ card, index }: { card: SliderCard; index: number }) {
  switch (card.type) {
    case 'featured_prompt':
      return <FeaturedPromptCard data={card.data} index={index} />;
    case 'category':
      return <CategoryCard data={card.data} index={index} />;
    case 'course':
      return <CourseCard data={card.data} index={index} />;
    case 'continue':
      return <ContinueCard data={card.data} index={index} />;
    case 'bookmarked':
      return <BookmarkedCard data={card.data} index={index} />;
    case 'cta':
      return <CTACard variant={card.data.variant} index={index} />;
    default:
      return null;
  }
}

// ── Featured Prompt Card ──
function FeaturedPromptCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card card-featured relative min-w-[320px] max-w-[360px] flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 backdrop-blur-xl"
      whileHover={{
        scale: 1.04,
        y: -8,
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.25)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
    >
      {/* Premium badge */}
      {data.is_premium && (
        <div className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          Premium
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <span className="text-2xl">{data.category_icon}</span>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[data.difficulty] || ''}`}>
            {data.difficulty}
          </span>
          {data.use_case && (
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              {USE_CASE_LABELS[data.use_case] || data.use_case}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold leading-tight text-white">
        {data.title}
      </h3>

      {/* Description (truncated) */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
        {data.description}
      </p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {data.tags?.slice(0, 4).map((tag: string) => (
          <span key={tag} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{data.usage_count || 0} uses</span>
          {data.quality_score && (
            <QualityBar score={data.quality_score} />
          )}
        </div>
        <span className="text-xs font-medium text-violet-400">
          {data.credit_cost} {data.credit_cost === 1 ? 'credit' : 'credits'}
        </span>
      </div>
    </motion.div>
  );
}

// ── Category Card ──
function CategoryCard({ data, index }: { data: any; index: number }) {
  const total = (data.document_count || 0) + (data.prompt_count || 0);

  return (
    <motion.div
      className="slider-card min-w-[280px] max-w-[320px] flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-indigo-950/50 p-6 backdrop-blur-xl"
      whileHover={{
        scale: 1.04,
        y: -8,
        boxShadow: '0 20px 60px rgba(99, 102, 241, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="mb-4 block text-4xl">{data.icon}</span>
      <h3 className="mb-1 text-lg font-semibold text-white">{data.name}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-400">{data.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{data.prompt_count} prompts</span>
        <span>{data.document_count} docs</span>
      </div>

      {/* Animated count ring */}
      <motion.div
        className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-400"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1, type: 'spring' }}
      >
        {total}
      </motion.div>
    </motion.div>
  );
}

// ── Course Card ──
function CourseCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card min-w-[320px] max-w-[360px] flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-6 backdrop-blur-xl"
      whileHover={{ scale: 1.04, y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-400">
          {data.level}
        </span>
        {data.is_free && (
          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-400">
            Free
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold text-white">{data.title}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-400">{data.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{data.total_lessons} lessons</span>
        <span>{data.estimated_minutes} min</span>
        <span className="font-medium text-emerald-400">
          {data.total_enrollments} enrolled
        </span>
      </div>
    </motion.div>
  );
}

// ── Continue Where You Left Off (GraphQL-powered) ──
function ContinueCard({ data, index }: { data: any; index: number }) {
  const lastMessage = data.messages?.[data.messages.length - 1];

  return (
    <motion.div
      className="slider-card min-w-[320px] max-w-[360px] flex-shrink-0 cursor-pointer rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-900 p-6 backdrop-blur-xl"
      whileHover={{ scale: 1.04, y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-violet-400">
          Continue
        </span>
      </div>

      <h3 className="mb-2 text-base font-semibold text-white">{data.title}</h3>
      {lastMessage && (
        <p className="mb-3 line-clamp-2 text-sm text-slate-400">
          {lastMessage.iteration?.promptText}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{data.totalIterations} iterations</span>
        <span className="text-violet-400">Resume →</span>
      </div>
    </motion.div>
  );
}

// ── Bookmarked Iteration Card (GraphQL-powered) ──
function BookmarkedCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900 p-6 backdrop-blur-xl"
      whileHover={{ scale: 1.04, y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-amber-400">★</span>
        <span className="text-xs font-medium uppercase tracking-wider text-amber-400">
          Bookmarked
        </span>
        {data.userRating && (
          <span className="ml-auto text-xs text-amber-400/60">
            {data.userRating}/5
          </span>
        )}
      </div>

      <p className="mb-3 line-clamp-3 text-sm text-slate-300">{data.promptText}</p>

      <div className="flex flex-wrap gap-1.5">
        {data.tags?.slice(0, 3).map((tag: string) => (
          <span key={tag} className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400/60">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ── CTA Card ──
function CTACard({ variant, index }: { variant: string; index: number }) {
  const isSignup = variant === 'signup';

  return (
    <motion.div
      className="slider-card min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-700 p-6 shadow-2xl"
      whileHover={{ scale: 1.06, y: -10 }}
      whileTap={{ scale: 0.96 }}
    >
      <h3 className="mb-2 text-lg font-bold text-white">
        {isSignup ? 'Start Building with AI' : 'Explore the Full Library'}
      </h3>
      <p className="mb-4 text-sm text-violet-100/80">
        {isSignup
          ? '138 prompt templates, 59 knowledge docs, 2 academy courses — 500 free credits on signup.'
          : 'Browse n8n workflows, multi-agent patterns, enterprise deployments, and more.'}
      </p>
      <div className="inline-flex rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
        {isSignup ? 'Get Started Free →' : 'Browse All →'}
      </div>
    </motion.div>
  );
}

// ── Quality Score Bar ──
function QualityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <span className="text-[10px]">{Math.round(score * 100)}%</span>
    </div>
  );
}

// ── Loading skeleton ──
function SliderSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden px-8 py-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="min-w-[320px] animate-pulse rounded-2xl border border-white/5 bg-slate-900 p-6"
        >
          <div className="mb-4 h-8 w-8 rounded-lg bg-slate-800" />
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-800" />
          <div className="mb-4 h-3 w-full rounded bg-slate-800/60" />
          <div className="h-3 w-1/2 rounded bg-slate-800/40" />
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Apollo Client Setup

```typescript
// lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/api/graphql/`,
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allPromptHistories:   { merge: false },
          bookmarkedIterations: { merge: false },
          allSavedPrompts:      { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',  // fast cache hit + background refresh
      nextFetchPolicy: 'cache-first',
    },
  },
});
```

---

## 5. Page Integration

```tsx
// app/(marketing)/page.tsx  OR  app/page.tsx
import { OnboardingSlider } from '@/components/onboarding/OnboardingSlider';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <ApolloProvider client={apolloClient}>
      <main>
        {/* Hero section */}
        <section className="relative overflow-hidden bg-slate-950 pt-20">
          <h1 className="text-center text-5xl font-bold text-white">
            The MCP Intelligence Platform
          </h1>
          <p className="mt-4 text-center text-lg text-slate-400">
            138 prompt templates · 59 knowledge docs · 2 academy courses
          </p>

          {/* THE SLIDER — 30-second wow experience */}
          <OnboardingSlider isAuthenticated={isAuthenticated} />
        </section>

        {/* Rest of page... */}
      </main>
    </ApolloProvider>
  );
}
```

---

## 6. Performance Checklist

| Requirement | Implementation |
|------------|----------------|
| **< 200ms first paint** | REST calls via SWR with `fallbackData` from SSR |
| **Cards animate instantly** | GSAP `fromTo` with `will-change-transform` |
| **Smooth auto-advance** | GSAP `power2.inOut` ease on track translate |
| **Hover = pause** | `clearInterval` / `setInterval` on mouse events |
| **Mobile touch** | `onTouchStart` / `onTouchEnd` pause + swipe via drag |
| **GraphQL only when needed** | `skip: !isAuthenticated` prevents unnecessary auth calls |
| **Cache-first for return visits** | Apollo `cache-and-network` + SWR stale-while-revalidate |
| **60fps animations** | GSAP uses `requestAnimationFrame`, Framer uses `transform` only |

---

## 7. Available Data Summary

### REST Endpoints (No Auth)

| Endpoint | Cards It Powers | Key Fields |
|----------|----------------|------------|
| `GET /api/v2/mcp/prompts/featured/` | Featured Prompt cards | title, description, difficulty, tags, quality_score, use_case, credit_cost |
| `GET /api/v2/mcp/categories/` | Category cards | name, icon, description, prompt_count, document_count |
| `GET /api/v2/mcp/academy/courses/` | Course cards | title, level, total_lessons, estimated_minutes, total_enrollments |
| `GET /api/v2/mcp/prompts/?use_case=X` | Filtered prompt cards | Same as featured, filtered by use_case |
| `GET /api/v2/mcp/search/?q=X` | Search-triggered slider | documents[], prompts[], courses[] |
| `GET /api/v2/mcp/documents/` | Knowledge doc cards | title, excerpt, tags, quality_score, category_name |

### GraphQL Queries (Auth Required)

| Query | Cards It Powers | Key Fields |
|-------|----------------|------------|
| `allPromptHistories` | Activity-based personalization | originalPrompt, intentCategory, tags |
| `bookmarkedIterations` | Bookmarked cards | promptText, userRating, tags |
| `allConversationThreads` | "Continue" cards | title, totalIterations, lastActivityAt, messages |
| `allSavedPrompts` | Saved prompt cards | title, content, category, useCount, isFavorite |

### Filterable `use_case` Values

```
workflow_automation | multi_agent | mcp_server_build | agent_design
customer_support | code_review | data_pipeline | security_audit
enterprise_deploy | monitoring | context_engineering | tool_creation
research_agent | marketing_agent | prompt_engineering | testing
```

### Filterable `difficulty` Values

```
beginner | intermediate | advanced | expert
```

### Popular `tags` for Filtering

```
n8n | mcp | automation | multi-agent | fastmcp | python | typescript
openclaw | security | monitoring | docker | kubernetes | crewai
langchain | openai | workflow | production | enterprise | rag
```
