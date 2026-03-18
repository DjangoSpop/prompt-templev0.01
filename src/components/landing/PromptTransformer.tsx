'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY } from '@/lib/landing/copy';
import { TIMING, costarStaggerContainer, slideLeft, fadeIn } from '@/lib/landing/motion';
import { connectSSE, simulateSSEStream } from '@/lib/landing/sse';
import { COSTAR_DEMOS, type COSTARResult } from '@/lib/landing/demo-data';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { EgyptianLoader } from './shared/EgyptianLoader';
import { GradientButton } from './shared/GradientButton';

type Phase = 'input' | 'loading' | 'result';

const COSTAR_KEYS = ['C', 'O', 'S', 'T', 'A', 'R'] as const;

function COSTARBlock({ letter, label, text, index }: { letter: string; label: string; text: string; index: number }) {
  return (
    <motion.div
      variants={slideLeft}
      className="flex gap-3 bg-sand-100 rounded-xl p-4 border border-sand-200 hover:-translate-y-0.5 transition-transform duration-200"
    >
      {/* Letter badge */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-pharaonic text-white flex items-center justify-center text-sm font-bold">
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-sand-600 mb-1">{label}</p>
        <p className="text-sm text-sand-800 font-body leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}

export function PromptTransformer() {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<COSTARResult | null>(null);
  const [streamingText, setStreamingText] = useState<Record<string, string>>({});
  const [streamingDone, setStreamingDone] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Show pre-seeded demo on first load
  const [showPreSeeded, setShowPreSeeded] = useState(true);
  const preSeededDemo = COSTAR_DEMOS[0]; // "plan birthday party"

  const handleTransform = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    setShowPreSeeded(false);
    setPhase('loading');
    setStreamingText({});
    setStreamingDone(false);
    trackLanding(LANDING_EVENTS.TRANSFORMER_SUBMIT, { input: text });

    // Try real API first, fall back to demo
    const demoResult = COSTAR_DEMOS.find(
      (d) => d.input.toLowerCase() === text.toLowerCase()
    ) || COSTAR_DEMOS[Math.floor(Math.random() * COSTAR_DEMOS.length)];

    const startStreaming = (data: COSTARResult) => {
      setResult(data);
      setPhase('result');

      // Stream each section's text word-by-word
      let sectionIndex = 0;

      const streamSection = () => {
        if (sectionIndex >= data.sections.length) {
          setStreamingDone(true);
          trackLanding(LANDING_EVENTS.TRANSFORMER_RESULT_VIEWED);
          return;
        }

        const section = data.sections[sectionIndex];
        const words = section.text.split(' ');
        let wordIndex = 0;

        const emitWord = () => {
          if (wordIndex <= words.length) {
            setStreamingText((prev) => ({
              ...prev,
              [section.key]: words.slice(0, wordIndex).join(' '),
            }));
            wordIndex++;

            if (wordIndex <= words.length) {
              const word = words[wordIndex - 1] || '';
              let delay = TIMING.SSE_WORD_DELAY;
              if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
                delay = TIMING.PUNCTUATION_PAUSE_PERIOD;
              } else if (word.endsWith(',') || word.endsWith(';')) {
                delay = TIMING.PUNCTUATION_PAUSE_COMMA;
              }
              setTimeout(emitWord, delay);
            } else {
              sectionIndex++;
              setTimeout(streamSection, 200);
            }
          }
        };

        emitWord();
      };

      streamSection();
    };

    // Try SSE endpoint
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/public/transform`;

      const cleanup = connectSSE(apiUrl, { input: text }, {
        onWord: () => {
          // If real API responds, we'd handle streaming here
          // For now, fall through to demo
        },
        onDone: () => {},
        onError: () => {
          // Fall back to demo data
          const fakeDemoResult: COSTARResult = {
            input: text,
            sections: demoResult.sections,
          };
          startStreaming(fakeDemoResult);
        },
      });

      cleanupRef.current = cleanup;

      // If no response in 3s, use demo
      setTimeout(() => {
        if (phase === 'loading') {
          cleanup();
          const fakeDemoResult: COSTARResult = {
            input: text,
            sections: demoResult.sections,
          };
          startStreaming(fakeDemoResult);
        }
      }, 3000);
    } catch {
      // Immediate fallback
      const fakeDemoResult: COSTARResult = {
        input: text,
        sections: demoResult.sections,
      };
      setTimeout(() => startStreaming(fakeDemoResult), 800);
    }
  }, [input, phase]);

  const handleTryAnother = useCallback(() => {
    setPhase('input');
    setInput('');
    setResult(null);
    setStreamingText({});
    setStreamingDone(false);
    if (cleanupRef.current) cleanupRef.current();
    trackLanding(LANDING_EVENTS.TRANSFORMER_TRY_ANOTHER);
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    const fullText = result.sections
      .map((s) => `[${s.key} - ${COPY.transformer.costarLabels[s.key]}]\n${s.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
  }, [result]);

  const handleShare = useCallback(() => {
    trackLanding(LANDING_EVENTS.TRANSFORMER_SHARE);
    const tweetText = encodeURIComponent(
      `I typed 3 words and @PromptTemple turned it into an expert prompt \u{1F92F} Try it \u2192 prompt-temple.com`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-sand-100 to-sand-50">
      <div className="max-w-3xl mx-auto">
        {/* Pre-seeded demo (visible before user interacts) */}
        {showPreSeeded && phase === 'input' && (
          <div className="mb-12">
            <p className="text-center text-sm text-sand-600 font-body mb-4">
              See what happened when someone typed &ldquo;{preSeededDemo.input}&rdquo;:
            </p>
            <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-temple">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-sand-600 uppercase tracking-wider">{COPY.transformer.yourInput}</span>
              </div>
              <p className="text-sand-800 font-mono text-sm mb-4 pb-4 border-b border-sand-200">
                &ldquo;{preSeededDemo.input}&rdquo;
              </p>
              <p className="text-xs font-bold text-indigo-royal uppercase tracking-wider mb-3">
                &#10024; {COPY.transformer.expertPrompt}
              </p>
              <div className="space-y-3">
                {preSeededDemo.sections.map((section) => (
                  <COSTARBlock
                    key={section.key}
                    letter={section.key}
                    label={COPY.transformer.costarLabels[section.key]}
                    text={section.text}
                    index={COSTAR_KEYS.indexOf(section.key as typeof COSTAR_KEYS[number])}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-sand-600 font-body mt-4">
              &#8595; Try your own below &#8595;
            </p>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-accent-gold text-lg">&#10022;</span>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mt-2">
            {COPY.transformer.title}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {/* INPUT PHASE */}
          {phase === 'input' && (
            <motion.div
              key="input"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-xl mx-auto"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (!input) trackLanding(LANDING_EVENTS.TRANSFORMER_INPUT);
                }}
                placeholder={COPY.transformer.inputPlaceholder}
                className="w-full px-5 py-4 text-base rounded-xl border-2 border-sand-200 bg-white text-sand-900 placeholder:text-sand-300 focus:border-indigo-royal/50 focus:ring-4 focus:ring-indigo-royal/10 focus:outline-none font-body mb-4"
                style={{ fontSize: '16px' }}
                onKeyDown={(e) => e.key === 'Enter' && handleTransform()}
                aria-label="Enter a short phrase to transform"
              />
              <div className="flex justify-center">
                <GradientButton onClick={handleTransform} size="md">
                  &#10024; {COPY.transformer.submitButton}
                </GradientButton>
              </div>
              {/* Suggestions */}
              <p className="text-center text-xs text-sand-600 mt-4 font-body">
                Try: {COPY.transformer.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-indigo-royal hover:underline mx-1 min-h-[44px] inline-flex items-center"
                  >
                    &ldquo;{s}&rdquo;
                  </button>
                ))}
              </p>
            </motion.div>
          )}

          {/* LOADING PHASE */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="py-12"
            >
              <EgyptianLoader size="md" />
            </motion.div>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && result && (
            <motion.div
              key="result"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              ref={resultRef}
            >
              <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-temple">
                {/* Input display */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-sand-600 uppercase tracking-wider">
                    {COPY.transformer.yourInput}
                  </span>
                </div>
                <p className="text-sand-800 font-mono text-sm mb-4 pb-4 border-b border-sand-200">
                  &ldquo;{result.input}&rdquo;
                </p>

                {/* Expert prompt label */}
                <p className="text-xs font-bold text-indigo-royal uppercase tracking-wider mb-3">
                  &#10024; {COPY.transformer.expertPrompt}
                </p>

                {/* CO-STAR blocks */}
                <motion.div
                  variants={costarStaggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                  aria-live="polite"
                >
                  {result.sections.map((section, i) => (
                    <COSTARBlock
                      key={section.key}
                      letter={section.key}
                      label={COPY.transformer.costarLabels[section.key]}
                      text={streamingText[section.key] || ''}
                      index={i}
                    />
                  ))}
                </motion.div>

                {/* Action buttons */}
                <AnimatePresence>
                  {streamingDone && (
                    <motion.div
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-sand-200"
                    >
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-sand-800 hover:border-indigo-royal/30 hover:text-indigo-royal transition-colors min-h-[44px]"
                      >
                        {COPY.transformer.actions.copy}
                      </button>
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-sand-800 hover:border-accent-gold/40 hover:text-accent-gold transition-colors min-h-[44px]"
                      >
                        &#128248; {COPY.transformer.actions.share}
                      </button>
                      <button
                        onClick={handleTryAnother}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-sand-800 hover:border-indigo-royal/30 hover:text-indigo-royal transition-colors min-h-[44px]"
                      >
                        &#128260; {COPY.transformer.actions.tryAnother}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Branded footer */}
                <div className="mt-6 pt-4 border-t border-sand-200 flex items-center justify-between">
                  <p className="text-xs text-sand-300 font-body">
                    &#127963;&#65039; {COPY.transformer.brandedFooter}
                  </p>
                  <p className="text-xs text-sand-300 font-body">
                    {COPY.transformer.brandedTagline}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
