import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import StoryCard from './StoryCard';
import { getRankTitle, getRankChange } from '../utils/calculations';
import communityStats from '../data/communityStats.json';

const StorySection = ({ player, totalPlayers, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentStory, setCurrentStory] = useState(0);

  const rankChange = getRankChange(player.rank2024, player.rank2025);
  const rankTitle = getRankTitle(player.rank2025, i18n.language);

  // Trigger confetti on community stats and rank reveal
  useEffect(() => {
    if (currentStory === 2 || currentStory === 6) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1db954', '#ffd700', '#ffffff']
      });
    }
  }, [currentStory]);

  const stories = [
    // Story 1: Welcome
    {
      content: (
        <div>
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            {player.name}
          </motion.h1>
          <motion.p
            className="text-4xl"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {t('story.welcome')}
          </motion.p>
        </div>
      )
    },
    // Story 2: Total games
    {
      content: (
        <div>
          <motion.p
            className="text-2xl mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.gamesPlayed')}
          </motion.p>
          <motion.div
            className="text-9xl font-bold mb-4"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {player.total2025}
          </motion.div>
          <motion.p
            className="text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('story.games')}
          </motion.p>
        </div>
      )
    },
    // Story 3: Rank
    {
      content: (
        <div>
          <motion.p
            className="text-2xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.rank')}
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <div className="text-8xl font-bold mb-4" style={{ color: 'var(--color-accent-gold)' }}>
              #{player.rank2025}
            </div>
            <div className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              {t('story.outOf')} {totalPlayers} {t('story.players')}
            </div>
          </motion.div>
          <motion.div
            className="mt-8 text-xl"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {rankTitle.title}
          </motion.div>
          <motion.p
            className="mt-2"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {rankTitle.description}
          </motion.p>
        </div>
      )
    },
    // Story 4: Rank change
    {
      content: (
        <div>
          <motion.p
            className="text-2xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.rankChange')}
          </motion.p>
          <motion.div
            className="text-9xl mb-4"
            initial={{ scale: 0, rotate: rankChange.direction === 'up' ? -180 : 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {rankChange.emoji}
          </motion.div>
          <motion.p
            className="text-4xl font-bold"
            style={{
              color: rankChange.direction === 'up' ? 'var(--color-accent-green)' :
                     rankChange.direction === 'down' ? 'var(--color-accent-red)' :
                     'var(--color-accent-blue)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {rankChange.direction === 'up' && `${t('story.rankUp')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
            {rankChange.direction === 'down' && `${t('story.rankDown')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
            {rankChange.direction === 'same' && t('story.rankSame')}
          </motion.p>
        </div>
      )
    },
    // Story 5: Community - Total Games
    {
      content: (
        <div>
          <motion.h2
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('community.title')}
          </motion.h2>
          <motion.p
            className="text-xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('community.subtitle')}
          </motion.p>
          <motion.div
            className="text-8xl font-bold mb-4"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {communityStats.totalGamesAllTime}
          </motion.div>
          <motion.p
            className="text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('community.totalGamesAllTime', { count: communityStats.totalGamesAllTime })}
          </motion.p>
        </div>
      )
    },
    // Story 6: Community - Longest Streak & Average Players
    {
      content: (
        <div>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-3">🔥</div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
              {communityStats.longestStreak}
            </div>
            <div className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              {t('community.streakText', { count: communityStats.longestStreak })}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-6xl mb-3">⚽</div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
              {communityStats.averagePlayersPerMatch}
            </div>
            <div className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              {t('community.playersText', { count: communityStats.averagePlayersPerMatch })}
            </div>
          </motion.div>
        </div>
      )
    },
    // Story 7: Community - Favorite Fields
    {
      content: (
        <div>
          <motion.h3
            className="text-3xl font-bold mb-8"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('community.favoriteFields')}
          </motion.h3>
          <div className="space-y-4">
            {Object.entries(communityStats.fields).slice(0, 3).map(([field, count], index) => (
              <motion.div
                key={field}
                className="flex justify-between items-center px-6 py-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <span className="text-2xl font-semibold">{field}</span>
                <span className="text-3xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                  {count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Progress indicators */}
      <div className="fixed top-20 left-0 right-0 z-50 flex gap-1 px-4">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: 'var(--color-accent-green)' }}
              initial={{ width: 0 }}
              animate={{ width: index <= currentStory ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Story cards */}
      <AnimatePresence mode="wait">
        <StoryCard key={currentStory} onNext={handleNext}>
          {stories[currentStory].content}
        </StoryCard>
      </AnimatePresence>
    </div>
  );
};

export default StorySection;
