'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface InsightItem {
  text: string;
  confidence: number;
}

interface AIInsightCardProps {
  items: InsightItem[];
  className?: string;
}

export function AIInsightCard({ items, className = '' }: AIInsightCardProps) {
  if (!items || items.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (confidence >= 0.6) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <TrendingUp className="w-3 h-3" />;
    return <Lightbulb className="w-3 h-3" />;
  };

  return (
    <motion.div
      className={`bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3
          className="font-semibold text-amber-200 text-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sacred Insights
        </h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3"
            variants={itemVariants}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getConfidenceColor(
                  item.confidence
                )}`}
              >
                {getConfidenceIcon(item.confidence)}
                {Math.round(item.confidence * 100)}%
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
