import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { StatCardProps } from '../types';
import GiftCard from './GiftCard';

const StatCard: React.FC<StatCardProps> = ({ children, delay = 0, asGift = false, giftTheme = 'yellow' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cardContent = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl p-8 mb-6 border transition-colors"
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent-green)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      {children}
    </motion.div>
  );

  if (asGift) {
    return (
      <div ref={ref} className="mb-6">
        {isInView && (
          <GiftCard delay={delay} theme={giftTheme}>
            <div
              className="rounded-2xl p-8 border transition-colors"
              style={{
                backgroundColor: 'rgba(26, 26, 26, 0.7)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-green)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {children}
            </div>
          </GiftCard>
        )}
      </div>
    );
  }

  return cardContent;
};

export default StatCard;
