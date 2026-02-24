'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface WowScoreGaugeProps {
  score: number; // 0-10
  size?: number;
  animate?: boolean;
  showLabel?: boolean;
}

const SCORE_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  pharaoh: { label: 'Pharaoh', color: '#F5C518', glow: 'rgba(245,197,24,0.6)' },
  highPriest: { label: 'High Priest', color: '#A78BFA', glow: 'rgba(167,139,250,0.5)' },
  vizier: { label: 'Vizier', color: '#60A5FA', glow: 'rgba(96,165,250,0.4)' },
  scribe: { label: 'Scribe', color: '#34D399', glow: 'rgba(52,211,153,0.4)' },
  apprentice: { label: 'Apprentice', color: '#9CA3AF', glow: 'rgba(156,163,175,0.3)' },
};

function getScoreInfo(score: number) {
  if (score >= 9) return SCORE_LABELS.pharaoh;
  if (score >= 7.5) return SCORE_LABELS.highPriest;
  if (score >= 6) return SCORE_LABELS.vizier;
  if (score >= 4) return SCORE_LABELS.scribe;
  return SCORE_LABELS.apprentice;
}

export function WowScoreGauge({ score, size = 160, animate: shouldAnimate = true, showLabel = true }: WowScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const info = getScoreInfo(score);

  const radius = (size / 2) * 0.78;
  const circumference = Math.PI * radius; // half circle arc
  const strokeWidth = size * 0.065;

  // Arc goes from left bottom (180°) to right bottom (0°)
  // We use a path for the half-arc
  const cx = size / 2;
  const cy = size / 2 + size * 0.05;

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayScore(score);
      return;
    }
    const timer = setTimeout(() => {
      const start = Date.now();
      const duration = 1400;
      const from = 0;
      const to = score;
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(parseFloat((from + (to - from) * eased).toFixed(1)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, shouldAnimate]);

  const fillPercent = displayScore / 10;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - fillPercent);

  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <svg
          width={size}
          height={size * 0.6}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke={info.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 1.5}px ${info.glow})`,
            }}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          />

          {/* Score text */}
          <text
            x={cx}
            y={cy - size * 0.04}
            textAnchor="middle"
            dominantBaseline="auto"
            fill={info.color}
            fontSize={size * 0.22}
            fontWeight="bold"
            fontFamily="JetBrains Mono, monospace"
            style={{ filter: `drop-shadow(0 0 8px ${info.glow})` }}
          >
            {displayScore.toFixed(displayScore % 1 === 0 ? 0 : 1)}
          </text>

          {/* /10 label */}
          <text
            x={cx}
            y={cy + size * 0.02}
            textAnchor="middle"
            dominantBaseline="auto"
            fill="rgba(212,184,150,0.6)"
            fontSize={size * 0.1}
            fontFamily="JetBrains Mono, monospace"
          >
            / 10
          </text>

          {/* Left tick */}
          <text x={startX - 2} y={cy + size * 0.1} textAnchor="middle" fill="rgba(156,163,175,0.5)" fontSize={size * 0.075}>0</text>
          {/* Right tick */}
          <text x={endX + 2} y={cy + size * 0.1} textAnchor="middle" fill="rgba(156,163,175,0.5)" fontSize={size * 0.075}>10</text>
        </svg>

        {/* Glow pulse when score is high */}
        {score >= 7.5 && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              background: `radial-gradient(ellipse at center bottom, ${info.glow} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
          style={{
            background: `${info.color}15`,
            color: info.color,
            border: `1px solid ${info.color}35`,
            boxShadow: `0 0 16px ${info.glow}`,
            fontFamily: 'Cinzel, serif',
          }}
        >
          <span>𓂀</span>
          <span>{info.label} Level</span>
        </motion.div>
      )}
    </div>
  );
}
