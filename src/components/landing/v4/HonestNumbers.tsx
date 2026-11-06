'use client';

/**
 * Sprint 11 I5 §5 — four facts, no boasts. The prompt count comes from the feed filters
 * endpoint when it exposes a total; otherwise a dash (never a hard-coded figure).
 */
import Link from 'next/link';
import { useFilters } from '@/lib/feed/hooks';

function totalFromFilters(filters: unknown): number | null {
  // TODO(sprint11): when the backend exposes a licensed-prompt total on /feed/filters/, read it here.
  if (!filters || typeof filters !== 'object') return null;
  const f = filters as Record<string, unknown>;
  const direct = f.total ?? f.count ?? f.total_prompts;
  if (typeof direct === 'number') return direct;
  const forms = f.forms;
  if (Array.isArray(forms)) {
    const sum = forms.reduce((acc: number, x) => (x && typeof x === 'object' && typeof (x as { count?: unknown }).count === 'number' ? acc + (x as { count: number }).count : acc), 0);
    return sum > 0 ? sum : null;
  }
  return null;
}

export function HonestNumbers() {
  const filters = useFilters();
  const total = totalFromFilters(filters.data);
  const facts = [
    { value: total != null ? total.toLocaleString('en-US') : '—', label: 'Licensed prompts, each shown with what it produces', href: '/feed' },
    { value: 'Judged', label: 'Results judged automatically before they are shown', href: '/academy' },
    { value: 'Free', label: 'Free to start. No card needed', href: '/pricing' },
    { value: 'عربي / English', label: 'Written in both, not translated', href: '/academy' },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16" aria-label="Facts about Prompt Temple">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 border-t v2:border-line border-border pt-4">
            <dt className="display-lg v2:font-display v2:text-ink text-3xl font-semibold tabular-nums">
              <Link href={f.href} className="hover:underline underline-offset-4">{f.value}</Link>
            </dt>
            <dd className="mt-1 text-sm v2:text-ink-muted text-muted-foreground">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
