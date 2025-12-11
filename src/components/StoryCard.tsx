import React from 'react';
import { motion } from 'framer-motion';
import type { StoryCardProps } from '../types';

const StoryCard: React.FC<StoryCardProps> = ({ children, onNext }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center cursor-pointer z-40"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary), var(--color-bg-secondary))'
      }}
      onClick={onNext}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center px-4 max-w-2xl">
        {children}
      </div>

      {/* Tap to continue hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue →
        </motion.p>
      </div>
    </motion.div>
  );
};

export default StoryCard;
