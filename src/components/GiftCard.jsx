import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const GiftCard = ({ children, delay = 0 }) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleUnwrap = () => {
    // Trigger confetti on unwrap
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#1db954', '#ffffff'],
      ticks: 200
    });

    setIsUnwrapped(true);
  };

  return (
    <div className="relative perspective-1000">
      <AnimatePresence mode="wait">
        {!isUnwrapped && (
          <motion.div
            className="cursor-pointer relative"
            onClick={handleUnwrap}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{
              opacity: 1,
              scale: isHovering ? 1.02 : 1,
              rotateX: 0,
              y: isHovering ? -8 : 0
            }}
            exit={{
              opacity: 0,
              scale: 0.3,
              rotateZ: 15,
              y: -100,
              transition: {
                duration: 0.5,
                ease: "easeIn"
              }
            }}
            transition={{
              delay,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 30}%`
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Gift Box */}
            <motion.div
              className="relative rounded-2xl p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #282828 0%, #1a1a1a 100%)',
                boxShadow: isHovering
                  ? '0 20px 60px rgba(255, 215, 0, 0.3), 0 0 40px rgba(29, 185, 84, 0.2)'
                  : '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
              animate={{
                boxShadow: isHovering
                  ? ['0 20px 60px rgba(255, 215, 0, 0.3)', '0 20px 60px rgba(29, 185, 84, 0.3)', '0 20px 60px rgba(255, 215, 0, 0.3)']
                  : '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
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
              <motion.div
                className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-16"
                style={{
                  background: 'linear-gradient(to right, rgba(29, 185, 84, 0.3), rgba(29, 185, 84, 0.8), rgba(29, 185, 84, 0.3))',
                  boxShadow: '0 0 20px rgba(29, 185, 84, 0.5)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(29, 185, 84, 0.5)',
                    '0 0 30px rgba(29, 185, 84, 0.8)',
                    '0 0 20px rgba(29, 185, 84, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Horizontal Ribbon */}
              <motion.div
                className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.8), rgba(255, 215, 0, 0.3))',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                    '0 0 30px rgba(255, 215, 0, 0.8)',
                    '0 0 20px rgba(255, 215, 0, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />

              {/* Bow */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl z-10"
                animate={{
                  rotate: isHovering ? [0, -5, 5, 0] : 0,
                  scale: isHovering ? [1, 1.15, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))'
                }}
              >
                🎀
              </motion.div>

              {/* Click Hint */}
              <motion.div
                className="absolute bottom-6 left-0 right-0 text-center z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.5 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(29, 185, 84, 0.2))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 215, 0, 0.5)'
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    borderColor: [
                      'rgba(255, 215, 0, 0.5)',
                      'rgba(29, 185, 84, 0.5)',
                      'rgba(255, 215, 0, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-xl">👆</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-accent-gold)' }}
                  >
                    Click to Open
                  </span>
                  <span className="text-xl">🎁</span>
                </motion.div>
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
              scale: 0.5,
              y: 50,
              rotateX: -20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0
            }}
            transition={{
              duration: 0.7,
              type: "spring",
              stiffness: 200,
              damping: 15
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
