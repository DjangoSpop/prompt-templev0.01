'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 47000, suffix: '+', label: 'Prompts Optimized', prefix: '' },
  { value: 500, suffix: '+', label: 'Templates Available', prefix: '' },
  { value: 12000, suffix: '+', label: 'AI Builders', prefix: '' },
  { value: 9.4, suffix: '/10', label: 'Avg Improvement Score', prefix: '' },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // If reduced motion, display final values immediately
    if (prefersReduced) {
      sectionRef.current.querySelectorAll<HTMLElement>('.stat-number').forEach((el) => {
        const target = parseFloat(el.dataset.value || '0')
        el.textContent = target % 1 !== 0
          ? target.toFixed(1)
          : Math.floor(target).toLocaleString()
      })
      return
    }

    const mobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll<HTMLElement>('.stat-number').forEach((el) => {
        const target = parseFloat(el.dataset.value || '0')
        const isDecimal = target % 1 !== 0

        gsap.from(el, {
          textContent: 0,
          duration: mobile ? 1.4 : 2,
          ease: 'power2.out',
          snap: isDecimal ? { textContent: 0.1 } : { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: mobile ? 'top 92%' : 'top 85%',
            once: true,
          },
          onUpdate() {
            const current = parseFloat(el.textContent || '0')
            el.textContent = isDecimal
              ? current.toFixed(1)
              : Math.floor(current).toLocaleString()
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5C518] mb-2">
                {stat.prefix}
                <span className="stat-number" data-value={stat.value}>
                  0
                </span>
                <span className="text-[#F5C518]/70">{stat.suffix}</span>
              </div>
              <p className="text-sm text-[#D4B896]/60 font-crimson">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="max-w-xs mx-auto mt-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#F5C518]/30" />
        <span className="text-[#F5C518]/30 text-lg">𓋹</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#F5C518]/30" />
      </div>
    </section>
  )
}
