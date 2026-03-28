'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Server, Layers, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSkills, useMCPServers, useMyBookmarks } from '@/lib/hooks/useSkills';
import { SkillCard } from '@/components/skills/SkillCard';
import { MCPServerCard } from '@/components/skills/MCPServerCard';
import { SkillFilters } from '@/components/skills/SkillFilters';
import { SkillsStatsBar } from '@/components/skills/SkillsStatsBar';
import type { SkillFilters as SkillFiltersType } from '@/types/mcp';

type Tab = 'all' | 'mcp-servers' | 'bookmarks';

export default function SkillsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeTab = (searchParams.get('tab') as Tab) || 'all';

  const filters: SkillFiltersType = useMemo(
    () => ({
      category: searchParams.get('category') || undefined,
      skill_type: (searchParams.get('type') as SkillFiltersType['skill_type']) || undefined,
      difficulty: (searchParams.get('difficulty') as SkillFiltersType['difficulty']) || undefined,
      search: searchParams.get('search') || undefined,
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams],
  );

  const skillsQuery = useSkills(activeTab === 'all' ? filters : undefined);
  const mcpQuery = useMCPServers(activeTab === 'mcp-servers' ? search || undefined : undefined);
  const bookmarksQuery = useMyBookmarks();

  const setTab = (tab: Tab) => {
    const newParams = new URLSearchParams();
    if (tab !== 'all') newParams.set('tab', tab);
    router.push(`/skills?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());
    if (search) newParams.set('search', search);
    else newParams.delete('search');
    newParams.delete('page');
    router.push(`/skills?${newParams.toString()}`);
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Skills', icon: Layers },
    { id: 'mcp-servers', label: 'MCP Servers', icon: Server },
    { id: 'bookmarks', label: 'Bookmarks', icon: Heart },
  ];

  const isLoading =
    (activeTab === 'all' && skillsQuery.isLoading) ||
    (activeTab === 'mcp-servers' && mcpQuery.isLoading) ||
    (activeTab === 'bookmarks' && bookmarksQuery.isLoading);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]
                      bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[#C9A227]/5 p-4 sm:p-6 md:p-8 mb-6">
        <div className="max-w-2xl">
          <h1 className="mb-2 text-2xl font-bold text-[var(--fg)] sm:text-3xl">
            Skills & MCP Knowledge
          </h1>
          <p className="mb-4 text-sm text-[var(--fg)]/60 sm:text-base">
            Explore MCP servers, prompt techniques, agentic patterns, frameworks
            and more. Bookmark skills to build your personal toolkit.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg)]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, servers, techniques..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)]
                           py-2.5 pl-10 pr-4 text-sm text-[var(--fg)]
                           placeholder:text-[var(--fg)]/40 focus:outline-none
                           focus:border-[#C9A227]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-medium
                         sm:w-auto sm:whitespace-nowrap
                         text-white hover:bg-[#B8911F] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <SkillsStatsBar />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <div className="flex min-w-max items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`-mb-px shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium
                        border-b-2 transition-colors -mb-px ${
                          activeTab === tab.id
                            ? 'border-[#C9A227] text-[#C9A227]'
                            : 'border-transparent text-[var(--fg)]/50 hover:text-[var(--fg)]'
                        }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters sidebar - only on All Skills tab */}
        {activeTab === 'all' && (
          <div className="hidden lg:block">
            <SkillFilters />
          </div>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-[var(--border)]
                             bg-[var(--card)]"
                />
              ))}
            </div>
          ) : activeTab === 'all' ? (
            <SkillsGrid
              skills={skillsQuery.data?.results ?? []}
              total={skillsQuery.data?.count ?? 0}
              page={filters.page ?? 1}
            />
          ) : activeTab === 'mcp-servers' ? (
            <MCPServersGrid
              skills={mcpQuery.data?.results ?? []}
              total={mcpQuery.data?.count ?? 0}
            />
          ) : (
            <BookmarksGrid
              bookmarks={bookmarksQuery.data?.bookmarks ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub grids ────────────────────────────────────────

function SkillsGrid({ skills, total, page }: { skills: import('@/types/mcp').Skill[]; total: number; page: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!skills.length) {
    return (
      <div className="text-center py-16 text-[var(--fg)]/50">
        <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No skills found</p>
        <p className="text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const goToPage = (p: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(p));
    router.push(`/skills?${newParams.toString()}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {skills.map((skill) =>
          skill.skill_type === 'mcp_server' ? (
            <MCPServerCard key={skill.id} skill={skill} />
          ) : (
            <SkillCard key={skill.id} skill={skill} />
          ),
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={!hasPrev}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)]
                         bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]/70 transition-colors
                         hover:bg-[var(--card)]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <p className="text-xs text-[var(--fg)]/50 sm:text-sm">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)]
                         bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]/70 transition-colors
                         hover:bg-[var(--card)]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  p === page
                    ? 'bg-[#C9A227] text-white'
                    : 'bg-[var(--card)] text-[var(--fg)]/70 hover:bg-[var(--card)]/80'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MCPServersGrid({ skills, total }: { skills: import('@/types/mcp').Skill[]; total: number }) {
  if (!skills.length) {
    return (
      <div className="text-center py-16 text-[var(--fg)]/50">
        <Server className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No MCP servers found</p>
        <p className="text-sm">Try a different search term</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-[var(--fg)]/50 mb-4">{total} MCP server{total !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <MCPServerCard key={skill.id} skill={skill} />
        ))}
      </div>
    </>
  );
}

function BookmarksGrid({ bookmarks }: { bookmarks: import('@/types/mcp').SkillBookmark[] }) {
  if (!bookmarks.length) {
    return (
      <div className="text-center py-16 text-[var(--fg)]/50">
        <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No bookmarks yet</p>
        <p className="text-sm">Bookmark skills to save them for later</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {bookmarks.map((bm) =>
        bm.skill.skill_type === 'mcp_server' ? (
          <MCPServerCard key={bm.id} skill={bm.skill} />
        ) : (
          <SkillCard key={bm.id} skill={bm.skill} />
        ),
      )}
    </div>
  );
}
