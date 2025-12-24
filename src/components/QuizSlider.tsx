import React from 'react';
import { motion } from 'framer-motion';

interface QuizSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  margin: number;
  anchor?: {
    value: number;
    label: string;
  };
}

const QuizSlider: React.FC<QuizSliderProps> = ({
  value,
  onChange,
  min,
  max,
  label,
  margin,
  anchor
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const anchorPercentage = anchor ? ((anchor.value - min) / (max - min)) * 100 : null;

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <label className="block text-base leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </label>
        <span
          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          style={{
            backgroundColor: 'rgba(29, 185, 84, 0.2)',
            color: 'var(--color-accent-green)'
          }}
        >
          ±{margin}
        </span>
      </div>

      <div className="relative">
        {/* Current value display */}
        <motion.div
          className="text-center mb-1"
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <span
            className="text-3xl font-bold"
            style={{ color: 'var(--color-accent-green)' }}
          >
            {value}
          </span>
        </motion.div>

        {/* Slider track with anchor marker */}
        <div className="relative h-10 flex items-center">
          {/* Background track */}
          <div
            className="absolute w-full h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          />

          {/* Filled track */}
          <div
            className="absolute h-2 rounded-full transition-all duration-150"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'var(--color-accent-green)'
            }}
          />

          {/* Anchor marker (2024 value) */}
          {anchor && anchorPercentage !== null && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: `${anchorPercentage}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: 'var(--color-accent-gold)' }}
              />
              <span
                className="text-xs mt-1 whitespace-nowrap"
                style={{ color: 'var(--color-accent-gold)' }}
              >
                {anchor.label}: {anchor.value}
              </span>
            </div>
          )}

          {/* Native range input */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            className="absolute w-full h-8 cursor-pointer opacity-0"
            style={{ zIndex: 10 }}
          />

          {/* Custom thumb */}
          <div
            className="absolute w-6 h-6 rounded-full border-2 transition-all duration-150 pointer-events-none"
            style={{
              left: `calc(${percentage}% - 12px)`,
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-accent-green)',
              boxShadow: '0 2px 8px rgba(29, 185, 84, 0.4)'
            }}
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between mt-1">
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {min}
          </span>
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {max}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuizSlider;
