"use client";

import React from 'react';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  useSubscription, 
  useEntitlements, 
  useBillingUsage,
  useBillingActions 
} from '@/hooks/api/useBilling';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export const SubscriptionTab: React.FC = () => {
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { data: usage, isLoading: usageLoading } = useBillingUsage();
  const { createPortalSession, isCreatingPortal } = useBillingActions();

  const handleManageBilling = () => {
    createPortalSession();
  };

  if (subscriptionLoading || entitlementsLoading || usageLoading) {
    return (
      <Card variant="temple" className="p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success' as const, icon: CheckCircle, text: 'Active' },
      canceled: { variant: 'secondary' as const, icon: XCircle, text: 'Canceled' },
      past_due: { variant: 'destructive' as const, icon: AlertCircle, text: 'Past Due' },
      trialing: { variant: 'default' as const, icon: TrendingUp, text: 'Trial' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card variant="temple" className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Manage your billing and subscription details
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-primary" />
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div>
                <p className="font-medium text-lg">{subscription.plan?.name || 'Free Plan'}</p>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan?.billing_period === 'yearly' ? 'Billed Annually' : 'Billed Monthly'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl">
                  ${subscription.plan?.price || 0}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{subscription.plan?.billing_period === 'yearly' ? 'year' : 'month'}
                  </span>
                </p>
                {getStatusBadge(subscription.status)}
              </div>
            </div>

            {subscription.status === 'active' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current period ends:</span>
                <span className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">
                  Your subscription will be canceled at the end of the current period.
                </p>
              </div>
            )}

            <Button 
              onClick={handleManageBilling}
              disabled={isCreatingPortal}
              className="w-full"
            >
              {isCreatingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                'Manage Billing'
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active subscription</p>
            <Button onClick={() => window.location.href = '/pricing'}>
              View Plans
            </Button>
          </div>
        )}
      </Card>

      {/* Entitlements */}
      {entitlements && entitlements.length > 0 && (
        <Card variant="temple" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
          <div className="space-y-4">
            {entitlements.map((entitlement: any) => {
              const percentage = entitlement.unlimited 
                ? 100 
                : (entitlement.used / entitlement.limit) * 100;
              const isNearLimit = percentage > 80 && !entitlement.unlimited;

              return (
                <div key={entitlement.feature} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">
                      {entitlement.feature.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      {entitlement.unlimited ? (
                        <Badge variant="success">Unlimited</Badge>
                      ) : (
                        `${entitlement.used} / ${entitlement.limit}`
                      )}
                    </span>
                  </div>
                  {!entitlement.unlimited && (
                    <>
                      <Progress 
                        value={percentage} 
                        className={isNearLimit ? 'bg-destructive/20' : ''}
                      />
                      {isNearLimit && (
                        <p className="text-xs text-destructive">
                          ⚠️ Approaching limit. Consider upgrading your plan.
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Usage Statistics */}
      {usage && (
        <Card variant="temple" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Usage This Period</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(usage).map(([key, value]) => {
              if (key === 'period') return null;
              return (
                <div key={key} className="p-3 bg-secondary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-2xl font-bold">{value as number}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTab;
