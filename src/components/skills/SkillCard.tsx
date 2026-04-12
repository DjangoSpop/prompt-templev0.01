'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Bookmark, Zap, CheckCircle } from 'lucide-react';
import type { Skill } from '@/types/mcp';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { SkillTypeBadge } from './SkillTypeBadge';
import { ShareMenu } from '@/components/sharing/ShareMenu';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.prompt-temple.com').replace(/\/$/, '');

interface Props {
  skill: Skill;
}

export function SkillCard({ skill }: Props) {
  return (
    <Link href={`/skills/${skill.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative flex flex-col h-full rounded-xl border
                   border-[var(--border)] bg-[var(--card)] p-5
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <ShareMenu
          title={skill.title}
          description={skill.description}
          url={`${SITE_URL}/skills/${skill.slug}`}
          entityType="skill"
          entityId={skill.id}
          extraAnalyticsData={{ skill_title: skill.title, skill_slug: skill.slug }}
          className="absolute top-3 right-3 z-10"
        />
        {/* Top row: badges */}
        <div className="flex items-center justify-between gap-2 mb-3 pr-10">
          <div className="flex items-center gap-2">
            {skill.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium
                             text-[#C9A227]">
                ★ Featured
              </span>
            )}
            {skill.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full
                             bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium
                             text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <MCPDifficultyBadge difficulty={skill.difficulty} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2">
          {skill.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3 flex-1">
          {skill.description}
        </p>

        {/* Type + Category */}
        <div className="flex items-center gap-2 mb-3">
          <SkillTypeBadge type={skill.skill_type} />
          {skill.category?.name && (
            <span className="text-xs text-[var(--fg)]/50">
              {skill.category.name}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs
                         text-[var(--fg)]/60"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="text-xs text-[var(--fg)]/40">
              +{skill.tags.length - 3}
            </span>
          )}
        </div>

        {/* Bottom: stats */}
        <div className="flex items-center gap-4 pt-3 border-t
                        border-[var(--border)] text-xs text-[var(--fg)]/50">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {skill.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5" /> {skill.save_count}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> {skill.use_count}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
