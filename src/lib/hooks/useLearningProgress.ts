'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LearningProgress {
  pathId: string;
  lessonsCompleted: number;
  totalLessons: number;
  completedAt?: string;
  certificateId?: string;
}

const STORAGE_KEY = 'pt-learning-progress';

function generateCertificateId(pathId: string, completedAt: string): string {
  const input = `${pathId}-${completedAt}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `PT-CERT-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0')}`;
}

function loadProgress(): LearningProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProgress(progress: LearningProgress[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress[]>([]);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const getProgress = useCallback((pathId: string): LearningProgress | undefined => {
    return progress.find((p) => p.pathId === pathId);
  }, [progress]);

  const updateProgress = useCallback((pathId: string, lessonsCompleted: number, totalLessons: number) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.pathId === pathId);
      let updated: LearningProgress[];
      if (existing) {
        updated = prev.map((p) =>
          p.pathId === pathId ? { ...p, lessonsCompleted, totalLessons } : p
        );
      } else {
        updated = [...prev, { pathId, lessonsCompleted, totalLessons }];
      }
      saveProgress(updated);
      return updated;
    });
  }, []);

  const completeLesson = useCallback((pathId: string, totalLessons: number) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.pathId === pathId);
      const current = existing?.lessonsCompleted ?? 0;
      const newCount = Math.min(current + 1, totalLessons);
      const isNowComplete = newCount >= totalLessons;
      const completedAt = isNowComplete ? new Date().toISOString() : undefined;
      const certificateId = isNowComplete && completedAt
        ? generateCertificateId(pathId, completedAt)
        : undefined;

      let updated: LearningProgress[];
      if (existing) {
        updated = prev.map((p) =>
          p.pathId === pathId
            ? {
                ...p,
                lessonsCompleted: newCount,
                ...(isNowComplete ? { completedAt, certificateId } : {}),
              }
            : p
        );
      } else {
        updated = [
          ...prev,
          {
            pathId,
            lessonsCompleted: newCount,
            totalLessons,
            ...(isNowComplete ? { completedAt, certificateId } : {}),
          },
        ];
      }
      saveProgress(updated);
      return updated;
    });
  }, []);

  const isPathCompleted = useCallback((pathId: string): boolean => {
    const p = progress.find((x) => x.pathId === pathId);
    return p ? p.lessonsCompleted >= p.totalLessons : false;
  }, [progress]);

  return { progress, getProgress, updateProgress, completeLesson, isPathCompleted };
}
