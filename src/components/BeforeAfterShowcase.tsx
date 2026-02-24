'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Star, TrendingUp, Code2, BarChart3 } from 'lucide-react';

interface ShowcaseItem {
  category: string;
  icon: React.ReactNode;
  iconColor: string;
  before: {
    text: string;
    score: number;
    label: string;
  };
  after: {
    text: string;
    score: number;
    label: string;
  };
  improvements: string[];
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    category: 'Marketing',
    icon: <TrendingUp className="w-4 h-4" />,
    iconColor: '#F5C518',
    before: {
      text: 'Write me a product description for my new app.',
      score: 2.1,
      label: 'Apprentice',
    },
    after: {
      text: `Act as a senior conversion copywriter. Write a compelling 150-word product description for a B2B SaaS productivity app targeting CTOs at Series-A startups. Emphasize ROI, seamless integration, and a 14-day free trial CTA. Use the PAS (Problem-Agitate-Solution) framework. Tone: authoritative yet approachable. End with a one-line urgency hook.`,
      score: 9.7,
      label: 'Pharaoh',
    },
    improvements: ['+Role Injection', '+Framework', '+Target Audience', '+CTA Spec'],
  },
  {
    category: 'Coding',
    icon: <Code2 className="w-4 h-4" />,
    iconColor: '#818CF8',
    before: {
      text: 'Help me write a Python function to sort a list.',
      score: 1.8,
      label: 'Apprentice',
    },
    after: {
      text: `You are a senior Python engineer specializing in performance-critical systems. Write a well-documented Python function that sorts a list of dictionaries by multiple keys (primary: 'priority' descending, secondary: 'created_at' ascending). Include: type hints, docstring with Args/Returns/Example, edge-case handling for empty lists and None values, and a brief complexity note. Python 3.11+. Follow PEP 8.`,
      score: 9.4,
      label: 'High Priest',
    },
    improvements: ['+Chain-of-Thought', '+Type Hints', '+Edge Cases', '+Docs Spec'],
  },
  {
    category: 'Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    iconColor: '#10B981',
    before: {
      text: 'Analyze this data and tell me what you find.',
      score: 1.5,
      label: 'Apprentice',
    },
    after: `You are a senior data analyst with expertise in consumer behavior. Analyze the provided Q3 2024 e-commerce dataset. Structure your analysis as: 1) Executive Summary (3 bullets), 2) Key Findings with statistical significance, 3) Anomalies & Root-Cause Hypotheses, 4) Actionable Recommendations (prioritized by impact). Format: markdown with tables. Confidence intervals required for all percentages. Flag data quality issues if found.`,
    improvements: ['+Output Format', '+Context Anchoring', '+Structure', '+Confidence Spec'],
  } as unknown as ShowcaseItem,
];

// Fix the array definition
const SHOWCASE: ShowcaseItem[] = [
  SHOWCASE_ITEMS[0],
  SHOWCASE_ITEMS[1],
  {
    category: 'Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    iconColor: '#10B981',
    before: {
      text: 'Analyze this data and tell me what you find.',
      score: 1.5,
      label: 'Apprentice',
    },
    after: {
      text: `You are a senior data analyst with expertise in consumer behavior. Analyze the provided Q3 2024 e-commerce dataset. Structure your analysis as: 1) Executive Summary (3 bullets), 2) Key Findings with statistical significance, 3) Anomalies & Root-Cause Hypotheses, 4) Actionable Recommendations (prioritized by impact). Format: markdown with tables. Confidence intervals required for all percentages. Flag data quality issues if found.`,
      score: 9.2,
      label: 'High Priest',
    },
    improvements: ['+Output Format', '+Context Anchoring', '+Structure', '+Confidence Spec'],
  },
];

function ScoreBadge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        <Star className="w-3 h-3 fill-current" />
        {score}/10
      </div>
      <span className="text-xs text-[#D4B896]">{label}</span>
    </div>
  );
}

function ShowcaseCard({ item, index }: { item: ShowcaseItem; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 600 + index * 400);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!revealed) return;
    let i = 0;
    const full = item.after.text;
    const interval = setInterval(() => {
      setTypewriterText(full.slice(0, i));
      i += 4;
      if (i > full.length) {
        setTypewriterText(full);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [revealed, item.after.text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-2xl overflow-hidden border border-[rgba(245,197,24,0.12)] bg-[rgba(13,13,13,0.7)] backdrop-blur-xl"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
    >
      {/* Category header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[rgba(245,197,24,0.1)]">
        <span style={{ color: item.iconColor }}>{item.icon}</span>
        <span className="text-sm font-semibold" style={{ color: item.iconColor }}>
          {item.category}
        </span>
        <div className="ml-auto flex gap-1.5">
          {item.improvements.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: `${item.iconColor}15`,
                color: item.iconColor,
                border: `1px solid ${item.iconColor}30`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Before */}
        <div className="p-5 border-r border-[rgba(245,197,24,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold">Before</span>
            <ScoreBadge score={item.before.score} label={item.before.label} color="#EF4444" />
          </div>
          <p className="text-sm text-[#9CA3AF] font-mono leading-relaxed bg-[rgba(239,68,68,0.04)] rounded-lg p-3 border border-[rgba(239,68,68,0.1)]">
            {item.before.text}
          </p>
        </div>

        {/* Arrow divider - desktop */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{ x: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F5C518, #C9A227)', boxShadow: '0 0 20px rgba(245,197,24,0.4)' }}
          >
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.div>
        </div>

        {/* After */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: item.iconColor }}>
              After
            </span>
            <ScoreBadge score={item.after.score} label={item.after.label} color="#10B981" />
          </div>
          <AnimatePresence>
            {revealed ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-mono leading-relaxed rounded-lg p-3 border"
                style={{
                  color: '#E5E7EB',
                  background: `${item.iconColor}08`,
                  borderColor: `${item.iconColor}25`,
                  boxShadow: `0 0 20px ${item.iconColor}10`,
                  minHeight: 80,
                }}
              >
                {typewriterText}
                {typewriterText.length < item.after.text.length && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                )}
              </motion.p>
            ) : (
              <div className="h-20 rounded-lg bg-[rgba(255,255,255,0.03)] animate-pulse border border-[rgba(255,255,255,0.05)]" />
            )}
          </AnimatePresence>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
              <span className="text-xs text-[#F5C518] font-medium">
                Elevated to temple standards 𓂀
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function BeforeAfterShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(245,197,24,0.3)] bg-[rgba(245,197,24,0.05)] text-[#F5C518] text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            The Transformation
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Cinzel, serif', color: '#F0E6D3' }}
          >
            From Scribe to Pharaoh
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Watch ordinary prompts become extraordinary — in seconds.
          </p>
        </motion.div>

        <div className="space-y-6">
          {SHOWCASE.map((item, i) => (
            <ShowcaseCard key={item.category} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
