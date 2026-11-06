# Sprint 11 — I0 discovery log (2026-11-06)

Repo: D:\PromptTemplev0.01 (origin github.com/DjangoSpop/prompt-templev0.01). Branch `sprint-11-identity`
cut from `feature/sprint09-reader` @ 2c50467 (Sprints 08 and 09 implemented; Sprint 10 not yet).

| # | Claim | Found |
|---|---|---|
| V1 | Dark mode strategy | Tailwind `darkMode: ["class"]`; custom `src/providers/ThemeProvider.tsx` (light/dark/system, storageKey `prompt-temple-theme`, default `system`). No next-themes. |
| V2 | `--pt-*` location | `src/app/globals.css` ~L1164 (light) / L1177 (dark), consumed by `src/components/feed/PromptText.tsx`. |
| V3 | Fonts | `<link>` tags in `src/app/layout.tsx`: Inter, Playfair Display, Cinzel, Crimson Pro, JetBrains Mono. `--font-display/body/mono-code` in globals.css. |
| V4 | Literal colours | Tailwind config carries full `lapis-blue`/`sand`/gold scales as hex; globals.css has `--gold-*`, `--gradient-*`, glass tokens; `.dark .bg-sand-*` overrides with `!important`. Count in components not yet measured (lint rule pending). |
| V5 | shadcn variables | HSL triplets `--bg --fg --primary --accent --secondary --border --input --ring --card --popover --destructive --radius`, consumed as `hsl(var(--x))`. |
| V6 | i18n | `<html lang="en">` only; `font-arabic` = Cairo in Tailwind; no `ar` layout segment. |
| V7 | Homepage | `src/app/page.tsx` (client) composes `landing/v3/HeroSection`, `TempleNavbarEnhanced`, `TryMeButton`, `DownloadHero`, particles/reveal animations, `pharaonic/Eyehorus`. |
| V8 | OG/card routes | Not present (Sprint 10 F3 not built). |
| V9 | Extension | separate repo (`promping_ext`); out of scope. |

Routes: 33 `page.tsx` under `src/app` incl. `(shell)/promptguard`, feed (Sprint 08/09), academy, pricing, templates, discover, history.

## What differs from the sprint document
- Sprint 10 components (ResultMedia, TrendLane, AdSlotCard, OG routes) do not exist; I3/I6 apply to Sprint 08/09 components only.
- The app's variables are shadcn HSL triplets, not hex: the bridge redefines those triplets from the brand palette so every route re-skins under the flag without edits.
- Theme default stays `system` (light for most users; dark by preference or toggle) — matches "light default".

## I1 implemented
- `src/styles/brand-v2.css`: brand tokens (hex, both themes), shadcn HSL bridge, legacy pharaonic names demoted, `--pt-*` aliased, type scale classes. Scoped to `html[data-brand="v2"]`.
- `src/app/layout.tsx`: `data-brand="v2"` + brand fonts + `theme-color #f2efe8` when `NEXT_PUBLIC_THEME_V2=true`; otherwise unchanged.
- `tailwind.config.ts`: brand colour names, `rounded-cartouche`/`rounded-pill`, `shadow-lift`, timing; `font-sans`/`font-arabic` follow CSS vars with old faces as fallback.
- Flag added to `.env.example`, `.env.development`, `.env.local`. **Vercel: set `NEXT_PUBLIC_THEME_V2=true` on the preview environment only.**
