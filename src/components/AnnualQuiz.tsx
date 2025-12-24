import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProcessedPlayer, GameRecord } from '../types';
import {
  generateQuizQuestions,
  calculateQuizResults,
  type QuizSlide,
  type QuizResult
} from '../utils/quizCalculations';
import QuizSlider from './QuizSlider';

interface AnnualQuizProps {
  player: ProcessedPlayer;
  allPlayers: ProcessedPlayer[];
  games2024: GameRecord[];
  games2025: GameRecord[];
  onClose: (results: QuizResult) => void;
}

const AnnualQuiz: React.FC<AnnualQuizProps> = ({
  player,
  allPlayers,
  games2024,
  games2025,
  onClose
}) => {
  const { t } = useTranslation();

  // Generate questions
  const slides = useMemo(
    () => generateQuizQuestions(player, allPlayers, games2024, games2025),
    [player, allPlayers, games2024, games2025]
  );

  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showTeaser, setShowTeaser] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);

  // Initialize default answers
  useMemo(() => {
    const defaultAnswers: Record<string, number> = {};
    slides.forEach(slide => {
      slide.questions.forEach(q => {
        defaultAnswers[q.id] = Math.floor((q.min + q.max) / 2);
      });
    });
    setAnswers(defaultAnswers);
  }, [slides]);

  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastSlide) {
      // Submit quiz - calculate results and show teaser
      const quizResults = calculateQuizResults(slides, answers);
      setResults(quizResults);
      setShowTeaser(true);
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    if (results) {
      onClose(results);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.98)' }}
      />

      {/* Content */}
      <motion.div
        className="relative w-full max-w-xl rounded-2xl p-6 md:p-8"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-accent-green)'
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {showTeaser && results ? (
            <TeaserScreen
              results={results}
              onContinue={handleContinue}
            />
          ) : (
            <QuizSlideComponent
              key={currentSlide}
              slide={currentSlideData}
              slideIndex={currentSlide}
              totalSlides={totalSlides}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onNext={handleNext}
              onPrev={handlePrev}
              isLastSlide={isLastSlide}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// QUIZ SLIDE COMPONENT
// ============================================

interface QuizSlideComponentProps {
  slide: QuizSlide;
  slideIndex: number;
  totalSlides: number;
  answers: Record<string, number>;
  onAnswerChange: (questionId: string, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isLastSlide: boolean;
}

const QuizSlideComponent: React.FC<QuizSlideComponentProps> = ({
  slide,
  slideIndex,
  totalSlides,
  answers,
  onAnswerChange,
  onNext,
  onPrev,
  isLastSlide
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: i <= slideIndex
                ? 'var(--color-accent-green)'
                : 'var(--color-bg-card)'
            }}
          />
        ))}
      </div>

      {/* Slide title */}
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {t(slide.titleKey)}
      </h2>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {slide.questions.map(question => (
          <QuizSlider
            key={question.id}
            value={answers[question.id] ?? Math.floor((question.min + question.max) / 2)}
            onChange={(value) => onAnswerChange(question.id, value)}
            min={question.min}
            max={question.max}
            label={t(question.questionKey)}
            anchor={question.anchor ? {
              value: question.anchor.value,
              label: t(question.anchor.labelKey)
            } : undefined}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {slideIndex > 0 && (
          <motion.button
            onClick={onPrev}
            className="flex-1 py-3 px-6 rounded-lg font-bold transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid var(--color-text-secondary)',
              color: 'var(--color-text-secondary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('quiz.buttons.prev')}
          </motion.button>
        )}
        <motion.button
          onClick={onNext}
          className="flex-1 py-3 px-6 rounded-lg font-bold transition-colors"
          style={{
            backgroundColor: 'var(--color-accent-green)',
            color: 'var(--color-bg-primary)'
          }}
          whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent-gold)' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLastSlide ? t('quiz.buttons.submit') : t('quiz.buttons.next')}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================
// TEASER SCREEN (after submit, before showing stats)
// ============================================

interface TeaserScreenProps {
  results: QuizResult;
  onContinue: () => void;
}

const TeaserScreen: React.FC<TeaserScreenProps> = ({
  results,
  onContinue
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        className="text-7xl mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.1, duration: 0.6 }}
      >
        ✅
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--color-text-primary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {t('quiz.teaser.submitted')}
      </motion.h2>

      <motion.p
        className="text-lg mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {t('quiz.teaser.description')}
      </motion.p>

      {/* Hint about results */}
      <motion.div
        className="rounded-xl p-4 mb-8"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px dashed var(--color-accent-gold)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm" style={{ color: 'var(--color-accent-gold)' }}>
          💡 {t('quiz.teaser.hint')}
        </p>
      </motion.div>

      {/* Continue button */}
      <motion.button
        onClick={onContinue}
        className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors"
        style={{
          backgroundColor: 'var(--color-accent-green)',
          color: 'var(--color-bg-primary)'
        }}
        whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent-gold)' }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {t('quiz.buttons.continue')}
      </motion.button>
    </motion.div>
  );
};

export default AnnualQuiz;
