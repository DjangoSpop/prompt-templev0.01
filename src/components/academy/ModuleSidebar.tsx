/**
 * ModuleSidebar Component
 *
 * Sticky sidebar showing lesson list, progress, and quiz status
 */

'use client';

import { getModuleById } from '@/lib/academy/content/modules';
import { useAcademyStore, selectModuleProgress, selectLessonCompleted } from '@/lib/stores/academyStore';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Award, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleSidebarProps {
  moduleId: string;
  currentLessonIndex: number;
  showQuiz: boolean;
  onLessonClick: (index: number) => void;
  onQuizClick: () => void;
  className?: string;
}

export function ModuleSidebar({
  moduleId,
  currentLessonIndex,
  showQuiz,
  onLessonClick,
  onQuizClick,
  className = '',
}: ModuleSidebarProps) {
  const module = getModuleById(moduleId);
  const moduleProgress = useAcademyStore(selectModuleProgress(moduleId));

  if (!module) return null;

  const totalLessons = module.lessons.length;
  const completedLessons = moduleProgress?.lessonsCompleted || [];
  const completedLessonsCount = completedLessons.length;
  const progressPercentage = Math.round((completedLessonsCount / totalLessons) * 100);
  const quizCompleted = moduleProgress != null && moduleProgress.quizScore !== null;

  return (
    <aside
      className={cn(
        'w-80 flex-shrink-0 bg-obsidian-900 border-r border-royal-gold-500/20 overflow-y-auto hidden md:block',
        className
      )}
    >
      <div className="p-6">
        {/* Module Header */}
        <div className="mb-6">
          <div className="text-4xl mb-3">{module.badge}</div>
          <h2 className="text-xl font-bold text-amber-400 mb-2">
            {module.shortTitle || module.title}
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            {module.duration} minutes • {module.xpReward} XP
          </p>

          {/* Overall Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <p className="text-xs text-gray-400">
            {completedLessonsCount} of {totalLessons} lessons completed
          </p>
        </div>

        {/* Lessons List */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Lessons
          </h3>

          {module.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isCurrent = index === currentLessonIndex && !showQuiz;

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonClick(index)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all',
                  isCurrent
                    ? 'bg-royal-gold-900/30 border border-royal-gold-500/50'
                    : 'hover:bg-obsidian-800 border border-transparent',
                  isCompleted && !isCurrent && 'opacity-75'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-nile-teal-400" />
                    ) : (
                      <Circle
                        className={cn(
                          'w-5 h-5',
                          isCurrent ? 'text-amber-400' : 'text-gray-600'
                        )}
                      />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium mb-1',
                        isCurrent ? 'text-amber-300' : 'text-gray-200'
                      )}
                    >
                      {lesson.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lesson.estimatedTime} min • +{lesson.xpReward} XP
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quiz Button */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Assessment
          </h3>

          <button
            onClick={onQuizClick}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-all',
              showQuiz
                ? 'bg-royal-gold-900/30 border border-royal-gold-500/50'
                : 'hover:bg-obsidian-800 border border-transparent'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {quizCompleted ? (
                  <CheckCircle className="w-5 h-5 text-nile-teal-400" />
                ) : (
                  <Circle
                    className={cn(
                      'w-5 h-5',
                      showQuiz ? 'text-amber-400' : 'text-gray-600'
                    )}
                  />
                )}
              </div>

              {/* Quiz Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium mb-1',
                    showQuiz ? 'text-amber-300' : 'text-gray-200'
                  )}
                >
                  Module Quiz
                </p>
                <p className="text-xs text-gray-400">
                  {module.quiz.questions.length} questions • +{module.quiz.xpReward} XP
                </p>
                {quizCompleted && (
                  <p className="text-xs text-nile-teal-400 font-semibold mt-1">
                    Score: {moduleProgress?.quizScore}%
                  </p>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Module Objectives */}
        <div className="mt-8 p-4 bg-obsidian-800/50 rounded-lg border border-royal-gold-500/20">
          <h4 className="text-sm font-semibold text-amber-400 mb-3">
            Learning Objectives
          </h4>
          <ul className="space-y-2 text-xs text-gray-300">
            {module.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
