import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import GiftCard from './GiftCard';

const StatCard = ({ children, delay = 0, asGift = false, giftTheme = 'yellow' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cardContent = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl p-8 mb-6 border transition-colors"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-bg-secondary)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent-green)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-bg-secondary)';
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
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-green)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-bg-secondary)';
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
