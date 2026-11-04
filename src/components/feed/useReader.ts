'use client';

/**
 * R2 — reader state for a feed column: which prompt is open, keyboard (j / k / Esc / c / f),
 * URL sync (`?p=<slug>` through history.replaceState, one pushState on the first open so
 * the back button closes the reader and not the feed), settings and analytics.
 *
 * Pure UI state: nothing here touches the network. `readable` is the ordered list of
 * slugs that can open (link cards are excluded by the caller, so j/k skip them).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackFeed, type ReaderOpenMethod } from '@/lib/feed/analytics';

export interface ReaderSettings {
  /** Several readers may stay open at once (default: one at a time). */
  keepOpen: boolean;
  /** Collapse a reader once the user scrolled 60 % past its bottom (default: phones only). */
  softCollapse: boolean;
}

export const READER_SETTINGS_KEY = 'pt.reader.settings';
export const READER_LEGEND_KEY = 'pt.reader.legend';
export const FOCUS_MODE_MIN_WIDTH = 1024;

export function defaultSettings(): ReaderSettings {
  const phone = typeof window !== 'undefined' && window.innerWidth < FOCUS_MODE_MIN_WIDTH;
  return { keepOpen: false, softCollapse: phone };
}

export function loadSettings(): ReaderSettings {
  const base = defaultSettings();
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(READER_SETTINGS_KEY) : null;
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return { ...base, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return base;
  }
}

function saveSettings(s: ReaderSettings) {
  try {
    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

/** `?p=` of the current URL (client only). */
export function slugFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('p');
}

function urlWith(slug: string | null): string {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('p', slug);
  else url.searchParams.delete('p');
  return url.pathname + url.search + url.hash;
}

interface HistoryState {
  ptReader?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  return !!el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="menu"]');
}

export interface ReaderController {
  /** Open readers, in opening order; the last one is the active reader. */
  openSlugs: string[];
  active: string | null;
  focusMode: boolean;
  settings: ReaderSettings;
  /** Increments when `c` is pressed (the active reader copies). */
  copyTick: number;
  /** Last method used to open the active reader (scroll logic reads it). */
  lastMethod: ReaderOpenMethod | null;
  isOpen: (slug: string) => boolean;
  open: (slug: string, method: ReaderOpenMethod) => void;
  toggle: (slug: string, method: ReaderOpenMethod) => void;
  close: (slug?: string, reason?: string) => void;
  move: (dir: 1 | -1, method: ReaderOpenMethod, fromSlug?: string) => boolean;
  setSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
}

export interface UseReaderOptions {
  /** Changing this (tab, filters) closes every reader without touching history. */
  resetKey: string;
  /** Slug to open on mount without a history push (deep link); a new value opens again. */
  initialSlug?: string | null;
  /** j / swipe / arrow past the last readable item (the column fetches the next page). */
  onEnd?: (dir: 1 | -1, method: ReaderOpenMethod) => void;
}

export function useReader(readable: string[], { resetKey, initialSlug, onEnd }: UseReaderOptions): ReaderController {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [focusMode, setFocusMode] = useState(false);
  const [copyTick, setCopyTick] = useState(0);
  const [lastMethod, setLastMethod] = useState<ReaderOpenMethod | null>(null);
  const openedAt = useRef<Map<string, number>>(new Map());
  const readableRef = useRef(readable);
  readableRef.current = readable;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const openRef = useRef(openSlugs);
  openRef.current = openSlugs;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => setSettings(loadSettings()), []);

  const syncUrl = useCallback((slug: string | null, push: boolean) => {
    if (typeof window === 'undefined') return;
    const state: HistoryState = { ...(window.history.state ?? {}), ptReader: !!slug };
    try {
      if (push) window.history.pushState(state, '', urlWith(slug));
      else window.history.replaceState(state, '', urlWith(slug));
    } catch {
      /* ignore */
    }
  }, []);

  const closeSlug = useCallback((slug: string, reason: string) => {
    const started = openedAt.current.get(slug);
    if (started) {
      trackFeed('reader_closed', { slug, reason, dwell_ms: Math.max(0, Math.round(performance.now() - started)) });
      openedAt.current.delete(slug);
    }
  }, []);

  const open = useCallback(
    (slug: string, method: ReaderOpenMethod, opts: { history?: 'push' | 'replace' | 'none' } = {}) => {
      const current = openRef.current;
      if (current.includes(slug) && current[current.length - 1] === slug) return;
      const keep = settingsRef.current.keepOpen;
      const next = keep ? [...current.filter((s) => s !== slug), slug] : [slug];
      if (!keep) for (const s of current) if (s !== slug) closeSlug(s, 'replaced');
      openedAt.current.set(slug, performance.now());
      trackFeed('reader_opened', { slug, from: method });
      setLastMethod(method);
      setOpenSlugs(next);
      const mode = opts.history ?? (current.length === 0 ? 'push' : 'replace');
      if (mode !== 'none') syncUrl(slug, mode === 'push');
    },
    [closeSlug, syncUrl]
  );

  const close = useCallback(
    (slug?: string, reason = 'button') => {
      const current = openRef.current;
      const target = slug ?? current[current.length - 1];
      if (!target || !current.includes(target)) return;
      closeSlug(target, reason);
      const next = current.filter((s) => s !== target);
      setOpenSlugs(next);
      const active = next[next.length - 1] ?? null;
      if (reason === 'popstate' || reason === 'filters') return;
      if (typeof window === 'undefined') return;
      const state = window.history.state as HistoryState | null;
      if (!active && state?.ptReader && reason !== 'scroll') {
        // The first open pushed one entry; stepping back closes the reader and keeps the feed.
        window.history.back();
      } else {
        syncUrl(active, false);
      }
    },
    [closeSlug, syncUrl]
  );

  const move = useCallback(
    (dir: 1 | -1, method: ReaderOpenMethod, fromSlug?: string): boolean => {
      const list = readableRef.current;
      if (!list.length) return false;
      const current = openRef.current;
      const from = fromSlug ?? current[current.length - 1];
      let index = from ? list.indexOf(from) : -1;
      if (index === -1) index = dir === 1 ? -1 : list.length;
      const target = list[index + dir];
      if (!target) return false;
      if (from) trackFeed('reader_next', { method, direction: dir === 1 ? 'next' : 'prev' });
      open(target, method);
      return true;
    },
    [open]
  );

  const toggle = useCallback(
    (slug: string, method: ReaderOpenMethod) => {
      if (openRef.current.includes(slug)) close(slug, 'toggle');
      else open(slug, method);
    },
    [close, open]
  );

  const setSetting = useCallback(<K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  // Deep link: open without a push (the entry is the one the visitor arrived on).
  const lastInitial = useRef<string | null>(null);
  useEffect(() => {
    if (!initialSlug || lastInitial.current === initialSlug) return;
    if (!readableRef.current.includes(initialSlug)) return;
    lastInitial.current = initialSlug;
    open(initialSlug, 'deeplink', { history: 'replace' });
  }, [initialSlug, open, readable]);

  // Tab / filter change closes everything (URL already lost `?p=` through router.replace).
  const firstReset = useRef(true);
  useEffect(() => {
    if (firstReset.current) {
      firstReset.current = false;
      return;
    }
    for (const s of openRef.current) closeSlug(s, 'filters');
    setOpenSlugs([]);
  }, [resetKey, closeSlug]);

  // Back / forward: the URL decides.
  useEffect(() => {
    const onPop = () => {
      const slug = slugFromLocation();
      const current = openRef.current;
      if (slug && readableRef.current.includes(slug)) {
        if (current[current.length - 1] !== slug) open(slug, 'deeplink', { history: 'none' });
      } else if (current.length) {
        for (const s of current) closeSlug(s, 'popstate');
        setOpenSlugs([]);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [open, closeSlug]);

  // Keyboard: j / k move, Esc closes, c copies, f toggles focus mode (desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const active = openRef.current[openRef.current.length - 1];
      switch (e.key) {
        case 'j':
          e.preventDefault();
          if (!move(1, 'j')) onEndRef.current?.(1, 'j');
          break;
        case 'k':
          e.preventDefault();
          move(-1, 'k');
          break;
        case 'Escape':
          if (active) {
            e.preventDefault();
            close(active, 'esc');
          }
          break;
        case 'c':
          if (active) setCopyTick((n) => n + 1);
          break;
        case 'f':
          if (active && window.innerWidth >= FOCUS_MODE_MIN_WIDTH) setFocusMode((v) => !v);
          break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [move, close]);

  const active = openSlugs[openSlugs.length - 1] ?? null;
  const isOpen = useCallback((slug: string) => openSlugs.includes(slug), [openSlugs]);

  return useMemo(
    () => ({ openSlugs, active, focusMode: focusMode && !!active, settings, copyTick, lastMethod, isOpen, open, toggle, close, move, setSetting }),
    [openSlugs, active, focusMode, settings, copyTick, lastMethod, isOpen, open, toggle, close, move, setSetting]
  );
}
