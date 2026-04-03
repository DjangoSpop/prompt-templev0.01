'use client';

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Citation } from '@/lib/types/research';

interface CitationBadgeProps {
  citation: Citation;
}

export function CitationBadge({ citation }: CitationBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Badge
            variant="outline"
            className="cursor-pointer gap-1 border-royal-gold-400/50 bg-royal-gold-50 text-xs text-royal-gold-700 transition-colors hover:bg-royal-gold-100 dark:border-royal-gold-500/30 dark:bg-royal-gold-900/20 dark:text-royal-gold-300"
          >
            <span className="font-semibold">[{citation.n}]</span>
            <span className="max-w-[140px] truncate">{citation.title}</span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
          </Badge>
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm font-medium">{citation.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {citation.url}
        </p>
        {citation.score > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Relevance:</span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-royal-gold-500 transition-all"
                style={{ width: `${Math.round(citation.score * 100)}%` }}
              />
            </div>
            <span className="font-medium">{Math.round(citation.score * 100)}%</span>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
