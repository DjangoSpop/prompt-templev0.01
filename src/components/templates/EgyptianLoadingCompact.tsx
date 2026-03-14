'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface EgyptianLoadingCompactProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md';
}

/**
 * Compact Egyptian-themed loading component for modals and panels
 * Features: Rotating hieroglyphs, gold accent colors, pharaonic messaging
 */
export function EgyptianLoadingCompact({
  isLoading,
  message = 'Channeling ancient wisdom...',
  size = 'md',
}: EgyptianLoadingCompactProps) {
  const [dots, setDots] = useState('');
  const [currentHieroglyph, setCurrentHieroglyph] = useState(0);

  const hieroglyphs = ['𓂀', '𓅓', '𓇯', '𓈖', '𓊪', '𓋴', '𓌃', '𓍯', '𓎡', '𓏏'];

  const messages = [
    'Channeling ancient wisdom...',
    'Consulting the scribes...',
    'Awakening the pharaohs...',
    'Deciphering hieroglyphs...',
    'Crafting your response...',
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }

    // Animate dots
    const dotInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Rotate hieroglyphs
    const hieroglyphInterval = setInterval(() => {
      setCurrentHieroglyph((prev) => (prev + 1) % hieroglyphs.length);
    }, 800);

    // Rotate messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(hieroglyphInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, hieroglyphs.length, messages.length]);

  if (!isLoading) return null;

  const sizeClasses = size === 'sm' ? 'text-sm' : 'text-base';
  const iconSize = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4">
      {/* Rotating Eye of Horus with gold glow */}
      <div className="relative">
        <div className="absolute inset-0 animate-spin-slow">
          <div className={`w-16 h-16 border-2 border-amber-200 rounded-full ${iconSize}`} />
        </div>
        <div className="w-16 h-16 flex items-center justify-center">
          <span
            className={`text-3xl ${size === 'sm' ? 'text-2xl' : 'text-3xl'} animate-pulse`}
            style={{
              textShadow: '0 0 10px rgba(255, 193, 7, 0.5), 0 0 20px rgba(255, 165, 0, 0.3)',
            }}
          >
            {hieroglyphs[currentHieroglyph]}
          </span>
        </div>
        {/* Orbiting hieroglyphs */}
        <div className="absolute inset-0 animate-spin-slow-reverse">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute text-xs text-amber-500/40"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 90}deg) translate(32px) rotate(-${i * 90}deg)`,
              }}
            >
              {hieroglyphs[(currentHieroglyph + i + 1) % hieroglyphs.length]}
            </span>
          ))}
        </div>
      </div>

      {/* Message with animated dots */}
      <div className={`text-center ${sizeClasses}`}>
        <p className="text-amber-900 font-medium">
          {messages[currentMessage]}
          <span className="text-amber-600">{dots}</span>
        </p>
        {message !== messages[currentMessage] && message && (
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        )}
      </div>

      {/* Progress bar with Egyptian gold gradient */}
      <div className="w-48 bg-amber-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 rounded-full animate-pulse"
          style={{ width: '100%' }}
        />
      </div>

      {/* Decorative hieroglyphs */}
      <div className="flex gap-2 text-amber-600/60 text-sm">
        {['𓋹', '𓊪', '𓃭', '𓂀', '𓋹'].map((glyph, i) => (
          <span
            key={i}
            className="animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {glyph}
          </span>
        ))}
      </div>
    </div>
  );
}

export default EgyptianLoadingCompact;
