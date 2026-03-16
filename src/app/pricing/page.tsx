import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Free AI Prompt Optimizer | Prompt Temple',
  description: 'Start free with 5 daily AI prompt optimizations. Upgrade to Pro for unlimited access. No credit card required to get started.',
  alternates: { canonical: 'https://prompt-temple.com/pricing' },
};

const pricingFaq = [
  {
    question: 'Is there a free plan?',
    answer: 'Yes! The free plan includes 5 daily AI prompt optimizations and access to 1000+ basic templates. No credit card required.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. Cancel your subscription anytime from your account settings. No questions asked, no cancellation fees.',
  },
  {
    question: 'What AI models does Prompt Temple support?',
    answer: 'Prompt Temple optimizes prompts for ChatGPT (GPT-4o), Claude (Anthropic), Gemini (Google), and all major LLMs. Optimized prompts work universally.',
  },
  {
    question: 'Do unused daily credits roll over?',
    answer: 'Free plan credits reset daily and do not roll over. Pro plan users get unlimited optimizations — no credits to track.',
  },
];

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-5xl mx-auto px-6 py-24">
        <header className="text-center mb-16">
          <p className="text-[#CBA135] text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Start Free. Scale as You Grow.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get dramatically better AI results — free. Upgrade when you need more power.
          </p>
        </header>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Free */}
          <div className="bg-[#1A2F4A] rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-2">Free</h2>
            <div className="text-4xl font-bold mb-1">$0</div>
            <div className="text-gray-400 text-sm mb-8">Forever free</div>
            <ul className="space-y-3 mb-8 flex-1">
              {['5 daily optimizations', '1,000+ basic templates', 'Prompt quality scoring', 'Before/after comparison', 'Academy — 2 free modules'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block text-center border border-[#CBA135] text-[#CBA135] font-semibold py-3 rounded-lg hover:bg-[#CBA135]/10 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#CBA135] rounded-2xl p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-[#CBA135] text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Pro</h2>
            <div className="text-4xl font-bold text-black mb-1">$29.99</div>
            <div className="text-black/60 text-sm mb-8">/month</div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Unlimited optimizations',
                '5,000+ premium templates',
                'Advanced prompt analytics',
                'API access',
                'Full Academy access',
                'Priority support',
                'Team sharing (up to 3)',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-black text-sm">
                  <span>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block text-center bg-black text-[#CBA135] font-bold py-3 rounded-lg hover:bg-black/80 transition-colors"
            >
              Start Pro Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-[#1A2F4A] rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-2">Enterprise</h2>
            <div className="text-4xl font-bold mb-1">$99.99</div>
            <div className="text-gray-400 text-sm mb-8">/month</div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Everything in Pro',
                'Unlimited team members',
                'Custom template library',
                'SSO / SAML',
                'Dedicated account manager',
                'SLA guarantee',
                'Custom integrations',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@prompttemple2030.com"
              className="block text-center border border-gray-500 text-gray-300 font-semibold py-3 rounded-lg hover:border-[#CBA135] hover:text-[#CBA135] transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <dl className="space-y-6 max-w-3xl mx-auto">
            {pricingFaq.map((item) => (
              <div key={item.question} className="bg-[#1A2F4A] rounded-xl p-6">
                <dt className="font-semibold mb-2">{item.question}</dt>
                <dd className="text-gray-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog" className="text-[#CBA135] hover:underline">Read our blog →</Link>
            <Link href="/academy" className="text-[#CBA135] hover:underline">Explore the Academy →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
