'use client';

/**
 * F4 — facet filters (Form, Length, Category, Model family, Language) with counts.
 * Multi-select within a facet; URL-synced by the parent. Sidebar ≥ 1024 px, Dialog
 * (bottom sheet on mobile) below.
 */
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useFilters } from '@/lib/feed/hooks';
import { countActiveFilters } from '@/lib/feed/params';
import { FACET_KEYS, FORM_LABELS, type FacetKey, type FacetValue, type FeedFilterState, type PromptForm } from '@/lib/feed/types';

const FACET_TITLES: Record<FacetKey, string> = {
  form: 'Form',
  length: 'Length',
  category: 'Category',
  model_family: 'Model',
  language: 'Language',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ar: 'العربية', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano',
  ru: 'Русский', zh: '中文', ja: '日本語', ko: '한국어', tr: 'Türkçe', hi: 'हिन्दी', nl: 'Nederlands',
};
const MODEL_FAMILY_NAMES: Record<string, string> = { any: 'Any model', image: 'Image models', code: 'Code models' };
const CATEGORY_PREVIEW = 10;

export function facetLabel(key: FacetKey, value: FacetValue | { value: string; label?: string }): string {
  if (key === 'form') return FORM_LABELS[value.value as PromptForm] ?? value.label ?? value.value;
  if (key === 'language') return LANGUAGE_NAMES[value.value] ?? value.label ?? value.value;
  if (key === 'model_family') return MODEL_FAMILY_NAMES[value.value] ?? value.label ?? value.value;
  return value.label ?? value.value;
}

/** `und` (undetermined language) is not a useful filter. */
function visibleValues(key: FacetKey, values: FacetValue[]): FacetValue[] {
  return values.filter((v) => v.count > 0 && !(key === 'language' && v.value === 'und'));
}

interface FacetListProps {
  value: FeedFilterState;
  onToggle: (key: FacetKey, value: string) => void;
  onClear: () => void;
}

function FacetList({ value, onToggle, onClear }: FacetListProps) {
  const { data, isLoading, isError } = useFilters();
  const [showAllCategories, setShowAllCategories] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading filters…</p>;
  if (isError || !data) return <p className="text-sm text-muted-foreground">Filters are unavailable right now.</p>;

  return (
    <div className="space-y-5">
      {FACET_KEYS.map((key) => {
        let values = visibleValues(key, data[key]);
        if (values.length < 2 && !(value[key]?.length)) return null;
        const hidden = key === 'category' && !showAllCategories ? Math.max(0, values.length - CATEGORY_PREVIEW) : 0;
        if (hidden) values = values.slice(0, CATEGORY_PREVIEW);
        return (
          <fieldset key={key}>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{FACET_TITLES[key]}</legend>
            <div className="flex flex-wrap gap-1.5">
              {values.map((v) => {
                const active = value[key]?.includes(v.value) ?? false;
                return (
                  <button
                    key={v.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggle(key, v.value)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                      active ? 'border-[#C9A227] bg-[#C9A227]/15 font-medium text-foreground v2:border-transparent v2:bg-faience-soft v2:text-faience' : 'border-border hover:border-[#C9A227]/50 v2:border-line v2:hover:border-line v2:hover:bg-surface-sunken'
                    )}
                  >
                    <span dir="auto">{facetLabel(key, v)}</span>
                    <span className="tabular-nums text-muted-foreground">{v.count.toLocaleString()}</span>
                  </button>
                );
              })}
              {hidden > 0 && (
                <button type="button" className="px-1 text-xs font-medium text-primary hover:underline" onClick={() => setShowAllCategories(true)}>
                  +{hidden} more
                </button>
              )}
            </div>
          </fieldset>
        );
      })}
      {countActiveFilters(value) > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="-ml-3">
          Clear all
        </Button>
      )}
    </div>
  );
}

export function FiltersSidebar(props: FacetListProps) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
        <FacetList {...props} />
      </div>
    </aside>
  );
}

export function FiltersButton(props: FacetListProps) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(props.value);
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters{active > 0 && <span className="rounded-full bg-[#C9A227] px-1.5 text-[11px] font-semibold text-black v2:bg-faience-fill v2:text-faience-on">{active}</span>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <FacetList {...props} />
          <Button className="mt-2 w-full" onClick={() => setOpen(false)}>
            Show prompts
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Removable chips for the active filters, shown above the list. */
export function ActiveFilterChips({ value, onToggle, onClear }: FacetListProps) {
  const { data } = useFilters();
  const chips = FACET_KEYS.flatMap((key) =>
    (value[key] ?? []).map((v) => {
      const facet = data?.[key]?.find((f) => f.value === v);
      return { key, value: v, label: facetLabel(key, facet ?? { value: v }) };
    })
  );
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button
          key={`${c.key}:${c.value}`}
          type="button"
          onClick={() => onToggle(c.key, c.value)}
          className="inline-flex items-center gap-1 rounded-full bg-[#C9A227]/15 px-2.5 py-1 text-xs font-medium v2:bg-faience-soft v2:text-faience"
          aria-label={`Remove filter ${FACET_TITLES[c.key]}: ${c.label}`}
        >
          <span dir="auto">{c.label}</span>
          <X className="h-3 w-3" aria-hidden />
        </button>
      ))}
      <button type="button" onClick={onClear} className="px-1 text-xs text-muted-foreground hover:text-foreground hover:underline">
        Clear all
      </button>
    </div>
  );
}
