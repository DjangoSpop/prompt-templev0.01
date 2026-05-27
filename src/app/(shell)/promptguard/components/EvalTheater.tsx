'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { triggerEvalRun } from '@/lib/api/promptguard';
import { useEvalStream } from '@/lib/hooks/useEvalStream';
import { EvalCaseRow } from './EvalCaseRow';
import { RunStatusBadge } from './RunStatusBadge';

/**
 * The Eval Theater — the dashboard's live centerpiece (Sprint 5). Watch the
 * agent score the prompt set case-by-case in real time, then settle into a
 * review of the final scores. Idle until you trigger a run (or until the last
 * run's id is passed in).
 */
export function EvalTheater({ initialRunId }: { initialRunId: string | null }) {
  const queryClient = useQueryClient();
  const [runId, setRunId] = useState<string | null>(initialRunId);
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const stream = useEvalStream(runId, () => {
    // Final scores changed — let the sidebar cards refresh.
    queryClient.invalidateQueries({ queryKey: ['promptguard'] });
  });

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerError(null);
    try {
      const res = await triggerEvalRun();
      if (res.ok && res.run_id) setRunId(res.run_id);
      else setTriggerError(res.error ?? 'Could not start a run.');
    } catch (e) {
      setTriggerError((e as Error)?.message ?? 'Could not start a run.');
    } finally {
      setTriggering(false);
    }
  };

  const sampleSize =
    stream.finalResult?.sample_size ?? stream.snapshot?.sample_size ?? 20;
  const done = stream.error
    ? false
    : stream.status === 'done' && stream.finalResult != null;
  const isRunning = stream.status === 'streaming' || stream.status === 'connecting';
  const isIdle = !runId || stream.status === 'idle';

  const topScore =
    stream.finalResult?.overall_score ?? stream.snapshot?.overall_score ?? null;

  const subtitle = isIdle
    ? 'The agent is idle — trigger a run to watch it think.'
    : isRunning
      ? `Evaluating case ${Math.min(stream.completedCases.length + 1, sampleSize)} of ${sampleSize}…`
      : done
        ? `Run complete · ${stream.finalResult?.sample_size ?? stream.completedCases.length} cases scored`
        : stream.error
          ? 'Run interrupted.'
          : 'Loading…';

  return (
    <section className="pg-theater">
      <header className="pg-theater-header">
        <div>
          <h2 className="pg-theater-title">Eval Theater</h2>
          <p className="pg-theater-subtitle">{subtitle}</p>
        </div>
        <RunStatusBadge status={stream.status} />
      </header>

      {/* Top-line score */}
      {topScore != null && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pg-theater-score"
        >
          <span className="pg-score-value">{topScore.toFixed(2)}</span>
          <span className="pg-score-denom">/ 5.0</span>
          {stream.snapshot?.evaluated_version_label && (
            <span className="pg-score-label">
              {stream.snapshot.evaluated_version_label}
            </span>
          )}
        </motion.div>
      )}

      {/* Progress rail */}
      {(isRunning || done) && (
        <div className="pg-progress-rail" aria-hidden>
          <motion.div
            className="pg-progress-fill"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, (stream.completedCases.length / sampleSize) * 100)}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Active case — the agent is judging this one right now */}
      <AnimatePresence>
        {stream.activeCase && (
          <motion.div
            key={stream.activeCase.case_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="pg-active-case"
          >
            <span className="pg-active-dot" aria-hidden />
            <span className="pg-active-type">
              {stream.activeCase.enhancement_type}
            </span>
            <span className="pg-active-prompt">
              “{stream.activeCase.original_prompt_preview}”
            </span>
            <span className="pg-active-status">judge thinking…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed cases — slide in as they land */}
      <div className="pg-theater-cases">
        <AnimatePresence initial={false}>
          {stream.completedCases.map((c, idx) => (
            <motion.div
              key={c.case_id ?? idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              layout
            >
              <EvalCaseRow data={c} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Idle / trigger CTA */}
      {(isIdle || done) && (
        <div className="pg-theater-cta">
          <button
            className="pg-btn-primary"
            onClick={handleTrigger}
            disabled={triggering}
          >
            <Sparkles className="h-4 w-4" />
            {triggering
              ? 'Starting…'
              : done
                ? 'Run Another Eval'
                : 'Trigger New Eval Run'}
          </button>
          {done && (
            <p className="pg-theater-hint">
              Click a score in the panel to drill into per-case reasoning.
            </p>
          )}
        </div>
      )}

      {(stream.error || triggerError) && (
        <div className="pg-theater-error">{stream.error ?? triggerError}</div>
      )}
    </section>
  );
}
