'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LEVEL_CONFIG } from '@/lib/mcp-utils';
import type { AcademyCourse } from '@/types/mcp';

interface Props {
  course: AcademyCourse;
}

export function CourseCard({ course }: Props) {
  const level = LEVEL_CONFIG[course.level];

  return (
    <Link href={`/mcp/academy/${course.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${level.color} ${level.bg}`}>
            {level.label}
          </span>
          {course.is_free && (
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Free
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">{course.title}</h3>
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-4">{course.description}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--fg)]/50">
          <span>{course.total_lessons} lessons</span>
          <span>{course.estimated_minutes} min</span>
          <span>{course.total_enrollments} enrolled</span>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[#C9A227]">
            Start Learning
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
