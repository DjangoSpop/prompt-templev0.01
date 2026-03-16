import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '50 Best ChatGPT Prompt Templates for Business in 2025',
  description: 'Ready-to-use ChatGPT prompt templates for marketing, sales, HR, content creation, coding, and more. Copy and paste to get professional results instantly.',
  alternates: { canonical: 'https://prompt-temple.com/blog/chatgpt-prompt-templates' },
  openGraph: {
    type: 'article',
    title: '50 Best ChatGPT Prompt Templates for Business in 2025',
    description: 'Ready-to-use ChatGPT prompt templates for marketing, sales, content creation, and more.',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '50 Best ChatGPT Prompt Templates for Business in 2025',
  description: 'Ready-to-use ChatGPT prompt templates for marketing, sales, HR, content creation, coding, and more.',
  author: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompt-temple.com' },
  publisher: { '@type': 'Organization', name: 'Prompt Temple', url: 'https://prompt-temple.com' },
  datePublished: '2025-03-05',
  url: 'https://prompt-temple.com/blog/chatgpt-prompt-templates',
};

const templates = [
  {
    category: 'Marketing',
    items: [
      { title: 'Brand Voice Guide', prompt: 'Act as a brand strategist. Create a comprehensive brand voice guide for [Company Name], a [industry] company targeting [audience]. Include: tone descriptors (3-5 adjectives), writing do\'s and don\'ts, 5 example sentences in brand voice, and guidelines for different channels (social, email, ads). Make it actionable and include a quick-reference card.' },
      { title: 'Email Subject Line Generator', prompt: 'Generate 10 email subject lines for [topic/offer] targeting [audience]. Include: 3 curiosity-driven, 3 urgency-driven, 2 benefit-driven, and 2 question-based options. Keep each under 50 characters. Provide a predicted open rate rationale for each.' },
      { title: 'Social Media Content Calendar', prompt: 'Create a 2-week social media content calendar for [brand/product] on [platforms]. Include: post topic, format (carousel/video/text/image), caption (max 280 chars for Twitter, 2200 for Instagram), hashtag suggestions (5-10), and best posting time. Align content with [campaign goal/theme].' },
    ],
  },
  {
    category: 'Content Creation',
    items: [
      { title: 'SEO Blog Post Outline', prompt: 'Create a detailed SEO blog post outline for the keyword "[target keyword]". Include: H1 title (include keyword), meta description (max 155 chars), 5-7 H2 sections with 3 H3 subsections each, key points to cover per section, and internal linking opportunities. Target length: 2000 words. Audience: [describe audience].' },
      { title: 'Video Script', prompt: 'Write a [duration]-minute YouTube video script about [topic] for an audience of [audience]. Structure: Hook (first 15 seconds to stop the scroll), Problem setup, Main content (3-5 key points with transitions), Proof/examples, CTA. Include [B-roll suggestions in brackets] and speaker notes in italics.' },
      { title: 'Press Release', prompt: 'Write a press release announcing [announcement] for [Company Name]. Follow AP style. Include: headline (max 100 chars), dateline, lead paragraph (who/what/when/where/why), 2-3 body paragraphs with quotes from [spokesperson name, title], boilerplate about the company, and contact information. Keep under 500 words.' },
    ],
  },
  {
    category: 'Sales & Customer Success',
    items: [
      { title: 'Cold Email Sequence', prompt: 'Write a 3-email cold outreach sequence for [product/service] targeting [prospect type]. Email 1: Value-first, personalized opener + single pain point + soft CTA. Email 2 (Day 3): Different angle, social proof. Email 3 (Day 7): Final follow-up with urgency or breakup framing. Keep each email under 150 words. Subject lines: under 6 words.' },
      { title: 'Objection Handling Script', prompt: 'Create objection handling scripts for these 5 common sales objections for [product/service]: 1) "It\'s too expensive" 2) "We\'re happy with our current solution" 3) "Now isn\'t the right time" 4) "I need to think about it" 5) "I need to check with my team." For each: acknowledge, reframe, counter, question to advance.' },
    ],
  },
  {
    category: 'HR & Operations',
    items: [
      { title: 'Job Description', prompt: 'Write a compelling job description for a [Job Title] at [Company Name], a [describe company briefly]. Include: role summary (3 sentences), key responsibilities (6-8 bullets), requirements (split into "must-have" and "nice-to-have"), what we offer (compensation, benefits, culture), and an inclusive closing statement. Avoid gendered language.' },
      { title: 'Performance Review Template', prompt: 'Create a comprehensive performance review template for [role/department]. Include sections for: goal achievement (with rating scale), core competencies (5-6 relevant ones), strengths and wins, areas for growth, development plan for next period, and manager/employee comment sections. Make it balanced and development-focused rather than just evaluative.' },
    ],
  },
];

export default function ChatGPTPromptTemplatesPage() {
  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="max-w-3xl mx-auto px-6 py-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog" className="text-[#CBA135] text-sm hover:underline">← Blog</Link>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">March 5, 2025</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">12 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            50 Best ChatGPT Prompt Templates for Business in 2025
          </h1>
          <p className="text-xl text-gray-300">
            Stop starting from scratch. These ready-to-use templates cover the most common business use cases and are optimized to deliver professional results on the first try.
          </p>
        </header>

        <div className="bg-[#1A2F4A] rounded-xl p-6 mb-10">
          <p className="text-gray-300 text-sm">
            <strong className="text-[#CBA135]">How to use these templates:</strong> Replace everything in [brackets] with your specific details. For best results, use our{' '}
            <Link href="/playground" className="text-[#CBA135] hover:underline">AI Prompt Optimizer</Link> to further enhance these templates for your exact use case.
          </p>
        </div>

        <div className="space-y-12">
          {templates.map((section) => (
            <section key={section.category}>
              <h2 className="text-2xl font-bold text-[#CBA135] mb-6">{section.category} Templates</h2>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.title} className="bg-[#1A2F4A] rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <div className="bg-[#0E1B2A] rounded-lg p-4">
                      <p className="text-gray-300 text-sm font-mono leading-relaxed">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-[#1A2F4A] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-3">Want all 50 templates + 4,950 more?</h2>
          <p className="text-gray-300 mb-4 text-sm">
            These 10 templates are just the beginning. Our{' '}
            <Link href="/templates" className="text-[#CBA135] hover:underline">full template library</Link>{' '}
            has 5000+ templates across every category, searchable and ready to use. Free to start.
          </p>
          <p className="text-gray-400 text-sm">
            Also check out: <Link href="/blog/prompt-engineering-techniques" className="text-[#CBA135] hover:underline">7 Prompt Engineering Techniques That Get 10x Better AI Results →</Link>
          </p>
        </div>

        <div className="mt-12 bg-[#1A2F4A] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to optimize your prompts?</h2>
          <p className="text-gray-300 mb-8">
            Try Prompt Temple free — access 5000+ templates and our AI optimizer.
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
              Browse All Templates
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
