/**
 * Academy Completion Page
 *
 * Route: /academy/completion
 * Shown when user has completed all modules and wants to claim certificate.
 * Redirects to academy if course is not yet complete.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyStore, selectIsCourseComplete } from '@/lib/stores/academyStore';
import { CourseCompletionScreen } from '@/components/certificates/CourseCompletionScreen';

export default function CompletionPage() {
  const router = useRouter();
  const isCourseComplete = useAcademyStore(selectIsCourseComplete);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isCourseComplete) {
      router.replace('/academy');
    }
  }, [mounted, isCourseComplete, router]);

  if (!mounted || !isCourseComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
        <div className="w-10 h-10 rounded-full border-2 border-royal-gold-500/40 border-t-royal-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <CourseCompletionScreen
      onContinue={() => router.push('/academy')}
    />
  );
}
