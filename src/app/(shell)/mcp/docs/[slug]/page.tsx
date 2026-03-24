'use client';

import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Eye, Tag } from 'lucide-react';
import { useMCPDocumentDetail } from '@/hooks/useMCPContent';

export default function MCPDocDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: doc, isLoading } = useMCPDocumentDetail(slug);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 rounded bg-[var(--card)]" />
        <div className="h-12 w-96 rounded bg-[var(--card)]" />
        <div className="h-96 rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-[var(--fg)]/60">Document not found</p>
        <button onClick={() => router.push('/mcp/docs')} className="mt-4 text-[#C9A227] text-sm hover:underline">
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--fg)]/50
                   hover:text-[#C9A227] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 text-xs text-[var(--fg)]/50 mb-2">
          <span>{doc.category_icon} {doc.category_name}</span>
          {doc.mcp_version && <span>MCP {doc.mcp_version}</span>}
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {doc.view_count}</span>
          {doc.published_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(doc.published_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">{doc.title}</h1>

        {doc.summary && (
          <p className="text-[var(--fg)]/60">{doc.summary}</p>
        )}

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {doc.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs text-[var(--fg)]/60">
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <div className="prose prose-sm dark:prose-invert max-w-none
                        prose-headings:text-[var(--fg)] prose-p:text-[var(--fg)]/80
                        prose-a:text-[#C9A227] prose-code:text-[#C9A227]
                        prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border)]">
          <ReactMarkdown>{doc.content_md}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
