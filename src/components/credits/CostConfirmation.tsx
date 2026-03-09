'use client';

import { Coins, ArrowRight, ShieldAlert } from 'lucide-react';
import { useCostPreview } from '@/hooks/api/useCostPreview';
import { useCreditsStore } from '@/store/credits';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CostConfirmationProps {
  /** AI feature key (e.g. 'prompt_optimizer', 'askme') */
  feature: string;
  /** Extra params forwarded to cost-preview endpoint */
  params?: Record<string, unknown>;
  /** Called when user confirms the action */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

export function CostConfirmation({
  feature,
  params,
  onConfirm,
  onCancel,
}: CostConfirmationProps) {
  const { cost, canAfford, upgradeRequired, isLoading } = useCostPreview(feature, params);
  const available = useCreditsStore((s) => s.creditsAvailable);
  const deductOptimistic = useCreditsStore((s) => s.deductOptimistic);

  const handleConfirm = () => {
    if (cost > 0) deductOptimistic(cost);
    onConfirm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 rounded-lg border bg-card animate-pulse">
        <Coins className="h-4 w-4 text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Checking cost...</span>
      </div>
    );
  }

  if (upgradeRequired) {
    return (
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-amber-700 dark:text-amber-300">
            Upgrade Required
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          You need credits to use this feature. Upgrade your plan to continue.
        </p>
        <Link href="/billing">
          <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-semibold">
            Upgrade Plan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm">
          <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="font-medium">{cost} credit{cost !== 1 ? 's' : ''}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {Math.max(0, available - cost)} remaining after
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={!canAfford}
          className="bg-primary text-primary-foreground"
        >
          {canAfford ? 'Confirm' : 'Insufficient Credits'}
        </Button>
      </div>
    </div>
  );
}
