"use client";

import React from 'react';
import { useFeatureAccess } from '@/hooks/api/useBilling';
import { Card } from '@/components/ui/card-unified';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Infinity
} from 'lucide-react';

interface EntitlementBadgeProps {
  feature: string;
  showLabel?: boolean;
  compact?: boolean;
}

/**
 * EntitlementBadge - Shows a badge with feature usage status
 */
export function EntitlementBadge({ feature, showLabel = true, compact = false }: EntitlementBadgeProps) {
  const { entitlement, hasAccess, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return <Badge variant="secondary">Loading...</Badge>;
  }

  if (!entitlement) {
    return hasAccess ? (
      <Badge variant="success">
        <CheckCircle className="mr-1 h-3 w-3" />
        Available
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="mr-1 h-3 w-3" />
        Locked
      </Badge>
    );
  }

  if (entitlement.unlimited) {
    return (
      <Badge variant="success">
        <Infinity className="mr-1 h-3 w-3" />
        {showLabel && 'Unlimited'}
      </Badge>
    );
  }

  const percentage = (entitlement.used / entitlement.limit) * 100;
  const variant = percentage > 80 ? 'destructive' : percentage > 60 ? 'default' : 'success';

  if (compact) {
    return (
      <Badge variant={variant}>
        {entitlement.remaining}/{entitlement.limit}
      </Badge>
    );
  }

  return (
    <Badge variant={variant}>
      {showLabel && `${feature.replace(/_/g, ' ')}: `}
      {entitlement.remaining} remaining
    </Badge>
  );
}

interface CreditDisplayProps {
  feature?: string;
  className?: string;
}

/**
 * CreditDisplay - Shows credits/usage for a specific feature
 */
export function CreditDisplay({ feature = 'api_calls', className }: CreditDisplayProps) {
  const { entitlement, hasAccess, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return (
      <Card variant="temple" className={className}>
        <div className="flex items-center justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!entitlement) {
    return null;
  }

  const percentage = entitlement.unlimited 
    ? 100 
    : (entitlement.used / entitlement.limit) * 100;
  
  const isLow = percentage > 80 && !entitlement.unlimited;

  return (
    <Card variant="temple" className={className}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isLow ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <Zap className={`h-4 w-4 ${isLow ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">
                {feature.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {entitlement.unlimited ? 'Unlimited' : 'Limited'}
              </p>
            </div>
          </div>
          {entitlement.unlimited ? (
            <Badge variant="success">
              <Infinity className="h-3 w-3" />
            </Badge>
          ) : (
            <div className="text-right">
              <p className="text-2xl font-bold">{entitlement.remaining}</p>
              <p className="text-xs text-muted-foreground">of {entitlement.limit}</p>
            </div>
          )}
        </div>

        {!entitlement.unlimited && (
          <>
            <Progress 
              value={percentage} 
              className={isLow ? 'bg-destructive/20' : ''}
            />
            {isLow && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>Running low on credits</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

interface EntitlementsGridProps {
  className?: string;
}

/**
 * EntitlementsGrid - Shows all user entitlements in a grid
 */
export function EntitlementsGrid({ className }: EntitlementsGridProps) {
  const features = [
    'templates_created',
    'ai_generations',
    'api_calls',
    'storage',
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {features.map((feature) => (
        <CreditDisplay key={feature} feature={feature} />
      ))}
    </div>
  );
}
