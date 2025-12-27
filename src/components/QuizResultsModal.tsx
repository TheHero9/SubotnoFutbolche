import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { QuizResult } from '../utils/quizCalculations';

interface QuizResultsModalProps {
  results: QuizResult;
  isOpen: boolean;
  onClose: () => void;
}

const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  results,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();

  // Trigger confetti on open if score is good
  React.useEffect(() => {
    if (isOpen && results.totalCorrect >= 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1db954', '#ffd700', '#ffffff']
      });
    }
  }, [isOpen, results.totalCorrect]);

  const totalQuestions = results.totalQuestions;
  const perfectScore = results.totalCorrect === totalQuestions;
  const greatScore = results.totalCorrect >= totalQuestions * 0.7;
  const goodScore = results.totalCorrect >= totalQuestions * 0.4;

  const getScoreEmoji = () => {
    if (perfectScore) return '🏆';
    if (greatScore) return '🌟';
    if (goodScore) return '💪';
    return '📚';
  };

  const getScoreMessage = () => {
    if (perfectScore) return t('quiz.results.perfect');
    if (greatScore) return t('quiz.results.great');
    if (goodScore) return t('quiz.results.good');
    return t('quiz.results.tryAgain');
  };

  const getScoreColor = () => {
    if (greatScore) return 'var(--color-accent-green)';
    if (goodScore) return 'var(--color-accent-gold)';
    return 'var(--color-accent-red)';
  };

  // Combine all answers for display
  const allAnswersCount = results.answers.length + (results.multipleChoiceAnswers?.length || 0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)' }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '2px solid var(--color-accent-green)'
          }}
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Header with gradient */}
          <div
            className="p-6 text-center"
            style={{
              background: 'linear-gradient(180deg, var(--color-bg-card) 0%, transparent 100%)'
            }}
          >
            {/* Score emoji with animation */}
            <motion.div
              className="text-8xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
            >
              {getScoreEmoji()}
            </motion.div>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: getScoreColor() }}
              >
                {results.totalCorrect}
                <span
                  className="text-3xl"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  /{results.totalQuestions}
                </span>
              </div>
              <p
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {getScoreMessage()}
              </p>
            </motion.div>
          </div>

          {/* Results breakdown */}
          <div className="px-4 pb-4 max-h-[40vh] overflow-y-auto">
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              {/* Slider answers */}
              {results.answers.map((answer, index) => (
                <motion.div
                  key={answer.questionId}
                  className="flex items-center gap-3 p-3"
                  style={{
                    borderBottom: index < allAnswersCount - 1
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none'
                  }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                >
                  {/* Result icon */}
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: answer.isCorrect
                        ? answer.isExact
                          ? 'rgba(29, 185, 84, 0.2)'
                          : 'rgba(255, 215, 0, 0.2)'
                        : 'rgba(231, 76, 60, 0.2)'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.08, type: 'spring' }}
                  >
                    <span className="text-xl">
                      {answer.isCorrect ? (answer.isExact ? '✓' : '≈') : '✗'}
                    </span>
                  </motion.div>

                  {/* Question info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {t(`quiz.questions.${answer.questionId.replace('org_', '').replace('personal_', '')}`)}
                      </p>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        ±{answer.margin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {answer.userAnswer}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                      <span
                        style={{
                          color: answer.isCorrect
                            ? 'var(--color-accent-green)'
                            : 'var(--color-accent-gold)'
                        }}
                      >
                        {answer.correctAnswer}
                      </span>
                      {answer.isCorrect && !answer.isExact && (
                        <span style={{ color: 'var(--color-accent-gold)', fontSize: '10px' }}>
                          ({answer.userAnswer > answer.correctAnswer ? '+' : ''}{answer.userAnswer - answer.correctAnswer})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: answer.isCorrect
                        ? answer.isExact
                          ? 'rgba(29, 185, 84, 0.2)'
                          : 'rgba(255, 215, 0, 0.2)'
                        : 'transparent',
                      color: answer.isCorrect
                        ? answer.isExact
                          ? 'var(--color-accent-green)'
                          : 'var(--color-accent-gold)'
                        : 'var(--color-text-secondary)'
                    }}
                  >
                    {answer.isCorrect ? '+1' : '0'}
                  </div>
                </motion.div>
              ))}

              {/* Multiple choice answers */}
              {results.multipleChoiceAnswers?.map((answer, index) => {
                const baseIndex = results.answers.length + index;
                const isLast = baseIndex === allAnswersCount - 1;

                return (
                  <motion.div
                    key={answer.questionId}
                    className="flex items-center gap-3 p-3"
                    style={{
                      borderBottom: !isLast
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none'
                    }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + baseIndex * 0.08 }}
                  >
                    {/* Result icon */}
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: answer.isCorrect
                          ? 'rgba(29, 185, 84, 0.2)'
                          : 'rgba(231, 76, 60, 0.2)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + baseIndex * 0.08, type: 'spring' }}
                    >
                      <span className="text-xl">
                        {answer.isCorrect ? '✓' : '✗'}
                      </span>
                    </motion.div>

                    {/* Question info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {t(`quiz.results.${answer.questionId}`)}
                      </p>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span
                          className="truncate"
                          style={{
                            color: answer.isCorrect
                              ? 'var(--color-accent-green)'
                              : 'var(--color-text-secondary)',
                            maxWidth: '80px'
                          }}
                        >
                          {answer.userAnswer || '—'}
                        </span>
                        {!answer.isCorrect && answer.userAnswer && (
                          <>
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                            <span
                              className="truncate"
                              style={{
                                color: 'var(--color-accent-gold)',
                                maxWidth: '80px'
                              }}
                            >
                              {answer.correctAnswer}
                            </span>
                          </>
                        )}
                        {!answer.userAnswer && (
                          <>
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                            <span
                              className="truncate"
                              style={{
                                color: 'var(--color-accent-gold)',
                                maxWidth: '80px'
                              }}
                            >
                              {answer.correctAnswer}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div
                      className="text-sm font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor: answer.isCorrect
                          ? 'rgba(29, 185, 84, 0.2)'
                          : 'transparent',
                        color: answer.isCorrect
                          ? 'var(--color-accent-green)'
                          : 'var(--color-text-secondary)'
                      }}
                    >
                      {answer.isCorrect ? '+1' : '0'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Close button */}
          <div className="p-4 pt-0">
            <motion.button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl font-bold transition-colors"
              style={{
                backgroundColor: 'var(--color-accent-green)',
                color: 'var(--color-bg-primary)'
              }}
              whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent-gold)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {t('quiz.results.close')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizResultsModal;
