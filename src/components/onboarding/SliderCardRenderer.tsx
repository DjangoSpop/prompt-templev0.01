'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { SliderCard } from '@/hooks/useOnboardingSlider';

const CARD_HOVER = { scale: 1.02, y: -4 } as const;
const CARD_TAP = { scale: 0.98 } as const;

const ITERATION_PARTICLES = [
  { top: '12%', left: '10%', delay: 0 },
  { top: '24%', right: '12%', delay: 0.4 },
  { top: '68%', left: '16%', delay: 0.8 },
  { top: '76%', right: '18%', delay: 1.2 },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  intermediate: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  advanced: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  expert: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const USE_CASE_LABELS: Record<string, string> = {
  workflow_automation: 'Workflow',
  multi_agent: 'Multi-Agent',
  mcp_server_build: 'Server Build',
  agent_design: 'Agent Design',
  customer_support: 'Support Agent',
  code_review: 'Code Review',
  data_pipeline: 'Data Pipeline',
  security_audit: 'Security',
  enterprise_deploy: 'Enterprise',
  monitoring: 'Monitoring',
  context_engineering: 'Context Eng.',
  tool_creation: 'Tool Creation',
  research_agent: 'Research',
  marketing_agent: 'Marketing',
};

export function SliderCardRenderer({
  card,
  index,
}: {
  card: SliderCard;
  index: number;
}) {
  switch (card.type) {
    case 'featured_prompt':
      return <FeaturedPromptCard data={card.data} index={index} />;
    case 'category':
      return <CategoryCard data={card.data} index={index} />;
    case 'course':
      return <CourseCard data={card.data} index={index} />;
    case 'continue':
      return <ContinueCard data={card.data} index={index} />;
    case 'bookmarked':
      return <BookmarkedCard data={card.data} index={index} />;
    case 'cta':
      return <CTACard variant={card.data.variant} index={index} />;
    default:
      return null;
  }
}

// ── Featured Prompt Card ──
function FeaturedPromptCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card card-featured relative min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer rounded-2xl border border-royal-gold-500/20 bg-gradient-to-br from-sand-50 via-white to-papyrus-50 p-6 shadow-lg"
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {data.is_premium && (
        <div className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-royal-gold-400 to-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          Premium
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <span className="text-2xl">{data.category_icon}</span>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[data.difficulty] || ''}`}
          >
            {data.difficulty}
          </span>
          {data.use_case && (
            <span className="rounded-full bg-royal-gold-500/10 px-2 py-0.5 text-[10px] font-medium text-royal-gold-600">
              {USE_CASE_LABELS[data.use_case] || data.use_case}
            </span>
          )}
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold leading-tight text-hieroglyph">
        {data.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {data.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {data.tags?.slice(0, 4).map((tag: string) => (
          <span
            key={tag}
            className="rounded-md bg-royal-gold-500/10 px-2 py-0.5 text-[10px] text-royal-gold-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-royal-gold-500/10 pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{data.usage_count || 0} uses</span>
          {data.quality_score != null && (
            <QualityBar score={data.quality_score} />
          )}
        </div>
        <span className="text-xs font-medium text-royal-gold-600">
          {data.credit_cost} {data.credit_cost === 1 ? 'credit' : 'credits'}
        </span>
      </div>
    </motion.div>
  );
}

// ── Category Card ──
function CategoryCard({ data, index }: { data: any; index: number }) {
  const total = (data.document_count || 0) + (data.prompt_count || 0);

  return (
    <motion.div
      className="slider-card relative min-w-[260px] max-w-[300px] flex-shrink-0 cursor-pointer rounded-2xl border border-royal-gold-500/20 bg-gradient-to-br from-papyrus-50 to-sand-100 p-6 shadow-lg"
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="mb-4 block text-4xl">{data.icon}</span>
      <h3 className="mb-1 text-lg font-semibold text-hieroglyph">{data.name}</h3>
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {data.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{data.prompt_count} prompts</span>
        <span>{data.document_count} docs</span>
      </div>

      <motion.div
        className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-royal-gold-500/20 text-sm font-bold text-royal-gold-600"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1, type: 'spring' }}
      >
        {total}
      </motion.div>
    </motion.div>
  );
}

// ── Course Card ──
function CourseCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-sand-50 p-6 shadow-lg"
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
          {data.level}
        </span>
        {data.is_free && (
          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
            Free
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold text-hieroglyph">
        {data.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.total_lessons} lessons</span>
        <span>{data.estimated_minutes} min</span>
        <span className="font-medium text-emerald-600">
          {data.total_enrollments} enrolled
        </span>
      </div>
    </motion.div>
  );
}

// ── Continue Card (GraphQL-powered) ──
function ContinueCard({ data, index }: { data: any; index: number }) {
  const lastMessage = data.messages?.[data.messages.length - 1];

  return (
    <motion.div
      className="slider-card relative min-w-[300px] max-w-[340px] flex-shrink-0 cursor-pointer rounded-2xl border border-royal-gold-500/30 bg-gradient-to-br from-amber-50/80 to-sand-50 p-6 shadow-lg"
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {ITERATION_PARTICLES.map((particle, i) => (
          <motion.span
            key={`continue-particle-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-royal-gold-400/60"
            style={particle}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-royal-gold-500" />
        <span className="text-xs font-medium uppercase tracking-wider text-royal-gold-600">
          Continue
        </span>
      </div>

      <h3 className="mb-2 text-base font-semibold text-hieroglyph">
        {data.title}
      </h3>
      {lastMessage && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {lastMessage.iteration?.promptText}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.totalIterations} iterations</span>
        <span className="font-medium text-royal-gold-600">Resume &rarr;</span>
      </div>
    </motion.div>
  );
}

// ── Bookmarked Card (GraphQL-powered) ──
function BookmarkedCard({ data, index }: { data: any; index: number }) {
  return (
    <motion.div
      className="slider-card relative min-w-[280px] max-w-[320px] flex-shrink-0 cursor-pointer rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-50/60 to-papyrus-50 p-6 shadow-lg"
      whileHover={CARD_HOVER}
      whileTap={CARD_TAP}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {ITERATION_PARTICLES.map((particle, i) => (
          <motion.span
            key={`bookmark-particle-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/60"
            style={particle}
            animate={{ y: [0, -4, 0], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, delay: particle.delay + 0.2 }}
          />
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-amber-500">&#9733;</span>
        <span className="text-xs font-medium uppercase tracking-wider text-amber-600">
          Bookmarked
        </span>
        {data.userRating && (
          <span className="ml-auto text-xs text-amber-500/60">
            {data.userRating}/5
          </span>
        )}
      </div>

      <p className="mb-3 line-clamp-3 text-sm text-hieroglyph/80">
        {data.promptText}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {data.tags?.slice(0, 3).map((tag: string) => (
          <span
            key={tag}
            className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ── CTA Card ──
function CTACard({ variant, index }: { variant: string; index: number }) {
  const isSignup = variant === 'signup';

  return (
    <Link href={isSignup ? '/auth/register' : '/templates'}>
      <motion.div
        className="slider-card min-w-[280px] max-w-[320px] flex-shrink-0 cursor-pointer rounded-2xl border border-royal-gold-500/30 bg-gradient-to-br from-royal-gold-400 to-amber-600 p-6 shadow-2xl"
        whileHover={{ scale: 1.06, y: -10 }}
        whileTap={{ scale: 0.96 }}
      >
        <h3 className="mb-2 text-lg font-bold text-white">
          {isSignup ? 'Start Building with AI' : 'Explore the Full Library'}
        </h3>
        <p className="mb-4 text-sm text-white/80">
          {isSignup
            ? '138 prompt templates, 59 knowledge docs, 2 academy courses — 500 free credits on signup.'
            : 'Browse n8n workflows, multi-agent patterns, enterprise deployments, and more.'}
        </p>
        <div className="inline-flex rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
          {isSignup ? 'Get Started Free \u2192' : 'Browse All \u2192'}
        </div>
      </motion.div>
    </Link>
  );
}

// ── Quality Score Bar ──
export function QualityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-royal-gold-500/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-royal-gold-400 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <span className="text-[10px]">{Math.round(score * 100)}%</span>
    </div>
  );
}

// ── Loading Skeleton ──
export function SliderSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden px-8 py-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="min-w-[300px] animate-pulse rounded-2xl border border-royal-gold-500/10 bg-sand-50 p-6"
        >
          <div className="mb-4 h-8 w-8 rounded-lg bg-royal-gold-500/10" />
          <div className="mb-2 h-4 w-3/4 rounded bg-royal-gold-500/10" />
          <div className="mb-4 h-3 w-full rounded bg-royal-gold-500/5" />
          <div className="h-3 w-1/2 rounded bg-royal-gold-500/5" />
        </div>
      ))}
    </div>
  );
}
