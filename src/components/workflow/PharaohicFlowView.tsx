'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scroll,
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Eye,
  Wand2,
  Loader,
  ChevronRight,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { generateWorkflow, trackAnalyticsEvent } from '@/lib/api/client';
import { WorkflowGenerationRequest, WorkflowGenerationResponse, WorkflowStep } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

interface PharaohicFlowViewProps {
  goal: string;
  onStepComplete?: (stepId: string, result: any) => void;
  onWorkflowComplete?: (workflow: WorkflowGenerationResponse) => void;
  className?: string;
}

interface StepStatus {
  id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

const HIEROGLYPH_SYMBOLS = ['𓈖', '𓊪', '𓂋', '𓅱', '𓆑', '𓇋', '𓈗', '𓉔', '𓊖', '𓋹'];

export const PharaohicFlowView: React.FC<PharaohicFlowViewProps> = ({
  goal,
  onStepComplete,
  onWorkflowComplete,
  className = '',
}) => {
  const { user, token } = useAuth();
  const [workflow, setWorkflow] = useState<WorkflowGenerationResponse | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Map<string, StepStatus>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate workflow on mount
  useEffect(() => {
    if (goal && !workflow && !isGenerating) {
      generateWorkflowFromGoal();
    }
  }, [goal]);

  const generateWorkflowFromGoal = useCallback(async () => {
    if (!goal || !token) return;

    setIsGenerating(true);
    setError(null);

    try {
      const request: WorkflowGenerationRequest = {
        goal,
        complexity: 'medium',
        max_steps: 6,
        user_preferences: {
          preferred_style: 'pharaonic',
          experience_level: user?.is_premium ? 'expert' : 'intermediate',
        },
      };

      const response = await generateWorkflow(request, token);
      setWorkflow(response);

      // Initialize step statuses
      const statuses = new Map<string, StepStatus>();
      response.steps.forEach((step, index) => {
        statuses.set(step.id, {
          id: step.id,
          status: index === 0 ? 'available' : 'locked',
        });
      });
      setStepStatuses(statuses);

      // Track analytics
      await trackAnalyticsEvent({
        event_type: 'workflow_completed',
        session_id: 'workflow-session',
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        metadata: {
          goal,
          steps_count: response.steps.length,
          difficulty: response.difficulty_level,
          estimated_time: response.estimated_total_time,
        },
      }, token);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  }, [goal, token, user]);

  // Start a step
  const startStep = useCallback((stepId: string) => {
    setStepStatuses(prev => {
      const updated = new Map(prev);
      const status = updated.get(stepId);
      if (status && status.status === 'available') {
        updated.set(stepId, {
          ...status,
          status: 'in_progress',
          startTime: new Date(),
        });
      }
      return updated;
    });
  }, []);

  // Complete a step
  const completeStep = useCallback((stepId: string, result?: any) => {
    setStepStatuses(prev => {
      const updated = new Map(prev);
      const status = updated.get(stepId);
      if (status && status.status === 'in_progress') {
        updated.set(stepId, {
          ...status,
          status: 'completed',
          endTime: new Date(),
          result,
        });

        // Unlock next step
        if (workflow) {
          const currentIndex = workflow.steps.findIndex(s => s.id === stepId);
          if (currentIndex >= 0 && currentIndex < workflow.steps.length - 1) {
            const nextStep = workflow.steps[currentIndex + 1];
            const nextStatus = updated.get(nextStep.id);
            if (nextStatus && nextStatus.status === 'locked') {
              updated.set(nextStep.id, {
                ...nextStatus,
                status: 'available',
              });
            }
          }
        }
      }
      return updated;
    });

    setCompletedSteps(prev => prev + 1);
    onStepComplete?.(stepId, result);

    // Check if workflow is complete
    if (workflow && completedSteps + 1 === workflow.steps.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      onWorkflowComplete?.(workflow);
    }
  }, [workflow, completedSteps, onStepComplete, onWorkflowComplete]);

  // Get step status
  const getStepStatus = (stepId: string): StepStatus => {
    return stepStatuses.get(stepId) || { id: stepId, status: 'locked' };
  };

  // Get step color scheme
  const getStepColors = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'from-emerald-500 to-green-400 border-emerald-300 text-white';
      case 'in_progress':
        return 'from-amber-500 to-yellow-400 border-amber-300 text-white animate-pulse';
      case 'available':
        return 'from-indigo-500 to-purple-400 border-indigo-300 text-white hover:from-indigo-600 hover:to-purple-500';
      case 'locked':
      default:
        return 'from-gray-300 to-gray-400 border-gray-300 text-gray-600';
    }
  };

  // Render hieroglyph for step
  const getStepHieroglyph = (index: number) => {
    return HIEROGLYPH_SYMBOLS[index % HIEROGLYPH_SYMBOLS.length];
  };

  // Render step card
  const renderStepCard = (step: WorkflowStep, index: number) => {
    const status = getStepStatus(step.id);
    const isUnlocked = status.status !== 'locked';
    const isCompleted = status.status === 'completed';
    const isInProgress = status.status === 'in_progress';
    const isAvailable = status.status === 'available';

    return (
      <motion.div
        key={step.id}
        className="relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2 }}
      >
        {/* Connection line to next step */}
        {index < (workflow?.steps.length || 0) - 1 && (
          <motion.div
            className="absolute left-1/2 top-full w-1 h-12 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full z-0"
            initial={{ height: 0 }}
            animate={{ height: 48 }}
            transition={{ delay: (index + 1) * 0.2 }}
          />
        )}

        {/* Step card */}
        <motion.div
          className={`relative z-10 p-6 rounded-xl border-2 bg-gradient-to-br ${getStepColors(status.status)} shadow-lg`}
          whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Step header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Hieroglyph symbol */}
              <motion.div
                className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl"
                animate={isInProgress ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: isInProgress ? Infinity : 0 }}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : isInProgress ? (
                  <Loader className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <span className="text-white font-bold">{getStepHieroglyph(index)}</span>
                )}
              </motion.div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{step.name}</h3>
                <p className="text-sm text-white/80">{step.description}</p>
              </div>
            </div>

            {/* Step number badge */}
            <Badge className="bg-white/20 text-white border-white/30">
              Step {index + 1}
            </Badge>
          </div>

          {/* Step details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm text-white/90">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{step.estimated_time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="capitalize">{step.difficulty}</span>
              </div>
            </div>

            <p className="text-sm text-white/80">{step.output_description}</p>

            {/* Variables preview */}
            {step.variables.length > 0 && (
              <div className="text-xs text-white/70">
                <span className="font-medium">Variables: </span>
                {step.variables.slice(0, 3).map(v => v.name).join(', ')}
                {step.variables.length > 3 && ` +${step.variables.length - 3} more`}
              </div>
            )}
          </div>

          {/* Step actions */}
          <div className="flex items-center justify-between">
            {isCompleted && status.result && (
              <Badge className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}

            {isAvailable && (
              <Button
                onClick={() => startStep(step.id)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="sm"
              >
                <Play className="w-3 h-3 mr-1" />
                Start Step
              </Button>
            )}

            {isInProgress && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => completeStep(step.id, { completed_at: new Date() })}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  size="sm"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              </div>
            )}
          </div>

          {/* Unlock animation */}
          <AnimatePresence>
            {isAvailable && status.status === 'available' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-500/20 animate-pulse"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  if (isGenerating) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4"
        >
          <Crown className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">Crafting Your Pharaonic Quest</h3>
        <p className="text-amber-700 text-center">The AI Oracle is consulting ancient wisdom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 bg-red-50 border border-red-200 rounded-xl text-center ${className}`}>
        <Crown className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Quest Generation Failed</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={generateWorkflowFromGoal} className="bg-red-600 hover:bg-red-700">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!workflow) return null;

  const progressPercentage = (completedSteps / workflow.steps.length) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-center text-white max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Quest Completed!</h2>
              <p className="text-amber-100">You have successfully navigated the Pharaonic Flow!</p>

              {/* Particle effects */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: Math.cos(i * 30 * Math.PI / 180) * 100,
                    y: Math.sin(i * 30 * Math.PI / 180) * 100,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl"
          >
            <Scroll className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Pharaonic Flow
          </h1>
        </div>

        <p className="text-gray-600 max-w-2xl mx-auto mb-6">{workflow.description}</p>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Quest Progress</span>
            <span className="text-sm text-amber-600">{completedSteps}/{workflow.steps.length}</span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-30"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Workflow steps */}
      <div className="space-y-8">
        {workflow.steps.map((step, index) => renderStepCard(step, index))}
      </div>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <Badge className="bg-amber-100 text-amber-800">
              {workflow.difficulty_level}
            </Badge>
            <span className="text-amber-700">
              <Clock className="w-4 h-4 inline mr-1" />
              {workflow.estimated_total_time}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-amber-600">
            <Award className="w-4 h-4" />
            <span className="font-medium">AI Confidence: {Math.round(workflow.metadata.ai_confidence)}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PharaohicFlowView;