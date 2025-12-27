import React from 'react';
import { motion } from 'framer-motion';

interface QuizMultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}

const QuizMultipleChoice: React.FC<QuizMultipleChoiceProps> = ({
  question,
  options,
  selectedAnswer,
  onSelect
}) => {
  return (
    <div className="mb-4">
      <label
        className="block text-base leading-tight mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question}
      </label>

      <div className="grid grid-cols-1 gap-2">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;

          return (
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              className="w-full px-4 py-3 rounded-lg text-left transition-colors"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(29, 185, 84, 0.3)'
                  : 'var(--color-bg-card)',
                border: isSelected
                  ? '2px solid var(--color-accent-green)'
                  : '2px solid transparent',
                color: isSelected
                  ? 'var(--color-accent-green)'
                  : 'var(--color-text-primary)'
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: isSelected
                  ? 'rgba(29, 185, 84, 0.4)'
                  : 'rgba(75, 85, 99, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--color-accent-green)'
                      : 'var(--color-bg-secondary)',
                    color: isSelected
                      ? 'var(--color-bg-primary)'
                      : 'var(--color-text-secondary)'
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizMultipleChoice;
