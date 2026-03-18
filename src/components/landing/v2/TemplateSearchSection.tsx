'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { COPY } from '@/lib/landing/copy';
import { TIMING, cardHover, cardTap } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import {
  searchTemplates,
  getTemplatesByCategory,
  type TemplateCard,
  FEATURED_TEMPLATES,
} from '@/lib/landing/demo-data';

const { templateSearch } = COPY;

function TemplateResultCard({
  card,
  index,
}: {
  card: TemplateCard;
  index: number;
}) {
  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={cardHover}
      whileTap={cardTap}
      className="bg-white dark:bg-[#161A22] rounded-xl border border-sand-200 p-5 shadow-sm hover:shadow-pyramid transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sand-900 text-sm leading-tight">
          {card.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Star size={12} className="fill-[#CBA135] text-[#CBA135] dark:fill-[#E9C25A] dark:text-[#E9C25A]" />
          <span className="text-xs text-sand-600">{card.rating}</span>
        </div>
      </div>

      <p className="text-sand-600 text-xs mb-3 line-clamp-2 flex-1">
        {card.preview}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 dark:bg-[#1C1F26] text-sand-800 font-medium">
          {card.category}
        </span>
        {card.uses && (
          <span className="text-xs text-sand-300 dark:text-stone-500">
            {card.uses.toLocaleString()} uses
          </span>
        )}
      </div>

      <Link
        href="/auth/register"
        onClick={() => trackLanding(LANDING_EVENTS.TEMPLATE_SEARCH_USE, { template: card.title })}
        className="mt-3 block w-full text-center text-xs font-semibold text-[#0E3A8C] dark:text-blue-400 hover:text-[#0E3A8C]/80 dark:hover:text-blue-300 transition-colors py-2 rounded-lg border border-sand-200 hover:border-[#0E3A8C]/30 dark:hover:border-blue-400/30 min-h-[44px] flex items-center justify-center"
      >
        {templateSearch.useTemplate}
      </Link>
    </motion.div>
  );
}

export function TemplateSearchSection() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState<TemplateCard[]>(
    () => FEATURED_TEMPLATES.slice(0, 8),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateResults = useCallback(
    (q: string, category: string) => {
      if (q.trim()) {
        setResults(searchTemplates(q, 8));
      } else {
        setResults(getTemplatesByCategory(category, 8));
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateResults(value, activeCategory);
        if (value.trim()) trackLanding(LANDING_EVENTS.TEMPLATE_SEARCH_QUERY, { query: value });
      }, TIMING.DEBOUNCE_MS);
    },
    [activeCategory, updateResults],
  );

  const handleCategory = useCallback(
    (cat: string) => {
      setActiveCategory(cat);
      setQuery('');
      setResults(getTemplatesByCategory(cat, 8));
      trackLanding(LANDING_EVENTS.TEMPLATE_SEARCH_CATEGORY, { category: cat });
    },
    [],
  );

  return (
    <section className="py-16 md:py-24 px-4 bg-sand-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mb-3">
            {templateSearch.title}
          </h2>
          <p className="text-sand-600 text-base md:text-lg max-w-lg mx-auto">
            {templateSearch.subtitle}
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-300"
            />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder={templateSearch.searchPlaceholder}
              className="landing-input w-full pl-11 pr-4 py-3.5 text-sm rounded-xl border-2 border-sand-200 bg-white dark:bg-[#14161B] text-sand-900 placeholder:text-sand-300 focus:border-[#0E3A8C]/50 dark:focus:border-blue-400/50 focus:ring-4 focus:ring-[#0E3A8C]/10 dark:focus:ring-blue-400/10 focus:outline-none transition-all font-body"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
          {templateSearch.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                activeCategory === cat
                  ? 'bg-[#0E3A8C] dark:bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-[#1C1F26] text-sand-600 border border-sand-200 hover:border-sand-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="wait">
            {results.map((card, i) => (
              <TemplateResultCard key={card.id} card={card} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* No results */}
        {results.length === 0 && query.trim() && (
          <p className="text-center text-sand-500 dark:text-stone-400 py-8">
            No templates found for &ldquo;{query}&rdquo;. Try a different search.
          </p>
        )}

        {/* Explore all */}
        <div className="text-center mt-8">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0E3A8C] dark:text-blue-400 hover:text-[#0E3A8C]/80 dark:hover:text-blue-300 transition-colors min-h-[44px]"
          >
            {templateSearch.exploreAll}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TemplateSearchSection;
