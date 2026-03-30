'use client';

import { motion } from 'framer-motion';
import { Crown, Zap, Clock, MessageSquare } from 'lucide-react';
import { GradientButton } from '../shared/GradientButton';
import { COPY_V3 } from '@/lib/landing/copy-v3';

const { broadcaster } = COPY_V3;

interface MockModel {
  name: string;
  provider: string;
  color: string;
  latencyMs: number;
  tokens: number;
  score: number;
  snippet: string;
  winner?: boolean;
}

const MOCK_MODELS: MockModel[] = [
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    color: '#10a37f',
    latencyMs: 1840,
    tokens: 187,
    score: 8.5,
    snippet: 'Meet HydroSync — the water bottle that knows you better than you know yourself. Track every sip, sync with your fitness goals...',
  },
  {
    name: 'Claude Haiku',
    provider: 'Anthropic',
    color: '#d4a574',
    latencyMs: 920,
    tokens: 164,
    score: 8.7,
    snippet: 'Stay effortlessly hydrated with the smart bottle that turns water intake into a seamless part of your wellness journey...',
    winner: true,
  },
  {
    name: 'Gemini Pro',
    provider: 'Google',
    color: '#4285f4',
    latencyMs: 1560,
    tokens: 201,
    score: 8.2,
    snippet: 'Revolutionize your hydration with intelligent tracking that learns your patterns and keeps you at peak performance all day...',
  },
  {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    color: '#6366f1',
    latencyMs: 2100,
    tokens: 219,
    score: 7.9,
    snippet: 'Introducing the next generation of hydration technology — a smart bottle that monitors, tracks, and optimizes your water intake...',
  },
];

function getScoreColor(score: number) {
  if (score >= 8.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 8.0) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  return 'text-stone-400 border-stone-500/30 bg-stone-500/10';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function BroadcasterShowcase() {
  return (
    <section
      id="broadcaster-showcase"
      className="relative overflow-hidden px-4 py-20 md:py-28"
      style={{
        background: 'linear-gradient(180deg, #0E0F12 0%, #111827 50%, #0E0F12 100%)',
      }}
    >
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Broadcaster
            </span>
          </div>
          <h2
            className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {broadcaster.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-stone-400 md:text-lg">
            {broadcaster.subtitle}
          </p>
        </motion.div>

        {/* Demo area */}
        <div className="grid items-start gap-8 md:grid-cols-5">
          {/* Left — Sample prompt (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="rounded-2xl border border-amber-500/15 p-5"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.04) 0%, rgba(14,15,18,0.8) 100%)' }}
            >
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/70">
                  Your Prompt
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-stone-300">
                &ldquo;{broadcaster.samplePrompt}&rdquo;
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">
                  Broadcasting to 4 models...
                </span>
              </div>
            </div>

            {/* Connection line (desktop) */}
            <div className="hidden md:flex items-center justify-center py-4">
              <div className="h-12 w-px bg-gradient-to-b from-amber-500/40 to-transparent" />
            </div>
          </motion.div>

          {/* Right — Racing grid (3 cols) */}
          <motion.div
            className="grid gap-3 sm:grid-cols-2 md:col-span-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {MOCK_MODELS.map((model) => (
              <motion.div
                key={model.name}
                variants={cardVariants}
                className={`relative rounded-xl border p-4 transition-all duration-300 ${
                  model.winner
                    ? 'border-amber-500/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  background: model.winner
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(14,15,18,0.9) 100%)'
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Winner badge */}
                {model.winner && (
                  <div className="absolute -right-1 -top-1 flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/90 px-2 py-0.5">
                    <Crown className="h-3 w-3 text-amber-400" />
                    <span className="text-[9px] font-bold uppercase text-amber-400">Best</span>
                  </div>
                )}

                {/* Model header */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">{model.name}</span>
                    <span className="ml-1.5 text-[10px] text-stone-500">{model.provider}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: model.color }}
                    initial={{ width: '0%' }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>

                {/* Response snippet */}
                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-stone-400">
                  {model.snippet}
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(model.latencyMs / 1000).toFixed(1)}s
                    </span>
                    <span>{model.tokens} tokens</span>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getScoreColor(model.score)}`}>
                    {model.score}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <GradientButton href="/auth/register" size="lg">
            {broadcaster.cta}
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}

export default BroadcasterShowcase;
