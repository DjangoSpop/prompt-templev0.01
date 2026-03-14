'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Wand2 } from 'lucide-react';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { BroadcastModelState } from '@/types/broadcast';

interface ScoringPanelProps {
  models: BroadcastModelState[];
  comparisonSummary?: string;
  winnerName?: string;
  onBestOfAll?: () => void;
}

const AXES = ['completeness', 'clarity', 'accuracy', 'creativity'] as const;

export const ScoringPanel: React.FC<ScoringPanelProps> = ({
  models,
  comparisonSummary,
  winnerName,
  onBestOfAll,
}) => {
  const scoredModels = models.filter((model) => model.scores && !model.error);

  if (scoredModels.length < 2) {
    return null;
  }

  const chartData = AXES.map((axis) => {
    const row: Record<string, string | number> = {
      metric: axis.charAt(0).toUpperCase() + axis.slice(1),
    };

    for (const model of scoredModels) {
      row[model.name] = model.scores?.[axis] ?? 0;
    }

    return row;
  });

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1E3A8A]" />
            Comparison Scoring
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Radar view across completeness, clarity, accuracy, and creativity.
          </p>
        </div>

        {winnerName && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.06, 1], opacity: 1 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold text-sm"
          >
            <Crown className="w-4 h-4" />
            Winner: {winnerName}
          </motion.div>
        )}
      </div>

      <div className="h-[340px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis domain={[0, 10]} tickCount={6} />
            <Tooltip />
            <Legend />
            {scoredModels.map((model, index) => {
              const palette = ['#1E3A8A', '#0E7490', '#C9A227', '#4F46E5'];
              const color = palette[index % palette.length];

              return (
                <Radar
                  key={model.provider}
                  name={model.name}
                  dataKey={model.name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {comparisonSummary && (
        <div className="mt-4 rounded-xl border border-[#EBD5A7] dark:border-[#1E3A8A] bg-[#EBD5A7]/30 dark:bg-[#1E3A8A]/20 p-4 text-sm text-gray-700 dark:text-gray-300">
          {comparisonSummary}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onBestOfAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1E3A8A] to-[#0E7490] text-white text-sm font-semibold hover:opacity-95"
        >
          <Wand2 className="w-4 h-4" />
          Best of All
        </button>
      </div>
    </section>
  );
};
