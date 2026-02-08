/**
 * PromptQualitySlider Interactive Component
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sparkles } from 'lucide-react';

interface PromptStage {
  quality: number;
  prompt: string;
  description: string;
}

interface PromptQualitySliderProps {
  initialPrompt?: string;
  stages?: PromptStage[];
  onStateChange?: (state: {
    quality: number;
    activeStage: PromptStage;
  }) => void;
}

function buildSampleOutput(quality: number) {
  if (quality < 20) return 'Generic advice with little structure and low practical value.';
  if (quality < 40) return 'Some useful points, but still broad and inconsistent in depth.';
  if (quality < 60) return 'Actionable ideas appear, but missing audience precision and constraints.';
  if (quality < 80) return 'Strong output with clear structure and relevant examples for the audience.';
  return 'High-quality first-draft output: focused, constrained, formatted, and decision-ready.';
}

const FALLBACK_STAGES: PromptStage[] = [
  { quality: 0, prompt: 'Write about marketing', description: 'Unclear request. The model must guess everything.' },
  { quality: 25, prompt: 'Write about digital marketing for SaaS', description: 'Topic improved, but still missing format and goal.' },
  { quality: 50, prompt: 'Write 5 digital marketing tactics for B2B SaaS', description: 'Useful direction and scope are now visible.' },
  { quality: 75, prompt: 'Write 5 B2B SaaS tactics for CTO buyers in bullet points', description: 'Audience and structure are now explicit.' },
  { quality: 100, prompt: 'Write 5 B2B SaaS demand-gen tactics for CTO buyers. Keep each bullet under 30 words and include one KPI each.', description: 'Production-grade specificity, constraints, and format.' },
];

export default function PromptQualitySlider({
  initialPrompt,
  stages = FALLBACK_STAGES,
  onStateChange,
}: PromptQualitySliderProps) {
  const [quality, setQuality] = useState(0);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.quality - b.quality),
    [stages]
  );

  const activeStage = useMemo(() => {
    return (
      [...sortedStages].reverse().find((stage) => quality >= stage.quality) ??
      sortedStages[0]
    );
  }, [quality, sortedStages]);

  useEffect(() => {
    if (!activeStage) return;
    onStateChange?.({ quality, activeStage });
  }, [quality, activeStage, onStateChange]);

  const qualityColor =
    quality < 40 ? 'text-red-300' : quality < 70 ? 'text-yellow-300' : 'text-nile-teal-300';

  return (
    <Card className="overflow-hidden border-royal-gold-500/40 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-0">
      <div className="border-b border-royal-gold-500/25 bg-obsidian-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="academy-heading-font text-xl text-royal-gold-200">Prompt Quality Transformer</h3>
            <p className="academy-body-font mt-1 text-sm text-desert-sand-200">
              Move the slider and watch specificity improve output quality.
            </p>
          </div>
          <div className={`academy-display-font text-3xl ${qualityColor}`}>{quality}%</div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
          <p className="academy-heading-font text-xs uppercase tracking-wider text-desert-sand-300">Current Prompt</p>
          <p className="academy-code-font mt-2 text-sm text-desert-sand-100">{activeStage?.prompt || initialPrompt}</p>
          <p className="academy-body-font mt-3 text-sm text-desert-sand-200">{activeStage?.description}</p>

          <div className="mt-5">
            <Slider
              value={[quality]}
              onValueChange={(values) => setQuality(values[0] ?? 0)}
              min={0}
              max={100}
              step={1}
              className="[&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-track]]:bg-obsidian-800 [&_[data-radix-slider-thumb]]:border-royal-gold-300 [&_[data-radix-slider-thumb]]:bg-royal-gold-500"
              aria-label="Prompt quality level"
            />
            <div className="mt-2 flex justify-between text-xs text-desert-sand-300">
              <span>Vague</span>
              <span>Specific</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-2">
            {[20, 40, 60, 80, 100].map((step) => (
              <div key={step} className="rounded-md border border-royal-gold-500/20 bg-obsidian-900/70 p-2 text-center">
                <div
                  className="mx-auto w-3 rounded-sm bg-gradient-to-t from-royal-gold-700 to-royal-gold-300 transition-all"
                  style={{ height: quality >= step ? 28 : 12, opacity: quality >= step ? 1 : 0.35 }}
                />
                <div className="mt-1 text-[10px] text-desert-sand-300">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-nile-teal-500/30 bg-nile-teal-950/20 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-nile-teal-300" />
            <p className="academy-heading-font text-xs uppercase tracking-wider text-nile-teal-200">AI Output Preview</p>
          </div>
          <p className="academy-body-font mt-3 text-sm text-desert-sand-100">{buildSampleOutput(quality)}</p>
          <p className="academy-body-font mt-4 text-xs text-desert-sand-200">
            Quality score rises when you add context, constraints, examples, and explicit format.
          </p>
        </div>
      </div>
    </Card>
  );
}
