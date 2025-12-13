import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { StoryCardProps } from '../types';

const StoryCard: React.FC<StoryCardProps> = ({ children, onNext, onPrev, canGoBack = false }) => {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get click position relative to screen width
    const clickX = e.clientX;
    const screenWidth = window.innerWidth;
    const clickZone = clickX / screenWidth;

    // Left 30% of screen = go back, rest = go forward
    if (clickZone < 0.3 && canGoBack && onPrev) {
      onPrev();
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center cursor-pointer z-40"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary), var(--color-bg-secondary))'
      }}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left zone indicator (visible when can go back) */}
      {canGoBack && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[30%] flex items-center justify-start pl-4 pointer-events-none"
        >
          <motion.div
            className="text-2xl opacity-30"
            animate={{ x: [-5, 0, -5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ←
          </motion.div>
        </div>
      )}

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
          {canGoBack ? `← ${t('story.tapBack')} | ${t('story.tapForward')} →` : `${t('story.tapToContinue')} →`}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default StoryCard;
