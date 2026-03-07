'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEntitlements } from '@/hooks/api/useBilling';
import { useQueryClient } from '@tanstack/react-query';
import { billingKeys } from '@/hooks/api/useBilling';

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 30000;

export default function BillingSuccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: entitlements, isLoading } = useEntitlements();
  const [timedOut, setTimedOut] = useState(false);
  const activated = entitlements?.plan_code && entitlements.plan_code !== 'FREE';

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activated) return;

    // Bust the cache immediately on mount so we don't read stale FREE-plan data
    queryClient.removeQueries({ queryKey: billingKeys.entitlements() });

    // Poll entitlements every 2s — webhook fires checkout.session.completed
    // backend sets subscription = active + credits_balance = monthly_credits
    pollingRef.current = setInterval(() => {
      // refetchQueries forces an immediate network call (vs. invalidateQueries
      // which only marks stale and may defer the request)
      queryClient.refetchQueries({ queryKey: billingKeys.entitlements() });
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }, TIMEOUT_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop polling once activated
  useEffect(() => {
    if (activated) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [activated]);

  if (timedOut && !activated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-yellow-500/10">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Taking longer than expected</h1>
            <p className="text-muted-foreground text-sm">
              Your payment was received, but plan activation is delayed. This usually
              resolves within a minute. Try refreshing — if it persists contact support.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button onClick={() => router.push('/billing')}>
              Go to Billing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !activated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Activating your plan…</h1>
            <p className="text-muted-foreground text-sm">
              Usually takes 2–3 seconds. Hang tight!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Plan is active
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome to {entitlements.plan_name}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Your subscription is active and ready to use.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="font-semibold">{entitlements.plan_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Credits</span>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold">{entitlements.credits_balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Models</span>
            <span className="font-semibold text-sm">
              {entitlements.allowed_models.join(', ')}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/billing')}>
            View Billing
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Start Creating →
          </Button>
        </div>
      </div>
    </div>
  );
}
