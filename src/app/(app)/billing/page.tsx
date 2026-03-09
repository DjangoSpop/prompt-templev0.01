"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Crown,
  Zap,
  Calendar,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useSubscription,
  useEntitlements,
  useBillingUsage,
  useBillingPlans,
  useCreateCheckoutSession,
  useCreatePortalSession,
} from "@/hooks/api/useBilling";
import type { SubscriptionStatus } from "@/lib/api/typed-client";
import { useCreditsStore } from "@/store/credits";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.prompt-temple.com";

// â”€â”€ Status badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function statusVariant(status: SubscriptionStatus) {
  return {
    active: "secondary",
    pending: "outline",
    past_due: "destructive",
    cancelled: "outline",
    expired: "outline",
  }[status] as "secondary" | "outline" | "destructive";
}

function statusLabel(status: SubscriptionStatus) {
  return {
    active: "Active",
    pending: "Pending",
    past_due: "Past Due",
    cancelled: "Cancelled",
    expired: "Expired",
  }[status] ?? status;
}

// â”€â”€ Credits bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CreditsBar({
  available,
  total,
}: {
  available: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const danger = pct > 85;
  const warn = pct >= 60 && pct <= 85;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Credits used</span>
        <span
          className={
            danger
              ? "text-destructive font-medium"
              : warn
              ? "text-amber-500 font-medium"
              : "text-foreground font-medium"
          }
        >
          {available.toLocaleString()} remaining
        </span>
      </div>
      <Progress
        value={pct}
        className={`h-2 ${
          danger
            ? "[&>div]:bg-destructive"
            : warn
            ? "[&>div]:bg-amber-500"
            : "[&>div]:bg-green-500"
        }`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{(total - available).toLocaleString()} used</span>
        <span>{total.toLocaleString()} total / month</span>
      </div>
    </div>
  );
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BillingPage() {
  const router = useRouter();

  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: entitlements, isLoading: entLoading } = useEntitlements();
  const { data: usage, isLoading: usageLoading } = useBillingUsage();
  const { data: plans } = useBillingPlans();

  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();

  // Use live credit values from Zustand store for real-time updates
  const creditsAvailable = useCreditsStore((state) => state.creditsAvailable);
  const creditsRemaining = useCreditsStore((state) => state.creditsRemaining);

  const [activeTab, setActiveTab] = useState("overview");

  const isLoading = subLoading || entLoading;

  const handleUpgrade = (planCode: "PRO" | "POWER") => {
    checkout.mutate({
      plan_code: planCode,
      success_url: `${SITE_URL}/billing/success`,
      cancel_url: `${SITE_URL}/billing/cancel`,
    });
  };

  const handleManageBilling = () => {
    portal.mutate({ return_url: `${SITE_URL}/billing` });
  };

  // â”€â”€ Subscription status alert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const showAlert =
    subscription && subscription.status !== "active";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Billing & Credits</h1>
              <p className="text-muted-foreground mt-1">
                Manage your subscription and track AI credit usage
              </p>
            </div>
            {entitlements && (
              <Badge variant="secondary" className="px-4 py-2 gap-1.5">
                <Crown className="h-4 w-4" />
                {entitlements.plan_name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Subscription status alert */}
        {showAlert && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${
              subscription.status === "past_due"
                ? "border-destructive/50 bg-destructive/5 text-destructive"
                : "border-yellow-500/50 bg-yellow-500/5 text-yellow-600"
            }`}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">
                {subscription.status === "past_due"
                  ? "Payment failed â€” update your payment method to keep access."
                  : subscription.status === "pending"
                  ? "Payment pending â€” complete checkout to activate your plan."
                  : subscription.status === "cancelled"
                  ? "Subscription cancelled. Upgrade to regain premium access."
                  : "Your subscription has expired."}
              </p>
            </div>
            {subscription.status === "past_due" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleManageBilling}
                disabled={portal.isPending}
              >
                Update payment
              </Button>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Crown className="h-4 w-4" /> Plans
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Usage
            </TabsTrigger>
          </TabsList>

          {/* â”€â”€ Overview tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-40 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current plan card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Crown className="h-5 w-5 text-primary" />
                          Current Plan
                        </CardTitle>
                        {subscription && (
                          <Badge variant={statusVariant(subscription.status)}>
                            {statusLabel(subscription.status)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold">
                          {entitlements?.plan_name ?? "â€”"}
                        </p>
                        {subscription?.next_billing_date && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Renews{" "}
                            {new Date(
                              subscription.next_billing_date
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {subscription?.days_remaining !== undefined && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3.5 w-3.5" />
                            {subscription.days_remaining} days remaining
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {subscription?.is_premium ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleManageBilling}
                            disabled={portal.isPending}
                            className="gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {portal.isPending ? "Openingâ€¦" : "Manage billing"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setActiveTab("plans")}
                            className="gap-1"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                            Upgrade plan
                          </Button>
                        )}
                        {entitlements?.plan_code === "PRO" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpgrade("POWER")}
                            disabled={checkout.isPending}
                          >
                            {checkout.isPending ? "â€¦" : "Upgrade to Power"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credits card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        AI Credits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {entitlements ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">
                              {creditsAvailable.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              / {entitlements.monthly_credits.toLocaleString()} this month
                            </span>
                          </div>
                          <CreditsBar
                            available={creditsAvailable}
                            total={entitlements.monthly_credits}
                          />
                        </>
                      ) : (
                        <div className="h-16 bg-muted rounded animate-pulse" />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Feature access grid */}
                {entitlements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Feature Access</CardTitle>
                      <CardDescription>
                        What&apos;s included in your {entitlements.plan_name} plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                          {
                            label: "Premium Templates",
                            ok: entitlements.premium_templates,
                          },
                          { label: "Analytics", ok: entitlements.analytics },
                          {
                            label: "API Access",
                            ok: entitlements.api_access,
                          },
                          {
                            label: "Streaming AI",
                            ok: entitlements.streaming_enabled,
                          },
                          { label: "Ad-Free", ok: entitlements.ads_free },
                          {
                            label: "Collaboration",
                            ok: entitlements.collaboration,
                          },
                          {
                            label: "Priority Support",
                            ok: entitlements.priority_support,
                          },
                        ].map(({ label, ok }) => (
                          <div
                            key={label}
                            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                              ok
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            <CheckCircle
                              className={`h-4 w-4 shrink-0 ${
                                ok ? "text-green-500" : "text-muted-foreground/40"
                              }`}
                            />
                            {label}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* â”€â”€ Plans tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <TabsContent value="plans" className="space-y-6">
            {!plans ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrent =
                    entitlements?.plan_code === plan.plan_code;
                  const isUpgradeable =
                    !isCurrent && plan.plan_code !== "FREE";

                  return (
                    <Card
                      key={plan.plan_code}
                      className={`relative flex flex-col ${
                        plan.is_popular
                          ? "border-primary/60 ring-2 ring-primary/20"
                          : ""
                      } ${isCurrent ? "bg-muted/30" : ""}`}
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">
                            ${parseFloat(plan.price).toFixed(2) === "0.00"
                              ? "0"
                              : parseFloat(plan.price).toFixed(2)}
                          </span>
                          {plan.plan_code !== "FREE" && (
                            <span className="text-muted-foreground text-sm">
                              /month
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.monthly_credits.toLocaleString()} AI credits /
                          month
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        <ul className="space-y-2 flex-1">
                          {plan.features_list.map((f) => (
                            <li
                              key={f}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {isCurrent ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleManageBilling}
                            disabled={portal.isPending}
                          >
                            {portal.isPending ? "Openingâ€¦" : "Manage billing"}
                          </Button>
                        ) : isUpgradeable ? (
                          <Button
                            className="w-full"
                            onClick={() =>
                              handleUpgrade(plan.plan_code as "PRO" | "POWER")
                            }
                            disabled={checkout.isPending}
                          >
                            {checkout.isPending ? "Redirectingâ€¦" : `Get ${plan.name}`}
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* â”€â”€ Usage tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <TabsContent value="usage" className="space-y-6">
            {usageLoading ? (
              <div className="h-40 rounded-xl bg-muted animate-pulse" />
            ) : usage ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground font-normal">
                        Credits consumed this period
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {usage.credits_consumed_this_period.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Since{" "}
                        {new Date(usage.period_start).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground font-normal">
                        Credits remaining
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {usage.credits_remaining.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {usage.by_feature.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Usage by Feature
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {usage.by_feature.map((row) => (
                          <div
                            key={row.feature}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {row.feature.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {row.call_count} call
                                {row.call_count !== 1 ? "s" : ""} Â·{" "}
                                {row.total_tokens_out.toLocaleString()} tokens
                                out
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold">
                              <Zap className="h-3.5 w-3.5 text-primary" />
                              {row.total_credits}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No usage data yet. Start using AI features to see your
                    breakdown here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

