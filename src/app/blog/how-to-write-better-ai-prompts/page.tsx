import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Write Better AI Prompts — Complete 2025 Guide',
  description: 'A comprehensive guide to writing better AI prompts for ChatGPT, Claude, and Gemini. Learn the key elements, common mistakes, and proven techniques with real examples.',
  alternates: { canonical: 'https://prompt-temple.com/blog/how-to-write-better-ai-prompts' },
  openGraph: {
    type: 'article',
    title: 'How to Write Better AI Prompts — Complete 2025 Guide',
    description: 'A comprehensive guide to writing better AI prompts. Learn the key elements, common mistakes, and proven techniques.',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Write Better AI Prompts — Complete 2025 Guide',
  description: 'A comprehensive guide to writing better AI prompts for ChatGPT, Claude, and Gemini.',
  author: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompt-temple.com' },
  publisher: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompt-temple.com' },
  datePublished: '2025-03-10',
  url: 'https://prompt-temple.com/blog/how-to-write-better-ai-prompts',
};

export default function HowToWritePromptsPage() {
  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog" className="text-[#CBA135] text-sm hover:underline">← Blog</Link>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">March 10, 2025</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">8 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            How to Write Better AI Prompts — Complete 2025 Guide
          </h1>
          <p className="text-xl text-gray-300">
            Most people get mediocre AI results because they write mediocre prompts. Here&apos;s the complete guide to writing prompts that consistently deliver professional-quality outputs.
          </p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#CBA135] mb-4">Why Most AI Prompts Fail</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The average ChatGPT user types a vague question and gets a vague answer. It&apos;s not the AI&apos;s fault — it&apos;s the prompt&apos;s fault. Studies show that improving prompt quality from poor to excellent can increase AI output quality by 5-7x.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The good news: writing great prompts is a learnable skill. Once you understand the core principles, you&apos;ll consistently get outputs that used to take multiple tries — or were impossible — on the first attempt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#CBA135] mb-4">The 5 Elements of a Great Prompt</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Every high-performing prompt contains some combination of these five elements:
            </p>
            <ol className="space-y-6">
              <li className="bg-[#1A2F4A] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">1. Role / Persona</h3>
                <p className="text-gray-400 mb-3">Tell the AI who it should be. This sets the expertise level, tone, and perspective of the response.</p>
                <div className="bg-[#0E1B2A] rounded-lg p-4 font-mono text-sm text-green-400">
                  &quot;Act as a senior marketing strategist with 10 years of experience in B2B SaaS...&quot;
                </div>
              </li>
              <li className="bg-[#1A2F4A] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">2. Context</h3>
                <p className="text-gray-400 mb-3">Give the AI the background it needs. What&apos;s the situation? Who is the audience? What&apos;s the goal?</p>
                <div className="bg-[#0E1B2A] rounded-lg p-4 font-mono text-sm text-green-400">
                  &quot;I&apos;m launching a new productivity app for remote teams. My target audience is HR managers at companies with 50-200 employees...&quot;
                </div>
              </li>
              <li className="bg-[#1A2F4A] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">3. Task</h3>
                <p className="text-gray-400 mb-3">The specific action you want the AI to take. Be precise and use action verbs.</p>
                <div className="bg-[#0E1B2A] rounded-lg p-4 font-mono text-sm text-green-400">
                  &quot;Write a 3-email onboarding sequence that...&quot; (not &quot;write some emails&quot;)
                </div>
              </li>
              <li className="bg-[#1A2F4A] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">4. Format</h3>
                <p className="text-gray-400 mb-3">Specify exactly how you want the output structured. Length, format, sections, tone.</p>
                <div className="bg-[#0E1B2A] rounded-lg p-4 font-mono text-sm text-green-400">
                  &quot;Format as: Subject line, Preview text, Body (max 200 words), CTA. Use conversational tone, no jargon.&quot;
                </div>
              </li>
              <li className="bg-[#1A2F4A] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">5. Constraints</h3>
                <p className="text-gray-400 mb-3">What should the AI avoid? What are the limits? What must be true of the output?</p>
                <div className="bg-[#0E1B2A] rounded-lg p-4 font-mono text-sm text-green-400">
                  &quot;Do not mention competitors. Avoid technical jargon. Must include a social proof element.&quot;
                </div>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#CBA135] mb-4">Before vs. After: Real Examples</h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-6">
                  <p className="text-red-400 text-xs font-semibold uppercase mb-3">❌ Weak Prompt</p>
                  <p className="text-gray-300 font-mono text-sm">&quot;Write a blog post about productivity&quot;</p>
                </div>
                <div className="bg-green-950/40 border border-green-800/40 rounded-xl p-6">
                  <p className="text-green-400 text-xs font-semibold uppercase mb-3">✓ Strong Prompt</p>
                  <p className="text-gray-300 font-mono text-sm">&quot;Act as a productivity coach. Write a 1000-word blog post for busy entrepreneurs about the 3 habits that have the biggest ROI on time. Include real statistics, 3 actionable tips per habit, and end with a CTA to join a free webinar. Tone: motivational but evidence-based. Avoid clichés like &apos;work smarter not harder&apos;.&quot;</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#CBA135] mb-4">Common Mistakes to Avoid</h2>
            <ul className="space-y-3">
              {[
                'Being vague about the audience — always specify who will read/use the output',
                'Skipping the format — AI will default to whatever it thinks is appropriate',
                'Not iterating — treat the first response as a draft, not a final output',
                'Asking for too many things at once — one task per prompt works better',
                'Forgetting constraints — telling the AI what NOT to do is as important as what to do',
              ].map((mistake) => (
                <li key={mistake} className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 mt-1">×</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#CBA135] mb-4">Works With All Major AI Tools</h2>
            <p className="text-gray-300 leading-relaxed">
              These principles work across ChatGPT, Claude, Gemini, Perplexity, and every other LLM. Better prompts are universally effective — the AI model matters less than the quality of your instructions.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Want to see these techniques in action? Use our <Link href="/playground" className="text-[#CBA135] hover:underline">AI Prompt Optimizer</Link> to transform any weak prompt instantly, or browse our <Link href="/templates" className="text-[#CBA135] hover:underline">5000+ template library</Link> for ready-made prompts across every category.
            </p>
          </section>
        </div>

        <div className="mt-16 bg-[#1A2F4A] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to optimize your prompts?</h2>
          <p className="text-gray-300 mb-8">
            Try Prompt Temple free — transform your first prompt in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-block bg-[#CBA135] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#D4AC42] transition-colors"
            >
              Start Free →
            </Link>
            <Link
              href="/academy"
              className="inline-block border border-[#CBA135] text-[#CBA135] font-semibold px-8 py-3 rounded-lg hover:bg-[#CBA135]/10 transition-colors"
            >
              Explore Academy
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
