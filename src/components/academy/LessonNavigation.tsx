/**
 * LessonNavigation Component
 *
 * Previous/Next navigation buttons for lessons
 */

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useAcademyStore } from '@/lib/stores/academyStore';
import { useEffect, useState } from 'react';

interface LessonNavigationProps {
  moduleId: string;
  currentLessonIndex: number;
  totalLessons: number;
  showQuiz: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function LessonNavigation({
  moduleId,
  currentLessonIndex,
  totalLessons,
  showQuiz,
  onPrevious,
  onNext,
  className = '',
}: LessonNavigationProps) {
  const { completeLesson, updateTimeSpent } = useAcademyStore();
  const [lessonStartTime] = useState(Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  const isFirstLesson = currentLessonIndex === 0 && !showQuiz;
  const isLastLesson = currentLessonIndex === totalLessons - 1;

  // Track time spent when navigating away
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
      const lessonId = `lesson-${moduleId.split('-')[1]}-${currentLessonIndex + 1}`;
      updateTimeSpent(moduleId, timeSpent);
    };
  }, [currentLessonIndex, lessonStartTime, moduleId, updateTimeSpent]);

  const handleNext = () => {
    // Mark lesson as complete before moving to next
    const lessonId = `lesson-${moduleId.split('-')[1]}-${currentLessonIndex + 1}`;
    const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);

    setIsCompleting(true);
    completeLesson(moduleId, lessonId, timeSpent);

    // Small delay to show completion animation
    setTimeout(() => {
      setIsCompleting(false);
      onNext();
    }, 300);
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstLesson}
        className="flex items-center gap-2 min-w-[120px]"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {/* Progress Indicator */}
      <div className="flex-1 text-center">
        {!showQuiz && (
          <p className="text-sm text-desert-sand-300">
            Lesson <span className="text-royal-gold-400 font-semibold">{currentLessonIndex + 1}</span> of{' '}
            {totalLessons}
          </p>
        )}
        {showQuiz && (
          <p className="text-sm text-royal-gold-400 font-semibold">
            Module Quiz
          </p>
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={isCompleting}
        className="flex items-center gap-2 min-w-[120px] bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
      >
        {isCompleting ? (
          <>
            <CheckCircle className="w-4 h-4 animate-pulse" />
            Complete
          </>
        ) : (
          <>
            {isLastLesson && !showQuiz ? 'Take Quiz' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
