/**
 * F5 — remember an anonymous visitor's intended reaction across sign-up.
 *
 * `{slug, kind, ts}` in sessionStorage; discarded after one hour. Replayed once by
 * `usePendingReactionReplay()` when `isAuthenticated` flips to true.
 */
import type { ReactionKind } from './types';

export const PENDING_REACTION_KEY = 'pt.feed.pending_reaction';
export const PENDING_REACTION_TTL_MS = 60 * 60 * 1000;

export interface PendingReaction {
  slug: string;
  kind: ReactionKind;
  ts: number;
  /** Where to return after auth (pathname + search). */
  returnTo?: string;
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function setPendingReaction(p: Omit<PendingReaction, 'ts'> & { ts?: number }): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PENDING_REACTION_KEY, JSON.stringify({ ...p, ts: p.ts ?? Date.now() }));
  } catch {
    /* quota / private mode — intent is best-effort */
  }
}

export function getPendingReaction(now: number = Date.now()): PendingReaction | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PENDING_REACTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingReaction>;
    if (!parsed || typeof parsed.slug !== 'string' || (parsed.kind !== 'like' && parsed.kind !== 'save')) {
      s.removeItem(PENDING_REACTION_KEY);
      return null;
    }
    const ts = typeof parsed.ts === 'number' ? parsed.ts : 0;
    if (now - ts > PENDING_REACTION_TTL_MS) {
      s.removeItem(PENDING_REACTION_KEY);
      return null;
    }
    return { slug: parsed.slug, kind: parsed.kind, ts, returnTo: parsed.returnTo };
  } catch {
    return null;
  }
}

export function clearPendingReaction(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PENDING_REACTION_KEY);
  } catch {
    /* ignore */
  }
}

/** sessionStorage-backed values for the Variables view, keyed per slug (F3). */
export const VARIABLE_VALUES_PREFIX = 'pt.feed.vars.';

export function loadVariableValues(slug: string): Record<string, string> {
  const s = storage();
  if (!s) return {};
  try {
    const raw = s.getItem(VARIABLE_VALUES_PREFIX + slug);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveVariableValues(slug: string, values: Record<string, string>): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(VARIABLE_VALUES_PREFIX + slug, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}
