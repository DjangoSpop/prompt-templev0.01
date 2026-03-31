/**
 * QuizEngine Component
 *
 * Handles quiz display, answering, scoring, and completion
 */

'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '@/lib/academy/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Award, RefreshCw, Share2, GraduationCap } from 'lucide-react';
import { useAcademyStore, selectIsCourseComplete } from '@/lib/stores/academyStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface QuizEngineProps {
  quiz: Quiz;
  moduleId: string;
}

export function QuizEngine({ quiz, moduleId }: QuizEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  const { submitQuiz, completeModule } = useAcademyStore();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleAnswer = (selectedAnswer: string) => {
    if (showFeedback) return; // Prevent multiple answers

    const questionId = currentQuestion.id;
    const newAnswers = { ...answers, [questionId]: selectedAnswer };
    setAnswers(newAnswers);
    setShowFeedback(true);

    // Track time spent on question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Analytics tracking (placeholder)
    // trackAcademyEvent('academy_quiz_question_answered', {
    //   questionId,
    //   correct: selectedAnswer === currentQuestion.correctAnswer,
    //   timeSpent,
    // });

    // Auto-advance after 3 seconds
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowFeedback(false);
        setQuestionStartTime(Date.now());
      } else {
        // Quiz complete
        finishQuiz(newAnswers);
      }
    }, 3000);
  };

  const finishQuiz = (finalAnswers: Record<string, string>) => {
    const score = calculateScore(finalAnswers);
    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    const passed = score >= quiz.passingScore;

    // Submit quiz to store
    submitQuiz(moduleId, score, finalAnswers, timeSpent);

    // If passed, complete module
    if (passed) {
      completeModule(moduleId);

      // Celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A55A', '#F5D77E', '#2DD4A8'],
      });
    }

    setIsComplete(true);
  };

  const calculateScore = (finalAnswers: Record<string, string>) => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question) => {
      totalPoints += question.points;
      if (finalAnswers[question.id] === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const getAnswerFeedback = () => {
    const userAnswer = answers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    return { isCorrect, userAnswer };
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowFeedback(false);
    setIsComplete(false);
    setQuestionStartTime(Date.now());
  };

  // Quiz Results View
  if (isComplete) {
    const finalScore = calculateScore(answers);
    const passed = finalScore >= quiz.passingScore;

    return (
      <QuizResults
        score={finalScore}
        passingScore={quiz.passingScore}
        passed={passed}
        xpReward={quiz.xpReward}
        moduleId={moduleId}
        onRetry={handleRetry}
      />
    );
  }

  const { isCorrect } = showFeedback ? getAnswerFeedback() : { isCorrect: false };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-600 dark:text-desert-sand-200">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-amber-700 dark:text-amber-200">
            {progressPercentage}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 border-amber-600/20 dark:border-amber-200/25">
            {/* Question */}
            <h3 className="text-xl lg:text-2xl font-semibold text-stone-900 dark:text-amber-100 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const optionId = String(index);
                const isSelected = answers[currentQuestion.id] === optionId;
                const isCorrectOption = optionId === currentQuestion.correctAnswer;

                let buttonVariant: 'outline' | 'default' | 'destructive' = 'outline';
                let buttonClasses = 'w-full justify-start text-left h-auto py-4 px-6 transition-all';

                if (showFeedback && isSelected) {
                  buttonClasses += isCorrect
                    ? ' border-teal-600 dark:border-teal-200 bg-teal-500/15'
                    : ' border-red-500 dark:border-red-200 bg-red-500/15';
                } else if (showFeedback && isCorrectOption) {
                  buttonClasses += ' border-teal-600 dark:border-teal-200 bg-teal-500/10';
                } else if (!showFeedback) {
                  buttonClasses += ' hover:border-amber-600 dark:hover:border-amber-200 hover:bg-amber-500/5';
                }

                return (
                  <Button
                    key={index}
                    variant={buttonVariant}
                    onClick={() => handleAnswer(optionId)}
                    disabled={showFeedback}
                    className={buttonClasses}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showFeedback && isSelected && (
                        isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-200" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-200" />
                        )
                      )}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-6 rounded-lg border ${
                    isCorrect
                      ? 'bg-teal-500/10 border-teal-600/30 dark:border-teal-200/40'
                      : 'bg-red-500/10 border-red-600/30 dark:border-red-200/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-200 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-200 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className={`font-semibold mb-2 ${isCorrect ? 'text-teal-700 dark:text-teal-200' : 'text-red-700 dark:text-red-200'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </p>
                      <p className="text-sm text-stone-600 dark:text-desert-sand-200 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-200" />
                        <span className="text-amber-700 dark:text-amber-200 font-semibold">
                          +{isCorrect ? currentQuestion.points : 0} points
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// QUIZ RESULTS COMPONENT
// ============================================================================

interface QuizResultsProps {
  score: number;
  passingScore: number;
  passed: boolean;
  xpReward: number;
  moduleId: string;
  onRetry: () => void;
}

function QuizResults({ score, passingScore, passed, xpReward, moduleId, onRetry }: QuizResultsProps) {
  const isCourseComplete = useAcademyStore(selectIsCourseComplete);

  // Compute next module link: module-1 → module-2, etc.
  const moduleNum = parseInt(moduleId.replace('module-', ''), 10);
  const nextModuleId = !isNaN(moduleNum) && moduleNum < 27 ? `module-${moduleNum + 1}` : null;

  useEffect(() => {
    if (passed) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#C5A55A', '#F5D77E'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2DD4A8', '#F5D77E'],
        });
      }, 500);
    }
  }, [passed]);

  const getScoreMessage = () => {
    if (score >= 90) return 'Outstanding! You\'re a natural!';
    if (score >= 80) return 'Excellent work!';
    if (score >= 70) return 'Well done! You passed!';
    return 'Keep learning! You can retry the quiz.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-8 lg:p-12 text-center border-amber-600/20 dark:border-amber-200/25">
        {/* Score Display */}
        <div className="mb-8">
          {passed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 mb-4"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
          ) : (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-stone-400 to-stone-500 dark:from-desert-sand-600 dark:to-desert-sand-700 mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          )}

          <h2 className="text-3xl lg:text-4xl font-bold text-amber-700 dark:text-amber-200 mb-2">
            {score}%
          </h2>
          <p className="text-lg text-stone-600 dark:text-desert-sand-200">
            {getScoreMessage()}
          </p>
        </div>

        {/* Pass/Fail Status */}
        <div className="mb-8">
          {passed ? (
            <Badge className="bg-teal-400/80 text-white text-lg px-6 py-2">
              Quiz Passed!
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-lg px-6 py-2">
              Passing score: {passingScore}%
            </Badge>
          )}
        </div>

        {/* XP Reward (if passed) */}
        {passed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 bg-amber-500/10 border border-amber-600/30 dark:border-amber-200/40 rounded-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Award className="w-8 h-8 text-amber-600 dark:text-amber-200" />
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-desert-sand-300">XP Earned</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-200">+{xpReward} XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course Completion CTA */}
        {passed && isCourseComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-amber-600/30 dark:border-amber-200/40 rounded-xl"
          >
            <GraduationCap className="w-10 h-10 text-amber-600 dark:text-amber-200 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-amber-700 dark:text-amber-200 mb-2">
              All Modules Complete!
            </h3>
            <p className="text-stone-500 dark:text-desert-sand-300 text-sm mb-4">
              You&apos;ve mastered all 27 modules. Claim your professional certificate now!
            </p>
            <Link href="/academy/completion">
              <Button className="bg-gradient-to-r from-amber-200/30 to-amber-300/20 hover:from-amber-200/40 hover:to-amber-300/25 text-amber-100 border-amber-200/40 font-semibold px-8">
                <Award className="w-4 h-4 mr-2" />
                Claim Your Certificate
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!passed && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Quiz
            </Button>
          )}

          {passed && !isCourseComplete && (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-amber-600/30 dark:border-amber-200/30 text-amber-700 dark:text-amber-200 hover:border-amber-600/50 dark:hover:border-amber-200/50"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </Button>

              <Link href={nextModuleId ? `/academy/${nextModuleId}` : '/academy'}>
                <Button
                  className="bg-gradient-to-r from-amber-200/30 to-amber-300/20 hover:from-amber-200/40 hover:to-amber-300/25 text-amber-100 border-amber-200/40"
                >
                  {nextModuleId ? 'Next Module →' : 'Back to Academy'}
                </Button>
              </Link>
            </>
          )}

          {passed && isCourseComplete && (
            <Link href="/academy">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-amber-600/30 dark:border-amber-200/30 text-amber-700 dark:text-amber-200 hover:border-amber-600/50 dark:hover:border-amber-200/50"
              >
                Back to Academy
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
