'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MCPDocumentListItem } from '@/types/mcp';

interface Props {
  doc: MCPDocumentListItem;
}

export function MCPDocumentCard({ doc }: Props) {
  return (
    <Link href={`/mcp/docs/${doc.slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group rounded-xl border border-[var(--border)] bg-[var(--card)]
                   p-5 hover:border-[#C9A227]/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{doc.category_icon}</span>
          <span className="text-xs text-[var(--fg)]/50">{doc.category_name}</span>
          <span className="text-xs text-[var(--fg)]/30">·</span>
          <span className="text-xs text-[var(--fg)]/30">Quality {doc.quality_score.toFixed(2)}</span>
        </div>

        <h3 className="font-semibold text-[var(--fg)] line-clamp-2 mb-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#6CA0FF] transition-colors">
          {doc.title}
        </h3>

        <p className="text-sm text-[var(--fg)]/60 line-clamp-2 mb-3">
          {doc.summary || doc.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--fg)]/50">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
