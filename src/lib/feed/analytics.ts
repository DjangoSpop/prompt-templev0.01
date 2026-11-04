/**
 * Sprint 08 — feed events (F6). Thin layer over `trackEvent`; never sends prompt text.
 *
 * `feed_item_impression` fires once per item per session, after the card has been at
 * least 50 % visible for 1 s, and is sampled 1-in-5 for anonymous visitors.
 */
import { trackEvent } from '@/lib/analytics/trackEvent';

type Props = Record<string, string | number | boolean>;
type FeedEvent =
  | 'feed_viewed'
  | 'feed_item_impression'
  | 'prompt_opened'
  | 'prompt_reacted'
  | 'prompt_copied'
  | 'prompt_forked'
  | 'prompt_view_switched'
  | 'feed_filter_applied'
  // Sprint 09 reader (R5); dwell_ms on reader_closed is the retention metric
  | 'reader_opened'
  | 'reader_closed'
  | 'reader_next'
  | 'reader_view_switched'
  | 'reader_legend';

export type ReaderOpenMethod = 'tap' | 'j' | 'k' | 'swipe' | 'deeplink' | 'arrow' | 'outline';

export function trackFeed(event: FeedEvent, props: Props = {}): void {
  try {
    trackEvent(event, props);
  } catch {
    /* analytics must never break the feed */
  }
}

const IMPRESSIONS_KEY = 'pt.feed.impressions';
const ANONYMOUS_SAMPLE_RATE = 0.2;
let seen: Set<string> | null = null;

function seenSet(): Set<string> {
  if (seen) return seen;
  seen = new Set();
  try {
    const raw = sessionStorage.getItem(IMPRESSIONS_KEY);
    if (raw) for (const id of JSON.parse(raw) as string[]) seen.add(id);
  } catch {
    /* private mode */
  }
  return seen;
}

/** Returns true when the impression was recorded (first time this session, sampled in). */
export function trackImpression(
  itemId: string,
  props: { tab: string; position: number; form: string },
  authed: boolean,
  random: () => number = Math.random
): boolean {
  const set = seenSet();
  if (set.has(itemId)) return false;
  set.add(itemId);
  try {
    sessionStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {
    /* ignore */
  }
  if (!authed && random() >= ANONYMOUS_SAMPLE_RATE) return false;
  trackFeed('feed_item_impression', { item_id: itemId, ...props });
  return true;
}

/** Test helper: forget the in-memory impression set. */
export function resetImpressionsForTests(): void {
  seen = null;
}
