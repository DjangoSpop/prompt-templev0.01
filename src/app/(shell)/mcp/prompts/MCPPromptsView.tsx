'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMCPPrompts } from '@/hooks/useMCPContent';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPFilterSidebar } from '@/components/mcp/MCPFilterSidebar';
import type { MCPPromptFilters } from '@/types/mcp';

export default function MCPPromptsView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: MCPPromptFilters = {
    category: searchParams.get('category') || undefined,
    difficulty: searchParams.get('difficulty') as MCPPromptFilters['difficulty'] || undefined,
    use_case: searchParams.get('use_case') as MCPPromptFilters['use_case'] || undefined,
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading } = useMCPPrompts(filters);
  const currentPage = filters.page ?? 1;

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (page > 1) newParams.set('page', String(page));
    else newParams.delete('page');
    router.push(`/mcp/prompts?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <h1 className="mb-6 text-xl font-bold text-[var(--fg)] sm:text-2xl">MCP Prompts</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="hidden lg:block">
          <MCPFilterSidebar />
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-xl bg-[var(--card)]" />
              ))}
            </div>
          ) : !data?.results?.length ? (
            <div className="text-center py-16 text-[var(--fg)]/50">
              <p className="text-lg font-medium">No prompts found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--fg)]/50 mb-4">
                {data.count} prompt{data.count !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.results.map((prompt) => (
                  <MCPPromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!data.previous || currentPage <= 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)]
                             bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]/70 transition-colors
                             hover:bg-[var(--card)]/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <p className="text-xs text-[var(--fg)]/50 sm:text-sm">Page {currentPage}</p>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!data.next}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)]
                             bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]/70 transition-colors
                             hover:bg-[var(--card)]/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
