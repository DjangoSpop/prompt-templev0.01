'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useBillingPlans,
  usePlanCode,
  useBillingActions,
  type PlanCode,
} from '@/hooks/api/useBilling';
import { useAuthStore } from '@/store/user';

interface PlanMeta {
  hieroglyphic: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  badge?: string;
  popular?: boolean;
  features: { text: string; included: boolean }[];
}

const PLAN_META: Record<string, PlanMeta> = {
  FREE: {
    hieroglyphic: 'ð“²',
    displayName: 'Scribe',
    description: 'Begin your journey in the temple',
    icon: <BookOpen className="w-6 h-6" />,
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.2)',
    features: [
      { text: '3 optimizations / day', included: true },
      { text: 'Basic AI (Scribe Level)', included: true },
      { text: 'Template library access', included: true },
      { text: 'Save up to 10 prompts', included: true },
      { text: '10x AI enhancement', included: false },
      { text: 'Pharaoh-tier optimization', included: false },
      { text: 'Priority processing', included: false },
      { text: 'Analytics dashboard', included: false },
    ],
  },
  PRO: {
    hieroglyphic: 'ð“Š¹',
    displayName: 'High Priest',
    description: 'Ascend to temple wisdom',
    icon: <Zap className="w-6 h-6" />,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.4)',
    badge: 'Most Popular',
    popular: true,
    features: [
      { text: 'Unlimited optimizations', included: true },
      { text: '10x AI enhancement', included: true },
      { text: 'Full template library', included: true },
      { text: 'Unlimited saved prompts', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Streak rewards', included: true },
      { text: 'Pharaoh-tier optimization', included: false },
      { text: 'Dedicated AI pipeline', included: false },
    ],
  },
  POWER: {
    hieroglyphic: 'ð“‹¹',
    displayName: 'Pharaoh',
    description: 'Rule the realm of prompts',
    icon: <Crown className="w-6 h-6" />,
    color: '#F5C518',
    glow: 'rgba(245,197,24,0.5)',
    features: [
      { text: 'Unlimited optimizations', included: true },
      { text: '20x AI enhancement (Pharaoh)', included: true },
      { text: 'Everything in High Priest', included: true },
      { text: 'Custom AI pipeline', included: true },
      { text: 'Team workspace', included: true },
      { text: 'API access', included: true },
      { text: 'White-label exports', included: true },
      { text: 'Priority support + Slack', included: true },
    ],
  },
};

// Fallback pricing shown while API loads
const FALLBACK_PRICES: Record<string, { monthly: number; annual: number }> = {
  FREE: { monthly: 0, annual: 0 },
  PRO: { monthly: 19, annual: 15 },
  POWER: { monthly: 49, annual: 39 },
};

export function PricingSection() {
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
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #F5C518 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(245,197,24,0.3)] bg-[rgba(245,197,24,0.06)] text-[#F5C518] text-sm font-medium mb-5">
            <Crown className="w-3.5 h-3.5" />
            Choose Your Rank
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-[#F0E6D3]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Select Your Temple Tier
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-xl mx-auto mb-8">
            Every great AI master starts as a Scribe. Your journey to Pharaoh begins today.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!annual ? 'bg-[#F5C518] text-black' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${annual ? 'bg-[#F5C518] text-black' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Annual
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planOrder.map((planCode, i) => {
            const meta = PLAN_META[planCode];
            const prices = getPrices(planCode);
            const isCurrent = currentPlanCode === planCode;
            const isFree = planCode === 'FREE';

            return (
              <motion.div
                key={planCode}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: meta.popular
                    ? `linear-gradient(160deg, ${meta.color}10 0%, rgba(13,13,13,0.95) 60%)`
                    : 'rgba(13,13,13,0.8)',
                  border: `1px solid ${meta.popular ? meta.color + '50' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: meta.popular ? `0 0 60px ${meta.glow}` : 'none',
                }}
              >
                {/* Badge â€” current plan takes priority */}
                {(isCurrent || meta.badge) && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold text-black"
                    style={{ background: isCurrent ? '#22c55e' : meta.color }}
                  >
                    {isCurrent ? 'Current Plan' : meta.badge}
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col">
                  {/* Tier header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-[#F0E6D3]" style={{ fontFamily: 'Cinzel, serif' }}>
                          {meta.displayName}
                        </h3>
                        <span className="text-lg" style={{ color: meta.color }}>{meta.hieroglyphic}</span>
                      </div>
                      <p className="text-sm text-[#9CA3AF] mt-1">{meta.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" style={{ color: meta.color }}>
                        ${annual ? prices.annual : prices.monthly}
                      </span>
                      {prices.monthly > 0 ? (
                        <span className="text-[#9CA3AF] text-sm">/month</span>
                      ) : (
                        <span className="text-[#9CA3AF] text-sm">forever</span>
                      )}
                    </div>
                    {annual && prices.monthly > 0 && (
                      <p className="text-xs text-green-400 mt-1">
                        Billed ${prices.annual * 12}/year Â· Save ${(prices.monthly - prices.annual) * 12}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {meta.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: f.included ? `${meta.color}20` : 'transparent',
                            color: f.included ? meta.color : '#4B5563',
                          }}
                        >
                          {f.included ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <span className="w-1 h-0.5 bg-current block rounded" />
                          )}
                        </div>
                        <span className="text-sm" style={{ color: f.included ? '#E5E7EB' : '#4B5563' }}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <Link href="/billing">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                        style={{ background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e50' }}
                      >
                        Manage Plan
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  ) : isFree ? (
                    <Link href="/auth/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                        style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}35` }}
                      >
                        Start for Free
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  ) : (
                    <motion.button
                      whileHover={{ scale: isStartingCheckout ? 1 : 1.02 }}
                      whileTap={{ scale: isStartingCheckout ? 1 : 0.98 }}
                      onClick={() => handleCTA(planCode)}
                      disabled={isStartingCheckout}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={
                        meta.popular
                          ? {
                              background: `linear-gradient(135deg, ${meta.color} 0%, #C9A227 100%)`,
                              color: '#000',
                              boxShadow: `0 4px 20px ${meta.glow}`,
                            }
                          : {
                              background: `${meta.color}12`,
                              color: meta.color,
                              border: `1px solid ${meta.color}35`,
                            }
                      }
                    >
                      {isStartingCheckout ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          {planCode === 'PRO' ? 'Claim High Priest Tier' : 'Ascend to Pharaoh'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-[#6B7280] mt-8">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}

