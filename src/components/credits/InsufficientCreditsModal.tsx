'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown, Coins, ArrowRight } from 'lucide-react';
import { useCreditsStore } from '@/store/credits';
import { useCreateCheckoutSession } from '@/hooks/api/useBilling';
import { useEntitlements } from '@/hooks/api/useBilling';

const FEATURE_LABELS: Record<string, string> = {
  prompt_optimizer: 'Prompt Optimizer',
  broadcast: 'Multi-AI Broadcast',
  askme: 'AskMe Interview',
  askme_start: 'AskMe Interview',
  askme_finalize: 'AskMe Prompt Builder',
  askme_submit_all: 'AskMe Prompt Builder',
  template_smart_fill: 'Smart Fill',
  template_variations: 'Template Variations',
  template_recommend: 'Template Recommendations',
};

export function InsufficientCreditsModal() {
  const { upgradeModalOpen, upgradeModalFeature, closeUpgradeModal, creditsRemaining } =
    useCreditsStore();
  const { data: entitlements } = useEntitlements();
  const checkoutMutation = useCreateCheckoutSession();

  const featureLabel = upgradeModalFeature
    ? (FEATURE_LABELS[upgradeModalFeature] ?? upgradeModalFeature)
    : 'this feature';

  const handleUpgrade = async (plan: 'PRO' | 'POWER') => {
    // useCreateCheckoutSession already redirects on success via onSuccess handler
    checkoutMutation.mutate({ plan_code: plan });
    closeUpgradeModal();
  };

  return (
    <Dialog open={upgradeModalOpen} onOpenChange={(open) => !open && closeUpgradeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Not enough credits
          </DialogTitle>
          <DialogDescription>
            You don&apos;t have enough credits to use <strong>{featureLabel}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current balance */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Your current balance</span>
            <Badge variant="outline" className="text-sm font-semibold">
              {creditsRemaining ?? entitlements?.credits_available ?? 0} credits
            </Badge>
          </div>

          {/* Plan options */}
          <div className="space-y-2">
            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={checkoutMutation.isPending}
              className="w-full text-left rounded-lg border border-primary/50 bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Pro Plan</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2,000 credits/month · Unlimited optimizer · Priority AI
              </p>
            </button>

            <button
              onClick={() => handleUpgrade('POWER')}
              disabled={checkoutMutation.isPending}
              className="w-full text-left rounded-lg border border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-sm">Power Plan</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                10,000 credits/month · All features · API access
              </p>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={closeUpgradeModal}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
