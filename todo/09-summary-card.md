# Step 09: Summary Card (Shareable)

## Objective
Create the final summary card optimized for screenshots and sharing.

## Tasks

### 1. Create SummaryCard Component
Create `src/components/SummaryCard.jsx`:

```jsx
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
        className="bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary border-2 border-accent-green rounded-3xl p-10 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-green to-accent-gold bg-clip-text text-transparent mb-2">
            {t('summary.title')}
          </h2>
          <div className="w-20 h-1 bg-accent-green mx-auto rounded-full"></div>
        </div>

        {/* Player name */}
        <div className="text-center mb-6">
          <h3 className="text-5xl font-bold text-text-primary mb-2">
            {player.name}
          </h3>
          <p className="text-xl text-accent-gold">
            {rankTitle.title}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Total games */}
          <div className="bg-bg-card rounded-xl p-6 text-center border border-accent-green/30">
            <div className="text-5xl font-bold text-accent-green mb-2">
              {player.total2025}
            </div>
            <div className="text-text-secondary text-sm">
              {t('summary.totalGames')}
            </div>
          </div>

          {/* Rank */}
          <div className="bg-bg-card rounded-xl p-6 text-center border border-accent-gold/30">
            <div className="text-5xl font-bold text-accent-gold mb-2">
              #{player.rank2025}
            </div>
            <div className="text-text-secondary text-sm">
              {t('summary.rank')} / {totalPlayers}
            </div>
          </div>

          {/* Rank change */}
          <div className={`bg-bg-card rounded-xl p-6 text-center border ${
            rankChange.direction === 'up' ? 'border-accent-green/30' :
            rankChange.direction === 'down' ? 'border-accent-red/30' :
            'border-accent-blue/30'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${
              rankChange.direction === 'up' ? 'text-accent-green' :
              rankChange.direction === 'down' ? 'text-accent-red' :
              'text-accent-blue'
            }`}>
              {rankChange.emoji} {rankChange.value}
            </div>
            <div className="text-text-secondary text-sm">
              {t('summary.rankChange')}
            </div>
          </div>

          {/* Games change */}
          <div className={`bg-bg-card rounded-xl p-6 text-center border ${
            gamesDiff > 0 ? 'border-accent-green/30' :
            gamesDiff < 0 ? 'border-accent-red/30' :
            'border-accent-blue/30'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${
              gamesDiff > 0 ? 'text-accent-green' :
              gamesDiff < 0 ? 'text-accent-red' :
              'text-accent-blue'
            }`}>
              {gamesDiff > 0 ? '+' : ''}{gamesDiff}
            </div>
            <div className="text-text-secondary text-sm">
              {t('summary.gamesChange')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-bg-card">
          <p className="text-text-secondary text-sm">
            {t('summary.footer')}
          </p>
        </div>
      </div>

      {/* Screenshot prompt */}
      <div className="text-center mt-6">
        <motion.button
          onClick={handleDownload}
          className="px-8 py-4 bg-accent-green hover:bg-accent-gold text-bg-primary font-bold rounded-xl text-lg transition-colors"
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
```

## Expected Outcome
- Beautiful summary card with all key stats
- Screenshot-optimized design
- Download as image button
- Includes: Name, title, games, rank, changes
- Ready to share on social media

## Next Step
Proceed to `10-styling-animations.md`
