/**
 * PromptCraft Academy - Landing Page
 *
 * Entry point with hero, module cards, and Prompt IQ Test hook
 */

'use client';

import { Metadata } from 'next';
import { AcademyHero } from '@/components/academy/AcademyHero';
import { ModuleCard } from '@/components/academy/ModuleCard';
import { modules } from '@/lib/academy/content/modules';
import EgyptianNavbar from '@/components/navbar/EgyptianNavbar';
import { BookOpen, Award, Zap, Users, ArrowRight, Crown, Scroll, Star } from 'lucide-react';

// Note: Due to SSR constraints, metadata is handled via layout
// export const metadata: Metadata = {
//   title: 'PromptCraft Academy | Master Prompt Engineering',
//   description: 'Learn prompt engineering from foundations to advanced techniques. Interactive 6-module course with quizzes, exercises, and certification.',
//   keywords: ['prompt engineering', 'AI', 'ChatGPT', 'Claude', 'learning', 'course'],
// };

export default function AcademyPage() {
  return (
    <>
   
      <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 pt-16">
        {/* Hero Section with Prompt IQ Test Hook */}
        <AcademyHero />

        {/* Module Cards Grid */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          {/* Section Header with Egyptian flair */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-6 h-6 text-royal-gold-400" />
              <span className="text-sm font-semibold text-royal-gold-400 tracking-widest uppercase">
                Sacred Learning Path
              </span>
              <Crown className="w-6 h-6 text-royal-gold-400" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-royal-gold-400 via-royal-gold-300 to-royal-gold-400 bg-clip-text text-transparent mb-4">
              6 Modules to Prompt Engineering Mastery
            </h2>
            <p className="text-lg text-desert-sand-200 max-w-2xl mx-auto">
              Progress from beginner to expert through interactive lessons, hands-on exercises, and quizzes. Unlock the secrets of effective prompt engineering.
            </p>
          </div>

          {/* Module Cards - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="animate-in fade-in slide-in-from-bottom-4 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModuleCard module={module} />
              </div>
            ))}
          </div>

          {/* Value Proposition - Egyptian Styled Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Practical Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-royal-gold-500/20 to-royal-gold-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/60 rounded-xl border border-royal-gold-500/30 group-hover:border-royal-gold-500/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-royal-gold-500 to-royal-gold-600 mb-4 mx-auto shadow-lg">
                  <BookOpen className="w-8 h-8 text-obsidian-950" />
                </div>
                <h3 className="text-xl font-semibold text-royal-gold-400 mb-2 text-center">
                  Practical & Applied
                </h3>
                <p className="text-desert-sand-300 text-sm text-center">
                  Every concept is backed by real-world examples and hands-on exercises you can apply immediately.
                </p>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-nile-teal-500/20 to-nile-teal-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/60 rounded-xl border border-nile-teal-500/30 group-hover:border-nile-teal-500/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-nile-teal-500 to-nile-teal-600 mb-4 mx-auto shadow-lg">
                  <Award className="w-8 h-8 text-obsidian-950" />
                </div>
                <h3 className="text-xl font-semibold text-nile-teal-400 mb-2 text-center">
                  Earn XP & Badges
                </h3>
                <p className="text-desert-sand-300 text-sm text-center">
                  Track your progress with XP points, achievements, and a shareable completion certificate.
                </p>
              </div>
            </div>

            {/* Self-Paced Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lapis-blue-500/20 to-lapis-blue-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/60 rounded-xl border border-lapis-blue-500/30 group-hover:border-lapis-blue-500/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-lapis-blue-500 to-lapis-blue-600 mb-4 mx-auto shadow-lg">
                  <Zap className="w-8 h-8 text-obsidian-950" />
                </div>
                <h3 className="text-xl font-semibold text-lapis-blue-400 mb-2 text-center">
                  Self-Paced Learning
                </h3>
                <p className="text-desert-sand-300 text-sm text-center">
                  Learn at your own pace. Module 1 is free. Unlock all modules with the Chrome extension or email.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto py-12 border-y border-royal-gold-500/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-royal-gold-400 mb-2">2,847</div>
              <p className="text-desert-sand-300">Learners This Week</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-nile-teal-400 mb-2">98%</div>
              <p className="text-desert-sand-300">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lapis-blue-400 mb-2">4.9★</div>
              <p className="text-desert-sand-300">Average Rating</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 py-20 text-center border-t border-royal-gold-500/20">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-2 mb-6">
              <Scroll className="w-5 h-5 text-royal-gold-400" />
              <span className="text-sm font-semibold text-royal-gold-400 tracking-widest uppercase">
                Begin Your Journey
              </span>
              <Scroll className="w-5 h-5 text-royal-gold-400" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-royal-gold-400 mb-4">
              Ready to Master Prompt Engineering?
            </h3>
            <p className="text-desert-sand-200 mb-8 text-lg">
              Start with Module 1 for free. No credit card required. Join thousands of learners unlocking the power of AI.
            </p>
            <a
              href="#modules"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-lg transition-all shadow-lg hover:shadow-2xl hover:shadow-royal-gold-500/50 hover:scale-105 duration-300"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Bottom decorative border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-royal-gold-500 to-transparent opacity-50 mt-16" />
      </div>
    </>
  );
}
