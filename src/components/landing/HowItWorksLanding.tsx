'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    number: '𓊪',
    title: 'Paste Your Prompt',
    description: 'Enter any rough prompt — even a single sentence. No signup required.',
    icon: '01',
  },
  {
    number: '𓂀',
    title: 'Sacred Transformation',
    description: 'Our AI analyzes structure, context, specificity, and clarity, then rewrites it to perfection.',
    icon: '02',
  },
  {
    number: '𓋹',
    title: 'Receive Your Masterpiece',
    description: 'Get a Pharaoh-level prompt with a WOW Score, ready to paste into any AI tool.',
    icon: '03',
  },
]

export function HowItWorksLanding() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.hw-pillar, .hw-connector', { opacity: 1, y: 0, scaleX: 1 })
      return
    }

    const mobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      gsap.from('.hw-pillar', {
        y: mobile ? 50 : 100,
        opacity: 0,
        stagger: mobile ? 0.1 : 0.15,
        duration: mobile ? 0.5 : 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: mobile ? 'top 85%' : 'top 75%',
          once: true,
        },
      })

      // Connecting line — only on desktop where columns are side-by-side
      if (!mobile) {
        gsap.from('.hw-connector', {
          scaleX: 0,
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            once: true,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0E6D3] mb-3">
            How the <span className="text-[#F5C518]">Temple</span> Works
          </h2>
          <p className="text-[#D4B896]/60 font-crimson text-lg">
            Three steps to prompt mastery
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hw-connector hidden md:block absolute top-[60px] left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-[#F5C518]/30 via-[#F5C518]/60 to-[#F5C518]/30 origin-left" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="hw-pillar text-center">
                {/* Pillar top */}
                <div className="relative mx-auto w-[120px] h-[120px] mb-6">
                  {/* Egyptian pillar shape */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#F5C518]/20 to-[#F5C518]/5 border border-[#F5C518]/20 flex items-center justify-center">
                    <span className="text-4xl">{step.number}</span>
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#F5C518] text-[#0D0D0D] text-xs font-bold flex items-center justify-center font-mono">
                    {step.icon}
                  </div>
                </div>

                {/* Text */}
                <h3 className="font-cinzel text-xl font-bold text-[#F0E6D3] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#D4B896]/60 font-crimson leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
