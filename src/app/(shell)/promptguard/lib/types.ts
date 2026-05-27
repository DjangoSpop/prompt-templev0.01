/**
 * PromptGuard API types.
 *
 * These mirror the REAL Django backend contract at
 * `${NEXT_PUBLIC_API_BASE_URL}/api/promptguard`. Keep shapes in sync with the
 * backend; the dashboard is built directly against these (no mocks required,
 * but a mock escape hatch exists via NEXT_PUBLIC_PROMPTGUARD_USE_MOCKS).
 */

export type ActiveVersion = {
  id: string;
  version_id?: string;
  version: number;
  label: string;
  activated_at: string | null; // ISO-8601
  prompt_keys: string[]; // e.g. ["general","technical","creative","business"]
};

export type EvalSummary = {
  // The latest run's id — lets the dashboard drill into per-case scores (S4.2.6).
  run_id?: string | null;
  // null while a run is still in flight (Sprint 5 pending/running rows).
  overall_score: number | null; // typically 0-5
  per_type_scores: Record<string, number>;
  sample_size: number;
  evaluated_version_label?: string | null;
  evaluated_at?: string | null;
  created_at?: string | null;
};

/** One signal aggregate, e.g. {signal:"accept", count:47}. (Story 4.3) */
export type FeedbackSignalCount = {
  signal: string; // "accept" | "dismiss" | "save" | "regenerate"
  count: number;
};

export type IncidentSummary = {
  id: string;
  status: string; // "open" | "diagnosing" | "evaluating" | "resolved" | ...
  diagnosis: Record<string, unknown>;
  created_at: string;
};

export type PendingProposal = {
  id: string;
  status?: string;
  score_delta: number | null;
  baseline_score: number | null;
  candidate_score: number | null;
  rationale?: string;
  rationale_preview: string;
  created_at: string;
};

export type DashboardState = {
  active_version: ActiveVersion | null;
  latest_eval: EvalSummary | null;
  open_incidents: number;
  recent_incidents: IncidentSummary[];
  pending_proposals: PendingProposal[];
  // Sprint 5 — an in-flight run (pending/running) for the Theater to attach to.
  running_run?: { run_id: string; status: RunStatus } | null;
  // Story 4.3 — last-24h feedback aggregate (absent on older backends).
  feedback_summary_24h?: FeedbackSignalCount[];
  feedback_total_24h?: number;
};

// ---------------------------------------------------------------------------
// Story 4.1 — reasoning endpoints (drill-downs)
// ---------------------------------------------------------------------------
export type EvalCase = {
  case_id: string;
  enhancement_type: string | null; // general | technical | creative | business
  original_prompt: string | null;
  rewritten_prompt: string | null;
  dimensions: Record<string, number>;
  overall_score: number | null;
  judge_reasoning: string | null;
  trace_id: string | null;
};

export type EvalRunCases = {
  run_id: string;
  evaluated_version_label: string;
  overall_score: number;
  sample_size: number;
  cases: EvalCase[];
};

export type AgentTrailStep = {
  timestamp: string;
  action: string;
  details: string;
  trace_id: string | null;
  trace_url: string | null;
};

export type EvalRunAgentTrail = {
  run_id: string;
  phoenix_project_url: string;
  steps: AgentTrailStep[];
  model_used: string;
  vertex_used: boolean;
};

export type DiagnoserTrail = {
  proposal_id: string;
  rationale: string;
  diagnoser_model: string;
  baseline_score: number | null;
  candidate_score: number | null;
  score_delta: number | null;
  trace_ids: string[];
  trace_urls: string[];
  phoenix_project_url: string;
};

export type CurrentActive = {
  version: number;
  label: string;
  system_prompts: Record<string, string>;
  rag_suffixes: Record<string, string>;
};

export type ProposalEvalRun = {
  id: string;
  overall_score: number | null;
  per_type_scores: Record<string, number>;
  sample_size: number;
};

export type ProposalFull = {
  id: string;
  status: string;
  rationale: string;
  baseline_score: number | null;
  candidate_score: number | null;
  score_delta: number | null;
  candidate_system_prompts: Record<string, string>;
  candidate_rag_suffixes: Record<string, string>;
  current_active: CurrentActive | null;
  eval_run?: ProposalEvalRun | null;
  incident_id?: string | null;
  created_at: string;
};

export type ProposalFullError = {
  ok: false;
  error: string;
  proposal_id: string;
};

export type ApprovalResponse = {
  ok: boolean;
  new_version: number;
  version_id: string;
};

export type RejectResponse = {
  ok: boolean;
};

export type TriggerIncidentResponse = {
  ok: boolean;
  accepted?: boolean;
  incident_id?: string;
  task_id?: string;
  status_url?: string;
  no_regression?: boolean;
};

export type EvaluateActiveResponse = {
  ok: boolean;
  accepted?: boolean;
  evaluating_version?: number;
  task_id?: string;
  error?: string;
};

// ---------------------------------------------------------------------------
// Sprint 5 — live agent: SSE stream contract (the "Eval Theater")
// Mirrors apps/promptguard/services/run_events.py + the /stream endpoint.
// ---------------------------------------------------------------------------
export type RunStatus = 'pending' | 'running' | 'complete' | 'failed';

/** One scored case as it streams in (live event) or from a snapshot. */
export type StreamCase = {
  case_index?: number;
  case_id: string;
  enhancement_type: string | null;
  score: number;
  dimensions: Record<string, number>;
  reasoning_preview?: string;
};

/** First frame: current DB state, so a client joining mid-run catches up. */
export type SnapshotPayload = {
  run_id: string;
  status: RunStatus;
  current_case_index: number;
  sample_size: number;
  overall_score: number | null;
  evaluated_version_label: string;
  completed_cases: StreamCase[];
};

export type RunStartedPayload = {
  run_id: string;
  version_label: string;
  sample_size: number;
  judge_model?: string;
};

export type CaseStartedPayload = {
  case_index: number;
  case_id: string;
  enhancement_type: string;
  original_prompt_preview: string;
};

export type RunCompletePayload = {
  overall_score: number;
  per_type_scores: Record<string, number>;
  sample_size: number;
};

export type TriggerEvalRunResponse = {
  ok: boolean;
  run_id?: string;
  error?: string;
};
