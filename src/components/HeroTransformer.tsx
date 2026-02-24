'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Wand2, RotateCcw, Crown } from 'lucide-react';
import Link from 'next/link';

const DEMO_TRANSFORMATIONS = [
  {
    bad: 'Write me a cover letter for a job.',
    good: `Act as a senior HR professional and hiring manager with 15+ years of experience at Fortune 500 companies. Write a compelling, tailored cover letter for a Senior Product Manager role at a Series-B SaaS startup. The tone should be confident, data-driven, and show genuine product intuition. Structure: hook (1 sentence), impact story with metrics, alignment with company mission, forward-looking CTA. Max 280 words.`,
    improvements: ['Role Injection', 'Constraints Set', 'Structure Defined', 'Target Context'],
    beforeScore: 1.8,
    afterScore: 9.3,
  },
  {
    bad: 'Explain machine learning to me.',
    good: `You are an expert ML educator who has taught Stanford CS229. Explain machine learning to a software engineer with 5 years of web development experience. Use an analogy they'll instantly get (no math-heavy notation). Cover: what it is, why it matters, 3 real-world examples they've used today without knowing, and 1 project they could build this weekend. Keep it under 300 words. End with one resource to go deeper.`,
    improvements: ['Persona Expert', 'Audience Defined', 'Analogy Required', 'Scoped Output'],
    beforeScore: 1.5,
    afterScore: 9.6,
  },
  {
    bad: 'Debug my code.',
    good: `You are a principal software engineer specializing in debugging and code review. I will share code with a bug. Your analysis must follow this exact format: 1) Bug identification (file + line), 2) Root cause in plain English, 3) The exact fix with code snippet, 4) How to prevent this class of bug in future (add test suggestion). Be direct, no filler. Assume I'm a senior engineer — skip obvious explanations.`,
    improvements: ['Role Injection', 'Output Format', 'Chain-of-Thought', 'Tone Calibrated'],
    beforeScore: 1.2,
    afterScore: 9.1,
  },
];

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
  color: ['#F5C518', '#C9A227', '#F0E6D3', '#A78BFA', '#60A5FA'][Math.floor(Math.random() * 5)],
}));

export function HeroTransformer() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'generating' | 'complete'>('idle');
  const [inputValue, setInputValue] = useState(DEMO_TRANSFORMATIONS[0].bad);
  const [interacted, setInteracted] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);

  const demo = DEMO_TRANSFORMATIONS[demoIndex];

  const runTransform = useCallback(async (promptText: string = demo.good) => {
    if (animating.current) return;
    animating.current = true;
    setIsTransforming(true);
    setPhase('analyzing');
    setOutputText('');

    await new Promise(r => setTimeout(r, 900));
    setPhase('generating');

    // Typewriter effect
    const chars = promptText.split('');
    let i = 0;
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        i += Math.floor(Math.random() * 5) + 3;
        setOutputText(chars.slice(0, Math.min(i, chars.length)).join(''));
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
        if (i >= chars.length) {
          clearInterval(interval);
          setTimeout(() => {
            setOutputText(promptText);
            setPhase('complete');
            setIsTransforming(false);
            animating.current = false;
            resolve();
          }, 200);
        }
      }, 20);
    });
  }, [demo.good]);

  // Auto-run demo on mount
  useEffect(() => {
    const timer = setTimeout(() => runTransform(), 1200);
    return () => {
      clearTimeout(timer);
      animating.current = false;
    };
  }, [demoIndex]); // eslint-disable-line

  function handleUserTransform() {
    setInteracted(true);
    setPhase('idle');
    animating.current = false;
    if (inputValue.trim() && inputValue !== demo.bad) {
      // User typed something custom - just demo the normal transformation
      runTransform(demo.good);
    } else {
      runTransform();
    }
  }

  function nextDemo() {
    setDemoIndex(i => (i + 1) % DEMO_TRANSFORMATIONS.length);
    setPhase('idle');
    setOutputText('');
    animating.current = false;
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden min-h-screen flex items-center">
      {/* Particle field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.15, 0.6, 0.15],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Radial gold glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(245,197,24,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(245,197,24,0.3)] bg-[rgba(245,197,24,0.06)] text-[#F5C518] text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI Prompt Optimizer — No Signup Required
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold text-[#F0E6D3] leading-tight mb-5"
            style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 60px rgba(245,197,24,0.15)' }}
          >
            Transform Your Prompts.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #F5C518 0%, #C9A227 50%, #F0E6D3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Unleash Pharaoh‑Level AI.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#9CA3AF] max-w-2xl mx-auto">
            Watch bad prompts become masterpieces in real-time. Average improvement:{' '}
            <span className="text-[#F5C518] font-semibold">1.8 → 9.4</span> out of 10.
          </p>
        </motion.div>

        {/* Live Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(13,13,13,0.85)',
            border: '1px solid rgba(245,197,24,0.2)',
            boxShadow: '0 0 80px rgba(245,197,24,0.08), 0 40px 80px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Demo tabs */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(245,197,24,0.1)]">
            <div className="flex items-center gap-2">
              {DEMO_TRANSFORMATIONS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setDemoIndex(i); setPhase('idle'); setOutputText(''); animating.current = false; }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    i === demoIndex
                      ? 'text-black'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                  style={
                    i === demoIndex
                      ? { background: '#F5C518' }
                      : { background: 'transparent' }
                  }
                >
                  {['Cover Letter', 'ML Explainer', 'Debug Code'][i]}
                </button>
              ))}
            </div>
            <button
              onClick={nextDemo}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Try another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[340px]">
            {/* Input pane */}
            <div className="p-6 border-r border-[rgba(245,197,24,0.07)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold">Your Prompt</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ★ {demo.beforeScore}/10
                </div>
              </div>
              <textarea
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setInteracted(true); }}
                placeholder="Try typing your own prompt..."
                onClick={() => setInteracted(true)}
                className="w-full h-40 bg-transparent resize-none text-sm text-[#9CA3AF] font-mono leading-relaxed focus:outline-none placeholder-[#4B5563]"
                style={{ caretColor: '#F5C518' }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUserTransform}
                disabled={isTransforming}
                className="mt-4 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: isTransforming
                    ? 'rgba(245,197,24,0.15)'
                    : 'linear-gradient(135deg, #F5C518 0%, #C9A227 100%)',
                  color: isTransforming ? '#F5C518' : '#000',
                  boxShadow: isTransforming ? 'none' : '0 4px 20px rgba(245,197,24,0.35)',
                }}
              >
                {isTransforming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    {phase === 'analyzing' ? 'Analyzing…' : 'Generating…'}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Transform Your First Prompt — Free
                  </>
                )}
              </motion.button>
            </div>

            {/* Output pane */}
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: '#F5C518' }}
                >
                  Temple-Grade Output
                </span>
                <AnimatePresence>
                  {phase === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
                    >
                      ★ {demo.afterScore}/10 Pharaoh
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                ref={outputRef}
                className="h-40 overflow-y-auto text-sm font-mono leading-relaxed"
                style={{ color: '#E5E7EB', scrollbarWidth: 'none' }}
              >
                {outputText ? (
                  <>
                    {outputText}
                    {isTransforming && (
                      <span className="inline-block w-0.5 h-4 bg-[#F5C518] ml-0.5 animate-pulse" />
                    )}
                  </>
                ) : (
                  <div className="space-y-2 opacity-40">
                    {[70, 90, 55, 80, 65].map((w, i) => (
                      <div key={i} className="h-3 rounded-full bg-[rgba(245,197,24,0.15)]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Improvement tags */}
              <AnimatePresence>
                {phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex flex-wrap gap-1.5"
                  >
                    {demo.improvements.map((imp, i) => (
                      <motion.span
                        key={imp}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: '#F5C518',
                          background: 'rgba(245,197,24,0.1)',
                          border: '1px solid rgba(245,197,24,0.25)',
                        }}
                      >
                        +{imp}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-base text-black flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #F5C518 0%, #C9A227 100%)',
                boxShadow: '0 8px 30px rgba(245,197,24,0.4)',
              }}
            >
              <Crown className="w-5 h-5" />
              Start Free — No Card Needed
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/prompt-library">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-semibold text-base text-[#F0E6D3] flex items-center gap-2"
              style={{ background: 'rgba(240,230,211,0.06)', border: '1px solid rgba(240,230,211,0.15)' }}
            >
              Browse Temple Library
            </motion.button>
          </Link>
        </motion.div>

        {/* Social proof micro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-[#6B7280] mt-5"
        >
          Used by 47,000+ AI builders · No credit card · 3 free optimizations daily
        </motion.p>
      </div>
    </section>
  );
}
