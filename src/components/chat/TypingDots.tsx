import { motion } from 'framer-motion';

interface TypingDotsProps {
  className?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ className = '' }) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  return (
    <motion.div
      className={`flex space-x-1 items-center ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-gray-500 rounded-full"
          variants={dotVariants}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
};
