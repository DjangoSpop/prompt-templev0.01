/**
 * Synthetic feed items in the live API shape (see `fixtures/*.json`, captured from
 * api.prompt-temple.com on 2026-10-30). 60 items span every form and length bucket.
 */
import { PROMPT_FORMS, type PromptForm } from '@/lib/feed/types';

const LENGTHS = ['xs', 's', 'm', 'l', 'xl'] as const;
const CATEGORIES = [
  ['coding-development', 'Coding & Development'],
  ['marketing-sales', 'Marketing & Sales'],
  ['writing-content', 'Writing & Content'],
] as const;

export interface RawItem {
  [key: string]: unknown;
  id: string;
  slug: string;
  title: string;
  form: PromptForm;
}

export function makeItem(i: number, overrides: Partial<RawItem> = {}): RawItem {
  const form = PROMPT_FORMS[i % PROMPT_FORMS.length];
  const [catSlug, catName] = CATEGORIES[i % CATEGORIES.length];
  const hex = (0x10000000 + i).toString(16);
  const structured = ['system_prompt', 'chain', 'long_form', 'template_vars'].includes(form);
  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    slug: `${catSlug}/prompt/prompt-${i}-${hex}`,
    title: `Prompt ${i}`,
    category: catName,
    subcategory: null,
    form,
    length_bucket: LENGTHS[i % LENGTHS.length],
    word_count: 50 + i * 20,
    reading_time_sec: 15 + i * 6,
    tldr: i % 2 ? `TL;DR for prompt ${i}` : null,
    preview: `Preview of prompt ${i}`,
    structure: {
      sections: structured ? [{ title: 'Role' }, { title: 'Rules' }, { title: 'Output format' }] : [],
      variables: form === 'template_vars' ? ['name', 'company'] : [],
      steps: form === 'chain' ? 4 : 0,
    },
    model_family: 'any',
    language: 'en',
    stats: { likes: i, saves: 0, forks: 0, copies: 0, applies: 0, views_7d: 0, trending_rank: i < 60 ? i + 1 : null },
    viewer: { liked: false, saved: false, forked: false },
    attribution: { source: 'github:acme/prompts', license: 'MIT', author: null, url: 'https://github.com/acme/prompts' },
    collections: i === 0 ? ['sota'] : [],
    created_at: '2026-10-09T16:09:09Z',
    updated_at: '2026-10-09T16:09:09Z',
    ...overrides,
  };
}

export const SIXTY_ITEMS: RawItem[] = Array.from({ length: 60 }, (_, i) => makeItem(i));

export function makeDetail(item: RawItem, overrides: Record<string, unknown> = {}) {
  return {
    ...item,
    text: `You are a reviewer for {{name}} at {{company}}.\n\n## Rules\nBe strict.`,
    text_available: true,
    views: null,
    fork_of: null,
    related: [],
    ...overrides,
  };
}
