'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Zap,
  ExternalLink,
  ChevronUp,
  Package,
} from 'lucide-react';
import { useCreditsStore } from '@/store/credits';
import {
  useSubscription,
  useEntitlements,
  useCreateCheckoutSession,
  useCreatePortalSession,
} from '@/hooks/api/useBilling';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompt-temple.com';

interface CreditPackage {
  credits: number;
  price: string;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 100, price: '$4.99' },
  { credits: 500, price: '$19.99', popular: true },
  { credits: 2000, price: '$49.99' },
];

export function SubscriptionCard() {
  const { data: subscription } = useSubscription();
  const { data: entitlements, isLoading } = useEntitlements();
  const creditsAvailable = useCreditsStore((s) => s.creditsAvailable);

  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();

  const monthlyCredits = entitlements?.monthly_credits ?? 0;
  const usedPct = monthlyCredits > 0
    ? Math.round(((monthlyCredits - creditsAvailable) / monthlyCredits) * 100)
    : 0;

  const isPremium = subscription?.is_premium ?? false;

  const handleUpgrade = () => {
    checkout.mutate({
      plan_code: 'PRO',
      success_url: `${SITE_URL}/billing/success`,
      cancel_url: `${SITE_URL}/billing/cancel`,
    });
  };

  const handleManage = () => {
    portal.mutate({ return_url: `${SITE_URL}/usage` });
  };

  if (isLoading) {
    return (
      <Card className="border border-[hsl(var(--royal-gold))]/20">
        <CardContent className="p-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current plan + credits */}
      <Card className="border border-[hsl(var(--royal-gold))]/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
              Subscription
            </CardTitle>
            {entitlements && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                {entitlements.plan_name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Credits progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credits used this month</span>
              <span className="font-medium">
                {creditsAvailable.toLocaleString()} / {monthlyCredits.toLocaleString()}
              </span>
            </div>
            <Progress
              value={usedPct}
              className={`h-2.5 ${
                usedPct > 85
                  ? '[&>div]:bg-red-500'
                  : usedPct >= 60
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-[hsl(var(--royal-gold))]'
              }`}
            />
          </div>

          {subscription?.next_billing_date && (
            <p className="text-xs text-muted-foreground">
              Renews {new Date(subscription.next_billing_date).toLocaleDateString()}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {isPremium ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleManage}
                disabled={portal.isPending}
                className="gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {portal.isPending ? 'Opening...' : 'Manage Subscription'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleUpgrade}
                disabled={checkout.isPending}
                className="gap-1 bg-[hsl(var(--royal-gold))] hover:bg-[hsl(var(--pharaoh-gold))] text-white"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                {checkout.isPending ? 'Redirecting...' : 'Upgrade Plan'}
              </Button>
            )}
            <Link href="/billing">
              <Button size="sm" variant="ghost" className="text-xs">
                View all plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Credit purchase packages */}
      <Card className="border border-[hsl(var(--royal-gold))]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
            Buy More Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.credits}
                className={`relative rounded-lg border p-3 text-center transition-colors hover:border-[hsl(var(--royal-gold))]/50 cursor-pointer ${
                  pkg.popular
                    ? 'border-[hsl(var(--royal-gold))]/40 bg-[hsl(var(--royal-gold))]/5'
                    : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] px-1.5 py-0 bg-[hsl(var(--royal-gold))] text-white">
                      Best Value
                    </Badge>
                  </div>
                )}
                <p className="text-lg font-bold text-foreground">{pkg.credits}</p>
                <p className="text-xs text-muted-foreground">credits</p>
                <p className="text-sm font-semibold mt-1 text-[hsl(var(--royal-gold))]">{pkg.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
