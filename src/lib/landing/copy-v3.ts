/** Landing page V3 copy — clarity-first, conversion-optimized. */

import type { CuratedShowcaseCard } from '@/types/saved-prompts';

/** Real featured curated prompts — shown while the live showcase is unavailable or empty. */
const LIBRARY_FALLBACK: CuratedShowcaseCard[] = [
  {
    id: 'abb53ea1-122f-454f-8622-ed401440423e',
    title: 'Audit a BigQuery Pipeline for Cost, Safety and Reruns',
    hook: 'Get a structured review of your Python and BigQuery pipeline that flags runaway costs, unsafe reruns and hidden failures before they reach production.',
    category: 'Data & Analytics',
    category_slug: 'data-analytics',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'github/awesome-copilot', url: 'https://github.com/github/awesome-copilot/blob/main/skills/bigquery-pipeline-audit/SKILL.md', license: 'MIT' },
  },
  {
    id: '3a3797f8-adb5-4424-b0c0-83003202a1d4',
    title: 'Write a Lean Product Requirements Document',
    hook: 'Turns a product idea into a short, decision-ready PRD that engineers, designers and leadership can read in minutes and act on.',
    category: 'Business & Strategy',
    category_slug: 'business-strategy',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'phuryn/pm-skills', url: 'https://github.com/phuryn/pm-skills/blob/main/pm-execution/skills/create-prd/SKILL.md', license: 'MIT' },
  },
  {
    id: 'c094682b-b661-4f84-a1bf-b0d2a9f025d0',
    title: 'Technical Interview Coach for Mock System Design and Behavioral Rounds',
    hook: 'Run realistic mock interviews with direct feedback on system design, STAR behavioral answers, and coding prep for software engineers.',
    category: 'Education & Learning',
    category_slug: 'education-learning',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'github/awesome-copilot', url: 'https://github.com/github/awesome-copilot/blob/main/agents/interview-prep.agent.md', license: 'MIT' },
  },
  {
    id: 'd8b2afab-c975-4b53-be63-e06d977ac577',
    title: 'Systematic Debugging: Find Root Cause Before Fixing',
    hook: 'A disciplined four-phase process that stops guesswork and symptom patches, helping developers isolate the true cause of any bug before writing a fix.',
    category: 'Coding & Development',
    category_slug: 'coding-development',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'obra/superpowers', url: 'https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md', license: 'MIT' },
  },
  {
    id: '0c30f175-5b3b-4e3a-9433-92ac78e4cff4',
    title: 'Audit AI-Generated Code for Secrets and Auth Flaws',
    hook: 'Finds leaked keys, open Supabase row-level security, forgeable admin checks, and prompt injection in AI-written code, with the exploit and fix for each.',
    category: 'Coding & Development',
    category_slug: 'coding-development',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'msitarzewski/agency-agents', url: 'https://github.com/msitarzewski/agency-agents/blob/main/security/security-ai-generated-code-auditor.md', license: 'MIT' },
  },
  {
    id: 'd0dd337b-8500-4ba7-90ba-a96e54adc6ff',
    title: 'Idempotent Stripe Payments and Billing Engineer',
    hook: 'Design payment and subscription flows that never double-charge, verify webhooks, and reconcile every cent against processor payouts.',
    category: 'Coding & Development',
    category_slug: 'coding-development',
    editor_quality: 5,
    use_count: 0,
    source: { name: 'msitarzewski/agency-agents', url: 'https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-payments-billing-engineer.md', license: 'MIT' },
  },
];

export const COPY_V3 = {
  nav: {
    logo: 'Prompt Temple',
    cta: 'Start Free',
  },

  hero: {
    pill: 'Powered by AI — results in seconds',
    freeBadge: 'FREE · NO SIGNUP',
    headline: 'Your Prompts, Forged in the Temple of AI.',
    subtitle:
      'Optimize any prompt with sacred AI precision. Craft SEO-ready content that ranks. Send one prompt to 12 AI models instantly with our extension. Enter the Temple — your AI mastery begins here.',
    ctaPrimary: 'Enter the Temple — Free',
    ctaSecondary: 'See How It Works ↓',
    tryMe: 'Try the Sacred Forge',
    platformsLabel: 'Works with ChatGPT · Claude · Gemini · Perplexity · Copilot',
    features: [
      { icon: 'optimize', label: 'Prompt Optimizer', desc: 'Turn rough ideas into powerful prompts' },
      { icon: 'seo', label: 'SEO Scribe', desc: 'Content that ranks like a pharaoh\'s decree' },
      { icon: 'extension', label: '1 Prompt → 12 Models', desc: 'Send to every AI tool at once' },
    ],
  },

  trustStrip: {
    label: 'Works with',
    logos: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot'] as const,
  },

  howItWorks: {
    title: 'How It Works',
    subtitle: 'Three simple steps to better AI results.',
    steps: [
      {
        number: '1',
        title: 'Search or Paste',
        description:
          'Find a ready-made prompt from our library. Or paste your rough idea.',
        href: '/discover?curated=true&sort=popularity',
        cta: 'Browse the library',
      },
      {
        number: '2',
        title: 'Enhance with AI',
        description:
          'Our AI rewrites it into a professional prompt that gets better results.',
        href: null,
        cta: null,
      },
      {
        number: '3',
        title: 'Use Anywhere',
        description:
          'Copy it, or send it directly to ChatGPT, Claude, or Gemini with our Chrome extension.',
        href: null,
        cta: null,
      },
    ],
    cta: 'Try It Free →',
  },

  features: {
    title: 'Everything You Need. Zero Learning Curve.',
    subtitle: 'Four powerful features, all in one place.',
    cards: [
      {
        icon: '🔍',
        title: 'Search by Meaning',
        description:
          'Type what you need in plain English. We find the best prompt — even if you don\'t use the exact words.',
        tag: 'Semantic Search',
        href: '/discover?mode=semantic',
        cta: 'Try a search',
      },
      {
        icon: '📋',
        title: '4,200+ Ready-Made Prompts',
        description:
          'Browse templates for marketing, writing, business, code, and more. Pick one, fill in the blanks, done.',
        tag: 'Templates',
        href: '/discover?curated=true&sort=popularity',
        cta: 'Browse the library',
      },
      {
        icon: '✨',
        title: 'Turn Any Idea into a Pro Prompt',
        description:
          'Paste a rough idea. AI rewrites it with expert techniques. Get 10x better results from any AI.',
        tag: 'AI Enhancer',
        href: '/prompt-optimizer',
        cta: 'Enhance a prompt',
      },
      {
        icon: '🌐',
        title: 'Use Your Prompts Inside ChatGPT',
        description:
          'Install our free Chrome extension. Access your prompt library right inside any AI tool. No copy-paste needed.',
        tag: 'Chrome Extension',
        href: '/download',
        cta: 'Get the extension',
      },
    ],
  },

  demo: {
    title: 'See the Difference',
    subtitle: 'Watch a rough idea become a professional prompt.',
    before: {
      label: 'What you type',
      text: 'Help me write a cold email to a potential client',
    },
    after: {
      label: 'What Prompt Temple creates',
      text: `You are a B2B sales copywriter with 10 years of experience in SaaS outreach.

Task: Write a personalized cold email that includes:
1. A subject line that creates curiosity without clickbait
2. An opening line referencing the prospect's recent company news
3. A clear pain point → solution connection in 2 sentences
4. A soft CTA asking for a 15-minute call
5. A professional sign-off

Tone: Confident but not aggressive. Conversational, not corporate.
Length: Under 150 words.
Format: Ready to send — no placeholders.`,
    },
    cta: 'Try it yourself — free',
  },

  library: {
    tag: 'From the Library',
    title: 'Fresh From the World\'s Open Prompt Libraries',
    subtitle:
      'Hand-picked, open-licensed prompts from popular open-source collections — each with an editor-written card and its source credited.',
    ctaTemplate: 'Browse all {count} curated prompts →',
    ctaFallback: 'Browse 1,600+ curated prompts →',
    secondary: 'or browse templates →',
    openPrompt: 'Open prompt →',
    fallback: LIBRARY_FALLBACK,
  },

  useCases: {
    title: 'Built for Everyone Who Uses AI',
    subtitle: 'No matter your role, Prompt Temple makes AI work better for you.',
    cta: 'Explore →',
    roles: [
      { emoji: '👩‍💼', role: 'Marketers', benefit: 'Write campaigns that convert, faster', category: 'Marketing & Sales' },
      { emoji: '✍️', role: 'Writers', benefit: 'Beat writer\'s block with expert prompts', category: 'Writing & Content' },
      { emoji: '💼', role: 'Freelancers', benefit: 'Deliver better client work with AI', category: 'Business & Strategy' },
      { emoji: '🎓', role: 'Students', benefit: 'Get better study guides and research prompts', category: 'Research & Analysis' },
      { emoji: '👨‍💻', role: 'Developers', benefit: 'Code review, debugging, and architecture prompts', category: 'Coding & Development' },
      { emoji: '🏢', role: 'Business', benefit: 'Strategy, planning, and analysis prompts', category: 'Business & Strategy' },
      { emoji: '🎨', role: 'Creators', benefit: 'Plan posts, scripts and content briefs in seconds', category: 'Writing & Content' },
      { emoji: '📊', role: 'Analysts', benefit: 'Data analysis and reporting prompts ready to go', category: 'Data & Analytics' },
    ],
  },

  social: {
    // Only verifiable facts here: the template count comes from the live API (34,280 on 29 Oct 2026).
    // Add real testimonials only with the person's permission.
    title: 'Everything You Need to Write Better Prompts',
    stats: [
      { value: 34000, label: 'prompt templates', suffix: '+' },
      { value: 5, label: 'AI platforms supported', suffix: '' },
      { value: 1, label: 'click to improve a prompt', suffix: '' },
      { value: 14, label: 'day money-back guarantee', suffix: '' },
    ],
    testimonials: [] as { name: string; role: string; quote: string; rating: number; initials: string }[],
    trustStrip: 'Free to start · No credit card · Cancel anytime · Your data stays yours',
  },

  finalCta: {
    headline: 'Start Getting Better AI Results Today',
    subtitle:
      'Free to start. No credit card needed. Works with every AI platform.',
    primaryText: 'Start Free →',
    secondaryText: 'Or install the Chrome Extension',
    secondaryHref: '/download',
  },

  faq: {
    title: 'Questions? We\'ve Got Answers.',
    items: [
      {
        q: 'Is it really free to start?',
        a: 'Yes. You get free credits when you sign up and daily free optimizations. No credit card is required.',
      },
      {
        q: 'Which AI tools does it work with?',
        a: 'Prompt Temple works across ChatGPT, Claude, Gemini, Perplexity, and Copilot. Any prompt you create works in any AI tool.',
      },
      {
        q: 'Do I need to know prompt engineering?',
        a: 'Not at all. That\'s the whole point. You type a rough idea and Prompt Temple turns it into a professional prompt automatically.',
      },
      {
        q: 'What does the Chrome extension do?',
        a: 'It lets you access your prompt library directly inside ChatGPT, Claude, and Gemini. No tab switching, no copy-pasting.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. Your prompts are private and encrypted. We never share your data with third parties.',
      },
    ],
  },

  broadcaster: {
    title: 'One Prompt. Every AI. Instant Comparison.',
    subtitle: 'Send your prompt to multiple AI models at once. Compare speed, quality, and style side-by-side.',
    samplePrompt: 'Write a compelling product description for a smart water bottle that tracks hydration and syncs with your fitness app.',
    cta: 'Try Broadcaster Free →',
  },

  footer: {
    brand: 'Prompt Temple',
    tagline: 'Better prompts. Better AI results.',
    links: {
      product: [
        { label: 'Templates', href: '/templates' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Extension', href: '/download' },
        { label: 'Academy', href: '/academy' },
      ],
      company: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Help', href: '/help' },
        { label: 'Contact', href: '/contact' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Refund Policy', href: '/refund-policy' },
      ],
    },
    chromeStore: 'Available on Chrome Web Store',
    chromeStoreHref: '/download',
    copyright: '© 2026 Pharaonic Tech. Prompt Temple is a product of Pharaonic Tech.',
  },
} as const;
