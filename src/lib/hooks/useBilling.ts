import { useQuery, useMutation } from '@tanstack/react-query';
import { billingService } from '../api/billing';

interface CheckoutSessionRequest {
  plan_id: number;
  success_url?: string;
  cancel_url?: string;
  coupon_code?: string;
}

export const useBillingPlans = () => {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingService.getPlans(),
    staleTime: 30 * 60 * 1000, // 30 minutes - plans don't change often
  });
};

export const useBillingPlan = (id: number | undefined) => {
  return useQuery({
    queryKey: ['billing', 'plan', id],
    queryFn: () => billingService.getPlan(id!),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSubscription = () => {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingService.getSubscription(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEntitlements = () => {
  return useQuery({
    queryKey: ['billing', 'entitlements'],
    queryFn: () => billingService.getEntitlements(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBillingUsage = () => {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => billingService.getUsage(),
    staleTime: 1 * 60 * 1000, // 1 minute - usage changes frequently
  });
};

export const useBillingActions = () => {
  const createCheckoutSessionMutation = useMutation({
    mutationFn: (request: CheckoutSessionRequest) => billingService.createCheckoutSession(request),
  });

  const createCustomerPortalSessionMutation = useMutation({
    mutationFn: () => billingService.createCustomerPortalSession(),
  });

  return {
    // Actions
    createCheckoutSession: createCheckoutSessionMutation.mutate,
    createCustomerPortalSession: createCustomerPortalSessionMutation.mutate,

    // Loading states
    isCreatingCheckout: createCheckoutSessionMutation.isPending,
    isCreatingPortal: createCustomerPortalSessionMutation.isPending,

    // Error states
    checkoutError: createCheckoutSessionMutation.error,
    portalError: createCustomerPortalSessionMutation.error,

    // Results
    checkoutResult: createCheckoutSessionMutation.data,
    portalResult: createCustomerPortalSessionMutation.data,
  };
};