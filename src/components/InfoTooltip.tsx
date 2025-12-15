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
            {/* Tooltip - fixed position for mobile safety */}
            <motion.div
              className="fixed z-50 left-4 right-4 top-1/3 mx-auto px-4 py-3 rounded-xl text-sm max-w-sm text-center"
              style={{
                backgroundColor: 'rgba(26, 26, 26, 0.98)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-accent-green)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              {text}
              {/* Close hint */}
              <div
                className="mt-2 text-xs opacity-50"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                tap anywhere to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
};

export default InfoTooltip;
