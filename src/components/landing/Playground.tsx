'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY_V1 as COPY } from '@/lib/landing/copy';
import { fadeIn } from '@/lib/landing/motion';
import { connectSSE, simulateSSEStream } from '@/lib/landing/sse';
import { ENHANCEMENT_DEMOS } from '@/lib/landing/demo-data';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { EgyptianLoader } from './shared/EgyptianLoader';
import { GradientButton } from './shared/GradientButton';

type Phase = 'idle' | 'loading' | 'streaming' | 'done';

export function Playground() {
  const [input, setInput] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [enhanceCount, setEnhanceCount] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleEnhance = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const isFirst = enhanceCount === 0;
    const newCount = enhanceCount + 1;

    if (newCount > 3) {
      trackLanding(LANDING_EVENTS.PLAYGROUND_PAYWALL_HIT);
      return;
    }

    setEnhanceCount(newCount);
    setPhase('loading');
    setEnhanced('');

    if (isFirst) {
      trackLanding(LANDING_EVENTS.PLAYGROUND_ENHANCE, { input: text });
    } else {
      trackLanding(LANDING_EVENTS.PLAYGROUND_ENHANCE_FURTHER, { iteration: newCount });
    }

    // Find a demo that somewhat matches, or pick random
    const demo = ENHANCEMENT_DEMOS.find((d) =>
      text.toLowerCase().includes(d.input.toLowerCase().split(' ')[0])
    ) || ENHANCEMENT_DEMOS[Math.floor(Math.random() * ENHANCEMENT_DEMOS.length)];

    const startStreaming = (enhancedText: string) => {
      setPhase('streaming');

      const cleanup = simulateSSEStream(
        enhancedText,
        (word) => {
          setEnhanced((prev) => (prev ? `${prev} ${word}` : word));
        },
        () => {
          setPhase('done');
        }
      );

      cleanupRef.current = cleanup;
    };

    // Try real API, fall back to demo after timeout
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/public/enhance`;
      let responded = false;

      const cleanup = connectSSE(apiUrl, { input: text }, {
        onWord: (word) => {
          if (!responded) {
            responded = true;
            setPhase('streaming');
          }
          setEnhanced((prev) => (prev ? `${prev} ${word}` : word));
        },
        onDone: () => {
          if (responded) setPhase('done');
        },
        onError: () => {
          if (!responded) {
            setTimeout(() => startStreaming(demo.enhanced), 500);
          }
        },
      });

      cleanupRef.current = cleanup;

      // Fallback timeout
      setTimeout(() => {
        if (!responded) {
          cleanup();
          startStreaming(demo.enhanced);
        }
      }, 3000);
    } catch {
      setTimeout(() => startStreaming(demo.enhanced), 800);
    }
  }, [input, enhanceCount]);

  const handleEnhanceFurther = useCallback(() => {
    setInput(enhanced);
    setEnhanced('');
    // Trigger enhance again with current result as new input
    setTimeout(() => {
      const text = enhanced.trim();
      if (!text) return;

      const newCount = enhanceCount + 1;
      if (newCount > 3) {
        trackLanding(LANDING_EVENTS.PLAYGROUND_PAYWALL_HIT);
        return;
      }

      setEnhanceCount(newCount);
      setPhase('loading');
      setEnhanced('');
      trackLanding(LANDING_EVENTS.PLAYGROUND_ENHANCE_FURTHER, { iteration: newCount });

      const demo = ENHANCEMENT_DEMOS[Math.floor(Math.random() * ENHANCEMENT_DEMOS.length)];

      setTimeout(() => {
        setPhase('streaming');
        const cleanup = simulateSSEStream(
          demo.enhanced,
          (word) => setEnhanced((prev) => (prev ? `${prev} ${word}` : word)),
          () => setPhase('done')
        );
        cleanupRef.current = cleanup;
      }, 800);
    }, 100);
  }, [enhanced, enhanceCount]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(enhanced);
    trackLanding(LANDING_EVENTS.PLAYGROUND_SCRIBE_COPY);
  }, [enhanced]);

  const handleShare = useCallback(() => {
    trackLanding(LANDING_EVENTS.PLAYGROUND_SHARE);
    const tweetText = encodeURIComponent(
      `Watch AI turn my rough idea into an expert prompt \u{1F92F} Try it free \u2192 prompt-temple.com`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  }, []);

  // Auto-scroll result as words stream
  useEffect(() => {
    if (phase === 'streaming' && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [enhanced, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const atLimit = enhanceCount >= 3 && phase === 'done';

  return (
    <section className="py-16 md:py-24 px-4 bg-sand-50">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mb-2">
            {COPY.playground.title}
          </h2>
          <p className="font-body text-sand-600 text-base md:text-lg">
            {COPY.playground.subtitle}
          </p>
        </div>

        {/* Input area */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-temple">
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-600 mb-2">
            Your idea
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (!input) trackLanding(LANDING_EVENTS.PLAYGROUND_INPUT);
            }}
            placeholder={COPY.playground.inputPlaceholder}
            className="w-full px-4 py-3 text-base rounded-xl border border-sand-200 bg-sand-50 text-sand-900 placeholder:text-sand-300 focus:border-indigo-royal/50 focus:ring-4 focus:ring-indigo-royal/10 focus:outline-none resize-none font-body min-h-[100px] max-h-[200px]"
            style={{ fontSize: '16px' }}
            rows={3}
            aria-label="Enter your prompt idea"
          />

          {/* Submit button */}
          <div className="flex justify-center mt-4">
            <GradientButton
              onClick={handleEnhance}
              size="md"
              className={atLimit ? 'opacity-50 cursor-not-allowed' : ''}
            >
              &#10024; {phase === 'done' && enhanceCount < 3 ? COPY.playground.enhanceFurther : COPY.playground.submitButton}
            </GradientButton>
          </div>

          {/* Loading state */}
          <AnimatePresence>
            {phase === 'loading' && (
              <motion.div
                key="loader"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="py-8"
              >
                <EgyptianLoader size="sm" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced result */}
          <AnimatePresence>
            {(phase === 'streaming' || phase === 'done') && enhanced && (
              <motion.div
                key="result"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="mt-6"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-royal mb-2">
                  &#10024; {COPY.playground.enhancedPrompt}
                </label>
                <div
                  ref={resultRef}
                  className="px-4 py-3 rounded-xl bg-sand-50 border border-sand-200 text-sand-800 font-body text-sm leading-relaxed max-h-[300px] overflow-y-auto"
                  aria-live="polite"
                >
                  {enhanced}
                  {phase === 'streaming' && (
                    <span className="inline-block w-0.5 h-4 bg-indigo-royal ml-0.5 animate-pulse" />
                  )}
                </div>

                {/* Action buttons */}
                {phase === 'done' && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {enhanceCount < 3 && (
                      <button
                        onClick={handleEnhanceFurther}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-indigo-royal hover:border-indigo-royal/30 transition-colors min-h-[44px]"
                      >
                        &#128260; {COPY.playground.enhanceFurther}
                      </button>
                    )}
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-sand-800 hover:border-accent-gold/40 transition-colors min-h-[44px]"
                    >
                      &#9889; {COPY.playground.copyToScribe}
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-sand-200 text-sand-800 hover:border-accent-gold/40 transition-colors min-h-[44px]"
                    >
                      &#128248; {COPY.playground.shareResult}
                    </button>
                  </div>
                )}

                {/* Enhancement counter */}
                <p className="text-xs text-sand-600 mt-3 font-body">
                  {COPY.playground.counterTemplate.replace('{n}', String(enhanceCount))}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Soft paywall */}
          {atLimit && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mt-6 pt-6 border-t border-sand-200 text-center"
            >
              <p className="font-body text-sand-600 text-sm mb-4">
                {COPY.playground.paywall}
              </p>
              <GradientButton href="/auth/register" size="md">
                {COPY.playground.paywallCta}
              </GradientButton>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
