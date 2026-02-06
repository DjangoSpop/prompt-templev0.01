/**
 * ModuleCard Component
 *
 * Displays module information with lock status, progress, and CTA
 */

'use client';

import { Module } from '@/lib/academy/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import { useAcademyStore, selectIsModuleUnlocked, selectIsModuleCompleted, selectModuleProgress } from '@/lib/stores/academyStore';
import { useState } from 'react';
import { UnlockModal } from './UnlockModal';

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isUnlocked = useAcademyStore(selectIsModuleUnlocked(module.id));
  const isCompleted = useAcademyStore(selectIsModuleCompleted(module.id));
  const moduleProgress = useAcademyStore(selectModuleProgress(module.id));

  // Calculate progress percentage
  const totalLessons = module.lessons.length;
  const completedLessons = moduleProgress?.lessonsCompleted.length || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasStarted = completedLessons > 0 || moduleProgress?.quizScore !== null;

  // Determine card status
  const getStatus = () => {
    if (isCompleted) return 'completed';
    if (hasStarted) return 'in-progress';
    if (!isUnlocked) return 'locked';
    return 'available';
  };

  const status = getStatus();

  // Status-based styling
  const getBorderColor = () => {
    switch (status) {
      case 'completed':
        return 'border-nile-teal-500/50 hover:border-nile-teal-500';
      case 'in-progress':
        return 'border-royal-gold-500/50 hover:border-royal-gold-500';
      case 'locked':
        return 'border-desert-sand-700/30';
      default:
        return 'border-royal-gold-500/20 hover:border-royal-gold-500/50';
    }
  };

  const handleClick = () => {
    if (!isUnlocked) {
      setShowUnlockModal(true);
    }
  };

  return (
    <>
      <Card
        className={`p-6 transition-all duration-300 hover:shadow-lg ${getBorderColor()} ${
          !isUnlocked ? 'opacity-75' : ''
        } relative overflow-hidden group`}
      >
        {/* Background glow effect */}
        {isUnlocked && !isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-br from-royal-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Header with Badge and Status */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <span className="text-5xl">{module.badge}</span>

          <div className="flex flex-col items-end gap-2">
            {!isUnlocked && (
              <Lock className="w-5 h-5 text-royal-gold-500" />
            )}
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-nile-teal-500" />
            )}
            {status === 'in-progress' && (
              <Badge variant="warning" className="text-xs">
                In Progress
              </Badge>
            )}
          </div>
        </div>

        {/* Module Info */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-royal-gold-400 mb-2 group-hover:text-royal-gold-300 transition-colors">
            {module.title}
          </h3>

          <p className="text-sm text-desert-sand-200 mb-4 line-clamp-2">
            {module.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-desert-sand-300 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {module.duration} min
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-nile-teal-400 font-semibold">
              <Award className="w-3 h-3" />
              {module.xpReward} XP
            </span>
            <span>•</span>
            <span>{module.lessons.length} lessons</span>
          </div>

          {/* Progress Bar (only if started) */}
          {hasStarted && !isCompleted && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-desert-sand-300 mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Quiz Score (if completed) */}
          {isCompleted && moduleProgress?.quizScore !== null && (
            <div className="mb-4 p-3 bg-nile-teal-900/20 border border-nile-teal-500/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-desert-sand-200">Quiz Score:</span>
                <span className="text-nile-teal-400 font-bold">
                  {moduleProgress.quizScore}%
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {isUnlocked ? (
            <Link href={`/academy/${module.id}`} className="block">
              <Button className="w-full" variant={isCompleted ? 'outline' : 'default'}>
                {isCompleted ? 'Review Module' : hasStarted ? 'Continue Learning' : 'Start Module'}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="w-full border-royal-gold-500/50 hover:border-royal-gold-500"
              onClick={handleClick}
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Module
            </Button>
          )}

          {/* Prerequisites (if any and locked) */}
          {!isUnlocked && module.prerequisites.length > 0 && (
            <p className="text-xs text-desert-sand-400 mt-3 text-center">
              Complete {module.prerequisites.join(', ')} first
            </p>
          )}
        </div>
      </Card>

      {/* Unlock Modal */}
      {!isUnlocked && (
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          module={module}
        />
      )}
    </>
  );
}
