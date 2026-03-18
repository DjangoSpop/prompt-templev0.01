/** All landing page text constants — organized by section. */

// ── V1 copy (kept for old components still in codebase) ──
export const COPY_V1 = {
  nav: { logo: 'Prompt Temple', cta: 'Try Free' },
  hero: {
    headline: 'Your AI. Your Words. Your Way.',
    subheadline: 'Stop guessing what to say to AI. Find the right prompt in one search.',
    searchPlaceholder: 'What do you need help with?',
    autoTypeQuery: 'write a cold sales email...',
    platformsLabel: 'Trusted by 2,000+ users on 6 AI platforms',
    scrollCta: 'See how it works',
    ctaPrimary: 'Try Free',
  },
  transformer: {
    title: 'Type 3 words. Watch the magic.',
    inputPlaceholder: 'write code review',
    submitButton: 'Transform into Expert Prompt',
    yourInput: 'YOUR INPUT',
    expertPrompt: 'EXPERT PROMPT',
    costarLabels: { C: 'CONTEXT', O: 'OBJECTIVE', S: 'STYLE', T: 'TONE', A: 'AUDIENCE', R: 'RESPONSE' } as Record<string, string>,
    actions: { copy: 'Copy Full Prompt', scribe: 'Send to Scribe', share: 'Share This Result', tryAnother: 'Try Another' },
    brandedFooter: 'Prompt Temple — prompt-temple.com',
    brandedTagline: '3 words \u2192 expert prompt in 5 seconds',
    suggestions: ['plan marketing campaign', 'explain quantum physics', 'draft resignation letter'],
  },
  howItWorks: {
    title: 'How it works',
    steps: [
      { number: '1', verb: 'Find', name: 'Smart Search that understands your goals', description: 'Type \u201Chelp me pitch my startup.\u201D We find the right prompt \u2014 even if you don\u2019t use the exact words.' },
      { number: '2', verb: 'Enhance', name: 'AI turns small ideas into big results', description: 'Paste a rough idea. AI rewrites it like an expert wrote it. Watch it happen in real time.' },
      { number: '3', verb: 'Use', name: 'One click to take prompts anywhere', description: 'Click one button. Your prompt appears in ChatGPT, Claude, or Gemini. No copy. No paste. Done.' },
    ],
  },
  library: {
    title: 'Your personal library of AI wisdom',
    subtitle: '9,000+ tested prompts. One search away.',
    searchPlaceholder: 'What do you need help with?',
    categories: ['Writing', 'Marketing', 'Business', 'Code', 'Creative', 'Education'],
    exploreAll: 'Explore All 9,000+ \u2192',
    useNow: 'Use Now \u2192',
    copyToScribe: 'Copy to Scribe',
  },
  playground: {
    title: 'Try it now \u2014 no sign-up needed',
    subtitle: 'Paste any idea. Watch AI make it 10x better.',
    inputPlaceholder: 'Write me a good email to my boss about a raise...',
    submitButton: 'Make It Better',
    enhanceFurther: 'Enhance Further',
    copyToScribe: 'Copy to Scribe',
    shareResult: 'Share Result',
    enhancedPrompt: 'ENHANCED PROMPT',
    counterTemplate: 'Enhancement {n} of 3 free tries',
    paywall: 'Like this? Get unlimited + 9,000 templates + Scribe.',
    paywallCta: 'Start Free \u2192',
  },
  extension: {
    title: 'Your prompts, everywhere you chat',
    subtitle: 'One click in ChatGPT, Claude, or Gemini. Always ready.',
    cta: 'Get the Scribe Extension \u2192',
    frames: ['Open any AI chat', 'Click the Scribe icon', 'Browse your prompts', 'Select and inject', 'Better results. Zero effort.'],
  },
  problem: {
    title: 'Sound familiar?',
    cards: [
      { text: 'You spend 20 minutes on a prompt... AI gives you garbage.', icon: 'clock-trash' as const },
      { text: 'You found the perfect prompt last week... now it\'s gone.', icon: 'search-question' as const },
      { text: 'You copy prompts from the internet... they never work for you.', icon: 'clipboard-x' as const },
      { text: 'You use ChatGPT, Claude, AND Gemini... rewriting every time.', icon: 'windows-reload' as const },
    ],
    transition: 'What if there was a simpler way?',
  },
  social: {
    stats: [
      { value: '9,000+', label: 'tested prompts' },
      { value: '6', label: 'AI platforms' },
      { value: '30s', label: 'to start' },
    ],
    testimonials: [
      { name: 'Sarah M.', role: 'Marketing Manager', quote: 'I typed \u201Cmarketing plan\u201D and got a prompt that would\u2019ve taken me 30 minutes to write. Now I use it every day.', rating: 5, initials: 'SM' },
      { name: 'David K.', role: 'Freelance Writer', quote: 'I have 200 tested prompts ready for any client in one click. This changed how I work.', rating: 5, initials: 'DK' },
      { name: 'Amara L.', role: 'Student', quote: 'English isn\u2019t my first language. I typed 3 words and got a perfect study guide prompt. Amazing.', rating: 5, initials: 'AL' },
    ],
    trustStrip: 'Free to start \u00B7 No credit card \u00B7 Cancel anytime \u00B7 Your data stays yours',
  },
  cta: {
    closing: 'Stop fighting with AI. Start working with it.',
    primary: 'Start Free \u2192',
    secondary: 'Get Scribe Extension \u2192',
  },
  footer: {
    tagline: 'Where Wisdom Meets AI',
    links: { product: ['Templates', 'Pricing', 'Extension', 'Academy'], company: ['About', 'Blog', 'Support'] },
    copyright: '\u00A9 2026 Prompt Temple',
    madeWith: 'Made with \uD80C\uDC80',
  },
  loading: {
    messages: ['Crafting wisdom...', 'Consulting the scrolls...', 'Summoning ancient knowledge...', 'Channeling the scribes...', 'Decoding the hieroglyphs...', 'Opening the temple gates...', 'Reading the papyrus...', 'Aligning the pyramids...', 'Gathering sacred knowledge...', 'Invoking the oracle...'],
  },
} as const;

// ── V2 copy (active landing page) ────────────────────────

export const COPY = {
  nav: {
    logo: 'Prompt Temple',
    cta: 'Start Free',
  },

  hero: {
    pill: '5,000+ professionals already use Prompt Temple',
    headline: 'Stop Getting Mediocre AI Results.',
    headlineGradient: 'Your Prompts Are the Problem.',
    subtitle: 'Search 4,200+ expert-crafted prompts. Optimize any idea into a professional prompt. Use it in any AI tool with one click.',
    tabSearch: 'Search Prompts',
    tabOptimize: 'Optimize',
    searchPlaceholder: 'What do you need help with?',
    autoTypeQuery: 'write a cold sales email...',
    optimizerPlaceholder: 'Paste any rough prompt idea here...',
    optimizeButton: 'Optimize This Prompt',
    optimizing: 'Optimizing...',
    signupNudge: 'Sign up for real AI-powered optimization \u2192',
    ctaPrimary: 'Start Free \u2014 No Credit Card',
    ctaSecondary: 'Get Chrome Extension',
    platformsLabel: 'Works with every AI platform',
  },

  problem: {
    title: 'Sound Familiar?',
    cards: [
      {
        text: 'You spend 20 minutes writing a prompt... and the AI gives you generic garbage.',
        icon: 'clock-trash' as const,
      },
      {
        text: 'You found the perfect prompt last week... but now you can\'t find it anywhere.',
        icon: 'search-question' as const,
      },
      {
        text: 'You copy prompts from Reddit and Twitter... they never work for your use case.',
        icon: 'clipboard-x' as const,
      },
      {
        text: 'You use ChatGPT, Claude, AND Gemini... rewriting the same prompt every time.',
        icon: 'windows-reload' as const,
      },
    ],
    transition: 'There\'s a better way.',
  },

  templateSearch: {
    title: 'Find the Perfect Prompt in Seconds',
    subtitle: '4,200+ expert-crafted, tested templates. One search away.',
    searchPlaceholder: 'Search templates... e.g., "cold email", "code review"',
    categories: ['All', 'Marketing', 'Business', 'Writing', 'Code', 'Creative', 'Education', 'Career', 'Support'],
    useTemplate: 'Use This Template \u2192',
    exploreAll: 'Browse All Templates \u2192',
  },

  featureShowcase: {
    title: 'Everything You Need. Zero Learning Curve.',
    tabs: [
      {
        icon: '\u270D\uFE0F',
        title: 'Instant Prompt Upgrade',
        short: 'Paste a rough idea. Get an expert-level prompt.',
        description: 'Paste what you\'d normally type into ChatGPT. We add the expert techniques that get you better answers.',
      },
      {
        icon: '\uD83D\uDD0D',
        title: 'Find Ready-Made Prompts',
        short: 'Search 4,200+ templates by topic.',
        description: 'Search our library of 4,200+ prompts made by professionals. Just copy, paste, and use.',
      },
      {
        icon: '\uD83D\uDCCB',
        title: 'One-Click Templates',
        short: 'Fill in the blanks. Get a perfect prompt.',
        description: 'Pick a template, fill in 2\u20133 details, and get a perfect prompt instantly. Like a form that writes AI instructions for you.',
      },
      {
        icon: '\uD83C\uDF10',
        title: 'Works Inside ChatGPT',
        short: 'Browser extension injects prompts directly.',
        description: 'Install our free Chrome extension. It adds an \u201CEnhance\u201D button right inside ChatGPT, Claude, and Gemini. No copy-pasting needed.',
      },
    ],
    extensionCta: 'Install Chrome Extension \u2192',
  },

  social: {
    stats: [
      { value: 47832, label: 'prompts enhanced', suffix: '' },
      { value: 4200, label: 'templates available', suffix: '+' },
      { value: 5127, label: 'active users', suffix: '' },
      { value: 4.8, label: 'average rating', suffix: '\u2605', isDecimal: true },
    ],
    testimonials: [
      {
        name: 'Sarah K.',
        role: 'Marketing Director',
        quote: 'I used to spend 20 minutes crafting each prompt. Now I search, click, and get better results in 10 seconds.',
        rating: 5,
        initials: 'SK',
      },
      {
        name: 'James L.',
        role: 'Product Lead',
        quote: 'The browser extension changed everything. I access my prompt library right inside ChatGPT without switching tabs.',
        rating: 5,
        initials: 'JL',
      },
      {
        name: 'Maria D.',
        role: 'Freelance Writer',
        quote: 'English is my second language. Prompt Temple turns my rough ideas into professional prompts every single time.',
        rating: 5,
        initials: 'MD',
      },
    ],
    trustStrip: 'Free to start \u00B7 No credit card \u00B7 Cancel anytime \u00B7 Your data stays yours',
    logosLabel: 'Works with',
    logos: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot'],
  },

  cta: {
    afterProblem: {
      headline: 'Ready to stop wasting time on prompts?',
      primary: 'Start Free \u2014 No Credit Card',
      sub: '5 free optimizations daily',
    },
    afterTemplates: {
      headline: '4,200+ templates. Find the right one in seconds.',
      primary: 'Sign Up & Browse Library',
    },
    afterFeatures: {
      headline: 'Stop guessing. Start getting the AI results you actually need.',
      primary: 'Get Started Free',
      secondary: 'Install Chrome Extension',
    },
  },

  footer: {
    brand: 'Prompt Temple',
    tagline: 'Where Wisdom Meets AI',
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
    copyright: '\u00A9 2025 Prompt Temple. All rights reserved.',
  },

  loading: {
    messages: [
      'Crafting wisdom...',
      'Consulting the scrolls...',
      'Summoning ancient knowledge...',
      'Channeling the scribes...',
      'Decoding the hieroglyphs...',
      'Opening the temple gates...',
      'Reading the papyrus...',
      'Aligning the pyramids...',
      'Gathering sacred knowledge...',
      'Invoking the oracle...',
    ],
  },
} as const;
