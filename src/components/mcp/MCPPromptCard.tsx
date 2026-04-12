'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPPromptListItem } from '@/types/mcp';
import { MCPDifficultyBadge } from './MCPDifficultyBadge';
import { MCPModelBadges } from './MCPModelBadges';
import { ShareMenu } from '@/components/sharing/ShareMenu';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.prompt-temple.com').replace(/\/$/, '');

interface Props {
  prompt: MCPPromptListItem;
}

export function MCPPromptCard({ prompt }: Props) {
  return (
    <Link href={`/mcp/prompts/${prompt.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative flex flex-col h-full rounded-xl border
                   border-[var(--border)] bg-[var(--card)] p-5
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <ShareMenu
          title={prompt.title}
          description={prompt.description}
          url={`${SITE_URL}/mcp/prompts/${prompt.slug}`}
          entityType="mcp_prompt"
          entityId={prompt.id}
          extraAnalyticsData={{ mcp_prompt_title: prompt.title, mcp_prompt_slug: prompt.slug }}
          className="absolute top-3 right-3 z-10"
        />
        {/* Top row: badges */}
        <div className="flex items-center justify-between gap-2 mb-3 pr-10">
          <div className="flex items-center gap-2">
            {prompt.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium
                             text-[#C9A227]">
                ★ Featured
              </span>
            )}
            {prompt.is_premium && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-[#1E3A8A]/10 px-2.5 py-0.5 text-xs font-medium
                             text-[#1E3A8A] dark:text-[#6CA0FF]">
                Premium
              </span>
            )}
          </div>
          <MCPDifficultyBadge difficulty={prompt.difficulty} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3 flex-1">
          {prompt.description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--fg)]/50 mb-3">
          <span>{prompt.category_icon}</span>
          <span>{prompt.category_name}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs
                         text-[var(--fg)]/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom: quality + cost + models */}
        <div className="flex items-center justify-between pt-3 border-t
                        border-[var(--border)]">
          <div className="flex items-center gap-3 text-xs text-[var(--fg)]/50">
            <span>Quality {prompt.quality_score.toFixed(2)}</span>
            <span>{prompt.credit_cost} credit{prompt.credit_cost !== 1 ? 's' : ''}</span>
          </div>
          <MCPModelBadges models={prompt.target_models} />
        </div>
      </motion.div>
    </Link>
  );
}
