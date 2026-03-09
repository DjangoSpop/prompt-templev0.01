'use client';

import Link from 'next/link';
import { X, AlertTriangle } from 'lucide-react';
import { useCreditsStore } from '@/store/credits';

export function GlobalCreditBanner() {
  const { isLowCredits, creditBannerDismissed, dismissCreditBanner, creditsRemaining } =
    useCreditsStore();

  if (!isLowCredits || creditBannerDismissed) return null;

  return (
    <div className="relative w-full bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center justify-between gap-3 text-sm z-50">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-amber-800 dark:text-amber-200">
          {creditsRemaining !== null
            ? `You have ${creditsRemaining} credits remaining.`
            : 'Your credits are running low.'}{' '}
          <Link
            href="/billing"
            className="font-semibold underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-300"
          >
            Upgrade to get more →
          </Link>
        </span>
      </div>
      <button
        onClick={dismissCreditBanner}
        className="shrink-0 rounded p-0.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Dismiss low-credit warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
