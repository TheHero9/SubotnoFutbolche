import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
  text: string;
  size?: 'sm' | 'md';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 'sm' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-full font-bold transition-colors ${
          size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
        }`}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-text-secondary)'
        }}
      >
        i
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            {/* Tooltip */}
            <motion.div
              className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs max-w-[250px] text-center whitespace-normal"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-accent-green)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {text}
              {/* Arrow */}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid var(--color-accent-green)'
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
};

export default InfoTooltip;
