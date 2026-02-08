/**
 * PromptBuilder Interactive Component
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';

interface PromptBuilderProps {
  scenario?: string;
  onStateChange?: (state: {
    slotValues: Record<string, string>;
    qualityScore: number;
    tested: boolean;
  }) => void;
}

interface Ingredient {
  id: string;
  slot: SlotKey;
  label: string;
  text: string;
}

type SlotKey = 'context' | 'constraints' | 'clarity' | 'examples' | 'format' | 'instructions';

const SLOT_CONFIG: { key: SlotKey; label: string; hint: string; weight: number }[] = [
  { key: 'context', label: 'Context', hint: 'Who are you, what is happening, who is the audience?', weight: 18 },
  { key: 'constraints', label: 'Constraints', hint: 'Length, tone, limits, what to avoid.', weight: 17 },
  { key: 'clarity', label: 'Clarity', hint: 'Exactly what successful output should achieve.', weight: 18 },
  { key: 'examples', label: 'Examples', hint: 'Give style or structure examples.', weight: 15 },
  { key: 'format', label: 'Format', hint: 'Specify table, bullets, JSON, sections, etc.', weight: 16 },
  { key: 'instructions', label: 'Instructions', hint: 'The direct action request for the model.', weight: 16 },
];

const INGREDIENTS: Ingredient[] = [
  {
    id: 'context-role',
    slot: 'context',
    label: 'Role + audience context',
    text: 'I am a project manager updating cross-functional stakeholders about sprint progress and blockers.',
  },
  {
    id: 'constraints-length',
    slot: 'constraints',
    label: 'Length + tone constraints',
    text: 'Keep under 180 words. Use a confident and clear tone. Avoid technical jargon.',
  },
  {
    id: 'clarity-target',
    slot: 'clarity',
    label: 'Outcome clarity',
    text: 'Highlight completed work, top blocker, risk level, and next 7-day plan.',
  },
  {
    id: 'examples-style',
    slot: 'examples',
    label: 'Style example',
    text: 'Example style: "Progress: 80% complete. Blocker: API rate limit. Mitigation: queue batching in progress."',
  },
  {
    id: 'format-structure',
    slot: 'format',
    label: 'Structured format',
    text: 'Format as 4 bullet sections: Completed, Blockers, Risks, Next Actions.',
  },
  {
    id: 'instructions-task',
    slot: 'instructions',
    label: 'Direct task instruction',
    text: 'Write the status update email now using the structure above.',
  },
];

const DEFAULT_SCENARIO =
  'You are a project manager who needs to send a weekly sprint status update email to your team and stakeholders.';

function calculateQuality(slotValues: Record<string, string>) {
  let score = 0;
  for (const slot of SLOT_CONFIG) {
    const value = (slotValues[slot.key] || '').trim();
    if (!value) continue;

    const lengthFactor = Math.min(value.length / 110, 1);
    const specificityBonus = /\d|under|format|audience|tone|risk|example/i.test(value) ? 1 : 0.8;
    score += slot.weight * lengthFactor * specificityBonus;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateSimulatedResponse(score: number) {
  if (score < 40) return 'Output is generic and misses critical project signal. Stakeholders still need follow-up clarification.';
  if (score < 70) return 'Output is acceptable but lacks consistent formatting and precise risk communication.';
  if (score < 85) return 'Output is strong and structured. Most stakeholders can act without additional clarification.';
  return 'Output is executive-ready: concise, structured, actionable, and aligned with stakeholder expectations.';
}

export default function PromptBuilder({ scenario = DEFAULT_SCENARIO, onStateChange }: PromptBuilderProps) {
  const [selectedSlot, setSelectedSlot] = useState<SlotKey>('context');
  const [slotValues, setSlotValues] = useState<Record<string, string>>({});
  const [hasTestedPrompt, setHasTestedPrompt] = useState(false);

  const qualityScore = useMemo(() => calculateQuality(slotValues), [slotValues]);
  const builtPrompt = useMemo(() => {
    return SLOT_CONFIG.map((slot) => {
      const value = slotValues[slot.key];
      return value ? `[${slot.label}] ${value}` : '';
    })
      .filter(Boolean)
      .join('\n\n');
  }, [slotValues]);

  useEffect(() => {
    onStateChange?.({
      slotValues,
      qualityScore,
      tested: hasTestedPrompt,
    });
  }, [slotValues, qualityScore, hasTestedPrompt, onStateChange]);

  const qualityTone =
    qualityScore < 40
      ? 'text-red-300'
      : qualityScore < 75
        ? 'text-yellow-300'
        : 'text-nile-teal-300';

  const currentSlot = SLOT_CONFIG.find((slot) => slot.key === selectedSlot)!;

  const applyIngredient = (ingredient: Ingredient) => {
    setSlotValues((prev) => ({
      ...prev,
      [ingredient.slot]: ingredient.text,
    }));
    setSelectedSlot(ingredient.slot);
  };

  return (
    <Card className="overflow-hidden border-royal-gold-500/35 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-0">
      <div className="border-b border-royal-gold-500/25 bg-obsidian-900/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="academy-heading-font text-xl text-royal-gold-200">CCCEFI Prompt Builder</h3>
            <p className="academy-body-font mt-1 text-sm text-desert-sand-200">{scenario}</p>
          </div>
          <div className={`academy-display-font text-3xl ${qualityTone}`}>{qualityScore}%</div>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
            <p className="academy-heading-font text-xs uppercase tracking-wider text-desert-sand-300">Prompt Template Slots</p>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {SLOT_CONFIG.map((slot) => {
                const filled = Boolean(slotValues[slot.key]?.trim());
                return (
                  <button
                    key={slot.key}
                    type="button"
                    onClick={() => setSelectedSlot(slot.key)}
                    className={`rounded-md border px-3 py-2 text-xs transition ${
                      selectedSlot === slot.key
                        ? 'border-royal-gold-400 bg-royal-gold-900/20 text-royal-gold-100'
                        : filled
                          ? 'border-nile-teal-500/50 bg-nile-teal-900/15 text-nile-teal-100'
                          : 'border-desert-sand-600/35 bg-obsidian-900/60 text-desert-sand-200 hover:border-royal-gold-500/60'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-nile-teal-500/30 bg-nile-teal-950/15 p-4">
            <p className="academy-heading-font text-xs uppercase tracking-wider text-nile-teal-200">
              Editing: {currentSlot.label}
            </p>
            <p className="academy-body-font mt-2 text-xs text-desert-sand-200">{currentSlot.hint}</p>
            <textarea
              value={slotValues[currentSlot.key] ?? ''}
              onChange={(event) =>
                setSlotValues((prev) => ({
                  ...prev,
                  [currentSlot.key]: event.target.value,
                }))
              }
              rows={4}
              className="academy-body-font mt-3 w-full resize-y rounded-md border border-desert-sand-600/35 bg-obsidian-950/75 p-3 text-sm text-desert-sand-100 focus:border-royal-gold-400 focus:outline-none"
              placeholder={`Add ${currentSlot.label.toLowerCase()}...`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
            <p className="academy-heading-font text-xs uppercase tracking-wider text-desert-sand-300">Ingredient Shelf</p>
            <div className="mt-3 space-y-2">
              {INGREDIENTS.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => applyIngredient(ingredient)}
                  className="w-full rounded-md border border-desert-sand-600/35 bg-obsidian-900/60 px-3 py-2 text-left text-xs text-desert-sand-100 transition hover:border-royal-gold-500/60 hover:bg-royal-gold-950/20"
                >
                  <span className="academy-heading-font text-[10px] uppercase tracking-wider text-royal-gold-200">
                    {SLOT_CONFIG.find((slot) => slot.key === ingredient.slot)?.label}
                  </span>
                  <p className="academy-body-font mt-1">{ingredient.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-royal-gold-500/30 bg-obsidian-950/70 p-4">
            <p className="academy-heading-font text-xs uppercase tracking-wider text-desert-sand-300">Built Prompt</p>
            <pre className="academy-code-font mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-obsidian-700 bg-obsidian-900/80 p-3 text-xs text-desert-sand-100">
              {builtPrompt || 'Fill at least 2 slots to start building your prompt.'}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => setHasTestedPrompt(true)}
                className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 text-obsidian-950 hover:from-royal-gold-400 hover:to-royal-gold-500"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Test This Prompt
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSlotValues({});
                  setHasTestedPrompt(false);
                  setSelectedSlot('context');
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {hasTestedPrompt && (
        <div className="border-t border-royal-gold-500/25 bg-obsidian-900/70 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-nile-teal-500/35 bg-nile-teal-950/20 p-4">
              <div className="flex items-center gap-2 text-nile-teal-300">
                <Sparkles className="h-4 w-4" />
                <span className="academy-heading-font text-xs uppercase tracking-wider">Your Result</span>
              </div>
              <p className="academy-body-font mt-3 text-sm text-desert-sand-100">
                {generateSimulatedResponse(qualityScore)}
              </p>
            </div>
            <div className="rounded-lg border border-royal-gold-500/35 bg-royal-gold-950/20 p-4">
              <p className="academy-heading-font text-xs uppercase tracking-wider text-royal-gold-200">
                Expert Pattern
              </p>
              <p className="academy-body-font mt-3 text-sm text-desert-sand-100">
                PromptCraft Multi-Intelligence mode would test this across GPT, Claude, and Gemini, then merge best sections for higher reliability.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
