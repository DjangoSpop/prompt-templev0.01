import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/analytics/trackEvent', () => ({ trackEvent: vi.fn() }));

import { trackEvent } from '@/lib/analytics/trackEvent';
import { makeItem } from '@/mocks/feed/factory';
import { resetImpressionsForTests, trackImpression } from '../analytics';
import { toggleReaction } from '../hooks';
import { clearPendingReaction, getPendingReaction, PENDING_REACTION_TTL_MS, setPendingReaction } from '../pending';
import { feedItemSchema } from '../types';

describe('toggleReaction', () => {
  const item = feedItemSchema.parse(makeItem(3));

  it('flips the viewer flag and the count', () => {
    const liked = toggleReaction(item, 'like');
    expect(liked.viewer.liked).toBe(true);
    expect(liked.stats.likes).toBe(item.stats.likes + 1);
    const back = toggleReaction(liked, 'like');
    expect(back.viewer.liked).toBe(false);
    expect(back.stats.likes).toBe(item.stats.likes);
  });

  it('is a no-op when the target state is already set', () => {
    expect(toggleReaction(item, 'save', false)).toBe(item);
  });

  it('never goes below zero', () => {
    const odd = { ...item, viewer: { ...item.viewer, saved: true }, stats: { ...item.stats, saves: 0 } };
    expect(toggleReaction(odd, 'save').stats.saves).toBe(0);
  });
});

describe('pending reaction', () => {
  beforeEach(() => clearPendingReaction());

  it('stores and reads the intent', () => {
    setPendingReaction({ slug: 'a/b/c', kind: 'save' });
    expect(getPendingReaction()).toMatchObject({ slug: 'a/b/c', kind: 'save' });
  });

  it('expires after one hour', () => {
    setPendingReaction({ slug: 'a/b/c', kind: 'like', ts: 0 });
    expect(getPendingReaction(PENDING_REACTION_TTL_MS + 1)).toBeNull();
  });
});

describe('impressions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetImpressionsForTests();
    vi.mocked(trackEvent).mockClear();
  });

  it('fires once per item per session', () => {
    expect(trackImpression('x', { tab: 'trending', position: 1, form: 'chain' }, true)).toBe(true);
    expect(trackImpression('x', { tab: 'trending', position: 1, form: 'chain' }, true)).toBe(false);
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it('samples anonymous visitors 1-in-5', () => {
    expect(trackImpression('a', { tab: 'trending', position: 1, form: 'chain' }, false, () => 0.5)).toBe(false);
    expect(trackImpression('b', { tab: 'trending', position: 2, form: 'chain' }, false, () => 0.1)).toBe(true);
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });
});
