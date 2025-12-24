import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import type { GiftCardProps } from '../types';

interface ThemeConfig {
  ribbonColor: string;
  bowShadow: string;
  confetti: string[];
  gradient: string;
}

const themes: Record<string, ThemeConfig> = {
  yellow: {
    ribbonColor: 'rgba(255, 215, 0, 0.8)',
    bowShadow: '0 4px 12px rgba(255, 215, 0, 0.6)',
    confetti: ['#ffd700', '#1db954', '#ffffff'],
    gradient: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
  },
  blue: {
    ribbonColor: 'rgba(52, 152, 219, 0.8)',
    bowShadow: '0 4px 12px rgba(52, 152, 219, 0.8)',
    confetti: ['#3498db', '#ffffff', '#5dade2'],
    gradient: 'linear-gradient(135deg, #1a2a3a 0%, #0d1a2a 100%)'
  },
  red: {
    ribbonColor: 'rgba(231, 76, 60, 0.8)',
    bowShadow: '0 4px 12px rgba(231, 76, 60, 0.8)',
    confetti: ['#e74c3c', '#ffffff', '#ec7063'],
    gradient: 'linear-gradient(135deg, #2a1a1a 0%, #1a0d0d 100%)'
  },
  green: {
    ribbonColor: 'rgba(29, 185, 84, 0.8)',
    bowShadow: '0 4px 12px rgba(29, 185, 84, 0.6)',
    confetti: ['#1db954', '#ffffff', '#2ecc71'],
    gradient: 'linear-gradient(135deg, #1a2a1a 0%, #0d1a0d 100%)'
  },
  purple: {
    ribbonColor: 'rgba(155, 89, 182, 0.8)',
    bowShadow: '0 4px 12px rgba(155, 89, 182, 0.6)',
    confetti: ['#9b59b6', '#ffffff', '#c39bd3'],
    gradient: 'linear-gradient(135deg, #2a1a2a 0%, #1a0d1a 100%)'
  }
};

const GiftCard: React.FC<GiftCardProps> = ({ children, delay = 0, theme = 'yellow' }) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [hasFlippedOnce, setHasFlippedOnce] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const currentTheme = themes[theme] || themes.yellow;

  const handleFlip = (): void => {
    if (!hasFlippedOnce) {
      // Trigger confetti on first flip only
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: currentTheme.confetti,
        ticks: 100
      });
      setHasFlippedOnce(true);
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Card Container */}
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, rotateY: 0 }}
        animate={{
          opacity: 1,
          rotateY: isFlipped ? 180 : 0
        }}
        transition={{
          opacity: { delay, duration: 0.4 },
          rotateY: { duration: 0.5, ease: 'easeInOut' }
        }}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front Side - Gift Wrapping */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: currentTheme.gradient,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: isHovering && !isFlipped ? 'scale(1.02) translateY(-3px)' : 'scale(1)',
            transition: 'transform 0.2s ease'
          }}
        >
          {/* Gift Box Content */}
          <div className="relative p-8">
            {/* Vertical Ribbon */}
            <div
              className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-12 pointer-events-none"
              style={{
                background: `linear-gradient(to right, transparent, ${currentTheme.ribbonColor}, transparent)`,
              }}
            />

            {/* Horizontal Ribbon */}
            <div
              className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-12 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${currentTheme.ribbonColor}, transparent)`,
              }}
            />

            {/* Bow in center */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <span
                className="text-6xl block"
                style={{
                  filter: `drop-shadow(${currentTheme.bowShadow})`,
                  transform: isHovering ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  display: 'block'
                }}
              >
                🎁
              </span>
            </div>

            {/* Invisible content for sizing */}
            <div className="invisible" aria-hidden="true">
              {children}
            </div>

            {/* Tap hint */}
            <div
              className="absolute bottom-3 left-0 right-0 text-center text-xs pointer-events-none"
              style={{
                color: 'var(--color-text-secondary)',
                opacity: isHovering ? 1 : 0.5,
                transition: 'opacity 0.2s ease'
              }}
            >
              {t('gift.tapToReveal')}
            </div>
          </div>
        </div>

        {/* Back Side - Content (hidden until flipped) */}
        <div
          className="absolute inset-0 rounded-2xl p-8 border overflow-hidden"
          style={{
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderColor: 'var(--color-accent-green)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            // Hide completely when not flipped to prevent any flash
            visibility: hasFlippedOnce ? 'visible' : 'hidden'
          }}
        >
          {/* Only render content after first flip to prevent flash */}
          {hasFlippedOnce && (
            <>
              {children}

              {/* Tap to flip back hint */}
              <div
                className="absolute bottom-3 left-0 right-0 text-center text-xs pointer-events-none"
                style={{
                  color: 'var(--color-text-secondary)',
                  opacity: 0.5
                }}
              >
                {t('gift.tapToFlipBack')}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GiftCard;
