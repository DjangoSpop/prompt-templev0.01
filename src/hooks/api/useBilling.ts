/**
 * Billing hooks using React Query
 * Wired to backend billing API contracts per FRONTEND_BILLING_CREDITS_GUIDE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import type {
  BillingPlan,
  Entitlements,
  SubscriptionState,
  UsageSummary,
  CheckoutSessionResponse,
  BillingPortalResponse,
  PlanCode,
} from '@/lib/api/typed-client';
import { toast } from 'sonner';

export type { BillingPlan, Entitlements, SubscriptionState, UsageSummary, PlanCode };

// â”€â”€ Query keys â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  entitlements: () => [...billingKeys.all, 'entitlements'] as const,
  usage: () => [...billingKeys.all, 'usage'] as const,
};

// â”€â”€ Query Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Returns the unwrapped plans array from { plans: [...] }. Public endpoint â€” no auth required. */
export function useBillingPlans() {
  return useQuery<BillingPlan[]>({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const res = await apiClient.getBillingPlans();
      return res.plans;
    },
    staleTime: 30 * 60 * 1000, // 30 min â€” plans rarely change
    gcTime: 60 * 60 * 1000,
  });
}

/** Returns the unwrapped subscription object. Auth required. */
export function useSubscription() {
  return useQuery<SubscriptionState>({
    queryKey: billingKeys.subscription(),
    queryFn: async () => {
      const res = await apiClient.getSubscription();
      return res.subscription;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Returns the unwrapped entitlements object â€” the single source of truth for
 * feature access. Refreshes every 60 s per backend guide.
 */
export function useEntitlements() {
  return useQuery<Entitlements>({
    queryKey: billingKeys.entitlements(),
    queryFn: async () => {
      const res = await apiClient.getEntitlements();
      return res.entitlements;
    },
    staleTime: 60 * 1000,  // 60 s per backend guide
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
}

/** Returns the unwrapped usage summary. Refetches every 5 min. */
export function useBillingUsage() {
  return useQuery<UsageSummary>({
    queryKey: billingKeys.usage(),
    queryFn: async () => {
      const res = await apiClient.getBillingUsage();
      return res.usage;
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });
}

// â”€â”€ Derived helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Returns true when the user is on PRO or POWER plan. */
export function useIsPremium() {
  const { data: entitlements } = useEntitlements();
  return (['PRO', 'POWER'] as PlanCode[]).includes(entitlements?.plan_code as PlanCode);
}

/** Returns the current plan code, or 'FREE' while loading. */
export function usePlanCode(): PlanCode {
  const { data: entitlements } = useEntitlements();
  return entitlements?.plan_code ?? 'FREE';
}

// â”€â”€ Mutation Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Creates a Stripe checkout session for the given plan_code and redirects.
 * Accepts plan_code 'PRO' | 'POWER' (backend path: /billing/checkout-session/{plan_code}/).
 */
export function useCreateCheckoutSession() {
  return useMutation<
    CheckoutSessionResponse,
    Error,
    { plan_code: 'PRO' | 'POWER'; success_url?: string; cancel_url?: string }
  >({
    mutationFn: ({ plan_code, success_url, cancel_url }) =>
      apiClient.createCheckoutSession(plan_code, { success_url, cancel_url }),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start checkout');
    },
  });
}

/** Opens the Stripe Billing Portal and redirects. */
export function useCreatePortalSession() {
  return useMutation<BillingPortalResponse, Error, { return_url?: string } | void>({
    mutationFn: (opts) =>
      apiClient.createPortalSession(opts instanceof Object ? opts?.return_url : undefined),
    onSuccess: (data) => {
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to open billing portal');
    },
  });
}

/** Convenience hook â€” bundles checkout + portal mutations for billing pages. */
export function useBillingActions() {
  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();

  return {
    startCheckout: checkout.mutate,
    isStartingCheckout: checkout.isPending,
    checkoutError: checkout.error,

    openPortal: portal.mutate,
    isOpeningPortal: portal.isPending,
    portalError: portal.error,
  };
}

// â”€â”€ Feature Access â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Feature key â†’ entitlements property mapping.
 * Boolean flags read directly; 'ai_generation' checks credits_available.
 */
const FEATURE_KEY_MAP: Partial<Record<string, keyof Entitlements>> = {
  premium_templates: 'premium_templates',
  analytics: 'analytics',
  api_access: 'api_access',
  streaming: 'streaming_enabled',
  collaboration: 'collaboration',
  priority_support: 'priority_support',
  ads_free: 'ads_free',
};

export interface EntitlementDetails {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  /** Available credits — only set when feature is credit-gated */
  creditsAvailable?: number;
  planCode?: PlanCode;
  /** Populated for credit-gated features; undefined for boolean feature flags */
  entitlement?: EntitlementDetails;
}

/**
 * Check whether the current user can access a feature.
 *
 * Special feature keys:
 *  - 'ai_generation' / 'credits' â†’ checks credits_available > 0
 *  - 'premium' â†’ checks plan_code is PRO or POWER
 * All other keys are looked up in FEATURE_KEY_MAP.
 */
export function useFeatureAccess(feature: string): FeatureAccessResult {
  const { data: entitlements, isLoading } = useEntitlements();

  if (isLoading) {
    return { hasAccess: false, isLoading: true };
  }

  if (!entitlements) {
    return { hasAccess: false, isLoading: false };
  }

  const planCode = entitlements.plan_code;

  if (feature === 'ai_generation' || feature === 'credits') {
    const limit = entitlements.monthly_credits;
    const remaining = entitlements.credits_available;
    const used = Math.max(0, limit - remaining);
    return {
      hasAccess: remaining > 0,
      isLoading: false,
      creditsAvailable: remaining,
      planCode,
      entitlement: { used, limit, remaining, unlimited: false },
    };
  }

  if (feature === 'premium') {
    return {
      hasAccess: planCode === 'PRO' || planCode === 'POWER',
      isLoading: false,
      planCode,
    };
  }

  const key = FEATURE_KEY_MAP[feature];
  if (!key) {
    return { hasAccess: false, isLoading: false, planCode };
  }

  return {
    hasAccess: !!entitlements[key],
    isLoading: false,
    planCode,
  };
}


