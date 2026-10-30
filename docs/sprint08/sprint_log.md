# Sprint 08 — Frontend sprint log

Plan: `docs/sprint v08/SPRINT_08_FRONTEND_PROMPT_FEED.md`. Discovery: `00_frontend_discovery.md`.
Branch: `feature/sprint08-feed` (from `main`, not pushed).

## Built

| Story | What | Where |
|---|---|---|
| F1 | zod-typed API layer, React Query hooks (infinite feed/collections, prompt, filters, availability) | `src/lib/feed/{types,api,hooks,params,server}.ts` |
| F1 | `/feed`: URL-synced tabs + filters, server-rendered first trending page (revalidate 60 s), infinite scroll + "Load more", skeletons, empty states, `feed_disabled` → Discover fallback, error boundary | `src/app/(shell)/feed/`, `src/components/feed/FeedView.tsx` |
| F2 | Long-form card: category · form badge · reading time · #rank (≤ 10) · SOTA; TL;DR/preview clamp; structure strip (5 chips + N, variables, steps); expand in place; actions; attribution; link-only for metadata-only items; RTL for `ar` | `PromptCard.tsx`, `PromptActions.tsx` |
| F3 | `/prompts/[...slug]`: Outline (TOC, collapsible, copy section) · Full (monospace toggle) · Variables (form + live preview + Copy filled prompt, sessionStorage) · Steps; `?view=` canonical to bare URL; JSON-LD; rail with stats, actions, source, related | `src/app/(shell)/prompts/[...slug]/page.tsx`, `PromptPageView.tsx` |
| F4 | Filters (sidebar ≥ 1024 px, dialog below), multi-select, chips, clear all; `/feed/c/[collection]` with SOTA explainer | `FeedFilters.tsx`, `src/app/(shell)/feed/c/[collection]/page.tsx` |
| F5 | Optimistic like/save across every cache with rollback; sign-up CTA for anonymous intents; replay after sign-in (sessionStorage, 1 h) ; fork dialog → private copy in `/prompt-library` | `hooks.ts`, `SignUpCta.tsx`, `ForkDialog.tsx`, `pending.ts` |
| F6 | 8 feed events (`trackEvent` union extended); impressions ≥ 50 % for 1 s, once per session, 1-in-5 anonymous; `noindex, follow` on tab/filter variants; sitemap entries | `analytics.ts`, `trackEvent.ts`, `sitemap.ts` |
| Nav | "Feed" next to Discover (navbar Core, sidebar main, public nav) | `TempleNavbarEnhanced.tsx`, `AppSidebar.tsx` |

Authentication is untouched: the feed only reads `useAuthStore` and links to the existing
`/auth/login` and `/auth/register` with `?redirect=`.

## Tests

`npx vitest run src/lib/feed src/components/feed` → **63 passed** (render shared cases, schemas against live
fixtures, URL state, optimistic toggle, pending replay, impressions, card badges/strip/RTL/metadata-only,
feed paging at the sentinel, tab + filter URL round-trip, disabled fallback, anonymous for_you CTA,
optimistic like + rollback, replay after sign-in, copy → clipboard + one `/copy/` call, prompt views,
variables preview + copy). `tsc` clean for every touched file. `next build` passes.

Added devDependency `@testing-library/dom` (peer of `@testing-library/react`, missing).

## Not done yet

- **F7 Playwright + axe** and **Lighthouse before/after** (needs a running app; see below).
- Browser check at 375 px and Basha's card / outline spot checks.
- Nav item is static, not gated on `/filters/` (the route degrades to Discover by itself).
- "Report" in the card overflow menu (no reporting endpoint exists).
- Variables / Outline / Steps views appear only after the backend's `PROMPT_VIEWS_ENABLED=true`.
- Multi-select filters need backend commit `9ecff409` deployed; until then a two-value filter returns nothing.

## Run log

| Date | Step | Result |
|---|---|---|
| 2026-10-30 | Types reconciled with live API; render.ts ported to backend rules | see discovery doc |
| 2026-10-30 | `next build` | ✓; routes `/feed`, `/feed/c/[collection]`, `/prompts/[...slug]` |
| 2026-10-30 | Local smoke test | Blocked: `next build` overwrote `.next` under the running `next dev --turbopack` (port 3000); both now 500 until the dev server is restarted. Lesson: never `next build` while dev runs in the same folder |

## Rollback (per file)

| File | Rollback |
|---|---|
| `src/lib/feed/*`, `src/components/feed/*`, `src/mocks/feed/*` | delete |
| `src/app/(shell)/feed/**`, `src/app/(shell)/prompts/[...slug]/` | delete the folders |
| `TempleNavbarEnhanced.tsx`, `AppSidebar.tsx` | remove the `Feed` entries + `Rss` import |
| `src/lib/analytics/trackEvent.ts` | remove the 8 feed event names |
| `src/app/sitemap.ts` | remove the two feed entries |
| `package.json` | test devDependencies only |

Server kill switch: backend `FEED_ENABLED=false` → `/feed` shows the Discover fallback, no frontend deploy.
