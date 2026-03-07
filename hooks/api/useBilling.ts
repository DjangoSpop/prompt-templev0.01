/**
 * Billing hooks using React Query
 * Wired to backend billing API contracts per FRONTEND_BILLING_CREDITS_GUIDE.md
 * Root-level re-export â€” app code should import from @/hooks/api/useBilling (src/).
 */

export {
  billingKeys,
  useBillingPlans,
  useSubscription,
  useEntitlements,
  useBillingUsage,
  useIsPremium,
  usePlanCode,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useBillingActions,
  useFeatureAccess,
} from '../../src/hooks/api/useBilling';

export type {
  BillingPlan,
  Entitlements,
  SubscriptionState,
  UsageSummary,
  PlanCode,
  FeatureAccessResult,
} from '../../src/hooks/api/useBilling';

