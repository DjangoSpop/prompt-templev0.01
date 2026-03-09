'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { useCreditsStore } from '@/store/credits';

const REFILL_TOAST_KEY = 'pt-daily-refill-shown';

/**
 * Shows a one-time toast per day for free-tier users when their
 * daily 5 credits have been refreshed.
 */
export function DailyRefillToast() {
  const planCode = useCreditsStore((s) => s.planCode);
  const creditsRemaining = useCreditsStore((s) => s.creditsRemaining);
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (planCode !== 'FREE') return;
    if (creditsRemaining === null) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastShown = typeof window !== 'undefined' ? localStorage.getItem(REFILL_TOAST_KEY) : null;
    if (lastShown === today) return;

    shown.current = true;
    localStorage.setItem(REFILL_TOAST_KEY, today);

    toast('Your 5 free daily credits have been refreshed!', {
      icon: <Sparkles className="h-4 w-4 text-[#C9A227]" />,
      duration: 6000,
      className: 'border-[#C9A227]/30',
    });
  }, [planCode, creditsRemaining]);

  return null;
}
