'use client';

/**
 * R2.1 — reader footer: attribution, "View as page" (the SEO route), share, and a
 * related strip that loads only when asked (so opening never fetches).
 */
import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, Link2, Scale, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRelated } from '@/lib/feed/hooks';
import { formLabel, isReadable, promptPath, type FeedItem } from '@/lib/feed/types';

interface ReaderFooterProps {
  item: FeedItem;
  onShare: () => void;
  onOpenRelated: (slug: string) => void;
}

export function ReaderFooter({ item, onShare, onOpenRelated }: ReaderFooterProps) {
  const [wantRelated, setWantRelated] = useState(false);
  const related = useRelated(item.slug, wantRelated);
  const source = item.attribution.source?.replace(/^github:/, '') ?? null;

  return (
    <footer className="mt-4 space-y-3 border-t border-border/60 pt-3 text-xs text-muted-foreground" data-testid="reader-footer">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {(source || item.attribution.license) && (
          <span className="inline-flex items-center gap-1">
            <Scale className="h-3 w-3" aria-hidden />
            {source && (
              <>
                From{' '}
                {item.attribution.url ? (
                  <a href={item.attribution.url} target="_blank" rel="noopener noreferrer nofollow" className="underline-offset-2 hover:underline">
                    {source}
                  </a>
                ) : (
                  source
                )}
              </>
            )}
            {source && item.attribution.license && ' · '}
            {item.attribution.license}
            {item.attribution.author && ` · by ${item.attribution.author}`}
          </span>
        )}
        <span className="tabular-nums">
          {item.stats.copies.toLocaleString()} copies · {item.word_count.toLocaleString()} words
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onShare}>
            <Link2 className="h-3 w-3" aria-hidden /> Share
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <Link href={promptPath(item)}>
              <ExternalLink className="h-3 w-3" aria-hidden /> View as page
            </Link>
          </Button>
        </span>
      </div>

      <div>
        {!wantRelated ? (
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs text-foreground" onClick={() => setWantRelated(true)}>
            <Sparkles className="h-3 w-3" aria-hidden /> Related prompts
          </Button>
        ) : related.isPending ? (
          <p aria-busy="true">Finding related prompts…</p>
        ) : related.data?.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Related prompts">
            {related.data.slice(0, 6).map((r) => (
              <li key={r.id}>
                {isReadable(r) ? (
                  <button type="button" className="rounded-md border border-border/60 px-2 py-1 text-left hover:border-[#C9A227]/60 hover:text-foreground v2:rounded-sm v2:border-line v2:hover:border-line v2:hover:bg-surface-sunken v2:hover:text-faience" onClick={() => onOpenRelated(r.slug)}>
                    <span className="mr-1 rounded bg-foreground/5 px-1 text-[10px]">{formLabel(r.form)}</span>
                    {r.title}
                  </button>
                ) : (
                  <Link href={promptPath(r)} className="rounded-md border border-border/60 px-2 py-1 hover:text-foreground">
                    {r.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No related prompts yet.</p>
        )}
      </div>
    </footer>
  );
}
