'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMCPPrompts } from '@/hooks/useMCPContent';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPFilterSidebar } from '@/components/mcp/MCPFilterSidebar';
import type { MCPPromptFilters } from '@/types/mcp';

export default function MCPPromptsPage() {
  const params = useSearchParams();
  const router = useRouter();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(params.toString());
    if (searchQuery) newParams.set('search', searchQuery);
    else newParams.delete('search');
    newParams.delete('page');
    router.push(`/mcp/prompts?${newParams.toString()}`);
  };

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
        <form onSubmit={handleSearch}>
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
                    <PaginationLink
                      label="Previous"
                      page={(filters.page || 1) - 1}
                    />
                  )}
                  <span className="px-4 py-2 text-sm text-[var(--fg)]/50">
                    Page {filters.page || 1} of {Math.ceil(data.count / 20)}
                  </span>
                  {data.next && (
                    <PaginationLink
                      label="Next"
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

function PaginationLink({ label, page }: { label: string; page: number }) {
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
