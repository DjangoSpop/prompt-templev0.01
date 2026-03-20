'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlFetch } from '@/lib/api/graphql';
import { ONBOARDING_QUERIES } from '@/lib/graphql/onboarding';
import {
  fetchFeaturedPrompts,
  fetchCategories,
  fetchCourses,
  type PromptCard,
  type CategoryCard,
  type CourseCard,
} from '@/lib/api/onboarding';

// ── Card types ──

export type SliderCard =
  | { type: 'featured_prompt'; data: PromptCard }
  | { type: 'category'; data: CategoryCard }
  | { type: 'course'; data: CourseCard }
  | { type: 'continue'; data: any }
  | { type: 'bookmarked'; data: any }
  | { type: 'cta'; data: { variant: string } };

export function useOnboardingSlider(isAuthenticated: boolean) {
  // ── Public REST data (always fetch) ──
  const { data: featured } = useQuery({
    queryKey: ['onboarding', 'featured'],
    queryFn: () => fetchFeaturedPrompts(8),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ['onboarding', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: courses } = useQuery({
    queryKey: ['onboarding', 'courses'],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000,
  });

  // ── Authenticated GraphQL data (only if logged in) ──
  const { data: threads } = useQuery({
    queryKey: ['onboarding', 'threads'],
    queryFn: () => graphqlFetch(ONBOARDING_QUERIES.ACTIVE_THREADS),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['onboarding', 'bookmarks'],
    queryFn: () => graphqlFetch(ONBOARDING_QUERIES.BOOKMARKED, { limit: 3 }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  // ── Build card deck ──
  const cards: SliderCard[] = useMemo(() => {
    const deck: SliderCard[] = [];

    // Returning user: "continue" cards first
    if (threads?.allConversationThreads?.length) {
      threads.allConversationThreads.slice(0, 2).forEach((t: any) => {
        deck.push({ type: 'continue', data: t });
      });
    }

    // Bookmarks
    if (bookmarks?.bookmarkedIterations?.length) {
      bookmarks.bookmarkedIterations.slice(0, 2).forEach((b: any) => {
        deck.push({ type: 'bookmarked', data: b });
      });
    }

    // Featured prompts
    if (featured?.length) {
      featured.slice(0, 4).forEach((p) => {
        deck.push({ type: 'featured_prompt', data: p });
      });
    }

    // Categories sorted by content volume
    if (categories?.length) {
      const sorted = [...categories].sort(
        (a, b) =>
          b.prompt_count + b.document_count - (a.prompt_count + a.document_count)
      );
      sorted.slice(0, 4).forEach((c) => {
        deck.push({ type: 'category', data: c });
      });
    }

    // Courses
    if (courses?.length) {
      courses.slice(0, 2).forEach((c) => {
        deck.push({ type: 'course', data: c });
      });
    }

    // CTA always last
    deck.push({
      type: 'cta',
      data: { variant: isAuthenticated ? 'explore' : 'signup' },
    });

    return deck;
  }, [featured, categories, courses, threads, bookmarks, isAuthenticated]);

  const isLoading = !featured && !categories;

  return { cards, isLoading };
}
