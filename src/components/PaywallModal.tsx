'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, X, Star, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { usePaywallTrigger } from '@/lib/hooks/usePaywallTrigger';
import { useCreateCheckoutSession, useBillingPlans } from '@/hooks/api/useBilling';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompt-temple.com';

const TRIGGER_COPY = {
  no_credits: {
    headline: 'Scrolls Exhausted 𓏲',
    subline: "You've used all your AI credits for this month. Upgrade to continue optimizing.",
    urgency: 'Upgrade now — your prompts deserve better.',
    emoji: '🏛️',
    blocking: true,
  },
  limit_reached: {
    headline: 'Running Low on Credits 𓊹',
    subline: 'Only a few AI credits remaining — upgrade for 1,000+ per month.',
    urgency: null,
    emoji: '✨',
    blocking: false,
  },
  high_score: {
    headline: 'Pharaoh-Level Potential Detected 𓋹',
    subline: 'Your optimization scored above 7.5. Upgrade for unlimited 20× enhancement power.',
    urgency: null,
    emoji: '👑',
    blocking: false,
  },
};

export function PaywallModal() {
  const { modalOpen, modalTrigger, closeModal, usesRemaining, isSubscribed, entitlements } =
    usePaywallTrigger();

  const checkout = useCreateCheckoutSession();
  const { data: plans } = useBillingPlans();

  const copy =
    (modalTrigger && TRIGGER_COPY[modalTrigger as keyof typeof TRIGGER_COPY]) ||
    TRIGGER_COPY.limit_reached;

  // Determine which plan to offer: if already PRO, upsell POWER; otherwise upsell PRO
  const currentPlan = entitlements?.plan_code ?? 'FREE';
  const targetPlan: 'PRO' | 'POWER' = currentPlan === 'PRO' ? 'POWER' : 'PRO';
  const planData = plans?.find((p) => p.plan_code === targetPlan);
  const planPrice = planData ? `$${parseFloat(planData.price).toFixed(2)}` : targetPlan === 'PRO' ? '$13.99' : '$39.00';
  const planCredits = planData?.monthly_credits?.toLocaleString() ?? (targetPlan === 'PRO' ? '1,000' : '4,000');

  const handleUpgrade = () => {
    checkout.mutate(
      {
        plan_code: targetPlan,
        success_url: `${SITE_URL}/billing/success`,
        cancel_url: `${SITE_URL}/billing/cancel`,
      },
      { onSettled: closeModal }
    );
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={copy.blocking ? undefined : closeModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md rounded-3xl overflow-hidden pointer-events-auto"
              style={{
                background:
                  'linear-gradient(160deg, rgba(27,43,107,0.97) 0%, rgba(13,13,13,0.99) 100%)',
                border: '1px solid rgba(245,197,24,0.3)',
                boxShadow: '0 0 100px rgba(245,197,24,0.15), 0 40px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Top gold accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F5C518] to-transparent" />

              {/* Close (only shown for non-blocking modals) */}
              {!copy.blocking && (
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="p-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
                  style={{
                    background: 'rgba(245,197,24,0.15)',
                    border: '1px solid rgba(245,197,24,0.3)',
                    boxShadow: '0 0 30px rgba(245,197,24,0.2)',
                  }}
                >
                  {copy.emoji}
                </motion.div>

                <h2
                  className="text-2xl font-bold text-center text-[#F0E6D3] mb-2"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {copy.headline}
                </h2>
                <p className="text-center text-[#9CA3AF] text-sm mb-2">{copy.subline}</p>

                {copy.urgency && (
                  <p className="text-center text-[#F5C518] text-xs font-medium mb-4 px-4 py-2 rounded-full bg-[rgba(245,197,24,0.08)] border border-[rgba(245,197,24,0.2)]">
                    ⚡ {copy.urgency}
                  </p>
                )}

                {/* Credits remaining pill */}
                {!copy.blocking && usesRemaining > 0 && (
                  <p className="text-center text-xs text-[#6B7280] mb-5">
                    <span className="text-[#F5C518] font-semibold">{usesRemaining}</span> AI credit
                    {usesRemaining !== 1 ? 's' : ''} remaining this month
                  </p>
                )}

                {/* Benefits */}
                <div className="space-y-2.5 mb-7">
                  {[
                    {
                      icon: <Zap className="w-4 h-4" />,
                      text: `${planCredits} AI credits / month — no daily cap`,
                      color: '#A78BFA',
                    },
                    {
                      icon: <Crown className="w-4 h-4" />,
                      text: 'Unlimited prompt optimizations',
                      color: '#F5C518',
                    },
                    {
                      icon: <Star className="w-4 h-4" />,
                      text: 'Premium template library access',
                      color: '#10B981',
                    },
                    {
                      icon: <Sparkles className="w-4 h-4" />,
                      text: 'Analytics, streaks & achievement system',
                      color: '#60A5FA',
                    },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${b.color}15`, color: b.color }}
                      >
                        {b.icon}
                      </div>
                      <span className="text-sm text-[#E5E7EB]">{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: checkout.isPending ? 1 : 1.02 }}
                    whileTap={{ scale: checkout.isPending ? 1 : 0.98 }}
                    onClick={handleUpgrade}
                    disabled={checkout.isPending}
                    className="w-full py-3.5 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, #F5C518 0%, #C9A227 100%)',
                      boxShadow: '0 4px 20px rgba(245,197,24,0.4)',
                    }}
                  >
                    {checkout.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting to checkout…
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Upgrade to {targetPlan === 'PRO' ? 'Pro' : 'Power'} — {planPrice}/mo
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {!copy.blocking && (
                    <button
                      onClick={closeModal}
                      className="w-full py-2.5 text-sm text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                    >
                      Continue with {usesRemaining} credit{usesRemaining !== 1 ? 's' : ''} left
                    </button>
                  )}

                  {copy.blocking && (
                    <a
                      href="/billing"
                      className="block w-full py-2.5 text-sm text-center text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                    >
                      View billing details →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
