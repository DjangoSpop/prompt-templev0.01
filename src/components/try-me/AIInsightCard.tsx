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
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <TrendingUp className="w-3 h-3" />;
    return <Lightbulb className="w-3 h-3" />;
  };

  return (
    <motion.div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
          AI Insights
        </h3>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3"
            variants={itemVariants}
          >
            <div className="flex-shrink-0 mt-1">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                  item.confidence
                )}`}
              >
                {getConfidenceIcon(item.confidence)}
                {Math.round(item.confidence * 100)}%
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}