'use client';

import { useMCPCategories, useMCPFeaturedPrompts, useMCPDocuments } from '@/hooks/useMCPContent';
import { MCPHeroSection } from '@/components/mcp/MCPHeroSection';
import { MCPCategoryCard } from '@/components/mcp/MCPCategoryCard';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPDocumentCard } from '@/components/mcp/MCPDocumentCard';
import Link from 'next/link';

export default function MCPLibraryPage() {
  const { data: categories, isLoading: catLoading } = useMCPCategories();
  const { data: featured } = useMCPFeaturedPrompts();
  const { data: latestDocs } = useMCPDocuments({ ordering: '-created_at' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <MCPHeroSection />

      {/* Featured Prompts */}
      {featured?.results && featured.results.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--fg)]">Featured Prompts</h2>
            <Link href="/mcp/prompts?ordering=-quality_score" className="text-sm text-[#1E3A8A] dark:text-[#6CA0FF] hover:underline">
              View all
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
            <h2 className="text-xl font-bold text-[var(--fg)]">Latest Knowledge</h2>
            <Link href="/mcp/docs" className="text-sm text-[#1E3A8A] dark:text-[#6CA0FF] hover:underline">
              View all
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
          Prompt Temple Academy
        </h2>
        <p className="text-[var(--fg)]/60 mb-4 max-w-lg mx-auto">
          Learn MCP from zero to agent builder. Free course with 12 lessons, hands-on exercises, and a certificate.
        </p>
        <Link
          href="/academy"
          className="inline-block rounded-lg bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
        >
          Start Learning for Free
        </Link>
      </section>
    </div>
  );
}
