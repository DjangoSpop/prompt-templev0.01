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
import { Lock, CheckCircle, Clock, Award, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useAcademyStore, selectIsModuleUnlocked, selectIsModuleCompleted, selectModuleProgress } from '@/lib/stores/academyStore';
import { useState } from 'react';
import { UnlockModal } from './UnlockModal';

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUnlocked = useAcademyStore(selectIsModuleUnlocked(module.id));
  const isCompleted = useAcademyStore(selectIsModuleCompleted(module.id));
  const moduleProgress = useAcademyStore(selectModuleProgress(module.id));

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/academy/${module.id}`;
    const shareText = `🎓 Check out this module from Prompt Temple Academy: "${module.title}"\n\nLearn prompt engineering with interactive lessons and quizzes!\n\n${shareUrl}`;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${module.title} - Prompt Temple Academy`,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        console.log('Native share failed, falling back to clipboard');
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

  // Status-based styling with softer colors
  const getBorderColor = () => {
    switch (status) {
      case 'completed':
        return 'border-teal-200/40 hover:border-teal-200/60';
      case 'in-progress':
        return 'border-amber-200/40 hover:border-amber-200/60';
      case 'locked':
        return 'border-desert-sand-700/20';
      default:
        return 'border-amber-200/25 hover:border-amber-200/40';
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
          !isUnlocked ? 'opacity-60' : ''
        } relative overflow-hidden group bg-obsidian-800/40 backdrop-blur-sm text-white`}
      >
        {/* Background glow effect */}
        {isUnlocked && !isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Header with Badge and Status */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <span className="text-5xl">{module.badge}</span>

          <div className="flex flex-col items-end gap-2">
            {!isUnlocked && (
              <Lock className="w-5 h-5 text-amber-300" />
            )}
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-teal-300" />
            )}
            {status === 'in-progress' && (
              <Badge variant="warning" className="text-xs bg-amber-200/15 text-amber-200 border-amber-200/30">
                In Progress
              </Badge>
            )}
          </div>
        </div>

        {/* Module Info */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-amber-100 mb-2 group-hover:text-amber-50 transition-colors">
            {module.title}
          </h3>

          <p className="text-sm text-gray-200 mb-4 line-clamp-2 leading-relaxed">
            {module.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {module.duration} min
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1 text-teal-300 font-semibold">
              <Award className="w-3 h-3" />
              {module.xpReward} XP
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">{module.lessons.length} lessons</span>
          </div>

          {/* Progress Bar (only if started) */}
          {hasStarted && !isCompleted && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                <span>Progress</span>
                <span className="font-semibold text-amber-200">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Quiz Score (if completed) */}
          {isCompleted && moduleProgress?.quizScore !== null && (
            <div className="mb-4 p-3 bg-teal-400/10 border border-teal-200/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-200 font-medium">Quiz Score:</span>
                <span className="text-teal-300 font-bold">
                  {moduleProgress.quizScore}%
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {isUnlocked ? (
            <Link href={`/academy/${module.id}`} className="block">
              <Button className="w-full bg-amber-200/20 text-amber-100 border-amber-200/30 hover:bg-amber-200/30 hover:border-amber-200/40" variant={isCompleted ? 'outline' : 'default'}>
                {isCompleted ? 'Review Module' : hasStarted ? 'Continue Learning' : 'Start Module'}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="w-full border-amber-200/30 text-amber-200 hover:border-amber-200/40 hover:bg-amber-200/10"
              onClick={handleClick}
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Module
            </Button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-amber-200/20 text-amber-200 hover:border-amber-200/40 hover:bg-amber-200/10 rounded-lg transition-all text-sm"
            title="Share this module"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Module</span>
              </>
            )}
          </button>

          {/* Prerequisites (if any and locked) */}
          {!isUnlocked && module.prerequisites.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center">
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
