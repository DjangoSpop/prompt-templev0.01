import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '7 Prompt Engineering Techniques That Get 10x Better AI Results',
  description: 'Master Chain of Thought, Few-Shot Learning, Role Prompting, and 4 more proven prompt engineering techniques. With real examples for ChatGPT, Claude, and Gemini.',
  alternates: { canonical: 'https://prompttemple2030.com/blog/prompt-engineering-techniques' },
  openGraph: {
    type: 'article',
    title: '7 Prompt Engineering Techniques That Get 10x Better AI Results',
    description: 'Master Chain of Thought, Few-Shot, Role Prompting and more. With real examples.',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '7 Prompt Engineering Techniques That Get 10x Better AI Results',
  description: 'Master Chain of Thought, Few-Shot Learning, Role Prompting, and 4 more proven prompt engineering techniques.',
  author: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompttemple2030.com' },
  publisher: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompttemple2030.com' },
  datePublished: '2025-02-28',
  url: 'https://prompttemple2030.com/blog/prompt-engineering-techniques',
};

const techniques = [
  {
    number: '01',
    title: 'Chain of Thought (CoT)',
    tagline: 'Make the AI show its work',
    description: 'Chain of Thought prompting instructs the AI to reason through a problem step by step before giving a final answer. This dramatically improves accuracy for complex reasoning, math, and logic tasks.',
    example: {
      label: 'Without CoT',
      bad: '"What is 17% of 340?"',
      good: '"What is 17% of 340? Think through this step by step before giving the final answer."',
    },
    tip: 'Add "Think step by step" or "Let\'s work through this carefully" to activate chain of thought reasoning in any LLM.',
  },
  {
    number: '02',
    title: 'Few-Shot Learning',
    tagline: 'Show examples to set the pattern',
    description: 'Instead of just describing what you want, show the AI 2-3 examples of the input/output format. The AI learns the pattern and applies it to new inputs. This is one of the highest-ROI techniques for consistent outputs.',
    example: {
      label: 'Pattern',
      bad: '"Summarize these customer reviews in one sentence each."',
      good: '"Summarize each review in one sentence.\n\nReview: \'The product arrived damaged and support was slow to respond.\'\nSummary: Damaged delivery with poor support experience.\n\nReview: \'Best purchase I\'ve made this year, works exactly as described.\'\nSummary: Excellent product matching description perfectly.\n\nReview: [your review here]\nSummary:"',
    },
    tip: 'Use 2-3 examples for best results. More than 5 examples rarely adds value and uses extra tokens.',
  },
  {
    number: '03',
    title: 'Role Prompting',
    tagline: 'Set the AI\'s expertise and perspective',
    description: 'Assigning a specific role or persona to the AI dramatically changes the quality, depth, and style of its responses. A "senior software engineer" will write better code than a generic AI; an "experienced therapist" will give better mental health guidance.',
    example: {
      label: 'Role vs. No Role',
      bad: '"Review my code for bugs."',
      good: '"Act as a senior software engineer with expertise in Python and security. Review this code for: bugs, security vulnerabilities (especially injection attacks and auth issues), performance bottlenecks, and code readability. Provide specific line references and fixes."',
    },
    tip: 'Be specific about seniority level, specialization, and the lens they should apply. "Senior" and "expert" consistently outperform generic roles.',
  },
  {
    number: '04',
    title: 'Constraint-Based Prompting',
    tagline: 'Define what to avoid, not just what to do',
    description: 'Telling the AI what NOT to do is as powerful as telling it what to do. Constraints eliminate common failure modes, force creative solutions, and ensure outputs meet specific requirements.',
    example: {
      label: 'With Constraints',
      bad: '"Write a product description for our new coffee maker."',
      good: '"Write a product description for our premium coffee maker. Max 80 words. Must include: one surprising differentiator, a sensory detail, and a specific benefit. Do NOT use: the words \'premium\', \'quality\', or \'perfect\'. Do not use exclamation marks. Tone: confident and conversational."',
    },
    tip: 'Always include both positive requirements AND negative constraints. The constraints often matter more for quality.',
  },
  {
    number: '05',
    title: 'Template Filling',
    tagline: 'Give the AI a structure to complete',
    description: 'Instead of asking the AI to generate a free-form response, give it a template with placeholders and ask it to fill in the blanks. This ensures consistent formatting and coverage of all required elements.',
    example: {
      label: 'Template',
      bad: '"Write a case study about our product."',
      good: '"Complete this case study template:\n\nClient: [Client name and industry]\nChallenge: [1-2 sentences: what problem they faced]\nSolution: [2-3 sentences: how our product solved it]\nImplementation: [Key steps taken]\nResults: [3 specific metrics with % improvements]\nQuote: [Realistic client testimonial]\n\nBased on this context: [your context]"',
    },
    tip: 'Templates work especially well for recurring content types: reports, briefs, announcements, pitches.',
  },
  {
    number: '06',
    title: 'Iterative Refinement',
    tagline: 'Treat the first response as a draft',
    description: 'The best AI outputs come from iteration, not a single perfect prompt. Generate a first draft, then give specific feedback: "Make section 2 more concise", "Add more data to support the third point", "Change the tone to be more formal".',
    example: {
      label: 'Refinement Prompt',
      bad: '(Accepting the first output)',
      good: '"Good start. Now: 1) Cut the introduction by 50% — it\'s too slow to get to the point. 2) Add a real statistic to support the claim in paragraph 3. 3) The CTA at the end is too generic — make it more specific to the pain point discussed in the article."',
    },
    tip: 'The iterative approach consistently outperforms even the most carefully crafted single prompts for complex tasks.',
  },
  {
    number: '07',
    title: 'Output Anchoring',
    tagline: 'Show the AI what \'good\' looks like',
    description: 'Provide an example of a great output (or part of one) and ask the AI to match that style, format, or quality level. This is the fastest way to get consistent quality for content like copywriting, code, or design briefs.',
    example: {
      label: 'Anchoring',
      bad: '"Write a hook for my blog post about productivity."',
      good: '"Write a hook for my blog post about productivity. Match the style of this example: \'You\'ve been productive your entire career. Calendars full. Tasks checked. Emails answered within the hour. The problem? You haven\'t moved the needle on anything that actually matters.\' Same punch, same twist structure, same sentence length variation."',
    },
    tip: 'You can anchor on examples from your own past outputs, competitors, or any content you admire.',
  },
];

export default function PromptEngineeringTechniquesPage() {
  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog" className="text-[#CBA135] text-sm hover:underline">← Blog</Link>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">February 28, 2025</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">10 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            7 Prompt Engineering Techniques That Get 10x Better AI Results
          </h1>
          <p className="text-xl text-gray-300">
            These aren&apos;t tips — they&apos;re the core techniques that professional AI builders use daily. Master these seven and you&apos;ll get consistently better results from any AI, on any task.
          </p>
        </header>

        <div className="space-y-12">
          {techniques.map((tech) => (
            <section key={tech.number} className="border-l-2 border-[#CBA135]/30 pl-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#CBA135]/60 font-mono text-sm">{tech.number}</span>
                <h2 className="text-2xl font-bold">{tech.title}</h2>
              </div>
              <p className="text-[#CBA135] text-sm font-semibold mb-4">{tech.tagline}</p>
              <p className="text-gray-300 leading-relaxed mb-6">{tech.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold uppercase mb-2">❌ Without</p>
                  <p className="text-gray-300 text-sm font-mono">{tech.example.bad}</p>
                </div>
                <div className="bg-green-950/40 border border-green-800/40 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold uppercase mb-2">✓ With {tech.title}</p>
                  <p className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{tech.example.good}</p>
                </div>
              </div>
              <div className="bg-[#1A2F4A] rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <span className="text-[#CBA135] font-semibold">Pro tip: </span>
                  {tech.tip}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-[#1A2F4A] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-3">Go Deeper with the Prompt Engineering Academy</h2>
          <p className="text-gray-300 mb-4 text-sm">
            These 7 techniques are just the beginning. Our{' '}
            <Link href="/academy" className="text-[#CBA135] hover:underline">Prompt Engineering Academy</Link>{' '}
            covers advanced techniques including meta-prompting, prompt chaining, constitutional AI, and more — with interactive exercises and certificates.
          </p>
          <p className="text-gray-400 text-sm">
            Also read: <Link href="/blog/how-to-write-better-ai-prompts" className="text-[#CBA135] hover:underline">How to Write Better AI Prompts — Complete 2025 Guide →</Link>
          </p>
        </div>

        <div className="mt-12 bg-[#1A2F4A] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to optimize your prompts?</h2>
          <p className="text-gray-300 mb-8">
            Try Prompt Temple free — our AI applies all 7 of these techniques automatically.
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
