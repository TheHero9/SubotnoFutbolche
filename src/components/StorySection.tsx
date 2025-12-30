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
  calculateClutchAppearances,
  calculatePeakPerformance,
  calculatePerfectMonths,
  calculateDynamicDuos,
  calculateRareDuos,
  calculateAttendanceRate,
  calculateSocialButterfly,
  calculateCommunityStreak,
  calculateRepeatSquads,
  calculateActiveMonths,
  calculateBestSeason,
  calculateTrioStats,
  calculatePlayerMovement,
  getPlayedGameDates
} from '../utils/playerStats';
import communityStatsRaw from '../data/communityStats.json';
import stats2023Raw from '../data/2023stats.json';

const rawStats = communityStatsRaw as CommunityStatsRaw;

// 2023 stats type
interface Stats2023 {
  [month: string]: {
    success: number;
    fails: number;
  };
}
const totalGames2023 = Object.values(stats2023Raw as Stats2023).reduce((sum, m) => sum + m.success, 0);

const StorySection: React.FC<StorySectionProps> = ({ player, totalPlayers, allPlayers, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [showGameDates, setShowGameDates] = useState<boolean>(false);
  const [showRankingList, setShowRankingList] = useState<boolean>(false);
  const [showStreakVisualization, setShowStreakVisualization] = useState<boolean>(false);
  const [selectedRareDuo, setSelectedRareDuo] = useState<{ player1: string; player2: string } | null>(null);
  const [selectedDynamicDuo, setSelectedDynamicDuo] = useState<{ player1: string; player2: string } | null>(null);
  const [showCommunityStreakCalendar, setShowCommunityStreakCalendar] = useState<boolean>(false);
  const [selectedSquadSize, setSelectedSquadSize] = useState<number | null>(null);
  const [selectedSquadIndex, setSelectedSquadIndex] = useState<number | null>(null);
  const [trioSelection, setTrioSelection] = useState<string[]>([]);
  const [trioSearchQuery, setTrioSearchQuery] = useState<string>('');

  // Sort players by rank for the ranking list
  const rankedPlayers = useMemo(() => {
    return [...allPlayers].sort((a, b) => a.rank2025 - b.rank2025);
  }, [allPlayers]);

  // Calculate community stats from raw data
  const communityStats = useMemo(() => calculateCommunityStats(rawStats), []);

  // Calculate football buddies using affinity algorithm
  const footballBuddies = useMemo(() => getFootballBuddies(player, allPlayers), [player, allPlayers]);

  // Calculate new player stats
  const activeMonths = useMemo(
    () => calculateActiveMonths(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );
  const bestSeason = useMemo(
    () => calculateBestSeason(player.dates2025 || []),
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
  const communityStreak = useMemo(
    () => calculateCommunityStreak(rawStats.games2024, rawStats.games2025),
    []
  );
  const repeatSquads = useMemo(
    () => calculateRepeatSquads(allPlayers, rawStats.games2025, 12, 14),
    [allPlayers]
  );

  // Player movement (risers, fallers, newcomers)
  // Add player names to exclude from newcomers here (e.g., players who played in 2023)
  const excludeFromNewcomers: string[] = ['Неджи'];
  const playerMovement = useMemo(
    () => calculatePlayerMovement(allPlayers, excludeFromNewcomers),
    [allPlayers]
  );

  // Trio finder calculation (only when 3 players are selected)
  const trioStats = useMemo(() => {
    if (trioSelection.length !== 3) return null;
    return calculateTrioStats(
      trioSelection[0],
      trioSelection[1],
      trioSelection[2],
      allPlayers,
      rawStats.games2025
    );
  }, [trioSelection, allPlayers]);

  // Filter players for trio selection search
  const filteredPlayersForTrio = useMemo(() => {
    const activePlayersList = allPlayers
      .filter(p => (p.dates2025?.length || 0) > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'bg'));

    if (!trioSearchQuery.trim()) return activePlayersList;

    const query = trioSearchQuery.toLowerCase();
    return activePlayersList.filter(p =>
      p.name.toLowerCase().includes(query)
    );
  }, [allPlayers, trioSearchQuery]);

  // Create set of community streak dates for quick lookup
  const communityStreakDatesSet = useMemo(() => {
    return new Set(communityStreak.dates.map(d => `${d.date}-${d.year}`));
  }, [communityStreak.dates]);

  // Combine all games from 2024 and 2025 for community streak calendar
  const allCommunityGames = useMemo(() => {
    const games2024 = rawStats.games2024.map(g => ({ ...g, year: 2024 }));
    const games2025 = rawStats.games2025.map(g => ({ ...g, year: 2025 }));
    return [...games2024, ...games2025];
  }, []);

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

  const rankChange = getRankChange(player.rank2024, player.rank2025, player.total2024);
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
              className="w-full flex flex-col h-full"
            >
              {/* Legend - Seasons (at top) */}
              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-3 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.winter.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('seasons.winter')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.spring.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('seasons.spring')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.summer.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('seasons.summer')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seasonColors.autumn.bg }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('seasons.autumn')}</span>
                </div>
              </motion.div>

              {/* Game dates - full screen */}
              <div
                className="flex-1 px-3 py-3 rounded-xl mb-3"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center content-start">
                  {allCommunityGameDates.map((date, index) => {
                    const played = playerDatesSet.has(date);
                    const season = getSeasonFromDate(date);
                    const colors = seasonColors[season];
                    return (
                      <motion.span
                        key={date}
                        className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium"
                        style={{
                          backgroundColor: played ? colors.bg : '#4b5563',
                          color: played ? colors.text : '#9ca3af',
                          opacity: played ? 1 : 0.6
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: played ? 1 : 0.6 }}
                        transition={{ delay: Math.min(index * 0.008, 0.3) }}
                      >
                        {formatDateEU(date)}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Legend - Status + Back button */}
              <motion.div
                className="flex items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>🎨 = {t('stats.streakLegendPlayed')}</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4b5563' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}> = {t('stats.streakLegendMissed')}</span>
                </div>
                <motion.button
                  className="px-4 py-1.5 rounded-full text-xs font-semibold"
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
    // Story 4: Games difference (top) + Rank change (bottom)
    {
      content: (() => {
        const gamesDiff = player.total2025 - player.total2024;
        return (
          <div>
            {/* Games difference - EMPHASIZED at top */}
            <motion.div
              className="text-6xl font-black mb-2"
              style={{
                color: gamesDiff > 0 ? 'var(--color-accent-green)' :
                       gamesDiff < 0 ? 'var(--color-accent-red)' :
                       'var(--color-text-secondary)',
                textShadow: gamesDiff !== 0 ? '0 0 30px currentColor' : 'none'
              }}
              initial={{ scale: 0, rotate: gamesDiff > 0 ? -15 : 15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              {gamesDiff > 0 && `+${gamesDiff}`}
              {gamesDiff < 0 && `${gamesDiff}`}
              {gamesDiff === 0 && `±0`}
            </motion.div>
            <motion.p
              className="text-xl mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('summary.gamesChange').toLowerCase()}
            </motion.p>

            {/* Games comparison cards */}
            <motion.div
              className="flex justify-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>2024</div>
                <div className="text-2xl font-bold">{player.total2024} {t('story.games')}</div>
              </div>
              <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>2025</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>{player.total2025} {t('story.games')}</div>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-16 h-0.5 mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-text-tertiary)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 }}
            />

            {/* Rank change - at bottom */}
            <motion.div
              className="text-4xl mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              {rankChange.emoji}
            </motion.div>
            <motion.p
              className="text-lg font-semibold mb-1"
              style={{
                color: rankChange.direction === 'up' ? 'var(--color-accent-green)' :
                       rankChange.direction === 'down' ? 'var(--color-accent-red)' :
                       'var(--color-accent-blue)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {rankChange.direction === 'up' && `${t('story.rankUp')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
              {rankChange.direction === 'down' && `${t('story.rankDown')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
              {rankChange.direction === 'same' && t('story.rankSame')}
              {rankChange.direction === 'new' && t('story.rankNew')}
            </motion.p>
            <motion.p
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {t('story.inRankingVs2024')}
            </motion.p>
          </div>
        );
      })()
    },
    // Story 5: Active Months + Best Season + Clutch Player
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {/* Active Months & Best Season Row */}
          <motion.div
            className="flex justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Active Months */}
            <div className="text-center px-4 py-3 rounded-xl flex-1" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-3xl mb-1">📆</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                {activeMonths.activeCount}/{activeMonths.totalMonths}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('stats.activeMonths')}
              </div>
            </div>

            {/* Best Season */}
            <div className="text-center px-4 py-3 rounded-xl flex-1" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-3xl mb-1">{bestSeason.emoji}</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {t(`seasons.${bestSeason.season}`)}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {bestSeason.games} {t('stats.gamesInSeason')}
              </div>
            </div>
          </motion.div>

          {/* Clutch Player */}
          <motion.div
            className="text-5xl mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", duration: 0.8 }}
          >
            🦸
          </motion.div>
          <motion.h2
            className="text-xl font-bold mb-1"
            style={{ color: 'var(--color-accent-gold)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('stats.clutchPlayer')}
          </motion.h2>

          <motion.div
            className="flex justify-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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

                    // Determine colors: streak (green), played (blue), missed (gray)
                    let bgColor = 'rgba(75, 75, 75, 0.5)'; // Missed games (gray)
                    let textColor = 'var(--color-text-secondary)';

                    if (isInStreak) {
                      bgColor = 'var(--color-accent-green)';
                      textColor = '#000';
                    } else if (playerPlayed) {
                      bgColor = '#3b82f6'; // Blue for played (non-streak)
                      textColor = '#fff';
                    }

                    return (
                      <motion.span
                        key={date}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          opacity: isInStreak ? 1 : playerPlayed ? 0.85 : 0.4
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: isInStreak ? 1 : playerPlayed ? 0.85 : 0.4,
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
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
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
            {t('stats.socialButterfly')} 2025
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
            className="max-h-[28vh] overflow-y-auto px-3 py-3 rounded-xl"
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hasPlayed ? 1 : 0.5 }}
                      transition={{ delay: Math.min(0.5 + index * 0.008, 0.8) }}
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
        <div className="w-full max-w-md mx-auto">
          {!showCommunityStreakCalendar ? (
            <>
              <motion.h2
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {t('community.title')}
              </motion.h2>
              <motion.p
                className="text-xl mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t('community.subtitle')}
              </motion.p>
              <motion.div
                className="text-7xl font-bold mb-2"
                style={{ color: 'var(--color-accent-gold)' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1 }}
              >
                {communityStats.gamesPlayed2025}
              </motion.div>
              <motion.p
                className="text-xl mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('community.gamesIn2025')}
              </motion.p>
              <motion.div
                className="flex justify-center gap-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                  <div className="text-2xl font-bold" style={{ color: communityStats.gamesChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                    {communityStats.gamesChange >= 0 ? '+' : ''}{communityStats.gamesChange}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('community.vs2024')}</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-blue)' }}>
                    {communityStats.totalGamesAllTime + totalGames2023}
                  </div>
                  <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('community.allTime')} <InfoTooltip text={t('stats.allTimeInfo')} />
                  </div>
                </div>
              </motion.div>

              {/* Community Streak */}
              <motion.div
                className="mt-6 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🔥</span>
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                    {communityStreak.streakLength}
                  </span>
                  <span className="text-lg">{t('community.consecutiveGames')}</span>
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('community.longestStreak')} {communityStreak.spansYears ? '2024-2025' : '2025'}
                </div>
                {communityStreak.startDate && communityStreak.endDate && (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-accent-gold)' }}>
                    {communityStreak.startDate.replace('/', '.')}.{communityStreak.startYear} → {communityStreak.endDate.replace('/', '.')}.{communityStreak.endYear}
                  </div>
                )}
              </motion.div>

              {/* Show Calendar Button */}
              <motion.button
                className="mt-4 px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-accent-green)',
                  border: '2px solid var(--color-accent-green)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommunityStreakCalendar(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📅 {t('scroll.showStreakDates')}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
                🔥 {communityStreak.streakLength} {t('community.consecutiveGames')}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {t('community.longestStreak')} {communityStreak.spansYears ? '2024-2025' : '2025'}
              </p>

              {/* Calendar for 2024 and 2025 */}
              <div
                className="max-h-[55vh] overflow-y-auto px-3 py-3 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {/* 2024 Section */}
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2 text-left" style={{ color: 'var(--color-accent-gold)' }}>
                    2024
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {allCommunityGames
                      .filter(g => g.year === 2024)
                      .map((game, index) => {
                        const isInStreak = communityStreakDatesSet.has(`${game.date}-${game.year}`);
                        const isPlayed = game.played;

                        let bgColor = 'rgba(75, 75, 75, 0.5)'; // Cancelled (gray)
                        let textColor = 'var(--color-text-secondary)';
                        let opacity = 0.4;

                        if (isInStreak) {
                          bgColor = 'var(--color-accent-green)';
                          textColor = '#000';
                          opacity = 1;
                        } else if (isPlayed) {
                          bgColor = '#3b82f6'; // Blue for played (non-streak)
                          textColor = '#fff';
                          opacity = 0.7;
                        }

                        return (
                          <motion.span
                            key={`2024-${game.date}`}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: bgColor,
                              color: textColor,
                              opacity
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity, scale: isInStreak ? 1.05 : 1 }}
                            transition={{ delay: index * 0.01 }}
                          >
                            {formatDateEU(game.date)}
                          </motion.span>
                        );
                      })}
                  </div>
                </div>

                {/* 2025 Section */}
                <div>
                  <div className="text-sm font-semibold mb-2 text-left" style={{ color: 'var(--color-accent-gold)' }}>
                    2025
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {allCommunityGames
                      .filter(g => g.year === 2025)
                      .map((game, index) => {
                        const isInStreak = communityStreakDatesSet.has(`${game.date}-${game.year}`);
                        const isPlayed = game.played;

                        let bgColor = 'rgba(75, 75, 75, 0.5)'; // Cancelled (gray)
                        let textColor = 'var(--color-text-secondary)';
                        let opacity = 0.4;

                        if (isInStreak) {
                          bgColor = 'var(--color-accent-green)';
                          textColor = '#000';
                          opacity = 1;
                        } else if (isPlayed) {
                          bgColor = '#3b82f6'; // Blue for played (non-streak)
                          textColor = '#fff';
                          opacity = 0.7;
                        }

                        return (
                          <motion.span
                            key={`2025-${game.date}`}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: bgColor,
                              color: textColor,
                              opacity
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity, scale: isInStreak ? 1.05 : 1 }}
                            transition={{ delay: 0.5 + index * 0.01 }}
                          >
                            {formatDateEU(game.date)}
                          </motion.span>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-4 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-accent-green)' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>🔥 {t('stats.streakLegendStreak')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full opacity-70" style={{ backgroundColor: '#3b82f6' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>✓ {t('stats.communityPlayed')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: '#4b4b4b' }}></span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>✗ {t('community.cancelled')}</span>
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
                  setShowCommunityStreakCalendar(false);
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
            <div className="text-xl mt-2" style={{ color: communityStats.successRateChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
              {communityStats.successRateChange >= 0 ? '↑' : '↓'} {Math.abs(communityStats.successRateChange)}% {t('community.vs2024')}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {communityStats.gamesCancelled2025} vs {communityStats.gamesCancelled2024} {t('community.gamesCancelled')}
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
    // Story 11: Community - Player Movement (Risers, Fallers, Newcomers)
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          <motion.div
            className="text-5xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            📊
          </motion.div>
          <motion.h2
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-accent-green)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('stats.playerMovement')}
          </motion.h2>
          <motion.p
            className="text-sm mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t('stats.playerMovementSubtitle')}
          </motion.p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Risers */}
            <motion.div
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-xl mb-2">📈</div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-accent-green)' }}>
                {t('stats.risers')}
              </div>
              <div className="space-y-1">
                {playerMovement.risers.map((p, idx) => (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {idx + 1}. {p.name}
                    </span>
                    <span style={{ color: 'var(--color-accent-green)' }}>
                      +{p.change} {t('story.games')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Fallers */}
            <motion.div
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-xl mb-2">📉</div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-accent-red)' }}>
                {t('stats.fallers')}
              </div>
              <div className="space-y-1">
                {playerMovement.fallers.map((p, idx) => (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {idx + 1}. {p.name}
                    </span>
                    <span style={{ color: 'var(--color-accent-red)' }}>
                      {p.change} {t('story.games')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Newcomers */}
          <motion.div
            className="p-3 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-xl mb-2">🆕</div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-accent-blue)' }}>
              {t('stats.newcomers')}
            </div>
            {playerMovement.newcomers.length > 0 ? (
              <div className="flex flex-wrap gap-1 justify-center">
                {playerMovement.newcomers.map((name) => (
                  <span
                    key={name}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: 'var(--color-accent-blue)'
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('stats.noNewcomers')}
              </div>
            )}
          </motion.div>
        </div>
      )
    },
    // Story 12: Community - Dynamic Duos
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
                className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t('stats.dynamicDuos')}
                <InfoTooltip text={t('stats.dynamicDuosInfo')} />
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
                className="max-h-[32vh] overflow-y-auto rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-1 p-2">
                  {dynamicDuos.map((duo, index) => (
                    <motion.button
                      key={`${duo.player1}-${duo.player2}`}
                      className="w-full px-3 py-2 rounded-lg text-left cursor-pointer"
                      style={{
                        backgroundColor: duo.mutualRate >= 80
                          ? 'rgba(29, 185, 84, 0.2)'
                          : duo.mutualRate >= 65
                            ? 'rgba(255, 215, 0, 0.1)'
                            : 'rgba(75, 85, 99, 0.2)',
                        border: '1px solid',
                        borderColor: duo.mutualRate >= 80
                          ? 'var(--color-accent-green)'
                          : duo.mutualRate >= 65
                            ? 'var(--color-accent-gold)'
                            : 'rgba(107, 114, 128, 0.5)'
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDynamicDuo({ player1: duo.player1, player2: duo.player2 });
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: duo.mutualRate >= 80 ? 'rgba(29, 185, 84, 0.3)' : duo.mutualRate >= 65 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(75, 85, 99, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {duo.player1} & {duo.player2}
                        </span>
                        <div className="flex items-center gap-2">
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
                          <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {duo.gamesTogethers} {t('story.gamesTogether')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.p
                className="text-xs mt-4 flex items-center justify-center gap-1"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                👆 {t('stats.clickToCompare')}
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
                  className="max-h-[32vh] overflow-y-auto rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="space-y-1 p-2">
                    {rareDuos.map((duo, index) => (
                      <motion.button
                        key={`${duo.player1}-${duo.player2}`}
                        className="w-full px-3 py-2 rounded-lg text-left cursor-pointer"
                        style={{
                          backgroundColor: duo.gamesTogethers === 0
                            ? 'rgba(231, 76, 60, 0.2)'
                            : duo.gamesTogethers <= 2
                              ? 'rgba(255, 215, 0, 0.1)'
                              : 'rgba(75, 85, 99, 0.2)',
                          border: '1px solid',
                          borderColor: duo.gamesTogethers === 0
                            ? 'var(--color-accent-red)'
                            : duo.gamesTogethers <= 2
                              ? 'var(--color-accent-gold)'
                              : 'rgba(107, 114, 128, 0.5)'
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
                          <div className="flex items-center gap-2">
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
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                          </div>
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
                className="text-xs mt-4 flex items-center justify-center gap-1"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                👆 {t('stats.clickToCompare')}
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
    },
    // Story 13: Repeat Squads - Interactive 3-level navigation
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {selectedSquadSize === null ? (
            // LEVEL 1: List of squad sizes
            <>
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                🔍
              </motion.div>
              <motion.div
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-accent-green)' }}
                >
                  {t('stats.repeatSquads')}
                </h2>
                <InfoTooltip text={t('stats.repeatSquadsInfo')} size="md" />
              </motion.div>
              <motion.p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('stats.repeatSquadsSubtitle')}
              </motion.p>

              {/* Interactive list of squad sizes */}
              <div className="space-y-2">
                {repeatSquads.allResults.map((result, index) => {
                  const hasRepeats = result.squads.length > 0;
                  const isBestMatch = repeatSquads.bestMatch?.squadSize === result.squadSize;
                  // Calculate total occurrences (sum of all squads)
                  const totalOccurrences = result.squads.reduce((sum, squad) => sum + squad.occurrences, 0);

                  return (
                    <motion.button
                      key={result.squadSize}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer"
                      style={{
                        backgroundColor: isBestMatch
                          ? 'rgba(29, 185, 84, 0.2)'
                          : 'var(--color-bg-card)',
                        border: isBestMatch ? '2px solid var(--color-accent-green)' : '2px solid transparent'
                      }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.08 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSquadSize(result.squadSize);
                        // If only 1 squad, go directly to details
                        if (result.squads.length === 1) {
                          setSelectedSquadIndex(0);
                        }
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: hasRepeats ? 'rgba(29, 185, 84, 0.3)' : 'rgba(75, 85, 99, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold" style={{
                          color: hasRepeats
                            ? 'var(--color-accent-green)'
                            : 'var(--color-text-secondary)'
                        }}>
                          {result.squadSize}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {t('story.players')}
                        </span>
                        <span className="text-xl">
                          {hasRepeats ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasRepeats && (
                          <>
                            {result.squads.length > 1 && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent-blue)', color: '#fff' }}>
                                {result.squads.length} {t('stats.differentSquads')}
                              </span>
                            )}
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
                              {totalOccurrences}×
                            </span>
                          </>
                        )}
                        <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.p
                className="text-xs mt-4"
                style={{ color: 'var(--color-accent-green)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                👆 {t('stats.clickToSeeRepeats')}
              </motion.p>
            </>
          ) : selectedSquadIndex === null ? (
            // LEVEL 2: List of squads for selected size
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {(() => {
                const selectedResult = repeatSquads.allResults.find(r => r.squadSize === selectedSquadSize);
                if (!selectedResult) return null;

                const hasRepeats = selectedResult.squads.length > 0;

                return (
                  <>
                    <motion.div
                      className="text-5xl mb-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      {hasRepeats ? '👥' : '🔎'}
                    </motion.div>

                    <motion.div
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-3xl font-bold mb-1" style={{
                        color: hasRepeats ? 'var(--color-accent-green)' : 'var(--color-text-secondary)'
                      }}>
                        {selectedResult.squadSize} {t('story.players')}
                      </div>
                      {hasRepeats ? (
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedResult.squads.length} {t('stats.differentSquads')} {t('stats.found')}
                        </div>
                      ) : (
                        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                          {t('stats.noRepeat')}
                        </div>
                      )}
                    </motion.div>

                    {/* List of squads */}
                    {hasRepeats && (
                      <div className="space-y-2 mb-4">
                        {selectedResult.squads.map((squad, index) => (
                          <motion.button
                            key={index}
                            className="w-full px-4 py-3 rounded-xl text-left"
                            style={{
                              backgroundColor: index === 0 ? 'rgba(29, 185, 84, 0.15)' : 'var(--color-bg-card)',
                              border: index === 0 ? '1px solid var(--color-accent-green)' : '1px solid transparent'
                            }}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSquadIndex(index);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-gold)' }}>
                                {t('stats.squad')} #{index + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold" style={{ color: 'var(--color-accent-green)' }}>
                                  {squad.occurrences}×
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                              </div>
                            </div>
                            <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                              {squad.players.slice(0, 4).join(', ')}{squad.players.length > 4 ? ` +${squad.players.length - 4}` : ''}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Back button */}
                    <motion.button
                      className="px-6 py-2 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-secondary)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSquadSize(null);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← {t('scroll.hideDates')}
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          ) : (
            // LEVEL 3: Squad details
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {(() => {
                const selectedResult = repeatSquads.allResults.find(r => r.squadSize === selectedSquadSize);
                const selectedSquad = selectedResult?.squads[selectedSquadIndex];
                if (!selectedSquad) return null;

                return (
                  <>
                    {/* Header with result */}
                    <motion.div
                      className="text-5xl mb-3"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.8 }}
                    >
                      🎯
                    </motion.div>

                    <motion.div
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-4xl font-bold mb-1" style={{ color: 'var(--color-accent-green)' }}>
                        {selectedSquadSize} {t('story.players')}
                      </div>
                      <div className="text-xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                        {selectedSquad.occurrences}× {t('stats.times')}
                      </div>
                    </motion.div>

                    {/* The Squad */}
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-accent-green)' }}>
                        🏆 {t('stats.theSquad')}
                      </h3>
                      <div
                        className="max-h-[20vh] overflow-y-auto px-3 py-3 rounded-xl"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                      >
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedSquad.players.map((name, index) => (
                            <motion.span
                              key={name}
                              className="px-3 py-1.5 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: 'var(--color-accent-green)',
                                color: '#000'
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.03 }}
                            >
                              {name}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* The Dates */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
                        📅 {t('stats.theDates')}
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {selectedSquad.dates.map((date, index) => (
                          <motion.span
                            key={date}
                            className="px-4 py-2 rounded-xl text-lg font-semibold"
                            style={{
                              backgroundColor: 'var(--color-bg-card)',
                              color: 'var(--color-accent-gold)'
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                          >
                            {formatDateEU(date)}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Back button */}
                    <motion.button
                      className="mt-6 px-6 py-2 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-secondary)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSquadIndex(null);
                        // If only 1 squad, go back to size list
                        const selectedResult = repeatSquads.allResults.find(r => r.squadSize === selectedSquadSize);
                        if (selectedResult?.squads.length === 1) {
                          setSelectedSquadSize(null);
                        }
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
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
    // Story 14: Trio Finder - Interactive player selection
    {
      content: (
        <div className="w-full max-w-md mx-auto">
          {trioSelection.length < 3 ? (
            // SELECTION MODE: Pick 3 players
            <>
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                🔮
              </motion.div>
              <motion.div
                className="flex items-center justify-center gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-accent-blue)' }}
                >
                  {t('stats.trioFinder')}
                </h2>
                <InfoTooltip text={t('stats.trioFinderInfo')} size="md" />
              </motion.div>
              <motion.p
                className="text-sm mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('stats.trioFinderSubtitle')}
              </motion.p>

              {/* Selected players display */}
              <motion.div
                className="flex justify-center gap-2 mb-4 min-h-[40px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2].map((slot) => (
                  <motion.div
                    key={slot}
                    className="px-3 py-2 rounded-xl min-w-[80px] text-center"
                    style={{
                      backgroundColor: trioSelection[slot]
                        ? 'var(--color-accent-blue)'
                        : 'var(--color-bg-card)',
                      border: '2px dashed',
                      borderColor: trioSelection[slot]
                        ? 'transparent'
                        : 'var(--color-text-secondary)'
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={trioSelection[slot] ? { scale: 1.05 } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (trioSelection[slot]) {
                        // Remove this player
                        setTrioSelection(prev => prev.filter((_, i) => i !== slot));
                      }
                    }}
                  >
                    {trioSelection[slot] ? (
                      <span className="text-sm font-semibold text-white flex items-center gap-1">
                        {trioSelection[slot]}
                        <span className="text-xs opacity-70">×</span>
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {slot + 1}
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Search input */}
              <motion.div
                className="mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <input
                  type="text"
                  value={trioSearchQuery}
                  onChange={(e) => setTrioSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={t('stats.trioSearchPlaceholder')}
                  className="w-full px-4 py-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-text-secondary)',
                    outline: 'none'
                  }}
                />
              </motion.div>

              {/* Player grid */}
              <motion.div
                className="max-h-[30vh] overflow-y-auto rounded-xl p-2"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {filteredPlayersForTrio.map((p, index) => {
                    const isSelected = trioSelection.includes(p.name);
                    const isDisabled = trioSelection.length >= 3 && !isSelected;

                    return (
                      <motion.button
                        key={p.name}
                        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--color-accent-blue)'
                            : isDisabled
                              ? 'rgba(75, 85, 99, 0.3)'
                              : 'rgba(75, 85, 99, 0.5)',
                          color: isSelected ? '#fff' : isDisabled ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: isDisabled ? 0.5 : 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.01 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDisabled) return;
                          if (isSelected) {
                            setTrioSelection(prev => prev.filter(n => n !== p.name));
                          } else {
                            setTrioSelection(prev => [...prev, p.name]);
                          }
                        }}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      >
                        {p.name}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.p
                className="text-xs mt-4"
                style={{ color: 'var(--color-accent-blue)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {t('stats.trioSelectHint', { count: 3 - trioSelection.length })}
              </motion.p>
            </>
          ) : (
            // RESULT MODE: Show trio stats
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <motion.div
                className="text-6xl mb-3"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                {trioStats && trioStats.gamesTogether > 0 ? '🎉' : '😢'}
              </motion.div>

              {/* The Trio */}
              <motion.div
                className="flex justify-center gap-2 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {trioSelection.map((name, index) => (
                  <motion.span
                    key={name}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: 'var(--color-accent-blue)',
                      color: '#fff'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {name}
                  </motion.span>
                ))}
              </motion.div>

              {/* Result */}
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div
                  className="text-5xl font-bold mb-1"
                  style={{
                    color: trioStats && trioStats.gamesTogether > 0
                      ? 'var(--color-accent-green)'
                      : 'var(--color-accent-red)'
                  }}
                >
                  {trioStats?.gamesTogether || 0}
                </div>
                <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('stats.trioGamesTogether')}
                </div>
              </motion.div>

              {/* Dates when they played together */}
              {trioStats && trioStats.gamesTogether > 0 && (
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
                    📅 {t('stats.theDates')}
                  </h3>
                  <div
                    className="max-h-[15vh] overflow-y-auto px-3 py-3 rounded-xl"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                  >
                    <div className="flex flex-wrap gap-2 justify-center">
                      {trioStats.dates.map((date, index) => (
                        <motion.span
                          key={date}
                          className="px-3 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: 'var(--color-accent-green)',
                            color: '#000'
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.05 }}
                        >
                          {formatDateEU(date)}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Player games breakdown */}
              {trioStats && (
                <motion.div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex justify-center gap-4 mb-2">
                    {trioSelection.map((name, index) => (
                      <div key={name} className="text-center">
                        <div className="text-lg font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                          {trioStats.playerGames[index]}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {name.length > 6 ? name.slice(0, 6) + '.' : name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('stats.trioIndividualGames')}
                  </div>
                </motion.div>
              )}

              {/* Meeting rate */}
              {trioStats && trioStats.maxPossibleMeetings > 0 && (
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('stats.trioMeetingRate', {
                      count: trioStats.gamesTogether,
                      max: trioStats.maxPossibleMeetings,
                      rate: trioStats.meetingRate
                    })}
                  </span>
                </motion.div>
              )}

              {/* Try again button */}
              <motion.button
                className="px-6 py-3 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-accent-blue)',
                  color: '#fff'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTrioSelection([]);
                  setTrioSearchQuery('');
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 {t('stats.trioTryAgain')}
              </motion.button>
            </motion.div>
          )}
        </div>
      )
    },
    // Story 15: Creator's Message
    {
      content: (
        <div className="flex flex-col items-center h-full px-5 pt-20 pb-24 overflow-y-auto">
          {/* Title */}
          <motion.div
            className="flex items-center gap-2 mb-4 mt-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-accent-gold)' }}>
              {t('creatorMessage.title')}
            </h2>
            <span className="text-2xl">✨</span>
          </motion.div>

          {/* Main Message - Styled */}
          <motion.div
            className="text-xs leading-relaxed mb-3 max-w-xs text-center"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {i18n.language === 'bg' ? (
              <>
                Тази година минахме <span style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>всякакви рекорди</span>!
                {' '}Серия от <span style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>48 поредни мача</span> (почти цяла година),
                {' '}общо <span style={{ color: 'var(--color-accent-green)', fontWeight: 'bold' }}>51 мача</span> за годината,
                {' '}само <span style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold' }}>1 път</span> в ден различен от събота!
                {' '}Подобрени рекорди: <span style={{ color: 'var(--color-accent-gold)' }}>мачове за година</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>поредни мачове</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>новодошли</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>средно ~13.6 играчи</span>!
              </>
            ) : (
              <>
                This year we broke <span style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>all records</span>!
                {' '}<span style={{ color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>48 consecutive games</span> (almost a year),
                {' '}<span style={{ color: 'var(--color-accent-green)', fontWeight: 'bold' }}>51 total games</span>,
                {' '}only <span style={{ color: 'var(--color-accent-blue)', fontWeight: 'bold' }}>1 non-Saturday</span>!
                {' '}Records: <span style={{ color: 'var(--color-accent-gold)' }}>games/year</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>streak</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>newcomers</span>,{' '}
                <span style={{ color: 'var(--color-accent-gold)' }}>~13.6 avg players</span>!
              </>
            )}
          </motion.div>

          {/* Epic games description */}
          <motion.p
            className="text-xs text-center mb-3 max-w-xs"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {i18n.language === 'bg'
              ? 'Брутални мачове с драма, тръпка, смях, честна игра и без много контузии (най-важното)...'
              : 'Epic games with drama, excitement, laughter, fair play and few injuries (most important)...'
            }
          </motion.p>

          {/* Improvement section - continuation */}
          <motion.p
            className="text-xs text-center mb-4 max-w-xs leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {i18n.language === 'bg'
              ? '...Правопропорционално с броя мачове вървят и караниците. Това е единствената статистика за подобряване. Повече толериране при грешка и преглъщане на тъч/два отсъдени грешно. Не си струва!'
              : '...With more games come more arguments. The only stat we can improve. More tolerance for mistakes, accept a wrong call or two. Not worth it!'
            }
          </motion.p>

          {/* Signature */}
          <motion.p
            className="text-xs italic mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {t('creatorMessage.signature')}
          </motion.p>

          {/* Hint about more stats */}
          <motion.div
            className="px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-xs" style={{ color: 'var(--color-accent-green)' }}>
              {t('creatorMessage.hint')}
            </p>
          </motion.div>
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
      // Reset selected squad when leaving that story
      setSelectedSquadSize(null);
      setSelectedSquadIndex(null);
      // Reset trio selection when leaving that story
      setTrioSelection([]);
      setTrioSearchQuery('');
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Progress indicators - colored by section */}
      <div className="fixed top-14 left-0 right-0 z-40 flex gap-1 px-4">
        {stories.map((_, index) => {
          // Color by section: 0-7 player stories (green), 8-14 community (blue), 15 creator message (gold)
          const sectionColor = index === stories.length - 1
            ? 'var(--color-accent-gold)'
            : index <= 7
              ? 'var(--color-accent-green)'
              : 'var(--color-accent-blue)';

          return (
            <div
              key={index}
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <motion.div
                className="h-full"
                style={{ backgroundColor: sectionColor }}
                initial={{ width: 0 }}
                animate={{ width: index <= currentStory ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          );
        })}
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
