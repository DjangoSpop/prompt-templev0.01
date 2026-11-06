'use client';

/**
 * R2 — the inline reader. Expands under the card header (height 0 → auto, 220 ms open /
 * 160 ms close, 0 ms under prefers-reduced-motion), reads the item from the feed cache,
 * and hosts the sticky action bar, the view switch (R4), the coloured text (R3) and the
 * footer. Esc / j / k / c are handled by `useReader`; swipe and focus live here.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { trackFeed } from '@/lib/feed/analytics';
import { copyPlain, selectText } from '@/lib/feed/copy';
import { useEnsureReaderText, useRecordCopy } from '@/lib/feed/hooks';
import { readerPath, type FeedItem } from '@/lib/feed/types';
import { LEGEND_MODES, PromptText, type LegendMode } from './PromptText';
import { ReaderFooter } from './ReaderFooter';
import { availableReaderViews, OutlineView, StepsView, VariablesView, ViewSwitch, type ReaderView } from './ReaderViews';
import type { CtaIntent } from './SignUpCta';
import { StickyActionBar, type OpenInTarget } from './StickyActionBar';
import { ExplainLine } from '@/components/brand/ExplainLine';
import { READER_LEGEND_KEY, type ReaderSettings } from './useReader';

export const OPEN_MS = 220;
export const CLOSE_MS = 160;
export const SWIPE_MIN_PX = 60;
export const SWIPE_MAX_DRIFT_PX = 40;
export const SOFT_COLLAPSE_RATIO = 0.6;
export const COPIED_MS = 1200;

/** Open / close motion; 0 ms when the visitor prefers reduced motion. */
export function readerTransition(open: boolean, reduced: boolean) {
  return { duration: reduced ? 0 : (open ? OPEN_MS : CLOSE_MS) / 1000, ease: 'easeOut' as const };
}

/** `1` = next (swipe left), `-1` = previous (swipe right), `0` = not a swipe. */
export function detectSwipe(dx: number, dy: number): 1 | -1 | 0 {
  if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dy) > SWIPE_MAX_DRIFT_PX) return 0;
  return dx < 0 ? 1 : -1;
}

function loadLegend(): LegendMode {
  try {
    const raw = window.localStorage.getItem(READER_LEGEND_KEY);
    return raw && (LEGEND_MODES as string[]).includes(raw) ? (raw as LegendMode) : 'coloured';
  } catch {
    return 'coloured';
  }
}

export interface ReaderRegionProps {
  item: FeedItem;
  open: boolean;
  /** This reader is the one j/k/c/Esc act on (several may be open with "Keep prompts open"). */
  active: boolean;
  titleId: string;
  regionId: string;
  hasPrev: boolean;
  hasNext: boolean;
  onClose: (reason?: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSwipe: (dir: 1 | -1) => void;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: () => void;
  onOpenRelated: (slug: string) => void;
  settings: ReaderSettings;
  onSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  focusMode: boolean;
  copyTick: number;
}

const EXPLAIN_COPY_KEY = 'pt:explain-copy';

/** Brand v2: once per session, say what Copy does under the bar (hidden when the flag is off). */
function CopyExplainOnce() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(EXPLAIN_COPY_KEY)) {
        sessionStorage.setItem(EXPLAIN_COPY_KEY, '1');
        setShow(true);
      }
    } catch {
      /* storage unavailable: stay quiet */
    }
  }, []);
  if (!show) return null;
  return (
    <ExplainLine className="mt-2 hidden v2:block" data-testid="reader-copy-explain">
      Copies the plain prompt text. Colour never changes what you paste.
    </ExplainLine>
  );
}

function ReaderBody(props: ReaderRegionProps) {
  const { item, active, titleId, regionId, hasPrev, hasNext, onClose, onPrev, onNext, onSwipe, onRequireAuth, onFork, onOpenRelated, settings, onSetting, focusMode, copyTick } = props;
  const reduced = !!useReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const recordCopy = useRecordCopy();
  const { loading, error } = useEnsureReaderText(item, true);

  const views = availableReaderViews(item);
  const [view, setViewState] = useState<ReaderView>('read');
  const [legend, setLegend] = useState<LegendMode>('coloured');
  const [plainFallback, setPlainFallback] = useState(false);
  const [focusVariable, setFocusVariable] = useState<string | null>(null);
  const [filled, setFilled] = useState<{ text: string; missing: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [announce, setAnnounce] = useState('');
  const rtl = item.language === 'ar';

  useEffect(() => setLegend(loadLegend()), []);
  useEffect(() => {
    regionRef.current?.focus({ preventScroll: true });
  }, []);

  const setView = (next: ReaderView) => {
    if (next === view) return;
    setViewState(next);
    trackFeed('reader_view_switched', { view: next, form: item.form });
  };

  const cycleLegend = () => {
    const next = LEGEND_MODES[(LEGEND_MODES.indexOf(legend) + 1) % LEGEND_MODES.length];
    setLegend(next);
    trackFeed('reader_legend', { mode: next });
    try {
      window.localStorage.setItem(READER_LEGEND_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const onFilled = useCallback((text: string, missing: string[]) => setFilled({ text, missing }), []);
  const copyView = view === 'variables' && filled ? 'filled' : view === 'read' ? 'full' : view;
  const copyLabel = copyView === 'filled' ? 'Copy filled' : 'Copy';

  const doCopy = useCallback(
    async (target?: OpenInTarget) => {
      const text = copyView === 'filled' && filled ? filled.text : item.text;
      if (!text) {
        toast.error('The prompt text is still loading.');
        return;
      }
      setCopying(true);
      try {
        await copyPlain(text);
        recordCopy(item.slug, copyView);
        trackFeed('prompt_copied', { view: copyView, form: item.form, ...(target ? { open_in: target.id } : {}) });
        setCopied(true);
        setAnnounce(copyView === 'filled' ? 'Copied filled prompt' : 'Copied prompt');
        setTimeout(() => setCopied(false), COPIED_MS);
        if (target) {
          const win = window.open(target.url, '_blank');
          if (win) win.opener = null;
          toast.success(`Copied — paste it into ${target.label}`, win ? undefined : {
            action: { label: `Open ${target.label}`, onClick: () => window.open(target.url, '_blank', 'noopener,noreferrer') },
          });
        }
      } catch {
        toast.error('Select and copy manually');
        if (textRef.current) selectText(textRef.current);
      } finally {
        setCopying(false);
      }
    },
    [copyView, filled, item.text, item.slug, item.form, recordCopy]
  );

  // `c` key (useReader) → copy from the active reader.
  const firstTick = useRef(copyTick);
  useEffect(() => {
    if (!active || copyTick === firstTick.current) return;
    firstTick.current = copyTick;
    void doCopy();
  }, [copyTick, active, doCopy]);

  const share = async () => {
    const url = `${window.location.origin}${readerPath(item)}`;
    try {
      await copyPlain(url);
      toast.success('Link copied');
    } catch {
      toast.error(url);
    }
  };

  const jumpToHeading = (index: number, title: string) => {
    setView('read');
    requestAnimationFrame(() => {
      const root = textRef.current;
      if (!root) return;
      const headings = Array.from(root.querySelectorAll<HTMLElement>('h4[data-kind="heading"]'));
      const wanted = title.trim().toLowerCase();
      const el = headings.find((h) => (h.getAttribute('title') ?? '').trim().toLowerCase() === wanted) ?? headings[index];
      el?.scrollIntoView?.({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    });
  };

  const onVariable = views.includes('variables')
    ? (name: string) => {
        setFocusVariable(name);
        setView('variables');
      }
    : undefined;

  // Swipe ≥ 60 px horizontally inside the reader (touch only).
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dir = detectSwipe(e.clientX - start.x, e.clientY - start.y);
    if (dir) onSwipe(dir);
  };

  // Soft collapse once the visitor scrolled 60 % of a screen past the reader's bottom.
  useEffect(() => {
    if (!settings.softCollapse || focusMode) return;
    let raf = 0;
    const armed = performance.now() + 600;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = regionRef.current?.getBoundingClientRect();
        if (!rect || performance.now() < armed) return;
        if (rect.bottom < -SOFT_COLLAPSE_RATIO * window.innerHeight) onClose('scroll');
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [settings.softCollapse, focusMode, onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== regionRef.current) return;
    if (e.key === 'ArrowDown' && hasNext) (e.preventDefault(), onNext());
    if (e.key === 'ArrowUp' && hasPrev) (e.preventDefault(), onPrev());
  };

  return (
    <div
      ref={regionRef}
      id={regionId}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn('pt-reader outline-none', focusMode && 'lg:fixed lg:right-4 lg:top-[var(--reader-sticky-top)] lg:z-40 lg:max-h-[calc(100vh-var(--reader-sticky-top)-1rem)] lg:w-[min(34rem,42vw)] lg:overflow-auto lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:shadow-2xl v2:lg:rounded-cartouche v2:lg:border-line v2:lg:bg-surface v2:lg:shadow-lift')}
      data-testid="reader-region"
      data-active={active || undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <StickyActionBar
        item={item}
        copyLabel={copyLabel}
        copied={copied}
        copying={copying}
        onCopy={doCopy}
        onShare={share}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={onPrev}
        onNext={onNext}
        onClose={() => onClose('button')}
        legend={legend}
        onLegend={cycleLegend}
        plainFallback={plainFallback}
        settings={settings}
        onSetting={onSetting}
        onRequireAuth={onRequireAuth}
        onFork={onFork}
        inPanel={focusMode}
      />
      <CopyExplainOnce />

      <div className="mt-3 space-y-3">
        {views.length > 1 && <ViewSwitch views={views} value={view} onChange={setView} />}

        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading prompt">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : error && !item.text ? (
          <p className="text-sm text-muted-foreground" role="alert">
            Could not load the prompt text. Try again or open it as a page.
          </p>
        ) : view === 'outline' && item.views ? (
          <OutlineView
            sections={item.views.outline}
            rtl={rtl}
            onJump={jumpToHeading}
            onCopySection={(s) =>
              copyPlain([s.title, s.body].filter(Boolean).join('\n'))
                .then(() => {
                  recordCopy(item.slug, 'outline');
                  trackFeed('prompt_copied', { view: 'outline', form: item.form });
                  toast.success('Section copied');
                })
                .catch(() => toast.error('Select and copy manually'))
            }
          />
        ) : view === 'variables' ? (
          <VariablesView item={item} rtl={rtl} mode={legend} idPrefix={regionId} focusName={focusVariable} onFilled={onFilled} />
        ) : view === 'steps' ? (
          <StepsView item={item} rtl={rtl} />
        ) : (
          <div ref={textRef}>
            <PromptText
              text={item.text ?? ''}
              structure={{ sections: item.structure.sections }}
              rtl={rtl}
              mode={legend}
              idPrefix={regionId}
              onVariable={onVariable}
              onFallback={() => setPlainFallback(true)}
            />
          </div>
        )}
      </div>

      <ReaderFooter item={item} onShare={share} onOpenRelated={onOpenRelated} />
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}

export function ReaderRegion(props: ReaderRegionProps) {
  const reduced = !!useReducedMotion();
  const [settled, setSettled] = useState(false);
  if (props.focusMode && props.open) return <ReaderBody {...props} />;
  return (
    <AnimatePresence initial={false}>
      {props.open && (
        <motion.div
          key="reader"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0, transition: readerTransition(false, reduced) }}
          transition={readerTransition(true, reduced)}
          onAnimationStart={() => setSettled(false)}
          onAnimationComplete={() => setSettled(true)}
          // overflow hidden only while the height animates: a sticky bar needs a visible ancestor
          style={{ overflow: settled ? 'visible' : 'hidden' }}
          data-testid="reader-motion"
        >
          <ReaderBody {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
