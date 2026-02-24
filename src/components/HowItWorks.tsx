'use client';

import { motion } from 'framer-motion';
import { PenLine, Brain, ScrollText } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: <PenLine className="w-7 h-7" />,
    title: 'Inscribe Your Scroll',
    description: 'Type any AI prompt — good, bad, or half-formed. No judgment. The temple welcomes all seekers.',
    color: '#60A5FA',
    glyph: '𓏲',
  },
  {
    number: '02',
    icon: <Brain className="w-7 h-7" />,
    title: 'The Oracle Analyzes',
    description: 'Our DeepSeek-powered AI dissects your prompt against 50+ optimization patterns — persona, structure, constraints, output format, and more.',
    color: '#A78BFA',
    glyph: '𓂀',
  },
  {
    number: '03',
    icon: <ScrollText className="w-7 h-7" />,
    title: 'Temple-Grade Output',
    description: 'Receive your optimized masterpiece with a Wow Score, improvement tags, and a shareable card. From Apprentice to Pharaoh in seconds.',
    color: '#F5C518',
    glyph: '𓋹',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-[#F0E6D3] mb-4"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            The Sacred Process
          </h2>
          <p className="text-[#9CA3AF] text-lg">Three steps to prompt mastery</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #F5C518)' }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center text-center"
              >
                {/* Circle icon */}
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 z-10"
                  style={{
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    color: step.color,
                    boxShadow: `0 0 30px ${step.color}20`,
                  }}
                >
                  {step.icon}
                  <div
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ background: step.color }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Hieroglyphic accent */}
                <div className="text-3xl mb-3 opacity-40" style={{ color: step.color }}>{step.glyph}</div>

                <h3
                  className="text-xl font-bold text-[#F0E6D3] mb-3"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs">{step.description}</p>

                {/* Egyptian pillar divider decoration */}
                <div className="mt-6 w-px h-8 mx-auto opacity-20" style={{ background: step.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
