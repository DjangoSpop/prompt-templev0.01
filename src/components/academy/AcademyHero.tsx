/**
 * AcademyHero Component
 *
 * Landing page hero with hook, stats, and Prompt IQ Test CTA
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, TrendingUp, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function AcademyHero() {
  const [animatedCount, setAnimatedCount] = useState(2500);

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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-transparent">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L0 30L30 60L60 30L30 0Z' fill='%23C5A55A' fill-opacity='0.1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-royal-gold-900/30 border border-royal-gold-500/50 rounded-full text-sm text-royal-gold-300">
              <Sparkles className="w-4 h-4" />
              <span>Free Interactive Course</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-royal-gold-400 via-royal-gold-300 to-nile-teal-400 bg-clip-text text-transparent"
          >
            Master Prompt Engineering
            <br />
            From Zero to Expert
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-center text-desert-sand-200 mb-12 max-w-3xl mx-auto"
          >
            Learn the frameworks, techniques, and strategies that top AI practitioners use to get 300-500% better results from ChatGPT, Claude, and other AI tools.
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* Stat 1 */}
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-royal-gold-400 mb-2">
                87%
              </div>
              <p className="text-sm text-desert-sand-300">
                of AI users waste 3+ hours weekly on bad prompts
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-nile-teal-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-nile-teal-400 mb-2">
                300-500%
              </div>
              <p className="text-sm text-desert-sand-300">
                productivity gains with systematic prompting
              </p>
            </div>

            {/* Stat 3 - Animated */}
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-lapis-blue-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-lapis-blue-400 mb-2">
                {animatedCount.toLocaleString()}+
              </div>
              <p className="text-sm text-desert-sand-300">
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
              className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-royal-gold-500/50 transition-all"
              onClick={() => {
                document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Start Learning Free
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-royal-gold-500/50 hover:border-royal-gold-500 px-8 py-6 text-lg"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Take Prompt IQ Test
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-sm text-desert-sand-400">
              <Users className="w-4 h-4 text-nile-teal-400" />
              <span>
                Join <span className="text-nile-teal-400 font-semibold">10,000+</span> prompt engineers worldwide
              </span>
            </div>
          </motion.div>

          {/* Live Prompt Transform Demo (Placeholder for Phase 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 p-8 bg-obsidian-800/30 backdrop-blur-sm border border-royal-gold-500/20 rounded-lg"
          >
            <h3 className="text-center text-xl font-semibold text-royal-gold-400 mb-6">
              See the Difference
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bad Prompt */}
              <div className="p-6 bg-red-900/10 border border-red-500/30 rounded-lg">
                <div className="text-sm font-semibold text-red-400 mb-3">❌ Bad Prompt</div>
                <p className="text-desert-sand-300 italic mb-4">
                  "Write something about marketing"
                </p>
                <div className="text-xs text-desert-sand-400 space-y-1">
                  <div>→ Vague and unclear</div>
                  <div>→ No context or constraints</div>
                  <div>→ Wastes 10+ minutes iterating</div>
                </div>
              </div>

              {/* Good Prompt */}
              <div className="p-6 bg-nile-teal-900/10 border border-nile-teal-500/30 rounded-lg">
                <div className="text-sm font-semibold text-nile-teal-400 mb-3">✅ Good Prompt</div>
                <p className="text-desert-sand-300 italic mb-4">
                  "Write a 200-word email marketing campaign for B2B SaaS companies, focusing on conversion optimization. Use a professional but friendly tone."
                </p>
                <div className="text-xs text-desert-sand-400 space-y-1">
                  <div>→ Specific and clear</div>
                  <div>→ Includes context and format</div>
                  <div>→ Gets perfect result first try</div>
                </div>
              </div>
            </div>

            <p className="text-center mt-6 text-sm text-desert-sand-300">
              You'll learn exactly how to transform prompts like this in{' '}
              <span className="text-royal-gold-400 font-semibold">Module 1</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div id="modules" className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-royal-gold-500/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 bg-royal-gold-400 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
