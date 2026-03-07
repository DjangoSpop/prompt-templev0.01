'use client';

import { useSubscription, useCreatePortalSession } from '@/hooks/api/useBilling';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompt-temple.com';

/**
 * Full-width banner that renders when the subscription needs attention.
 * Returns null when the subscription is active or not yet loaded.
 * Place this in the app shell layout so it appears on every authenticated page.
 */
export function SubscriptionStatusBanner() {
  const { data: subscription } = useSubscription();
  const portal = useCreatePortalSession();

  if (!subscription || subscription.status === 'active') return null;

  const config = {
    pending: {
      icon: <Info className="h-4 w-4 shrink-0" />,
      text: 'Payment pending — complete your checkout to activate your plan.',
      variant: 'yellow',
      cta: null,
    },
    past_due: {
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      text: 'Payment failed — update your payment method to keep access.',
      variant: 'red',
      cta: 'Update payment',
    },
    cancelled: {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      text: 'Your subscription has been cancelled. Upgrade to regain premium access.',
      variant: 'yellow',
      cta: null,
    },
    expired: {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      text: 'Your subscription has expired.',
      variant: 'yellow',
      cta: null,
    },
  }[subscription.status];

  if (!config) return null;

  const isRed = config.variant === 'red';

  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
        isRed
          ? 'bg-destructive/10 border-b border-destructive/30 text-destructive'
          : 'bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
      }`}
    >
      {config.icon}
      <span className="flex-1">{config.text}</span>
      {config.cta && (
        <Button
          size="sm"
          variant={isRed ? 'destructive' : 'outline'}
          onClick={() => portal.mutate({ return_url: `${SITE_URL}/billing` })}
          disabled={portal.isPending}
          className="shrink-0"
        >
          {portal.isPending ? 'Opening…' : config.cta}
        </Button>
      )}
    </div>
  );
}
