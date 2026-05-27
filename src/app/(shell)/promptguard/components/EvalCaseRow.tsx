'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { StreamCase } from '../lib/types';

function scoreClass(s: number | null | undefined): 'high' | 'mid' | 'low' {
  if (s == null) return 'mid';
  if (s >= 4) return 'high';
  if (s >= 3) return 'mid';
  return 'low';
}

/** A score that counts up smoothly when the case lands (Framer Motion). */
function AnimatedScore({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (latest) => latest.toFixed(2));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: 'easeOut' });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

/** One completed eval case, styled with Pharaonic accents. */
export function EvalCaseRow({ data }: { data: StreamCase }) {
  const score = data.score ?? 0;
  return (
    <article className={`pg-case-row pg-score-${scoreClass(data.score)}`}>
      <div className="pg-case-meta">
        <span className="pg-case-type">
          {data.enhancement_type ?? 'general'}
        </span>
        <span className="pg-case-score">
          <AnimatedScore value={score} />
          <span className="pg-case-denom"> / 5</span>
        </span>
      </div>
      {data.dimensions && Object.keys(data.dimensions).length > 0 && (
        <div className="pg-case-dims">
          {Object.entries(data.dimensions).map(([k, v]) => (
            <span key={k} className="pg-dim">
              {k}: <strong>{v}</strong>
            </span>
          ))}
        </div>
      )}
      {data.reasoning_preview && (
        <p className="pg-case-reasoning">“{data.reasoning_preview}”</p>
      )}
    </article>
  );
}
