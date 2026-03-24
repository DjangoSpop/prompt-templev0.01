'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Package, Wrench, CheckCircle, Globe } from 'lucide-react';
import type { Skill } from '@/types/mcp';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { MCP_TRANSPORT_LABELS } from '@/lib/mcp-utils';

interface Props {
  skill: Skill;
}

export function MCPServerCard({ skill }: Props) {
  return (
    <Link href={`/skills/${skill.slug}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative flex flex-col h-full rounded-xl border
                   border-[var(--border)] bg-[var(--card)] p-5
                   hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 mb-3">
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
        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-1">
          {skill.title}
        </h3>

        {/* Server name */}
        {skill.mcp_server_name && (
          <code className="text-xs font-mono text-[#C9A227]/80 mb-2 block truncate">
            {skill.mcp_server_name}
          </code>
        )}

        {/* Description */}
        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3 flex-1">
          {skill.description}
        </p>

        {/* MCP info strip */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {skill.mcp_transport && (
            <span className="inline-flex items-center gap-1 rounded-full
                           bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600
                           dark:text-blue-400">
              <Globe className="h-3 w-3" />
              {MCP_TRANSPORT_LABELS[skill.mcp_transport]}
            </span>
          )}
          {skill.github_language && (
            <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs
                           text-[var(--fg)]/60">
              {skill.github_language}
            </span>
          )}
        </div>

        {/* Packages */}
        {Array.isArray(skill.mcp_packages) && skill.mcp_packages.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--fg)]/50 mb-2">
            <Package className="h-3.5 w-3.5" />
            <code className="font-mono truncate">
              {skill.mcp_packages[0].name}
            </code>
          </div>
        )}

        {/* Bottom: stats */}
        <div className="flex items-center gap-4 pt-3 border-t
                        border-[var(--border)] text-xs text-[var(--fg)]/50">
          {skill.github_stars > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[#C9A227]" />
              {skill.github_stars.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5" /> {Array.isArray(skill.mcp_tools) ? skill.mcp_tools.length : 0} tools
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
