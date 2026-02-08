/**
 * ROICalculator Interactive Component
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Clock3, TrendingUp, Wallet } from 'lucide-react';

interface ROICalculatorProps {
  onStateChange?: (state: {
    promptsPerDay: number;
    minutesPerPrompt: number;
    hourlyRate: number;
    weeklyTimeSavedHours: number;
    weeklyMoneySaved: number;
    annualValue: number;
  }) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ROICalculator({ onStateChange }: ROICalculatorProps) {
  const [promptsPerDay, setPromptsPerDay] = useState(15);
  const [minutesPerPrompt, setMinutesPerPrompt] = useState(6);
  const [hourlyRate, setHourlyRate] = useState(75);

  const calculations = useMemo(() => {
    const promptsPerWeek = promptsPerDay * 5;
    const weeklyPromptMinutes = promptsPerWeek * minutesPerPrompt;
    const wastedMinutes = weeklyPromptMinutes * 0.45;
    const savedMinutes = wastedMinutes * 0.5;

    const weeklyTimeSavedHours = savedMinutes / 60;
    const weeklyMoneySaved = weeklyTimeSavedHours * hourlyRate;
    const annualValue = weeklyMoneySaved * 52;

    return {
      weeklyPromptMinutes,
      weeklyTimeSavedHours,
      weeklyMoneySaved,
      annualValue,
    };
  }, [promptsPerDay, minutesPerPrompt, hourlyRate]);

  useEffect(() => {
    onStateChange?.({
      promptsPerDay,
      minutesPerPrompt,
      hourlyRate,
      weeklyTimeSavedHours: calculations.weeklyTimeSavedHours,
      weeklyMoneySaved: calculations.weeklyMoneySaved,
      annualValue: calculations.annualValue,
    });
  }, [promptsPerDay, minutesPerPrompt, hourlyRate, calculations, onStateChange]);

  return (
    <Card className="overflow-hidden border-royal-gold-500/35 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-0">
      <div className="border-b border-royal-gold-500/25 bg-obsidian-900/80 p-5">
        <h3 className="academy-heading-font text-xl text-royal-gold-200">Prompt ROI Calculator</h3>
        <p className="academy-body-font mt-1 text-sm text-desert-sand-200">
          Estimate weekly time recovered and annual productivity value from better prompting.
        </p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-desert-sand-100">
              <span>AI prompts per day</span>
              <span className="academy-display-font text-lg text-royal-gold-300">{promptsPerDay}</span>
            </div>
            <Slider
              min={1}
              max={50}
              value={[promptsPerDay]}
              onValueChange={(value) => setPromptsPerDay(value[0] ?? 1)}
              className="[&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-thumb]]:border-royal-gold-300 [&_[data-radix-slider-thumb]]:bg-royal-gold-500"
              aria-label="Prompts per day"
            />
          </div>

          <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-desert-sand-100">
              <span>Average minutes per prompt</span>
              <span className="academy-display-font text-lg text-royal-gold-300">{minutesPerPrompt} min</span>
            </div>
            <Slider
              min={1}
              max={15}
              value={[minutesPerPrompt]}
              onValueChange={(value) => setMinutesPerPrompt(value[0] ?? 1)}
              className="[&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-thumb]]:border-royal-gold-300 [&_[data-radix-slider-thumb]]:bg-royal-gold-500"
              aria-label="Minutes per prompt"
            />
          </div>

          <div className="rounded-lg border border-royal-gold-500/25 bg-obsidian-950/65 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-desert-sand-100">
              <span>Hourly value</span>
              <span className="academy-display-font text-lg text-royal-gold-300">{formatCurrency(hourlyRate)}</span>
            </div>
            <Slider
              min={20}
              max={500}
              step={5}
              value={[hourlyRate]}
              onValueChange={(value) => setHourlyRate(value[0] ?? 20)}
              className="[&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-thumb]]:border-royal-gold-300 [&_[data-radix-slider-thumb]]:bg-royal-gold-500"
              aria-label="Hourly value"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-nile-teal-500/35 bg-nile-teal-950/20 p-4">
            <div className="flex items-center gap-2 text-nile-teal-300">
              <Clock3 className="h-4 w-4" />
              <span className="academy-heading-font text-xs uppercase tracking-wider">Time Saved / Week</span>
            </div>
            <p className="academy-display-font mt-2 text-3xl text-nile-teal-200">
              {calculations.weeklyTimeSavedHours.toFixed(1)}h
            </p>
          </div>

          <div className="rounded-lg border border-royal-gold-500/35 bg-royal-gold-950/20 p-4">
            <div className="flex items-center gap-2 text-royal-gold-300">
              <Wallet className="h-4 w-4" />
              <span className="academy-heading-font text-xs uppercase tracking-wider">Money Saved / Week</span>
            </div>
            <p className="academy-display-font mt-2 text-3xl text-royal-gold-200">
              {formatCurrency(calculations.weeklyMoneySaved)}
            </p>
          </div>

          <div className="rounded-lg border border-lapis-blue-500/35 bg-lapis-blue-950/25 p-4">
            <div className="flex items-center gap-2 text-lapis-blue-300">
              <TrendingUp className="h-4 w-4" />
              <span className="academy-heading-font text-xs uppercase tracking-wider">Annual Productivity Value</span>
            </div>
            <p className="academy-display-font mt-2 text-3xl text-lapis-blue-200">
              {formatCurrency(calculations.annualValue)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-royal-gold-500/20 bg-obsidian-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-royal-gold-500/30 bg-royal-gold-900/10 p-4">
          <p className="academy-body-font text-sm text-desert-sand-100">
            Save <span className="font-semibold text-royal-gold-200">{calculations.weeklyTimeSavedHours.toFixed(1)} hours/week</span> automatically with the PromptCraft extension.
          </p>
          <Button asChild className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 text-obsidian-950 hover:from-royal-gold-400 hover:to-royal-gold-500">
            <Link href="/download">See How It Works</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
