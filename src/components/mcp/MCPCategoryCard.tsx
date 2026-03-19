'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPCategory } from '@/types/mcp';

interface Props {
  category: MCPCategory;
}

export function MCPCategoryCard({ category }: Props) {
  return (
    <Link href={`/mcp/prompts?category=${category.slug}`}>
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(201,162,39,0.15)' }}
        className="group relative overflow-hidden rounded-xl border border-[var(--border)]
                   bg-[var(--card)] p-5 transition-colors hover:border-[#C9A227]/40
                   cursor-pointer"
      >
        {/* Accent left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A]
                        group-hover:bg-[#C9A227] transition-colors" />

        <div className="pl-3">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="mt-2 font-semibold text-[var(--fg)] line-clamp-1">
            {category.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--fg)]/60">
            {category.prompt_count} prompts · {category.document_count} articles
          </p>
          <p className="mt-2 text-sm text-[var(--fg)]/70 line-clamp-2">
            {category.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
