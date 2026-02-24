'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ParticleField } from '@/components/animations/ParticleField'

const BEFORE_PROMPT = 'Write me an email about marketing'
const AFTER_PROMPT = `You are an elite email marketing strategist with 15+ years of experience in conversion copywriting. Craft a high-converting email campaign for [PRODUCT] targeting [AUDIENCE]. Include: a curiosity-driven subject line (under 50 chars), a pattern-interrupt opening hook, 3 value propositions using the PAS framework, and a single clear CTA. Tone: authoritative yet conversational. Length: 200-300 words.`

const TITLE_WORDS = ['Where', 'Every', 'Prompt', 'Becomes', 'Sacred']

export function LandingHeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [showAfter, setShowAfter] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // GSAP entrance animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!sectionRef.current) return

    // Ensure content is visible if animations are skipped
    if (prefersReduced) {
      gsap.set('.hero-word, .hero-subtitle, .hero-cta, .hero-demo', { opacity: 1, y: 0, scale: 1 })
      return
    }

    const mobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 })

      tl.from('.hero-word', {
        y: mobile ? 40 : 80,
        opacity: 0,
        rotateX: mobile ? -15 : -45,
        stagger: mobile ? 0.08 : 0.12,
        duration: mobile ? 0.5 : 0.7,
        ease: 'power4.out',
        transformOrigin: 'bottom center',
      })

      .from('.hero-subtitle', { y: mobile ? 16 : 30, opacity: 0, duration: mobile ? 0.4 : 0.6 }, '-=0.3')

      .from('.hero-cta', {
        scale: 0.85,
        opacity: 0,
        duration: mobile ? 0.35 : 0.5,
        ease: 'back.out(1.5)',
        stagger: 0.1,
      }, '-=0.2')

      .from('.hero-demo', { y: mobile ? 20 : 40, opacity: 0, duration: mobile ? 0.4 : 0.6 }, '-=0.3')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Typing animation for the "before" prompt
  useEffect(() => {
    if (!isTyping) return
    const text = BEFORE_PROMPT
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
        setIsTyping(false)
        // Auto-trigger transformation after typing completes
        setTimeout(() => setShowAfter(true), 800)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [isTyping])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
    >
      <ParticleField count={15} className="z-0" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Title */}
        <h1 className="font-cinzel text-4xl sm:text-5xl md:text-7xl font-bold text-[#F0E6D3] mb-6 leading-tight"
            style={{ perspective: '600px' }}>
          {TITLE_WORDS.map((word, i) => (
            <span key={i} className="hero-word inline-block mr-3 md:mr-4">
              {word === 'Sacred' ? (
                <span className="text-[#F5C518]">{word}</span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-lg sm:text-xl text-[#D4B896]/80 max-w-2xl mx-auto mb-10 font-crimson">
          Transform primitive thoughts into Pharaoh-level AI commands. Free. Forever.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/templates" className="hero-cta">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#D4A012] text-[#0D0D0D] font-cinzel font-bold text-lg tracking-wide shadow-lg shadow-[#F5C518]/20 hover:shadow-[#F5C518]/40 transition-shadow"
            >
              Begin Your Journey
              <ArrowRight className="inline ml-2 h-5 w-5" />
            </motion.button>
          </Link>
          <Link href="/templates" className="hero-cta">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl border border-[#F5C518]/30 text-[#F5C518] font-cinzel font-medium text-lg hover:bg-[#F5C518]/10 transition-colors"
            >
              Explore the Temple Library
            </motion.button>
          </Link>
        </div>

        {/* Live Demo */}
        <div className="hero-demo max-w-3xl mx-auto">
          <div className="rounded-2xl border border-[#F5C518]/20 bg-[#0D0D0D]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Demo header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F5C518]/10 bg-[#1A1200]/40">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-[#D4B896]/40 font-mono">prompt-transformer</span>
            </div>

            {/* Demo body */}
            <div className="p-6 min-h-[180px]">
              <AnimatePresence mode="wait">
                {!showAfter ? (
                  <motion.div
                    key="before"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono text-red-400/80 bg-red-400/10 px-2 py-0.5 rounded">BEFORE</span>
                      <span className="text-xs text-[#D4B896]/40">Score: 1.8/10</span>
                    </div>
                    <p className="font-mono text-sm text-[#F0E6D3]/70 leading-relaxed">
                      {typedText}
                      {isTyping && <span className="animate-pulse text-[#F5C518]">|</span>}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="after"
                    initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono text-[#F5C518] bg-[#F5C518]/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AFTER
                      </span>
                      <span className="text-xs text-[#F5C518]/60">Score: 9.4/10</span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-[#F0E6D3]/80 leading-relaxed">
                      {AFTER_PROMPT}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Optimize button */}
            <div className="px-6 pb-5">
              <motion.button
                onClick={() => {
                  if (showAfter) {
                    setShowAfter(false)
                    setTypedText('')
                    setIsTyping(true)
                  } else if (!isTyping) {
                    setShowAfter(true)
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] font-cinzel text-sm font-medium hover:from-[#F5C518]/30 hover:to-[#F5C518]/20 transition-all"
              >
                {showAfter ? '↻ Try Again' : isTyping ? 'Typing...' : '𓂀 Optimize This Prompt'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
