'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, Loader2, Copy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { COPY } from '@/lib/landing/copy';
import { TIMING, staggerContainer, slideUp, fadeIn, cardHover, cardTap } from '@/lib/landing/motion';
import {
  HERO_DEMO_CARDS,
  searchTemplates,
  simulateOptimization,
  OPTIMIZER_DEMO,
  type TemplateCard,
} from '@/lib/landing/demo-data';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { GradientButton } from '../shared/GradientButton';

const { hero } = COPY;

const PLATFORMS = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#d97757' },
  { name: 'Gemini', color: '#4285f4' },
  { name: 'Perplexity', color: '#20808d' },
  { name: 'Copilot', color: '#0078d4' },
  { name: 'Grok', color: '#1d9bf0' },
];

// ── Small template card for search results ─────────────

function TemplateCardComponent({ card, index }: { card: TemplateCard; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * TIMING.STAGGER_DELAY }}
      whileHover={cardHover}
      whileTap={cardTap}
      onClick={() => trackLanding(LANDING_EVENTS.LIBRARY_CARD_CLICK, { template: card.title })}
      className="bg-white dark:bg-[#161A22] rounded-xl border border-sand-200 p-4 shadow-temple hover:shadow-pyramid transition-all duration-200 cursor-pointer group"
    >
      <h3 className="font-semibold text-sand-900 text-sm mb-1 group-hover:text-indigo-royal dark:group-hover:text-blue-400 transition-colors">
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
    </motion.div>
  );
}

// ── Search Tab ─────────────────────────────────────────

function SearchTab() {
  const [query, setQuery] = useState('');
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [isAutoTyping, setIsAutoTyping] = useState(true);
  const [cards, setCards] = useState<TemplateCard[]>([]);
  const [showCards, setShowCards] = useState(false);
  const autoTypeRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isAutoTyping) return;
    const text = hero.autoTypeQuery;
    let charIndex = 0;

    const typeNext = () => {
      if (charIndex <= text.length) {
        setDisplayedQuery(text.slice(0, charIndex));
        charIndex++;
        autoTypeRef.current = setTimeout(typeNext, TIMING.AUTO_TYPE_SPEED);
      } else {
        setCards(HERO_DEMO_CARDS);
        setShowCards(true);
      }
    };

    autoTypeRef.current = setTimeout(typeNext, 400);
    return () => { if (autoTypeRef.current) clearTimeout(autoTypeRef.current); };
  }, [isAutoTyping]);

  const handleFocus = useCallback(() => {
    if (isAutoTyping) {
      setIsAutoTyping(false);
      if (autoTypeRef.current) clearTimeout(autoTypeRef.current);
      setDisplayedQuery('');
      setShowCards(false);
    }
    trackLanding(LANDING_EVENTS.HERO_SEARCH_INTERACT);
  }, [isAutoTyping]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setShowCards(false); return; }
    debounceRef.current = setTimeout(() => {
      const results = searchTemplates(value);
      setCards(results);
      setShowCards(results.length > 0);
      trackLanding(LANDING_EVENTS.HERO_SEARCH_QUERY, { query: value });
    }, TIMING.DEBOUNCE_MS);
  }, []);

  return (
    <div>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-300 text-lg">&#128269;</span>
        <input
          type="text"
          value={isAutoTyping ? displayedQuery : query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={hero.searchPlaceholder}
          className="landing-input w-full pl-12 pr-4 py-4 text-base rounded-xl border-2 border-sand-200 bg-white dark:bg-[#14161B] text-sand-900 placeholder:text-sand-300 focus:border-[#0E3A8C]/50 dark:focus:border-blue-400/50 focus:ring-4 focus:ring-[#0E3A8C]/10 dark:focus:ring-blue-400/10 focus:outline-none transition-all shadow-temple font-body"
          style={{ fontSize: '16px' }}
          aria-label={hero.searchPlaceholder}
        />
        {isAutoTyping && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sand-900 animate-pulse" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {showCards && cards.length > 0 && (
          <motion.div
            key="cards"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {cards.slice(0, 3).map((card, i) => (
              <TemplateCardComponent key={card.id} card={card} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Optimizer Tab ──────────────────────────────────────

function OptimizerTab() {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'typing' | 'done'>('idle');
  const [displayedResult, setDisplayedResult] = useState('');
  const [copied, setCopied] = useState(false);
  const fullResult = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleOptimize = useCallback(() => {
    const text = input.trim() || OPTIMIZER_DEMO.input;
    if (!text) return;

    if (!input.trim()) setInput(OPTIMIZER_DEMO.input);

    fullResult.current = input.trim()
      ? simulateOptimization(input)
      : OPTIMIZER_DEMO.optimized;

    setPhase('loading');
    setDisplayedResult('');
    trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_SUBMIT, { input: text });

    setTimeout(() => {
      setPhase('typing');
      const words = fullResult.current.split(/(\s+)/);
      let wordIndex = 0;

      const typeWord = () => {
        if (wordIndex < words.length) {
          setDisplayedResult((prev) => prev + words[wordIndex]);
          wordIndex++;
          timerRef.current = setTimeout(typeWord, TIMING.SSE_WORD_DELAY);
        } else {
          setPhase('done');
        }
      };

      timerRef.current = setTimeout(typeWord, 100);
    }, 800);
  }, [input]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullResult.current);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_COPY);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={hero.optimizerPlaceholder}
        rows={3}
        className="landing-input w-full px-4 py-3 text-sm rounded-xl border-2 border-sand-200 bg-white dark:bg-[#14161B] text-sand-900 placeholder:text-sand-300 focus:border-[#0E3A8C]/50 dark:focus:border-blue-400/50 focus:ring-4 focus:ring-[#0E3A8C]/10 dark:focus:ring-blue-400/10 focus:outline-none transition-all resize-none font-body mb-3"
        style={{ fontSize: '16px' }}
        disabled={phase === 'loading' || phase === 'typing'}
      />

      {(phase === 'idle' || phase === 'done') && (
        <button
          onClick={handleOptimize}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#CBA135] to-[#d4a853] hover:from-[#b8922f] hover:to-[#c9a048] dark:from-[#E9C25A] dark:to-[#CBA135] dark:hover:from-[#d4b44e] dark:hover:to-[#b8922f] transition-all shadow-sm min-h-[44px] text-sm"
        >
          {phase === 'done' ? 'Try Another' : hero.optimizeButton}
        </button>
      )}

      {phase === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-3 text-stone-500 dark:text-stone-400 text-sm">
          <Loader2 className="animate-spin" size={16} />
          <span>{hero.optimizing}</span>
        </div>
      )}

      <AnimatePresence>
        {(phase === 'typing' || phase === 'done') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="bg-stone-50 dark:bg-[#1C1F26] rounded-xl border border-stone-200 dark:border-[#2A2E38] p-4 max-h-[200px] overflow-y-auto">
              <pre className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap font-body leading-relaxed">
                {displayedResult}
                {phase === 'typing' && (
                  <span className="inline-block w-0.5 h-3.5 bg-stone-700 dark:bg-stone-300 animate-pulse ml-0.5" />
                )}
              </pre>
            </div>

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-2 mt-3">
                  {OPTIMIZER_DEMO.badges.map((badge, i) => (
                    <motion.span
                      key={badge.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    >
                      {badge.icon === 'trending' ? <TrendingUp size={12} /> : <Check size={12} />}
                      {badge.label}
                    </motion.span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors min-h-[44px]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy prompt'}
                  </button>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-1 text-xs text-[#0E3A8C] dark:text-blue-400 hover:text-[#0E3A8C]/80 dark:hover:text-blue-300 font-medium transition-colors min-h-[44px]"
                  >
                    {hero.signupNudge}
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Hero Section ─────────────────────────────────

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'optimize'>('search');

  const switchTab = useCallback((tab: 'search' | 'optimize') => {
    setActiveTab(tab);
    trackLanding(LANDING_EVENTS.HERO_TAB_SWITCH, { tab });
  }, []);

  return (
    <section
      id="hero-section"
      className="landing-hero-bg relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fdf8f0 0%, #f5efe3 100%)',
      }}
    >
      {/* Subtle geometric background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(-45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Social proof pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E3A8C]/5 dark:bg-blue-400/10 border border-[#0E3A8C]/10 dark:border-blue-400/20 mb-6"
        >
          <span className="text-[#CBA135] dark:text-[#E9C25A] text-sm">&#9889;</span>
          <span className="text-xs md:text-sm text-stone-600 dark:text-stone-300 font-medium">
            {hero.pill}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-sand-900 mb-2 leading-tight tracking-tight"
        >
          {hero.headline}
        </motion.h1>

        {/* Gradient sub-headline */}
        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#CBA135] to-[#d4a853] dark:from-[#E9C25A] dark:to-[#F5D68A] bg-clip-text text-transparent"
        >
          {hero.headlineGradient}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="font-body text-base md:text-lg text-sand-600 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed"
        >
          {hero.subtitle}
        </motion.p>

        {/* Tabbed card */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#161A22] rounded-2xl border border-sand-200 shadow-temple overflow-hidden max-w-xl mx-auto mb-8"
        >
          {/* Tab headers */}
          <div className="flex border-b border-sand-200">
            <button
              onClick={() => switchTab('search')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors min-h-[44px] ${
                activeTab === 'search'
                  ? 'text-[#0E3A8C] dark:text-blue-400 border-b-2 border-[#0E3A8C] dark:border-blue-400 bg-sand-50/50 dark:bg-white/5'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              {hero.tabSearch}
            </button>
            <button
              onClick={() => switchTab('optimize')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors min-h-[44px] ${
                activeTab === 'optimize'
                  ? 'text-[#0E3A8C] dark:text-blue-400 border-b-2 border-[#0E3A8C] dark:border-blue-400 bg-sand-50/50 dark:bg-white/5'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              {hero.tabOptimize}
            </button>
          </div>

          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'search' ? (
                <motion.div key="search" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                  <SearchTab />
                </motion.div>
              ) : (
                <motion.div key="optimize" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <OptimizerTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <GradientButton href="/auth/register" size="lg" onClick={() => trackLanding(LANDING_EVENTS.HERO_CTA_CLICK, { cta: 'primary' })}>
            {hero.ctaPrimary}
          </GradientButton>
          <GradientButton href="/download" size="lg" variant="outlined" onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK, { source: 'hero' })}>
            {hero.ctaSecondary}
          </GradientButton>
        </motion.div>

        {/* Platform Logos */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-sand-500 mb-3 font-body">{hero.platformsLabel}</p>
          <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className="text-sm font-semibold text-sand-300 hover:text-sand-800 transition-colors duration-200 cursor-default font-body"
                title={p.name}
              >
                {p.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
