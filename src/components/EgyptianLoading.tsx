'use client';

import React, { useState, useEffect, useRef } from 'react';

interface EgyptianLoadingProps {
  isLoading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const EgyptianLoading: React.FC<EgyptianLoadingProps> = ({ 
  isLoading, 
  message = "Channeling ancient wisdom...",
  size = 'medium',
  overlay = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState('');

  // Size configurations
  const sizeConfig = {
    small: { width: 300, height: 150, fontSize: 12 },
    medium: { width: 500, height: 250, fontSize: 16 },
    large: { width: 700, height: 350, fontSize: 20 }
  };

  const config = sizeConfig[size];

  // Egyptian hieroglyphic rain effect
  useEffect(() => {
    if (!isLoading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = config.width;
    canvas.height = config.height;

    // Egyptian hieroglyphic symbols (Unicode)
    const hieroglyphs = [
      '𓀀', '𓀁', '𓀂', '𓀃', '𓀄', '𓀅', '𓀆', '𓀇', '𓀈', '𓀉', '𓀊', '𓀋', '𓀌', '𓀍', '𓀎', '𓀏',
      '𓀐', '𓀑', '𓀒', '𓀓', '𓀔', '𓀕', '𓀖', '𓀗', '𓀘', '𓀙', '𓀚', '𓀛', '𓀜', '𓀝', '𓀞', '𓀟',
      '𓁀', '𓁁', '𓁂', '𓁃', '𓁄', '𓁅', '𓁆', '𓁇', '𓁈', '𓁉', '𓁊', '𓁋', '𓁌', '𓁍', '𓁎', '𓁏',
      '𓂀', '𓂁', '𓂂', '𓂃', '𓂄', '𓂅', '𓂆', '𓂇', '𓂈', '𓂉', '𓂊', '𓂋', '𓂌', '𓂍', '𓂎', '𓂏',
      '𓃀', '𓃁', '𓃂', '𓃃', '𓃄', '𓃅', '𓃆', '𓃇', '𓃈', '𓃉', '𓃊', '𓃋', '𓃌', '𓃍', '𓃎', '𓃏',
       '𓀀', '𓀁', '𓀂', '𓀃', '𓀄', '𓀅', '𓀆', '𓀇', '𓀈', '𓀉', '𓀊', '𓀋', '𓀌', '𓀍', '𓀎', '𓀏',
      '𓀐', '𓀑', '𓀒', '𓀓', '𓀔', '𓀕', '𓀖', '𓀗', '𓀘', '𓀙', '𓀚', '𓀛', '𓀜', '𓀝', '𓀞', '𓀟',
      '𓁀', '𓁁', '𓁂', '𓁃', '𓁄', '𓁅', '𓁆', '𓁇', '𓁈', '𓁉', '𓁊', '𓁋', '𓁌', '𓁍', '𓁎', '𓁏',
      '𓂀', '𓂁', '𓂂', '𓂃', '𓂄', '𓂅', '𓂆', '𓂇', '𓂈', '𓂉', '𓂊', '𓂋', '𓂌', '𓂍', '𓂎', '𓂏',
      '𓃀', '𓃁', '𓃂', '𓃃', '𓃄', '𓃅', '𓃆', '𓃇', '𓃈', '𓃉', '𓃊', '𓃋', '𓃌', '𓃍', '𓃎', '𓃏'
    ];

    const fontSize = config.fontSize;
    const columns = Math.floor(canvas.width / fontSize);

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // Start at different times
    }

    const draw = () => {
      // Light, translucent background that blends with the chat interface
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // More vibrant gold/amber hieroglyphic text for eye-catching pulsing
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FFD700'); // Bright gold
      gradient.addColorStop(0.3, '#FFA500'); // Orange amber
      gradient.addColorStop(0.7, '#FF8C00'); // Dark orange
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0.8)'); // Fade out with more opacity
      
      ctx.fillStyle = gradient;
      ctx.font = `${fontSize}px "Noto Sans Egyptian Hieroglyphs", serif`;
      ctx.shadowColor = 'rgba(212, 165, 116, 0.4)';
      ctx.shadowBlur = 3;

      for (let i = 0; i < drops.length; i++) {
        const symbol = hieroglyphs[Math.floor(Math.random() * hieroglyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Enhanced glow effect for more obvious pulsing
        ctx.shadowBlur = Math.random() * 8 + 4; // Consolidated to a single, more prominent value
        ctx.fillText(symbol, x, y);

        // Reset to top with randomness, now with a flash effect for eye-catching removal
       if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          // Flash white on reset to make removal obvious
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x, y - fontSize, fontSize, fontSize);
          ctx.fillStyle = gradient; // Restore gradient
          drops[i] = 0;
        }
        drops[i]++;
      }

      ctx.shadowBlur = 0; // Reset shadow
    };

    const interval = setInterval(draw, 50); // Faster refresh for more obvious animation

    return () => clearInterval(interval);
  }, [isLoading, config]);

  // Animated dots for thinking message
  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const containerClass = overlay 
    ? "fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
    : "flex items-center justify-center p-2";

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Hieroglyphic Canvas - Clean and minimal */}
        
        <div className="relative mb-4"></div>
          {/* Decorative slow-floating large hieroglyphs overlay to add more letters and a slower, eye-catching pulse */}
          <style>{`
            @keyframes slowFloat { 0% { transform: translateY(0) } 50% { transform: translateY(-10px) } 100% { transform: translateY(0) } }
            @keyframes slowPulse { 0% { opacity: 0.18 } 50% { opacity: 0.55 } 100% { opacity: 0.18 } }
          `}</style>

          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-lg border border-stone-300/50"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 50%, rgba(241,245,249,0.95) 100%)',
              boxShadow: 'inset 0 0 15px rgba(212, 165, 116, 0.2)',
              display: 'block',
              width: '100%',
              height: 'auto'
            }}
          />

          {/* Slow, large, repeated hieroglyphs for extra visual weight and slower motion */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              mixBlendMode: 'overlay',
              color: '#FFB84D',
              fontFamily: '"Noto Sans Egyptian Hieroglyphs", serif',
              letterSpacing: '0.05em',
              opacity: 0.28,
              transformOrigin: 'center',
              textAlign: 'center',
              whiteSpace: 'pre-line',
              padding: '0 1rem'
            }}
          >
            <div
              style={{
          fontSize: '2.2rem',
          lineHeight: 1,
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'slowFloat 7.5s ease-in-out infinite, slowPulse 5s ease-in-out infinite'
              }}
            >
              {/* Repeated block of hieroglyphs — more letters to catch the eye */}
              <span>𓋹𓊪𓃭𓂀𓂋𓈖𓇋𓅓𓆑𓉔𓈎𓍯</span>
              <span>𓋹𓊪𓃭𓂀𓂋𓈖𓇋𓅓𓆑𓉔𓈎𓍯</span>
              <span>𓋹𓊪𓃭𓂀𓂋𓈖𓇋𓅓𓆑𓉔𓈎𓍯</span>
            </div>
          </div>
        {/* Subtle thinking message */}
        <div className="text-stone-600 font-serif text-sm mb-3 tracking-wide">
          <span className="inline-block animate-pulse">𓋹</span>
          {' '}{message}{dots}{' '}
          <span className="inline-block animate-pulse">𓋹</span>
        </div>

        {/* Minimal progress bar */}
        <div className="w-64 bg-stone-200 rounded-full h-1 mb-3 border border-stone-300">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 h-1 rounded-full animate-pulse shadow-sm"
               style={{ width: '100%' }}></div>
        </div>

        {/* Subtle status indicators */}
        <div className="text-stone-500 font-serif text-xs opacity-70 max-w-sm mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-1">
            <span className="text-xs">𓂀 Processing</span>
            <span className="text-xs">𓃭 Analyzing</span>
            <span className="text-xs">𓊪 Crafting</span>
          </div>
        </div>

        {/* Elegant Egyptian symbols */}
        <div className="mt-3 flex justify-center space-x-4 text-amber-600 text-lg opacity-80">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>𓋹</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>𓊪</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>𓃭</span>
          <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>𓂀</span>
          <span className="animate-bounce" style={{ animationDelay: '0.8s' }}>𓋹</span>
        </div>
      </div>
    </div>
  );
};

export default EgyptianLoading;
