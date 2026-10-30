# Sprint 08 — F0 Frontend Discovery (read-only)

Date: 2026-10-30 · Repo: `D:\PromptTemplev0.01` · Branch at start: `feature/paddle-checkout` (HEAD `f6f3ba2`)

> Written before any Sprint 08 code. Every ADAPT name in `SPRINT_08_FRONTEND_PROMPT_FEED.md`
> is resolved below. The pair document `SPRINT_08_BACKEND_PROMPT_FEED.md` is **not** in the repo
> (`docs/sprint v08/` holds only the frontend doc), so the API contract in §2 of the frontend
> doc is the single source of truth for this sprint; the `render_filled` test cases are defined
> on the frontend side (see F3 note) and must be reconciled with the backend when it lands.

## Stack snapshot

| Item | Found |
|---|---|
| Framework | Next.js `^15.5.9`, App Router, React `19.1`, TypeScript 5.9 (`strict: false`) |
| Styling | Tailwind 3.4 + `tailwindcss-animate`, shadcn-style primitives in `src/components/ui/` (`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `tabs`, `skeleton`, `tooltip`, `collapsible`, `scroll-area`, `separator`, `switch`, `input`, `textarea`, `checkbox`, `label`, `EmptyState`, `PapyrusSkeleton`). **No `sheet`/drawer primitive** — the `Dialog` already renders as a bottom sheet on mobile. |
| Data layer | `@tanstack/react-query` v5, `QueryProvider` mounted in `src/app/layout.tsx` (staleTime 5 min, retry skips 4xx). `swr` is also installed but unused for lists. |
| State | `zustand` — `useAuthStore` (`src/store/user.ts`, persisted key `prompt-temple-auth`, exposes `accessToken`, `isAuthenticated`, `profile`). |
| Validation | `zod` `^3.22` already a dependency. |
| Toasts | `sonner` `<Toaster>` mounted in `src/providers/AppProviders.tsx`. |
| Fonts | `@fontsource/cairo` + Tailwind `font-arabic` (Cairo) → Arabic-capable stack **VERIFIED**. `src/lib/rtl.ts` (`isRTLText`, `getTextDir`) and `useTextDirection` exist. |
| Hosting | **Vercel** (`vercel.json`, `regions: ["iad1"]`) → ISR / `next: { revalidate }` is available for the server-rendered first feed page. |
| Node | v22.23.2, npm 9.3.0 |

## VERIFY table

| # | Claim | Resolved |
|---|---|---|
| V1 | App router with route groups `(shell)`, `(dashboard)`, `(app)` | ✅ Yes, plus `(chat)`. `(shell)/layout.tsx` is a pass-through (`flex-1 min-h-0`); the sidebar/navbar come from the root layout (`AppLayoutWithSidebar`, `TempleNavbarEnhanced`). **`/feed` goes under `(shell)`.** |
| V2 | React Query is the data layer; an `apiClient` wraps the Django base URL and attaches the session token | ✅ Partly. Hooks in `src/hooks/api/*` use `apiClient` from `src/lib/api/typed-client.ts` (plain `fetch`, base `NEXT_PUBLIC_API_BASE_URL` → `https://api.prompt-temple.com`, Bearer token from `useAuthStore` then `localStorage.access_token`). Its `request()` is **private** and has no generic endpoint method, so `src/lib/feed/api.ts` uses the same base URL + token source through a small `feedRequest` helper (identical header logic, parses `{detail, code}` errors, maps 503 `feed_disabled`). There is a second axios client (`src/lib/api-client.ts`, `src/lib/api/base.ts`) used by older pages — not used here. |
| V3 | `/discover` page + its prompt card component | ✅ `src/app/discover/page.tsx` (1,604-line client component, metadata in `discover/layout.tsx`). Data: `useDiscoverTemplatesInfinite`, `useDiscoverCategories`, `useCopyFromTemplate`, `useRagSearch` from `src/hooks/api/useSavedPrompts.ts`. The card is an **inline, un-exported** `PublicPromptCard({ prompt: SavedPrompt, onCopy, isCopying, onOpen, onEnhance, similarityScore, viewMode })` bound to the `SavedPrompt` shape (`content`, `description`, `use_count`). Its props do not fit `FeedItem` (no form/length/structure/stats/viewer) → **F2 builds `src/components/feed/PromptCard.tsx` as a new component**; `/discover` is untouched and becomes the disabled fallback by rendering `DiscoverPage` inside the feed route. |
| V4 | Sprint 06 S5 pages `/prompts/[category]/[slug]` and their data hook | ❌ **Absent.** Existing prompt pages: `/p/[id]` (server `generateMetadata`, fetches `/api/v2/history/saved-prompts/{id}/`, then client redirect to discover) and `/templates/[id]` (has JSON-LD block, line 80). **F3 creates `src/app/(shell)/prompts/[category]/[slug]/page.tsx`** with `generateMetadata` + JSON-LD modelled on those two. No data-shape conflict (STOP condition 2 not triggered). |
| V5 | Sprint 07 CTA components (`provider_unavailable`, `rate_limited`) and draft-preservation helper | ❌ **Absent.** `src/components/sprint07/index.ts` is "Polish & Pharaonic Micro-Interactions": `PharaonicErrorBoundary`, `PapyrusSkeleton*`, `EmptyState` variants, confetti (`copyWithConfetti`). `src/components/try-me/*` are the Try-Me chat widgets; `src/lib/tryme/session.ts` only stores a guest session id in `sessionStorage`. `PaywallModal` is credit-specific. **F5 creates `src/components/feed/SignUpCta.tsx`** (Dialog-based sheet) and `src/lib/feed/pending.ts` (the `{slug, kind, ts}` sessionStorage helper). Login/register pages honour `?redirect=` (`auth/login/page.tsx:59`, `auth/register/page.tsx:65`) so the CTA links there with the current URL. The error-state pattern reused is `EmptyState` + `PharaonicErrorBoundary` styling. |
| V6 | Analytics helper and event naming convention | ✅ `src/lib/analytics/trackEvent.ts` → `trackEvent(event: ViralEvent, properties)` batching to `POST /api/v2/analytics/track/` (`{events:[{event, properties}]}`), snake_case names (`optimization_complete`, `page_view`). The `ViralEvent` union is closed → **F6 extends it** with the eight feed events. `src/providers/AnalyticsProvider.tsx` is a separate dashboard/gamification context, not the event sink. |
| V7 | Test stack | ⚠️ `vitest.config.ts` (jsdom, `src/test/setup.ts` with jest-dom + matchMedia/localStorage mocks) and six tests exist, but `package.json` devDependencies list only `typescript`, `@types/react`, `cross-env`, `@types/react-syntax-highlighter` — **vitest, RTL, jsdom, MSW and Playwright are not installed** (lockfile has none of them). This sprint adds them as devDependencies: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/{react,jest-dom,user-event}`, `msw`, `@playwright/test`, `@axe-core/playwright`, plus `playwright.config.ts` and `e2e/`. `tsconfig.json` excludes `**/*.test.ts(x)` and `__tests__`. |
| V8 | Hosting | ✅ Vercel. First page of anonymous `trending` is fetched in the server component with `next: { revalidate: 60 }`. |

## Component map (reused by name)

| Need | Reuse |
|---|---|
| Page chrome | root layout (`TempleNavbarEnhanced`, `AppLayoutWithSidebar`), `(shell)` group |
| Query client | `@/lib/providers/QueryProvider` (already global) |
| Auth state | `useAuthStore` from `@/store/user` (`isAuthenticated`, `accessToken`, `profile`) |
| Primitives | `Badge`, `Button`, `Card`, `Dialog*`, `DropdownMenu*`, `Tabs*`, `Skeleton`, `Tooltip*`, `Collapsible*`, `Separator`, `Input`, `Textarea`, `Checkbox`, `Label`, `Switch` from `@/components/ui/*` |
| Empty / error visuals | `EmptyState` (`@/components/ui/EmptyState`, type `custom`), `PapyrusSkeletonCard` |
| Toasts | `toast` from `sonner` |
| Icons | `lucide-react` |
| Analytics | `trackEvent` from `@/lib/analytics/trackEvent` (union extended) |
| RTL | `isRTLText` from `@/lib/rtl`, Tailwind `font-arabic` |
| Disabled fallback | `DiscoverPage` default export from `@/app/discover/page` |
| Saved prompts destination | `/prompt-library` (`PromptLibrary` component); fork toast links there |
| Sitemap | `src/app/sitemap.ts` (Next, static list) — `/feed` + collections appended |
| Nav | `navigationGroups` in `src/components/TempleNavbarEnhanced.tsx` (Core group) and `AppSidebar.tsx` |

## Differences from the sprint document

1. **No backend doc in repo** → contract §2 is authoritative; `FeedItem`/`FeedPromptDetail` zod schemas are written from it with permissive optionals where the abridged list is ambiguous (`subcategory`, `tldr`, `fork_of`, `trending_rank` nullable).
2. **V3 card is not extendable** → new `PromptCard` (rollback: delete `src/components/feed/*`).
3. **V4 page absent** → created under `(shell)/prompts/[category]/[slug]`, data from `GET /api/v2/feed/prompts/<slug>/`.
4. **V5 CTA absent** → new `SignUpCta` + `pending.ts`; copy text as specified in F5.
5. **V7 test stack absent** → devDependencies added; existing tests are left as they were.
6. **`render_filled` syntaxes** (backend cases unavailable): the frontend port handles `{{name}}`, `{name}`, `[name]`, `<name>` (optional inner whitespace, case- and separator-insensitive name match), substitutes **known variables only**, leaves unknown tokens and empty values untouched, and resolves nested braces inner-first (`{{{name}}}` → `{value}`). These are the shared cases until the backend file is added.
7. **Mocking**: MSW handlers live in `src/mocks/feed/`; the browser worker starts only when `NEXT_PUBLIC_MOCK_API=true` (an existing env flag, not a secret). Playwright uses `page.route()` with the same fixtures, so e2e does not depend on the service worker.

## Reconciled with the live backend (2026-10-30)

The backend shipped (`my_prmpt_bakend` `apps/feed`, `FEED_ENABLED=true`). Captured responses live in
`src/mocks/feed/fixtures/` and `types.test.ts` parses them. Differences from the assumptions above:

- **Slug** is `<category-slug>/<subcategory-slug|prompt>/<title>-<8 hex>` → the prompt page is the catch-all
  `(shell)/prompts/[...slug]`, not `[category]/[slug]`. `category` on an item is the display name; the slug's
  first segment is the category slug (`categorySlug()`).
- **`/filters/`** keys are plural (`forms, lengths, categories, model_families, languages`); the schema maps them.
- **Views** (when `PROMPT_VIEWS_ENABLED`): outline `{title, body, start, end}`, variables
  `{name, hint, default, occurrences}`, steps `{n, text}`. Currently `views: null` (flag off).
- **Fork** returns `201 {slug, id, fork_of}` where slug/id are the new private SavedPrompt.
- **`render_filled`** (point 6 above is superseded): exact names, no case/separator folding, `{name}` never part of
  `{{…}}`, `[NAME]` not before `(`, values literal. `render.ts` ports this and `render.test.ts` holds the
  backend's four cases.
- **Multi-select filters** (`?form=a,b`) needed a backend change (commit `9ecff409`, not yet deployed).
- No MSW browser worker: the backend is live; MSW is used in Vitest only.

## STOP-condition check

- App router: yes. React Query present: yes. Sprint 06 S5 route: absent (create, no reconcile needed). → **No STOP triggered; proceed to F1.**
