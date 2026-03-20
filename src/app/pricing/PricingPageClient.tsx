'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X as XIcon,
  Zap,
  Crown,
  BookOpen,
  ArrowRight,
  Loader2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useBillingPlans,
  usePlanCode,
  useBillingActions,
  type PlanCode,
} from '@/hooks/api/useBilling';
import { useAuthStore } from '@/store/user';
import { cn } from '@/lib/utils';

// ── Plan metadata — clean, professional copy ──

interface PlanMeta {
  displayName: string;
  tagline: string;
  icon: React.ReactNode;
  accentClass: string;
  accentBg: string;
  accentBorder: string;
  badge?: string;
  popular?: boolean;
  cta: string;
  features: { text: string; included: boolean }[];
}

const PLAN_META: Record<string, PlanMeta> = {
  FREE: {
    displayName: 'Free',
    tagline: 'Get started with AI prompt optimization',
    icon: <BookOpen className="h-5 w-5" />,
    accentClass: 'text-stone-600 dark:text-stone-400',
    accentBg: 'bg-stone-100 dark:bg-stone-800',
    accentBorder: 'border-stone-200 dark:border-stone-700',
    cta: 'Get Started Free',
    features: [
      { text: '5 prompt optimizations per day', included: true },
      { text: '1,000+ basic templates', included: true },
      { text: 'Prompt quality scoring', included: true },
      { text: 'Before/after comparison', included: true },
      { text: 'Chrome extension', included: true },
      { text: '2 free Academy modules', included: true },
      { text: 'Unlimited optimizations', included: false },
      { text: 'Premium templates', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  PRO: {
    displayName: 'Pro',
    tagline: 'For professionals who use AI daily',
    icon: <Zap className="h-5 w-5" />,
    accentClass: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-900/20',
    accentBorder: 'border-blue-200 dark:border-blue-800',
    badge: 'Most Popular',
    popular: true,
    cta: 'Start Pro — 14 Day Trial',
    features: [
      { text: 'Unlimited optimizations', included: true },
      { text: '5,000+ premium templates', included: true },
      { text: 'Advanced prompt analytics', included: true },
      { text: 'Full Academy access', included: true },
      { text: 'Chrome extension — all features', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
      { text: 'Team sharing (up to 3)', included: true },
      { text: 'Custom AI pipeline', included: false },
      { text: 'White-label exports', included: false },
    ],
  },
  POWER: {
    displayName: 'Power',
    tagline: 'For teams and power users',
    icon: <Crown className="h-5 w-5" />,
    accentClass: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-900/20',
    accentBorder: 'border-amber-200 dark:border-amber-800',
    cta: 'Start Power Plan',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom AI pipeline', included: true },
      { text: 'White-label exports', included: true },
      { text: 'Team workspace', included: true },
      { text: 'Advanced API + webhooks', included: true },
      { text: 'Dedicated support + Slack', included: true },
      { text: 'SSO / SAML (coming soon)', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
  },
};

const FALLBACK_PRICES: Record<string, { monthly: number; annual: number }> = {
  FREE: { monthly: 0, annual: 0 },
  PRO: { monthly: 19, annual: 15 },
  POWER: { monthly: 49, annual: 39 },
};

// ── FAQ Accordion ──

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 md:text-base">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed text-stone-600 dark:border-stone-800 dark:text-stone-400">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──

interface PricingPageClientProps {
  faq: { question: string; answer: string }[];
}

export function PricingPageClient({ faq }: PricingPageClientProps) {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const { data: plans } = useBillingPlans();
  const currentPlanCode = usePlanCode();
  const { startCheckout, isStartingCheckout } = useBillingActions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const getPrices = (planCode: string) => {
    const apiPlan = plans?.find((p) => p.plan_code === planCode);
    if (apiPlan) {
      const monthlyPrice = parseFloat(apiPlan.price) || 0;
      return { monthly: monthlyPrice, annual: Math.round(monthlyPrice * 0.8) };
    }
    return FALLBACK_PRICES[planCode] ?? { monthly: 0, annual: 0 };
  };

  const handleCTA = (planCode: PlanCode) => {
    if (planCode === 'FREE') {
      router.push('/auth/register');
      return;
    }
    if (!isAuthenticated) {
      router.push(`/auth/register?plan=${planCode}`);
      return;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    startCheckout({
      plan_code: planCode,
      success_url: `${siteUrl}/billing/success`,
      cancel_url: `${siteUrl}/billing/cancel`,
    });
  };

  const planOrder: PlanCode[] = ['FREE', 'PRO', 'POWER'];

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 md:pt-16">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-900/15 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1
            className="mb-4 text-3xl font-bold text-stone-900 dark:text-white md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start Free. Scale as You Grow.
          </h1>
          <p className="mx-auto max-w-xl text-base text-stone-500 dark:text-stone-400 md:text-lg">
            Get better AI results today — free. Upgrade when you need more power.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800/50">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                !annual
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-white'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                annual
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-white'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              )}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* ── Plan Cards ── */}
        <div className="mb-20 grid gap-6 md:grid-cols-3">
          {planOrder.map((planCode, i) => {
            const meta = PLAN_META[planCode];
            const prices = getPrices(planCode);
            const isCurrent = currentPlanCode === planCode;
            const isFree = planCode === 'FREE';
            const isPopular = meta.popular;

            return (
              <motion.div
                key={planCode}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-white p-7 transition-shadow duration-200 dark:bg-stone-900',
                  isPopular
                    ? 'border-blue-300 shadow-lg shadow-blue-500/10 dark:border-blue-600/50 dark:shadow-blue-500/5 md:scale-105'
                    : 'border-stone-200 shadow-sm hover:shadow-md dark:border-stone-800 dark:hover:border-stone-700'
                )}
              >
                {/* Badge */}
                {(isCurrent || meta.badge) && (
                  <div
                    className={cn(
                      'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider',
                      isCurrent
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-600 text-white dark:bg-blue-500'
                    )}
                  >
                    {isCurrent ? 'Current Plan' : meta.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div
                    className={cn(
                      'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl',
                      meta.accentBg,
                      meta.accentClass
                    )}
                  >
                    {meta.icon}
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {meta.displayName}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {meta.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-stone-900 dark:text-white">
                      ${annual ? prices.annual : prices.monthly}
                    </span>
                    <span className="text-sm text-stone-500 dark:text-stone-400">
                      {prices.monthly > 0 ? '/month' : 'forever'}
                    </span>
                  </div>
                  {annual && prices.monthly > 0 && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                      Billed ${prices.annual * 12}/year · Save $
                      {(prices.monthly - prices.annual) * 12}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {meta.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      {f.included ? (
                        <div className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full', meta.accentBg)}>
                          <Check className={cn('h-2.5 w-2.5', meta.accentClass)} />
                        </div>
                      ) : (
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                          <XIcon className="h-3 w-3 text-stone-300 dark:text-stone-600" />
                        </div>
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          f.included
                            ? 'text-stone-700 dark:text-stone-300'
                            : 'text-stone-400 dark:text-stone-600'
                        )}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Link
                    href="/billing"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                  >
                    Manage Plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : isFree ? (
                  <Link
                    href="/auth/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    {meta.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCTA(planCode)}
                    disabled={isStartingCheckout}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 dark:from-blue-500 dark:to-blue-400 dark:shadow-blue-500/15'
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-400 dark:shadow-amber-500/10'
                    )}
                  >
                    {isStartingCheckout ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        {meta.cta}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Trust note ── */}
        <p className="mb-16 text-center text-sm text-stone-500 dark:text-stone-500">
          All paid plans include a 14-day money-back guarantee · No questions asked · Cancel anytime
        </p>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-3xl">
          <h2
            className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white md:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-stone-500 dark:text-stone-400">Still have questions?</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/help"
              className="text-sm font-medium text-[#0E3A8C] hover:underline dark:text-blue-400"
            >
              Visit Help Center →
            </Link>
            <Link
              href="/academy"
              className="text-sm font-medium text-[#0E3A8C] hover:underline dark:text-blue-400"
            >
              Explore the Academy →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
