/**
 * Sprint 08 — Feed API contract (frontend doc §2), checked against the live API
 * (backend `apps/feed`, 2026-10-30).
 *
 * Every response from `/api/v2/feed/*` is parsed through these zod schemas before it
 * reaches React Query. Schemas are deliberately tolerant (`.catch`, `.default`,
 * `.passthrough`) so a slightly different backend shape degrades to a usable item
 * instead of a blank feed.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const FEED_TABS = ['trending', 'new', 'top', 'for_you'] as const;
export type FeedTab = (typeof FEED_TABS)[number];

export const PROMPT_FORMS = [
  'system_prompt',
  'chain',
  'template_vars',
  'long_form',
  'conversation',
  'short',
  'one_liner',
] as const;
export type PromptForm = (typeof PROMPT_FORMS)[number];

/** Forms that carry a structure strip on the card (F2 §4). */
export const STRUCTURED_FORMS: ReadonlySet<PromptForm> = new Set([
  'long_form',
  'system_prompt',
  'chain',
  'template_vars',
]);

export const FORM_LABELS: Record<PromptForm, string> = {
  system_prompt: 'System prompt',
  chain: 'Chain',
  template_vars: 'Template',
  long_form: 'Long-form',
  conversation: 'Conversation',
  short: 'Short',
  one_liner: 'One-liner',
};

export const LENGTH_LABELS: Record<string, string> = {
  xs: 'Tiny',
  s: 'Short',
  m: 'Medium',
  l: 'Long',
  xl: 'Very long',
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
  very_long: 'Very long',
};

export const REACTION_KINDS = ['like', 'save'] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

export const FACET_KEYS = ['form', 'length', 'category', 'model_family', 'language'] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const idSchema = z.union([z.string(), z.number()]).transform((v) => String(v));
const nullableString = z.string().nullable().optional().transform((v) => v ?? null);
const nonNegInt = z.number().int().nonnegative().catch(0);

/** `["Intro", {title: "Rules"}]` → `["Intro", "Rules"]` */
const titleListSchema = z
  .array(
    z.union([
      z.string(),
      z
        .object({ title: z.string().optional(), name: z.string().optional() })
        .passthrough()
        .transform((o) => o.title ?? o.name ?? ''),
    ])
  )
  .catch([])
  .transform((arr) => arr.filter((s) => s.length > 0));

const formSchema = z.enum(PROMPT_FORMS).catch('long_form');

// ---------------------------------------------------------------------------
// Prompt views (Sprint 09: inline on every FeedItem; null when PROMPT_VIEWS_ENABLED is off)
// ---------------------------------------------------------------------------

export const outlineSectionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().catch('').default(''),
    body: z.string().catch('').default(''),
    level: z.number().int().min(1).max(6).catch(2).default(2),
  })
  .passthrough();
export type OutlineSection = z.infer<typeof outlineSectionSchema>;

export const promptVariableSchema = z
  .object({
    name: z.string().min(1),
    hint: nullableString,
    placeholder: nullableString,
    default: nullableString,
    required: z.boolean().catch(false).default(false),
    occurrences: nonNegInt.default(0),
  })
  .passthrough();
export type PromptVariable = z.infer<typeof promptVariableSchema>;

/** Backend sends `{n, text}`; `{index, title, body}` is accepted too. */
export const promptStepSchema = z
  .object({
    index: z.number().int().optional(),
    n: z.number().int().optional(),
    title: z.string().catch('').default(''),
    body: z.string().catch('').default(''),
    text: z.string().optional(),
  })
  .passthrough()
  .transform(({ n, text, ...step }) => ({ ...step, index: step.index ?? n, body: step.body || text || '' }));
export type PromptStep = z.infer<typeof promptStepSchema>;

/** Accept `["a","b"]` or `[{name:"a"}]` for variables. */
const variableListSchema = z
  .array(
    z.union([
      z.string().transform((name) => ({ name, hint: null, placeholder: null, default: null, required: false, occurrences: 0 })),
      promptVariableSchema,
    ])
  )
  .catch([]);

/** Accept `{sections:[...]}` or `[...]` for outline. */
const outlineSchema = z
  .union([
    z.array(outlineSectionSchema),
    z.object({ sections: z.array(outlineSectionSchema) }).transform((o) => o.sections),
  ])
  .catch([]);

/** Accept `["step"]` or `[{title, body}]` for steps. */
const stepListSchema = z
  .array(z.union([z.string().transform((body) => ({ index: undefined as number | undefined, title: '', body })), promptStepSchema]))
  .catch([]);

export const promptViewsSchema = z
  .object({
    outline: outlineSchema.default([]),
    variables: variableListSchema.default([]),
    steps: stepListSchema.default([]),
    compact: z.string().nullable().catch(null).default(null),
  })
  .passthrough();
export type PromptViews = z.infer<typeof promptViewsSchema>;

// ---------------------------------------------------------------------------
// FeedItem
// ---------------------------------------------------------------------------

export const structureSchema = z
  .object({
    sections: titleListSchema.default([]),
    variables: titleListSchema.default([]),
    steps: nonNegInt.default(0),
  })
  .passthrough()
  .catch({ sections: [], variables: [], steps: 0 });

export const statsSchema = z
  .object({
    likes: nonNegInt.default(0),
    saves: nonNegInt.default(0),
    forks: nonNegInt.default(0),
    copies: nonNegInt.default(0),
    applies: nonNegInt.default(0),
    views_7d: nonNegInt.default(0),
    trending_rank: z.number().int().positive().nullable().catch(null).default(null),
  })
  .passthrough()
  .catch({ likes: 0, saves: 0, forks: 0, copies: 0, applies: 0, views_7d: 0, trending_rank: null });

export const viewerSchema = z
  .object({
    liked: z.boolean().catch(false).default(false),
    saved: z.boolean().catch(false).default(false),
    forked: z.boolean().catch(false).default(false),
  })
  .passthrough()
  .catch({ liked: false, saved: false, forked: false });

export const attributionSchema = z
  .object({
    source: nullableString,
    license: nullableString,
    author: nullableString,
    url: nullableString,
  })
  .passthrough()
  .nullable()
  .catch(null)
  .transform((a) => a ?? { source: null, license: null, author: null, url: null });

export const feedItemSchema = z
  .object({
    id: idSchema,
    slug: z.string().min(1),
    title: z.string().min(1),
    category: z.string().catch('general').default('general'),
    subcategory: nullableString,
    form: formSchema.default('long_form'),
    length_bucket: z.string().catch('m').default('m'),
    word_count: nonNegInt.default(0),
    reading_time_sec: nonNegInt.default(0),
    tldr: nullableString,
    preview: z.string().catch('').default(''),
    structure: structureSchema.default({ sections: [], variables: [], steps: 0 }),
    model_family: nullableString,
    language: z.string().catch('en').default('en'),
    stats: statsSchema.default({
      likes: 0,
      saves: 0,
      forks: 0,
      copies: 0,
      applies: 0,
      views_7d: 0,
      trending_rank: null,
    }),
    viewer: viewerSchema.default({ liked: false, saved: false, forked: false }),
    attribution: attributionSchema.default(null),
    collections: z.array(z.string()).catch([]).default([]),
    text_available: z.boolean().catch(true).default(true),
    // Sprint 09 R1 / B7: full text and precomputed views travel with the item, so opening
    // a prompt is a cache read. `text: null` with `text_available: true` means B7 is not
    // deployed (or FEED_INLINE_TEXT_CAP=0) and the reader fetches the detail once on open.
    text: z.string().nullable().catch(null).default(null),
    text_truncated: z.boolean().catch(false).default(false),
    views: promptViewsSchema.nullable().catch(null).default(null),
    created_at: z.string().catch('').default(''),
    updated_at: z.string().catch('').default(''),
  })
  .passthrough();

export type FeedItem = z.infer<typeof feedItemSchema>;
export type FeedStats = FeedItem['stats'];
export type FeedViewer = FeedItem['viewer'];
export type FeedAttribution = FeedItem['attribution'];

export const forkOfSchema = z
  .object({
    slug: z.string(),
    title: z.string().catch('').default(''),
    category: z.string().catch('general').default('general'),
  })
  .passthrough()
  .nullable()
  .catch(null);

export const feedPromptDetailSchema = feedItemSchema.extend({
  related: z.array(feedItemSchema).catch([]).default([]),
  fork_of: forkOfSchema.default(null),
});
export type FeedPromptDetail = z.infer<typeof feedPromptDetailSchema>;

// ---------------------------------------------------------------------------
// List envelopes
// ---------------------------------------------------------------------------

export const feedPageSchema = z
  .object({
    results: z.array(feedItemSchema).catch([]).default([]),
    next_cursor: z.string().nullable().catch(null).default(null),
    tab_fallback: z.enum(FEED_TABS).optional().catch(undefined),
  })
  .passthrough();
export type FeedPage = z.infer<typeof feedPageSchema>;

export const facetValueSchema = z
  .object({
    value: z.union([z.string(), z.number()]).transform(String),
    label: z.string().optional(),
    count: nonNegInt.default(0),
  })
  .passthrough();
export type FacetValue = z.infer<typeof facetValueSchema>;

const facetListSchema = z.array(facetValueSchema).catch([]).default([]);

/** Backend keys are plural (`forms`, `lengths`, `categories`, `model_families`, `languages`). */
const FACET_RESPONSE_KEYS: Record<FacetKey, string> = {
  form: 'forms',
  length: 'lengths',
  category: 'categories',
  model_family: 'model_families',
  language: 'languages',
};

/** `GET /feed/filters/` — plural backend keys, `{facets:{...}}` or singular keys all map to FacetKey. */
export const feedFiltersSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== 'object') return raw;
    const r = ((raw as Record<string, unknown>).facets ?? raw) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of FACET_KEYS) out[key] = r[FACET_RESPONSE_KEYS[key]] ?? r[key];
    return out;
  },
  z
    .object({
      form: facetListSchema,
      length: facetListSchema,
      category: facetListSchema,
      model_family: facetListSchema,
      language: facetListSchema,
    })
    .passthrough()
);
export type FeedFilters = z.infer<typeof feedFiltersSchema>;

export const collectionSummarySchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().catch('').default(''),
    description: z.string().nullable().catch(null).default(null),
    count: nonNegInt.default(0),
  })
  .passthrough();
export type CollectionSummary = z.infer<typeof collectionSummarySchema>;

/** `GET /feed/collections/` — accept `[...]` or `{results:[...]}`. */
export const collectionsListSchema = z.preprocess(
  (raw) => (Array.isArray(raw) ? raw : (raw as { results?: unknown })?.results ?? []),
  z.array(collectionSummarySchema).catch([])
);

/**
 * `GET /feed/collections/<slug>/?cursor=` — the collection header may be nested under
 * `collection` or spread at the top level next to `results`.
 */
export const collectionPageSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== 'object') return raw;
    const r = raw as Record<string, unknown>;
    const header = (r.collection as Record<string, unknown> | undefined) ?? {
      slug: r.slug,
      title: r.title,
      description: r.description,
      count: r.count,
    };
    return { collection: header, results: r.results, next_cursor: r.next_cursor };
  },
  z
    .object({
      collection: collectionSummarySchema,
      results: z.array(feedItemSchema).catch([]).default([]),
      next_cursor: z.string().nullable().catch(null).default(null),
    })
    .passthrough()
);
export type CollectionPage = z.infer<typeof collectionPageSchema>;

export const reactResponseSchema = z
  .object({
    kind: z.enum(REACTION_KINDS),
    active: z.boolean(),
    stats: statsSchema,
  })
  .passthrough();
export type ReactResponse = z.infer<typeof reactResponseSchema>;

/** Fork returns `201 {slug, id, fork_of}`; `slug`/`id` are the new private SavedPrompt's id. */
export const forkResponseSchema = z
  .object({
    slug: z.string().min(1),
    id: idSchema.optional(),
    fork_of: z.string().nullable().catch(null).default(null),
    category: z.string().optional(),
    title: z.string().optional(),
  })
  .passthrough();
export type ForkResponse = z.infer<typeof forkResponseSchema>;

export const apiErrorBodySchema = z
  .object({
    detail: z.string().optional(),
    code: z.string().optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// URL filters (client-side shape, shared with the server page)
// ---------------------------------------------------------------------------

export type FeedFilterState = Partial<Record<FacetKey, string[]>>;

export interface FeedQuery {
  tab: FeedTab;
  filters: FeedFilterState;
}

// ---------------------------------------------------------------------------
// Derived helpers used by cards and pages
// ---------------------------------------------------------------------------

export function isStructuredForm(form: PromptForm): boolean {
  return STRUCTURED_FORMS.has(form);
}

export function formLabel(form: PromptForm): string {
  return FORM_LABELS[form] ?? FORM_LABELS.long_form;
}

export function lengthLabel(bucket: string): string {
  return LENGTH_LABELS[bucket] ?? bucket;
}

export function readingTimeLabel(seconds: number): string {
  if (!seconds || seconds < 45) return '< 1 min';
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

/** Metadata-only items (marketplace, Sprint 06 G2) render a link card and never a reader. */
export function isReadable(item: Pick<FeedItem, 'text_available'>): boolean {
  return item.text_available !== false;
}

/** The reader can open from cache alone (B7 deployed and the text not cut). */
export function hasInlineText(item: Pick<FeedItem, 'text' | 'text_truncated'>): boolean {
  return typeof item.text === 'string' && !item.text_truncated;
}

/** `/feed?p=<slug>` — the shareable reader link (R2.5). */
export function readerPath(item: Pick<FeedItem, 'slug'>): string {
  return `/feed?p=${encodeURIComponent(item.slug)}`;
}

export function isSota(item: Pick<FeedItem, 'collections'>): boolean {
  return item.collections.includes('sota');
}

export function isTopTrending(item: Pick<FeedItem, 'stats'>): boolean {
  const rank = item.stats.trending_rank;
  return typeof rank === 'number' && rank >= 1 && rank <= 10;
}

/**
 * Feed slugs are `<category-slug>/<subcategory-slug|prompt>/<title>-<8 hex>`, so the
 * prompt page is the catch-all `/prompts/[...slug]` (F3).
 */
export function promptPath(item: Pick<FeedItem, 'slug'>): string {
  return `/prompts/${item.slug.split('/').map(encodeURIComponent).join('/')}`;
}

/** `category` on an item is the display name; the slug's first segment is the category slug. */
export function categorySlug(item: Pick<FeedItem, 'slug'>): string {
  return item.slug.includes('/') ? item.slug.split('/')[0] : 'general';
}
