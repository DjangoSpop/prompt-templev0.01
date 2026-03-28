'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMCPDocuments, useMCPCategories } from '@/hooks/useMCPContent';
import { MCPDocumentCard } from '@/components/mcp/MCPDocumentCard';
import type { MCPDocumentFilters } from '@/types/mcp';

export default function MCPDocsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: catData } = useMCPCategories();

  const filters: MCPDocumentFilters = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading } = useMCPDocuments(filters);
  const currentPage = filters.page ?? 1;

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page');
    router.push(`/mcp/docs?${newParams.toString()}`);
  };

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (page > 1) newParams.set('page', String(page));
    else newParams.delete('page');
    router.push(`/mcp/docs?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <h1 className="mb-6 text-xl font-bold text-[var(--fg)] sm:text-2xl">MCP Documents</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
              Category
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('category', '')}
                className={`flex w-full items-center rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  !filters.category
                    ? 'bg-[#C9A227]/15 text-[#C9A227] font-medium'
                    : 'text-[var(--fg)]/70 hover:bg-[var(--card)]'
                }`}
              >
                All Categories
              </button>
              {catData?.results?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter('category', cat.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    filters.category === cat.slug
                      ? 'bg-[#C9A227]/15 text-[#C9A227] font-medium'
                      : 'text-[var(--fg)]/70 hover:bg-[var(--card)]'
                  }`}
                >
                  <span className="truncate">{cat.icon} {cat.name}</span>
                  <span className="text-xs text-[var(--fg)]/40">{cat.document_count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-[var(--card)]" />
              ))}
            </div>
          ) : !data?.results?.length ? (
            <div className="text-center py-16 text-[var(--fg)]/50">
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--fg)]/50 mb-4">
                {data.count} document{data.count !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.results.map((d) => (
                  <MCPDocumentCard key={d.id} doc={d} />
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
