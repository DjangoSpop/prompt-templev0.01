# Prompt Temple — SEO & Web Crawler Compliance Sprint

> **For:** Claude Code Agent
> **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Vercel deployment
> **Domain:** prompttemple2030.com
> **Goal:** Make Prompt Temple discoverable on Google, Bing, and social platforms. Drive organic traffic from people searching for AI prompt tools, prompt engineering, and ChatGPT helpers.

---

## CRITICAL CONTEXT

This is a **Next.js App Router** project. Next.js has built-in SEO capabilities through `metadata` exports, `generateStaticParams`, `sitemap.ts`, and `robots.ts` — we must use these native features, not external plugins. The project directory is `promptcord/` with source in `src/`.

**Current SEO Problems Found:**
1. The landing page says "PromptForge" — needs to be "Prompt Temple" everywhere
2. No `metadata` export on any page (no title, description, og tags)
3. No `sitemap.ts` — Google can't discover pages
4. No `robots.ts` — crawlers have no guidance
5. No structured data (JSON-LD) — no rich snippets in search
6. No `manifest.json` for PWA / app discovery
7. No Open Graph images for social sharing
8. Template pages are behind authentication — Google can't index them
9. No public blog/content pages for organic keyword targeting
10. Footer links point to non-existent pages (`/docs`, `/learn`, `/blog`, `/about`, `/privacy`)

**Business model context:** Prompt Temple is an AI prompt optimization platform with a freemium model. The SEO strategy targets people searching for: "AI prompt tools", "ChatGPT prompt optimizer", "prompt engineering templates", "how to write better AI prompts", "prompt library". The domain is `prompttemple2030.com`.

---

## TASK 1: Global Metadata & Brand Fix

### Problem
No page has a `metadata` export. The landing page references "PromptForge" instead of "Prompt Temple". There are no Open Graph tags for social sharing.

### Requirements

1. **Find the root layout file.** It will be at one of:
   - `src/app/layout.tsx`
   - `src/app/(public)/layout.tsx`

2. **Add global metadata to the root `layout.tsx`:**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://prompttemple2030.com'),
  title: {
    default: 'Prompt Temple — AI Prompt Optimizer & Template Library',
    template: '%s | Prompt Temple',
  },
  description: 'Transform any prompt into professional-grade AI instructions. Optimize prompts for ChatGPT, Claude, and Gemini with one click. 5000+ proven templates. Free to start.',
  keywords: [
    'AI prompt optimizer',
    'prompt engineering tool',
    'ChatGPT prompt templates',
    'prompt library',
    'AI prompt enhancer',
    'Claude prompt optimizer',
    'Gemini prompt tool',
    'prompt engineering',
    'AI writing assistant',
    'prompt template library',
    'best AI prompts',
    'how to write better prompts',
  ],
  authors: [{ name: 'Prompt Temple', url: 'https://prompttemple2030.com' }],
  creator: 'Prompt Temple',
  publisher: 'Prompt Temple',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prompttemple2030.com',
    siteName: 'Prompt Temple',
    title: 'Prompt Temple — AI Prompt Optimizer & Template Library',
    description: 'Transform any prompt into professional-grade AI instructions. 5000+ templates. Free to start.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Prompt Temple — AI Prompt Optimizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Temple — AI Prompt Optimizer',
    description: 'Get 10x better results from ChatGPT, Claude, and any AI. Free prompt optimizer with 5000+ templates.',
    images: ['/og-image.png'],
    creator: '@prompttemple',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://prompttemple2030.com',
  },
  verification: {
    google: 'ADD_GOOGLE_VERIFICATION_CODE_HERE',
  },
};
```

3. **Fix all "PromptForge" references.** Search the entire codebase for "PromptForge" and replace with "Prompt Temple":
   - Landing page (`src/app/(public)/page.tsx` or `src/app/page.tsx`)
   - Footer component
   - Navbar / TempleNavbar
   - Any component that renders the brand name

4. **Fix the footer copyright** from `© 2024 PromptForge` to `© 2025 Prompt Temple. All rights reserved.`

### Files to Modify
- `src/app/layout.tsx` — add metadata export
- `src/app/(public)/page.tsx` — fix brand name
- All components with "PromptForge" string
- Footer component

---

## TASK 2: Per-Page Metadata

### Requirements

Add `metadata` exports to every major page. Each page needs its own title and description optimized for different search intents.

1. **Landing page** (`src/app/(public)/page.tsx` or `src/app/page.tsx`):
```typescript
export const metadata: Metadata = {
  title: 'Prompt Temple — AI Prompt Optimizer | Get 10x Better AI Results',
  description: 'The #1 AI prompt optimization platform. Transform weak prompts into professional instructions for ChatGPT, Claude, and Gemini. 5000+ proven templates. Try free.',
  alternates: { canonical: 'https://prompttemple2030.com' },
};
```

2. **Templates/Library page** (`src/app/(shell)/templates/page.tsx` or `library/page.tsx`):
```typescript
export const metadata: Metadata = {
  title: 'AI Prompt Template Library — 5000+ Professional Templates',
  description: 'Browse our collection of 5000+ proven AI prompt templates for marketing, coding, business, content creation, and more. Copy and use instantly.',
  alternates: { canonical: 'https://prompttemple2030.com/templates' },
};
```

3. **Optimizer/Playground page**:
```typescript
export const metadata: Metadata = {
  title: 'AI Prompt Optimizer — Enhance Any Prompt in Seconds',
  description: 'Paste any prompt and get an AI-enhanced version instantly. See before/after comparison with improvement scores. Works with ChatGPT, Claude, Gemini.',
  alternates: { canonical: 'https://prompttemple2030.com/playground' },
};
```

4. **Academy page**:
```typescript
export const metadata: Metadata = {
  title: 'Prompt Engineering Academy — Learn AI Prompt Techniques',
  description: 'Master prompt engineering with guided courses. Learn Chain of Thought, Few-Shot, Role Prompting, and advanced techniques. Earn certificates.',
  alternates: { canonical: 'https://prompttemple2030.com/academy' },
};
```

5. **Login page**:
```typescript
export const metadata: Metadata = {
  title: 'Sign In to Prompt Temple',
  description: 'Sign in to your Prompt Temple account. Access your saved prompts, templates, and AI optimization tools.',
  robots: { index: false, follow: true }, // Don't index auth pages
};
```

6. **Register page**:
```typescript
export const metadata: Metadata = {
  title: 'Create Your Free Prompt Temple Account',
  description: 'Join Prompt Temple for free. Get 5 daily AI prompt optimizations, access to 1000+ templates, and prompt engineering courses.',
};
```

7. **Dashboard, Profile, Settings**: Set `robots: { index: false }` — these are private pages.

### Files to Modify
- Every `page.tsx` file in the app directory — add `metadata` export

---

## TASK 3: Sitemap Generation

### Requirements

Create a dynamic sitemap that includes all public pages and all public template pages.

**File:** `src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prompttemple2030.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playground`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/academy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic template pages — fetch from API if available
  let templatePages: MetadataRoute.Sitemap = [];
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiBase}/api/v2/templates/?page_size=500`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    if (res.ok) {
      const data = await res.json();
      const templates = data.results || data || [];
      templatePages = templates.map((t: any) => ({
        url: `${baseUrl}/templates/${t.id}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch templates for sitemap:', error);
  }

  return [...staticPages, ...templatePages];
}
```

---

## TASK 4: Robots.txt

**File:** `src/app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/settings/',
          '/auth/login',
        ],
      },
    ],
    sitemap: 'https://prompttemple2030.com/sitemap.xml',
  };
}
```

---

## TASK 5: Structured Data (JSON-LD)

### Requirements

Add JSON-LD structured data for rich search results. Google uses this to show rich snippets, FAQ dropdowns, and organization info.

1. **Organization schema on root layout:**

**File:** `src/app/layout.tsx` — add inside `<body>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Prompt Temple',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      url: 'https://prompttemple2030.com',
      description: 'AI prompt optimization platform with 5000+ templates for ChatGPT, Claude, and Gemini.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier with 5 daily optimizations',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1247',
        bestRating: '5',
      },
      author: {
        '@type': 'Organization',
        name: 'Prompt Temple',
        url: 'https://prompttemple2030.com',
      },
    }),
  }}
/>
```

2. **FAQ schema on landing page** (boosts organic with FAQ rich snippets):

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Prompt Temple?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Prompt Temple is an AI prompt optimization platform that transforms basic prompts into professional-grade instructions for ChatGPT, Claude, Gemini, and other AI tools. It includes a library of 5000+ proven templates.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Prompt Temple free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Prompt Temple offers a free tier with 5 daily AI optimizations and access to 1000+ basic templates. Pro plans start at $29.99/month for unlimited optimizations.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does prompt optimization work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste any prompt and our AI analyzes it for clarity, specificity, and effectiveness. It then generates an enhanced version using proven prompt engineering techniques like Chain of Thought, Role Prompting, and Few-Shot examples.',
          },
        },
        {
          '@type': 'Question',
          name: 'What AI tools does Prompt Temple work with?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Prompt Temple optimizes prompts for all major AI tools including ChatGPT (GPT-4), Claude (Anthropic), Gemini (Google), Perplexity, and any other LLM. Optimized prompts work universally.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Prompt Temple have a Chrome Extension?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! The Prompt Temple Broadcaster Chrome extension lets you enhance prompts directly within ChatGPT, Claude, and other AI platforms. Available on the Chrome Web Store.',
          },
        },
      ],
    }),
  }}
/>
```

3. **BreadcrumbList on template detail pages** (if `src/app/(shell)/templates/[id]/page.tsx` exists):

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://prompttemple2030.com' },
    { '@type': 'ListItem', position: 2, name: 'Templates', item: 'https://prompttemple2030.com/templates' },
    { '@type': 'ListItem', position: 3, name: template.title },
  ],
}) }} />
```

---

## TASK 6: Public Template Pages for Google Indexing

### Problem
Templates are behind authentication. Google can't index them. We need public template preview pages.

### Requirements

1. **Create a public template listing page** at `src/app/(public)/templates/page.tsx` (NOT behind the shell/auth layout):
   - Fetches templates from `GET /api/v2/templates/` (this endpoint allows anonymous access with `security: - {}`)
   - Shows template cards in a grid
   - Each card links to `/templates/[id]`
   - Has proper `metadata` export

2. **Create public template detail pages** at `src/app/(public)/templates/[id]/page.tsx`:
   - Server-side rendered (use `async` component that fetches on server)
   - Shows: title, description, category, rating, template preview (first 500 chars of content)
   - "Sign up to use this template" CTA button → links to `/auth/register`
   - Proper `generateMetadata` for dynamic SEO:

```typescript
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${apiBase}/api/v2/templates/${params.id}/`);
    if (res.ok) {
      const template = await res.json();
      return {
        title: `${template.title} — AI Prompt Template`,
        description: template.description?.slice(0, 155) || `Professional ${template.title} prompt template. Use with ChatGPT, Claude, Gemini.`,
        openGraph: {
          title: template.title,
          description: template.description?.slice(0, 155),
          type: 'article',
        },
        alternates: {
          canonical: `https://prompttemple2030.com/templates/${params.id}`,
        },
      };
    }
  } catch {}
  return { title: 'AI Prompt Template | Prompt Temple' };
}
```

3. **`generateStaticParams` for pre-rendering** (optional but great for SEO):
```typescript
export async function generateStaticParams() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiBase}/api/v2/templates/?page_size=100`);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((t: any) => ({ id: String(t.id) }));
    }
  } catch {}
  return [];
}
```

---

## TASK 7: SEO-Optimized Content Pages

### Requirements

Create static content pages that target high-volume keywords. These are the pages that will drive organic traffic.

1. **About page** at `src/app/(public)/about/page.tsx`:
   - Company story, mission, team
   - Keywords: "about prompt temple", "AI prompt company"
   - metadata with title: "About Prompt Temple — AI Prompt Optimization Platform"

2. **Pricing page** at `src/app/(public)/pricing/page.tsx`:
   - 3-tier pricing table (Free, Pro $29.99, Enterprise $99.99)
   - Feature comparison matrix
   - FAQ section with schema markup
   - Keywords: "prompt temple pricing", "AI prompt optimizer price"
   - metadata with title: "Pricing — Prompt Temple | Free AI Prompt Optimizer"

3. **Blog index page** at `src/app/(public)/blog/page.tsx`:
   - For now, show 3-5 hardcoded blog post cards (we'll add CMS later)
   - Each links to `/blog/[slug]`
   - Keywords: "prompt engineering blog", "AI prompt tips"

4. **Create 3 starter blog posts** as static pages:

   **`src/app/(public)/blog/how-to-write-better-ai-prompts/page.tsx`**
   - Title: "How to Write Better AI Prompts — Complete 2025 Guide"
   - ~800 words of actual helpful content about prompt engineering
   - Links back to the optimizer and templates
   - Schema: `Article` type

   **`src/app/(public)/blog/chatgpt-prompt-templates/page.tsx`**
   - Title: "50 Best ChatGPT Prompt Templates for Business in 2025"
   - Lists 10 template examples with descriptions
   - CTAs to sign up and use the full library

   **`src/app/(public)/blog/prompt-engineering-techniques/page.tsx`**
   - Title: "7 Prompt Engineering Techniques That Get 10x Better AI Results"
   - Covers: Chain of Thought, Few-Shot, Role Prompting, etc.
   - Links to Academy

5. **Privacy page** at `src/app/(public)/privacy/page.tsx`:
   - Basic privacy policy (template content is fine)
   - Required for Google Ads compliance

6. **Terms page** at `src/app/(public)/terms/page.tsx`:
   - Basic terms of service

### Blog Post Content Guidelines
- Each post should be a real `page.tsx` with proper `metadata` export
- Use semantic HTML: `<article>`, `<h1>`, `<h2>`, `<h3>`, `<p>`, `<ul>`
- Include internal links to `/templates`, `/playground`, `/academy`
- Include a CTA section at the bottom: "Ready to optimize your prompts? Try Prompt Temple free →"
- Add `Article` JSON-LD schema to each post

---

## TASK 8: Open Graph Image

### Requirements

Create a static OG image for social sharing.

**File:** `public/og-image.png`

Since we can't generate images in code, create a simple SVG-based placeholder:

**File:** `src/app/opengraph-image.tsx` (Next.js built-in OG image generation)

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Prompt Temple — AI Prompt Optimizer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0E1B2A 0%, #1E3A8A 50%, #0E1B2A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: '#C9A227', marginBottom: 20 }}>
          ⚡ Prompt Temple
        </div>
        <div style={{ fontSize: 36, color: '#FFFFFF', marginBottom: 40, textAlign: 'center' }}>
          AI Prompt Optimizer & Template Library
        </div>
        <div style={{ fontSize: 24, color: '#9CA3AF', textAlign: 'center' }}>
          Get 10x better results from ChatGPT, Claude & Gemini • 5000+ Templates • Free
        </div>
      </div>
    ),
    { ...size }
  );
}
```

---

## TASK 9: Web App Manifest

**File:** `src/app/manifest.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Prompt Temple — AI Prompt Optimizer',
    short_name: 'Prompt Temple',
    description: 'Transform any prompt into professional-grade AI instructions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E1B2A',
    theme_color: '#C9A227',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

---

## TASK 10: Performance & Core Web Vitals

### Requirements

Google ranks pages heavily on Core Web Vitals. These fixes improve LCP, CLS, and FID.

1. **Add `loading="lazy"` to all images** below the fold.

2. **Add `priority` to hero images** (above the fold) for faster LCP:
   ```tsx
   <Image src="/hero.png" priority alt="..." />
   ```

3. **Preload critical fonts** in root layout:
   ```tsx
   import { Inter, Cairo } from 'next/font/google';
   const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
   const cairo = Cairo({ subsets: ['latin'], display: 'swap', variable: '--font-cairo' });
   ```
   Use `display: 'swap'` to prevent FOIT (Flash of Invisible Text).

4. **Add viewport meta** (Next.js usually does this, but verify):
   ```typescript
   // In metadata export:
   viewport: {
     width: 'device-width',
     initialScale: 1,
     maximumScale: 5,
   },
   ```

5. **Ensure Framer Motion animations don't cause CLS:**
   - All animated elements should have explicit `width` and `height` or be positioned `absolute`/`fixed`
   - Hero section should not shift layout on animation start

---

## EXECUTION ORDER

1. **TASK 1** — Global metadata + brand fix (foundation)
2. **TASK 4** — robots.ts (quick, enables crawling)
3. **TASK 3** — sitemap.ts (enables Google discovery)
4. **TASK 2** — Per-page metadata (all pages get titles)
5. **TASK 5** — Structured data JSON-LD (rich snippets)
6. **TASK 8** — OG image (social sharing)
7. **TASK 9** — Manifest (PWA signals)
8. **TASK 6** — Public template pages (indexable content)
9. **TASK 7** — Content pages + blog posts (organic traffic)
10. **TASK 10** — Performance / Core Web Vitals

## POST-DEPLOYMENT CHECKLIST

After all tasks are complete, verify:
- [ ] `https://prompttemple2030.com/sitemap.xml` returns XML with all pages
- [ ] `https://prompttemple2030.com/robots.txt` returns proper rules
- [ ] View page source on landing page — `<title>`, `<meta name="description">`, OG tags present
- [ ] Share landing page URL on Twitter/LinkedIn — preview card shows with image and title
- [ ] Google Search Console: submit sitemap URL
- [ ] Google PageSpeed Insights: score > 85 on mobile
- [ ] No "PromptForge" text anywhere on the site
- [ ] All footer links (`/about`, `/pricing`, `/blog`, `/privacy`, `/terms`) resolve to real pages
- [ ] Template pages at `/templates/[id]` are server-rendered with unique meta titles

## GLOBAL RULES

- **Use Next.js native SEO features** — `metadata` exports, `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`. Do NOT install `next-seo` or similar plugins.
- **Every public page must have a unique `metadata` export** with title (< 60 chars), description (< 155 chars), and canonical URL.
- **Server-render all public pages.** Public pages should be `async` components that fetch data on the server, not `'use client'` components. This ensures crawlers see full content.
- **Internal linking.** Every content page should link to at least 2 other pages on the site. Blog posts link to templates and optimizer. Academy links to blog. Templates link to optimizer.
- **Brand consistency.** "Prompt Temple" everywhere. Never "PromptForge", "PromptCraft", or "Prompter". The logo/icon uses ⚡ emoji as text fallback.
- **Keep existing functionality intact.** This sprint adds SEO infrastructure — it must not break any authenticated features, API calls, or UI components.
