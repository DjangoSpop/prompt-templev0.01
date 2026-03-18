/** Landing page analytics events */

export const LANDING_EVENTS = {
  // Hero
  HERO_SEARCH_INTERACT: 'hero_search_interact',
  HERO_SEARCH_QUERY: 'hero_search_query',
  HERO_CTA_CLICK: 'hero_cta_click',
  // Problem
  PROBLEM_SECTION_VIEWED: 'problem_section_viewed',
  // Transformer
  TRANSFORMER_INPUT: 'transformer_input',
  TRANSFORMER_SUBMIT: 'transformer_submit',
  TRANSFORMER_RESULT_VIEWED: 'transformer_result_viewed',
  TRANSFORMER_SHARE: 'transformer_share',
  TRANSFORMER_TRY_ANOTHER: 'transformer_try_another',
  // How it works
  HOW_IT_WORKS_VIEWED: 'howit_works_viewed',
  // Library
  LIBRARY_SEARCH: 'library_search',
  LIBRARY_CARD_CLICK: 'library_card_click',
  LIBRARY_SCRIBE_COPY: 'library_scribe_copy',
  // Playground
  PLAYGROUND_INPUT: 'playground_input',
  PLAYGROUND_ENHANCE: 'playground_enhance',
  PLAYGROUND_ENHANCE_FURTHER: 'playground_enhance_further',
  PLAYGROUND_SCRIBE_COPY: 'playground_scribe_copy',
  PLAYGROUND_SHARE: 'playground_share',
  PLAYGROUND_PAYWALL_HIT: 'playground_paywall_hit',
  // Extension
  EXTENSION_SHOWCASE_VIEWED: 'extension_showcase_viewed',
  EXTENSION_CTA_CLICK: 'extension_cta_click',
  // Social
  SOCIAL_PROOF_VIEWED: 'social_proof_viewed',
  // CTA
  FINAL_CTA_CLICK: 'final_cta_click',
  STICKY_BAR_CTA_CLICK: 'sticky_bar_cta_click',
  STICKY_BAR_DISMISSED: 'sticky_bar_dismissed',
  // v2 Hero
  HERO_OPTIMIZER_SUBMIT: 'hero_optimizer_submit',
  HERO_OPTIMIZER_COPY: 'hero_optimizer_copy',
  HERO_TAB_SWITCH: 'hero_tab_switch',
  // v2 Template Search
  TEMPLATE_SEARCH_QUERY: 'template_search_query',
  TEMPLATE_SEARCH_CATEGORY: 'template_search_category',
  TEMPLATE_SEARCH_USE: 'template_search_use',
  // v2 Feature Showcase
  FEATURE_TAB_SWITCH: 'feature_tab_switch',
  FEATURE_SECTION_VIEWED: 'feature_section_viewed',
  // Scroll depth
  SCROLL_DEPTH_25: 'scroll_depth_25',
  SCROLL_DEPTH_50: 'scroll_depth_50',
  SCROLL_DEPTH_75: 'scroll_depth_75',
  SCROLL_DEPTH_100: 'scroll_depth_100',
  // Time on page
  TIME_ON_PAGE_30S: 'time_on_page_30s',
  TIME_ON_PAGE_90S: 'time_on_page_90s',
} as const;

type EventName = (typeof LANDING_EVENTS)[keyof typeof LANDING_EVENTS];

/**
 * Track a landing page event. Wraps whatever analytics provider is configured.
 * Safe to call anywhere — silently no-ops if analytics unavailable.
 */
export function trackLanding(event: EventName, properties?: Record<string, unknown>): void {
  try {
    // Fire to window.gtag (GA4) if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag(
        'event',
        event,
        properties
      );
    }

    // Fire custom event for any listener (PostHog, Mixpanel, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pt:analytics', { detail: { event, properties } })
      );
    }
  } catch {
    // Silently ignore analytics errors
  }
}
