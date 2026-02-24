/**
 * Lightweight analytics tracker for viral events.
 * Fires to the backend /api/v2/analytics/track/ and also to client-side event bus.
 */

export type ViralEvent =
  | 'hero_demo_interact'
  | 'optimization_complete'
  | 'wow_score_high'
  | 'share_card_generated'
  | 'share_card_clicked'
  | 'paywall_triggered'
  | 'upgrade_modal_open'
  | 'upgrade_completed'
  | 'referral_link_created'
  | 'template_used'
  | 'streak_milestone'
  | 'page_view';

interface EventPayload {
  event: ViralEvent;
  properties?: Record<string, string | number | boolean>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com';
const QUEUE: EventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (!QUEUE.length) return;
  const batch = QUEUE.splice(0, QUEUE.length);

  // Fire-and-forget — don't block UI
  const token = getToken();
  fetch(`${API_BASE}/api/v2/analytics/track/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ events: batch }),
    keepalive: true,
  }).catch(() => {
    // Silently fail — analytics should never block production
  });
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('access_token') ||
    null
  );
}

export function trackEvent(event: ViralEvent, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;

  QUEUE.push({ event, properties });

  // Debounce flush
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 400);
}

/** Convenience: track a page view */
export function trackPageView(page: string) {
  trackEvent('page_view', { page });
}

/** Convenience: track optimization complete + auto-trigger high score */
export function trackOptimization(score: number, improvements: number) {
  trackEvent('optimization_complete', { score, improvements });
  if (score >= 7.5) {
    trackEvent('wow_score_high', { score });
  }
}
