/** All landing page text constants — organized by section. */

export const COPY = {
  nav: {
    logo: 'Prompt Temple',
    cta: 'Try Free',
  },

  hero: {
    headline: 'Your AI. Your Words. Your Way.',
    subheadline: 'Stop guessing what to say to AI. Find the right prompt in one search.',
    searchPlaceholder: 'What do you need help with?',
    autoTypeQuery: 'write a cold sales email...',
    platformsLabel: 'Trusted by 2,000+ users on 6 AI platforms',
    scrollCta: 'See how it works',
    ctaPrimary: 'Try Free',
  },

  problem: {
    title: 'Sound familiar?',
    cards: [
      {
        text: 'You spend 20 minutes on a prompt... AI gives you garbage.',
        icon: 'clock-trash' as const,
      },
      {
        text: 'You found the perfect prompt last week... now it\'s gone.',
        icon: 'search-question' as const,
      },
      {
        text: 'You copy prompts from the internet... they never work for you.',
        icon: 'clipboard-x' as const,
      },
      {
        text: 'You use ChatGPT, Claude, AND Gemini... rewriting every time.',
        icon: 'windows-reload' as const,
      },
    ],
    transition: 'What if there was a simpler way?',
  },

  transformer: {
    title: 'Type 3 words. Watch the magic.',
    inputPlaceholder: 'write code review',
    submitButton: 'Transform into Expert Prompt',
    yourInput: 'YOUR INPUT',
    expertPrompt: 'EXPERT PROMPT',
    costarLabels: {
      C: 'CONTEXT',
      O: 'OBJECTIVE',
      S: 'STYLE',
      T: 'TONE',
      A: 'AUDIENCE',
      R: 'RESPONSE',
    } as Record<string, string>,
    actions: {
      copy: 'Copy Full Prompt',
      scribe: 'Send to Scribe',
      share: 'Share This Result',
      tryAnother: 'Try Another',
    },
    brandedFooter: 'Prompt Temple — prompt-temple.com',
    brandedTagline: '3 words \u2192 expert prompt in 5 seconds',
    suggestions: [
      'plan marketing campaign',
      'explain quantum physics',
      'draft resignation letter',
    ],
  },

  howItWorks: {
    title: 'How it works',
    steps: [
      {
        number: '1',
        verb: 'Find',
        name: 'Smart Search that understands your goals',
        description: 'Type \u201Chelp me pitch my startup.\u201D We find the right prompt \u2014 even if you don\u2019t use the exact words.',
      },
      {
        number: '2',
        verb: 'Enhance',
        name: 'AI turns small ideas into big results',
        description: 'Paste a rough idea. AI rewrites it like an expert wrote it. Watch it happen in real time.',
      },
      {
        number: '3',
        verb: 'Use',
        name: 'One click to take prompts anywhere',
        description: 'Click one button. Your prompt appears in ChatGPT, Claude, or Gemini. No copy. No paste. Done.',
      },
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
    frames: [
      'Open any AI chat',
      'Click the Scribe icon',
      'Browse your prompts',
      'Select and inject',
      'Better results. Zero effort.',
    ],
  },

  social: {
    stats: [
      { value: '9,000+', label: 'tested prompts' },
      { value: '6', label: 'AI platforms' },
      { value: '30s', label: 'to start' },
    ],
    testimonials: [
      {
        name: 'Sarah M.',
        role: 'Marketing Manager',
        quote: 'I typed \u201Cmarketing plan\u201D and got a prompt that would\u2019ve taken me 30 minutes to write. Now I use it every day.',
        rating: 5,
        initials: 'SM',
      },
      {
        name: 'David K.',
        role: 'Freelance Writer',
        quote: 'I have 200 tested prompts ready for any client in one click. This changed how I work.',
        rating: 5,
        initials: 'DK',
      },
      {
        name: 'Amara L.',
        role: 'Student',
        quote: 'English isn\u2019t my first language. I typed 3 words and got a perfect study guide prompt. Amazing.',
        rating: 5,
        initials: 'AL',
      },
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
    links: {
      product: ['Templates', 'Pricing', 'Extension', 'Academy'],
      company: ['About', 'Blog', 'Support'],
    },
    copyright: '\u00A9 2026 Prompt Temple',
    madeWith: 'Made with \uD80C\uDC80',
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
