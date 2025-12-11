import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const GiftCard = ({ children, delay = 0 }) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleUnwrap = () => {
    // Trigger confetti on unwrap
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#1db954', '#ffffff'],
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

            {/* Gift Box */}
            <motion.div
              className="relative rounded-2xl p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #282828 0%, #1a1a1a 100%)',
                boxShadow: isHovering
                  ? '0 20px 60px rgba(255, 215, 0, 0.3), 0 0 40px rgba(29, 185, 84, 0.2)'
                  : '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {/* Wrapping Paper Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, var(--color-accent-gold) 0px, var(--color-accent-gold) 10px, transparent 10px, transparent 20px)',
                    backgroundSize: '30px 30px'
                  }}
                />
              </div>

              {/* Vertical Ribbon */}
              <div
                className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-16"
                style={{
                  background: 'linear-gradient(to right, rgba(29, 185, 84, 0.3), rgba(29, 185, 84, 0.8), rgba(29, 185, 84, 0.3))',
                  boxShadow: '0 0 25px rgba(29, 185, 84, 0.6)'
                }}
              />

              {/* Horizontal Ribbon */}
              <div
                className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.8), rgba(255, 215, 0, 0.3))',
                  boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
                }}
              />

              {/* Bow */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl z-10"
                animate={{
                  rotate: isHovering ? -8 : 0,
                  scale: isHovering ? 1.1 : 1
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut"
                }}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))'
                }}
              >
                🎀
              </motion.div>
            </motion.div>
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
