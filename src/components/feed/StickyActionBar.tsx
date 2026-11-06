'use client';

/**
 * R2.3 — the reader's action bar. Sticks under the navbar while its reader is in view.
 * Left: form badge + title. Right: Copy (the only filled button) · Like · Save · Fork ·
 * legend (Aa) · ‹ › · overflow (Open in…, Share, View as page, settings) · ✕.
 * On phones the bar is 44 px tall with ≥ 44 × 44 px targets; Copy keeps its label.
 */
import { Bookmark, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, GitFork, Heart, Loader2, MoreHorizontal, Share2, X } from 'lucide-react';
import { useState } from 'react';
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
import { OPEN_IN_TARGETS } from '@/lib/feed/clipboard';
import { useReact } from '@/lib/feed/hooks';
import { formLabel, promptPath, type FeedItem, type ReactionKind } from '@/lib/feed/types';
import type { LegendMode } from './PromptText';
import type { ReaderSettings } from './useReader';
import type { CtaIntent } from './SignUpCta';

export type OpenInTarget = (typeof OPEN_IN_TARGETS)[number];

export interface StickyActionBarProps {
  item: FeedItem;
  copyLabel: string;
  copied: boolean;
  copying: boolean;
  onCopy: (target?: OpenInTarget) => void;
  onShare: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  legend: LegendMode;
  onLegend: () => void;
  /** The tokenizer failed and plain text is showing (legend chip). */
  plainFallback: boolean;
  settings: ReaderSettings;
  onSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: () => void;
  /** Rendered inside a focus-mode panel (sticks to the panel's top instead of the navbar). */
  inPanel?: boolean;
}

const LEGEND_LABEL: Record<LegendMode, string> = { coloured: 'Coloured', plain: 'Plain', large: 'Large' };

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

export function StickyActionBar(props: StickyActionBarProps) {
  const { item, copyLabel, copied, copying, onCopy, onShare, hasPrev, hasNext, onPrev, onNext, onClose, legend, onLegend, plainFallback, settings, onSetting, onRequireAuth, onFork, inPanel } = props;
  const authed = useAuthStore((s) => s.isAuthenticated);
  const react = useReact();
  const [announcement, setAnnouncement] = useState('');

  const onReact = (kind: ReactionKind) => {
    if (!authed) return onRequireAuth({ kind, slug: item.slug });
    const willBeActive = !(kind === 'like' ? item.viewer.liked : item.viewer.saved);
    react.mutate({ slug: item.slug, kind });
    trackFeed('prompt_reacted', { kind, active: willBeActive, form: item.form });
    setAnnouncement(`${kind === 'like' ? (willBeActive ? 'Liked' : 'Like removed') : willBeActive ? 'Saved' : 'Removed from saved'}: ${item.title}`);
  };

  const icon = 'h-4 w-4';
  const ghost = 'h-11 min-w-11 px-2 sm:h-8 sm:min-w-0 sm:px-2 text-xs gap-1';

  return (
    <div
      className={cn(
        'pt-reader-bar sticky z-20 -mx-4 flex h-11 items-center gap-1 border-b border-border/60 bg-card/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:mx-0 sm:rounded-md sm:border sm:px-2 v2:border-line v2:bg-surface v2:backdrop-blur-none v2:supports-[backdrop-filter]:bg-surface v2:sm:rounded-pill',
        inPanel ? 'top-0' : 'top-[var(--reader-sticky-top)]'
      )}
      role="toolbar"
      aria-label="Prompt actions"
      data-testid="reader-bar"
    >
      <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium md:inline v2:rounded-pill v2:border-line v2:text-xs v2:font-semibold v2:uppercase v2:tracking-[0.06em] v2:text-ink-muted">{formLabel(item.form)}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium" title={item.title}>
        {item.title}
      </span>

      <Button size="sm" className="h-9 shrink-0 gap-1.5 bg-[#C9A227] px-3 text-black hover:bg-[#b8921f] sm:h-8 v2:rounded-pill v2:bg-faience-fill v2:text-faience-on v2:hover:bg-faience-fill v2:hover:opacity-90" onClick={() => onCopy()} disabled={copying} data-testid="reader-copy">
        {copying ? <Loader2 className={cn(icon, 'animate-spin')} aria-hidden /> : copied ? <Check className={icon} aria-hidden /> : <Copy className={icon} aria-hidden />}
        <span>{copied ? 'Copied' : copyLabel}</span>
      </Button>

      <Button
        variant="ghost"
        className={cn(ghost, item.viewer.liked && 'text-rose-600 dark:text-rose-400')}
        aria-pressed={item.viewer.liked}
        aria-label={item.viewer.liked ? `Unlike, ${formatCount(item.stats.likes)} likes` : `Like, ${formatCount(item.stats.likes)} likes`}
        title="Like"
        onClick={() => onReact('like')}
      >
        <Heart className={cn(icon, item.viewer.liked && 'fill-current')} aria-hidden />
        <span className="hidden tabular-nums sm:inline">{formatCount(item.stats.likes)}</span>
      </Button>
      <Button
        variant="ghost"
        className={cn(ghost, item.viewer.saved && 'text-[#C9A227] v2:text-faience')}
        aria-pressed={item.viewer.saved}
        aria-label={item.viewer.saved ? `Unsave, ${formatCount(item.stats.saves)} saves` : `Save, ${formatCount(item.stats.saves)} saves`}
        title="Save"
        onClick={() => onReact('save')}
      >
        <Bookmark className={cn(icon, item.viewer.saved && 'fill-current')} aria-hidden />
      </Button>
      <Button variant="ghost" className={cn(ghost, 'hidden sm:inline-flex', item.viewer.forked && 'text-[#C9A227] v2:text-faience')} aria-label={`Fork, ${formatCount(item.stats.forks)} forks`} title="Fork" onClick={() => (authed ? onFork() : onRequireAuth({ kind: 'fork', slug: item.slug }))}>
        <GitFork className={icon} aria-hidden />
      </Button>
      <Button variant="ghost" className={cn(ghost, 'font-serif v2:font-sans')} title={`Text style: ${LEGEND_LABEL[legend]}`} onClick={onLegend} data-testid="reader-legend">
        <span className={cn('text-sm', legend === 'large' && 'text-base', legend === 'plain' && 'text-muted-foreground')}>Aa</span>
        <span className="sr-only">{`, text style: ${LEGEND_LABEL[legend]}${plainFallback ? ' (showing plain text)' : ''}`}</span>
        {plainFallback && <span className="rounded bg-foreground/5 px-1 text-[10px] text-muted-foreground">plain</span>}
      </Button>
      <div className="hidden items-center sm:flex">
        <Button variant="ghost" className={ghost} aria-label="Previous prompt" title="Previous (k)" onClick={onPrev} disabled={!hasPrev}>
          <ChevronLeft className={icon} aria-hidden />
        </Button>
        <Button variant="ghost" className={ghost} aria-label="Next prompt" title="Next (j)" onClick={onNext} disabled={!hasNext}>
          <ChevronRight className={icon} aria-hidden />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={ghost} aria-label="More actions">
            <MoreHorizontal className={icon} aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Copy and open in</DropdownMenuLabel>
          {OPEN_IN_TARGETS.map((target) => (
            <DropdownMenuItem key={target.id} onSelect={() => onCopy(target)}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" aria-hidden /> {target.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onShare}>
            <Share2 className="mr-2 h-3.5 w-3.5" aria-hidden /> Share link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={promptPath(item)}>View as page</a>
          </DropdownMenuItem>
          {item.attribution.url && (
            <DropdownMenuItem asChild>
              <a href={item.attribution.url} target="_blank" rel="noopener noreferrer nofollow">
                View the original source
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => (e.preventDefault(), onSetting('keepOpen', !settings.keepOpen))} aria-checked={settings.keepOpen} role="menuitemcheckbox">
            <span className="mr-2 inline-flex h-3.5 w-3.5 items-center justify-center">{settings.keepOpen && <Check className="h-3.5 w-3.5" aria-hidden />}</span>
            Keep prompts open
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => (e.preventDefault(), onSetting('softCollapse', !settings.softCollapse))} aria-checked={settings.softCollapse} role="menuitemcheckbox">
            <span className="mr-2 inline-flex h-3.5 w-3.5 items-center justify-center">{settings.softCollapse && <Check className="h-3.5 w-3.5" aria-hidden />}</span>
            Collapse when scrolled past
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" className={ghost} aria-label="Close reader" title="Close (Esc)" onClick={onClose} data-testid="reader-close">
        <X className={icon} aria-hidden />
      </Button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
