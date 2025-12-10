import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const LoadingAnimation = () => {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    t('loading.message1'),
    t('loading.message2'),
    t('loading.message3')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {/* Spinning football */}
        <motion.div
          className="text-8xl mb-8"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          ⚽
        </motion.div>

        {/* Progress bar */}
        <div
          className="w-80 h-2 rounded-full mb-8 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(to right, var(--color-accent-green), var(--color-accent-gold))'
            }}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </div>

        {/* Rotating messages */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Floating dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-green)' }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
