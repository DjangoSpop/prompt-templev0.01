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
      <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 pt-16">
        {/* Hero Section */}
        <AcademyHero />

        {/* Course Catalog */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-6 h-6 text-royal-gold-400" />
              <span className="text-sm font-semibold text-royal-gold-400 tracking-widest uppercase">
                Course Catalog
              </span>
              <Crown className="w-6 h-6 text-royal-gold-400" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent mb-4">
              {courses.filter((c) => !c.isComingSoon).length} Courses, {modules.length} Modules
            </h2>
            <p className="text-lg text-desert-sand-200 max-w-2xl mx-auto mb-8">
              From prompt engineering foundations to production AI agents. Choose your learning path and start building.
            </p>

            {/* Level Filter Tabs */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    levelFilter === level
                      ? 'bg-amber-200/20 text-amber-100 border border-amber-200/40'
                      : 'bg-obsidian-800/40 text-desert-sand-300 border border-desert-sand-700/30 hover:border-amber-200/40 hover:text-amber-100'
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
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-amber-300/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/40 rounded-xl border border-amber-200/20 group-hover:border-amber-200/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-300/15 mb-4 mx-auto">
                  <BookOpen className="w-8 h-8 text-amber-200" />
                </div>
                <h3 className="text-xl font-semibold text-amber-200 mb-2 text-center">
                  Practical & Applied
                </h3>
                <p className="text-desert-sand-200 text-sm text-center">
                  Every concept backed by real-world examples. Build AI chatbots, automation workflows, and production systems.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-teal-300/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/40 rounded-xl border border-teal-200/20 group-hover:border-teal-200/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-300/15 mb-4 mx-auto">
                  <Award className="w-8 h-8 text-teal-200" />
                </div>
                <h3 className="text-xl font-semibold text-teal-200 mb-2 text-center">
                  Earn XP & Badges
                </h3>
                <p className="text-desert-sand-200 text-sm text-center">
                  Track progress with XP points. Earn badges: Bronze Scarab, Silver Ankh, Gold Eye of Horus, Lapis Crown.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-300/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative p-8 bg-obsidian-800/40 rounded-xl border border-blue-200/20 group-hover:border-blue-200/30 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-300/15 mb-4 mx-auto">
                  <Zap className="w-8 h-8 text-blue-200" />
                </div>
                <h3 className="text-xl font-semibold text-blue-200 mb-2 text-center">
                  100% Free Courses
                </h3>
                <p className="text-desert-sand-200 text-sm text-center">
                  {courses.filter((c) => c.isFree && !c.isComingSoon).length} full courses completely free. No credit card needed. Premium courses coming soon.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto py-12 border-y border-amber-200/15">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-200 mb-2">{courses.filter((c) => !c.isComingSoon).length}</div>
              <p className="text-desert-sand-200 text-sm">Active Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-200 mb-2">{modules.length}+</div>
              <p className="text-desert-sand-200 text-sm">Total Modules</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-200 mb-2">98%</div>
              <p className="text-desert-sand-200 text-sm">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-200 mb-2">4.9★</div>
              <p className="text-desert-sand-200 text-sm">Average Rating</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-4 py-20 text-center border-t border-amber-200/15">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-2 mb-6">
              <Scroll className="w-5 h-5 text-amber-200" />
              <span className="text-sm font-semibold text-amber-200 tracking-widest uppercase">
                Begin Your Journey
              </span>
              <Scroll className="w-5 h-5 text-amber-200" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-amber-200 mb-4">
              Ready to Master AI?
            </h3>
            <p className="text-desert-sand-200 mb-8 text-lg">
              Start with any course for free. From prompt engineering to production AI agents — your path to mastery begins here.
            </p>
            <a
              href="#modules"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-200/20 to-amber-300/15 hover:from-amber-200/30 hover:to-amber-300/20 text-amber-100 border border-amber-200/30 font-semibold rounded-lg transition-all shadow-lg hover:shadow-amber-200/20 hover:scale-105 duration-300"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        <div className="h-1 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent opacity-40 mt-16" />
      </div>
    </>
  );
}
