'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMCPCategories } from '@/hooks/useMCPContent';
import { DIFFICULTY_CONFIG, USE_CASE_LABELS } from '@/lib/mcp-utils';
import type { PromptDifficulty, PromptUseCase } from '@/types/mcp';

export function MCPFilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: catData } = useMCPCategories();

  const currentCategory = params.get('category') || '';
  const currentDifficulty = params.get('difficulty') || '';
  const currentUseCase = params.get('use_case') || '';

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    router.push(`/mcp/prompts?${newParams.toString()}`);
  };

  return (
    <aside className="w-64 shrink-0 space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Category
        </h4>
        <div className="space-y-1">
          <FilterButton
            label="All Categories"
            active={!currentCategory}
            onClick={() => setFilter('category', '')}
          />
          {catData?.results.map((cat) => (
            <FilterButton
              key={cat.id}
              label={`${cat.icon} ${cat.name}`}
              count={cat.prompt_count}
              active={currentCategory === cat.slug}
              onClick={() => setFilter('category', cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Difficulty
        </h4>
        <div className="space-y-1">
          <FilterButton
            label="All Levels"
            active={!currentDifficulty}
            onClick={() => setFilter('difficulty', '')}
          />
          {(Object.keys(DIFFICULTY_CONFIG) as PromptDifficulty[]).map((d) => (
            <FilterButton
              key={d}
              label={DIFFICULTY_CONFIG[d].label}
              active={currentDifficulty === d}
              onClick={() => setFilter('difficulty', d)}
            />
          ))}
        </div>
      </div>

      {/* Use Case Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Use Case
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          <FilterButton
            label="All Use Cases"
            active={!currentUseCase}
            onClick={() => setFilter('use_case', '')}
          />
          {(Object.entries(USE_CASE_LABELS) as [PromptUseCase, string][]).map(
            ([key, label]) => (
              <FilterButton
                key={key}
                label={label}
                active={currentUseCase === key}
                onClick={() => setFilter('use_case', key)}
              />
            ),
          )}
        </div>
      </div>

      {/* Premium Toggle */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Access
        </h4>
        <div className="space-y-1">
          <FilterButton label="All" active={!params.get('is_premium')} onClick={() => setFilter('is_premium', '')} />
          <FilterButton label="Free Only" active={params.get('is_premium') === 'false'} onClick={() => setFilter('is_premium', 'false')} />
          <FilterButton label="Premium Only" active={params.get('is_premium') === 'true'} onClick={() => setFilter('is_premium', 'true')} />
        </div>
      </div>
    </aside>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5
                  text-sm transition-colors text-left
                  ${active
                    ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] font-medium'
                    : 'text-[var(--fg)]/60 hover:bg-[var(--bg)] hover:text-[var(--fg)]'
                  }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-[var(--fg)]/30">{count}</span>
      )}
    </button>
  );
}
