'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard,
  Zap,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Crown,
  ArrowUp
} from 'lucide-react';
import useSWR from 'swr';
import { apiClient, type BillingUsage } from '@/lib/api';

const fetcher = async () => {
  const response = await apiClient.getBillingUsage();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
};

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  color?: 'green' | 'yellow' | 'red';
}

function UsageCard({ title, used, limit, unit, icon, color = 'green' }: UsageCardProps) {
  const percentage = (used / limit) * 100;
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  const getColorClasses = () => {
    if (isDanger) return 'text-red';
    if (isWarning) return 'text-yellow';
    return 'text-green';
  };

  const getProgressColor = () => {
    if (isDanger) return 'bg-red';
    if (isWarning) return 'bg-yellow';
    return 'bg-green';
  };

  return (
    <Card className="bg-bg-secondary border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
        <div className={getColorClasses()}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-text-primary">
              {used.toLocaleString()}
            </div>
            <div className="text-sm text-text-muted">
              / {limit.toLocaleString()} {unit}
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress 
              value={percentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs">
              <span className={getColorClasses()}>
                {percentage.toFixed(1)}% used
              </span>
              <span className="text-text-muted">
                {(limit - used).toLocaleString()} remaining
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onUpgrade: () => void;
}

function PlanCard({ name, price, features, isCurrentPlan, isRecommended, onUpgrade }: PlanCardProps) {
  return (
    <Card className={`bg-bg-secondary border-border relative ${isRecommended ? 'ring-2 ring-brand' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-medium">
            Recommended
          </span>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-text-primary text-xl">{name}</CardTitle>
        <div className="text-3xl font-bold text-text-primary">
          {price}
          <span className="text-sm text-text-muted font-normal">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-text-secondary">
              <CheckCircle className="h-4 w-4 text-green mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button
          className={`w-full ${
            isCurrentPlan
              ? 'bg-bg-floating text-text-muted cursor-not-allowed'
              : 'bg-brand hover:bg-brand-hover text-white'
          }`}
          disabled={isCurrentPlan}
          onClick={onUpgrade}
        >
          {isCurrentPlan ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Current Plan
            </>
          ) : (
            <>
              <ArrowUp className="h-4 w-4 mr-2" />
              Upgrade
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { data: billing, error, isLoading } = useSWR('/billing/usage', fetcher);

  const handleUpgrade = (planName: string) => {
    // TODO: Integrate with Stripe
    console.log('Upgrade to:', planName);
    // This would typically redirect to Stripe Checkout
    window.open('https://checkout.stripe.com/your-checkout-session', '_blank');
  };

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      features: [
        '1,000 prompts/month',
        '10,000 API calls',
        '1GB storage',
        'Basic analytics',
        'Email support'
      ],
      isCurrentPlan: billing?.current_plan === 'starter'
    },
    {
      name: 'Professional',
      price: '$99',
      features: [
        '10,000 prompts/month',
        '100,000 API calls',
        '10GB storage',
        'Advanced analytics',
        'Priority support',
        'Team collaboration'
      ],
      isCurrentPlan: billing?.current_plan === 'professional',
      isRecommended: true
    },
    {
      name: 'Enterprise',
      price: '$299',
      features: [
        'Unlimited prompts',
        'Unlimited API calls',
        '100GB storage',
        'Custom analytics',
        'Dedicated support',
        'Advanced security',
        'SLA guarantee'
      ],
      isCurrentPlan: billing?.current_plan === 'enterprise'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-bg-secondary rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Failed to load billing data</h3>
            <p className="text-text-secondary">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Billing & Usage</h1>
          <p className="text-text-secondary mt-2">
            Monitor your usage and manage your subscription
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow" />
          <span className="text-text-primary font-medium">
            {billing?.current_plan ? 
              billing.current_plan.charAt(0).toUpperCase() + billing.current_plan.slice(1) : 
              'Free'
            } Plan
          </span>
        </div>
      </div>

      {/* Current Usage */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Current Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UsageCard
            title="Prompts"
            used={billing?.usage.prompts_used || 0}
            limit={billing?.usage.prompts_limit || 1000}
            unit="prompts"
            icon={<Zap className="h-4 w-4" />}
          />
          <UsageCard
            title="API Calls"
            used={billing?.usage.api_calls_used || 0}
            limit={billing?.usage.api_calls_limit || 10000}
            unit="calls"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <UsageCard
            title="Storage"
            used={billing?.usage.storage_used || 0}
            limit={billing?.usage.storage_limit || 1024}
            unit="MB"
            icon={<CreditCard className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Billing Cycle Info */}
      {billing?.billing_cycle && (
        <Card className="bg-bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Billing Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-text-secondary">Cycle Period</div>
                <div className="text-text-primary font-medium">
                  {new Date(billing.billing_cycle.start_date).toLocaleDateString()} - {' '}
                  {new Date(billing.billing_cycle.end_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Days Remaining</div>
                <div className="text-text-primary font-medium">
                  {billing.billing_cycle.days_remaining} days
                </div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Next Invoice</div>
                <div className="text-text-primary font-medium">
                  ${billing.next_invoice.amount} on {new Date(billing.next_invoice.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Plans */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              isCurrentPlan={plan.isCurrentPlan}
              isRecommended={plan.isRecommended}
              onUpgrade={() => handleUpgrade(plan.name)}
            />
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="bg-bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-brand rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-text-primary font-medium">•••• •••• •••• 4242</div>
                <div className="text-text-secondary text-sm">Expires 12/25</div>
              </div>
            </div>
            <Button variant="outline">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}