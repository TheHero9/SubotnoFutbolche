import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import type { StorySectionProps, CommunityStatsRaw } from '../types';
import StoryCard from './StoryCard';
import InfoTooltip from './InfoTooltip';
import { getRankTitle, getRankChange, calculateCommunityStats } from '../utils/calculations';
import { getFootballBuddies } from '../utils/footballBuddies';
import {
  calculateConsistency,
  calculateClutchAppearances,
  calculatePeakPerformance,
  calculatePerfectMonths,
  calculateDynamicDuos,
  calculateRareDuos,
  calculateAttendanceRate,
  calculateSocialButterfly,
  getPlayedGameDates
} from '../utils/playerStats';
import communityStatsRaw from '../data/communityStats.json';

const rawStats = communityStatsRaw as CommunityStatsRaw;

const StorySection: React.FC<StorySectionProps> = ({ player, totalPlayers, allPlayers, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [showGameDates, setShowGameDates] = useState<boolean>(false);
  const [showRankingList, setShowRankingList] = useState<boolean>(false);
  const [showStreakVisualization, setShowStreakVisualization] = useState<boolean>(false);
  const [selectedRareDuo, setSelectedRareDuo] = useState<{ player1: string; player2: string } | null>(null);
  const [selectedDynamicDuo, setSelectedDynamicDuo] = useState<{ player1: string; player2: string } | null>(null);

  // Sort players by rank for the ranking list
  const rankedPlayers = useMemo(() => {
    return [...allPlayers].sort((a, b) => a.rank2025 - b.rank2025);
  }, [allPlayers]);

  // Calculate community stats from raw data
  const communityStats = useMemo(() => calculateCommunityStats(rawStats), []);

  // Calculate football buddies using affinity algorithm
  const footballBuddies = useMemo(() => getFootballBuddies(player, allPlayers), [player, allPlayers]);

  // Calculate new player stats
  const consistency = useMemo(
    () => calculateConsistency(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const clutchData = useMemo(
    () => calculateClutchAppearances(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const peakPerformance = useMemo(
    () => calculatePeakPerformance(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const perfectMonths = useMemo(
    () => calculatePerfectMonths(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const attendanceRate = useMemo(
    () => calculateAttendanceRate(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const dynamicDuos = useMemo(
    () => calculateDynamicDuos(allPlayers),
    [allPlayers]
  );
  const rareDuos = useMemo(
    () => calculateRareDuos(allPlayers),
    [allPlayers]
  );
  const socialButterfly = useMemo(
    () => calculateSocialButterfly(player.name, player.dates2025 || [], allPlayers),
    [player.name, player.dates2025, allPlayers]
  );

  // Get all community game dates for streak visualization
  const allCommunityGameDates = useMemo(
    () => getPlayedGameDates(rawStats.games2025),
    []
  );

  // Create a set of streak dates for quick lookup
  const streakDatesSet = useMemo(
    () => new Set(peakPerformance.dates),
    [peakPerformance.dates]
  );

  // Create a set of player's dates for quick lookup
  const playerDatesSet = useMemo(
    () => new Set(player.dates2025 || []),
    [player.dates2025]
  );

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

  // Trigger confetti on rank reveal (index 2) and community stats (index 8)
  useEffect(() => {
    if (currentStory === 2 || currentStory === 8) {
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
                className="text-8xl font-bold mb-2"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1 }}
              >
                {player.total2025}
              </motion.div>
              <motion.p
                className="text-2xl mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('story.games')}
              </motion.p>

              {/* Attendance rate & Perfect months */}
              <motion.div
                className="flex justify-center gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                    {attendanceRate}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('stats.ofAllGames')}
                  </div>
                </div>
                {perfectMonths.length > 0 && (
                  <div className="text-center px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                      {perfectMonths.length}
                    </div>
                    <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {t('stats.perfectMonths')} <InfoTooltip text={t('stats.perfectMonthsInfo')} />
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.button
                className="px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-accent-green)',
                  border: '2px solid var(--color-accent-green)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
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
    // Story 5: Consistency + Clutch Player
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {/* Consistency */}
          <motion.div
            className="text-5xl mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            📊
          </motion.div>
          <motion.h2
            className="text-xl font-bold mb-1"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('stats.consistency')}
          </motion.h2>

          <motion.div
            className="flex justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {consistency.score}%
              </div>
              <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                {t(`stats.${consistency.rating}`)} <InfoTooltip text={t('stats.consistencyInfo')} />
              </div>
            </div>
          </motion.div>

          {/* Clutch Player */}
          <motion.div
            className="text-5xl mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", duration: 0.8 }}
          >
            🦸
          </motion.div>
          <motion.h2
            className="text-xl font-bold mb-1"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t('stats.clutchPlayer')}
          </motion.h2>

          <motion.div
            className="flex justify-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                {clutchData.clutchGames}
              </div>
              <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                {t('stats.clutchGames')} <InfoTooltip text={t('stats.clutchInfo')} />
              </div>
            </div>
            {clutchData.gamesSaved > 0 && (
              <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-red)' }}>
                  {clutchData.gamesSaved}
                </div>
                <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('stats.gamesSaved')} <InfoTooltip text={t('stats.gamesSavedInfo')} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )
    },
    // Story 6: Peak Performance (Consecutive Games)
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {!showStreakVisualization ? (
            <>
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                🔥
              </motion.div>
              <motion.h2
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t('stats.peakPerformance')}
              </motion.h2>
              <motion.p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('stats.peakSubtitle')}
              </motion.p>

              <motion.div
                className="text-7xl font-bold mb-2"
                style={{ color: 'var(--color-accent-gold)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                {peakPerformance.streakLength}
              </motion.div>
              <motion.p
                className="text-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {t('stats.consecutiveGamesPlayed')}
              </motion.p>

              {peakPerformance.startDate && peakPerformance.endDate && (
                <motion.div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('stats.peakPeriod')}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--color-accent-green)' }}>
                    {formatDateEU(peakPerformance.startDate)} → {formatDateEU(peakPerformance.endDate)}
                  </div>
                </motion.div>
              )}

              {peakPerformance.streakLength > 0 && (
                <motion.button
                  className="px-6 py-3 rounded-full text-lg font-semibold mb-4"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-accent-green)',
                    border: '2px solid var(--color-accent-green)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStreakVisualization(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📅 {t('scroll.showStreakDates')}
                </motion.button>
              )}

              <motion.p
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {t('stats.peakInfo')}
              </motion.p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-accent-green)' }}>
                🔥 {t('stats.peakPerformance')}
              </h3>

              <div
                className="max-h-[55vh] overflow-y-auto px-4 py-4 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {allCommunityGameDates.map((date, index) => {
                    const isInStreak = streakDatesSet.has(date);
                    const playerPlayed = playerDatesSet.has(date);
                    const season = getSeasonFromDate(date);

                    // Determine colors
                    let bgColor = 'rgba(75, 75, 75, 0.5)'; // Missed games (muted)
                    let textColor = 'var(--color-text-secondary)';

                    if (isInStreak) {
                      bgColor = 'var(--color-accent-green)';
                      textColor = '#000';
                    } else if (playerPlayed) {
                      bgColor = seasonColors[season].bg;
                      textColor = seasonColors[season].text;
                    }

                    return (
                      <motion.span
                        key={date}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          opacity: isInStreak ? 1 : playerPlayed ? 0.8 : 0.4
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: isInStreak ? 1 : playerPlayed ? 0.8 : 0.4,
                          scale: isInStreak ? 1.1 : 1
                        }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {formatDateEU(date)}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-4 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-accent-green)' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>🔥 {t('stats.streakLegendStreak')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full opacity-60" style={{ backgroundColor: seasonColors.winter.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>✓ {t('stats.streakLegendPlayed')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: '#4b4b4b' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>✗ {t('stats.streakLegendMissed')}</span>
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
                  setShowStreakVisualization(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← {t('scroll.hideDates')}
              </motion.button>
            </motion.div>
          )}
        </div>
      )
    },
    // Story 7: Football Buddies
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            🤝
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-2 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-accent-green)' }}
            >
              {t('story.footballBuddies')}
            </h2>
            <InfoTooltip text={t('story.footballBuddiesInfo')} size="md" />
          </motion.div>
          <motion.p
            className="text-sm mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('story.footballBuddiesSubtitle')}
          </motion.p>

          {footballBuddies.length > 0 ? (
            <>
              <div className="space-y-3">
                {footballBuddies.map((buddy, index) => (
                  <motion.div
                    key={buddy.name}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.15 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                        {index + 1}.
                      </span>
                      <span className="font-semibold text-sm md:text-base">
                        {buddy.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: 'var(--color-accent-green)' }}>
                        {buddy.gamesWithYou} {t('story.gamesTogether')}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {buddy.influenceOnThem}% {t('story.ofTheirGames')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.p
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t('story.notEnoughGames')}
            </motion.p>
          )}
        </div>
      )
    },
    // Story 8: Social Butterfly
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            🦋
          </motion.div>
          <motion.h2
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t('stats.socialButterfly')}
          </motion.h2>
          <motion.p
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('stats.socialButterflySubtitle')}
          </motion.p>

          {/* Big number */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <span className="text-6xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
              {socialButterfly.uniquePlayersCount}
            </span>
            <span className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              / {socialButterfly.totalPlayersCount}
            </span>
          </motion.div>
          <motion.div
            className="text-sm mb-6 flex items-center justify-center gap-1"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t('stats.uniquePlayers')} ({socialButterfly.percentage}%)
            <InfoTooltip text={t('stats.socialButterflyInfo')} />
          </motion.div>

          {/* Player grid */}
          <motion.div
            className="max-h-[40vh] overflow-y-auto px-3 py-3 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {allPlayers
                .filter(p => p.name !== player.name && (p.dates2025?.length || 0) > 0)
                .sort((a, b) => {
                  // Sort: played with first, then alphabetically
                  const aPlayed = socialButterfly.playedWith.has(a.name);
                  const bPlayed = socialButterfly.playedWith.has(b.name);
                  if (aPlayed && !bPlayed) return -1;
                  if (!aPlayed && bPlayed) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((p, index) => {
                  const hasPlayed = socialButterfly.playedWith.has(p.name);
                  return (
                    <motion.span
                      key={p.name}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: hasPlayed ? 'var(--color-accent-green)' : 'rgba(75, 75, 75, 0.5)',
                        color: hasPlayed ? '#000' : 'var(--color-text-secondary)',
                        opacity: hasPlayed ? 1 : 0.5
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: hasPlayed ? 1 : 0.5, scale: 1 }}
                      transition={{ delay: 1 + index * 0.02 }}
                    >
                      {p.name}
                    </motion.span>
                  );
                })}
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div
            className="flex justify-center gap-4 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-accent-green)' }}></span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.playedWith')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full opacity-50" style={{ backgroundColor: '#4b4b4b' }}></span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.notPlayedWith')}</span>
            </div>
          </motion.div>
        </div>
      )
    },
    // Story 9: Community - Total Games 2025
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
              <div className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                {t('community.allTime')} <InfoTooltip text={t('stats.allTimeInfo')} />
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    // Story 9: Community - Average Players & Success Rate
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
    // Story 10: Community - Favorite Fields Comparison
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          <motion.h3
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('community.favoriteFields')}
          </motion.h3>

          {/* Combined fields from both years */}
          <div className="space-y-3">
            {(() => {
              // Get all unique fields from both years
              const allFields = new Set([
                ...Object.keys(communityStats.fields2024 || {}),
                ...Object.keys(communityStats.fields2025 || {})
              ]);

              // Sort by 2025 count (descending)
              const sortedFields = Array.from(allFields).sort((a, b) => {
                const count2025A = communityStats.fields2025[a] || 0;
                const count2025B = communityStats.fields2025[b] || 0;
                return count2025B - count2025A;
              });

              return sortedFields.slice(0, 5).map((field, index) => {
                const count2024 = communityStats.fields2024?.[field] || 0;
                const count2025 = communityStats.fields2025?.[field] || 0;
                const change = count2025 - count2024;

                return (
                  <motion.div
                    key={field}
                    className="px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-lg">{field}</span>
                      <span className="text-xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                        {count2025}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>2024: {count2024}</span>
                      {change !== 0 && (
                        <span style={{ color: change > 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                          {change > 0 ? '↑' : '↓'} {Math.abs(change)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        </div>
      )
    },
    // Story 11: Community - Dynamic Duos
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {!selectedDynamicDuo ? (
            <>
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                👯
              </motion.div>
              <motion.h2
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t('stats.dynamicDuos')}
              </motion.h2>
              <motion.p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('stats.dynamicDuosSubtitle')}
              </motion.p>

              <motion.div
                className="max-h-[45vh] overflow-y-auto rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-1 p-2">
                  {dynamicDuos.map((duo, index) => (
                    <motion.button
                      key={`${duo.player1}-${duo.player2}`}
                      className="w-full px-3 py-2 rounded-lg text-left"
                      style={{
                        backgroundColor: duo.mutualRate >= 80
                          ? 'rgba(29, 185, 84, 0.2)'
                          : duo.mutualRate >= 65
                            ? 'rgba(255, 215, 0, 0.1)'
                            : 'transparent',
                        border: '1px dashed var(--color-text-secondary)',
                        borderColor: duo.mutualRate >= 80
                          ? 'var(--color-accent-green)'
                          : duo.mutualRate >= 65
                            ? 'var(--color-accent-gold)'
                            : 'var(--color-text-secondary)',
                        borderOpacity: 0.5
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDynamicDuo({ player1: duo.player1, player2: duo.player2 });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {duo.player1} & {duo.player2}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: duo.mutualRate >= 80
                              ? 'var(--color-accent-green)'
                              : duo.mutualRate >= 65
                                ? 'var(--color-accent-gold)'
                                : 'var(--color-text-secondary)'
                          }}
                        >
                          {duo.mutualRate}%
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {duo.gamesTogethers} {t('story.gamesTogether')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.p
                className="text-xs mt-4"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {t('stats.clickToCompare')}
              </motion.p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {(() => {
                const p1 = allPlayers.find(p => p.name === selectedDynamicDuo.player1);
                const p2 = allPlayers.find(p => p.name === selectedDynamicDuo.player2);
                const p1Dates = new Set(p1?.dates2025 || []);
                const p2Dates = new Set(p2?.dates2025 || []);

                // Colors for duo comparison
                const duoColors = {
                  player1Only: '#3b82f6',  // Blue
                  player2Only: '#ec4899',  // Pink
                  both: '#22c55e',         // Green
                  neither: '#4b4b4b'       // Gray
                };

                return (
                  <>
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-accent-green)' }}>
                      {selectedDynamicDuo.player1} & {selectedDynamicDuo.player2}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {t('stats.duoCalendarSubtitle')}
                    </p>

                    <div
                      className="max-h-[50vh] overflow-y-auto px-3 py-3 rounded-xl mb-4"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div className="flex flex-wrap gap-2 justify-center">
                        {allCommunityGameDates.map((date, index) => {
                          const p1Played = p1Dates.has(date);
                          const p2Played = p2Dates.has(date);

                          let bgColor = duoColors.neither;
                          let textColor = 'var(--color-text-secondary)';
                          let opacity = 0.4;

                          if (p1Played && p2Played) {
                            bgColor = duoColors.both;
                            textColor = '#fff';
                            opacity = 1;
                          } else if (p1Played) {
                            bgColor = duoColors.player1Only;
                            textColor = '#fff';
                            opacity = 0.85;
                          } else if (p2Played) {
                            bgColor = duoColors.player2Only;
                            textColor = '#fff';
                            opacity = 0.85;
                          }

                          return (
                            <motion.span
                              key={date}
                              className="px-2.5 py-1.5 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                opacity
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity, scale: 1 }}
                              transition={{ delay: index * 0.015 }}
                            >
                              {formatDateEU(date)}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <motion.div
                      className="flex flex-wrap justify-center gap-3 mb-4 px-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.player1Only }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedDynamicDuo.player1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.player2Only }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedDynamicDuo.player2}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.both }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.bothPlayers')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: duoColors.neither }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.neitherPlayer')}</span>
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
                        setSelectedDynamicDuo(null);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← {t('scroll.hideDates')}
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      )
    },
    // Story 12: Community - Rare Duos
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {!selectedRareDuo ? (
            <>
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                ⛵
              </motion.div>
              <motion.div
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  {t('stats.rareDuos')}
                </h2>
                <InfoTooltip text={t('stats.rareDuosInfo')} size="md" />
              </motion.div>
              <motion.p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('stats.rareDuosSubtitle')}
              </motion.p>

              {rareDuos.length > 0 ? (
                <motion.div
                  className="max-h-[45vh] overflow-y-auto rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="space-y-1 p-2">
                    {rareDuos.map((duo, index) => (
                      <motion.button
                        key={`${duo.player1}-${duo.player2}`}
                        className="w-full px-3 py-2 rounded-lg text-left"
                        style={{
                          backgroundColor: duo.gamesTogethers === 0
                            ? 'rgba(231, 76, 60, 0.2)'
                            : duo.gamesTogethers <= 2
                              ? 'rgba(255, 215, 0, 0.1)'
                              : 'transparent',
                          border: '1px dashed var(--color-text-secondary)',
                          borderColor: duo.gamesTogethers === 0
                            ? 'var(--color-accent-red)'
                            : duo.gamesTogethers <= 2
                              ? 'var(--color-accent-gold)'
                              : 'var(--color-text-secondary)'
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRareDuo({ player1: duo.player1, player2: duo.player2 });
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {duo.player1} & {duo.player2}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: duo.gamesTogethers === 0
                                ? 'var(--color-accent-red)'
                                : duo.gamesTogethers <= 2
                                  ? 'var(--color-accent-gold)'
                                  : 'var(--color-text-secondary)'
                            }}
                          >
                            {duo.gamesTogethers === 0 ? '🚫' : duo.gamesTogethers}× {t('stats.togetherOnly')}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {duo.player1Games} + {duo.player2Games} = {duo.totalGames} {t('stats.combinedGames')}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  className="text-lg"
                  style={{ color: 'var(--color-text-secondary)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  No rare duos found
                </motion.p>
              )}

              <motion.p
                className="text-xs mt-4"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {t('stats.clickToCompare')}
              </motion.p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {(() => {
                const p1 = allPlayers.find(p => p.name === selectedRareDuo.player1);
                const p2 = allPlayers.find(p => p.name === selectedRareDuo.player2);
                const p1Dates = new Set(p1?.dates2025 || []);
                const p2Dates = new Set(p2?.dates2025 || []);

                // Colors for duo comparison
                const duoColors = {
                  player1Only: '#3b82f6',  // Blue
                  player2Only: '#ec4899',  // Pink
                  both: '#22c55e',         // Green
                  neither: '#4b4b4b'       // Gray
                };

                return (
                  <>
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-accent-gold)' }}>
                      {selectedRareDuo.player1} & {selectedRareDuo.player2}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {t('stats.duoCalendarSubtitle')}
                    </p>

                    <div
                      className="max-h-[50vh] overflow-y-auto px-3 py-3 rounded-xl mb-4"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div className="flex flex-wrap gap-2 justify-center">
                        {allCommunityGameDates.map((date, index) => {
                          const p1Played = p1Dates.has(date);
                          const p2Played = p2Dates.has(date);

                          let bgColor = duoColors.neither;
                          let textColor = 'var(--color-text-secondary)';
                          let opacity = 0.4;

                          if (p1Played && p2Played) {
                            bgColor = duoColors.both;
                            textColor = '#fff';
                            opacity = 1;
                          } else if (p1Played) {
                            bgColor = duoColors.player1Only;
                            textColor = '#fff';
                            opacity = 0.85;
                          } else if (p2Played) {
                            bgColor = duoColors.player2Only;
                            textColor = '#fff';
                            opacity = 0.85;
                          }

                          return (
                            <motion.span
                              key={date}
                              className="px-2.5 py-1.5 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                opacity
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity, scale: 1 }}
                              transition={{ delay: index * 0.015 }}
                            >
                              {formatDateEU(date)}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <motion.div
                      className="flex flex-wrap justify-center gap-3 mb-4 px-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.player1Only }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedRareDuo.player1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.player2Only }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedRareDuo.player2}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: duoColors.both }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.bothPlayers')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: duoColors.neither }}></span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stats.neitherPlayer')}</span>
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
                        setSelectedRareDuo(null);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← {t('scroll.hideDates')}
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          )}
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
