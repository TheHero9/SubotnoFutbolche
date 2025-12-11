import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GiftCard = ({ children, delay = 0 }) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);

  const handleUnwrap = () => {
    setIsUnwrapped(true);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {!isUnwrapped && (
          <motion.div
            className="cursor-pointer"
            onClick={handleUnwrap}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.2,
              rotateY: 180,
              transition: { duration: 0.6 }
            }}
            transition={{ delay }}
          >
            {/* Gift Box Wrapper */}
            <div
              className="relative rounded-2xl p-8 border-4 border-dashed"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(29, 185, 84, 0.1))',
                borderColor: 'var(--color-accent-gold)'
              }}
            >
              {/* Ribbon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-full h-12"
                  style={{
                    background: 'linear-gradient(to right, transparent 45%, var(--color-accent-green) 45%, var(--color-accent-green) 55%, transparent 55%)',
                    opacity: 0.3
                  }}
                />
                <div
                  className="absolute w-12 h-full"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 45%, var(--color-accent-green) 45%, var(--color-accent-green) 55%, transparent 55%)',
                    opacity: 0.3
                  }}
                />
              </div>

              {/* Bow */}
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-6xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎀
              </motion.div>

              {/* Gift Icon */}
              <div className="text-center py-12">
                <motion.div
                  className="text-8xl mb-4"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎁
                </motion.div>
                <motion.p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-accent-gold)' }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Click to Unwrap
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed Content */}
      <AnimatePresence>
        {isUnwrapped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCard;
