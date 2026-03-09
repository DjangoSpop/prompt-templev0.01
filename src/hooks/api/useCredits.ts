/**
 * useCredits — unified hook for credit balance, plan info, and warnings.
 *
 * Single source of truth: /billing/me/usage/ (credits_remaining) is the
 * backend-persisted per-user balance. The entitlements endpoint provides plan
 * limits and feature flags but its credits_available can reflect the plan cap
 * rather than the actual remaining balance — so we always prefer usage data.
 */

import { useCreditsStore } from '@/store/credits';
import { useBillingUsage, useEntitlements } from '@/hooks/api/useBilling';
import { useEffect } from 'react';

export function useCredits() {
  const store = useCreditsStore();
  const {
    data: usage,
    refetch: refetchUsage,
    isLoading: isLoadingUsage,
  } = useBillingUsage();
  const {
    data: entitlements,
    refetch: refetchEntitlements,
    isLoading: isLoadingEntitlements,
  } = useEntitlements();

  // Hydrate store from backend data whenever either query updates.
  // Usage endpoint is authoritative for the credit balance because it tracks
  // actual consumption per-user. Entitlements provide plan code + monthly cap.
  useEffect(() => {
    if (usage) {
      // Ground truth: actual remaining balance from /billing/me/usage/
      const remaining = usage.credits_remaining;
      store.syncFromHeaders(remaining, null, remaining <= 10);
    } else if (entitlements) {
      // Fallback until usage loads: use credits_balance (actual remaining) NOT
      // credits_available which can reflect the plan cap (e.g. 4000 for POWER).
      const balance = entitlements.credits_balance ?? 0;
      store.syncFromHeaders(balance, null, balance <= 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usage, entitlements]);

  useEffect(() => {
    if (entitlements) {
      store.setPlan(entitlements.plan_code ?? 'FREE');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitlements]);

  const refresh = async () => {
    await Promise.all([refetchUsage(), refetchEntitlements()]);
  };

  return {
    /** Raw balance from last header sync */
    balance: store.creditsRemaining,
    /** Effective available (balance minus optimistic reservations) */
    available: store.creditsAvailable,
    /** Credits currently reserved by in-flight actions */
    reserved: store.creditsReserved,
    /** Current plan code */
    plan: store.planCode,
    /** Whether credits are low */
    isLow: store.isLowCredits,
    /** Whether credits are fully depleted */
    isDepleted: store.isDepleted,
    /** True while either billing query is in flight */
    isLoading: isLoadingUsage || isLoadingEntitlements,
    /** Force-refresh both usage and entitlements from server */
    refresh,
    /** Monthly credit limit from entitlements */
    monthlyCredits: entitlements?.monthly_credits ?? 0,
    /** Credits consumed this billing period (from usage endpoint) */
    creditsConsumed: usage?.credits_consumed_this_period ?? 0,
  };
}
