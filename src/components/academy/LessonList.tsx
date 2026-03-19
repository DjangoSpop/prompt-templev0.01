'use client';

import Link from 'next/link';
import type { AcademyLesson } from '@/types/mcp';

interface Props {
  lessons: AcademyLesson[];
  courseSlug: string;
  completedLessons: string[];
  isEnrolled: boolean;
}

const contentTypeIcons: Record<string, string> = {
  article: 'Article',
  video: 'Video',
  quiz: 'Quiz',
  exercise: 'Exercise',
  prompt_lab: 'Lab',
};

export function LessonList({ lessons, courseSlug, completedLessons, isEnrolled }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
      {lessons.map((lesson) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isAccessible = isEnrolled || lesson.is_free_preview;

        return (
          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
            {/* Status icon */}
            <span className="text-sm w-6 text-center">
              {isCompleted ? 'Done' : isAccessible ? '-' : 'Locked'}
            </span>

            {/* Lesson info */}
            <div className="flex-1 min-w-0">
              {isAccessible ? (
                <Link
                  href={`/mcp/academy/${courseSlug}/${lesson.slug}`}
                  className="text-sm font-medium text-[var(--fg)] hover:text-[#1E3A8A] dark:hover:text-[#6CA0FF] transition-colors"
                >
                  {lesson.section_number}.{lesson.lesson_number} {lesson.title}
                </Link>
              ) : (
                <span className="text-sm text-[var(--fg)]/40">
                  {lesson.section_number}.{lesson.lesson_number} {lesson.title}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-[var(--fg)]/40 shrink-0">
              <span>{contentTypeIcons[lesson.content_type] || 'Article'}</span>
              <span>{lesson.estimated_minutes} min</span>
              {lesson.is_free_preview && !isEnrolled && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  FREE
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
