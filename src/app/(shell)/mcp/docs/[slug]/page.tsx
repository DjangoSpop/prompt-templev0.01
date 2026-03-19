'use client';

import { useParams } from 'next/navigation';
import { useMCPDocumentDetail } from '@/hooks/useMCPContent';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function MCPDocDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: doc, isLoading } = useMCPDocumentDetail(slug);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-2/3 bg-[var(--bg)] animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-4 bg-[var(--bg)] animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-[var(--fg)]/50">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--fg)]/50 mb-2">
          <span>{doc.category_icon} {doc.category_name}</span>
          <span>·</span>
          <span>Quality {doc.quality_score.toFixed(2)}</span>
          {doc.mcp_version && (
            <>
              <span>·</span>
              <span>MCP {doc.mcp_version}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">{doc.title}</h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {doc.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--fg)]/50">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Markdown Content */}
      <article className="prose prose-sm sm:prose dark:prose-invert max-w-none
                          prose-headings:text-[var(--fg)] prose-a:text-[#1E3A8A]
                          dark:prose-a:text-[#6CA0FF] prose-code:text-[#C9A227]
                          prose-pre:bg-[#0E0F12] prose-pre:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {doc.content_md}
        </ReactMarkdown>
      </article>
    </div>
  );
}
