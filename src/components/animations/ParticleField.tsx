'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const GLYPHS = ['𓂀', '𓊪', '𓏏', '𓇯', '𓋹', '𓃭', '𓊵', '𓅃', '𓆣', '𓇌', '𓈖', '𓉐']

interface ParticleFieldProps {
  count?: number
  className?: string
}

export function ParticleField({ count = 20, className = '' }: ParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !containerRef.current) return

    const particles = containerRef.current.querySelectorAll<HTMLSpanElement>('.glyph-particle')
    const ctx = gsap.context(() => {
      particles.forEach((el) => {
        gsap.to(el, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          rotation: `random(-15, 15)`,
          duration: `random(4, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: `random(0, 4)`,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [count])

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const glyph = GLYPHS[i % GLYPHS.length]
        const depth = Math.random()
        const size = 16 + depth * 24
        const opacity = 0.03 + depth * 0.07
        return (
          <span
            key={i}
            className="glyph-particle absolute text-[#F5C518] select-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${size}px`,
              opacity,
            }}
          >
            {glyph}
          </span>
        )
      })}
    </div>
  )
}
