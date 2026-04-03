'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CitationBadge } from './CitationBadge';
import type { ResearchAnswer } from '@/lib/types/research';

interface AnswerRendererProps {
  answer: ResearchAnswer;
}

export function AnswerRenderer({ answer }: AnswerRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer.answer_md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-pharaoh overflow-hidden rounded-xl">
      {/* Gold accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-royal-gold-400 via-royal-gold-500 to-royal-gold-600" />

      <div className="p-5 sm:p-6">
        {/* Header with copy */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-royal-gold-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Full Answer
            </h3>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 border-border/60 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy full answer to clipboard</TooltipContent>
          </Tooltip>
        </div>

        {/* Markdown body */}
        <div className="prose prose-sm max-w-none text-foreground/90 prose-headings:text-foreground prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-li:text-foreground/90 dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              sup: ({ children, ...props }) => {
                const text = String(children);
                const match = text.match(/\^(\d+)/);
                if (match) {
                  const n = parseInt(match[1], 10);
                  const citation = answer.citations.find((c) => c.n === n);
                  if (citation) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-0.5 inline-flex items-center rounded bg-royal-gold-50 px-1 text-xs font-semibold text-royal-gold-600 no-underline hover:bg-royal-gold-100 dark:bg-royal-gold-900/30 dark:text-royal-gold-400"
                          >
                            [{n}]
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm font-medium">{citation.title}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {citation.url}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                }
                return <sup {...props}>{children}</sup>;
              },
            }}
          >
            {answer.answer_md}
          </ReactMarkdown>
        </div>

        {/* Citation list */}
        {answer.citations.length > 0 && (
          <div className="mt-6 border-t border-border/40 pt-5">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Sources ({answer.citations.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {answer.citations.map((c) => (
                <CitationBadge key={c.n} citation={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
