# Sprint 09 — R0 Discovery (read-only)

Date: 2026-11-04 · Repo: `D:\PromptTemplev0.01` · Branch at start: `feature/sprint08-feed` (HEAD `9c5ff2f`)
Sprint branch: `feature/sprint09-reader` (= sprint08 branch + `origin/main` merged cleanly; tag `sprint08-card` = `9c5ff2f` for §9 rollback).
Plan: `SPRINT_09_INSTANT_FEED_READER.md` (Downloads). Backend repo: `D:\MyPromptApp\my_prmpt_bakend` (`main` @ `9ecff409`).

> **Deployment note.** The Sprint 08 feed is complete and tested on `feature/sprint08-feed`, but that
> branch was never merged into `main`, so `www.prompt-temple.com/feed` does **not** exist in production
> yet (Vercel deploys `main`). The backend feed API *is* live (`FEED_ENABLED=true` since 2026-10-30).
> STOP condition 2 ("F1 not merged") is read as "not merged into the sprint base"; it *is* the base of this
> branch, so the sprint continues. Merging to `main` is Basha's call (pushes go live).

## VERIFY table

| # | Claim | Resolved |
|---|---|---|
| V1 | Sprint 08 F1 merged: `/feed` route, `useFeed`, `FeedItem` zod | ✅ On the branch. `src/app/(shell)/feed/page.tsx` (SSR first trending page, revalidate 60 s) → `FeedView` → `useFeed(query, initialPage)` (`useInfiniteQuery`, keys `['feed','list',tab,filters,authed]`, `staleTime` 60 s). `feedItemSchema` in `src/lib/feed/types.ts`; `feedPromptDetailSchema = feedItemSchema.extend({text, views, related, fork_of})`. |
| V2 | Card component and lazy fetch to remove | ✅ `src/components/feed/PromptCard.tsx`. "Show more" sets `expanded` → `usePrompt(item.slug, {enabled: expanded})` → `GET /feed/prompts/<slug>/` (detail incl. `related`) → skeleton until it resolves → renders `views.compact ?? compactText(text)` (600 chars) in a `<pre>`. `onPointerEnter`/`onFocusCapture` prefetch the same query. Copy (`PromptActions.getText`) also `fetchQuery`s the detail. Title is a `<Link>` to `/prompts/[...slug]` (full navigation). **All three go.** |
| V3 | Animation library | ✅ `framer-motion ^12.23.12` is a dependency and used by `(app)/*` pages and landing v2/v3 → use `motion` + `AnimatePresence` + `useReducedMotion` from it; **no CSS View Transitions** (rule 6: not both). |
| V4 | Virtualizer | ❌ Neither `@tanstack/react-virtual` nor `react-virtuoso`. R5 may add `@tanstack/react-virtual` as the sprint's only new dependency; decision deferred to R5 after measuring with `content-visibility: auto` (see sprint log). |
| V5 | Syntax highlighter | ❌ None (`@types/react-syntax-highlighter` only as a stale type). Fenced code renders plain monospace. |
| V6 | shadcn primitives | ✅ `dialog`, `collapsible`, `dropdown-menu`, `tooltip`, `tabs`, `switch`, `input`, `label`, `kbd` in `src/components/ui/`. No `Sheet` — not needed (reader is inline). |
| V7 | Backend list returns `text`/`views` inline (B7) | ❌ **Not shipped.** Live `GET /api/v2/feed/` item keys: `attribution, category, collections, created_at, form, id, language, length_bucket, model_family, preview, reading_time_sec, slug, stats, structure, subcategory, title, tldr, updated_at, viewer, word_count` (no `text`, no `views`, no `text_available`). Only `GET /prompts/<slug>/` carries `text`/`views`, and `views` is computed per request (`build_views`, cached 1 h in Redis) and is `null` in prod because `PROMPT_VIEWS_ENABLED=false`. **B7 is built in this sprint** (backend branch, see sprint log) and the frontend is built against the MSW fixture (§7) until it is deployed; `text:null` degrades to the deep-link fetch path (R1). |
| V8 | Hosting | ✅ Frontend Vercel (`iad1`), backend Heroku. SSR + ISR available; first page already server-rendered. |
| V9 | Clipboard helper; HTTPS | ✅ `src/lib/feed/clipboard.ts` (`copyText` with Safari `ClipboardItem` path, `compactText`, `OPEN_IN_TARGETS`). No `execCommand` fallback yet → `copy.ts` adds it. Site and API are HTTPS; localhost:3000 is a secure context. |

## Stack snapshot (delta from Sprint 08 discovery)

| Item | Found |
|---|---|
| Tests | vitest 3.2 + RTL 16 + user-event 14 + MSW 2.15 installed; `npx vitest run src/lib/feed src/components/feed` = 63 tests green at start. `@playwright/test 1.64` and `@axe-core/playwright` installed but **no `playwright.config.*`, no `e2e/`** (Sprint 08 F7 never ran). |
| Property testing | no `fast-check` → the tokenizer property test uses a small seeded generator in the test file (no new dependency). |
| Theme | Tailwind `darkMode: ["class"]`; tokens are HSL triplets in `:root` / `.dark` inside `@layer base` in `src/app/globals.css`; `--motion-duration-medium: 220ms` and `--motion-ease-temple` already exist. Card background = `--card` (`#FFFFFF` light / `#161A22` dark). Sticky offsets used today: `top-20` (5 rem); navbar vars `--navbar-h: 6rem`. |
| Analytics | `trackEvent(ViralEvent, props)` closed union in `src/lib/analytics/trackEvent.ts`; feed wrapper `trackFeed` in `src/lib/feed/analytics.ts`. R5 extends both. |
| Variables state | `loadVariableValues/saveVariableValues` per slug in `sessionStorage` (`src/lib/feed/pending.ts`) — reused unchanged by R4. |
| `render.ts` | dependency-free `renderFilled` with the backend's shared cases — unchanged. |
| Mocks | `src/mocks/feed/{factory,handlers}.ts`: 60 synthetic items, MSW handlers with `state.requests` (request spy for the zero-fetch test). `makeDetail` adds `text`/`views`. |
| Dev server | port 3000 free at discovery time (safe to run `next build`). |

## How a prompt is opened today (5 lines)

1. Tap "Show more" on a card → `usePrompt(slug)` fires `GET /api/v2/feed/prompts/<slug>/` (detail + 6 related items).
2. The card shows a 3-line skeleton until the response is parsed by zod; then the first 600 chars (`compact`) render in a `<pre>`; the full text is never shown in the feed.
3. Tap the title → full Next.js navigation to `/prompts/[...slug]` (server fetch of the same detail + client refetch), where Outline/Full/Variables/Steps live.
4. Measured 2026-11-04 from Cairo against the live API (uncached, not throttled): feed page of 20 = **40,403 B raw / 11,522 B gzip, 548 ms**; detail = **27,975 B, 414 ms** (text ≈ 20 kB for this top item). On a "Fast 3G" profile (≈ 560 ms RTT, 1.5 Mb/s) the same open is ≈ **0.9–1.3 s** of spinner per prompt; every open is a request.
5. Copy from a card also awaits the detail (`PromptActions.getText` → `fetchQuery`), so the clipboard write is network-bound unless the hover prefetch landed first.

## Decisions taken in R0 (defaults from §5 unless Basha says otherwise)

- One reader open at a time (default), "Keep prompts open" setting in the overflow menu, persisted.
- Soft-collapse on scroll-past: on for `< 1024 px`, off for desktop; setting-controlled.
- Focus mode: key `f` only, desktop ≥ 1024 px, no UI affordance.
- Inline text cap 12,000 chars (`FEED_INLINE_TEXT_CAP`), `text_truncated: true` beyond it; the reader fetches the tail via the detail endpoint on open (rare, logged).
- Palette: seven `--pt-*` HSL tokens in `globals.css`, low saturation, AA-checked against `--card` in both themes (contrast numbers in the sprint log); approval pending the R3 screenshot set.
