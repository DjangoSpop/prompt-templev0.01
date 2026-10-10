'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { LANDING_EVENTS, trackLanding } from '@/lib/landing/analytics';
import { slideUp, staggerContainer } from '@/lib/landing/motion';
import { useCuratedShowcase } from '@/hooks/api/useCuratedShowcase';
import type { CuratedShowcaseCard } from '@/types/saved-prompts';

const { library } = COPY_V3;

const LIBRARY_HREF = '/discover?curated=true&sort=popularity';

const CARD_CLASS =
  'group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-stone-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:border-stone-700 dark:bg-stone-800/50 dark:hover:border-stone-600 dark:hover:shadow-black/20 dark:focus-visible:ring-offset-stone-900';

function ShowcaseCard({ card, lift }: { card: CuratedShowcaseCard; lift: boolean }) {
  return (
    <motion.li
      variants={slideUp}
      whileHover={lift ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      <Link
        href={`/templates/${card.id}`}
        onClick={() =>
          trackLanding(LANDING_EVENTS.LIBRARY_CARD_CLICK, {
            section: 'library_showcase',
            id: card.id,
            category: card.category,
          })
        }
        className={CARD_CLASS}
      >
        {/* Category + editor rating */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="truncate rounded-full bg-[#0E3A8C]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0E3A8C] dark:bg-blue-500/10 dark:text-blue-400">
            {card.category}
          </span>
          {card.editor_quality !== null && card.editor_quality >= 4 && (
            <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span aria-hidden="true">★ {card.editor_quality}</span>
              <span className="sr-only">Editor rating {card.editor_quality} of 5</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 min-w-0 break-words text-lg font-semibold text-stone-900 line-clamp-2 dark:text-white">
          {card.title}
        </h3>

        {/* Hook */}
        <p className="mb-5 text-sm leading-relaxed text-stone-500 line-clamp-3 dark:text-stone-400">
          {card.hook}
        </p>

        {/* Attribution + affordance */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-stone-700/60">
          {card.source ? (
            <span className="min-w-0 truncate text-[11px] text-stone-400 dark:text-stone-500">
              {card.source.name} · {card.source.license}
            </span>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs font-semibold text-[#0E3A8C]/80 transition-colors group-hover:text-[#0E3A8C] dark:text-blue-400/80 dark:group-hover:text-blue-400">
            {library.openPrompt}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

function SkeletonCard() {
  return (
    <li aria-hidden="true">
      <div className="flex h-full animate-pulse flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50">
        <div className="mb-4 h-5 w-28 rounded-full bg-stone-100 dark:bg-stone-700/60" />
        <div className="mb-2 h-5 w-4/5 rounded bg-stone-100 dark:bg-stone-700/60" />
        <div className="mb-2 h-3.5 w-full rounded bg-stone-100 dark:bg-stone-700/60" />
        <div className="mb-2 h-3.5 w-full rounded bg-stone-100 dark:bg-stone-700/60" />
        <div className="mb-5 h-3.5 w-2/3 rounded bg-stone-100 dark:bg-stone-700/60" />
        <div className="mt-auto h-3 w-1/2 rounded bg-stone-100 dark:bg-stone-700/60" />
      </div>
    </li>
  );
}

export function LibraryShowcaseSection() {
  const ref = useRef<HTMLElement>(null);
  // Fetch only once the section approaches the viewport — keeps it off first paint
  const inView = useInView(ref, { once: true, margin: '200px' });
  const reduceMotion = useReducedMotion();
  const { data, isPending, isError } = useCuratedShowcase(inView);

  const cards = !isError && data?.results.length ? data.results : library.fallback;
  const loading = isPending && !isError;
  const count = data?.count;
  const ctaText =
    typeof count === 'number'
      ? library.ctaTemplate.replace('{count}', count.toLocaleString())
      : library.ctaFallback;

  return (
    <section
      ref={ref}
      aria-labelledby="library-heading"
      className="border-t border-stone-200/70 bg-stone-50 px-4 py-20 dark:border-stone-800 dark:bg-stone-900/50 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#0E3A8C]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0E3A8C] dark:bg-blue-500/10 dark:text-blue-400">
            {library.tag}
          </span>
          <h2
            id="library-heading"
            className="mb-3 text-2xl font-bold text-stone-900 dark:text-white md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {library.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-stone-500 dark:text-stone-400 md:text-lg">
            {library.subtitle}
          </p>
        </div>

        {/* Cards */}
        {loading ? (
          <ul role="list" aria-busy="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : (
          <motion.ul
            role="list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card) => (
              <ShowcaseCard key={card.id} card={card} lift={!reduceMotion} />
            ))}
          </motion.ul>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-12 flex flex-col items-center gap-2 text-center"
        >
          <Link
            href={LIBRARY_HREF}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E3A8C] transition-colors hover:text-[#0E3A8C]/80 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {ctaText}
          </Link>
          <Link
            href="/templates"
            className="text-xs text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            {library.secondary}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default LibraryShowcaseSection;
