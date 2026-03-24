'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSkillCategories } from '@/lib/hooks/useSkills';
import { DIFFICULTY_CONFIG, SKILL_TYPE_CONFIG } from '@/lib/mcp-utils';
import type { PromptDifficulty, SkillType } from '@/types/mcp';

export function SkillFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: catData } = useSkillCategories();

  const currentCategory = params.get('category') || '';
  const currentDifficulty = params.get('difficulty') || '';
  const currentType = params.get('type') || '';

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    router.push(`/skills?${newParams.toString()}`);
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
          {(catData?.categories ?? []).map((cat) => (
            <FilterButton
              key={cat.id}
              label={`${cat.icon ?? ''} ${cat.name ?? ''}`}
              active={currentCategory === cat.slug}
              onClick={() => setFilter('category', cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Skill Type Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
          Type
        </h4>
        <div className="space-y-1">
          <FilterButton
            label="All Types"
            active={!currentType}
            onClick={() => setFilter('type', '')}
          />
          {(Object.entries(SKILL_TYPE_CONFIG) as [SkillType, { label: string }][]).map(
            ([key, cfg]) => (
              <FilterButton
                key={key}
                label={cfg.label}
                active={currentType === key}
                onClick={() => setFilter('type', key)}
              />
            ),
          )}
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
          {(Object.entries(DIFFICULTY_CONFIG) as [PromptDifficulty, { label: string }][]).map(
            ([key, cfg]) => (
              <FilterButton
                key={key}
                label={cfg.label}
                active={currentDifficulty === key}
                onClick={() => setFilter('difficulty', key)}
              />
            ),
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Reusable filter button ───────────────────────────

function FilterButton({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5
                  text-sm transition-colors ${
                    active
                      ? 'bg-[#C9A227]/15 text-[#C9A227] font-medium'
                      : 'text-[var(--fg)]/70 hover:bg-[var(--card)]'
                  }`}
    >
      <span className="truncate">{label}</span>
      {count != null && (
        <span className="text-xs text-[var(--fg)]/40">{count}</span>
      )}
    </button>
  );
}
