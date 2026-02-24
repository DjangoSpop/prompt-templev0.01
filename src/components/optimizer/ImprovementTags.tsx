'use client';

import { motion } from 'framer-motion';
import {
  Brain, Target, MessageSquare, Layers, Shield, Zap, BookOpen,
  Users, Code2, Sparkles, ListChecks, Eye, Lightbulb, TrendingUp,
} from 'lucide-react';

export interface ImprovementTag {
  id: string;
  label: string;
  description?: string;
  type: 'structure' | 'context' | 'persona' | 'constraint' | 'output' | 'reasoning' | 'style';
}

interface ImprovementTagsProps {
  tags: ImprovementTag[];
  animate?: boolean;
}

const TAG_STYLES: Record<ImprovementTag['type'], { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  persona: {
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.3)',
    icon: <Users className="w-3 h-3" />,
  },
  context: {
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.3)',
    icon: <Target className="w-3 h-3" />,
  },
  structure: {
    color: '#F5C518',
    bg: 'rgba(245,197,24,0.1)',
    border: 'rgba(245,197,24,0.3)',
    icon: <Layers className="w-3 h-3" />,
  },
  constraint: {
    color: '#F87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.3)',
    icon: <Shield className="w-3 h-3" />,
  },
  output: {
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.3)',
    icon: <ListChecks className="w-3 h-3" />,
  },
  reasoning: {
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.3)',
    icon: <Brain className="w-3 h-3" />,
  },
  style: {
    color: '#E879F9',
    bg: 'rgba(232,121,249,0.1)',
    border: 'rgba(232,121,249,0.3)',
    icon: <Sparkles className="w-3 h-3" />,
  },
};

export function ImprovementTags({ tags, animate: shouldAnimate = true }: ImprovementTagsProps) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => {
        const style = TAG_STYLES[tag.type] || TAG_STYLES.context;
        return (
          <motion.div
            key={tag.id}
            initial={shouldAnimate ? { opacity: 0, scale: 0.7, y: 10 } : undefined}
            animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : undefined}
            transition={{ duration: 0.35, delay: shouldAnimate ? i * 0.07 : 0, ease: [0.23, 1, 0.32, 1] }}
            title={tag.description}
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-default select-none transition-all duration-200 hover:scale-105"
            style={{
              color: style.color,
              background: style.bg,
              border: `1px solid ${style.border}`,
            }}
          >
            {style.icon}
            <span>{tag.label}</span>

            {/* Tooltip */}
            {tag.description && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs text-white bg-[#1A1A2E] border border-[rgba(255,255,255,0.1)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
              >
                {tag.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1A1A2E]" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Parse raw AI improvements list into structured ImprovementTag objects */
export function parseImprovements(raw: string[] | undefined): ImprovementTag[] {
  if (!raw?.length) return [];
  return raw.map((item, i) => {
    const lower = item.toLowerCase();
    let type: ImprovementTag['type'] = 'context';
    if (lower.includes('role') || lower.includes('persona') || lower.includes('act as')) type = 'persona';
    else if (lower.includes('chain') || lower.includes('reasoning') || lower.includes('step')) type = 'reasoning';
    else if (lower.includes('format') || lower.includes('structure') || lower.includes('outline')) type = 'structure';
    else if (lower.includes('output') || lower.includes('markdown') || lower.includes('json') || lower.includes('list')) type = 'output';
    else if (lower.includes('constraint') || lower.includes('limit') || lower.includes('avoid') || lower.includes('don\'t')) type = 'constraint';
    else if (lower.includes('tone') || lower.includes('style') || lower.includes('voice')) type = 'style';
    return { id: `imp-${i}`, label: item, type };
  });
}

/** Default improvement tags shown when no AI response yet */
export const SAMPLE_IMPROVEMENT_TAGS: ImprovementTag[] = [
  { id: 's1', label: 'Role Injection', type: 'persona', description: 'Added expert persona for authority and context' },
  { id: 's2', label: 'Chain-of-Thought', type: 'reasoning', description: 'Added step-by-step reasoning framework' },
  { id: 's3', label: 'Output Format', type: 'output', description: 'Specified structured output with sections' },
  { id: 's4', label: 'Context Anchoring', type: 'context', description: 'Added relevant background and constraints' },
  { id: 's5', label: 'Target Audience', type: 'context', description: 'Defined who the output is for' },
  { id: 's6', label: 'Tone Defined', type: 'style', description: 'Set appropriate voice and formality level' },
];
