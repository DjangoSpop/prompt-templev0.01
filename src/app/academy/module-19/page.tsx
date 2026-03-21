'use client';

/**
 * Module 19: n8n vs Zapier vs Make — Platform Comparison
 */

import { useState, useEffect } from 'react';
import { useAcademyStore, selectModuleProgress } from '@/lib/stores/academyStore';
import { getModuleById } from '@/lib/academy/content/modules';
import { ModuleSidebar } from '@/components/academy/ModuleSidebar';
import { LessonContent } from '@/components/academy/LessonContent';
import { LessonNavigation } from '@/components/academy/LessonNavigation';
import { QuizEngine } from '@/components/academy/QuizEngine';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MODULE_ID = 'module-19';

export default function Module19Page() {
  const module = getModuleById(MODULE_ID);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const progress = useAcademyStore(selectModuleProgress(MODULE_ID));

  if (!module) return <div>Module not found</div>;

  const completedLessons = progress?.lessonsCompleted?.length || 0;
  const totalLessons = module.lessons.length;
  const quizCompleted = progress?.quizScore !== null && progress?.quizScore !== undefined;
  const progressPercent = quizCompleted ? 100 : ((completedLessons / totalLessons) * 100);
  const currentLesson = module.lessons[currentLessonIndex];

  const handleNext = () => {
    if (currentLessonIndex < module.lessons.length - 1) setCurrentLessonIndex(currentLessonIndex + 1);
    else setShowQuiz(true);
  };

  const handlePrevious = () => {
    if (showQuiz) { setShowQuiz(false); setCurrentLessonIndex(module.lessons.length - 1); }
    else if (currentLessonIndex > 0) setCurrentLessonIndex(currentLessonIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-obsidian-900">
      <header className="flex-shrink-0 bg-obsidian-800 border-b border-royal-gold-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Link href="/academy" className="text-gray-300 hover:text-amber-400 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-amber-400">{module.badge} {module.title}</h1>
              <p className="text-sm text-gray-300">{completedLessons} of {totalLessons} lessons • {Math.round(progressPercent)}% complete</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <ModuleSidebar moduleId={MODULE_ID} currentLessonIndex={currentLessonIndex} showQuiz={showQuiz} onLessonClick={(index) => { setShowQuiz(false); setCurrentLessonIndex(index); }} onQuizClick={() => setShowQuiz(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {showQuiz ? (
            <div><h2 className="text-3xl font-bold text-amber-400 mb-6">{module.quiz.title}</h2><QuizEngine quiz={module.quiz} moduleId={MODULE_ID} /></div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="text-sm text-nile-teal-400 mb-2">Lesson {currentLessonIndex + 1} of {totalLessons}</div>
                <h2 className="text-3xl font-bold text-amber-400 mb-3">{currentLesson.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-300"><span>📖 {currentLesson.estimatedTime} min</span><span>✨ {currentLesson.xpReward} XP</span></div>
              </div>
              <LessonContent content={currentLesson.content} lessonId={currentLesson.id} />
              <LessonNavigation moduleId={MODULE_ID} currentLessonIndex={currentLessonIndex} totalLessons={totalLessons} showQuiz={showQuiz} onNext={handleNext} onPrevious={handlePrevious} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
