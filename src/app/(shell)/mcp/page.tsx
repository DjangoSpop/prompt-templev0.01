'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, BookOpen, FileText, GraduationCap } from 'lucide-react';
import { useMCPCategories, useMCPFeaturedPrompts } from '@/hooks/useMCPContent';
import { MCPCategoryCard } from '@/components/mcp/MCPCategoryCard';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';

export default function MCPLandingPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { data: catData } = useMCPCategories();
  const { data: featured } = useMCPFeaturedPrompts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/mcp/prompts?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const quickLinks = [
    { href: '/mcp/prompts', label: 'Prompts', icon: BookOpen, desc: 'MCP prompt templates' },
    { href: '/mcp/docs', label: 'Documents', icon: FileText, desc: 'Knowledge base articles' },
    { href: '/mcp/academy', label: 'Academy', icon: GraduationCap, desc: 'Courses & lessons' },
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]
                      bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[#C9A227]/5 p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-[var(--fg)] mb-2">
            MCP Knowledge Base
          </h1>
          <p className="text-[var(--fg)]/60 mb-5">
            Explore the Model Context Protocol ecosystem — prompts, documentation,
            and structured courses to level up your MCP skills.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg)]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, docs, courses..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)]
                           py-2.5 pl-10 pr-4 text-sm text-[var(--fg)]
                           placeholder:text-[var(--fg)]/40 focus:outline-none
                           focus:border-[#C9A227]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-medium
                         text-white hover:bg-[#B8911F] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-4 rounded-xl border border-[var(--border)]
                       bg-[var(--card)] p-5 hover:border-[#C9A227]/40 transition-all"
          >
            <div className="rounded-lg bg-[#C9A227]/10 p-3">
              <link.icon className="h-6 w-6 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] group-hover:text-[#C9A227] transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-[var(--fg)]/50">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Categories */}
      {catData?.results && catData.results.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[var(--fg)] mb-4">Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catData.results.map((cat) => (
              <MCPCategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Prompts */}
      {featured?.results && featured.results.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--fg)]">Featured Prompts</h2>
            <Link
              href="/mcp/prompts"
              className="text-sm text-[#C9A227] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.results.slice(0, 6).map((prompt) => (
              <MCPPromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
