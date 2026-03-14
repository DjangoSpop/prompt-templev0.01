'use client';

import { GraduationCap, Award, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningPathCardProps {
  pathId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lessonCount: number;
  lessonsCompleted: number;
  isCompleted: boolean;
  onStart: () => void;
  onContinue: () => void;
  onViewCertificate: () => void;
}

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  advanced: { label: 'Advanced', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  expert: { label: 'Expert', color: 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30' },
};

export function LearningPathCard({
  title,
  description,
  difficulty,
  lessonCount,
  lessonsCompleted,
  isCompleted,
  onStart,
  onContinue,
  onViewCertificate,
}: LearningPathCardProps) {
  const progressPercent = lessonCount > 0 ? Math.round((lessonsCompleted / lessonCount) * 100) : 0;
  const hasStarted = lessonsCompleted > 0;
  const diff = difficultyConfig[difficulty];

  return (
    <div className="group bg-card rounded-xl border border-border/50 p-5 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full border', diff.color)}>
          {diff.label}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>{lessonCount} lessons</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{lessonsCompleted}/{lessonCount} completed</span>
          <span className="font-medium text-foreground">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isCompleted
                ? 'bg-gradient-to-r from-[#C9A227] to-[#E8D48B]'
                : 'bg-[#C9A227]/70'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isCompleted ? (
          <>
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg px-4 py-2.5 text-sm font-medium cursor-default"
            >
              <Award className="h-4 w-4" />
              Completed
            </button>
            <button
              onClick={onViewCertificate}
              className="flex items-center gap-1.5 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              Certificate
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        ) : hasStarted ? (
          <button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A227] text-white hover:bg-[#C9A227]/90 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <Play className="h-4 w-4" />
            Continue
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A227] text-white hover:bg-[#C9A227]/90 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <Play className="h-4 w-4" />
            Start Learning
          </button>
        )}
      </div>
    </div>
  );
}
