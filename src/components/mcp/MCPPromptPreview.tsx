'use client';

import { useMemo } from 'react';
import { renderPromptTemplate } from '@/lib/mcp-utils';

interface Props {
  template: string;
  values: Record<string, string>;
}

export function MCPPromptPreview({ template, values }: Props) {
  const rendered = useMemo(
    () => renderPromptTemplate(template, values),
    [template, values],
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5">
      <h3 className="text-sm font-semibold text-[var(--fg)]/80 uppercase tracking-wider mb-3">
        Live Preview
      </h3>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono
                        text-[var(--fg)]/80 bg-transparent p-0">
          {rendered.split(/(\{\{\w+\}\})/).map((part, i) =>
            part.match(/^\{\{\w+\}\}$/) ? (
              <span
                key={i}
                className="inline rounded bg-[#C9A227]/20 px-1 py-0.5
                           text-[#C9A227] font-semibold"
              >
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </pre>
      </div>
    </div>
  );
}
