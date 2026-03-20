# 🎨 n8n Course — Frontend Developer Build Guide
### Complete UI/UX Specification for Building the n8n Professional Course Platform

> **For:** Frontend developers building the course website
> **Source:** `n8n_professional_course.md` (course content file)
> **Stack recommendation:** Next.js 14 + Tailwind CSS + Framer Motion

---

## Table of Contents

1. [Project Overview & Goals](#1-project-overview--goals)
2. [Design System & Visual Identity](#2-design-system--visual-identity)
3. [Site Architecture & Routing](#3-site-architecture--routing)
4. [Page-by-Page Specifications](#4-page-by-page-specifications)
5. [Core Components Library](#5-core-components-library)
6. [Content Rendering from Markdown](#6-content-rendering-from-markdown)
7. [Interactive Features](#7-interactive-features)
8. [Animations & Micro-interactions](#8-animations--micro-interactions)
9. [Responsive Design Breakpoints](#9-responsive-design-breakpoints)
10. [Performance Requirements](#10-performance-requirements)
11. [Recommended Tech Stack](#11-recommended-tech-stack)
12. [File & Folder Structure](#12-file--folder-structure)
13. [Component Code Starters](#13-component-code-starters)

---

## 1. Project Overview & Goals

### What You Are Building
A modern, professional online course website that teaches n8n workflow automation. The site presents the 10 modules from the course MD file, with interactive code examples, workflow diagrams, and progress tracking.

### Core User Experience Goals
- A student should be able to go from zero to understanding any workflow module in under 20 minutes
- Code examples must be copy-pasteable and syntax-highlighted
- Diagrams should be visual and easy to understand (not just text art)
- The site should feel like a premium tech course (think: Egghead.io × Linear.app aesthetics)
- Mobile-friendly — many users will reference it on a second screen while working in n8n

### Tone & Feel
- **Dark mode first** (developers prefer it)
- Clean, modern, minimal — not busy or cluttered
- Professional but approachable
- Tech-forward: monospace fonts for code, generous whitespace

---

## 2. Design System & Visual Identity

### Color Palette

```css
/* Primary Brand — n8n's orange-based identity */
--brand-primary:       #FF6D5A;   /* n8n orange-red */
--brand-secondary:     #EA4B2A;   /* deeper orange */
--brand-accent:        #FFB347;   /* warm gold accent */

/* Dark Theme (Default) */
--bg-base:             #0F0F0F;   /* near-black background */
--bg-surface:          #1A1A1A;   /* card/panel background */
--bg-elevated:         #242424;   /* elevated elements */
--bg-hover:            #2A2A2A;   /* hover state */
--border-subtle:       #2E2E2E;   /* subtle borders */
--border-strong:       #444444;   /* stronger borders */

/* Text */
--text-primary:        #F0F0F0;   /* main text */
--text-secondary:      #A0A0A0;   /* secondary/muted */
--text-tertiary:       #666666;   /* very muted */
--text-on-brand:       #FFFFFF;   /* text on brand color */

/* Semantic Colors */
--success:             #22C55E;   /* green */
--warning:             #F59E0B;   /* amber */
--error:               #EF4444;   /* red */
--info:                #3B82F6;   /* blue */

/* Code Block */
--code-bg:             #161B22;   /* GitHub dark */
--code-border:         #30363D;
--code-text:           #E6EDF3;

/* Light Theme (Optional Toggle) */
--bg-base-light:       #FAFAFA;
--bg-surface-light:    #FFFFFF;
--text-primary-light:  #111111;
```

### Typography

```css
/* Font Stack */
--font-heading:  'Inter', -apple-system, sans-serif;    /* UI headings */
--font-body:     'Inter', -apple-system, sans-serif;    /* Body text */
--font-mono:     'JetBrains Mono', 'Fira Code', monospace;  /* Code */

/* Type Scale */
--text-xs:    0.75rem;    /* 12px — labels, badges */
--text-sm:    0.875rem;   /* 14px — secondary text */
--text-base:  1rem;       /* 16px — body */
--text-lg:    1.125rem;   /* 18px — lead text */
--text-xl:    1.25rem;    /* 20px — subheadings */
--text-2xl:   1.5rem;     /* 24px — section titles */
--text-3xl:   1.875rem;   /* 30px — page titles */
--text-4xl:   2.25rem;    /* 36px — hero */
--text-5xl:   3rem;       /* 48px — hero large */

/* Line Heights */
--leading-tight:   1.25;
--leading-normal:  1.6;   /* for body text */
--leading-relaxed: 1.8;   /* for long-form content */
```

### Spacing System (8px grid)

```css
--space-1:  0.25rem;  /* 4px  */
--space-2:  0.5rem;   /* 8px  */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-full: 9999px;  /* pills/badges */
```

---

## 3. Site Architecture & Routing

```
/                           → Landing / Hero page
/course                     → Course overview (all 10 modules listed)
/course/[module-slug]       → Individual module page
/course/[module-slug]/quiz  → Optional: quick knowledge check
/about                      → About the course + instructor
/resources                  → Downloads, templates, links
```

### Module Slugs (from course content)

| Module # | Title | Slug |
|---|---|---|
| 1 | AI Agent Chatbot with Long-Term Memory | `ai-agent-long-term-memory` |
| 2 | Social Media Publishing Factory | `social-media-factory` |
| 3 | WhatsApp AI Chatbot | `whatsapp-ai-chatbot` |
| 4 | CV / Resume AI Screening | `cv-resume-screening` |
| 5 | Financial Tracker | `financial-tracker` |
| 6 | HR Automation Pipeline | `hr-automation-pipeline` |
| 7 | Email Management with AI | `email-management-ai` |
| 8 | LinkedIn Posts Automation | `linkedin-automation` |
| 9 | YouTube AI Summarization | `youtube-summarization` |
| 10 | Google Maps Lead Generation | `google-maps-leads` |

---

## 4. Page-by-Page Specifications

### 4.1 Landing Page (`/`)

**Layout:**
```
┌─────────────────────────────────────────┐
│  [NAV] Logo | Course | Resources | CTA  │
├─────────────────────────────────────────┤
│                                         │
│           HERO SECTION                  │
│   H1: "Automate Everything             │
│        with n8n"                        │
│   Subline: "10 professional workflows.  │
│   AI agents. Real-world automation."    │
│   [Start Learning →]  [View Workflows]  │
│                                         │
│   [Animated workflow diagram preview]   │
│                                         │
├─────────────────────────────────────────┤
│  STATS BAR:  2,053 Workflows | 10 Modules | AI-Powered │
├─────────────────────────────────────────┤
│         WHAT YOU'LL LEARN               │
│  [Card] [Card] [Card] [Card]            │
│  AI Agents  Bots  Scrapers  Reporting   │
├─────────────────────────────────────────┤
│         COURSE MODULES PREVIEW          │
│  Horizontal scroll of module cards     │
├─────────────────────────────────────────┤
│         TECH STACK LOGOS                │
│  n8n | OpenAI | Telegram | Notion | ..  │
├─────────────────────────────────────────┤
│              FOOTER                     │
└─────────────────────────────────────────┘
```

**Hero Section Requirements:**
- Animated background: subtle particle grid or flowing gradient
- H1 should animate in with a typewriter or fade-up effect
- CTA button: `bg-brand-primary`, hover with glow effect
- Show a live workflow canvas preview (SVG or Lottie animation)

---

### 4.2 Course Overview Page (`/course`)

**Layout:**
```
┌─────────────────────────────────────────┐
│  NAV                                    │
├─────────────────────────────────────────┤
│  BREADCRUMB: Home > Course              │
│                                         │
│  H1: "n8n Professional Course"          │
│  Subtitle + estimated time (4-6 hours)  │
├─────────────────────────────────────────┤
│  PROGRESS BAR (if user has cookies)     │
│  "3 of 10 modules completed ████░░░░"   │
├─────────────────────────────────────────┤
│                                         │
│  MODULE GRID (2-3 columns)              │
│  ┌──────────┐ ┌──────────┐            │
│  │ Module 1 │ │ Module 2 │            │
│  │  🤖 AI   │ │  📱 Social│            │
│  │  Agent   │ │  Media   │            │
│  │ 15 min   │ │ 12 min   │            │
│  │ [Start]  │ │ [Start]  │            │
│  └──────────┘ └──────────┘            │
│                                         │
├─────────────────────────────────────────┤
│  ALSO INCLUDES:                         │
│  Automating Without n8n | Python RPA    │
└─────────────────────────────────────────┘
```

---

### 4.3 Module Page (`/course/[slug]`)

**Layout (most important page):**
```
┌─────────────────────────────────────────┐
│  NAV + PROGRESS INDICATOR               │
├─────────────────────────────────────────┤
│                                         │
│  ← Previous  [Module 3 of 10]  Next →   │
│                                         │
├──────────────────────┬──────────────────┤
│                      │                  │
│  MAIN CONTENT        │  SIDEBAR         │
│  (65% width)         │  (35% width)     │
│                      │                  │
│  Module Title        │  On This Page    │
│  ──────────          │  • What It Does  │
│                      │  • Architecture  │
│  What It Does        │  • Node Breakdown│
│  [paragraph]         │  • Setup Steps   │
│                      │  • Use Cases     │
│  Architecture Diagram│                  │
│  [Visual Flowchart]  │  ─────────────── │
│                      │                  │
│  Node Breakdown      │  Related Modules │
│  [Expandable cards]  │  [Module 2]      │
│                      │  [Module 7]      │
│  Code Examples       │                  │
│  [Syntax Highlighted]│  ─────────────── │
│                      │                  │
│  [Copy] [Run]        │  Resources       │
│                      │  ↓ JSON Template │
│  Pro Tips            │  ↓ Setup Guide   │
│  [callout box]       │                  │
│                      │                  │
│  ← Prev  [Mark Done] Next →             │
│                      │                  │
└──────────────────────┴──────────────────┘
```

**Sticky sidebar:** The sidebar should stick to the viewport as the user scrolls through the content.

**"Mark as Done" Button:** Saves completion status to localStorage. Updates progress bar across the site.

---

## 5. Core Components Library

### 5.1 `<ModuleCard />`

```
Visual spec:
┌──────────────────────────────────┐
│  [Icon/Emoji] bg-gradient       │
│  ──────────────────────         │
│  Module 1                       │  ← small label, text-secondary
│  AI Agent Chatbot               │  ← title, text-lg font-semibold
│  with Long-Term Memory          │
│                                 │
│  Short description (2 lines)    │  ← text-sm text-secondary
│                                 │
│  [🤖 AI] [🔗 Telegram]         │  ← tech tags/pills
│                                 │
│  ⏱ 15 min   [→ Start Module]   │
└──────────────────────────────────┘

States:
- Default: border border-border-subtle
- Hover: border-brand-primary, slight scale(1.02)
- Completed: green checkmark overlay, opacity reduced
- Active/Current: brand-primary left border (4px)
```

**Props:**
```typescript
interface ModuleCardProps {
  number: number;
  title: string;
  description: string;
  emoji: string;
  tags: string[];          // ['AI', 'Telegram', 'Memory']
  duration: string;        // '15 min'
  slug: string;
  isCompleted: boolean;
  isCurrent: boolean;
}
```

---

### 5.2 `<WorkflowDiagram />`

Converts the ASCII architecture diagrams from the MD file into proper visual flowcharts.

**Recommended library:** `ReactFlow` or custom SVG

```
Visual spec for a node in the diagram:

┌─────────────────┐
│  [icon]         │  ← node icon (trigger = ⚡, AI = 🤖, action = ▶)
│  Node Name      │  ← bold
│  node type      │  ← smaller, text-secondary
└─────────────────┘
        │
        ▼ (animated arrow)
┌─────────────────┐
│  Next Node      │
└─────────────────┘

Color coding:
- Trigger nodes:   border-left: 4px solid #FF6D5A (brand)
- AI nodes:        border-left: 4px solid #8B5CF6 (purple)
- Action nodes:    border-left: 4px solid #3B82F6 (blue)
- Transform nodes: border-left: 4px solid #22C55E (green)
- Logic nodes:     border-left: 4px solid #F59E0B (amber)
```

**Data structure for each module's diagram:**
```typescript
interface WorkflowNode {
  id: string;
  label: string;
  type: 'trigger' | 'ai' | 'action' | 'transform' | 'logic';
  subLabel?: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}
```

---

### 5.3 `<CodeBlock />`

Syntax-highlighted code block with copy functionality.

```
Visual spec:
┌───────────────────────────────────────────────────┐
│  python                              [Copy] [✓]   │  ← header bar
├───────────────────────────────────────────────────┤
│                                                   │
│   1  import openai                                │
│   2  from datetime import datetime                │
│   3                                               │
│   4  class MemoryAgent:                           │
│   5      def __init__(self):                      │
│   6          self.client = openai.OpenAI()        │
│                                                   │
└───────────────────────────────────────────────────┘

Features:
- Language badge in header (python / javascript / bash / json)
- Copy button → shows ✓ for 2 seconds after copy
- Line numbers in gutter
- Horizontal scroll on overflow (no word wrap for code)
- Syntax highlighting theme: "GitHub Dark" or "One Dark Pro"
```

**Recommended library:** `Shiki` (fast, accurate) or `Prism.js`

```tsx
// Component signature
interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;    // optional: "agent.py"
  highlight?: number[]; // lines to highlight: [4, 5, 6]
}
```

---

### 5.4 `<NodeCard />` (expandable)

For the "Node-by-Node Breakdown" section in each module.

```
Collapsed state:
┌─────────────────────────────────────────────┐
│  ▶  AI Tools Agent                    [+]  │
└─────────────────────────────────────────────┘

Expanded state:
┌─────────────────────────────────────────────┐
│  ▼  AI Tools Agent                    [-]  │
├─────────────────────────────────────────────┤
│                                             │
│  The brain of the workflow. Receives the    │
│  message, decides which tools to call, and  │
│  generates the final response.              │
│                                             │
│  Key config:                                │
│  • Model: gpt-4o-mini                       │
│  • Tools: [Memory] [GoogleDocs]             │
│  • System prompt: editable                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 5.5 `<ProTip />` (callout)

```
Visual:
┌─────────────────────────────────────────────┐
│  💡  Pro Tip                               │  ← orange/brand left border
│                                             │
│  Always test your workflow with a Manual    │
│  Trigger before switching to Schedule or    │
│  Webhook triggers in production.            │
│                                             │
└─────────────────────────────────────────────┘

Variants:
- 💡 Pro Tip      → brand color border
- ⚠️  Warning     → amber border
- ✅ Best Practice → green border
- 📌 Note         → blue border
```

---

### 5.6 `<ProgressBar />`

```
Visual:
Module Progress: 3 of 10 completed

  [████████░░░░░░░░░░░░░░░░░░░░]  30%

  ✅ Module 1  ✅ Module 2  ✅ Module 3
  ○ Module 4   ○ Module 5   ○ Module 6 ...
```

Store progress in `localStorage`:
```typescript
const STORAGE_KEY = 'n8n-course-progress';

function markComplete(moduleSlug: string): void {
  const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  progress[moduleSlug] = { completedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProgress(): Record<string, { completedAt: string }> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}
```

---

### 5.7 `<TechBadge />`

Small pills showing which technologies a module uses.

```
Visual:
[🤖 OpenAI]  [📱 Telegram]  [🗄️ Google Docs]  [⚡ LangChain]

Style:
- background: bg-elevated
- border: 1px solid border-subtle
- border-radius: radius-full
- font: text-xs font-mono
- padding: 2px 8px
- hover: border-brand-primary
```

Technology → color mapping:
```typescript
const techColors: Record<string, string> = {
  'OpenAI':     '#10A37F',  // OpenAI green
  'Telegram':   '#2CA5E0',  // Telegram blue
  'WhatsApp':   '#25D366',  // WhatsApp green
  'Notion':     '#E8E8E8',  // Notion white
  'LinkedIn':   '#0A66C2',  // LinkedIn blue
  'YouTube':    '#FF0000',  // YouTube red
  'Google':     '#4285F4',  // Google blue
  'Gemini':     '#8B5CF6',  // Purple for Gemini
  'LangChain':  '#1C3C3C',  // LangChain dark
  'Qdrant':     '#DC143C',  // Qdrant red
};
```

---

## 6. Content Rendering from Markdown

### Parsing the Course MD File
The `n8n_professional_course.md` file is the single source of truth for course content. Parse it at build time.

**Recommended:** `next-mdx-remote` or `unified` + `remark` + `rehype`

```typescript
// lib/course.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

export async function parseModule(markdownContent: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)               // tables, strikethrough
    .use(rehypeShiki, {
      themes: { dark: 'github-dark', light: 'github-light' }
    })
    .use(rehypeStringify)
    .process(markdownContent);

  return result.toString();
}
```

### Custom Markdown Components
Override default HTML elements with custom styled components:

```tsx
// components/MDXComponents.tsx
export const mdxComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-primary mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-primary mt-12 mb-4 border-b border-border-subtle pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-primary mt-8 mb-3">{children}</h3>
  ),
  code: ({ children, className }) => {
    const language = className?.replace('language-', '') || 'text';
    return <CodeBlock code={String(children)} language={language} />;
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-primary pl-4 my-4 text-secondary italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left p-3 bg-elevated border border-border-subtle font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-3 border border-border-subtle">{children}</td>
  ),
};
```

---

## 7. Interactive Features

### 7.1 Module Completion Tracking
- User clicks "Mark as Complete" button on module page
- Module card gets ✅ checkmark
- Progress bar updates
- Confetti animation fires (optional, fun touch)

### 7.2 Code Copy
All `<CodeBlock />` components have a copy button. On click:
1. Copy code to clipboard
2. Show ✓ icon for 2000ms
3. Revert to copy icon

### 7.3 Workflow Diagram Zoom
Clicking the workflow diagram opens a fullscreen modal with pan/zoom enabled.

### 7.4 Sidebar Navigation (Active Section Tracking)
The "On This Page" sidebar highlights the current section as the user scrolls.

```typescript
// Hook for active section tracking
function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
```

### 7.5 Search (Optional but Recommended)
Add `Cmd+K` command palette search across all modules and their content.
**Recommended:** `Fuse.js` for client-side fuzzy search.

---

## 8. Animations & Micro-interactions

### Recommended Library: Framer Motion

```tsx
// Module card hover animation
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="module-card"
>
  {/* content */}
</motion.div>

// Page transition
<motion.main
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* page content */}
</motion.main>

// Progress bar animation
<motion.div
  className="progress-fill"
  initial={{ width: 0 }}
  animate={{ width: `${progressPercent}%` }}
  transition={{ duration: 0.8, ease: "easeOut" }}
/>
```

### Workflow Diagram: Animated Connections
The arrows between nodes in workflow diagrams should animate with a "data flowing" effect:

```css
@keyframes flowDash {
  from { stroke-dashoffset: 100; }
  to   { stroke-dashoffset: 0; }
}

.workflow-edge {
  stroke-dasharray: 8 4;
  animation: flowDash 2s linear infinite;
}
```

### Hero Background (Optional)
A subtle animated grid or dot pattern using CSS:

```css
.hero-bg {
  background-image:
    radial-gradient(circle, rgba(255,109,90,0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: heroShift 20s linear infinite;
}

@keyframes heroShift {
  from { background-position: 0 0; }
  to   { background-position: 64px 64px; }
}
```

---

## 9. Responsive Design Breakpoints

```css
/* Mobile-first approach */
sm:  640px   /* Large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Desktop */
xl:  1280px  /* Wide desktop */
2xl: 1536px  /* Ultra-wide */
```

### Layout Adaptations by Breakpoint

| Element | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---|---|---|---|
| Module grid | 1 column | 2 columns | 3 columns |
| Module page layout | Single column | Single column | 65/35 split |
| Sidebar | Hidden (collapsed) | Floating drawer | Sticky sidebar |
| Code blocks | Horizontal scroll | Horizontal scroll | Full width |
| Workflow diagrams | Scrollable | Full width | Full width |
| Navigation | Hamburger menu | Hamburger | Full nav |

---

## 10. Performance Requirements

### Lighthouse Targets
- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 95
- **SEO:** > 90

### Optimization Strategies

**Images:**
- Use `next/image` for automatic WebP conversion and lazy loading
- Module icons/emojis can be SVG (zero cost)

**Code Splitting:**
- Each module page is a separate route → automatic code splitting
- Heavy components (ReactFlow diagrams) should be dynamically imported

```tsx
const WorkflowDiagram = dynamic(
  () => import('@/components/WorkflowDiagram'),
  { loading: () => <DiagramSkeleton />, ssr: false }
);
```

**Fonts:**
- Load Inter via `next/font` (zero layout shift)
- Load JetBrains Mono only on pages with code

**Shiki (syntax highlighting):**
- Pre-render at build time — never run Shiki client-side

---

## 11. Recommended Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSG + SSR, file-based routing |
| Styling | **Tailwind CSS v3** | Utility-first, design system via CSS vars |
| Animations | **Framer Motion** | Production-grade motion |
| Markdown | **MDX + next-mdx-remote** | Render MD with custom components |
| Syntax Highlighting | **Shiki** | Best accuracy, VS Code themes |
| Diagrams | **ReactFlow** | Interactive node graphs |
| Search | **Fuse.js** | Client-side fuzzy search |
| Icons | **Lucide React** | Consistent, clean icon set |
| Fonts | **next/font** (Inter + JetBrains Mono) | Zero CLS |
| Analytics | **Plausible** or **Umami** | Privacy-friendly |
| Deployment | **Vercel** | Zero-config Next.js deployment |

---

## 12. File & Folder Structure

```
n8n-course/
├── app/
│   ├── layout.tsx              ← Root layout (dark mode class, fonts)
│   ├── page.tsx                ← Landing page
│   ├── course/
│   │   ├── page.tsx            ← Course overview
│   │   └── [slug]/
│   │       └── page.tsx        ← Individual module page
│   └── resources/
│       └── page.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx           ← TechBadge
│   │   ├── Card.tsx
│   │   └── Progress.tsx
│   ├── course/
│   │   ├── ModuleCard.tsx
│   │   ├── WorkflowDiagram.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── NodeCard.tsx
│   │   ├── ProTip.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ModuleSidebar.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── MDXComponents.tsx
│
├── content/
│   └── n8n_professional_course.md   ← THE COURSE CONTENT FILE
│
├── lib/
│   ├── course.ts               ← Parse MD, get modules
│   ├── progress.ts             ← localStorage progress tracking
│   └── search.ts               ← Fuse.js search index
│
├── data/
│   └── modules.ts              ← Module metadata (title, slug, tags, duration)
│
├── styles/
│   └── globals.css             ← CSS variables, base styles
│
├── public/
│   ├── og-image.png            ← Social share image
│   └── workflow-icons/         ← Node type SVG icons
│
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 13. Component Code Starters

### NavBar Component
```tsx
// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-lg text-primary">n8n Course</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/course" className="text-secondary hover:text-primary transition-colors text-sm">
            Course
          </Link>
          <Link href="/resources" className="text-secondary hover:text-primary transition-colors text-sm">
            Resources
          </Link>
          <Link
            href="/course"
            className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors"
          >
            Start Learning →
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-secondary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-bg-surface border-t border-border-subtle px-4 py-4 space-y-3">
          <Link href="/course" className="block text-secondary">Course</Link>
          <Link href="/resources" className="block text-secondary">Resources</Link>
          <Link href="/course" className="block bg-brand-primary text-white px-4 py-2 rounded-md text-center">
            Start Learning
          </Link>
        </div>
      )}
    </nav>
  );
}
```

### Module Card Component
```tsx
// components/course/ModuleCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ModuleCardProps {
  number: number;
  title: string;
  description: string;
  emoji: string;
  tags: string[];
  duration: string;
  slug: string;
  isCompleted?: boolean;
}

export function ModuleCard({
  number, title, description, emoji, tags, duration, slug, isCompleted
}: ModuleCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link href={`/course/${slug}`}>
        <div className={`
          relative rounded-xl border p-6 bg-bg-surface cursor-pointer transition-colors
          ${isCompleted
            ? 'border-success/40 bg-success/5'
            : 'border-border-subtle hover:border-brand-primary/50'
          }
        `}>
          {/* Completion badge */}
          {isCompleted && (
            <div className="absolute top-4 right-4 text-success text-lg">✅</div>
          )}

          {/* Icon & module number */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{emoji}</span>
            <span className="text-xs font-mono text-tertiary">MODULE {String(number).padStart(2, '0')}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-primary mb-2 leading-snug">{title}</h3>

          {/* Description */}
          <p className="text-sm text-secondary mb-4 line-clamp-2">{description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-elevated border border-border-subtle text-tertiary font-mono">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-tertiary">⏱ {duration}</span>
            <span className="text-xs text-brand-primary font-medium">Start →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

### Progress Tracking Hook
```typescript
// lib/progress.ts
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'n8n-course-v1-progress';

export interface CourseProgress {
  [slug: string]: { completedAt: string };
}

export function useProgress() {
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setProgress(JSON.parse(stored));
  }, []);

  const markComplete = (slug: string) => {
    const updated = {
      ...progress,
      [slug]: { completedAt: new Date().toISOString() }
    };
    setProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isCompleted = (slug: string) => Boolean(progress[slug]);

  const completedCount = Object.keys(progress).length;

  return { progress, markComplete, isCompleted, completedCount };
}
```

### Module Data File
```typescript
// data/modules.ts
export const MODULES = [
  {
    number: 1,
    slug: 'ai-agent-long-term-memory',
    title: 'AI Agent Chatbot with Long-Term Memory',
    description: 'Build a persistent AI assistant with short and long-term memory using Telegram and Google Docs.',
    emoji: '🤖',
    tags: ['OpenAI', 'Telegram', 'LangChain', 'Google Docs'],
    duration: '15 min',
  },
  {
    number: 2,
    slug: 'social-media-factory',
    title: 'Social Media Publishing Factory',
    description: 'Automate content publishing to X, Instagram, Facebook, LinkedIn and YouTube Shorts from one AI command.',
    emoji: '📱',
    tags: ['OpenAI', 'LinkedIn', 'Twitter', 'Instagram'],
    duration: '12 min',
  },
  {
    number: 3,
    slug: 'whatsapp-ai-chatbot',
    title: 'WhatsApp AI Chatbot',
    description: 'A production-ready WhatsApp bot that handles text, voice messages, images and PDFs with AI.',
    emoji: '💬',
    tags: ['WhatsApp', 'OpenAI', 'Whisper', 'Vision'],
    duration: '18 min',
  },
  {
    number: 4,
    slug: 'cv-resume-screening',
    title: 'CV / Resume AI Screening',
    description: 'Automated HR screening that rates candidates, sorts CVs into folders, and notifies recruiters.',
    emoji: '📋',
    tags: ['OpenAI', 'Google Drive', 'Gmail', 'AI Agent'],
    duration: '14 min',
  },
  {
    number: 5,
    slug: 'financial-tracker',
    title: 'Financial Tracker with AI Reports',
    description: 'Send invoice photos to Telegram, extract data with Gemini AI, and get weekly Notion + chart reports.',
    emoji: '💰',
    tags: ['Telegram', 'Gemini', 'Notion', 'QuickChart'],
    duration: '16 min',
  },
  {
    number: 6,
    slug: 'hr-automation-pipeline',
    title: 'HR Automation Pipeline',
    description: 'End-to-end hiring from form submission to candidate profiling, scoring, and Google Sheets tracking.',
    emoji: '👥',
    tags: ['OpenAI', 'Google Sheets', 'Google Drive', 'LangChain'],
    duration: '15 min',
  },
  {
    number: 7,
    slug: 'email-management-ai',
    title: 'Email Management with AI',
    description: 'Classify, summarize, auto-reply and vectorize your emails using Qdrant and OpenAI.',
    emoji: '📧',
    tags: ['OpenAI', 'Gmail', 'Qdrant', 'Vector Store'],
    duration: '20 min',
  },
  {
    number: 8,
    slug: 'linkedin-automation',
    title: 'LinkedIn Posts Automation',
    description: 'Schedule and auto-publish LinkedIn posts from a Notion content calendar, reformatted by AI.',
    emoji: '🔗',
    tags: ['LinkedIn', 'Notion', 'OpenAI', 'Schedule'],
    duration: '10 min',
  },
  {
    number: 9,
    slug: 'youtube-summarization',
    title: 'YouTube AI Summarization',
    description: 'Summarize YouTube playlists with Gemini AI, index with RAG, and enable chatbot Q&A over video content.',
    emoji: '▶️',
    tags: ['Gemini', 'YouTube', 'Qdrant', 'RAG'],
    duration: '17 min',
  },
  {
    number: 10,
    slug: 'google-maps-leads',
    title: 'Google Maps Lead Generation',
    description: 'Automated lead scraping from Google Maps — extracts emails, deduplicates, and saves to Google Sheets.',
    emoji: '📍',
    tags: ['Google Maps', 'Google Sheets', 'HTTP Request', 'Regex'],
    duration: '13 min',
  },
] as const;
```

---

## Implementation Priority Order

Build in this sequence for the fastest path to a working product:

1. **Design system** — CSS variables, Tailwind config, fonts (1 day)
2. **Static layout** — Navbar, Footer, page shells (1 day)
3. **Module data + routing** — `data/modules.ts` + `/course/[slug]` route (0.5 day)
4. **Markdown rendering** — Parse `n8n_professional_course.md` and render content (1 day)
5. **Core components** — CodeBlock, ModuleCard, ProTip (1 day)
6. **Progress tracking** — localStorage hook + progress bar (0.5 day)
7. **WorkflowDiagram** — Visual node diagrams (2 days)
8. **Landing page** — Hero, stats, module previews (1 day)
9. **Animations** — Framer Motion throughout (1 day)
10. **Polish + mobile** — Responsive fixes, accessibility, performance (1 day)

**Total estimated build time: ~9-10 working days** for a single frontend developer.

---

*Guide Version: 1.0 | Companion to n8n_professional_course.md | March 2026*
