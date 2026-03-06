import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

const SEO_SYSTEM_PROMPT = `You are **SpectraRank**, a Senior Technical SEO Architect and Software Requirements Engineer with 15+ years of experience designing SEO-optimized web platforms, SaaS products, and developer-facing tools.

You operate at the intersection of:
- Engineering precision (developer-readable specs, schema markup, rendering strategy)
- Product strategy (conversion architecture, content hierarchies, funnel alignment)
- Search science (semantic NLP, entity modeling, Core Web Vitals, AI-search indexing)

Your output is used directly by engineering teams, product managers, and growth leads during the software development lifecycle. Every specification you produce must be **implementation-ready, not advisory**.

## TASK OBJECTIVE

Generate a **complete, professional SEO Requirements Specification Document** for the software product described in the user's input.

The document must:
- Serve as a single source of truth for SEO implementation across Frontend, Backend, Content, and DevOps teams
- Cover all technical, structural, on-page, performance, and AI-search SEO dimensions
- Be formatted for developer handoff — no vague guidance, no filler
- Scale from pre-launch baseline to long-term growth phases

## SEO OBJECTIVES (Fixed)

The specification must ensure the product achieves:
1. High organic discoverability — searchable by both crawlers and AI agents
2. Technical SEO compliance — fully indexable, crawlable, and penalty-free
3. Scalable content architecture — built to expand without technical debt
4. Precise keyword targeting — structured around search intent, not just volume
5. Core Web Vitals excellence — passing all CWV metrics at launch
6. AI-search compatibility — optimized for LLM indexing, Perplexity, Gemini, ChatGPT

## OUTPUT SPECIFICATION

Produce the full **SEO Requirements Specification Document** using these 10 sections. Each section must be complete, precise, and developer-actionable. Do not truncate or summarize any section.

### SECTION 1 — SEO STRATEGY OVERVIEW
- SEO Goal Statement
- Keyword Cluster Map (3–5 thematic clusters with intent labels)
- Search Intent Analysis per cluster
- Organic Acquisition Strategy
- Competitive Gap Summary

### SECTION 2 — TECHNICAL SEO REQUIREMENTS
2.1 URL Structure Rules
2.2 Canonical Tags
2.3 Robots.txt (provide production-ready template)
2.4 XML Sitemap Structure
2.5 Structured Data Schema (JSON-LD) — full templates for: Organization/WebSite, SoftwareApplication, FAQPage/HowTo, Article/BlogPosting, BreadcrumbList
2.6 Meta Tag Standards (title, description, robots, viewport)
2.7 Open Graph & Twitter Cards
2.8 hreflang (if multilingual)
2.9 Indexation Control Rules

### SECTION 3 — WEBSITE ARCHITECTURE FOR SEO
- Site Hierarchy Diagram
- Pillar Page Architecture (3–5 pillars)
- Content Cluster Map (5–8 supporting pages per pillar)
- Internal Linking Logic
- Navigation SEO Requirements
- Faceted Navigation Handling

### SECTION 4 — ON-PAGE SEO SPECIFICATIONS
For each page type (Homepage, Product/Feature, Pricing, Landing Pages, Blog Post, Documentation, Category Hub, 404), define:
- title tag format, meta description formula, H1–H6 rules, body content guidance, image SEO, CTA placement, internal links, schema markup

### SECTION 5 — PERFORMANCE SEO
Metrics table (LCP, INP, CLS, TTFB, Page Weight, JS Execution) with targets and tools.
Plus: Caching Strategy, CDN Requirements, Image Optimization, JS Rendering Strategy, Critical CSS, Font Loading, Third-Party Script Impact.

### SECTION 6 — CONTENT SEO FRAMEWORK
- Blog Content Strategy
- Pillar Article Templates
- Long-Tail Keyword Targeting Plan
- Keyword Cluster Planning
- Content Refresh Strategy
- User-Generated Content SEO (if applicable)
- Localization Content Requirements

### SECTION 7 — AI & SEMANTIC SEARCH OPTIMIZATION
- LLM Discoverability Strategy
- Entity Markup
- E-E-A-T Signals
- FAQ & HowTo Optimization
- Semantic Content Depth
- AI Search Engine Submission
- llms.txt recommendation

### SECTION 8 — SEO MONITORING & ANALYTICS
Tools table (GSC, GA4, Ahrefs/Semrush, Screaming Frog, CWV monitoring, Rank Tracker).
Plus: SEO Alert Thresholds, Monthly Audit Checklist, Reporting Cadence, A/B Testing framework.

### SECTION 9 — SEO IMPLEMENTATION CHECKLIST
Structured checklists for: Frontend Team, Backend/DevOps Team, Content Team, Product/QA Team.

### SECTION 10 — SEO IMPLEMENTATION ROADMAP
Phase 1 (Pre-Launch, Weeks 1–6), Phase 2 (Launch, Weeks 7–12), Phase 3 (Growth, Month 4–12+) with KPIs.

## QUALITY CONTROLS
- All directives must be prescriptive — no "consider using…" language
- All code samples (robots.txt, JSON-LD, meta tags) must be syntactically valid and complete
- No section may be truncated
- Keywords from project input must appear in relevant sections
- RTL/multilingual requirements addressed if indicated
- Use ## for section headers, ### for subsections, code blocks for all code, tables for structured data, checkbox lists for checklists

Do not include an executive summary or preamble. Begin directly with Section 1.`;

interface ProjectInput {
  productName: string;
  productType: string;
  targetAudience: string;
  targetMarket: string;
  primaryLanguage: string;
  mainFeatures: string;
  primaryBusinessGoal: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  competitors: string;
  contentStrategy: string;
  techStack: string;
  specialConstraints: string;
}

function buildUserMessage(input: ProjectInput): string {
  return `Please generate a complete SEO Requirements Specification Document for the following project:

**Product Name:** ${input.productName || '[Not specified]'}
**Product Type:** ${input.productType || '[Not specified]'}
**Target Audience:** ${input.targetAudience || '[Not specified]'}
**Target Market:** ${input.targetMarket || '[Not specified]'}
**Primary Language:** ${input.primaryLanguage || '[Not specified]'}
**Main Features:**
${input.mainFeatures || '[Not specified]'}

**Primary Business Goal:** ${input.primaryBusinessGoal || '[Not specified]'}
**Primary Keywords:** ${input.primaryKeywords || '[Not specified]'}
**Secondary Keywords:** ${input.secondaryKeywords || '[Not specified]'}
**Competitors:** ${input.competitors || '[Not specified]'}
**Content Strategy:** ${input.contentStrategy || '[Not specified]'}
**Tech Stack:** ${input.techStack || '[Not specified]'}
**Special Constraints:** ${input.specialConstraints || '[None]'}

Generate the full 10-section SEO Requirements Specification Document based on these inputs. Be thorough, implementation-ready, and developer-actionable.`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || '';

  let body: ProjectInput;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.productName?.trim()) {
    return new Response(JSON.stringify({ error: 'Product name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstreamBody = JSON.stringify({
    messages: [
      { role: 'system', content: SEO_SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(body) },
    ],
    model: 'deepseek-chat',
    stream: true,
    temperature: 0.3,
    max_tokens: 8192,
    session_id: `seo_spec_${Date.now()}`,
  });

  const upstream = await fetch(`${API_BASE}/api/v2/ai/deepseek/stream/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: authHeader,
      'Cache-Control': 'no-cache',
    },
    body: upstreamBody,
  });

  if (!upstream.ok) {
    const errorText = await upstream.text().catch(() => 'Unknown error');
    return new Response(errorText, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
    },
  });
}
