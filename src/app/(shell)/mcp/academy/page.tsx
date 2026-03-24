'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Clock, Users } from 'lucide-react';
import { useAcademyCourses, useAcademyProgress } from '@/hooks/useMCPContent';
import type { AcademyCourse } from '@/types/mcp';
import { LEVEL_CONFIG } from '@/lib/mcp-utils';

const DIFFICULTY_TABS = ['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const;

export default function MCPAcademyPage() {
  const [difficulty, setDifficulty] = useState<string>('all');
  const { data: coursesData, isLoading } = useAcademyCourses();
  const { data: progress } = useAcademyProgress();

  const courses = coursesData?.results ?? [];
  const filteredCourses =
    difficulty === 'all'
      ? courses
      : courses.filter((c) => c.level === difficulty);

  const getProgress = (courseId: string) =>
    progress?.find((p) => p.course === courseId);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]
                      bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[#C9A227]/5 p-8 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-[#C9A227]/10 p-2.5">
            <GraduationCap className="h-6 w-6 text-[#C9A227]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">MCP Academy</h1>
        </div>
        <p className="text-[var(--fg)]/60 max-w-xl">
          Structured courses to take you from MCP basics to advanced patterns.
          Earn certificates and track your learning progress.
        </p>
      </div>

      {/* Difficulty tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
        {DIFFICULTY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setDifficulty(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                        -mb-px capitalize whitespace-nowrap ${
                          difficulty === tab
                            ? 'border-[#C9A227] text-[#C9A227]'
                            : 'border-transparent text-[var(--fg)]/50 hover:text-[var(--fg)]'
                        }`}
          >
            {tab === 'all' ? 'All Levels' : tab}
          </button>
        ))}
      </div>

      {/* Course grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-[var(--card)]" />
          ))}
        </div>
      ) : !filteredCourses.length ? (
        <div className="text-center py-16 text-[var(--fg)]/50">
          <p className="text-lg font-medium">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={getProgress(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  progress,
}: {
  course: AcademyCourse;
  progress?: { progress_percentage: number; completed_lessons: string[] };
}) {
  const levelCfg = LEVEL_CONFIG[course.level as keyof typeof LEVEL_CONFIG];

  return (
    <Link href={`/mcp/academy/${course.slug}`}>
      <div className="group flex flex-col h-full rounded-xl border border-[var(--border)]
                      bg-[var(--card)] p-5 hover:border-[#C9A227]/40 transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          {levelCfg && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelCfg.color} ${levelCfg.bg}`}>
              {levelCfg.label}
            </span>
          )}
          {course.is_free && (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium
                           text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          )}
        </div>

        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2 group-hover:text-[#C9A227] transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3 flex-1">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-[var(--fg)]/50 mb-3">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> {course.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.estimated_minutes}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {course.total_enrollments}
          </span>
        </div>

        {/* Progress bar */}
        {progress && (
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--fg)]/60">Progress</span>
              <span className="text-[#C9A227] font-medium">{progress.progress_percentage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg)]">
              <div
                className="h-full rounded-full bg-[#C9A227] transition-all"
                style={{ width: `${progress.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
