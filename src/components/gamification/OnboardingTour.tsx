"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore, steps } from "@/lib/stores/gameStore";
import { toast } from "react-hot-toast";
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  Skip,
  Star,
  Zap,
  Target,
  Award,
  PartyPopper,
  Sparkles,
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    onboarding,
    user,
    startOnboarding,
    completeStep,
    nextStep,
    skipOnboarding,
    resetOnboarding,
    getCurrentLevel,
    getProgressToNextLevel,
  } = useGameStore();

  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    // Auto-complete step when user reaches the target page
    if (onboarding.isActive && pathname === steps[onboarding.currentStep]?.targetPage) {
      const currentStepId = steps[onboarding.currentStep]?.id;
      if (currentStepId && !onboarding.completedSteps.includes(currentStepId)) {
        completeStep(currentStepId);
        setEarnedPoints(steps[onboarding.currentStep].points);
        setShowCelebration(true);
        
        toast.success(
          `🎉 Step completed! +${steps[onboarding.currentStep].points} XP`,
          {
            duration: 4000,
            style: {
              background: 'hsl(var(--achievement))',
              color: 'hsl(var(--background))',
            },
          }
        );
        
        setTimeout(() => setShowCelebration(false), 2000);
      }
    }
  }, [pathname, onboarding.isActive, onboarding.currentStep, completeStep, onboarding.completedSteps]);

  if (!onboarding.isActive) return null;

  const currentStep = steps[onboarding.currentStep];
  const progress = (onboarding.completedSteps.length / steps.length) * 100;
  const isCurrentStepCompleted = onboarding.completedSteps.includes(currentStep?.id || '');
  const currentLevel = getCurrentLevel();
  const levelProgress = getProgressToNextLevel();

  const handleNext = () => {
    if (isCurrentStepCompleted || onboarding.currentStep === steps.length - 1) {
      nextStep();
    } else {
      // Navigate to the target page
      router.push(currentStep.targetPage);
    }
  };

  const handlePrevious = () => {
    if (onboarding.currentStep > 0) {
      useGameStore.setState((state) => ({
        onboarding: {
          ...state.onboarding,
          currentStep: state.onboarding.currentStep - 1,
        },
      }));
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    toast("Onboarding skipped. You can restart it anytime from settings.", {
      icon: "⏭️",
    });
  };

  const getStepContent = (step: typeof currentStep): OnboardingStep => {
    switch (step.id) {
      case 'welcome':
        return {
          title: "Welcome to PromptCraft Temple! 🏛️",
          description: "Your journey to mastering AI prompts begins here",
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-6xl mb-4"
                >
                  🏛️
                </motion.div>
                <p className="text-lg text-muted-foreground">
                  Welcome to the most comprehensive platform for AI prompt crafting and template management.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">1000+ Templates</h4>
                  <p className="text-sm text-muted-foreground">Professional prompts ready to use</p>
                </Card>
                <Card className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-success" />
                  <h4 className="font-semibold">AI-Powered</h4>
                  <p className="text-sm text-muted-foreground">Smart suggestions and optimization</p>
                </Card>
              </div>
            </div>
          ),
        };

      case 'dashboard':
        return {
          title: "Your Command Center 📊",
          description: "Monitor your progress and achievements",
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="text-3xl">{currentLevel.title}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Level {user.level}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(levelProgress)}%</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-primary/10 rounded">
                  <div className="text-lg font-bold text-primary">{user.totalPoints}</div>
                  <div className="text-xs">Points</div>
                </div>
                <div className="text-center p-3 bg-success/10 rounded">
                  <div className="text-lg font-bold text-success">{user.streak}</div>
                  <div className="text-xs">Streak</div>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded">
                  <div className="text-lg font-bold text-warning">{user.experience}</div>
                  <div className="text-xs">XP</div>
                </div>
              </div>
            </div>
          ),
        };

      case 'library':
        return {
          title: "Explore the Template Library 📚",
          description: "Discover thousands of professional templates",
          content: (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl mb-2"
                >
                  📚
                </motion.div>
                <p>Browse templates by category, difficulty, or search for specific topics.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Business', 'Creative', 'Technical', 'Marketing'].map((category) => (
                  <div key={category} className="p-3 bg-secondary/30 rounded text-center">
                    <div className="font-medium">{category}</div>
                    <div className="text-xs text-muted-foreground">250+ templates</div>
                  </div>
                ))}
              </div>
            </div>
          ),
        };

      default:
        return {
          title: step.title,
          description: step.description,
          content: (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">{step.badge}</div>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ),
        };
    }
  };

  const stepContent = getStepContent(currentStep);

  return (
    <>
      <Dialog open={onboarding.isActive} onOpenChange={(open) => !open && handleSkip()}>
        <DialogContent className="sm:max-w-[500px] game-background border-2 border-primary/20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-6 w-6 text-achievement" />
                  {stepContent.title}
                </DialogTitle>
                <Badge variant="secondary" className="level-badge">
                  Step {onboarding.currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <DialogDescription className="text-base">
                {stepContent.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tutorial Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3">
                  <motion.div
                    className="h-full level-progress rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </Progress>
              </div>

              {/* Step Content */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  {stepContent.content}
                </CardContent>
              </Card>

              {/* Points Preview */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-experience/10 rounded-full">
                  <Star className="h-4 w-4 text-experience" />
                  <span className="text-sm font-medium">+{currentStep.points} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-achievement/10 rounded-full">
                  <Award className="h-4 w-4 text-achievement" />
                  <span className="text-sm font-medium">{currentStep.badge} Badge</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col space-y-3">
              <div className="flex justify-between w-full">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={onboarding.currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button variant="ghost" onClick={handleSkip} className="flex items-center gap-2">
                  <Skip className="h-4 w-4" />
                  Skip Tutorial
                </Button>
                
                <Button onClick={handleNext} className="flex items-center gap-2 neon-border">
                  {isCurrentStepCompleted || onboarding.currentStep === steps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Go to {currentStep.title}
                      <Target className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
          >
            <div className="flex flex-col items-center p-6 bg-achievement/90 rounded-full backdrop-blur-sm">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
                transition={{ duration: 1, repeat: 1 }}
                className="text-4xl mb-2"
              >
                <PartyPopper />
              </motion.div>
              <div className="text-background font-bold text-xl">
                +{earnedPoints} XP
              </div>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      repeat: 1,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-background" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}