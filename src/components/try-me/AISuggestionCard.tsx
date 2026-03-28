'use client';

import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AISuggestionCardProps {
  items: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export function AISuggestionCard({
  items,
  onSuggestionClick,
  className = ''
}: AISuggestionCardProps) {
  if (!items || items.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
  };

  return (
    <motion.div
      className={`bg-white/[0.03] border border-amber-500/10 rounded-xl p-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3
          className="font-semibold text-amber-200/80 text-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Next Steps
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((suggestion, index) => (
          <motion.div key={index} variants={chipVariants}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestionClick?.(suggestion)}
              className="h-auto px-3 py-1.5 text-xs bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-400/30 text-amber-300/80 hover:text-amber-200 rounded-full transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              {suggestion}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
