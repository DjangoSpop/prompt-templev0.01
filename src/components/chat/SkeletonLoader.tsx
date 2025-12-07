'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  lines = 3
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const lineVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: lines }, (_, index) => (
        <motion.div
          key={index}
          variants={lineVariants}
          className={`h-4 bg-gray-200 rounded-md relative overflow-hidden ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
            variants={shimmerVariants}
            animate="animate"
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            }}
          />
        </motion.div>
      ))}

      {/* Pulsing cursor */}
      <motion.div
        className="flex items-center space-x-1 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-4 bg-blue-400 rounded-sm"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: 'easeInOut',
          }}
        />
        <span className="text-xs text-gray-500 font-medium">
          Assistant is thinking...
        </span>
      </motion.div>
    </motion.div>
  );
};