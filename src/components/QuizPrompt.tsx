import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface QuizPromptProps {
  playerName: string;
  onTakeQuiz: () => void;
  onSkip: () => void;
}

const QuizPrompt: React.FC<QuizPromptProps> = ({
  playerName,
  onTakeQuiz,
  onSkip
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        {/* Animated football */}
        <motion.div
          className="text-6xl mb-6"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          ⚽
        </motion.div>

        {/* Greeting */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-4 gradient-text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('quizPrompt.greeting', { name: playerName })}
        </motion.h1>

        <motion.p
          className="text-lg mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t('quizPrompt.description')}
        </motion.p>

        {/* Quiz info card */}
        <motion.div
          className="rounded-xl p-6 mb-8"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <span className="text-2xl block mb-1">📝</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {t('quizPrompt.info.questions')}
              </span>
            </div>
            <div className="text-center">
              <span className="text-2xl block mb-1">⏱️</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {t('quizPrompt.info.time')}
              </span>
            </div>
            <div className="text-center">
              <span className="text-2xl block mb-1">🏆</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {t('quizPrompt.info.points')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Take Quiz Button */}
          <motion.button
            onClick={onTakeQuiz}
            className="w-full py-4 px-8 rounded-lg text-xl font-bold transition-all"
            style={{
              backgroundColor: 'var(--color-accent-green)',
              color: 'var(--color-bg-primary)'
            }}
            whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent-gold)' }}
            whileTap={{ scale: 0.98 }}
          >
            {t('quizPrompt.buttons.takeQuiz')}
          </motion.button>

          {/* Skip Button */}
          <motion.button
            onClick={onSkip}
            className="w-full py-3 px-8 rounded-lg text-lg font-medium transition-all"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid var(--color-text-secondary)',
              color: 'var(--color-text-secondary)'
            }}
            whileHover={{
              scale: 1.02,
              borderColor: 'var(--color-text-primary)',
              color: 'var(--color-text-primary)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            {t('quizPrompt.buttons.skip')}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizPrompt;
