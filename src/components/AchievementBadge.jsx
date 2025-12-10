import { motion } from 'framer-motion';

const AchievementBadge = ({ icon, text, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl p-6 text-center border"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(29, 185, 84, 0.2))',
        borderColor: 'var(--color-accent-gold)'
      }}
    >
      <div className="text-5xl mb-3">{icon}</div>
      <p style={{ color: 'var(--color-text-primary)' }}>{text}</p>
    </motion.div>
  );
};

export default AchievementBadge;
