'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const EXAMPLES = [
  {
    category: 'Marketing',
    before: 'Write a social media post about our new product launch.',
    after: 'You are a viral social media strategist who has generated 100M+ impressions. Craft a launch post for [PRODUCT] on [PLATFORM] that hooks in the first 3 words, uses the AIDA framework, includes a pattern-interrupt emoji strategy, and ends with a question that drives comments. Tone: bold, confident, slightly irreverent. Max 280 chars for Twitter, 2200 for Instagram.',
    beforeScore: 2.1,
    afterScore: 9.2,
    index: '01',
  },
  {
    category: 'Coding',
    before: 'Help me fix this bug in my React code.',
    after: 'You are a senior React engineer with expertise in debugging complex state management issues. I have a [DESCRIBE BUG] in a component using [HOOKS/CONTEXT/REDUX]. The expected behavior is [EXPECTED], but instead [ACTUAL]. My React version is [VERSION]. Walk me through: 1) Likely root causes ranked by probability, 2) Step-by-step debugging approach, 3) The fix with a code diff, 4) How to prevent this class of bug in the future.',
    beforeScore: 1.5,
    afterScore: 9.6,
    index: '02',
  },
  {
    category: 'Analysis',
    before: 'Analyze this data for me.',
    after: 'You are a senior data analyst at a Fortune 500 consultancy. Analyze the following dataset: [PASTE DATA]. Provide: 1) Executive summary (3 sentences max), 2) Key patterns and anomalies with statistical significance, 3) Three actionable recommendations ranked by impact, 4) Visualization suggestions for presenting findings to non-technical stakeholders. Format: use headers, bullet points, and bold key metrics.',
    beforeScore: 1.2,
    afterScore: 9.5,
    index: '03',
  },
]

const headerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
}

const panelVariants = {
  hidden: { opacity: 0, y: 70 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
}

export function TransformationShowcase() {
  return (
    <section className="bg-[#08080A] py-24 px-4 relative overflow-hidden">
      {/* Subtle gold dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] [background-image:radial-gradient(circle,#F5C518_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-20"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-[#F5C518]/30 text-xl tracking-widest">
            <span>𓊪</span><span>𓂀</span><span>𓊪</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F0E6D3]">
            The{' '}
            <span className="text-[#F5C518] [text-shadow:0_0_50px_rgba(245,197,24,0.4)]">
              Transformation
            </span>
          </h2>
          <p className="text-[#D4B896]/55 font-crimson text-lg mt-3 max-w-lg mx-auto">
            From primitive thought to Pharaoh-level precision
          </p>
        </motion.div>

        {/* ── Example panels ─────────────────────────────────────────────── */}
        <div className="space-y-20">
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={i}
              variants={panelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {/* Panel meta row */}
              <div className="flex items-center gap-4 mb-6">
                {/* Step number */}
                <div className="w-9 h-9 rounded-full border border-[#F5C518]/30 bg-[#F5C518]/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-mono text-[#F5C518] font-bold">{ex.index}</span>
                </div>

                {/* Category badge */}
                <span className="text-[10px] font-mono text-[#F5C518]/60 uppercase tracking-[0.3em] border border-[#F5C518]/15 px-3 py-1 rounded-full">
                  {ex.category}
                </span>

                {/* Progress line */}
                <div className="flex-1 h-px bg-gradient-to-r from-[#F5C518]/20 to-transparent" />

                {/* Panel number indicator */}
                <div className="flex gap-1.5 shrink-0">
                  {EXAMPLES.map((_, j) => (
                    <div
                      key={j}
                      className={`h-[2px] rounded-full transition-all ${
                        j === i ? 'w-5 bg-[#F5C518]' : 'w-2 bg-[#F5C518]/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Before / After cards */}
              <ExampleCard example={ex} />

              {/* Connector to next panel */}
              {i < EXAMPLES.length - 1 && (
                <div className="flex flex-col items-center mt-14 gap-1 text-[#F5C518]/20">
                  <div className="w-px h-8 bg-gradient-to-b from-[#F5C518]/20 to-transparent" />
                  <span className="text-xs font-mono tracking-widest">𓊪</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function ExampleCard({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1.4fr] items-stretch gap-3 md:gap-0">

      {/* Before */}
      <div className="rounded-2xl border border-red-500/20 bg-[#130800]/80 p-5 backdrop-blur-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-widest bg-red-400/10 px-2.5 py-0.5 rounded">
            Before
          </span>
          <span className="text-xs text-red-400/60 font-mono">{example.beforeScore}/10</span>
        </div>
        <p className="font-crimson text-[15px] text-white/35 italic leading-relaxed flex-1">
          &ldquo;{example.before}&rdquo;
        </p>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-red-400/60"
            style={{ width: `${example.beforeScore * 10}%` }}
          />
        </div>
      </div>

      {/* Eye of Ra divider */}
      <div className="hidden md:flex flex-col items-center justify-center gap-1 text-[#F5C518]/30">
        <div className="w-px flex-1 bg-gradient-to-b from-transparent to-[#F5C518]/20" />
        <span className="text-2xl">𓂀</span>
        <div className="w-px flex-1 bg-gradient-to-t from-transparent to-[#F5C518]/20" />
      </div>

      {/* After */}
      <div className="rounded-2xl border border-[#F5C518]/25 bg-gradient-to-br from-[#1A1300]/90 to-[#0A0800]/90 p-5 backdrop-blur-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-28 h-28 bg-[#F5C518]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono text-[#F5C518] uppercase tracking-widest bg-[#F5C518]/10 px-2.5 py-0.5 rounded flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5" /> Temple Enhanced
          </span>
          <span className="text-xs text-[#F5C518] font-mono font-semibold">{example.afterScore}/10</span>
        </div>
        <p className="font-mono text-[11px] sm:text-xs text-[#F0E6D3]/80 leading-relaxed flex-1 relative z-10">
          {example.after}
        </p>
        <div className="relative z-10">
          <div className="h-1 rounded-full bg-[#F5C518]/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F5C518]"
              style={{
                width: `${example.afterScore * 10}%`,
                boxShadow: '0 0 8px rgba(245,197,24,0.6)',
              }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}
