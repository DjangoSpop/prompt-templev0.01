/** Landing page V3 copy — clarity-first, conversion-optimized. */

export const COPY_V3 = {
  nav: {
    logo: 'Prompt Temple',
    cta: 'Start Free',
  },

  hero: {
    pill: 'Used by 5,000+ professionals',
    headline: 'Get Better Results from Any AI Tool.',
    subtitle:
      'Search thousands of ready-made prompts. Or paste your idea and let AI make it 10x better. One click to use it anywhere.',
    ctaPrimary: 'Start Free — No Credit Card',
    ctaSecondary: 'See How It Works ↓',
    platformsLabel: 'Works with ChatGPT · Claude · Gemini · Perplexity · Copilot',
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
      },
      {
        number: '2',
        title: 'Enhance with AI',
        description:
          'Our AI rewrites it into a professional prompt that gets better results.',
      },
      {
        number: '3',
        title: 'Use Anywhere',
        description:
          'Copy it, or send it directly to ChatGPT, Claude, or Gemini with our Chrome extension.',
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
      },
      {
        icon: '📋',
        title: '4,200+ Ready-Made Prompts',
        description:
          'Browse templates for marketing, writing, business, code, and more. Pick one, fill in the blanks, done.',
        tag: 'Templates',
      },
      {
        icon: '✨',
        title: 'Turn Any Idea into a Pro Prompt',
        description:
          'Paste a rough idea. AI rewrites it with expert techniques. Get 10x better results from any AI.',
        tag: 'AI Enhancer',
      },
      {
        icon: '🌐',
        title: 'Use Your Prompts Inside ChatGPT',
        description:
          'Install our free Chrome extension. Access your prompt library right inside any AI tool. No copy-paste needed.',
        tag: 'Chrome Extension',
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

  useCases: {
    title: 'Built for Everyone Who Uses AI',
    subtitle: 'No matter your role, Prompt Temple makes AI work better for you.',
    roles: [
      { emoji: '👩‍💼', role: 'Marketers', benefit: 'Write campaigns that convert, faster' },
      { emoji: '✍️', role: 'Writers', benefit: 'Beat writer\'s block with expert prompts' },
      { emoji: '💼', role: 'Freelancers', benefit: 'Deliver better client work with AI' },
      { emoji: '🎓', role: 'Students', benefit: 'Get better study guides and research prompts' },
      { emoji: '👨‍💻', role: 'Developers', benefit: 'Code review, debugging, and architecture prompts' },
      { emoji: '🏢', role: 'Business', benefit: 'Strategy, planning, and analysis prompts' },
      { emoji: '🎨', role: 'Creators', benefit: 'Generate ideas and content briefs in seconds' },
      { emoji: '📊', role: 'Analysts', benefit: 'Data analysis and reporting prompts ready to go' },
    ],
  },

  social: {
    title: 'Trusted by Thousands',
    stats: [
      { value: 47832, label: 'prompts enhanced', suffix: '' },
      { value: 4200, label: 'templates available', suffix: '+' },
      { value: 5127, label: 'active users', suffix: '' },
      { value: 4.8, label: 'average rating', suffix: '★', isDecimal: true },
    ],
    testimonials: [
      {
        name: 'Sarah K.',
        role: 'Marketing Director',
        quote:
          'I used to spend 20 minutes crafting each prompt. Now I search, click, and get better results in 10 seconds.',
        rating: 5,
        initials: 'SK',
      },
      {
        name: 'James L.',
        role: 'Product Lead',
        quote:
          'The browser extension changed everything. I access my prompt library right inside ChatGPT without switching tabs.',
        rating: 5,
        initials: 'JL',
      },
      {
        name: 'Maria D.',
        role: 'Freelance Writer',
        quote:
          'English is my second language. Prompt Temple turns my rough ideas into professional prompts every single time.',
        rating: 5,
        initials: 'MD',
      },
    ],
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
      ],
    },
    chromeStore: 'Available on Chrome Web Store',
    chromeStoreHref: '/download',
    copyright: '© 2026 Prompt Temple. All rights reserved.',
  },
} as const;
