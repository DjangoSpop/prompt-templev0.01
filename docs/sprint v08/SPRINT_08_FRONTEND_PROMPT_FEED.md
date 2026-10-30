# Sprint 08 — Frontend (Next.js): Prompt Feed, Long-Form Cards, Prompt Views

> **Goal:** Give www.prompt-temple.com a reason to be opened daily: a **feed of prompts**
> (trending / new / top / for you) with cards that make long prompts readable at a glance, a
> **prompt page** that can be read as outline, TL;DR, fillable variables or full text, and
> one-tap **like / save / fork / copy**. This is the first visible step of the "Facebook of
> prompts" position.
>
> **Posture: continue, do not restart.** The app is `PromptTemplev0.01` — Next.js app router,
> Tailwind, shadcn/ui, React Query (Sprint 04 snapshot). Reuse the existing `/discover` page,
> the prompt card, the auth/session hooks, the API client, the Sprint 07 call-to-action
> components, and the `/prompts/<category>/<slug>` SEO pages if Sprint 06 S5 shipped (**VERIFY**).
>
> **Pair document:** `SPRINT_08_BACKEND_PROMPT_FEED.md`. The API contract in §2 is identical
> to its §3. Build against it with MSW mocks first, so this sprint does not block on the
> backend; switch to the real API when `FEED_ENABLED` is on in staging.
>
> **SWOT traceability.** Each story names the SWOT items it moves (S/W/O/T as in
> *Prompt Temple SWOT Analysis*, 2026-10-29).
>
> **Revision:** v1, 2026-10-29. The frontend repo was not opened while writing this. Every
> component, route and hook name is an **ADAPT** candidate; F0 resolves them.

---

## 0. Operating rules for Claude Code

1. **F0 is mandatory and read-only.** No code until `docs/sprint08/00_frontend_discovery.md` exists.
2. **STOP conditions:** the app is not the app router; React Query is absent (then propose the
   data layer before continuing); the prompt detail route from Sprint 06 S5 exists but has a
   different data shape than §2.2 (reconcile first).
3. **Flags from the server decide.** When the backend answers `503 feed_disabled`, the feed route
   renders the existing `/discover` content with a "Feed coming soon" note. Never a blank page.
4. **No secrets, no `NEXT_PUBLIC_` keys.** The feed is public read; writes use the existing
   session.
5. **Accessibility and mobile are acceptance criteria**, not polish: keyboard reachable, `aria-live`
   on reaction changes, works at 375 px, respects `prefers-reduced-motion`.
6. **Tests with every story:** Vitest + React Testing Library + MSW for components and hooks;
   Playwright for the three flows in F7. Lighthouse on `/feed` before and after.
7. **Every story ends with:** tests green, a rollback note per file (§5), sprint-log entry.

---

## F0 — Discovery (read only)

**Achievement:** the sprint reuses what exists and names it correctly. **SWOT:** W6.

```bash
git log --oneline -5 && git status --short | head
cat package.json | sed -n 1,80p            # next, react, @tanstack/react-query, zod, msw, vitest, playwright?
ls src/app src/app/\(app\) src/app/\(shell\) src/app/\(dashboard\) 2>/dev/null
find src/app -maxdepth 3 -name "page.tsx" | sort
find src -iname "*discover*" -o -iname "*prompt*card*" -o -iname "*PromptCard*" | sort
grep -rn "discover" src --include=*.ts --include=*.tsx -l | head
grep -rn "useQuery\|useInfiniteQuery\|QueryClientProvider" src -l | head
grep -rn "fetch(\|apiClient\|API_BASE\|NEXT_PUBLIC_API" src --include=*.ts --include=*.tsx | head -20
grep -rn "useSession\|useAuth\|getServerSession\|jwt" src -l | head
ls src/components src/components/ui 2>/dev/null
grep -rn "TryMeCta\|SignUpCta\|CallToAction" src -l | head       # Sprint 07 CTA components
find src/app -path "*prompts*" -name "page.tsx"                   # Sprint 06 S5 pages?
grep -rn "sitemap\|generateMetadata\|JSON-LD\|application/ld+json" src -l | head
grep -rn "track(\|analytics\|posthog\|gtag" src -l | head
ls src/test src/__tests__ e2e tests 2>/dev/null; cat vitest.config.* playwright.config.* 2>/dev/null | head -40
```

**VERIFY table** (fill in the log):

| # | Claim | Resolved |
|---|---|---|
| V1 | App router with route groups `(shell)`, `(dashboard)`, `(app)` | ☐ |
| V2 | React Query is the data layer; an `apiClient`/`fetcher` wraps the Django base URL and attaches the session token | ☐ |
| V3 | `/discover` page + its prompt card component (name, props) | ☐ |
| V4 | Sprint 06 S5 pages `/prompts/[category]/[slug]` exist and their data hook | ☐ |
| V5 | Sprint 07 CTA components (`provider_unavailable`, `rate_limited` states) and the draft-preservation helper | ☐ |
| V6 | Analytics helper and event naming convention | ☐ |
| V7 | Test stack present (Vitest/RTL/MSW/Playwright) or to be added | ☐ |
| V8 | Where the app is hosted (Vercel/Heroku) — affects ISR/revalidate choices in F6 | ☐ |

**Output:** `docs/sprint08/00_frontend_discovery.md` with the component map (what gets reused
by name) and the differences from this document.

---

## 1. Information architecture

```
/feed                     ← new. Tabs: Trending · New · Top · For you. Filters drawer. Infinite scroll.
/feed/c/[collection]      ← new. e.g. /feed/c/sota  "State of the art"
/prompts/[category]/[slug]← existing SEO page (V4) upgraded with views + reactions; the feed links here
/discover                 ← unchanged; becomes the fallback when the feed is disabled
```

Navigation: "Feed" becomes the first item in the main nav when `FEED_ENABLED` (read once from
`GET /api/v2/feed/filters/` succeeding vs 503, cached in React Query for the session).

---

## 2. API contract (identical to backend §3 — do not edit here alone)

Base `/api/v2/feed/`. Cursor pagination `?cursor=&limit=20` → `{results, next_cursor}`.

- `GET /feed/?tab=trending|new|top|for_you&category&form&length&model_family&language&cursor&limit`
  — anonymous `for_you` returns trending plus `"tab_fallback":"trending"`.
- `GET /feed/prompts/<slug>/` — `FeedItem` + `text | null` (`text_available`) + `views {outline, variables, steps, compact}` + `related[6]` + `fork_of`.
- `POST /feed/prompts/<slug>/react/ {kind: like|save}` → `{kind, active, stats}` (toggle). Auth.
- `POST /feed/prompts/<slug>/copy/` → 204. Anonymous OK, 30/min.
- `POST /feed/prompts/<slug>/fork/ {title?}` → `201 {slug, fork_of}`. Auth.
- `GET /feed/collections/`, `GET /feed/collections/<slug>/?cursor=`
- `GET /feed/filters/` → facets with counts.
- Errors `{detail, code}`; `503 {code: "feed_disabled"}` when the flag is off.

`FeedItem` (abridged; full JSON in the backend doc §3.1): `id, slug, title, category, subcategory,
form, length_bucket, word_count, reading_time_sec, tldr, preview, structure{sections[],variables[],steps},
model_family, language, stats{likes,saves,forks,copies,applies,views_7d,trending_rank},
viewer{liked,saved,forked}, attribution{source,license,author,url}, collections[], created_at, updated_at`.

Type it once in `src/lib/feed/types.ts` with `zod` schemas; parse every response.

---

## 3. Stories

### F1 — Data layer and feed route

**Achievement:** `/feed` renders a paginated, filterable feed from the API (or MSW), with skeletons,
empty states and the disabled fallback. **SWOT:** O2, W3.

- `src/lib/feed/api.ts` — thin functions over the existing `apiClient` (V2): `getFeed`, `getPrompt`,
  `react`, `copy`, `fork`, `getCollections`, `getCollection`, `getFilters`.
- `src/lib/feed/hooks.ts` — `useFeed(tab, filters)` via `useInfiniteQuery` (`getNextPageParam`
  = `next_cursor`), `usePrompt(slug)`, `useFilters()`, `useReact(slug)` with **optimistic update**
  of `viewer` and `stats` in every cached page that contains the slug (`setQueriesData`), rollback
  on error.
- `src/app/(shell)/feed/page.tsx` (ADAPT group) — server component shell; client `FeedView`:
  tab bar (URL-synced `?tab=`), filter chips (URL-synced), list, `IntersectionObserver` sentinel for
  the next page, skeleton cards ×6, empty state per tab, error state reusing the Sprint 07 CTA
  pattern (V5) for `feed_disabled` → "Browse the library instead" → `/discover`.
- `for_you` when logged out: tab shows a lock glyph; clicking opens the sign-up CTA; the list shows
  trending with a one-line note "Sign in to get prompts picked for you".
- MSW handlers under `src/mocks/feed/` with a 60-item fixture spanning all forms and lengths so
  every state is reproducible before the backend exists.

**Tests:** renders 20 items then loads 20 more at the sentinel; tab change resets the cursor; URL
reflects tab + filters and restores on reload; disabled fallback; anonymous `for_you` note.

**Acceptance:** `/feed` works end-to-end against MSW and against staging; no layout shift while
pages load (CLS < 0.1 in Lighthouse).

---

### F2 — Long-form prompt card

**Achievement:** a 600-word system prompt is understandable in a 3-second glance on a phone.
**SWOT:** W4, T1, T6.

`src/components/feed/PromptCard.tsx` (extend the existing card from V3 if its props allow; else
a new component that the `/discover` page can adopt later).

Card anatomy, top to bottom:
1. **Header row:** category chip · **form badge** (`System prompt`, `Chain`, `Template`, `Long-form`,
   `Conversation`, `Short`, `One-liner`) · reading time (`3 min`) · trending rank badge when
   `trending_rank ≤ 10` · `SOTA` badge when `collections` includes `sota`.
2. **Title** (link to the prompt page).
3. **TL;DR** when present, else `preview`. Two lines, clamped.
4. **Structure strip** (only for `long_form`, `system_prompt`, `chain`, `template_vars`): section
   titles as small chips (max 5 + "+N"), variable count (`{{3 variables}}`), step count.
   This strip is what makes the card different from a text blob — keep it even when space is tight.
5. **Action row:** Like (count) · Save (count) · Fork · Copy · overflow (Open in ChatGPT / Claude /
   Gemini → opens the model with the prompt in the clipboard and a toast; "Report").
   Anonymous: Like/Save/Fork open the sign-up CTA with the draft context preserved (V5 helper);
   Copy works for everyone and fires `POST /copy/`.
6. **Attribution line** (small): source + license; for `text_available:false` items the card says
   "Preview on <source>" and the primary action is the outbound link — no copy button.

Behaviour: expand-in-place on "Show more" to reveal `views.compact` (fetched lazily via
`usePrompt`), without navigating; `aria-expanded`; focus stays on the toggle.

**Tests:** all seven forms render the right badge; structure strip appears only for the four
structured forms; metadata-only item has no Copy and shows the outbound link; anonymous Like opens
the CTA; copy fires the endpoint once and shows the toast; clamp + expand accessible.

**Acceptance:** Basha reviews the card on a 375 px device with 10 real items; the structure strip
is readable without zooming.

---

### F3 — Prompt page: views (outline · TL;DR · variables · full)

**Achievement:** a long prompt can be *used* — scanned, filled and copied — not just read.
**SWOT:** W4, T1.

Upgrade `/prompts/[category]/[slug]` (V4; if absent, create `src/app/(shell)/prompts/[category]/[slug]/page.tsx`
with `generateMetadata` and the Sprint 06 JSON-LD block — ADAPT).

- **View switcher** (segmented control, URL `?view=`): `Outline` (default for structured forms) ·
  `Full` (default otherwise) · `Variables` (only when `structure.variables.length > 0`) · `Steps`
  (only for `chain`). Hidden entirely when `views` is `null` (backend flag off) — the page still
  shows full text.
- **Outline view:** collapsible sections from `views.outline`; "Copy section"; a sticky mini-TOC on
  desktop.
- **Variables view:** a form generated from `views.variables` (`name`, `hint`, placeholder);
  live-rendered preview using the same substitution rules as the backend `render_filled` (port the
  four syntaxes to `src/lib/feed/render.ts`, with the backend's test cases); **Copy filled prompt**
  as the primary button; values kept in `sessionStorage` per slug.
- **Full view:** monospace-optional toggle, line wrap, "Copy".
- **Right rail / below on mobile:** stats, Like/Save/Fork, attribution block (source, license,
  author, link), `fork_of` lineage link, **Related** (6 cards, compact variant of F2).
- **Fork:** confirmation sheet → `POST /fork/` → toast with link to the new private prompt in the
  user's workspace (ADAPT the saved-prompts route).
- SEO: the page remains indexable; `?view=` variants carry `rel=canonical` to the bare URL; the
  JSON-LD `license`/`author` fields come from `attribution`.

**Tests:** view defaults by form; variables form renders N fields and the preview updates;
`render` passes the shared cases (nested braces, unknown vars untouched, all four syntaxes);
fork flow; canonical present on `?view=`; `views:null` degrades to full text.

**Acceptance:** for 10 long-form prompts chosen by Basha, the outline matches his reading in ≥ 8
and "Copy filled prompt" produces a prompt he would paste as-is.

---

### F4 — Filters and collections

**Achievement:** the feed can be narrowed to "system prompts for coding in Arabic" in two taps, and
the SOTA collection has a home. **SWOT:** O2, O5 (Arabic), O3.

- `FiltersDrawer` (sheet on mobile, sidebar ≥ 1024 px) fed by `useFilters()`: Form, Length,
  Category, Model family, Language — chips with counts; multi-select within a facet; "Clear all".
  URL-synced; shareable.
- `/feed/c/[collection]` route reusing `FeedView` with `useCollection(slug)`; header with title,
  description, count; `sota` gets a short explainer ("Top-ranked, licensed, structured prompts from
  the world's public libraries, refreshed weekly").
- Language chip `ar` applies `dir="rtl"` to card text and prompt page content (not to chrome).

**Tests:** facet counts render; multi-select composes query params; collection page paginates;
RTL applied for `ar` items only.

**Acceptance:** filter round-trip from URL works; `/feed/c/sota` renders ≥ 20 items from staging.

---

### F5 — Reactions, auth gating and the return loop

**Achievement:** one-tap reactions feel instant, never lose the user's intent, and nudge anonymous
visitors to sign up at the moment of value. **SWOT:** W4, W3.

- Optimistic Like/Save with rollback and a non-blocking toast on failure; counts animate only when
  `prefers-reduced-motion` is off.
- Anonymous reaction → Sprint 07 CTA sheet (V5) with copy: *"Save this prompt to your library —
  free account"*; on return after sign-up the intended reaction is replayed from `sessionStorage`
  (`{slug, kind, ts}`; discard after 1 h).
- "Saved" tab in the user's workspace lists saved prompts (ADAPT the existing saved-prompts page:
  add a "From feed" filter if the model distinguishes; otherwise link out).
- `rate_limited` on `/copy/` → silent (copy still happens client-side; the count is best-effort).

**Tests:** optimistic flip + rollback; CTA shown for anonymous and the pending reaction replays
after a mocked login; reduced-motion disables the count animation.

---

### F6 — Analytics, SEO and performance

**Achievement:** the SWOT metrics for growth and retention are measurable from day one. **SWOT:**
W4, O3, W7.

- Events via V6 helper (names mirror the backend): `feed_viewed{tab}`, `feed_item_impression`
  (IntersectionObserver ≥ 50 % for 1 s, sampled 1-in-5 anonymous, dedup per session),
  `prompt_opened{from_tab,position}`, `prompt_reacted{kind}`, `prompt_copied{view}`,
  `prompt_forked`, `prompt_view_switched{view}`, `feed_filter_applied{facet}`. No prompt text.
- SEO: `/feed` and `/feed/c/sota` indexable with `generateMetadata`; tab/filter variants
  `noindex, follow` via `robots` metadata when query params are present except `tab=trending`;
  prompt pages unchanged (Sprint 06). Add `/feed` and collections to the sitemap generator (ADAPT:
  Django or Next, per Sprint 06 decision 7).
- Performance: first feed page streamed from the server component (`fetch` with
  `next: { revalidate: 60 }` for anonymous `trending`); client takes over for paging and
  reactions. Images: none above the fold. Target Lighthouse mobile ≥ 90 perf / 100 a11y on `/feed`.
- `/feed` error boundary: any thrown error → the `/discover` fallback, never a white page.

**Tests:** impression fires once per item per session; `noindex` present on filtered URLs; error
boundary renders the fallback.

**Acceptance:** Lighthouse scores logged before/after; event stream visible in the analytics sink
during a 10-minute manual session.

---

### F7 — End-to-end flows (Playwright, desktop + 375 px)

1. **Browse → open → copy filled prompt:** anonymous visitor lands on `/feed`, filters to
   `System prompt`, opens a card, switches to Variables, fills two fields, copies; clipboard
   contains the substituted text; `prompt_copied{view:"variables"}` fired.
2. **React → sign-up → replay:** anonymous Like → CTA → mocked login → the like is applied and the
   count increments once.
3. **Feed disabled:** backend returns 503 → `/discover` fallback with the note; nav still works.

Plus axe on `/feed` and the prompt page with no serious violations.

---

## 4. Design notes (keep the card honest)

- The **structure strip** is the product idea of this sprint. If space is tight, cut counts, not the
  strip.
- Form badges use one neutral palette with a single accent for `SOTA` and top-10 trending; no rainbow.
- Copy for empty states: *Trending* — "Nothing is trending yet — be the first to like a prompt."
  *For you* — "Save or like three prompts and this tab will fill up." *Filtered* — "No prompts match;
  clear a filter."
- Arabic items: real RTL, Arabic-capable font stack already in the app (VERIFY), never mirrored icons.

---

## 5. Per-file rollback notes (fill in as touched)

| File | Change | Rollback |
|---|---|---|
| `src/lib/feed/{types,api,hooks,render}.ts` | new | delete; nothing else imports them when the route is removed |
| `src/app/(shell)/feed/**` | new routes | delete the folder; remove the nav item |
| `src/components/feed/*` | new components | delete; `/discover` card untouched unless F2 chose to extend it (then revert that commit alone) |
| `src/app/(shell)/prompts/[category]/[slug]/page.tsx` | view switcher + reactions | revert commit; the Sprint 06 page stays as it was |
| nav component (ADAPT) | "Feed" item gated on API availability | remove one entry |
| `src/mocks/feed/*` | MSW fixtures | test-only; delete |
| sitemap generator | `/feed` entries | revert |

Server-side kill switch is the backend's `FEED_ENABLED=false`: the frontend already degrades to
`/discover` by design (F1), so no frontend deploy is needed to turn the feature off.

---

## 6. Non-goals

- No comments, follows, notifications or user profiles.
- No publishing of forks to the public feed (Sprint 09).
- No changes to Try Me, the enhancer, Prompt Forge or the Chrome extension UI (the extension
  will consume the same `views`/`render` later — keep `render.ts` dependency-free for that).
- No new design system; shadcn/ui primitives only.

---

## 7. Done definition

1. F0 discovery log with the component map and every VERIFY resolved.
2. `/feed` live on staging against the real API: four tabs, filters, infinite scroll, skeletons,
   empty and disabled states.
3. Long-form cards show form badge, reading time, TL;DR and the structure strip; metadata-only
   items show link-only cards.
4. Prompt page offers Outline / Full / Variables / Steps where applicable; "Copy filled prompt"
   works with the shared substitution rules.
5. Like / Save / Fork / Copy work with optimistic updates; anonymous intent replays after sign-up.
6. Events flow to the analytics sink; Lighthouse mobile ≥ 90 perf, 100 a11y on `/feed`; the
   three Playwright flows pass at desktop and 375 px.
7. Sprint log records Lighthouse before/after, Basha's card and outline spot-check results, and
   what was deferred.
