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
