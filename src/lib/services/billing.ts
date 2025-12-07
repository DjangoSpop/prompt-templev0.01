import { ApiResponse } from '../types';

export interface BillingPlan {
  id: number;
  name: string;
  price: number;
  features: string[];
  credits_included: number;
  is_popular?: boolean;
}

export interface UserSubscription {
  id: string;
  plan: BillingPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  credits_remaining: number;
  credits_used: number;
}

export interface UserEntitlements {
  can_use_premium_features: boolean;
  credits_remaining: number;
  max_templates_per_month: number;
  max_chat_sessions_per_day: number;
  can_access_advanced_ai: boolean;
  can_export_templates: boolean;
}

export interface UsageStats {
  templates_created: number;
  chat_sessions_used: number;
  credits_consumed: number;
  ai_requests_made: number;
  period_start: string;
  period_end: string;
}

class BillingService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/proxy';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Get all available billing plans
  async getPlans(): Promise<ApiResponse<BillingPlan[]>> {
    return this.request<BillingPlan[]>('/api/v2/billing/plans/');
  }

  // Get specific plan details
  async getPlan(planId: number): Promise<ApiResponse<BillingPlan>> {
    return this.request<BillingPlan>(`/api/v2/billing/plans/${planId}/`);
  }

  // Get user's current subscription
  async getSubscription(): Promise<ApiResponse<UserSubscription>> {
    return this.request<UserSubscription>('/api/v2/billing/me/subscription/');
  }

  // Get user's entitlements
  async getEntitlements(): Promise<ApiResponse<UserEntitlements>> {
    return this.request<UserEntitlements>('/api/v2/billing/me/entitlements/');
  }

  // Get user's usage statistics
  async getUsage(): Promise<ApiResponse<UsageStats>> {
    return this.request<UsageStats>('/api/v2/billing/me/usage/');
  }

  // Create checkout session for plan upgrade
  async createCheckoutSession(planId: number): Promise<ApiResponse<{ checkout_url: string }>> {
    return this.request<{ checkout_url: string }>('/api/v2/billing/checkout/', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  }

  // Create customer portal session
  async createPortalSession(): Promise<ApiResponse<{ portal_url: string }>> {
    return this.request<{ portal_url: string }>('/api/v2/billing/portal/', {
      method: 'POST',
    });
  }

  // Check if user can perform action (credits, limits, etc.)
  async canPerformAction(action: string, cost: number = 1): Promise<boolean> {
    try {
      const entitlements = await this.getEntitlements();
      
      switch (action) {
        case 'chat_message':
          return entitlements.data.credits_remaining >= cost;
        case 'create_template':
          const usage = await this.getUsage();
          return usage.data.templates_created < entitlements.data.max_templates_per_month;
        case 'ai_generation':
          return entitlements.data.can_access_advanced_ai && 
                 entitlements.data.credits_remaining >= cost;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking action permissions:', error);
      return false;
    }
  }

  // Consume credits for an action
  async consumeCredits(action: string, amount: number): Promise<boolean> {
    try {
      // This would typically be handled by the backend when processing the action
      // But we can track it locally for immediate UI updates
      const currentEntitlements = await this.getEntitlements();
      const remainingCredits = currentEntitlements.data.credits_remaining - amount;
      
      // Update local storage or state management with new credit count
      localStorage.setItem('credits_remaining', remainingCredits.toString());
      
      return remainingCredits >= 0;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }
}

export const billingService = new BillingService();
