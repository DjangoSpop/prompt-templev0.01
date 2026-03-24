'use client';

import { useSearchParams } from 'next/navigation';
import { useMCPPrompts } from '@/hooks/useMCPContent';
import { MCPPromptCard } from '@/components/mcp/MCPPromptCard';
import { MCPFilterSidebar } from '@/components/mcp/MCPFilterSidebar';
import type { MCPPromptFilters } from '@/types/mcp';

export default function MCPPromptsView() {
  const searchParams = useSearchParams();

  const filters: MCPPromptFilters = {
    category: searchParams.get('category') || undefined,
    difficulty: searchParams.get('difficulty') as MCPPromptFilters['difficulty'] || undefined,
    use_case: searchParams.get('use_case') as MCPPromptFilters['use_case'] || undefined,
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading } = useMCPPrompts(filters);

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">MCP Prompts</h1>

      <div className="flex gap-6">
        <div className="hidden lg:block">
          <MCPFilterSidebar />
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.results.map((prompt) => (
                  <MCPPromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
