'use client';

/**
 * F2/F5 — Like · Save · Fork · Copy · Open in… for a feed item.
 *
 * Anonymous Like/Save/Fork call `onRequireAuth` (the page shows `SignUpCta`); Copy
 * works for everyone and records `POST /copy/`. Reaction changes are announced in an
 * `aria-live` region; the count only animates when reduced motion is off.
 */
import { useState } from 'react';
import { Bookmark, Check, Copy, ExternalLink, GitFork, Heart, Loader2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/user';
import { trackFeed } from '@/lib/feed/analytics';
import { copyText, OPEN_IN_TARGETS } from '@/lib/feed/clipboard';
import { useReact, useRecordCopy } from '@/lib/feed/hooks';
import type { FeedItem, ReactionKind } from '@/lib/feed/types';
import type { CtaIntent } from './SignUpCta';

interface PromptActionsProps {
  item: FeedItem;
  /** Full prompt text (or a promise of it — cards fetch it on demand). */
  getText: () => string | Promise<string>;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: () => void;
  /** Which view was copied, for `prompt_copied{view}` and `POST /copy/`. */
  copyView?: string;
  size?: 'sm' | 'md';
  className?: string;
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

export function PromptActions({ item, getText, onRequireAuth, onFork, copyView = 'full', size = 'sm', className }: PromptActionsProps) {
  const authed = useAuthStore((s) => s.isAuthenticated);
  const react = useReact();
  const recordCopy = useRecordCopy();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const onReact = (kind: ReactionKind) => {
    if (!authed) return onRequireAuth({ kind, slug: item.slug });
    const willBeActive = !(kind === 'like' ? item.viewer.liked : item.viewer.saved);
    react.mutate({ slug: item.slug, kind });
    trackFeed('prompt_reacted', { kind, active: willBeActive, form: item.form });
    setAnnouncement(`${kind === 'like' ? (willBeActive ? 'Liked' : 'Like removed') : willBeActive ? 'Saved' : 'Removed from saved'}: ${item.title}`);
  };

  const doCopy = async (target?: (typeof OPEN_IN_TARGETS)[number]) => {
    setCopying(true);
    try {
      // Copy first: the clipboard write fails once a new tab has taken focus.
      const text = getText();
      await copyText(typeof text === 'string' ? text : Promise.resolve(text));
      recordCopy(item.slug, copyView);
      trackFeed('prompt_copied', { view: copyView, form: item.form, ...(target ? { open_in: target.id } : {}) });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      if (target) {
        // Still inside the click's transient activation (a few seconds) in current browsers.
        // No 'noopener' feature: with it window.open returns null and a blocked popup is undetectable.
        const win = window.open(target.url, '_blank');
        if (win) win.opener = null;
        toast.success(`Copied — paste it into ${target.label}`, win ? undefined : {
          action: { label: `Open ${target.label}`, onClick: () => window.open(target.url, '_blank', 'noopener,noreferrer') },
        });
      } else {
        toast.success('Prompt copied');
      }
    } catch {
      toast.error('Could not copy. Open the prompt and copy it from there.');
    } finally {
      setCopying(false);
    }
  };

  const btn = size === 'sm' ? 'h-8 px-2 text-xs' : 'h-9 px-3 text-sm';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        className={cn(btn, 'gap-1.5', item.viewer.liked && 'text-rose-600 dark:text-rose-400')}
        aria-pressed={item.viewer.liked}
        aria-label={item.viewer.liked ? `Unlike (${item.stats.likes} likes)` : `Like (${item.stats.likes} likes)`}
        onClick={() => onReact('like')}
      >
        <Heart className={cn(icon, item.viewer.liked && 'fill-current')} aria-hidden />
        <span key={item.stats.likes} className="tabular-nums motion-safe:animate-in motion-safe:zoom-in-75">
          {formatCount(item.stats.likes)}
        </span>
      </Button>
      <Button
        variant="ghost"
        className={cn(btn, 'gap-1.5', item.viewer.saved && 'text-[#C9A227]')}
        aria-pressed={item.viewer.saved}
        aria-label={item.viewer.saved ? `Unsave (${item.stats.saves} saves)` : `Save (${item.stats.saves} saves)`}
        onClick={() => onReact('save')}
      >
        <Bookmark className={cn(icon, item.viewer.saved && 'fill-current')} aria-hidden />
        <span key={item.stats.saves} className="tabular-nums motion-safe:animate-in motion-safe:zoom-in-75">
          {formatCount(item.stats.saves)}
        </span>
      </Button>
      <Button
        variant="ghost"
        className={cn(btn, 'gap-1.5', item.viewer.forked && 'text-[#C9A227]')}
        aria-label={`Fork (${item.stats.forks} forks)`}
        onClick={() => (authed ? onFork() : onRequireAuth({ kind: 'fork', slug: item.slug }))}
      >
        <GitFork className={icon} aria-hidden />
        <span className="hidden tabular-nums sm:inline">{formatCount(item.stats.forks)}</span>
      </Button>
      <Button variant="ghost" className={cn(btn, 'gap-1.5')} onClick={() => doCopy()} disabled={copying} aria-label="Copy prompt">
        {copying ? (
          <Loader2 className={cn(icon, 'animate-spin')} aria-hidden />
        ) : copied ? (
          <Check className={cn(icon, 'text-green-600')} aria-hidden />
        ) : (
          <Copy className={icon} aria-hidden />
        )}
        <span className="hidden sm:inline">Copy</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(btn, 'w-8 px-0')} aria-label="More actions">
            <MoreHorizontal className={icon} aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Copy and open in</DropdownMenuLabel>
          {OPEN_IN_TARGETS.map((target) => (
            <DropdownMenuItem key={target.id} onSelect={() => doCopy(target)}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" aria-hidden /> {target.label}
            </DropdownMenuItem>
          ))}
          {item.attribution.url && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={item.attribution.url} target="_blank" rel="noopener noreferrer nofollow">
                  View the original source
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
