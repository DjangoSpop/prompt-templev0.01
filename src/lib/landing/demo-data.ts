/** Pre-written demo/fallback data for landing page interactive sections. */

// ── CO-STAR Transformations ───────────────────────────────

export interface COSTARResult {
  input: string;
  sections: {
    key: 'C' | 'O' | 'S' | 'T' | 'A' | 'R';
    text: string;
  }[];
}

export const COSTAR_DEMOS: COSTARResult[] = [
  {
    input: 'plan birthday party',
    sections: [
      { key: 'C', text: 'You are an experienced event planner who has organized over 500 celebrations ranging from intimate gatherings to large-scale parties for diverse clients.' },
      { key: 'O', text: 'Create a detailed birthday party plan that covers venue selection, theme ideas, food and drink options, entertainment, decorations, and a timeline for the day.' },
      { key: 'S', text: 'Friendly and organized. Use clear bullet points and short paragraphs. Include creative suggestions that are easy to execute without professional help.' },
      { key: 'T', text: 'Warm, enthusiastic, and encouraging. Make the reader feel excited about planning rather than overwhelmed.' },
      { key: 'A', text: 'Someone planning a birthday party for the first time, with a moderate budget and 2-3 weeks of preparation time.' },
      { key: 'R', text: 'A step-by-step plan organized by: Budget Overview, Theme Options (3 choices), Venue Checklist, Food Menu, Entertainment Ideas, Decoration List, Day-Of Timeline.' },
    ],
  },
  {
    input: 'write code review',
    sections: [
      { key: 'C', text: 'You are a senior software engineer with 10+ years of experience reviewing pull requests for production web applications across multiple tech stacks.' },
      { key: 'O', text: 'Identify bugs, security issues, performance bottlenecks, and code style violations. Suggest concrete fixes for each issue found.' },
      { key: 'S', text: 'Technical but constructive. Reference specific line numbers and suggest concrete fixes. Use code snippets where helpful.' },
      { key: 'T', text: 'Professional, encouraging, and educational. Focus on helping the developer learn, not just pointing out mistakes.' },
      { key: 'A', text: 'A mid-level developer who will read and act on the review feedback to improve both the code and their skills.' },
      { key: 'R', text: 'Structured review with sections: Summary, Critical Issues, Suggestions for Improvement, Positive Notes, and Final Verdict (Approve / Request Changes).' },
    ],
  },
  {
    input: 'marketing email',
    sections: [
      { key: 'C', text: 'You are an email marketing strategist who has written campaigns with 40%+ open rates for SaaS companies targeting small business owners.' },
      { key: 'O', text: 'Write a high-converting marketing email that introduces a product launch, builds curiosity, and drives clicks to the landing page.' },
      { key: 'S', text: 'Conversational and direct. Short sentences. Use the PAS framework: Problem, Agitate, Solution. Include one powerful subject line.' },
      { key: 'T', text: 'Friendly and urgent without being pushy. Create a sense of excitement about the product launch.' },
      { key: 'A', text: 'Small business owners aged 30-50 who receive 50+ emails daily and will only read something that grabs attention in the first line.' },
      { key: 'R', text: 'Format: Subject Line, Preview Text, Email Body (under 200 words), Call to Action button text, P.S. line.' },
    ],
  },
  {
    input: 'study guide',
    sections: [
      { key: 'C', text: 'You are an expert tutor who specializes in creating study materials that help students retain information using active recall and spaced repetition techniques.' },
      { key: 'O', text: 'Create a comprehensive study guide that covers key concepts, includes practice questions, and provides memory aids for effective learning.' },
      { key: 'S', text: 'Clear and educational. Use simple language, visual aids like tables and diagrams described in text, and mnemonics where possible.' },
      { key: 'T', text: 'Supportive and motivating. Make complex topics feel approachable. Celebrate small wins in understanding.' },
      { key: 'A', text: 'A college student preparing for exams who learns best through examples and practice rather than reading long textbook passages.' },
      { key: 'R', text: 'Sections: Key Concepts Summary, Visual Mind Map (text-based), 10 Practice Questions with Answers, Memory Tricks, Quick Review Checklist.' },
    ],
  },
  {
    input: 'linkedin post',
    sections: [
      { key: 'C', text: 'You are a LinkedIn content strategist who helps professionals build thought leadership. Your posts regularly earn 10,000+ impressions.' },
      { key: 'O', text: 'Write a LinkedIn post that shares a valuable professional insight, sparks engagement through comments, and positions the author as a knowledgeable voice in their field.' },
      { key: 'S', text: 'Short punchy lines. One sentence per line. Start with a hook that stops the scroll. End with a question to drive comments.' },
      { key: 'T', text: 'Authentic and thought-provoking. Avoid corporate jargon. Sound like a real person sharing a genuine lesson learned.' },
      { key: 'A', text: 'Mid-career professionals (5-15 years experience) who scroll LinkedIn during work breaks and engage with content that makes them think differently.' },
      { key: 'R', text: 'Format: Hook line, 3-5 insight lines (one per line), a personal takeaway, a closing question, 3-5 relevant hashtags.' },
    ],
  },
];

// ── Enhancement Demos ─────────────────────────────────────

export interface EnhancementDemo {
  input: string;
  enhanced: string;
}

export const ENHANCEMENT_DEMOS: EnhancementDemo[] = [
  {
    input: 'Write me a good email to my boss about a raise',
    enhanced: 'You are a career communication coach with expertise in professional negotiation. Write a compelling, respectful email requesting a salary review meeting with my manager. The email should: (1) Open with appreciation for recent opportunities and mentorship, (2) Briefly highlight 3 key achievements from the past 6 months with measurable impact, (3) Reference market salary data for my role and experience level, (4) Request a 15-minute meeting to discuss compensation rather than making a direct ask via email. Tone: confident but not demanding, professional yet warm. Keep it under 200 words. End with a flexible call to action suggesting 2-3 time slots.',
  },
  {
    input: 'Help me write a blog post about productivity',
    enhanced: 'You are a productivity expert and content strategist who writes for busy professionals. Create an engaging blog post titled with a curiosity-driven headline about a counterintuitive productivity tip. Structure: Hook opening (personal story or surprising statistic), the common productivity mistake most people make, your alternative approach explained in 3 actionable steps with real-world examples, a brief case study or before/after scenario, and a memorable closing takeaway. Length: 800-1000 words. Use subheadings, short paragraphs (3 sentences max), and include one pull quote. Avoid generic advice like "make a to-do list." Focus on one specific, actionable technique the reader can try today.',
  },
  {
    input: 'Create a social media strategy',
    enhanced: 'You are a social media strategist who has grown 50+ brand accounts from zero to 10K followers. Build a 30-day social media content strategy for a small business just starting their online presence. Include: (1) Platform selection rationale — pick the 2 best platforms based on the business type and explain why, (2) Content pillars — 4 themed categories with 3 post ideas each, (3) Weekly posting schedule with optimal times, (4) Engagement strategy — daily actions that take under 15 minutes, (5) 5 ready-to-use caption templates with fill-in-the-blank sections, (6) Key metrics to track weekly with realistic benchmarks for month one. Format everything as an actionable checklist the business owner can follow without hiring a social media manager.',
  },
  {
    input: 'Make a presentation about our quarterly results',
    enhanced: 'You are a business communication consultant who designs executive presentations for Fortune 500 companies. Create a quarterly results presentation outline that tells a compelling data story. Structure: (1) Title slide with a one-line narrative summary (not just "Q4 Results"), (2) Executive summary — 3 key wins and 1 area for improvement, (3) Revenue and growth metrics with YoY comparison and visual chart recommendations, (4) Customer highlights — 2 brief success stories with specific numbers, (5) Challenges faced and actions taken — be transparent, (6) Next quarter priorities — 3 focused goals with owners and deadlines, (7) Closing slide with a forward-looking statement. For each slide: include speaker notes, suggest a visual layout, and keep bullet points to 5 words max. Total: 10-12 slides.',
  },
  {
    input: 'Write a cover letter for a tech job',
    enhanced: 'You are a tech industry recruiter who has reviewed 50,000+ applications and knows exactly what makes hiring managers stop and read. Write a standout cover letter for a software engineering role that breaks the typical boring format. Structure: (1) Opening hook — skip "I am writing to apply" and instead lead with a specific technical achievement or insight that connects to the company mission, (2) The bridge — how your background uniquely solves a problem this company faces (research their recent blog posts or product updates), (3) Evidence section — 2 concrete accomplishments with numbers (reduced load time by X%, built feature used by Y users), (4) Cultural fit signal — one sentence showing you understand their team values, (5) Confident close — suggest a specific conversation topic for the interview. Length: 250-300 words. Tone: technically credible yet personable. Avoid: buzzwords, generic statements, and repeating the resume.',
  },
];

// ── Featured Template Cards ───────────────────────────────

export interface TemplateCard {
  id: string;
  title: string;
  preview: string;
  category: string;
  rating: number;
}

export const FEATURED_TEMPLATES: TemplateCard[] = [
  // Writing
  { id: 't1', title: 'Cold Email Opener', preview: 'Craft attention-grabbing cold emails that get replies.', category: 'Marketing', rating: 4.8 },
  { id: 't2', title: 'Sales Follow-Up Sequence', preview: 'Write a 3-part follow-up sequence that converts leads.', category: 'Business', rating: 4.9 },
  { id: 't3', title: 'LinkedIn Outreach Message', preview: 'Connect with professionals using warm, personal messages.', category: 'Marketing', rating: 4.7 },
  { id: 't4', title: 'Blog Post Outline', preview: 'Structure SEO-friendly blog posts that rank and engage.', category: 'Writing', rating: 4.8 },
  { id: 't5', title: 'Product Description', preview: 'Write product descriptions that highlight benefits, not features.', category: 'Marketing', rating: 4.6 },
  { id: 't6', title: 'Meeting Summary Email', preview: 'Turn messy meeting notes into clear action-item emails.', category: 'Business', rating: 4.9 },
  // Code
  { id: 't7', title: 'Code Review Checklist', preview: 'Systematic review covering security, performance, and style.', category: 'Code', rating: 4.8 },
  { id: 't8', title: 'API Documentation Writer', preview: 'Generate clear API docs from endpoint descriptions.', category: 'Code', rating: 4.7 },
  { id: 't9', title: 'Bug Report Template', preview: 'Create detailed bug reports that developers can act on.', category: 'Code', rating: 4.6 },
  // Creative
  { id: 't10', title: 'Story Plot Generator', preview: 'Build compelling story arcs with character development.', category: 'Creative', rating: 4.8 },
  { id: 't11', title: 'Social Media Caption', preview: 'Write scroll-stopping captions for any platform.', category: 'Creative', rating: 4.7 },
  { id: 't12', title: 'YouTube Script Writer', preview: 'Structure engaging video scripts with hooks and CTAs.', category: 'Creative', rating: 4.9 },
  // Education
  { id: 't13', title: 'Study Guide Builder', preview: 'Create topic summaries with practice questions.', category: 'Education', rating: 4.8 },
  { id: 't14', title: 'Exam Prep Flashcards', preview: 'Generate Q&A flashcards for any subject.', category: 'Education', rating: 4.7 },
  { id: 't15', title: 'Essay Outline Helper', preview: 'Plan essays with thesis, arguments, and evidence.', category: 'Education', rating: 4.6 },
  // Business
  { id: 't16', title: 'Pitch Deck Outline', preview: 'Structure startup pitches that investors remember.', category: 'Business', rating: 4.9 },
  { id: 't17', title: 'SWOT Analysis Prompt', preview: 'Run a complete SWOT analysis for any business idea.', category: 'Business', rating: 4.7 },
  { id: 't18', title: 'Customer Survey Questions', preview: 'Design survey questions that get honest, useful feedback.', category: 'Business', rating: 4.6 },
  // More Marketing
  { id: 't19', title: 'Ad Copy Generator', preview: 'Write high-converting ad copy for any platform.', category: 'Marketing', rating: 4.8 },
  { id: 't20', title: 'Email Newsletter Template', preview: 'Build weekly newsletters that people actually read.', category: 'Marketing', rating: 4.7 },
  // More Writing
  { id: 't21', title: 'Resume Bullet Points', preview: 'Turn job duties into achievement-focused resume bullets.', category: 'Writing', rating: 4.9 },
  { id: 't22', title: 'Cover Letter Builder', preview: 'Write cover letters that match the job description.', category: 'Writing', rating: 4.8 },
  { id: 't23', title: 'Thank You Note Writer', preview: 'Craft genuine thank-you notes for any occasion.', category: 'Writing', rating: 4.6 },
  { id: 't24', title: 'Press Release Template', preview: 'Write newsworthy press releases that journalists use.', category: 'Writing', rating: 4.7 },
  // More Code
  { id: 't25', title: 'SQL Query Builder', preview: 'Generate complex SQL queries from plain English.', category: 'Code', rating: 4.8 },
  { id: 't26', title: 'Unit Test Generator', preview: 'Create comprehensive test cases for your functions.', category: 'Code', rating: 4.7 },
  // More Creative
  { id: 't27', title: 'Podcast Episode Planner', preview: 'Plan podcast episodes with segments and questions.', category: 'Creative', rating: 4.6 },
  { id: 't28', title: 'Brand Name Generator', preview: 'Generate catchy brand names with meaning and availability.', category: 'Creative', rating: 4.8 },
  // More Education
  { id: 't29', title: 'Lesson Plan Creator', preview: 'Build structured lesson plans with activities and goals.', category: 'Education', rating: 4.9 },
  { id: 't30', title: 'Research Paper Outline', preview: 'Structure academic papers with proper methodology.', category: 'Education', rating: 4.7 },
];

// ── Hero demo cards (shown during auto-type) ─────────────

export const HERO_DEMO_CARDS: TemplateCard[] = [
  FEATURED_TEMPLATES[0], // Cold Email Opener
  FEATURED_TEMPLATES[1], // Sales Follow-Up Sequence
  FEATURED_TEMPLATES[2], // LinkedIn Outreach Message
];

// ── Category template mapping ─────────────────────────────

export function getTemplatesByCategory(category: string): TemplateCard[] {
  if (category === 'All') return FEATURED_TEMPLATES.slice(0, 6);
  return FEATURED_TEMPLATES.filter((t) => t.category === category).slice(0, 6);
}

// ── Search simulation ─────────────────────────────────────

export function searchTemplates(query: string): TemplateCard[] {
  const q = query.toLowerCase();
  return FEATURED_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  ).slice(0, 6);
}
