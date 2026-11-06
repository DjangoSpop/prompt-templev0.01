# Sprint 11 — I6 assets and I7 secondary pages

All changes are gated: `html[data-brand="v2"]` via `NEXT_PUBLIC_THEME_V2=true` (Tailwind `v2:` /
`v2-dark:` variants, or `BRAND_V2` from `src/lib/brand.ts`). Flag off = Sprint 10 output.

## I6 — assets and chrome
- `src/components/ThemeToggle.tsx`: three-state radiogroup System · Light · Dark on the existing
  ThemeProvider; keyboard accessible; v2 pill styling. Export names unchanged.
- `src/lib/brand.ts`: `BRAND_V2`, `v2cls()`, `brand.light/dark` hex tokens. **Generated** by
  `scripts/gen-brand.ts` from `src/styles/brand-v2.css` (`npm run brand:gen`, Node
  `--experimental-strip-types`; no `tsx` dependency). Re-run after any token change.
- `public/brand/mark.svg`, `icon-512.svg`, `icon-maskable.svg`: cartouche outline with a reed
  stroke. **Placeholders** until a logo file is added to the Brand System (`assets/Logos/`).
- `public/manifest.webmanifest`: name/short_name "Prompt Temple", `theme_color` and
  `background_color` `#f2efe8`, SVG icons appended; PNG entries kept.
- `src/app/not-found.tsx` (new): "This page is not in the library." + quiet link to /feed.

## I7 — pages
- `src/app/auth/login`, `auth/register`: gold gradients and glass moved to `style={BRAND_V2 ? undefined : …}`,
  cartouche cards, faience primary, lapis focus ring, "Sacred …" copy replaced under the flag,
  explain line "Free. Nothing to install."
- `src/app/academy/page.tsx`: page ground, course header cards, value cards, stats and footer CTA
  restyled under v2 (cartouche, no shadows, faience CTA pill, gilt hairline instead of the gold
  gradient rule); badge/level copy → Scribe · Senior scribe · Master scribe; explain line
  "Short lessons. Each ends with a line to try." `AcademyHero` and `ModuleCard` were outside this
  story's file set and still carry the old look.
- `src/app/pricing/page.tsx` + `PricingPageClient.tsx`: ground, plan cards (cartouche, popular =
  faience border, no scale), one filled CTA (Pro) with explain line "No ads, more credits, and the
  library stays free.", outlined others, FAQ title, links in faience; FAQ answers without
  exclamation marks. `PLAN_META` taglines unchanged (not in scope).

## Lint baseline (I8 input)
ESLint is **not installed** in `node_modules` (pre-existing: `npm install` is needed before
`next lint` runs), so the `no-restricted-syntax` hex rule in `eslint.config.js` could not be
executed. Baseline by grep instead: **733** six-digit hex occurrences in `src/components/**/*.tsx`
(`grep -rEn '#[0-9a-fA-F]{6}\b' src/components --include=*.tsx | wc -l`), 2026-11-06. Target for
I8: 0 in components touched by this sprint; the rest tracked as debt.

## Verification
`npx tsc --noEmit` reports no errors in academy/, pricing/, auth/, ThemeToggle, not-found, lib/brand.
