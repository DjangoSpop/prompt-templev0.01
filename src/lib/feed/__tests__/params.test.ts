import { describe, expect, it } from 'vitest';
import { isIndexableFeedUrl, normalizeFilters, parseFeedQuery, serializeFeedQuery, toApiParams, toggleFilterValue } from '../params';

describe('feed URL state', () => {
  it('round-trips tab and multi-select filters', () => {
    const q = parseFeedQuery(new URLSearchParams('tab=top&form=chain,system_prompt&language=ar'));
    expect(q).toEqual({ tab: 'top', filters: { form: ['chain', 'system_prompt'], language: ['ar'] } });
    expect(parseFeedQuery(new URLSearchParams(serializeFeedQuery(q).slice(1)))).toEqual(q);
  });

  it('defaults to trending and drops unknown tabs', () => {
    expect(parseFeedQuery(new URLSearchParams('tab=nope')).tab).toBe('trending');
    expect(serializeFeedQuery({ tab: 'trending', filters: {} })).toBe('');
  });

  it('builds API params with comma-joined facets, cursor and limit', () => {
    const sp = toApiParams({ tab: 'new', filters: { form: ['chain', 'long_form'] } }, 'abc');
    expect(sp.get('tab')).toBe('new');
    expect(sp.get('form')).toBe('chain,long_form');
    expect(sp.get('cursor')).toBe('abc');
    expect(sp.get('limit')).toBe('20');
  });

  it('toggles a value within a facet', () => {
    const one = toggleFilterValue({}, 'form', 'chain');
    expect(toggleFilterValue(one, 'form', 'long_form')).toEqual({ form: ['chain', 'long_form'] });
    expect(toggleFilterValue(one, 'form', 'chain')).toEqual({});
  });

  it('normalizes filter order for cache keys', () => {
    expect(normalizeFilters({ form: ['b', 'a'] })).toEqual({ form: ['a', 'b'] });
  });

  it('only bare /feed and ?tab=trending are indexable', () => {
    expect(isIndexableFeedUrl({})).toBe(true);
    expect(isIndexableFeedUrl({ tab: 'trending' })).toBe(true);
    expect(isIndexableFeedUrl({ tab: 'new' })).toBe(false);
    expect(isIndexableFeedUrl({ form: 'chain' })).toBe(false);
    expect(isIndexableFeedUrl({ cursor: 'x' })).toBe(false);
  });
});
