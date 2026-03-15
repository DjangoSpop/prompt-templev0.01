import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prompt Engineering Blog — AI Prompt Tips & Guides',
  description: 'Learn prompt engineering techniques, discover the best ChatGPT templates, and master AI prompt writing with our expert guides and tutorials.',
  alternates: { canonical: 'https://prompttemple2030.com/blog' },
};

const posts = [
  {
    slug: 'how-to-write-better-ai-prompts',
    title: 'How to Write Better AI Prompts — Complete 2025 Guide',
    description: 'A comprehensive guide covering everything from basic structure to advanced techniques. Learn how to get consistently great results from any AI.',
    date: 'March 10, 2025',
    readTime: '8 min read',
    category: 'Guide',
  },
  {
    slug: 'chatgpt-prompt-templates',
    title: '50 Best ChatGPT Prompt Templates for Business in 2025',
    description: 'Ready-to-use prompt templates for marketing, sales, customer support, content creation, and more. Copy, paste, and get results instantly.',
    date: 'March 5, 2025',
    readTime: '12 min read',
    category: 'Templates',
  },
  {
    slug: 'prompt-engineering-techniques',
    title: '7 Prompt Engineering Techniques That Get 10x Better AI Results',
    description: 'Chain of Thought, Few-Shot, Role Prompting, and 4 more techniques that professional AI builders use daily. With examples for each.',
    date: 'February 28, 2025',
    readTime: '10 min read',
    category: 'Techniques',
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0E1B2A] text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <header className="mb-16">
          <p className="text-[#CBA135] text-sm font-semibold tracking-widest uppercase mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Prompt Engineering Guides & Tips
          </h1>
          <p className="text-xl text-gray-300">
            Practical articles to help you get dramatically better results from AI. Written by prompt engineers for AI builders.
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="bg-[#1A2F4A] rounded-2xl p-8 hover:bg-[#1E3A5A] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#CBA135]/20 text-[#CBA135] text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-gray-500 text-sm">{post.date}</span>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-gray-500 text-sm">{post.readTime}</span>
              </div>
              <h2 className="text-xl font-bold mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-[#CBA135] transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-400 mb-4">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-[#CBA135] font-semibold text-sm hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 bg-[#1A2F4A] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to put these techniques to work?</h2>
          <p className="text-gray-300 mb-8">
            Try Prompt Temple free and transform your first prompt in 60 seconds.
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
        </div>
      </div>
    </main>
  );
}
