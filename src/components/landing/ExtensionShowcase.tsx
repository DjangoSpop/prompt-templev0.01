'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY } from '@/lib/landing/copy';
import { fadeIn } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { GradientButton } from './shared/GradientButton';

const FRAME_DURATION = 3000; // 3s per frame

function Frame1() {
  return (
    <div className="bg-sand-100 rounded-xl p-6 border border-sand-200 h-full flex flex-col">
      {/* Mock chat header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-200">
        <div className="w-3 h-3 rounded-full bg-red-300" />
        <div className="w-3 h-3 rounded-full bg-yellow-300" />
        <div className="w-3 h-3 rounded-full bg-green-300" />
        <span className="ml-2 text-xs text-sand-600 font-mono">AI Chat</span>
      </div>
      {/* Empty chat area */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sand-300 text-sm font-body">Start a conversation...</p>
      </div>
      {/* Empty input */}
      <div className="mt-4 px-4 py-3 rounded-lg border border-sand-200 bg-white text-sand-300 text-sm">
        Type a message...
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-sand-100 rounded-xl p-6 border border-sand-200 h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-200">
        <div className="w-3 h-3 rounded-full bg-red-300" />
        <div className="w-3 h-3 rounded-full bg-yellow-300" />
        <div className="w-3 h-3 rounded-full bg-green-300" />
        <span className="ml-2 text-xs text-sand-600 font-mono">AI Chat</span>
      </div>
      <div className="flex-1" />
      <div className="mt-4 px-4 py-3 rounded-lg border border-sand-200 bg-white text-sand-300 text-sm">
        Type a message...
      </div>
      {/* Scribe icon appears */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
        className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-pharaonic text-white flex items-center justify-center text-sm font-bold shadow-pyramid"
      >
        &#9889;
      </motion.div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-sand-100 rounded-xl p-6 border border-sand-200 h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-200">
        <div className="w-3 h-3 rounded-full bg-red-300" />
        <div className="w-3 h-3 rounded-full bg-yellow-300" />
        <div className="w-3 h-3 rounded-full bg-green-300" />
      </div>
      <div className="flex flex-1 gap-4">
        <div className="flex-1" />
        {/* Prompt panel slides in */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="w-48 bg-white rounded-lg border border-sand-200 p-3 shadow-temple"
        >
          <p className="text-xs font-bold text-indigo-royal mb-2">Your Prompts</p>
          {['Cold Email Opener', 'Blog Post Outline', 'Code Review'].map((item) => (
            <div
              key={item}
              className="px-2 py-1.5 text-xs text-sand-800 hover:bg-sand-50 rounded cursor-pointer mb-1"
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Frame4() {
  const [typed, setTyped] = useState('');
  const text = 'You are an expert email marketer. Write a compelling cold email...';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setTyped(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-sand-100 rounded-xl p-6 border border-sand-200 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-200">
        <div className="w-3 h-3 rounded-full bg-red-300" />
        <div className="w-3 h-3 rounded-full bg-yellow-300" />
        <div className="w-3 h-3 rounded-full bg-green-300" />
      </div>
      <div className="flex-1" />
      <div className="mt-4 px-4 py-3 rounded-lg border border-indigo-royal/30 bg-white text-sand-800 text-sm font-body">
        {typed}
        <span className="inline-block w-0.5 h-4 bg-indigo-royal ml-0.5 animate-pulse" />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-sand-100 rounded-xl p-6 border border-sand-200 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-200">
        <div className="w-3 h-3 rounded-full bg-red-300" />
        <div className="w-3 h-3 rounded-full bg-yellow-300" />
        <div className="w-3 h-3 rounded-full bg-green-300" />
      </div>
      {/* Chat response bubble */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        <div className="bg-sand-200/50 rounded-lg p-3 max-w-[80%]">
          <p className="text-xs text-sand-800">You are an expert email marketer...</p>
        </div>
        <div className="bg-indigo-royal/10 rounded-lg p-3 max-w-[80%] self-end">
          <p className="text-xs text-sand-800">Here&apos;s your cold email: Subject: Quick question about [Company]&apos;s growth strategy...</p>
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm font-semibold text-accent-gold mt-4"
      >
        Better results. Zero effort. &#10024;
      </motion.p>
    </div>
  );
}

const FRAMES = [Frame1, Frame2, Frame3, Frame4, Frame5];

export function ExtensionShowcase() {
  const [activeFrame, setActiveFrame] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-advance frames
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % FRAMES.length);
    }, FRAME_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goToFrame = useCallback((index: number) => {
    setActiveFrame(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % FRAMES.length);
    }, FRAME_DURATION);
  }, []);

  // Track section view
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackLanding(LANDING_EVENTS.EXTENSION_SHOWCASE_VIEWED);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const ActiveFrameComponent = FRAMES[activeFrame];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-gradient-to-b from-sand-50 to-sand-100">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mb-2">
            {COPY.extension.title}
          </h2>
          <p className="font-body text-sand-600 text-base md:text-lg">
            {COPY.extension.subtitle}
          </p>
        </div>

        {/* Frame display */}
        <div className="relative h-[320px] md:h-[360px] mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFrame}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0"
            >
              <ActiveFrameComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Frame label */}
        <p className="text-center text-sm text-sand-600 font-body mb-4">
          {COPY.extension.frames[activeFrame]}
        </p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {FRAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToFrame(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                i === activeFrame ? '' : ''
              }`}
              aria-label={`Go to frame ${i + 1}`}
            >
              <span className={`block w-2.5 h-2.5 rounded-full transition-all ${
                i === activeFrame ? 'bg-indigo-royal scale-125' : 'bg-sand-300 hover:bg-sand-600'
              }`} />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <GradientButton
            href="https://chrome.google.com/webstore"
            onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK)}
          >
            {COPY.extension.cta}
          </GradientButton>
        </div>
      </div>
    </section>
  );
}
