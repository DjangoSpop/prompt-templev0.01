'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMCPSearch } from '@/hooks/useMCPContent';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPDocumentCard } from '@/components/mcp/MCPDocumentCard';
import Link from 'next/link';

export default function MCPSearchPage() {
  const params = useSearchParams();
  const initialQuery = params.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { data, isLoading } = useMCPSearch(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const hasResults = data?.results && (
    data.results.documents.length > 0 ||
    data.results.prompts.length > 0 ||
    data.results.courses.length > 0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">Search MCP Library</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search prompts, articles, and courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)]
                       px-4 py-3 text-sm text-[var(--fg)]
                       placeholder:text-[var(--fg)]/30
                       focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#C9A227] px-6 py-3 text-sm font-semibold
                       text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && searchTerm && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      )}

      {searchTerm && !isLoading && !hasResults && (
        <div className="text-center py-16">
          <p className="text-lg text-[var(--fg)]/50">No results found for &quot;{searchTerm}&quot;</p>
          <p className="text-sm text-[var(--fg)]/30 mt-1">Try different keywords or browse categories.</p>
        </div>
      )}

      {data?.results && (
        <div className="space-y-10">
          {/* Prompts */}
          {data.results.prompts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--fg)] mb-4">
                Prompts ({data.results.prompts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.results.prompts.map((p) => (
                  <MCPPromptCard key={p.id} prompt={p} />
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          {data.results.documents.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--fg)] mb-4">
                Knowledge Articles ({data.results.documents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.results.documents.map((doc) => (
                  <MCPDocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </section>
          )}

          {/* Courses */}
          {data.results.courses.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--fg)] mb-4">
                Academy Courses ({data.results.courses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.results.courses.map((course) => (
                  <Link key={course.id} href={`/academy`}>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5
                                    hover:border-[#C9A227]/40 transition-all cursor-pointer">
                      <h3 className="font-semibold text-[var(--fg)] mb-1">{course.title}</h3>
                      <p className="text-sm text-[var(--fg)]/60 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-[var(--fg)]/50">
                        <span>{course.total_lessons} lessons</span>
                        <span>{course.estimated_minutes} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
