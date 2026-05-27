# PromptGuard Dashboard — Discovery

Target app: `C:\Users\ahmed el bahi\PromptTemplev0.01` (NOT the `promptcord/` repo the
original plan assumed). Built to the REAL backend API contract + this app's real
shadcn/ui + Pharaonic Tailwind conventions, overriding the plan's mock/CSS stack.

## Styling
- System: **TAILWIND** (^3.4) + **shadcn/ui** (Radix). `darkMode: ["class"]`.
- Tokens used: HSL CSS-var Tailwind classes from `tailwind.config.ts` — `bg-card`,
  `text-foreground`, `text-primary` (Egyptian blue), `text-accent`/`bg-accent` (gold),
  `text-muted-foreground`, `border-border`, `bg-secondary`, `text-destructive`.
- Score colors: `text-emerald-500` (>=4), `text-accent` (>=3), `text-destructive` (<3).
- NO new CSS file, NO `pg-*` classes, NO hardcoded hex (per task override of the plan).
- Note: the older `(dashboard)/home/page.tsx` uses a legacy `text-text-primary`/`bg-bg-*`
  token set, but the canonical shadcn tokens (`card`,`foreground`,`accent`,…) are what the
  UI components and tailwind config actually define, so I used those.

## UI library
- shadcn/ui present. Reused: Card/CardHeader/CardTitle/CardContent, Button, Badge
  (variants confirmed: default, secondary, destructive, outline, success, warning),
  Progress, Dialog/DialogContent/DialogHeader/DialogTitle/DialogDescription, Skeleton.
- lucide-react ^0.428 available.

## Route placement
- Chosen: `src/app/(shell)/promptguard/page.tsx`.
- `(shell)/layout.tsx` is a pass-through; chrome (sidebar/navbar) comes from the root
  layout's `<AppLayoutWithSidebar>`. No auth gate, no middleware.ts → ideal for a public page.

## Data layer
- React Query (`@tanstack/react-query` ^5). `QueryProvider` is mounted in the root layout,
  so hooks work in `(shell)` pages. Mirrored `src/lib/hooks/useCore.ts` patterns
  (useQuery + queryKey + refetchInterval; useMutation + invalidateQueries).

## API client convention
- Base URL: env `NEXT_PUBLIC_API_BASE_URL` (default `https://api.prompt-temple.com`).
  PromptGuard endpoints are PUBLIC (no auth). No new env var added.
- Client: native `fetch(..., {cache:'no-store'})`, throws on `!res.ok`.
- Built to the REAL contract (dashboard-state / proposals/{id}/full / approve / reject /
  incidents/trigger), with a `NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS==='true'` escape hatch.

## Decisions
- Files created ONLY under `src/app/(shell)/promptguard/**` plus the two allowed additive
  files `src/lib/api/promptguard.ts` and `src/lib/hooks/usePromptGuard.ts`. No existing file modified.
- Modal uses shadcn `Dialog` (handles Escape + overlay close + focus trap natively) instead
  of the plan's hand-rolled overlay.
- Responsive: single column on mobile, 3-col grid (1 sidebar + 2 main) at `lg`.
