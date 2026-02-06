/**
 * PromptCraft Academy - Landing Page
 *
 * Entry point with hero, module cards, and Prompt IQ Test hook
 */

import { Metadata } from 'next';
import { AcademyHero } from '@/components/academy/AcademyHero';
import { ModuleCard } from '@/components/academy/ModuleCard';
import { modules } from '@/lib/academy/content/modules';

export const metadata: Metadata = {
  title: 'PromptCraft Academy | Master Prompt Engineering',
  description: 'Learn prompt engineering from foundations to advanced techniques. Interactive 5-module course with quizzes, exercises, and certification.',
  keywords: ['prompt engineering', 'AI', 'ChatGPT', 'Claude', 'learning', 'course'],
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
      {/* Hero Section with Prompt IQ Test Hook */}
      <AcademyHero />

      {/* Module Cards Grid */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-royal-gold-400 mb-4">
            5 Modules to Prompt Engineering Mastery
          </h2>
          <p className="text-lg text-desert-sand-200 max-w-2xl mx-auto">
            Progress from beginner to expert through interactive lessons, hands-on exercises, and quizzes.
          </p>
        </div>

        {/* Module Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-obsidian-800/50 rounded-lg border border-royal-gold-500/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold text-royal-gold-400 mb-2">
              Practical & Applied
            </h3>
            <p className="text-desert-sand-300 text-sm">
              Every concept is backed by real-world examples and hands-on exercises you can apply immediately.
            </p>
          </div>

          <div className="text-center p-6 bg-obsidian-800/50 rounded-lg border border-nile-teal-500/20">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-semibold text-nile-teal-400 mb-2">
              Earn XP & Badges
            </h3>
            <p className="text-desert-sand-300 text-sm">
              Track your progress with XP points, achievements, and a shareable completion certificate.
            </p>
          </div>

          <div className="text-center p-6 bg-obsidian-800/50 rounded-lg border border-lapis-blue-500/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold text-lapis-blue-400 mb-2">
              Self-Paced Learning
            </h3>
            <p className="text-desert-sand-300 text-sm">
              Learn at your own pace. Module 1 is free. Unlock all modules with the Chrome extension or email.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-desert-sand-400 text-sm">
            <span className="text-nile-teal-400 font-semibold">2,847 learners</span> leveled up their prompt engineering skills this week
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-16 text-center border-t border-royal-gold-500/20">
        <h3 className="text-2xl font-bold text-royal-gold-400 mb-4">
          Ready to Master Prompt Engineering?
        </h3>
        <p className="text-desert-sand-200 mb-8 max-w-xl mx-auto">
          Start with Module 1 for free. No credit card required.
        </p>
        <a
          href="#modules"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-lg transition-all shadow-lg hover:shadow-royal-gold-500/50"
        >
          Start Learning →
        </a>
      </section>
    </div>
  );
}
