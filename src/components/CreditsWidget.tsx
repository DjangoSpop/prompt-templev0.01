'use client';

import { CreditCard, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Quota } from '@/lib/types';

interface CreditsWidgetProps {
  quotas: Quota;
  className?: string;
  compact?: boolean;
}

export default function CreditsWidget({ quotas, className = "", compact = false }: CreditsWidgetProps) {
  const calculatePercentage = (used: number, limit: number): number => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red';
    if (percentage >= 75) return 'text-yellow';
    return 'text-green';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red';
    if (percentage >= 75) return 'bg-yellow';
    return 'bg-green';
  };

  const dailyPercentage = calculatePercentage(quotas.daily_used, quotas.daily_limit);
  const monthlyPercentage = calculatePercentage(quotas.monthly_used, quotas.monthly_limit);

  const resetDate = new Date(quotas.reset_date);
  const now = new Date();
  const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (compact) {
    return (
      <div className={`bg-bg-secondary rounded-lg p-4 border border-border ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-brand" />
            <span className="text-text-primary font-medium text-sm">Credits</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-text-primary">
              {quotas.daily_limit - quotas.daily_used} / {quotas.daily_limit}
            </div>
            <div className="text-xs text-text-muted">daily remaining</div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-text-muted">Daily Usage</span>
            <span className={`text-xs font-medium ${getStatusColor(dailyPercentage)}`}>
              {dailyPercentage}%
            </span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(dailyPercentage)}`}
              style={{ width: `${dailyPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-secondary rounded-lg border border-border ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-text-primary font-medium flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Usage & Quotas</span>
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Daily Quota */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-text-primary font-medium">Daily Quota</h4>
              <p className="text-text-muted text-sm">Resets every 24 hours at midnight UTC</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-text-primary">
                {quotas.daily_limit - quotas.daily_used}
              </div>
              <div className="text-sm text-text-muted">remaining</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">
                {quotas.daily_used} / {quotas.daily_limit} used
              </span>
              <span className={`text-sm font-medium ${getStatusColor(dailyPercentage)}`}>
                {dailyPercentage}%
              </span>
            </div>
            
            <div className="w-full bg-bg-tertiary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(dailyPercentage)}`}
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
          </div>

          {dailyPercentage >= 90 && (
            <div className="mt-2 flex items-center space-x-2 text-red text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Daily quota almost exhausted</span>
            </div>
          )}
        </div>

        {/* Monthly Quota */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-text-primary font-medium">Monthly Quota</h4>
              <p className="text-text-muted text-sm">
                Resets on the 1st of each month
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-text-primary">
                {quotas.monthly_limit - quotas.monthly_used}
              </div>
              <div className="text-sm text-text-muted">remaining</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">
                {quotas.monthly_used} / {quotas.monthly_limit} used
              </span>
              <span className={`text-sm font-medium ${getStatusColor(monthlyPercentage)}`}>
                {monthlyPercentage}%
              </span>
            </div>
            
            <div className="w-full bg-bg-tertiary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(monthlyPercentage)}`}
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
          </div>

          {monthlyPercentage >= 90 && (
            <div className="mt-2 flex items-center space-x-2 text-red text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Monthly quota almost exhausted</span>
            </div>
          )}
        </div>

        {/* Reset Information */}
        <div className="bg-bg-tertiary rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-brand" />
            <div>
              <p className="text-text-primary font-medium">Next Reset</p>
              <p className="text-text-muted text-sm">
                {daysUntilReset > 0 
                  ? `${daysUntilReset} days remaining`
                  : 'Resets today'
                } • {resetDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-brand mt-0.5" />
            <div>
              <h4 className="text-brand font-medium">Usage Tips</h4>
              <ul className="text-text-muted text-sm mt-2 space-y-1">
                <li>• Premium templates consume more credits</li>
                <li>• Generate multiple variants efficiently</li>
                <li>• Monitor usage to avoid hitting limits</li>
                <li>• Consider upgrading for higher quotas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Self-contained credits display (uses useEntitlements internally) ──────────
// Use this in new code — no prop drilling required.

import { useEntitlements } from '@/hooks/api/useBilling';

interface CreditsWidgetConnectedProps {
  className?: string;
  compact?: boolean;
}

export function CreditsWidgetConnected({ className = '', compact = false }: CreditsWidgetConnectedProps) {
  const { data: entitlements, isLoading } = useEntitlements();

  if (isLoading) {
    return (
      <div className={`rounded-lg bg-bg-secondary border border-border p-4 animate-pulse h-16 ${className}`} />
    );
  }

  if (!entitlements) return null;

  const used = entitlements.monthly_credits - entitlements.credits_balance;
  const pct = entitlements.monthly_credits > 0
    ? Math.round((used / entitlements.monthly_credits) * 100)
    : 0;

  const color =
    pct >= 90 ? 'text-red' : pct >= 75 ? 'text-yellow' : 'text-green';
  const barColor =
    pct >= 90 ? 'bg-red' : pct >= 75 ? 'bg-yellow' : 'bg-green';

  if (compact) {
    return (
      <div className={`bg-bg-secondary rounded-lg p-4 border border-border ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-brand" />
            <span className="text-text-primary font-medium text-sm">Credits</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-text-primary">
              {entitlements.credits_balance.toLocaleString()} / {entitlements.monthly_credits.toLocaleString()}
            </div>
            <div className="text-xs text-text-muted">remaining this month</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-text-muted">Monthly usage</span>
            <span className={`text-xs font-medium ${color}`}>{pct}%</span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-secondary rounded-lg border border-border ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-text-primary font-medium flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>AI Credits</span>
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text-primary">
            {entitlements.credits_balance.toLocaleString()}
          </span>
          <span className="text-text-muted text-sm">
            / {entitlements.monthly_credits.toLocaleString()} this month
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">{used.toLocaleString()} used</span>
            <span className={`text-sm font-medium ${color}`}>{pct}%</span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {pct >= 90 && (
          <div className="flex items-center space-x-2 text-red text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Credits almost exhausted — consider upgrading</span>
          </div>
        )}
        <p className="text-xs text-text-muted">Plan: {entitlements.plan_name}</p>
      </div>
    </div>
  );
}