'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

const TEMPLE_OPENED_KEY = 'prompttemple_opened'
const HIEROGLYPHS = '𓂀 𓊪 𓏏 𓇯 𓋹 𓃭 𓊵'.split(' ')

interface TempleOpeningProps {
  onComplete: () => void
}

export function TempleOpening({ onComplete }: TempleOpeningProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const leftDoorRef = useRef<HTMLDivElement>(null)
  const rightDoorRef = useRef<HTMLDivElement>(null)
  const stableOnComplete = useCallback(onComplete, [onComplete])

  useEffect(() => {
    // Skip if already opened this session
    try {
      if (sessionStorage.getItem(TEMPLE_OPENED_KEY)) {
        stableOnComplete()
        return
      }
    } catch {
      stableOnComplete()
      return
    }

    // Skip for reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      try { sessionStorage.setItem(TEMPLE_OPENED_KEY, '1') } catch {}
      stableOnComplete()
      return
    }

    const overlay = overlayRef.current
    const leftDoor = leftDoorRef.current
    const rightDoor = rightDoorRef.current
    if (!overlay || !leftDoor || !rightDoor) return

    // Shorter duration on mobile
    const isMobile = window.innerWidth < 768
    const speed = isMobile ? 0.65 : 1

    const tl = gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem(TEMPLE_OPENED_KEY, '1') } catch {}
        stableOnComplete()
      },
    })

    // Hieroglyphs materialize
    tl.from('.temple-glyph', {
      opacity: 0,
      scale: 0.5,
      stagger: 0.08 * speed,
      duration: 0.4 * speed,
      ease: 'back.out(2)',
    }, 0.3 * speed)

    // Doors slide open
    .to(leftDoor, {
      x: '-100%',
      duration: 0.9 * speed,
      ease: 'power3.inOut',
    }, 0.9 * speed)
    .to(rightDoor, {
      x: '100%',
      duration: 0.9 * speed,
      ease: 'power3.inOut',
    }, 0.9 * speed)

    // Light bloom
    .fromTo('.temple-light-bloom',
      { scale: 0, opacity: 0.8 },
      { scale: 3, opacity: 0, duration: 1.2 * speed, ease: 'power2.out' },
      1.4 * speed,
    )

    // Fade out overlay — use visibility+pointerEvents instead of display:none
    // display:none causes a layout reflow that flashes a black screen
    .to(overlay, { opacity: 0, duration: 0.5 * speed, ease: 'power2.inOut' }, 2.4 * speed)
    .set(overlay, { visibility: 'hidden', pointerEvents: 'none' })

    return () => { tl.kill() }
  }, [stableOnComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-[#0D0D0D] flex items-center justify-center overflow-hidden"
      style={{ willChange: 'opacity' }}
    >
      {/* Left Door */}
      <div
        ref={leftDoorRef}
        className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#1A1200] to-[#2A1F00] border-r border-[#F5C518]/30 flex items-center justify-end pr-8"
      >
        {/* Door texture lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-full bg-[#F5C518]"
              style={{ left: `${15 + i * 15}%` }}
            />
          ))}
        </div>
      </div>

      {/* Right Door */}
      <div
        ref={rightDoorRef}
        className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#1A1200] to-[#2A1F00] border-l border-[#F5C518]/30"
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-full bg-[#F5C518]"
              style={{ left: `${15 + i * 15}%` }}
            />
          ))}
        </div>
      </div>

      {/* Hieroglyphs */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex gap-4 sm:gap-6 text-3xl sm:text-5xl text-[#F5C518]">
          {HIEROGLYPHS.map((g, i) => (
            <span key={i} className="temple-glyph opacity-0">{g}</span>
          ))}
        </div>
        <p className="temple-glyph opacity-0 font-cinzel text-lg sm:text-xl text-[#F5C518]/70 tracking-[0.4em] uppercase mt-4">
          PromptTemple
        </p>
      </div>

      {/* Light bloom */}
      <div
        className="temple-light-bloom absolute w-48 h-48 rounded-full bg-[#F5C518] opacity-0"
        style={{ filter: 'blur(60px)', transform: 'scale(0)' }}
      />
    </div>
  )
}
