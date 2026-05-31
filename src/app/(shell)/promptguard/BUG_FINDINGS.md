# BUG_FINDINGS — "Trigger Incident" button does nothing

Date: 2026-05-31 · Posture: verify-then-fix (per FIX_TRIGGER_INCIDENT.md)

## Diagnostic outputs

### 1.1 — Button + handler (frontend)
- File: `src/app/(shell)/promptguard/page.tsx`
- The button WAS already wired:
  ```tsx
  <Button onClick={() => trigger.mutate()} disabled={trigger.isPending}>
    {trigger.isPending ? <Loader2 .../> : <Zap .../>}
    {trigger.isPending ? 'Triggering…' : 'Trigger incident'}
  </Button>
  ```
- `trigger = useTriggerIncident()` (React Query mutation).

### 1.2 — API client
- `src/lib/api/promptguard.ts` → `triggerIncident()` exists and is correct:
  `POST {NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com'}/api/promptguard/incidents/trigger`.
- Hook `src/lib/hooks/usePromptGuard.ts` → `useTriggerIncident` posts and, on
  success, invalidates `['promptguard']` (dashboard refetch). No result handling.

### 1.3 — Backend endpoint
- `apps/promptguard/api/router.py` → `@api.post("/incidents/trigger")` exists.
- Flow: `run_agent_loop()` → `detect_regression()` (inline, DB-only). If a
  regression is found → creates `Incident`, enqueues `diagnose_incident_task`,
  returns `{ok, accepted, incident_id, task_id, status_url}`. **If no regression
  → returns `{ok: true, no_regression: true}`.** No active monitored enhancer →
  `{ok: false, error: "no_active_monitored_enhancer"}`.
- `python manage.py check` (venv) → **System check identified no issues.**

### 1.4 — Production endpoint
- `GET /api/promptguard/dashboard-state` → **200** (API base reachable).
- `GET /api/promptguard/active-version` → **200**, active v2 present.
- (POST trigger not fired in diagnostics — it kicks a real prod workflow.)

## Diagnosis: **Scenario E — endpoint succeeds but no UI feedback**

The button fires and spins correctly. The break is that the mutation result is
never surfaced:
- The healthy/common path `{no_regression: true}` changes nothing on the
  dashboard → looks like "the button does nothing, no error, no state change."
- When an incident IS opened, there's no confirmation the agent started.
- The `{ok: false, error: ...}` guard path is silently swallowed.

## Fix applied (frontend only, surgical)
- `src/app/(shell)/promptguard/lib/types.ts`: added `error?: string` to
  `TriggerIncidentResponse` (matches backend guard shape).
- `src/app/(shell)/promptguard/page.tsx`: added `handleTrigger()` that calls
  `trigger.mutate(undefined, { onSuccess, onError })` and surfaces the result via
  sonner `toast` (global `<Toaster/>` already mounted in `providers/AppProviders.tsx`):
  - `ok === false` → error toast with the backend reason.
  - `no_regression` → "No regression detected — the live prompt set is healthy."
  - `incident_id` → "Incident opened — the agent is diagnosing now (<id8>). Watch
    the activity stream below." (Dashboard polls every 2s + invalidation, so the
    ActivityStream / PendingProposalCard reflect the agent's progress.)
  - thrown error → error toast.
  - Button now `onClick={handleTrigger}`.

## Verification
- `tsc --noEmit`: no errors in touched files.
- Backend `manage.py check`: clean.
- Production API reachable (200s above).
- Localhost smoke test + prod redeploy: pending user confirmation before push.
