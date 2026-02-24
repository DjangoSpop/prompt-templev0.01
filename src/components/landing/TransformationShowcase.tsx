'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const EXAMPLES = [
  {
    category: 'Marketing',
    before: 'Write a social media post about our new product launch.',
    after: 'You are a viral social media strategist who has generated 100M+ impressions. Craft a launch post for [PRODUCT] on [PLATFORM] that hooks in the first 3 words, uses the AIDA framework, includes a pattern-interrupt emoji strategy, and ends with a question that drives comments. Tone: bold, confident, slightly irreverent. Max 280 chars for Twitter, 2200 for Instagram.',
    beforeScore: 2.1,
    afterScore: 9.2,
  },
  {
    category: 'Coding',
    before: 'Help me fix this bug in my React code.',
    after: 'You are a senior React engineer with expertise in debugging complex state management issues. I have a [DESCRIBE BUG] in a component using [HOOKS/CONTEXT/REDUX]. The expected behavior is [EXPECTED], but instead [ACTUAL]. My React version is [VERSION]. Walk me through: 1) Likely root causes ranked by probability, 2) Step-by-step debugging approach, 3) The fix with a code diff, 4) How to prevent this class of bug in the future.',
    beforeScore: 1.5,
    afterScore: 9.6,
  },
  {
    category: 'Analysis',
    before: 'Analyze this data for me.',
    after: 'You are a senior data analyst at a Fortune 500 consultancy. Analyze the following dataset: [PASTE DATA]. Provide: 1) Executive summary (3 sentences max), 2) Key patterns and anomalies with statistical significance, 3) Three actionable recommendations ranked by impact, 4) Visualization suggestions for presenting findings to non-technical stakeholders. Format: use headers, bullet points, and bold key metrics.',
    beforeScore: 1.2,
    afterScore: 9.5,
  },
]

export function TransformationShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!sectionRef.current || !trackRef.current) return

    // On reduced motion — show all cards without animation
    if (prefersReduced) return

    // Only enable horizontal scroll on ≥ 768 px
    const isWide = window.innerWidth >= 768
    if (!isWide) return

    const ctx = gsap.context(() => {
      const totalPanels = EXAMPLES.length
      gsap.to(trackRef.current, {
        x: `-${(totalPanels - 1) * 100}vw`,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          // pinSpacing ensures the page reserves exact scroll room — no black gap
          pinSpacing: true,
          scrub: 1,
          snap: { snapTo: 1 / (totalPanels - 1), duration: 0.35, ease: 'power2.inOut' },
          end: `+=${totalPanels * 80}%`,
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden md:min-h-screen md:flex md:flex-col"
      // Explicit background prevents black flash when ScrollTrigger pins this section
      style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #0A0A18 50%, #0D0D0D 100%)' }}
    >
      {/* Section header (always visible) */}
      <div className="text-center pt-20 pb-10 px-4 shrink-0">
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0E6D3] mb-3">
          The <span className="text-[#F5C518]">Transformation</span>
        </h2>
        <p className="text-[#D4B896]/60 font-crimson text-lg max-w-xl mx-auto">
          See how PromptTemple elevates ordinary prompts into masterful AI instructions
        </p>
      </div>

      {/* Desktop: horizontal scroll track — flex-1 fills remaining viewport height, items-center vertically centers cards */}
      <div className="hidden md:flex md:flex-1 md:items-center">
        <div
          ref={trackRef}
          className="flex"
          style={{ width: `${EXAMPLES.length * 100}vw` }}
        >
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="w-screen flex-shrink-0 flex items-center justify-center px-8">
              <ExampleCard example={ex} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden space-y-8 px-4 pb-16">
        {EXAMPLES.map((ex, i) => (
          <ExampleCard key={i} example={ex} index={i} />
        ))}
      </div>
    </section>
  )
}

function ExampleCard({ example, index }: { example: typeof EXAMPLES[0]; index: number }) {
  return (
    <div className="max-w-4xl w-full">
      {/* Category pill */}
      <div className="flex justify-center mb-6">
        <span className="text-xs font-mono text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/20 px-4 py-1.5 rounded-full tracking-wider uppercase">
          {example.category}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="rounded-2xl border border-red-500/20 bg-[#1A0A0A]/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-red-400/80 bg-red-400/10 px-3 py-1 rounded-full">BEFORE</span>
            <span className="text-xs text-red-400/60 font-mono">{example.beforeScore}/10</span>
          </div>
          <p className="font-mono text-sm text-[#F0E6D3]/50 leading-relaxed">
            {example.before}
          </p>
          {/* Score bar */}
          <div className="mt-4 h-1.5 rounded-full bg-red-900/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500/60"
              style={{ width: `${example.beforeScore * 10}%` }}
            />
          </div>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-[#F5C518]/20 bg-[#1A1200]/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-[#F5C518] bg-[#F5C518]/10 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AFTER
            </span>
            <span className="text-xs text-[#F5C518]/80 font-mono">{example.afterScore}/10</span>
          </div>
          <p className="font-mono text-xs text-[#F0E6D3]/80 leading-relaxed">
            {example.after}
          </p>
          {/* Score bar */}
          <div className="mt-4 h-1.5 rounded-full bg-[#F5C518]/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5C518] to-[#D4A012]"
              style={{ width: `${example.afterScore * 10}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
