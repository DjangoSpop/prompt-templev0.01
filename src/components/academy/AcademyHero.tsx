/**
 * AcademyHero Component
 *
 * Landing page hero with hook, stats, and Prompt IQ Test CTA
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, TrendingUp, Users, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { PromptIQTestModal } from '@/components/academy/PromptIQTestModal';
import Eyehorus from '@/components/pharaonic/Eyehorus';
import { useAcademyStore } from '@/lib/stores/academyStore';

export function AcademyHero() {
  const [animatedCount, setAnimatedCount] = useState(2500);
  const [iqTestOpen, setIqTestOpen] = useState(false);
  const { totalXPEarned, completedModules, promptIQScore, promptIQCompleted } = useAcademyStore();

  // Animate the "people leveled up" counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedCount((prev) => {
        const increment = Math.floor(Math.random() * 3) + 1;
        return prev + increment;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const hasProgress = completedModules.length > 0 || promptIQCompleted;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0E0F12 0%, #131620 40%, #1B2B6B 80%, #0E0F12 100%)',
      }}
    >
      {/* Gold hieroglyphic dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Gold top line — temple threshold */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, #d4af37 30%, #ffe066 50%, #d4af37 70%, transparent 95%)',
        }}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* ── Eye of Horus Centerpiece ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6 flex justify-center"
          >
            <div
              className="relative flex items-center justify-center"
              style={{ filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))' }}
            >
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 120,
                  height: 120,
                  background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                }}
              />
              <Eyehorus
                size={80}
                variant="hero"
                glow={true}
                glowIntensity="high"
                animated={true}
                speedMultiplier={1.5}
                showLabel={false}
              />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-2 mb-6 flex-wrap"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-200">
              <Sparkles className="w-4 h-4" />
              <span>Free Interactive Course</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              27 Modules · 5 Courses · Certificate
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-center mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-white">Master Prompt Engineering</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              From Zero to Expert
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-center text-stone-300 mb-12 max-w-3xl mx-auto"
          >
            Learn the frameworks, techniques, and strategies that top AI practitioners use to get 300-500% better results from ChatGPT, Claude, and other AI tools.
          </motion.p>

          {/* ── Your Progress (only if user has started) ── */}
          {hasProgress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-10 mx-auto max-w-2xl rounded-2xl border border-amber-500/20 p-5"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(14,15,18,0.8) 100%)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Your Progress
                </span>
                <span className="text-xs text-stone-400">
                  {completedModules.length}/27 modules
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-white/5 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((completedModules.length / 27) * 100)}%`,
                    background: 'linear-gradient(90deg, #d4af37, #ffe066)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-300 font-semibold">{totalXPEarned}</span> XP earned
                </span>
                {promptIQCompleted && (
                  <span>Prompt IQ: <span className="text-amber-300 font-semibold">{promptIQScore}</span></span>
                )}
                {completedModules.length >= 27 && (
                  <a href="/academy/completion" className="text-emerald-400 font-semibold hover:underline">
                    Claim Certificate →
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
          >
            <div className="rounded-xl border border-amber-500/15 bg-white/[0.02] backdrop-blur-sm p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-amber-300 mb-2">87%</div>
              <p className="text-sm text-stone-400">
                of AI users waste 3+ hours weekly on bad prompts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/15 bg-white/[0.02] backdrop-blur-sm p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-300 mb-2">300-500%</div>
              <p className="text-sm text-stone-400">
                productivity gains with systematic prompting
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/15 bg-white/[0.02] backdrop-blur-sm p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-300 mb-2">{animatedCount.toLocaleString()}+</div>
              <p className="text-sm text-stone-400">
                learners leveled up this month
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Button
              size="lg"
              className="font-bold text-[#0E0F12] px-8 py-6 text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #ffe066, #d4af37, #CBA135)' }}
              onClick={() => {
                document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              {hasProgress ? 'Continue Learning' : 'Start Learning Free'}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-amber-500/30 hover:border-amber-500/50 px-8 py-6 text-lg text-amber-200 hover:bg-amber-500/10 transition-all duration-300"
              onClick={() => setIqTestOpen(true)}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {promptIQCompleted ? `Retake IQ Test (${promptIQScore})` : 'Take Prompt IQ Test'}
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-sm text-stone-400">
              <Users className="w-4 h-4 text-amber-400" />
              <span>
                Join <span className="text-amber-300 font-semibold">10,000+</span> prompt engineers worldwide
              </span>
            </div>
          </motion.div>

          {/* Prompt Transform Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 rounded-2xl border border-amber-500/15 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(14,15,20,0.9) 0%, rgba(19,22,32,0.9) 100%)' }}
          >
            {/* Browser chrome header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] border-b border-amber-500/10">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="flex-1 text-center text-[11px] font-medium text-stone-500">
                Prompt Temple Academy — See the Difference
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Bad Prompt
                  </div>
                  <p className="text-stone-300 italic mb-4 text-sm">
                    &ldquo;Write something about marketing&rdquo;
                  </p>
                  <div className="text-xs text-stone-500 space-y-1">
                    <div>→ Vague and unclear</div>
                    <div>→ No context or constraints</div>
                    <div>→ Wastes 10+ minutes iterating</div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Expert Prompt
                  </div>
                  <p className="text-stone-300 italic mb-4 text-sm">
                    &ldquo;Write a 200-word email marketing campaign for B2B SaaS companies, focusing on conversion optimization. Use a professional but friendly tone.&rdquo;
                  </p>
                  <div className="text-xs text-stone-500 space-y-1">
                    <div>→ Specific and clear</div>
                    <div>→ Includes context and format</div>
                    <div>→ Gets perfect result first try</div>
                  </div>
                </div>
              </div>

              <p className="text-center mt-6 text-sm text-stone-400">
                You&apos;ll learn exactly how to transform prompts like this in{' '}
                <span className="text-amber-300 font-semibold">Module 1</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div id="modules" className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-amber-500/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
        </motion.div>
      </div>

      <PromptIQTestModal
        open={iqTestOpen}
        onOpenChange={setIqTestOpen}
        onStartLearning={() => {
          document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </section>
  );
}
