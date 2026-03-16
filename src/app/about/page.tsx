import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Prompt Temple — AI Prompt Optimization Platform',
  description: 'Learn about Prompt Temple — our mission to make AI accessible through better prompts. Built for AI builders, marketers, developers, and creators worldwide.',
  alternates: { canonical: 'https://prompt-temple.com/about' },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <article className="max-w-4xl mx-auto px-6 py-24">
        <header className="mb-16 text-center">
          <p className="text-[#CBA135] text-sm font-semibold tracking-widest uppercase mb-4">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We&apos;re on a Mission to Make AI Work for Everyone
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Prompt Temple helps 47,000+ AI builders, marketers, and developers get dramatically better results from ChatGPT, Claude, and Gemini — by transforming weak prompts into masterpieces.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#CBA135] mb-6">Our Story</h2>
          <p className="text-gray-300 mb-4 leading-relaxed">
            Prompt Temple was born from a simple frustration: great AI tools were giving mediocre results because most people didn&apos;t know how to communicate with them effectively. The gap between what AI could do and what people actually got was enormous.
          </p>
          <p className="text-gray-300 mb-4 leading-relaxed">
            We set out to bridge that gap. By combining deep prompt engineering research with an intuitive platform, we built a tool that transforms any prompt — regardless of how rough — into a professional-grade instruction that consistently delivers outstanding AI outputs.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Today, Prompt Temple users report an average prompt quality improvement from 1.8 to 9.4 out of 10. That&apos;s not just better outputs — it&apos;s hours saved, better work products, and AI that finally lives up to its potential.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#CBA135] mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A2F4A] rounded-xl p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">AI Prompt Optimizer</h3>
              <p className="text-gray-400 text-sm">
                Paste any prompt and get an AI-enhanced version in seconds. See before/after comparison with improvement scores.
              </p>
            </div>
            <div className="bg-[#1A2F4A] rounded-xl p-6">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">5000+ Templates</h3>
              <p className="text-gray-400 text-sm">
                A curated library of proven prompt templates for marketing, coding, writing, business, and more.
              </p>
            </div>
            <div className="bg-[#1A2F4A] rounded-xl p-6">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold mb-2">Academy</h3>
              <p className="text-gray-400 text-sm">
                Master prompt engineering with structured courses covering Chain of Thought, Few-Shot, Role Prompting, and more.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#CBA135] mb-6">Our Values</h2>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <span className="text-[#CBA135] text-xl mt-1">𓂀</span>
              <div>
                <h3 className="font-semibold mb-1">Democratizing AI</h3>
                <p className="text-gray-400">Great AI results shouldn&apos;t require a PhD. We make prompt engineering accessible to everyone.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-[#CBA135] text-xl mt-1">𓂀</span>
              <div>
                <h3 className="font-semibold mb-1">Quality Over Quantity</h3>
                <p className="text-gray-400">Every template in our library is tested and scored. We only ship what works.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-[#CBA135] text-xl mt-1">𓂀</span>
              <div>
                <h3 className="font-semibold mb-1">Community-Driven</h3>
                <p className="text-gray-400">Our best templates come from our users. We celebrate and reward contributions.</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-[#1A2F4A] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your prompts?</h2>
          <p className="text-gray-300 mb-8">
            Join 47,000+ AI builders using Prompt Temple to get 10x better results from every AI tool they use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-block bg-[#CBA135] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#D4AC42] transition-colors"
            >
              Start Free →
            </Link>
            <Link
              href="/templates"
              className="inline-block border border-[#CBA135] text-[#CBA135] font-semibold px-8 py-3 rounded-lg hover:bg-[#CBA135]/10 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
