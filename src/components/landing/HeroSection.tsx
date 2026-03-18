'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY } from '@/lib/landing/copy';
import { TIMING, staggerContainer, slideUp, fadeIn } from '@/lib/landing/motion';
import { HERO_DEMO_CARDS, searchTemplates, type TemplateCard } from '@/lib/landing/demo-data';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { GradientButton } from './shared/GradientButton';

// Platform logo data
const PLATFORMS = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#d97757' },
  { name: 'Gemini', color: '#4285f4' },
  { name: 'Perplexity', color: '#20808d' },
  { name: 'Copilot', color: '#0078d4' },
  { name: 'Grok', color: '#1d9bf0' },
];

function TemplateCardComponent({ card, index }: { card: TemplateCard; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * TIMING.STAGGER_DELAY }}
      className="bg-white rounded-xl border border-sand-200 p-4 shadow-temple hover:shadow-pyramid hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <h3 className="font-semibold text-sand-900 text-sm mb-1 group-hover:text-indigo-royal transition-colors">
        {card.title}
      </h3>
      <p className="text-sand-600 text-xs mb-3 line-clamp-2">{card.preview}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded-full bg-pharaonic text-white font-medium">
          {card.category}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-accent-gold text-xs">&#9733;</span>
          <span className="text-xs text-sand-600">{card.rating}</span>
        </div>
      </div>
      <button className="mt-3 w-full text-xs font-semibold text-indigo-royal hover:text-temple-purple transition-colors text-center py-1.5 rounded-lg border border-sand-200 hover:border-indigo-royal/30 min-h-[36px]">
        {COPY.library.useNow}
      </button>
    </motion.div>
  );
}

export function LandingHeroSection() {
  const [query, setQuery] = useState('');
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [isAutoTyping, setIsAutoTyping] = useState(true);
  const [cards, setCards] = useState<TemplateCard[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoTypeRef = useRef<ReturnType<typeof setTimeout>>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-type effect
  useEffect(() => {
    if (!isAutoTyping) return;

    const text = COPY.hero.autoTypeQuery;
    let charIndex = 0;

    const typeNext = () => {
      if (charIndex <= text.length) {
        setDisplayedQuery(text.slice(0, charIndex));
        charIndex++;
        autoTypeRef.current = setTimeout(typeNext, TIMING.AUTO_TYPE_SPEED);
      } else {
        // Auto-type complete — show demo cards
        setCards(HERO_DEMO_CARDS);
        setShowCards(true);
      }
    };

    autoTypeRef.current = setTimeout(typeNext, 600);

    return () => {
      if (autoTypeRef.current) clearTimeout(autoTypeRef.current);
    };
  }, [isAutoTyping]);

  const handleInputFocus = useCallback(() => {
    if (isAutoTyping) {
      setIsAutoTyping(false);
      if (autoTypeRef.current) clearTimeout(autoTypeRef.current);
      setDisplayedQuery('');
      setShowCards(false);
    }
    if (!userHasInteracted) {
      setUserHasInteracted(true);
      trackLanding(LANDING_EVENTS.HERO_SEARCH_INTERACT);
    }
  }, [isAutoTyping, userHasInteracted]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounced search
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setShowCards(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const results = searchTemplates(value);
      setCards(results);
      setShowCards(results.length > 0);
      trackLanding(LANDING_EVENTS.HERO_SEARCH_QUERY, { query: value });
    }, TIMING.DEBOUNCE_MS);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fdf8f0 0%, #f5efe3 100%)',
      }}
    >
      {/* Subtle geometric background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(-45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Decorative star */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-accent-gold text-lg mb-4"
        >
          &#10022;
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-sand-900 mb-4 leading-tight tracking-tight"
        >
          {COPY.hero.headline}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="font-body text-base md:text-xl text-sand-600 mb-8 md:mb-12 max-w-xl mx-auto leading-relaxed"
        >
          {COPY.hero.subheadline}
        </motion.p>

        {/* Search Input */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="relative max-w-xl mx-auto mb-6"
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-300 text-lg">
              &#128269;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={isAutoTyping ? displayedQuery : query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={COPY.hero.searchPlaceholder}
              className="w-full pl-12 pr-4 py-4 md:py-5 text-base md:text-lg rounded-2xl border-2 border-sand-200 bg-white text-sand-900 placeholder:text-sand-300 focus:border-indigo-royal/50 focus:ring-4 focus:ring-indigo-royal/10 focus:outline-none transition-all shadow-temple font-body"
              aria-label={COPY.hero.searchPlaceholder}
              style={{ fontSize: '16px' }} // Prevents iOS zoom
            />
            {isAutoTyping && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sand-900 animate-pulse" />
            )}
          </div>
        </motion.div>

        {/* Template Cards */}
        <AnimatePresence mode="wait">
          {showCards && cards.length > 0 && (
            <motion.div
              key="cards"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl md:max-w-3xl mx-auto mb-8"
            >
              {cards.slice(0, 3).map((card, i) => (
                <TemplateCardComponent key={card.id} card={card} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <GradientButton
            href="/auth/register"
            size="lg"
            onClick={() => trackLanding(LANDING_EVENTS.HERO_CTA_CLICK)}
          >
            {COPY.hero.ctaPrimary}
          </GradientButton>
        </motion.div>

        {/* Platform Logos */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs text-sand-600 mb-4 font-body">{COPY.hero.platformsLabel}</p>
          <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
            {PLATFORMS.map((platform) => (
              <span
                key={platform.name}
                className="text-sm font-semibold text-sand-300 hover:text-sand-800 transition-colors duration-200 cursor-default font-body"
                style={{ '--platform-color': platform.color } as React.CSSProperties}
                title={platform.name}
              >
                {platform.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sand-300 text-sm font-body"
        >
          <button
            onClick={() => {
              const next = document.getElementById('problem-section');
              next?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex flex-col items-center gap-1 hover:text-accent-gold transition-colors min-h-[44px] min-w-[44px] justify-center"
            aria-label="Scroll to see how it works"
          >
            <span>{COPY.hero.scrollCta}</span>
            <span className="text-lg">&#9765;</span> {/* Ankh ☥ */}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
