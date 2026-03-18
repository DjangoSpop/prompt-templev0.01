'use client';

import { useEffect, useState } from 'react';
import { COPY } from '@/lib/landing/copy';

const HIEROGLYPHS = ['𓂀', '𓃭', '𓆣', '𓇋', '𓈖', '𓊝', '𓋴', '𓌳', '𓏏', '𓀀', '𓁀', '𓄀'];

interface EgyptianLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EgyptianLoader({ message, size = 'md', className = '' }: EgyptianLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(
    message || COPY.loading.messages[Math.floor(Math.random() * COPY.loading.messages.length)]
  );

  useEffect(() => {
    if (message) return; // Don't rotate if a fixed message is provided
    const interval = setInterval(() => {
      setCurrentMessage(
        COPY.loading.messages[Math.floor(Math.random() * COPY.loading.messages.length)]
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [message]);

  const glyphSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const gap = size === 'sm' ? 'gap-1' : 'gap-2';

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={currentMessage}
    >
      {/* Hieroglyphic rain row */}
      <div className={`flex ${gap} motion-safe:animate-none`}>
        {HIEROGLYPHS.slice(0, size === 'sm' ? 6 : size === 'lg' ? 12 : 8).map((glyph, i) => (
          <span
            key={i}
            className={`${glyphSize} text-accent-gold motion-safe:animate-[hieroglyph-fall_2s_ease-in-out_infinite] motion-reduce:opacity-70`}
            style={{
              animationDelay: `${(i * 0.15).toFixed(2)}s`,
            }}
          >
            {glyph}
          </span>
        ))}
      </div>

      {/* Rotating message */}
      <p
        className={`${textSize} text-sand-600 mt-3 font-body transition-opacity duration-300`}
      >
        {currentMessage}
      </p>

      {/* CSS keyframes injected inline for portability */}
      <style>{`
        @keyframes hieroglyph-fall {
          0% { opacity: 0.3; transform: translateY(-8px); }
          50% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0.3; transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
