'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY_V1 as COPY } from '@/lib/landing/copy';
import { TIMING, staggerContainer, fadeIn } from '@/lib/landing/motion';
import { getTemplatesByCategory, searchTemplates, type TemplateCard } from '@/lib/landing/demo-data';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { EgyptianLoader } from './shared/EgyptianLoader';

function TemplateCardItem({ card, index }: { card: TemplateCard; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-white rounded-xl border border-sand-200 p-4 shadow-temple hover:shadow-pyramid hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <h3 className="font-semibold text-sand-900 text-sm mb-1 group-hover:text-indigo-royal transition-colors">
        {card.title}
      </h3>
      <p className="text-sand-600 text-xs mb-3 line-clamp-2">{card.preview}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-pharaonic text-white font-medium">
          {card.category}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-accent-gold text-xs">&#9733;</span>
          <span className="text-xs text-sand-600">{card.rating}</span>
        </div>
      </div>
      <button
        onClick={() => trackLanding(LANDING_EVENTS.LIBRARY_CARD_CLICK, { template: card.title })}
        className="w-full text-xs font-semibold text-indigo-royal hover:text-temple-purple transition-colors text-center py-2 rounded-lg border border-sand-200 hover:border-indigo-royal/30 min-h-[36px]"
      >
        {COPY.library.useNow}
      </button>
    </motion.div>
  );
}

export function TemplateLibrary() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState<TemplateCard[]>(getTemplatesByCategory('All'));
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
    setIsSearching(true);

    setTimeout(() => {
      setCards(getTemplatesByCategory(category));
      setIsSearching(false);
    }, 400);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setCards(getTemplatesByCategory(activeCategory));
      return;
    }

    setIsSearching(true);
    trackLanding(LANDING_EVENTS.LIBRARY_SEARCH, { query: value });

    debounceRef.current = setTimeout(() => {
      setCards(searchTemplates(value));
      setIsSearching(false);
    }, TIMING.DEBOUNCE_MS);
  }, [activeCategory]);

  const categories = ['All', ...COPY.library.categories];

  return (
    <section className="py-16 md:py-24 px-4 bg-sand-50">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mb-2">
            {COPY.library.title}
          </h2>
          <p className="font-body text-sand-600 text-base md:text-lg">
            {COPY.library.subtitle}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center md:flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                activeCategory === cat
                  ? 'bg-pharaonic text-white shadow-pyramid'
                  : 'bg-sand-100 text-sand-600 hover:bg-sand-200 hover:text-sand-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-300">&#128269;</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={COPY.library.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-sand-200 bg-white text-sand-900 placeholder:text-sand-300 focus:border-indigo-royal/50 focus:ring-4 focus:ring-indigo-royal/10 focus:outline-none font-body"
              style={{ fontSize: '16px' }}
              aria-label="Search templates"
            />
          </div>
        </div>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="py-8"
            >
              <EgyptianLoader size="sm" message="Searching the scrolls..." />
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              aria-live="polite"
            >
              {cards.map((card, i) => (
                <TemplateCardItem key={card.id} card={card} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explore all link */}
        <div className="text-center mt-8">
          <a
            href="/templates"
            className="inline-flex items-center text-sm font-semibold text-indigo-royal hover:text-temple-purple transition-colors min-h-[44px]"
          >
            {COPY.library.exploreAll}
          </a>
        </div>
      </div>
    </section>
  );
}
