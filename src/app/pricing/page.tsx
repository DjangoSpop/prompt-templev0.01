import type { Metadata } from 'next';
import { PricingPageClient } from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing — Free, Pro & Power Plans | Prompt Temple',
  description:
    'Start free with daily AI prompt optimizations. Upgrade to Pro or Power for unlimited access, premium templates, API, and more. No credit card required.',
  alternates: { canonical: 'https://prompt-temple.com/pricing' },
};

const pricingFaq = [
  {
    question: 'Is there a free plan?',
    answer:
      'Yes! The Free plan includes daily AI prompt optimizations, access to basic templates, and prompt quality scoring. No credit card required.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. Cancel your subscription anytime from your billing settings. No questions asked, no cancellation fees.',
  },
  {
    question: 'What AI tools does it work with?',
    answer:
      'Prompt Temple works with ChatGPT, Claude, Gemini, Perplexity, Copilot, and all major AI tools. Every prompt you create works universally.',
  },
  {
    question: 'Do unused credits roll over?',
    answer:
      'Free plan credits reset daily and do not roll over. Pro and Power plans get monthly credits that refresh each billing cycle.',
  },
  {
    question: 'What is the Chrome extension?',
    answer:
      'Our free Chrome extension lets you access your prompt library directly inside ChatGPT, Claude, and Gemini — no tab switching needed. Available on all plans.',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingPageClient faq={pricingFaq} />
    </>
  );
}
