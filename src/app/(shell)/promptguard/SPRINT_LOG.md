# PromptGuard Dashboard — Sprint Log

## 2026-05-26 — Build (real API + shadcn/Pharaonic theme)

### What was built
- `lib/types.ts` — TS types matching the REAL backend contract (dashboard-state,
  proposals/{id}/full incl. `{ok:false,error,...}` not-found shape, approve/reject, trigger).
- `lib/format.ts` — relative-time / clock / score-color / delta helpers.
- `src/lib/api/promptguard.ts` — fetch client (`NEXT_PUBLIC_API_BASE_URL + /api/promptguard`),
  `cache:'no-store'`, throws on !ok; inline mock escape hatch via
  `NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS==='true'`; `isProposalError()` type guard.
- `src/lib/hooks/usePromptGuard.ts` — `useDashboardState` (queryKey `['promptguard','dashboard']`,
  refetchInterval 2000), `useApproveProposal`, `useRejectProposal`, `useTriggerIncident`
  (invalidate `['promptguard']` onSuccess).
- `components/`: ActiveVersionCard, EvalScoreCard (per-type Progress bars), ActivityStream
  (feed from recent_incidents + pending_proposals, sorted desc), PendingProposalCard,
  ProposalDetailModal (shadcn Dialog, loads full proposal, score comparison, PromptDiff,
  Approve/Reject via mutation hooks, closes on success), PromptDiff (red/green per-key blocks),
  EmptyState.
- `page.tsx` — `'use client'`, useDashboardState, Skeleton loading, error EmptyState,
  header with "Trigger incident" button, responsive 3-col grid (sidebar + activity).

### Decisions
- Used the REAL API contract, not the plan's mocks (mocks kept only behind the env flag).
- Overrode the plan's `pg-*` CSS / locked-hex tokens with this app's shadcn + Tailwind
  CSS-var tokens (`bg-card`, `text-accent`, etc.) per task instructions.
- ProposalDetailModal data load uses React Query (`['promptguard','proposal',id]`) rather than
  a raw useEffect, for consistency with the app's data layer.
- Score colors paired with numeric text for a11y (not color-only).

### Constraints honored
- Created files only under `src/app/(shell)/promptguard/**` + the two allowed additive files.
- No existing file, layout, config, or global CSS modified. No dependencies added.

### Blockers
- None. All required UI component exports and the React Query provider exist as expected.

### Verification
- See final report for `npm run type-check` results.
