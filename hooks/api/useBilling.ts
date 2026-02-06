/**
 * Billing hooks using React Query
 * Provides comprehensive billing and subscription management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Query keys
export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  plan: (id: number) => [...billingKeys.all, 'plan', id] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  entitlements: () => [...billingKeys.all, 'entitlements'] as const,
  usage: () => [...billingKeys.all, 'usage'] as const,
};

// Query Hooks
export function useBillingPlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => apiClient.getBillingPlans(),
    staleTime: 30 * 60 * 1000, // 30 minutes - plans don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useBillingPlan(id: number | undefined) {
  return useQuery({
    queryKey: billingKeys.plan(id!),
    queryFn: () => apiClient.getBillingPlan(id!),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => apiClient.getSubscription(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useEntitlements() {
  return useQuery({
    queryKey: billingKeys.entitlements(),
    queryFn: () => apiClient.getEntitlements(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useBillingUsage() {
  return useQuery({
    queryKey: billingKeys.usage(),
    queryFn: () => apiClient.getBillingUsage(),
    staleTime: 1 * 60 * 1000, // 1 minute - usage changes frequently
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Mutation Hooks
export function useCreateCheckoutSession() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { plan_id: number; success_url?: string; cancel_url?: string }) =>
      apiClient.createCheckoutSession(data),
    onSuccess: (data) => {
      if (data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
      } else {
        toast.success('Checkout session created');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => apiClient.createPortalSession(),
    onSuccess: (data) => {
      if (data.portal_url) {
        // Redirect to customer portal
        window.location.href = data.portal_url;
      } else {
        toast.success('Portal session created');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to open billing portal');
    },
  });
}

/**
 * Combined hook for easy billing actions
 */
export function useBillingActions() {
  const createCheckout = useCreateCheckoutSession();
  const createPortal = useCreatePortalSession();

  return {
    // Checkout
    createCheckoutSession: createCheckout.mutate,
    isCreatingCheckout: createCheckout.isPending,
    checkoutError: createCheckout.error,

    // Portal
    createPortalSession: createPortal.mutate,
    isCreatingPortal: createPortal.isPending,
    portalError: createPortal.error,
  };
}

/**
 * Hook to check if a feature is available based on entitlements
 */
export function useFeatureAccess(feature: string) {
  const { data: entitlements, isLoading } = useEntitlements();

  if (isLoading || !entitlements) {
    return { hasAccess: false, isLoading: true };
  }

  const entitlement = entitlements.find((e: any) => e.feature === feature);

  if (!entitlement) {
    return { hasAccess: false, isLoading: false, entitlement: null };
  }

  const hasAccess = entitlement.unlimited || entitlement.remaining > 0;

  return {
    hasAccess,
    isLoading: false,
    entitlement,
    remaining: entitlement.remaining,
    limit: entitlement.limit,
    used: entitlement.used,
    unlimited: entitlement.unlimited,
  };
}
