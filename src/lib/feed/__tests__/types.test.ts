/** Schemas against responses captured from the live API (src/mocks/feed/fixtures, 2026-10-30). */
import { describe, expect, it } from 'vitest';
import collectionSota from '@/mocks/feed/fixtures/collection_sota.json';
import collections from '@/mocks/feed/fixtures/collections.json';
import feedPage from '@/mocks/feed/fixtures/feed_page.json';
import filters from '@/mocks/feed/fixtures/filters.json';
import promptDetail from '@/mocks/feed/fixtures/prompt_detail.json';
import {
  categorySlug,
  collectionPageSchema,
  collectionsListSchema,
  feedFiltersSchema,
  feedPageSchema,
  feedPromptDetailSchema,
  forkResponseSchema,
  promptPath,
  promptViewsSchema,
  readingTimeLabel,
} from '../types';

describe('live API shapes', () => {
  it('parses a feed page', () => {
    const page = feedPageSchema.parse(feedPage);
    expect(page.results).toHaveLength(3);
    const item = page.results[0];
    expect(item.slug.split('/')).toHaveLength(3);
    expect(item.structure.sections.length).toBeGreaterThan(0);
    expect(typeof item.structure.sections[0]).toBe('string');
    expect(item.viewer).toEqual({ liked: false, saved: false, forked: false });
    expect(page.next_cursor).toEqual(expect.any(String));
  });

  it('maps the plural facet keys of /filters/', () => {
    const f = feedFiltersSchema.parse(filters);
    expect(f.form.map((v) => v.value)).toContain('system_prompt');
    expect(f.category.length).toBeGreaterThan(3);
    expect(f.length[0]).toMatchObject({ value: expect.any(String), count: expect.any(Number) });
    expect(f.language.map((v) => v.value)).toContain('en');
    expect(f.model_family.length).toBeGreaterThan(0);
  });

  it('parses collections and a collection page', () => {
    expect(collectionsListSchema.parse(collections)[0]).toMatchObject({ slug: 'sota', count: 200 });
    const page = collectionPageSchema.parse(collectionSota);
    expect(page.collection.title).toBe('State of the Art');
    expect(page.results.length).toBeGreaterThan(0);
  });

  it('parses a prompt detail with views off', () => {
    const d = feedPromptDetailSchema.parse(promptDetail);
    expect(d.text?.length).toBeGreaterThan(100);
    expect(d.views).toBeNull();
    expect(d.fork_of).toBeNull();
    expect(d.related).toHaveLength(6);
  });
});

describe('backend views and fork shapes', () => {
  it('parses views as built by prompt_views.build_views', () => {
    const v = promptViewsSchema.parse({
      outline: [{ title: 'Rules', body: '- be strict', start: 0, end: 20 }],
      variables: [{ name: 'name', occurrences: 2, default: null, hint: 'Write to … about' }],
      steps: [{ n: 1, text: 'Plan it.' }],
      compact: '# Title',
    });
    expect(v.outline[0]).toMatchObject({ title: 'Rules', body: '- be strict' });
    expect(v.variables[0]).toMatchObject({ name: 'name', occurrences: 2, hint: 'Write to … about' });
    expect(v.steps[0]).toMatchObject({ index: 1, body: 'Plan it.' });
  });

  it('parses the fork response', () => {
    expect(forkResponseSchema.parse({ slug: 'abc', id: 'abc', fork_of: 'a/b/c' })).toMatchObject({ slug: 'abc', id: 'abc', fork_of: 'a/b/c' });
  });
});

describe('helpers', () => {
  it('builds the catch-all prompt path and category slug', () => {
    const item = { slug: 'coding-development/debugging/fix-it-d8b2afab' };
    expect(promptPath(item)).toBe('/prompts/coding-development/debugging/fix-it-d8b2afab');
    expect(categorySlug(item)).toBe('coding-development');
  });

  it('labels reading time', () => {
    expect(readingTimeLabel(20)).toBe('< 1 min');
    expect(readingTimeLabel(406)).toBe('7 min');
  });
});
