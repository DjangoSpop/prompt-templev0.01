/**
 * Landing curated-library showcase (6 trimmed cards + total curated count).
 * Reads the same-origin Next route, which caches and trims the backend Discover feed.
 */

import { useQuery } from '@tanstack/react-query';
import type { CuratedShowcaseResponse } from '@/types/saved-prompts';

export const curatedShowcaseKey = ['landing', 'curated-showcase'] as const;

export function useCuratedShowcase(enabled: boolean = true) {
  return useQuery<CuratedShowcaseResponse>({
    queryKey: curatedShowcaseKey,
    queryFn: async () => {
      const res = await fetch('/api/landing/curated');
      if (!res.ok) throw new Error(`Curated showcase failed: ${res.status}`);
      return res.json() as Promise<CuratedShowcaseResponse>;
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
