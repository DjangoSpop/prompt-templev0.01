'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface EgyptianLoadingAnimationProps {
  className?: string;
  message?: string;
  stage?: 'initializing' | 'retrieving_context' | 'analyzing' | 'optimizing' | 'finalizing';
  progress?: number;
}

export const EgyptianLoadingAnimation: React.FC<EgyptianLoadingAnimationProps> = ({
  className = '',
  message = 'Deep thinking in progress...',
  stage = 'analyzing',
  progress = 0
}) => {
  const [currentHieroglyphIndex, setCurrentHieroglyphIndex] = useState(0);
  const [currentWisdomIndex, setCurrentWisdomIndex] = useState(0);

  // Enhanced hieroglyph symbols that work across different systems
  const hieroglyphs = ['𓂀', '𓅓', '𓇯', '𓈖', '𓊪', '𓋴', '𓌃', '𓍯', '𓎡', '𓏏'];

  // Ancient wisdom quotes for different stages
  const ancientWisdom = [
    'Accessing the sacred scrolls...',
    'Channeling pharaonic wisdom...',
    'Deciphering ancient patterns...',
    'Consulting the temple archives...',
    'Weaving threads of knowledge...',
    'Distilling eternal truths...'
  ];

  // Stage-specific messages
  const stageMessages = {
    initializing: 'Awakening the temple guardians...',
    retrieving_context: 'Gathering sacred knowledge...',
    analyzing: 'Deciphering ancient patterns...',
    optimizing: 'Forging divine wisdom...',
    finalizing: 'Blessing the final creation...'
  };

  useEffect(() => {
    const hieroglyphInterval = setInterval(() => {
      setCurrentHieroglyphIndex((prev) => (prev + 1) % hieroglyphs.length);
    }, 800);

    const wisdomInterval = setInterval(() => {
      setCurrentWisdomIndex((prev) => (prev + 1) % ancientWisdom.length);
    }, 3000);

    return () => {
      clearInterval(hieroglyphInterval);
      clearInterval(wisdomInterval);
    };
  }, [hieroglyphs.length, ancientWisdom.length]);

  // Enhanced animation variants with smoother transitions
  const pyramidVariants = {
    initial: { scale: 0.6, opacity: 0, rotateY: -180 },
    animate: {
      scale: [0.6, 1.1, 0.95, 1],
      opacity: [0.4, 1, 0.8, 1],
      rotateY: [0, 15, -15, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1]
      }
    }
  };

  const sandVariants = {
    initial: { x: -40, opacity: 0, scale: 0.8 },
    animate: {
      x: ['-40px', '40px', '-40px'],
      opacity: [0.2, 0.9, 0.2],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.3, rotate: 0 },
    animate: {
      opacity: [0, 1, 0.6, 0],
      scale: [0.3, 1.5, 1.8, 0.3],
      rotate: [0, 180, 360],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeOut',
        times: [0, 0.4, 0.8, 1]
      }
    }
  };

  // Progress-based pyramid glow intensity
  const progressGlowIntensity = Math.max(0.3, progress / 100);

  // Stage-based color schemes
  const stageColors = {
    initializing: { primary: 'amber-500', glow: 'amber-400', text: 'amber-700' },
    retrieving_context: { primary: 'blue-500', glow: 'blue-400', text: 'blue-700' },
    analyzing: { primary: 'purple-500', glow: 'purple-400', text: 'purple-700' },
    optimizing: { primary: 'emerald-500', glow: 'emerald-400', text: 'emerald-700' },
    finalizing: { primary: 'orange-500', glow: 'orange-400', text: 'orange-700' }
  };

  const currentColors = stageColors[stage];

  return (
    <motion.div
      className={`flex flex-col items-center space-y-6 py-8 ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Enhanced pyramid with multi-layer glow */}
      <div className="relative">
        {/* Outer mystical glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-radial from-${currentColors.glow} via-transparent to-transparent rounded-full blur-xl`}
          style={{
            width: '120px',
            height: '120px',
            left: '-30px',
            top: '-30px',
            opacity: progressGlowIntensity,
          }}
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />

        {/* Inner sacred glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r from-${currentColors.glow} via-${currentColors.primary} to-${currentColors.glow} rounded-full blur-md`}
          style={{
            opacity: progressGlowIntensity * 0.8,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [progressGlowIntensity * 0.6, progressGlowIntensity, progressGlowIntensity * 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main pyramid structure with enhanced design */}
        <motion.div
          className="relative w-20 h-20 flex items-center justify-center"
          variants={pyramidVariants}
          initial="initial"
          animate="animate"
        >
          {/* Multi-layered pyramid */}
          <div className="relative">
            {/* Base pyramid */}
            <div className={`w-0 h-0 border-l-12 border-r-12 border-b-16 border-l-transparent border-r-transparent border-b-${currentColors.primary} filter drop-shadow-lg`} />

            {/* Middle layer */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-10 border-l-transparent border-r-transparent border-b-${currentColors.glow} opacity-80`} />

            {/* Top capstone */}
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-yellow-300 filter brightness-125`} />
          </div>

          {/* Enhanced rotating hieroglyph with orbit effect */}
          <motion.div
            className="absolute"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <motion.span
              className={`text-${currentColors.text} text-2xl font-bold filter drop-shadow-md`}
              style={{
                textShadow: `0 0 10px currentColor`,
                filter: 'brightness(1.2)',
              }}
              animate={{
                textShadow: [`0 0 5px currentColor`, `0 0 20px currentColor`, `0 0 5px currentColor`],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {hieroglyphs[currentHieroglyphIndex]}
            </motion.span>
          </motion.div>

          {/* Orbiting mini symbols */}
          {Array.from({ length: 3 }, (_, index) => (
            <motion.div
              key={index}
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8 + index * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.5,
              }}
              style={{
                transformOrigin: '40px 0px',
              }}
            >
              <span className={`text-${currentColors.glow} text-xs opacity-60`}>
                {hieroglyphs[(currentHieroglyphIndex + index + 1) % hieroglyphs.length]}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Progress bar with Egyptian styling */}
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
        <motion.div
          className={`h-full bg-gradient-to-r from-${currentColors.primary} to-${currentColors.glow} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Enhanced animated sand particles with physics */}
      <div className="flex space-x-2">
        {Array.from({ length: 7 }, (_, index) => (
          <motion.div
            key={index}
            className={`w-1.5 h-1.5 bg-${currentColors.glow} rounded-full`}
            variants={sandVariants}
            initial="initial"
            animate="animate"
            transition={{
              delay: index * 0.15,
            }}
            style={{
              filter: 'brightness(1.2) drop-shadow(0 0 2px currentColor)',
            }}
          />
        ))}
      </div>

      {/* Enhanced status text with dynamic content */}
      <motion.div
        className="text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            className={`text-sm font-semibold text-${currentColors.text} mb-2`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {message || stageMessages[stage]}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentWisdomIndex}
            className={`text-xs text-${currentColors.text} opacity-80 italic`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
          >
            {ancientWisdom[currentWisdomIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Progress percentage */}
        {progress > 0 && (
          <motion.p
            className={`text-xs text-${currentColors.text} mt-2 font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {Math.round(progress)}% complete
          </motion.p>
        )}
      </motion.div>

      {/* Enhanced progress dots with stage indication */}
      <div className="flex space-x-3">
        {Array.from({ length: 5 }, (_, index) => {
          const isActive = index <= Object.keys(stageMessages).indexOf(stage);
          const isCurrent = index === Object.keys(stageMessages).indexOf(stage);

          return (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                isActive
                  ? `bg-${currentColors.primary}`
                  : 'bg-gray-300'
              }`}
              animate={{
                scale: isCurrent ? [1, 1.4, 1] : 1,
                opacity: isActive ? [0.7, 1, 0.7] : 0.4,
              }}
              transition={{
                duration: isCurrent ? 1.2 : 0.3,
                repeat: isCurrent ? Infinity : 0,
                delay: index * 0.1,
              }}
              style={{
                boxShadow: isActive ? `0 0 8px currentColor` : 'none',
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};