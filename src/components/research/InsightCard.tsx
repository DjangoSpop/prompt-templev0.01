'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import { Globe, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CitationBadge } from './CitationBadge';
import type { CardEventData } from '@/lib/types/research';

interface InsightCardProps {
  card: CardEventData;
  isStreaming?: boolean;
}

export function InsightCard({ card, isStreaming }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-pharaoh group relative overflow-hidden rounded-xl"
    >
      {/* Gold accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-royal-gold-400 via-royal-gold-500 to-royal-gold-600" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-royal-gold-500" />
            <h3 className="text-base font-semibold text-foreground sm:text-lg">
              {card.title}
            </h3>
          </div>
          {card.domain_cluster && (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-border/60 text-xs text-muted-foreground"
            >
              <Globe className="h-3 w-3" />
              {card.domain_cluster}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {card.content}
          </ReactMarkdown>
        </div>

        {/* Citations */}
        {card.citations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {card.citations.map((c) => (
              <CitationBadge key={c.n} citation={c} />
            ))}
          </div>
        )}

        {/* Confidence / Authority meters */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-3 dark:bg-muted/20">
          <MeterBar label="Confidence" value={card.confidence} color="emerald" />
          <MeterBar label="Authority" value={card.authority} color="lapis" />
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-muted/60 text-xs font-normal text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-royal-gold-600 dark:text-royal-gold-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-royal-gold-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-royal-gold-500" />
            </span>
            Analyzing...
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MeterBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'emerald' | 'lapis';
}) {
  const percent = Math.round(value * 100);
  const barColor =
    color === 'emerald'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : 'bg-lapis-blue-500 dark:bg-lapis-blue-400';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}
