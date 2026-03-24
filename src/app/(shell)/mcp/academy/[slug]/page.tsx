'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, Clock, Users, CheckCircle, Lock } from 'lucide-react';
import { useAcademyCourseDetail, useAcademyProgress, useEnrollCourse } from '@/hooks/useMCPContent';
import { LEVEL_CONFIG } from '@/lib/mcp-utils';

export default function MCPCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useAcademyCourseDetail(slug);
  const { data: progress } = useAcademyProgress();
  const enroll = useEnrollCourse();

  const enrollment = progress?.find((p) => p.course === course?.id);
  const isEnrolled = !!enrollment;
  const completedLessons = new Set(enrollment?.completed_lessons ?? []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 rounded bg-[var(--card)]" />
        <div className="h-12 w-96 rounded bg-[var(--card)]" />
        <div className="h-96 rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-[var(--fg)]/60">Course not found</p>
        <button onClick={() => router.push('/mcp/academy')} className="mt-4 text-[#C9A227] text-sm hover:underline">
          Back to Academy
        </button>
      </div>
    );
  }

  const levelCfg = LEVEL_CONFIG[course.level as keyof typeof LEVEL_CONFIG];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--fg)]/50
                   hover:text-[#C9A227] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Academy
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
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

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">{course.title}</h1>
        <p className="text-[var(--fg)]/60 mb-4">{course.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg)]/50 mb-5">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" /> {course.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> ~{course.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {course.total_enrollments} enrolled
          </span>
        </div>

        {/* Progress or Enroll */}
        {isEnrolled ? (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--fg)]/60">Your progress</span>
              <span className="text-[#C9A227] font-medium">{enrollment.progress_percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg)]">
              <div
                className="h-full rounded-full bg-[#C9A227] transition-all"
                style={{ width: `${enrollment.progress_percentage}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => enroll.mutate(course.id)}
            disabled={enroll.isPending}
            className="rounded-lg bg-[#C9A227] px-6 py-2.5 text-sm font-medium
                       text-white hover:bg-[#B8911F] transition-colors
                       disabled:opacity-50"
          >
            {enroll.isPending ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
      </div>

      {/* Lesson list */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-bold text-[var(--fg)] mb-4">Lessons</h2>
        <div className="space-y-2">
          {course.lessons?.map((lesson, idx) => {
            const isCompleted = completedLessons.has(lesson.id);
            const isAccessible = isEnrolled || lesson.is_free_preview;

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isAccessible
                    ? 'hover:bg-[var(--bg)] cursor-pointer'
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : isAccessible ? (
                    <span className="text-sm font-medium text-[var(--fg)]/40">
                      {idx + 1}
                    </span>
                  ) : (
                    <Lock className="h-4 w-4 text-[var(--fg)]/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--fg)]'}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--fg)]/40 mt-0.5">
                    <span>{lesson.content_type}</span>
                    <span>~{lesson.estimated_minutes}m</span>
                    {lesson.is_free_preview && !isEnrolled && (
                      <span className="text-emerald-500">Free preview</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
