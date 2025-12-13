import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import type { StorySectionProps, CommunityStatsRaw } from '../types';
import StoryCard from './StoryCard';
import { getRankTitle, getRankChange, calculateCommunityStats } from '../utils/calculations';
import communityStatsRaw from '../data/communityStats.json';

const rawStats = communityStatsRaw as CommunityStatsRaw;

const StorySection: React.FC<StorySectionProps> = ({ player, totalPlayers, allPlayers, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [showGameDates, setShowGameDates] = useState<boolean>(false);
  const [showRankingList, setShowRankingList] = useState<boolean>(false);

  // Sort players by rank for the ranking list
  const rankedPlayers = useMemo(() => {
    return [...allPlayers].sort((a, b) => a.rank2025 - b.rank2025);
  }, [allPlayers]);

  // Calculate community stats from raw data
  const communityStats = useMemo(() => calculateCommunityStats(rawStats), []);

  // Format dates to dd.mm format (EU style)
  const formatDateEU = (dateStr: string): string => {
    const [day, month] = dateStr.split('/');
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}`;
  };

  // Season colors
  const seasonColors = {
    winter: { bg: '#3b82f6', text: '#ffffff' },   // Blue
    spring: { bg: '#ec4899', text: '#ffffff' },   // Pink
    summer: { bg: '#eab308', text: '#000000' },   // Yellow
    autumn: { bg: '#f97316', text: '#ffffff' }    // Orange
  };

  // Get season from date string (DD/MM format)
  const getSeasonFromDate = (dateStr: string): 'winter' | 'spring' | 'summer' | 'autumn' => {
    const [, month] = dateStr.split('/').map(Number);
    if (month === 12 || month === 1 || month === 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'autumn';
  };

  const sortedDates2025 = [...(player.dates2025 || [])].sort((a, b) => {
    const [dayA, monthA] = a.split('/').map(Number);
    const [dayB, monthB] = b.split('/').map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  const rankChange = getRankChange(player.rank2024, player.rank2025);
  const rankTitle = getRankTitle(player.rank2025, i18n.language as 'bg' | 'en');

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

          {!showGameDates ? (
            <>
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
                className="text-3xl mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('story.games')}
              </motion.p>
              <motion.button
                className="px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-accent-green)',
                  border: '2px solid var(--color-accent-green)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGameDates(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📅 {t('story.showDates')}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div
                className="max-h-48 overflow-y-auto px-4 py-3 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {sortedDates2025.map((date, index) => {
                    const season = getSeasonFromDate(date);
                    return (
                      <motion.span
                        key={date}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: seasonColors[season].bg,
                          color: seasonColors[season].text
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {formatDateEU(date)}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Season Legend */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-4 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.winter.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>❄️ {t('seasons.winter')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.spring.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>🌸 {t('seasons.spring')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.summer.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>☀️ {t('seasons.summer')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.autumn.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>🍂 {t('seasons.autumn')}</span>
                </div>
              </motion.div>

              <motion.button
                className="px-6 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-text-secondary)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGameDates(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← {t('story.hideDates')}
              </motion.button>
            </motion.div>
          )}
        </div>
      )
    },
    // Story 3: Rank
    {
      content: (
        <div>
          {!showRankingList ? (
            <>
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
                className="mt-2 mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {rankTitle.description}
              </motion.p>
              <motion.button
                className="px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-accent-gold)',
                  border: '2px solid var(--color-accent-gold)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRankingList(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏆 {t('story.showRanking')}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: 'var(--color-accent-gold)' }}>
                🏆 {t('story.fullRanking')}
              </h3>
              <div
                className="max-h-[55vh] md:max-h-[50vh] overflow-y-auto rounded-xl mb-4"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {rankedPlayers.map((p, index) => (
                  <motion.div
                    key={p.name}
                    className="flex justify-between items-center px-3 md:px-4 py-3 border-b"
                    style={{
                      backgroundColor: p.name === player.name
                        ? 'var(--color-accent-green)'
                        : 'transparent',
                      color: p.name === player.name
                        ? 'var(--color-bg-primary)'
                        : 'var(--color-text-primary)',
                      borderColor: 'var(--color-bg-secondary)'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <span className="font-semibold text-sm md:text-base">
                      #{p.rank2025} {p.name}
                    </span>
                    <span className="font-bold text-sm md:text-base whitespace-nowrap ml-2">
                      {p.total2025} {t('story.games')}
                    </span>
                  </motion.div>
                ))}
              </div>
              <motion.button
                className="px-6 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-text-secondary)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRankingList(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← {t('story.hideRanking')}
              </motion.button>
            </motion.div>
          )}
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
    // Story 5: Community - Total Games 2025
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
            className="text-xl mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('community.subtitle')}
          </motion.p>
          <motion.div
            className="text-8xl font-bold mb-2"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {communityStats.gamesPlayed2025}
          </motion.div>
          <motion.p
            className="text-2xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('community.gamesIn2025')}
          </motion.p>
          <motion.div
            className="flex justify-center gap-6 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: communityStats.gamesChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                {communityStats.gamesChange >= 0 ? '+' : ''}{communityStats.gamesChange}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('community.vs2024')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-blue)' }}>
                {communityStats.totalGamesAllTime}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('community.allTime')}</div>
            </div>
          </motion.div>
        </div>
      )
    },
    // Story 6: Community - Average Players & Success Rate
    {
      content: (
        <div>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-5xl mb-3">⚽</div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
              {communityStats.avgPlayers2025}
            </div>
            <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {t('community.avgPlayersPerGame')}
            </div>
            <div className="text-xl mt-2" style={{ color: communityStats.avgPlayersChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
              {communityStats.avgPlayersChange >= 0 ? '↑' : '↓'} {Math.abs(communityStats.avgPlayersChange)} {t('community.vs2024')}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-5xl mb-3">✅</div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
              {communityStats.successRate2025}%
            </div>
            <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {t('community.successRate')}
            </div>
            <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {communityStats.gamesCancelled2025} {t('community.gamesCancelled')}
            </div>
          </motion.div>
        </div>
      )
    },
    // Story 7: Community - Favorite Fields 2025
    {
      content: (
        <div>
          <motion.h3
            className="text-3xl font-bold mb-8"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('community.favoriteFields')} 2025
          </motion.h3>
          <div className="space-y-4">
            {Object.entries(communityStats.fields2025)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([field, count], index) => (
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

  const handleNext = (): void => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = (): void => {
    if (currentStory > 0) {
      setCurrentStory(prev => prev - 1);
      // Reset showGameDates when going back to story 1 (index 1)
      if (currentStory === 1) {
        setShowGameDates(false);
      }
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
        <StoryCard
          key={currentStory}
          onNext={handleNext}
          onPrev={handlePrev}
          canGoBack={currentStory > 0}
        >
          {stories[currentStory].content}
        </StoryCard>
      </AnimatePresence>
    </div>
  );
};

export default StorySection;
