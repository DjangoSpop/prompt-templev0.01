'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';
import type { EvalSummary } from '../lib/types';
import { scoreColorClass } from '../lib/format';
import { cn } from '@/lib/utils';
import { EvalCasesDrillDown } from './EvalCasesDrillDown';

/**
 * Story 4.2 — every number here is clickable. Clicking the overall score opens
 * the drill-down with all cases; clicking a per-type score filters to that type
 * (the cases that pulled it down). `runId` comes from the latest eval run; when
 * absent the scores render as plain text (no drill target).
 */
export function EvalScoreCard({
  evalSummary,
  runId,
}: {
  evalSummary: EvalSummary | null;
  runId?: string | null;
}) {
  // null = closed; 'all' = every case; otherwise an enhancement_type filter.
  const [drillType, setDrillType] = useState<string | null>(null);
  const clickable = !!runId;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Latest Eval Score
          </CardTitle>
          <Gauge className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          {!evalSummary || evalSummary.overall_score == null ? (
            <p className="text-sm text-muted-foreground">
              {evalSummary && evalSummary.overall_score == null
                ? 'Evaluation in progress…'
                : 'No eval data yet.'}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline gap-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => setDrillType('all')}
                  aria-label="See all eval cases for this score"
                  className={cn(
                    'text-4xl font-bold',
                    scoreColorClass(evalSummary.overall_score),
                    clickable &&
                      'cursor-pointer rounded transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                  )}
                >
                  {evalSummary.overall_score.toFixed(2)}
                </button>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                over {evalSummary.sample_size} samples
                {evalSummary.evaluated_version_label
                  ? ` · ${evalSummary.evaluated_version_label}`
                  : ''}
                {clickable && (
                  <>
                    {' · '}
                    <em>click any score to see why</em>
                  </>
                )}
              </p>
              <div className="space-y-2 border-t border-border pt-3">
                {Object.entries(evalSummary.per_type_scores).map(([type, score]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-foreground">{type}</span>
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => setDrillType(type)}
                        aria-label={`See ${type} eval cases`}
                        className={cn(
                          'font-semibold',
                          scoreColorClass(score),
                          clickable &&
                            'cursor-pointer rounded transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                        )}
                      >
                        {score.toFixed(2)}
                      </button>
                    </div>
                    <Progress value={(score / 5) * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {runId && (
        <EvalCasesDrillDown
          runId={drillType ? runId : null}
          filterType={drillType === 'all' ? null : drillType}
          onClose={() => setDrillType(null)}
        />
      )}
    </>
  );
}
