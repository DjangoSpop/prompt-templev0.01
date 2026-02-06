"use client";

import React, { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/api/useBilling';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeModal?: boolean;
}

/**
 * FeatureGate component - Blocks premium features based on subscription
 * Usage: <FeatureGate feature="ai_generation">{children}</FeatureGate>
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradeModal = true 
}: FeatureGateProps) {
  const { hasAccess, isLoading, entitlement } = useFeatureAccess(feature);
  const [showModal, setShowModal] = React.useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div 
            className="relative p-6 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors"
            onClick={() => showUpgradeModal && setShowModal(true)}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Premium Feature</h4>
                <p className="text-sm text-muted-foreground">
                  {entitlement && entitlement.limit > 0 
                    ? `You've reached your limit for this feature (${entitlement.used}/${entitlement.limit})`
                    : 'Upgrade your plan to unlock this feature'
                  }
                </p>
              </div>
              {showUpgradeModal && (
                <Button size="sm" variant="default">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        )}

        {showUpgradeModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upgrade Required</DialogTitle>
                <DialogDescription>
                  This feature is not available on your current plan.
                  {entitlement && entitlement.limit > 0 && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <strong>Current Usage:</strong> {entitlement.used} / {entitlement.limit}
                      </p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => router.push('/pricing')}>
                  View Plans
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return <>{children}</>;
}

interface FeatureLimitWarningProps {
  feature: string;
  threshold?: number; // Show warning when usage exceeds this percentage (default 80%)
}

/**
 * FeatureLimitWarning - Shows warning when approaching feature limits
 */
export function FeatureLimitWarning({ feature, threshold = 80 }: FeatureLimitWarningProps) {
  const { entitlement, hasAccess } = useFeatureAccess(feature);

  if (!entitlement || entitlement.unlimited || !hasAccess) {
    return null;
  }

  const percentage = (entitlement.used / entitlement.limit) * 100;

  if (percentage < threshold) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
      <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <p className="text-amber-700 dark:text-amber-300">
        <strong>Approaching limit:</strong> {entitlement.remaining} remaining out of {entitlement.limit}
      </p>
    </div>
  );
}
