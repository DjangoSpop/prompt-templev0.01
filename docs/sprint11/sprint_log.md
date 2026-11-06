# Sprint 11 — run log (2026-11-06)

Branch `sprint-11-identity` (from `feature/sprint09-reader`). Flag: `NEXT_PUBLIC_THEME_V2=true` in `.env.local`; set it on Vercel **preview** only.

| Commit | Story | Result |
|---|---|---|
| 890ade8 | I0 discovery, I1 token bridge | `src/styles/brand-v2.css` (brand tokens both themes, shadcn HSL bridge, --pt-* aliases, type scale), layout fonts + theme-color gated, Tailwind brand names |
| d6d3bcc | I1 | `v2:` / `v2-dark:` Tailwind variants scoped to `html[data-brand="v2"]` |
| 4618873 | I4 copy, I5 homepage, I6 toggle/assets/brand.ts/404/auth | landing/v4 behind the flag; LegacyHome kept |
| 5948b7b | I3 feed + reader | 14 files, v2-gated only; ExplainLine + TrustChip reused |
| 8ff5e1f | I7 academy/pricing + docs | copy_changes.md, extension_listing.md, 06_assets_and_pages.md |
| 53fe986 | fix | empty-state copy gated by BRAND_V2 |

## Measurements
- `vitest run src/components/feed src/lib/feed` (Windows): **117/117 passed**.
- `tsc --noEmit`: clean in every touched file. Pre-existing errors only under `.next/types` for `src/app/api/og/share/*` routes (last touched 2026-02-25).
- `next build` with `NEXT_PUBLIC_THEME_V2=true` (Windows): **Compiled successfully in 46 s**; `/` 90.3 kB (388 kB first load), `/feed` 257 kB, `/academy` 420 kB, `/pricing` 187 kB. Two pre-existing warnings (`delay-[2000ms]` ambiguous class).
- Lint baseline: 733 six-digit hex literals under `src/components/**/*.tsx` (ESLint not installed locally; grep baseline).

## Not done yet (I8)
- Screenshot grid (8 routes × light/dark × 375/1280 × en/ar) and Lighthouse — needs a running dev server on Windows + Playwright; run `npm run dev` then `npx playwright test e2e --project=chromium` after adding a screenshot spec.
- Arabic strings (keys only; native review pending).
- `npm install` so `next lint` runs with the new hex rule.
- Cut-over: preview on Vercel for 48 h → Basha approves → production flag.

## Notes
- Flag off = unchanged: every change is `v2:`-gated or `BRAND_V2`-conditional; tests on the flag-off path pass.
- Placeholder mark/icons in `public/brand/` until a logo file is added to the Brand System.
- `docs/sprint11/i3_edit.py` is the idempotent I3 edit script, kept for reference.
