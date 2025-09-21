import { BaseApiClient } from './base';

interface BillingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
  is_popular: boolean;
  stripe_price_id: string;
}

interface Subscription {
  id: string;
  plan: BillingPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

interface Entitlement {
  feature: string;
  limit: number;
  used: number;
  remaining: number;
  unlimited: boolean;
}

interface Usage {
  period: string;
  templates_created: number;
  templates_used: number;
  ai_generations: number;
  api_calls: number;
  storage_used: number;
  bandwidth_used: number;
}

interface CheckoutSessionRequest {
  plan_id: number;
  success_url?: string;
  cancel_url?: string;
  coupon_code?: string;
}

interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

interface CustomerPortalResponse {
  portal_url: string;
}

export class BillingService extends BaseApiClient {
  async getPlans(): Promise<BillingPlan[]> {
    return this.request<BillingPlan[]>('/api/v2/billing/plans/');
  }

  async getPlan(id: number): Promise<BillingPlan> {
    return this.request<BillingPlan>(`/api/v2/billing/plans/${id}/`);
  }

  async getSubscription(): Promise<Subscription> {
    return this.request<Subscription>('/api/v2/billing/me/subscription/');
  }

  async getEntitlements(): Promise<Entitlement[]> {
    return this.request<Entitlement[]>('/api/v2/billing/me/entitlements/');
  }

  async getUsage(): Promise<Usage> {
    return this.request<Usage>('/api/v2/billing/me/usage/');
  }

  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    return this.request<CheckoutSessionResponse>('/api/v2/billing/checkout/', {
      method: 'POST',
      data: request,
    });
  }

  async createCustomerPortalSession(): Promise<CustomerPortalResponse> {
    return this.request<CustomerPortalResponse>('/api/v2/billing/portal/', {
      method: 'POST',
    });
  }
}

export const billingService = new BillingService();