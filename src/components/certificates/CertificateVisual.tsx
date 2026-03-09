/**
 * CertificateVisual - Premium Pharaonic Certificate Renderer
 *
 * A visually rich, shareable certificate with Egyptian-inspired design.
 * Renders at a fixed aspect ratio suitable for screenshots, OG images, and print.
 */

'use client';

import { Certificate } from '@/lib/certificates/types';
import { formatDate, getDistinctionLabel } from '@/lib/certificates/certificateService';
import { Award, Shield } from 'lucide-react';

interface CertificateVisualProps {
  certificate: Certificate;
  compact?: boolean;
}

export function CertificateVisual({ certificate, compact = false }: CertificateVisualProps) {
  const distinction = getDistinctionLabel(certificate.distinction);

  return (
    <div
      id="certificate-visual"
      className={`relative mx-auto w-full ${compact ? 'max-w-[540px]' : 'max-w-[800px]'}`}
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Outer Gold Border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-royal-gold-400 via-royal-gold-500 to-royal-gold-600 p-[3px]">
        {/* Inner Dark Background */}
        <div className="relative h-full w-full rounded-[5px] bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-obsidian-950 overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <CornerOrnament position="top-left" />
          <CornerOrnament position="top-right" />
          <CornerOrnament position="bottom-left" />
          <CornerOrnament position="bottom-right" />

          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(197, 165, 90, 0.5) 20px,
                rgba(197, 165, 90, 0.5) 21px
              )`,
            }}
          />

          {/* Inner Border Frame */}
          <div className="absolute inset-3 sm:inset-4 border border-royal-gold-500/30 rounded pointer-events-none" />
          <div className="absolute inset-5 sm:inset-6 border border-royal-gold-500/15 rounded pointer-events-none" />

          {/* Content */}
          <div className={`relative flex flex-col items-center justify-between h-full ${compact ? 'px-6 py-6' : 'px-8 py-8 sm:px-12 sm:py-10'}`}>
            {/* Top Section: Academy Branding */}
            <div className="flex flex-col items-center text-center">
              {/* Egyptian Seal */}
              <div className={`relative ${compact ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
                <div className={`flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-2 border-royal-gold-500/60 bg-gradient-to-br from-royal-gold-500/20 to-transparent`}>
                  <EyeOfHorusIcon className={compact ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'} />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-royal-gold-500/10 blur-xl" />
              </div>

              <p className={`font-serif tracking-[0.3em] text-royal-gold-500/80 uppercase ${compact ? 'text-[8px]' : 'text-[9px] sm:text-xs'}`}>
                {certificate.academyName}
              </p>

              {/* Decorative Line */}
              <div className={`flex items-center gap-2 sm:gap-3 ${compact ? 'my-2' : 'my-3 sm:my-4'}`}>
                <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-royal-gold-500/50" />
                <AnkhIcon className="w-3 h-3 sm:w-4 sm:h-4 text-royal-gold-500/60" />
                <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-royal-gold-500/50" />
              </div>

              <h2 className={`font-serif font-bold bg-gradient-to-r from-royal-gold-300 via-royal-gold-400 to-royal-gold-300 bg-clip-text text-transparent ${compact ? 'text-sm' : 'text-lg sm:text-2xl'}`}>
                {certificate.certificateTitle}
              </h2>

              <p className={`text-desert-sand-400 mt-1 ${compact ? 'text-[8px]' : 'text-[10px] sm:text-sm'}`}>
                This is to certify that
              </p>
            </div>

            {/* Middle Section: Learner & Course */}
            <div className="flex flex-col items-center text-center flex-1 justify-center">
              {/* Learner Name */}
              <h1 className={`font-serif font-bold text-royal-gold-300 ${compact ? 'text-lg mb-1' : 'text-2xl sm:text-4xl mb-2'}`}>
                {certificate.learnerName}
              </h1>

              <p className={`text-desert-sand-400 ${compact ? 'text-[8px] mb-1' : 'text-[10px] sm:text-sm mb-2 sm:mb-3'}`}>
                has successfully completed the course
              </p>

              {/* Course Title */}
              <h3 className={`font-semibold text-nile-teal-400 ${compact ? 'text-xs mb-1' : 'text-sm sm:text-xl mb-2 sm:mb-3'}`}>
                {certificate.courseTitle}
              </h3>

              {/* Distinction Badge */}
              {distinction && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-royal-gold-500/40 bg-royal-gold-500/10 ${compact ? 'mb-1' : 'mb-2 sm:mb-3'}`}>
                  <Award className={compact ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'} style={{ color: '#C5A55A' }} />
                  <span className={`font-serif text-royal-gold-400 ${compact ? 'text-[8px]' : 'text-[10px] sm:text-sm'}`}>
                    {distinction}
                  </span>
                </div>
              )}

              {/* Score */}
              {certificate.score !== null && (
                <p className={`text-desert-sand-500 ${compact ? 'text-[7px]' : 'text-[9px] sm:text-xs'}`}>
                  Average Score: {certificate.score}% &bull; {certificate.totalXP.toLocaleString()} XP Earned
                </p>
              )}
            </div>

            {/* Bottom Section: Details & Verification */}
            <div className="w-full">
              {/* Decorative Separator */}
              <div className={`flex items-center gap-2 justify-center ${compact ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-royal-gold-500/30" />
                <ScarabIcon className="w-3 h-3 sm:w-4 sm:h-4 text-royal-gold-500/40" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-royal-gold-500/30" />
              </div>

              <div className={`flex items-end justify-between gap-4 ${compact ? 'text-[7px]' : 'text-[8px] sm:text-xs'}`}>
                {/* Issue Date */}
                <div className="text-left">
                  <p className="text-desert-sand-500 mb-0.5">Issued</p>
                  <p className="text-desert-sand-300 font-medium">
                    {formatDate(certificate.issueDate)}
                  </p>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-14 sm:h-14'} rounded-full border border-royal-gold-500/40 bg-gradient-to-br from-royal-gold-500/10 to-transparent`}>
                    <Shield className={`text-royal-gold-500/70 ${compact ? 'w-4 h-4' : 'w-5 h-5 sm:w-7 sm:h-7'}`} />
                  </div>
                  <p className="text-desert-sand-500 mt-1">{certificate.instructorName}</p>
                </div>

                {/* Verification Code */}
                <div className="text-right">
                  <p className="text-desert-sand-500 mb-0.5">Verification</p>
                  <p className="text-royal-gold-400 font-mono font-medium tracking-wider">
                    {certificate.verificationCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SVG ICON COMPONENTS
// ============================================================================

function CornerOrnament({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2 rotate-90',
    'bottom-left': 'bottom-2 left-2 -rotate-90',
    'bottom-right': 'bottom-2 right-2 rotate-180',
  };

  return (
    <div className={`absolute ${posClasses[position]} pointer-events-none`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-royal-gold-500/40">
        <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
        <path d="M4 4 L8 4 L8 5 L5 5 L5 8 L4 8 Z" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

function EyeOfHorusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} text-royal-gold-500`} fill="currentColor">
      <path d="M32 12C18 12 8 24 8 32s10 20 24 20 24-12 24-20S46 12 32 12zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z" opacity="0.8" />
      <circle cx="32" cy="32" r="6" />
      <path d="M44 32h12M8 32h12" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path d="M32 44v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M28 52c0 0 4 4 4 4s4-4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
}

function AnkhIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} fill="currentColor">
      <ellipse cx="12" cy="8" rx="6" ry="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="10.5" y="14" width="3" height="18" rx="1" />
      <rect x="4" y="20" width="16" height="3" rx="1" />
    </svg>
  );
}

function ScarabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <ellipse cx="12" cy="14" rx="6" ry="8" opacity="0.8" />
      <circle cx="12" cy="6" r="4" opacity="0.6" />
      <path d="M6 14 C2 10 1 6 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M18 14 C22 10 23 6 21 4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
