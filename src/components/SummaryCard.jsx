import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { getRankTitle, getRankChange } from '../utils/calculations';

const SummaryCard = ({ player, totalPlayers }) => {
  const { t, i18n } = useTranslation();
  const cardRef = useRef(null);

  const rankTitle = getRankTitle(player.rank2025, i18n.language);
  const rankChange = getRankChange(player.rank2024, player.rank2025);
  const gamesDiff = player.total2025 - player.total2024;

  const handleDownload = async () => {
    if (cardRef.current === null) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#121212'
      });

      const link = document.createElement('a');
      link.download = `${player.name}-wrapped-2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-8"
    >
      {/* Screenshot Card */}
      <div
        ref={cardRef}
        className="border-2 rounded-3xl p-10 max-w-2xl mx-auto"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary), var(--color-bg-secondary))',
          borderColor: 'var(--color-accent-green)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold gradient-text mb-2">
            {t('summary.title')}
          </h2>
          <div className="w-20 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-accent-green)' }}></div>
        </div>

        {/* Player name */}
        <div className="text-center mb-6">
          <h3 className="text-5xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {player.name}
          </h3>
          <p className="text-xl" style={{ color: 'var(--color-accent-gold)' }}>
            {rankTitle.title}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Total games */}
          <div
            className="rounded-xl p-6 text-center border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'rgba(29, 185, 84, 0.3)'
            }}
          >
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
              {player.total2025}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('summary.totalGames')}
            </div>
          </div>

          {/* Rank */}
          <div
            className="rounded-xl p-6 text-center border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'rgba(255, 215, 0, 0.3)'
            }}
          >
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
              #{player.rank2025}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('summary.rank')} / {totalPlayers}
            </div>
          </div>

          {/* Rank change */}
          <div
            className="rounded-xl p-6 text-center border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: rankChange.direction === 'up' ? 'rgba(29, 185, 84, 0.3)' :
                           rankChange.direction === 'down' ? 'rgba(231, 76, 60, 0.3)' :
                           'rgba(52, 152, 219, 0.3)'
            }}
          >
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: rankChange.direction === 'up' ? 'var(--color-accent-green)' :
                       rankChange.direction === 'down' ? 'var(--color-accent-red)' :
                       'var(--color-accent-blue)'
              }}
            >
              {rankChange.emoji} {rankChange.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('summary.rankChange')}
            </div>
          </div>

          {/* Games change */}
          <div
            className="rounded-xl p-6 text-center border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: gamesDiff > 0 ? 'rgba(29, 185, 84, 0.3)' :
                           gamesDiff < 0 ? 'rgba(231, 76, 60, 0.3)' :
                           'rgba(52, 152, 219, 0.3)'
            }}
          >
            <div
              className="text-4xl font-bold mb-2"
              style={{
                color: gamesDiff > 0 ? 'var(--color-accent-green)' :
                       gamesDiff < 0 ? 'var(--color-accent-red)' :
                       'var(--color-accent-blue)'
              }}
            >
              {gamesDiff > 0 ? '+' : ''}{gamesDiff}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('summary.gamesChange')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t" style={{ borderColor: 'var(--color-bg-card)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('summary.footer')}
          </p>
        </div>
      </div>

      {/* Screenshot prompt */}
      <div className="text-center mt-6">
        <motion.button
          onClick={handleDownload}
          className="px-8 py-4 font-bold rounded-xl text-lg transition-colors"
          style={{
            backgroundColor: 'var(--color-accent-green)',
            color: 'var(--color-bg-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-green)';
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📸 {t('summary.screenshotPrompt')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
