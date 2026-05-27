/**
 * PromptGuard API client.
 *
 * Talks to the PUBLIC (no-auth) PromptGuard endpoints on the Django backend.
 * Base URL reuses the app-wide `NEXT_PUBLIC_API_BASE_URL` env var (no new env).
 *
 * A mock escape hatch (`NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS === 'true'`) returns
 * a small inline payload so the dashboard renders even if the backend is down.
 */
import type {
  ApprovalResponse,
  DashboardState,
  DiagnoserTrail,
  EvalRunAgentTrail,
  EvalRunCases,
  EvaluateActiveResponse,
  ProposalFull,
  ProposalFullError,
  RejectResponse,
  TriggerEvalRunResponse,
  TriggerIncidentResponse,
} from '@/app/(shell)/promptguard/lib/types';

const API =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com') +
  '/api/promptguard';

const USE_MOCKS = process.env.NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS === 'true';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `PromptGuard API ${path} -> ${res.status}: ${text.slice(0, 200)}`
    );
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Inline mocks (only used when NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS === 'true')
// ---------------------------------------------------------------------------
const MOCK_DASHBOARD_STATE: DashboardState = {
  active_version: {
    id: '72a7598a-0000-0000-0000-000000000002',
    version_id: '72a7598a-0000-0000-0000-000000000002',
    version: 2,
    label: 'v2-from-proposal-f029e5ac',
    activated_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    prompt_keys: ['general', 'technical', 'creative', 'business'],
  },
  latest_eval: {
    run_id: 'mock-run-id',
    overall_score: 3.475,
    per_type_scores: { general: 3.1, technical: 3.8, creative: 3.8, business: 3.2 },
    sample_size: 20,
    evaluated_version_label: 'v2-from-proposal-f029e5ac',
    evaluated_at: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
  },
  feedback_summary_24h: [
    { signal: 'accept', count: 47 },
    { signal: 'dismiss', count: 12 },
    { signal: 'save', count: 8 },
  ],
  feedback_total_24h: 67,
  open_incidents: 1,
  recent_incidents: [
    {
      id: 'inc-0a8c-1234',
      status: 'resolved',
      diagnosis: { baseline: 4.0, current: 2.5 },
      created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
  ],
  pending_proposals: [
    {
      id: 'prop-7f12-pending',
      status: 'awaiting_approval',
      score_delta: 1.47,
      baseline_score: 2.5,
      candidate_score: 3.97,
      rationale_preview:
        'The current prompt set lacks specificity in technical and business contexts. ' +
        'Recent traces show users receiving vague rewrites without preserved intent. ' +
        'Candidate restores structured guidance and adds output format hints.',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
};

const MOCK_PROPOSAL_FULL: ProposalFull = {
  id: 'prop-7f12-pending',
  status: 'awaiting_approval',
  rationale:
    'The current v2 prompt set ("Make the prompt better.") removed all structured ' +
    'guidance, causing flash rewrites to lose specificity. Across 6 of 20 eval cases, ' +
    'the rewrites scored below 2.5/5 on output_format and intent_preservation. ' +
    'The candidate v3 reintroduces role assignment, output schema specification, ' +
    'and explicit intent-preservation language. Expected lift: +1.47 overall.',
  baseline_score: 2.5,
  candidate_score: 3.97,
  score_delta: 1.47,
  candidate_system_prompts: {
    general:
      "You are an expert prompt engineer. Rewrite the user's prompt to be specific, " +
      'intent-preserving, and clear about the desired output format. Preserve the ' +
      "user's original goal exactly.",
    technical:
      'You are a senior software engineer rewriting a technical prompt. Add ' +
      'specificity about the technology stack, expected output (code? explanation? ' +
      'design?), and preserve the engineering intent of the original request.',
    creative:
      'You are a creative writing instructor. Rewrite the prompt to enrich sensory ' +
      "and stylistic guidance while preserving the user's creative vision.",
    business:
      'You are a business strategy consultant. Rewrite the prompt with industry-aware ' +
      'framing, specific deliverables, and a clear audience.',
  },
  candidate_rag_suffixes: {
    non_stream:
      '\n\nRelevant reference prompts retrieved from the library (use as inspiration):\n',
    stream:
      '\n\nRelevant reference prompts retrieved from the library (use as inspiration):\n',
  },
  current_active: {
    version: 2,
    label: 'v2-from-proposal-f029e5ac',
    system_prompts: {
      general: 'Make the prompt better.',
      technical: 'Make the prompt better.',
      creative: 'Make the prompt better.',
      business: 'Make the prompt better.',
    },
    rag_suffixes: { non_stream: '', stream: '' },
  },
  eval_run: {
    id: 'eval-mock-001',
    overall_score: 3.97,
    per_type_scores: { general: 3.9, technical: 4.1, creative: 3.9, business: 4.0 },
    sample_size: 20,
  },
  incident_id: 'inc-0a8c-1234',
  created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
};

// ---------------------------------------------------------------------------
// Public client
// ---------------------------------------------------------------------------
export async function getDashboardState(): Promise<DashboardState> {
  if (USE_MOCKS) return Promise.resolve(MOCK_DASHBOARD_STATE);
  return fetchJson<DashboardState>('/dashboard-state');
}

export async function getProposalFull(
  id: string
): Promise<ProposalFull | ProposalFullError> {
  if (USE_MOCKS) return Promise.resolve(MOCK_PROPOSAL_FULL);
  return fetchJson<ProposalFull | ProposalFullError>(`/proposals/${id}/full`);
}

export async function approveProposal(
  id: string,
  approver: string = 'demo-user'
): Promise<ApprovalResponse> {
  if (USE_MOCKS) {
    return Promise.resolve({ ok: true, new_version: 3, version_id: 'mock-v3' });
  }
  return fetchJson<ApprovalResponse>(
    `/proposals/${id}/approve?approver=${encodeURIComponent(approver)}`,
    { method: 'POST' }
  );
}

export async function rejectProposal(
  id: string,
  reason: string = ''
): Promise<RejectResponse> {
  if (USE_MOCKS) return Promise.resolve({ ok: true });
  return fetchJson<RejectResponse>(
    `/proposals/${id}/reject?reason=${encodeURIComponent(reason)}`,
    { method: 'POST' }
  );
}

export async function triggerIncident(): Promise<TriggerIncidentResponse> {
  if (USE_MOCKS) {
    return Promise.resolve({
      ok: true,
      accepted: true,
      incident_id: 'mock-incident',
      task_id: 'mock-task',
      status_url: '/api/promptguard/incidents/mock-incident/status',
    });
  }
  return fetchJson<TriggerIncidentResponse>('/incidents/trigger', {
    method: 'POST',
  });
}

/**
 * Run a REAL evaluation of the live active prompt set (worker-side, LLM-judged).
 * The dashboard then reflects the new eval score + any incident/proposal that
 * real regression detection opens on the next poll.
 */
export async function evaluateActive(): Promise<EvaluateActiveResponse> {
  if (USE_MOCKS) {
    return Promise.resolve({
      ok: true,
      accepted: true,
      evaluating_version: 2,
      task_id: 'mock-eval',
    });
  }
  return fetchJson<EvaluateActiveResponse>('/evaluate-active', {
    method: 'POST',
  });
}

/** True if a getProposalFull response is the not-found error shape. */
export function isProposalError(
  p: ProposalFull | ProposalFullError
): p is ProposalFullError {
  return (p as ProposalFullError).ok === false;
}

// ---------------------------------------------------------------------------
// Story 4.1 — reasoning drill-down clients (+ mocks)
// ---------------------------------------------------------------------------
const PHOENIX_BASE =
  process.env.NEXT_PUBLIC_PHOENIX_BASE_URL || 'https://app.phoenix.arize.com';
const PHOENIX_PROJECT =
  process.env.NEXT_PUBLIC_ARIZE_PROJECT_NAME || 'prompt-temple-forge';

/** Phoenix Cloud deep-link for a single trace (used by drill-downs). */
export function phoenixTraceUrl(traceId: string): string {
  return `${PHOENIX_BASE}/projects/${PHOENIX_PROJECT}/traces/${traceId}`;
}

const MOCK_EVAL_RUN_CASES: EvalRunCases = {
  run_id: 'mock-run-id',
  evaluated_version_label: 'v2-from-proposal-f029e5ac',
  overall_score: 3.475,
  sample_size: 20,
  cases: [
    {
      case_id: 'case-001',
      enhancement_type: 'creative',
      original_prompt: 'write me a story',
      rewritten_prompt:
        'Write a 500-word story in [genre] featuring a protagonist who...',
      dimensions: { clarity: 2, specificity: 2, intent: 3, output_format: 2 },
      overall_score: 2.25,
      judge_reasoning:
        'The rewrite added some structure but failed to elicit the specific ' +
        'genre or tone, leaving the prompt nearly as vague as the original on ' +
        'the creative dimension.',
      trace_id: 'trace-xyz-001',
    },
    {
      case_id: 'case-002',
      enhancement_type: 'technical',
      original_prompt: 'fix my bug',
      rewritten_prompt:
        'Given the following stack trace and code, identify the root cause and ' +
        'propose a minimal fix with reasoning...',
      dimensions: { clarity: 5, specificity: 4, intent: 5, output_format: 5 },
      overall_score: 4.75,
      judge_reasoning:
        'Strong rewrite — added concrete structure (stack trace + code + ' +
        'reasoning) and preserved the debugging intent precisely.',
      trace_id: 'trace-xyz-002',
    },
  ],
};

const MOCK_AGENT_TRAIL: EvalRunAgentTrail = {
  run_id: 'mock-run-id',
  phoenix_project_url: `${PHOENIX_BASE}/projects/${PHOENIX_PROJECT}`,
  steps: [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
      action: 'evaluate_prompt_set',
      details: "Ran 20-case eval on 'v2-from-proposal-f029e5ac' → overall 3.48/5.0",
      trace_id: null,
      trace_url: null,
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
      action: 'score_creative',
      details: 'creative: 2.25/5.0',
      trace_id: null,
      trace_url: null,
    },
  ],
  model_used: 'gemini-2.5-pro',
  vertex_used: true,
};

const MOCK_DIAGNOSER_TRAIL: DiagnoserTrail = {
  proposal_id: 'prop-7f12-pending',
  rationale: MOCK_PROPOSAL_FULL.rationale,
  diagnoser_model: 'gemini-2.5-pro',
  baseline_score: 2.5,
  candidate_score: 3.97,
  score_delta: 1.47,
  trace_ids: [],
  trace_urls: [],
  phoenix_project_url: `${PHOENIX_BASE}/projects/${PHOENIX_PROJECT}`,
};

export async function getEvalRunCases(runId: string): Promise<EvalRunCases> {
  if (USE_MOCKS) return Promise.resolve(MOCK_EVAL_RUN_CASES);
  return fetchJson<EvalRunCases>(`/eval-runs/${runId}/cases`);
}

export async function getEvalRunAgentTrail(
  runId: string
): Promise<EvalRunAgentTrail> {
  if (USE_MOCKS) return Promise.resolve(MOCK_AGENT_TRAIL);
  return fetchJson<EvalRunAgentTrail>(`/eval-runs/${runId}/agent-trail`);
}

export async function getProposalDiagnoserTrail(
  proposalId: string
): Promise<DiagnoserTrail> {
  if (USE_MOCKS) return Promise.resolve(MOCK_DIAGNOSER_TRAIL);
  return fetchJson<DiagnoserTrail>(`/proposals/${proposalId}/diagnoser-trail`);
}

// ---------------------------------------------------------------------------
// Sprint 5 — live agent: trigger a streamed eval + the SSE URL
// ---------------------------------------------------------------------------

/** Start a fresh streamed eval of the live prompt set; returns the run id to
 *  connect the SSE stream to. */
export async function triggerEvalRun(): Promise<TriggerEvalRunResponse> {
  if (USE_MOCKS) {
    return Promise.resolve({ ok: true, run_id: 'mock-run-' + Date.now() });
  }
  return fetchJson<TriggerEvalRunResponse>('/eval-runs/trigger', {
    method: 'POST',
  });
}

/** The Server-Sent-Events URL for a run. Consumed by useEvalStream via the
 *  native EventSource (not fetch), so we expose the absolute URL here to keep
 *  the API base in one place. */
export function promptguardStreamUrl(runId: string): string {
  return `${API}/eval-runs/${runId}/stream`;
}
