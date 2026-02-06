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
import { CheckCircle, XCircle, Award, RefreshCw, Share2 } from 'lucide-react';
import { useAcademyStore } from '@/lib/stores/academyStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
          <span className="text-sm font-medium text-desert-sand-300">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-royal-gold-400">
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
          <Card className="p-8 border-royal-gold-500/30">
            {/* Question */}
            <h3 className="text-xl lg:text-2xl font-semibold text-royal-gold-400 mb-6">
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
                    ? ' border-nile-teal-500 bg-nile-teal-900/30'
                    : ' border-red-500 bg-red-900/30';
                } else if (showFeedback && isCorrectOption) {
                  buttonClasses += ' border-nile-teal-500 bg-nile-teal-900/20';
                } else if (!showFeedback) {
                  buttonClasses += ' hover:border-royal-gold-500 hover:bg-royal-gold-900/10';
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
                          <CheckCircle className="w-5 h-5 text-nile-teal-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
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
                      ? 'bg-nile-teal-900/20 border-nile-teal-500/50'
                      : 'bg-red-900/20 border-red-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-nile-teal-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className={`font-semibold mb-2 ${isCorrect ? 'text-nile-teal-300' : 'text-red-300'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </p>
                      <p className="text-sm text-desert-sand-100 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-royal-gold-400" />
                        <span className="text-royal-gold-400 font-semibold">
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
  useEffect(() => {
    if (passed) {
      // Trigger another confetti burst after a delay
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
      <Card className="p-8 lg:p-12 text-center border-royal-gold-500/30">
        {/* Score Display */}
        <div className="mb-8">
          {passed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-nile-teal-500 to-nile-teal-600 mb-4"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
          ) : (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-desert-sand-600 to-desert-sand-700 mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          )}

          <h2 className="text-3xl lg:text-4xl font-bold text-royal-gold-400 mb-2">
            {score}%
          </h2>
          <p className="text-lg text-desert-sand-200">
            {getScoreMessage()}
          </p>
        </div>

        {/* Pass/Fail Status */}
        <div className="mb-8">
          {passed ? (
            <Badge className="bg-nile-teal-500 text-white text-lg px-6 py-2">
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
            className="mb-8 p-6 bg-royal-gold-900/20 border border-royal-gold-500/50 rounded-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Award className="w-8 h-8 text-royal-gold-400" />
              <div className="text-left">
                <p className="text-sm text-desert-sand-300">XP Earned</p>
                <p className="text-2xl font-bold text-royal-gold-400">+{xpReward} XP</p>
              </div>
            </div>
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

          {passed && (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </Button>

              <Button
                className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
              >
                Next Module →
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
