/**
 * PromptCraft Academy - Landing Page
 *
 * Multi-course catalog with track sections, module cards, and progress tracking
 */

'use client';

import { AcademyHero } from '@/components/academy/AcademyHero';
import { ModuleCard } from '@/components/academy/ModuleCard';
import { modules } from '@/lib/academy/content/modules';
import { courses, Course } from '@/lib/academy/content/courses';
import { BookOpen, Award, Zap, ArrowRight, Crown, Scroll, Lock, Sparkles, Clock, GraduationCap } from 'lucide-react';
import { useState } from 'react';

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

// Soft, eye-friendly color gradients with better accessibility
const colorMap: Record<Course['color'], { border: string; text: string; bg: string; glow: string }> = {
  gold: {
    border: 'border-amber-200/30 hover:border-amber-200/50',
    text: 'text-amber-200',
    bg: 'from-amber-500/8 to-amber-600/3',
    glow: 'from-amber-400/15 to-amber-300/8',
  },
  orange: {
    border: 'border-orange-200/30 hover:border-orange-200/50',
    text: 'text-orange-200',
    bg: 'from-orange-500/8 to-orange-600/3',
    glow: 'from-orange-400/15 to-orange-300/8',
  },
  teal: {
    border: 'border-teal-200/30 hover:border-teal-200/50',
    text: 'text-teal-200',
    bg: 'from-teal-500/8 to-teal-600/3',
    glow: 'from-teal-400/15 to-teal-300/8',
  },
  blue: {
    border: 'border-blue-200/30 hover:border-blue-200/50',
    text: 'text-blue-200',
    bg: 'from-blue-500/8 to-blue-600/3',
    glow: 'from-blue-400/15 to-blue-300/8',
  },
  purple: {
    border: 'border-purple-200/30 hover:border-purple-200/50',
    text: 'text-purple-200',
    bg: 'from-purple-500/8 to-purple-600/3',
    glow: 'from-purple-400/15 to-purple-300/8',
  },
  green: {
    border: 'border-emerald-200/30 hover:border-emerald-200/50',
    text: 'text-emerald-200',
    bg: 'from-emerald-500/8 to-emerald-600/3',
    glow: 'from-emerald-400/15 to-emerald-300/8',
  },
};

function CourseSection({ course }: { course: Course }) {
  const colors = colorMap[course.color];
  const courseModules = course.moduleIds
    .map((id) => modules.find((m) => m.id === id))
    .filter(Boolean);

  if (course.isComingSoon) {
    return (
      <div className={`relative rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-8 opacity-75 transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{course.emoji}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-2xl font-bold ${colors.text}`}>{course.title}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  PREMIUM
                </span>
              </div>
              <p className="text-desert-sand-300 text-sm max-w-xl">{course.description}</p>
            </div>
          </div>
          <Lock className="w-6 h-6 text-desert-sand-500 flex-shrink-0" />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {course.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-obsidian-800/60 border border-desert-sand-700/30 text-desert-sand-400 font-mono">
              {tag}
            </span>
          ))}
          <span className="text-xs text-desert-sand-500 ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{course.estimatedHours}h
          </span>
          <span className="text-xs px-3 py-1 bg-royal-gold-500/20 text-royal-gold-300 rounded-full font-semibold">
            Coming Soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-20">
      {/* Course Header */}
      <div className={`relative rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-8 mb-8 transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <span className="text-6xl">{course.emoji}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className={`text-2xl lg:text-3xl font-bold ${colors.text}`}>{course.title}</h3>
              {course.isFree ? (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  FREE
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  PREMIUM
                </span>
              )}
              <span className="px-2 py-0.5 text-xs font-medium bg-obsidian-800/60 text-desert-sand-300 rounded-full border border-desert-sand-700/30 capitalize">
                {course.level}
              </span>
            </div>
            <p className="text-desert-sand-200 text-sm lg:text-base max-w-2xl mb-4">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {course.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-obsidian-800/60 border border-desert-sand-700/30 text-desert-sand-300 font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center flex-shrink-0">
            <span className="text-4xl">{course.badge.emoji}</span>
            <span className="text-xs text-desert-sand-400 font-medium">{course.badge.name}</span>
            <div className="flex items-center gap-1 text-xs text-desert-sand-500 mt-1">
              <Clock className="w-3 h-3" />
              ~{course.estimatedHours}h
            </div>
            <div className="flex items-center gap-1 text-xs text-desert-sand-500">
              <GraduationCap className="w-3 h-3" />
              {courseModules.length} modules
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {courseModules.map((module, index) => (
          <div
            key={module!.id}
            className="animate-in fade-in slide-in-from-bottom-4 transition-all duration-500"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ModuleCard module={module!} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcademyPage() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

  const filteredCourses = levelFilter === 'all'
    ? courses
    : courses.filter((c) => c.level === levelFilter);

  const activeCourses = filteredCourses.filter((c) => !c.isComingSoon);
  const comingSoonCourses = filteredCourses.filter((c) => c.isComingSoon);

  return (
    <>
      <div
        className="min-h-screen pt-16"
        style={{
          background: 'linear-gradient(180deg, #0E0F12 0%, #111827 30%, #0E0F12 60%, #131620 80%, #0E0F12 100%)',
        }}
      >
        {/* Hero Section */}
        <AcademyHero />

        {/* Course Catalog */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400 tracking-widest uppercase">
                Course Catalog
              </span>
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {courses.filter((c) => !c.isComingSoon).length} Courses,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {modules.length} Modules
              </span>
            </h2>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto mb-8">
              From prompt engineering foundations to production AI agents. Choose your learning path and start building.
            </p>

            {/* Level Filter Tabs */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    levelFilter === level
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                      : 'bg-white/[0.03] text-stone-400 border border-white/10 hover:border-amber-500/30 hover:text-amber-200'
                  }`}
                >
                  {level === 'all' ? 'All Courses' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Active Courses */}
          <div className="max-w-7xl mx-auto">
            {activeCourses.map((course) => (
              <CourseSection key={course.id} course={course} />
            ))}
          </div>

          {/* Coming Soon Courses */}
          {comingSoonCourses.length > 0 && (
            <div className="max-w-7xl mx-auto mt-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400 tracking-widest uppercase">
                    Coming Soon
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-desert-sand-400 text-sm">Premium courses launching soon — subscribe to get early access</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {comingSoonCourses.map((course) => (
                  <CourseSection key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Value Proposition Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <BookOpen className="w-7 h-7" />, title: 'Practical & Applied', desc: 'Every concept backed by real-world examples. Build AI chatbots, automation workflows, and production systems.', color: 'amber' },
              { icon: <Award className="w-7 h-7" />, title: 'Earn XP & Badges', desc: 'Track progress with XP points. Earn badges: Bronze Scarab, Silver Ankh, Gold Eye of Horus, Lapis Crown.', color: 'emerald' },
              { icon: <Zap className="w-7 h-7" />, title: '100% Free Courses', desc: `${courses.filter((c) => c.isFree && !c.isComingSoon).length} full courses completely free. No credit card needed. Premium courses coming soon.`, color: 'blue' },
            ].map((card) => (
              <div key={card.title} className="group relative rounded-2xl border border-amber-500/15 p-7 text-center transition-all duration-300 hover:border-amber-400/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 text-amber-400 transition-colors group-hover:border-amber-400/40 group-hover:text-amber-300" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)' }}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{card.title}</h3>
                <p className="text-stone-400 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto py-12 border-y border-amber-500/15">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-300 mb-2">{courses.filter((c) => !c.isComingSoon).length}</div>
              <p className="text-stone-400 text-sm">Active Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-300 mb-2">{modules.length}+</div>
              <p className="text-stone-400 text-sm">Total Modules</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300 mb-2">98%</div>
              <p className="text-stone-400 text-sm">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-300 mb-2">4.9★</div>
              <p className="text-stone-400 text-sm">Average Rating</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 py-20 text-center border-t border-amber-500/15">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-2 mb-6">
              <Scroll className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400 tracking-widest uppercase">
                Begin Your Journey
              </span>
              <Scroll className="w-5 h-5 text-amber-400" />
            </div>
            <h3
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Master AI?
              </span>
            </h3>
            <p className="text-stone-400 mb-8 text-lg">
              Start with any course for free. From prompt engineering to production AI agents — your path to mastery begins here.
            </p>
            <a
              href="#modules"
              className="inline-flex items-center space-x-2 px-8 py-4 font-bold text-[#0E0F12] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #ffe066, #d4af37, #CBA135)' }}
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Bottom gold line */}
        <div
          className="h-[2px] mt-16"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, #d4af37 30%, #ffe066 50%, #d4af37 70%, transparent 95%)',
            opacity: 0.4,
          }}
        />
      </div>
    </>
  );
}
