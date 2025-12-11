import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { GiftCardProps } from '../types';

interface ThemeConfig {
  ribbonVertical: string;
  ribbonHorizontal: string;
  shadowVertical: string;
  shadowHorizontal: string;
  bowShadow: string;
  confetti: string[];
  pattern: string;
}

const themes: Record<string, ThemeConfig> = {
  yellow: {
    ribbonVertical: 'linear-gradient(to right, rgba(29, 185, 84, 0.3), rgba(29, 185, 84, 0.8), rgba(29, 185, 84, 0.3))',
    ribbonHorizontal: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.8), rgba(255, 215, 0, 0.3))',
    shadowVertical: '0 0 25px rgba(29, 185, 84, 0.6)',
    shadowHorizontal: '0 0 25px rgba(255, 215, 0, 0.6)',
    bowShadow: '0 4px 12px rgba(255, 215, 0, 0.6)',
    confetti: ['#ffd700', '#1db954', '#ffffff'],
    pattern: 'repeating-linear-gradient(45deg, var(--color-accent-gold) 0px, var(--color-accent-gold) 10px, transparent 10px, transparent 20px)'
  },
  blue: {
    ribbonVertical: 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))',
    ribbonHorizontal: 'linear-gradient(to bottom, rgba(52, 152, 219, 0.3), rgba(52, 152, 219, 0.9), rgba(52, 152, 219, 0.3))',
    shadowVertical: '0 0 25px rgba(255, 255, 255, 0.6)',
    shadowHorizontal: '0 0 25px rgba(52, 152, 219, 0.6)',
    bowShadow: '0 4px 12px rgba(52, 152, 219, 0.8)',
    confetti: ['#3498db', '#ffffff', '#5dade2'],
    pattern: 'repeating-linear-gradient(45deg, var(--color-accent-blue) 0px, var(--color-accent-blue) 10px, transparent 10px, transparent 20px)'
  },
  red: {
    ribbonVertical: 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3))',
    ribbonHorizontal: 'linear-gradient(to bottom, rgba(231, 76, 60, 0.3), rgba(231, 76, 60, 0.9), rgba(231, 76, 60, 0.3))',
    shadowVertical: '0 0 25px rgba(255, 255, 255, 0.6)',
    shadowHorizontal: '0 0 25px rgba(231, 76, 60, 0.6)',
    bowShadow: '0 4px 12px rgba(231, 76, 60, 0.8)',
    confetti: ['#e74c3c', '#ffffff', '#ec7063'],
    pattern: 'repeating-linear-gradient(45deg, var(--color-accent-red) 0px, var(--color-accent-red) 10px, transparent 10px, transparent 20px)'
  },
  green: {
    ribbonVertical: 'linear-gradient(to right, rgba(29, 185, 84, 0.3), rgba(29, 185, 84, 0.8), rgba(29, 185, 84, 0.3))',
    ribbonHorizontal: 'linear-gradient(to bottom, rgba(29, 185, 84, 0.3), rgba(29, 185, 84, 0.8), rgba(29, 185, 84, 0.3))',
    shadowVertical: '0 0 25px rgba(29, 185, 84, 0.6)',
    shadowHorizontal: '0 0 25px rgba(29, 185, 84, 0.6)',
    bowShadow: '0 4px 12px rgba(29, 185, 84, 0.6)',
    confetti: ['#1db954', '#ffffff', '#2ecc71'],
    pattern: 'repeating-linear-gradient(45deg, var(--color-accent-green) 0px, var(--color-accent-green) 10px, transparent 10px, transparent 20px)'
  },
  purple: {
    ribbonVertical: 'linear-gradient(to right, rgba(155, 89, 182, 0.3), rgba(155, 89, 182, 0.8), rgba(155, 89, 182, 0.3))',
    ribbonHorizontal: 'linear-gradient(to bottom, rgba(155, 89, 182, 0.3), rgba(155, 89, 182, 0.8), rgba(155, 89, 182, 0.3))',
    shadowVertical: '0 0 25px rgba(155, 89, 182, 0.6)',
    shadowHorizontal: '0 0 25px rgba(155, 89, 182, 0.6)',
    bowShadow: '0 4px 12px rgba(155, 89, 182, 0.6)',
    confetti: ['#9b59b6', '#ffffff', '#c39bd3'],
    pattern: 'repeating-linear-gradient(45deg, #9b59b6 0px, #9b59b6 10px, transparent 10px, transparent 20px)'
  }
};

const GiftCard: React.FC<GiftCardProps> = ({ children, delay = 0, theme = 'yellow' }) => {
  const [isUnwrapped, setIsUnwrapped] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const currentTheme = themes[theme] || themes.yellow;

  const handleUnwrap = (): void => {
    // Trigger confetti on unwrap
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: currentTheme.confetti,
      ticks: 150
    });

    setIsUnwrapped(true);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isUnwrapped && (
          <motion.div
            className="cursor-pointer relative"
            onClick={handleUnwrap}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: isHovering ? 1.03 : 1,
              y: isHovering ? -5 : 0
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              y: -20,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{
              delay,
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            whileTap={{ scale: 0.97 }}
            style={{ willChange: 'transform, opacity' }}
          >

            {/* Gift Box - matches content size */}
            <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #282828 0%, #1a1a1a 100%)' }}>
              {/* Wrapping Paper Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: currentTheme.pattern,
                    backgroundSize: '30px 30px'
                  }}
                />
              </div>

              {/* Vertical Ribbon */}
              <div
                className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-16 z-10"
                style={{
                  background: currentTheme.ribbonVertical,
                  boxShadow: currentTheme.shadowVertical
                }}
              />

              {/* Horizontal Ribbon */}
              <div
                className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16 z-10"
                style={{
                  background: currentTheme.ribbonHorizontal,
                  boxShadow: currentTheme.shadowHorizontal
                }}
              />

              {/* Bow */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl z-20"
                animate={{
                  rotate: isHovering ? -8 : 0,
                  scale: isHovering ? 1.1 : 1
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut"
                }}
                style={{
                  filter: `drop-shadow(${currentTheme.bowShadow})`
                }}
              >
                🎀
              </motion.div>

              {/* Invisible content for sizing */}
              <div className="invisible" aria-hidden="true">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed Content */}
      <AnimatePresence>
        {isUnwrapped && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCard;
