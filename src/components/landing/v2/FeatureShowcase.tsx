'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Search, FileText, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { COPY } from '@/lib/landing/copy';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { useAutoRotate } from './hooks/useAutoRotate';
import { useReducedMotion } from './hooks/useReducedMotion';

const { featureShowcase } = COPY;

const TAB_ICONS = [Wand2, Search, FileText, Globe];

// ── Demo Components ────────────────────────────────────

function PromptUpgradeDemo() {
  const [phase, setPhase] = useState<'before' | 'after'>('before');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase('after'), 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
          What you type
        </p>
        <div
          className={`demo-before bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-lg p-3 text-sm text-stone-600 dark:text-stone-400 transition-opacity duration-300 ${
            phase === 'after' ? 'opacity-50' : ''
          }`}
        >
          &ldquo;Help me write a cold email to a potential client&rdquo;
        </div>
      </div>

      <div className="flex justify-center text-[#CBA135] dark:text-[#E9C25A]">
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          &#8595;
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === 'after' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
              What Prompt Temple creates
            </p>
            <div className="demo-after bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800/40 rounded-lg p-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed max-h-[140px] overflow-y-auto">
              <strong>You are a B2B sales copywriter</strong> with 10 years of experience...
              <br /><br />
              <strong>Task:</strong> Write a personalized cold email with:
              <br />1. Subject line that creates curiosity
              <br />2. Opening referencing their business
              <br />3. Pain point → solution connection
              <br />4. Social proof with specific metrics
              <br />5. Low-friction CTA
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchDemo() {
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setShowResults(true), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const mockResults = [
    { title: 'Cold Email Opener', category: 'Marketing', rating: 4.8 },
    { title: 'Sales Follow-Up', category: 'Business', rating: 4.9 },
    { title: 'LinkedIn Outreach', category: 'Marketing', rating: 4.7 },
  ];

  return (
    <div>
      <div className="bg-white dark:bg-[#14161B] rounded-lg border border-sand-200 px-4 py-3 mb-4 flex items-center gap-2">
        <Search size={14} className="text-sand-300" />
        <span className="text-sm text-sand-900">cold email</span>
        <span className="w-0.5 h-4 bg-[#0E3A8C] dark:bg-blue-400 animate-pulse" />
      </div>

      <AnimatePresence>
        {showResults && (
          <div className="space-y-2">
            {mockResults.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-white dark:bg-[#14161B] rounded-lg border border-sand-200 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-sand-900">{r.title}</p>
                  <p className="text-xs text-sand-500 dark:text-stone-500">{r.category}</p>
                </div>
                <span className="text-xs text-[#CBA135] dark:text-[#E9C25A]">&#9733; {r.rating}</span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateDemo() {
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-[#14161B] rounded-lg border border-sand-200 p-3">
        <p className="text-sm font-semibold text-sand-900 mb-1">Marketing Email Writer</p>
        <p className="text-xs text-sand-500 dark:text-stone-500">Fill in the blanks below:</p>
      </div>

      <AnimatePresence>
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="bg-white dark:bg-[#14161B] rounded-lg border border-sand-200 p-2 px-3">
              <label className="text-xs text-sand-500 dark:text-stone-500 block mb-1">Product name</label>
              <p className="text-sm text-sand-900">Prompt Temple</p>
            </div>
            <div className="bg-white dark:bg-[#14161B] rounded-lg border border-sand-200 p-2 px-3">
              <label className="text-xs text-sand-500 dark:text-stone-500 block mb-1">Target audience</label>
              <p className="text-sm text-sand-900">AI power users</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="demo-after bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800/40 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Generated prompt:</p>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              &ldquo;Write a marketing email for Prompt Temple targeting AI power users...&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExtensionDemo() {
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div>
      <div className="rounded-lg border border-sand-200 overflow-hidden bg-white dark:bg-[#14161B]">
        {/* Browser toolbar */}
        <div className="bg-stone-100 dark:bg-[#1C1F26] px-3 py-2 flex items-center gap-2 border-b border-sand-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white dark:bg-[#14161B] rounded px-3 py-1 text-xs text-stone-500 dark:text-stone-400">
            chat.openai.com
          </div>
        </div>

        {/* Chat area */}
        <div className="p-4 min-h-[120px] relative">
          <div className="bg-stone-50 dark:bg-[#1C1F26] rounded-lg p-3 mb-2">
            <p className="text-xs text-stone-500 dark:text-stone-400">Type your message...</p>
          </div>

          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-[#CBA135] to-[#d4a853] dark:from-[#E9C25A] dark:to-[#CBA135] flex items-center justify-center text-white text-sm shadow-sm cursor-pointer"
              >
                &#9889;
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0E3A8C]/5 dark:bg-blue-400/10 border border-[#0E3A8C]/20 dark:border-blue-400/20 rounded-lg p-3 mt-2"
              >
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  &#10003; Prompt injected directly into ChatGPT
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const DEMOS = [PromptUpgradeDemo, SearchDemo, TemplateDemo, ExtensionDemo];

// ── Main Component ─────────────────────────────────────

export function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const sectionTracked = useRef(false);

  useAutoRotate(activeTab, setActiveTab, 4, 5000, isHovered || reducedMotion);

  const switchTab = useCallback((i: number) => {
    setActiveTab(i);
    trackLanding(LANDING_EVENTS.FEATURE_TAB_SWITCH, { tab: featureShowcase.tabs[i].title });
  }, []);

  const ActiveDemo = DEMOS[activeTab];

  return (
    <motion.section
      className="py-16 md:py-24 px-4 bg-sand-50"
      onViewportEnter={() => {
        if (!sectionTracked.current) {
          trackLanding(LANDING_EVENTS.FEATURE_SECTION_VIEWED);
          sectionTracked.current = true;
        }
      }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 text-center mb-12">
          {featureShowcase.title}
        </h2>

        <div
          className="flex flex-col md:flex-row gap-6 md:gap-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tab list */}
          <div className="md:w-[35%]">
            {/* Mobile: horizontal scroll pills */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {featureShowcase.tabs.map((tab, i) => {
                const Icon = TAB_ICONS[i];
                return (
                  <button
                    key={i}
                    onClick={() => switchTab(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all min-h-[44px] shrink-0 ${
                      activeTab === i
                        ? 'bg-[#0E3A8C] dark:bg-blue-500 text-white'
                        : 'bg-white dark:bg-[#1C1F26] text-sand-600 border border-sand-200'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.title}
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical tabs */}
            <div className="hidden md:flex flex-col gap-2">
              {featureShowcase.tabs.map((tab, i) => {
                const Icon = TAB_ICONS[i];
                return (
                  <button
                    key={i}
                    onClick={() => switchTab(i)}
                    className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all min-h-[44px] ${
                      activeTab === i
                        ? 'bg-white dark:bg-[#161A22] border-l-4 border-[#CBA135] dark:border-[#E9C25A] shadow-sm'
                        : 'hover:bg-sand-100 dark:hover:bg-[#1C1F26] border-l-4 border-transparent'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`shrink-0 mt-0.5 ${
                        activeTab === i ? 'text-[#CBA135] dark:text-[#E9C25A]' : 'text-sand-300 dark:text-stone-600'
                      }`}
                    />
                    <div>
                      <p className={`font-semibold text-sm ${activeTab === i ? 'text-sand-900' : 'text-sand-600'}`}>
                        {tab.title}
                      </p>
                      <p className="text-xs text-sand-500 dark:text-stone-500 mt-0.5">{tab.short}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo panel */}
          <div className="md:w-[65%]">
            <div className="bg-sand-100 dark:bg-[#14161B] rounded-2xl p-5 md:p-6 border border-sand-200 min-h-[300px]">
              <p className="text-sm text-sand-600 mb-5">
                {featureShowcase.tabs[activeTab].description}
              </p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <ActiveDemo />
                </motion.div>
              </AnimatePresence>

              {activeTab === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4">
                  <Link
                    href="/download"
                    onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK, { source: 'feature_showcase' })}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0E3A8C] dark:text-blue-400 hover:text-[#0E3A8C]/80 dark:hover:text-blue-300 transition-colors min-h-[44px]"
                  >
                    {featureShowcase.extensionCta}
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => switchTab(i)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Feature tab ${i + 1}`}
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      activeTab === i
                        ? 'bg-[#0E3A8C] dark:bg-blue-400 w-6'
                        : 'bg-sand-300 dark:bg-stone-600 w-2'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default FeatureShowcase;
