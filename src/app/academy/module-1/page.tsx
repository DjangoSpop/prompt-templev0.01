/**
 * Module 1: Foundations of Prompt Engineering
 *
 * FREE - 4 Lessons | 15 minutes | 100 XP
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleSidebar } from '@/components/academy/ModuleSidebar';
import { LessonContent } from '@/components/academy/LessonContent';
import { LessonNavigation } from '@/components/academy/LessonNavigation';
import { QuizEngine } from '@/components/academy/QuizEngine';
import { getModuleById } from '@/lib/academy/content/modules';
import { useAcademyStore } from '@/lib/stores/academyStore';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const MODULE_ID = 'module-1';

export default function Module1Page() {
  const router = useRouter();
  const module = getModuleById(MODULE_ID);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [startTime] = useState(Date.now());

  const { startModule, updateLastAccessed } = useAcademyStore();

  useEffect(() => {
    // Mark module as started on first load
    startModule(MODULE_ID);
    updateLastAccessed();
  }, [startModule, updateLastAccessed]);

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-desert-sand-200">Module not found</p>
      </div>
    );
  }

  const currentLesson = module.lessons[currentLessonIndex];
  const totalLessons = module.lessons.length;
  const progressPercentage = Math.round(((currentLessonIndex + 1) / totalLessons) * 100);

  const handleNextLesson = () => {
    if (currentLessonIndex < totalLessons - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last lesson complete - show quiz
      setShowQuiz(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousLesson = () => {
    if (showQuiz) {
      setShowQuiz(false);
      setCurrentLessonIndex(totalLessons - 1);
    } else if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      {/* Sidebar - Desktop */}
      <ModuleSidebar
        moduleId={MODULE_ID}
        currentLessonIndex={currentLessonIndex}
        showQuiz={showQuiz}
        onLessonClick={(index) => {
          setCurrentLessonIndex(index);
          setShowQuiz(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuizClick={() => {
          setShowQuiz(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="hidden lg:block"
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-80">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 bg-obsidian-900/95 backdrop-blur-sm border-b border-royal-gold-500/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/academy"
                className="flex items-center text-desert-sand-300 hover:text-royal-gold-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Academy
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-desert-sand-300">
                  <GraduationCap className="w-4 h-4" />
                  <span>Module 1: Foundations</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-obsidian-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-royal-gold-500 to-nile-teal-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-desert-sand-300 font-medium">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
          {showQuiz ? (
            // Quiz View
            <div>
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-royal-gold-400 mb-4">
                  {module.quiz.title}
                </h1>
                <p className="text-desert-sand-200">
                  {module.quiz.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-desert-sand-300">
                  <span>{module.quiz.questions.length} questions</span>
                  <span>•</span>
                  <span>Passing score: {module.quiz.passingScore}%</span>
                  <span>•</span>
                  <span className="text-nile-teal-400 font-semibold">
                    {module.quiz.xpReward} XP
                  </span>
                </div>
              </div>

              <QuizEngine quiz={module.quiz} moduleId={MODULE_ID} />
            </div>
          ) : (
            // Lesson View
            <div>
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="text-sm text-royal-gold-400 font-semibold mb-2">
                  Lesson {currentLessonIndex + 1} of {totalLessons}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-royal-gold-400 mb-4">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-desert-sand-300">
                  <span>{currentLesson.estimatedTime} min read</span>
                  <span>•</span>
                  <span className="text-nile-teal-400 font-semibold">
                    +{currentLesson.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-invert prose-desert max-w-none">
                <LessonContent content={currentLesson.content} lessonId={currentLesson.id} />
              </div>

              {/* Navigation */}
              <LessonNavigation
                moduleId={MODULE_ID}
                currentLessonIndex={currentLessonIndex}
                totalLessons={totalLessons}
                showQuiz={showQuiz}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
                className="mt-12"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
