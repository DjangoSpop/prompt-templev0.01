/**
 * BeforeAfterTransformer Interactive Component
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  bad: string;
  good: string;
  why: string[];
}

interface BeforeAfterTransformerProps {
  onStateChange?: (state: { scenarioId: string; transformed: boolean }) => void;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'marketing',
    title: 'Marketing Email',
    bad: 'Write something about our product.',
    good: 'Write a 140-word launch email for CTOs at SaaS startups. Tone: confident and concise. Include 3 bullet benefits and a clear CTA.',
    why: ['Adds target audience', 'Defines length and format', 'Adds clear conversion goal'],
  },
  {
    id: 'analysis',
    title: 'Data Analysis',
    bad: 'Analyze this sales data.',
    good: 'Analyze Q4 sales data by region. Return top 3 anomalies, possible causes, and 2 action recommendations in table format.',
    why: ['Defines dataset scope', 'Requests decision-ready output', 'Specifies table format'],
  },
  {
    id: 'support',
    title: 'Support Reply',
    bad: 'Reply to this customer complaint.',
    good: 'Draft a 120-word support response to a delayed shipment complaint. Tone: empathetic, accountable, solution-focused. Include next steps.',
    why: ['Adds tone and accountability', 'Constrains output length', 'Forces actionable close'],
  },
];

export default function BeforeAfterTransformer({ onStateChange }: BeforeAfterTransformerProps) {
  const [index, setIndex] = useState(0);
  const [transformed, setTransformed] = useState(false);

  const scenario = SCENARIOS[index];

  useEffect(() => {
    onStateChange?.({ scenarioId: scenario.id, transformed });
  }, [scenario.id, transformed, onStateChange]);

  return (
    <Card className="border-royal-gold-500/35 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="academy-heading-font text-xl text-royal-gold-200">Before / After Transformer</h3>
        <div className="flex items-center gap-2">
          {SCENARIOS.map((item, itemIndex) => (
            <button
              key={item.id}
              onClick={() => {
                setIndex(itemIndex);
                setTransformed(false);
              }}
              className={`rounded-md px-2 py-1 text-xs ${
                itemIndex === index
                  ? 'bg-royal-gold-900/30 text-royal-gold-100'
                  : 'bg-obsidian-900/60 text-desert-sand-200 hover:text-royal-gold-200'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-red-500/35 bg-red-950/20 p-4">
          <p className="academy-heading-font text-xs uppercase tracking-wider text-red-300">Before</p>
          <p className="academy-code-font mt-2 text-sm text-desert-sand-100">{scenario.bad}</p>
        </div>
        <div className="rounded-lg border border-nile-teal-500/35 bg-nile-teal-950/20 p-4">
          <p className="academy-heading-font text-xs uppercase tracking-wider text-nile-teal-300">After</p>
          <p className="academy-code-font mt-2 text-sm text-desert-sand-100">
            {transformed ? scenario.good : 'Click transform to reveal optimized version.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => setTransformed(true)} className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 text-obsidian-950">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Transform
        </Button>
      </div>

      {transformed && (
        <div className="mt-4 rounded-lg border border-royal-gold-500/30 bg-obsidian-950/65 p-4">
          <p className="academy-heading-font text-xs uppercase tracking-wider text-royal-gold-200">Why this is better</p>
          <ul className="academy-body-font mt-2 space-y-1 text-sm text-desert-sand-100">
            {scenario.why.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
