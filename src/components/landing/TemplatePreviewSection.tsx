'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const PREVIEW_TEMPLATES = [
  {
    title: 'Email Marketing Campaign',
    category: 'Marketing',
    description: 'Craft high-converting email sequences with proven copywriting frameworks.',
    uses: 8420,
    rating: 9.4,
  },
  {
    title: 'Code Review Assistant',
    category: 'Coding',
    description: 'Get thorough, senior-level code reviews with actionable improvement suggestions.',
    uses: 12300,
    rating: 9.7,
  },
  {
    title: 'Data Analysis Report',
    category: 'Analysis',
    description: 'Transform raw data into executive-ready insights with clear recommendations.',
    uses: 6100,
    rating: 9.2,
  },
  {
    title: 'Blog Post Writer',
    category: 'Writing',
    description: 'Generate SEO-optimized, engaging blog posts that rank and convert.',
    uses: 15600,
    rating: 9.5,
  },
  {
    title: 'Product Description',
    category: 'E-Commerce',
    description: 'Write compelling product descriptions that drive purchases and reduce returns.',
    uses: 9800,
    rating: 9.1,
  },
  {
    title: 'Interview Prep Coach',
    category: 'Career',
    description: 'Practice with realistic interview questions and get expert feedback on answers.',
    uses: 7200,
    rating: 9.6,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 } as const,
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  } as const,
}

export function TemplatePreviewSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.preview-card', { opacity: 1, y: 0, rotation: 0 })
      return
    }

    const mobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      gsap.from('.preview-card', {
        rotation: mobile ? 0 : ((i: number) => -6 + i * 3),
        y: mobile ? 30 : 60,
        opacity: 0,
        stagger: mobile ? 0.06 : 0.08,
        duration: mobile ? 0.5 : 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: mobile ? 'top 88%' : 'top 75%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0E6D3] mb-3">
            From the <span className="text-[#F5C518]">Temple Library</span>
          </h2>
          <p className="text-[#D4B896]/60 font-crimson text-lg max-w-xl mx-auto">
            Battle-tested prompt templates used by thousands of AI builders
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {PREVIEW_TEMPLATES.map((template, i) => (
            <motion.div
              key={i}
              className="preview-card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 60px rgba(245, 197, 24, 0.12)',
                transition: { duration: 0.2 },
              }}
            >
              <div className="rounded-2xl border border-[#F5C518]/15 bg-gradient-to-br from-[#1A1200]/80 to-[#0D0D0D]/90 backdrop-blur-xl overflow-hidden group">
                {/* Golden accent bar */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#F5C518] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6">
                  {/* Category badge */}
                  <span className="text-[10px] font-mono text-[#F5C518]/70 bg-[#F5C518]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {template.category}
                  </span>

                  {/* Title */}
                  <h3 className="font-cinzel text-lg text-[#F0E6D3] mt-3 mb-2 group-hover:text-[#F5C518] transition-colors duration-200">
                    {template.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#D4B896]/60 leading-relaxed line-clamp-2 font-crimson">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F5C518]/10 text-xs text-[#D4B896]/50">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.uses.toLocaleString()} uses
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#F5C518]/60" />
                      {template.rating}/10
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/templates">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-[#F5C518]/30 text-[#F5C518] font-cinzel font-medium hover:bg-[#F5C518]/10 transition-colors"
            >
              Explore All Templates
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  )
}
