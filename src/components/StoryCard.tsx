import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { StoryCardProps } from '../types';

const StoryCard: React.FC<StoryCardProps> = ({ children, onNext, onPrev, canGoBack = false }) => {
  const { t } = useTranslation();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks directly on the background, not bubbled from children
    if (e.target !== e.currentTarget) return;

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

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, [role="button"], .interactive-content');
    const isScrollable = target.closest('[class*="overflow-y-auto"], [class*="overflow-x-auto"]');

    if (isInteractive || isScrollable) {
      e.stopPropagation();
      return;
    }

    // Get click position relative to screen width for navigation
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
      className="fixed inset-0 flex items-center justify-center z-30"
      style={{
        background: 'rgba(10, 10, 10, 0.95)'
      }}
      onClick={handleBackgroundClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center px-4 max-w-2xl" onClick={handleContentClick}>
        {children}
      </div>

      {/* Tap to continue hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
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
