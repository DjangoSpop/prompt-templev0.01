/**
 * Onboarding analytics event definitions and tracker.
 *
 * Usage:
 *   import { trackOnboardingEvent } from '@/lib/analytics/onboarding-events';
 *   trackOnboardingEvent({ event: 'onboarding_started', trigger: 'first_login' });
 *
 * Compatible with Segment, PostHog, or any analytics provider that exposes
 * window.analytics.track(). Falls back to console.log in development.
 */

export type OnboardingEvent =
  | { event: 'onboarding_started'; trigger: 'first_login' | 'manual' | 'returning_user' | 'inactivity' | 'limit_hit' }
  | { event: 'onboarding_step_viewed'; step_id: string; step_index: number }
  | { event: 'onboarding_step_completed'; step_id: string; step_index: number; method: 'next' | 'skip' }
  | { event: 'onboarding_skipped'; at_step_id: string; at_step_index: number }
  | { event: 'onboarding_completed'; total_steps: number; duration_ms: number }
  | { event: 'upgrade_cta_shown'; context: 'tour_step' | 'limit_hit' | 'inactivity' | 'returning_user' }
  | { event: 'upgrade_cta_clicked'; plan: 'scribe' | 'guardian' | 'master'; context: string }
  | { event: 'trigger_fired'; trigger_type: 'returning_user' | 'inactivity' | 'limit_hit' }
  | { event: 'trigger_dismissed'; trigger_type: 'returning_user' | 'inactivity' | 'limit_hit' };

/**
 * Track an onboarding event.
 * - In production, emits to window.analytics (Segment / PostHog / etc.) if available.
 * - In development, always logs to console for easier debugging.
 */
export function trackOnboardingEvent(event: OnboardingEvent): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Onboarding Analytics]', event);
  }

  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win['analytics'] === 'object' && win['analytics'] !== null) {
      const analytics = win['analytics'] as { track: (name: string, props: Record<string, unknown>) => void };
      analytics.track(event.event, event as Record<string, unknown>);
    }
  }
}
