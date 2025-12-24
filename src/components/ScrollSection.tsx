import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ScrollSectionProps, MonthKey, SeasonKey, CommunityStatsRaw } from '../types';
import StatCard from './StatCard';
import AchievementBadge from './AchievementBadge';
import MonthlyChart from './MonthlyChart';
import ComparisonChart from './ComparisonChart';
import CommunityChart from './CommunityChart';
import SummaryCard from './SummaryCard';
import YearHeatmap from './YearHeatmap';
import CumulativeChart from './CumulativeChart';
import QuizResultsModal from './QuizResultsModal';
import {
  getBestWorstMonths,
  getBestSeason,
  getPercentile,
  getFutureProjection,
  calculateCommunityStats
} from '../utils/calculations';
import { calculatePeakPerformance, calculateCommunityStreak } from '../utils/playerStats';
import { formatMonthName, formatSeasonName, getSeasonEmoji } from '../utils/helpers';
import communityStatsRaw from '../data/communityStats.json';
import stats2023Raw from '../data/2023stats.json';

const rawCommunityStats = communityStatsRaw as CommunityStatsRaw;

// 2023 stats type
interface Stats2023 {
  [month: string]: {
    success: number;
    fails: number;
  };
}

// Convert 2023 stats to gamesPerMonth format
const convert2023ToGamesPerMonth = (stats: Stats2023): Record<string, number> => {
  const result: Record<string, number> = {};
  Object.entries(stats).forEach(([month, data]) => {
    result[month] = data.success;
  });
  return result;
};

const gamesPerMonth2023 = convert2023ToGamesPerMonth(stats2023Raw as Stats2023);
const totalGames2023 = Object.values(stats2023Raw as Stats2023).reduce((sum, m) => sum + m.success, 0);
const totalFails2023 = Object.values(stats2023Raw as Stats2023).reduce((sum, m) => sum + m.fails, 0);

const ScrollSection: React.FC<ScrollSectionProps> = ({ player, totalPlayers, allPlayers, quizResults }) => {
  const { t, i18n } = useTranslation();
  const [showStreakDates, setShowStreakDates] = useState<boolean>(false);
  const [showStreakRanking, setShowStreakRanking] = useState<boolean>(false);
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);
  const [showGameDates, setShowGameDates] = useState<boolean>(false);
  const [showGamesRanking, setShowGamesRanking] = useState<boolean>(false);

  // Calculate community stats
  const communityStats = useMemo(() => calculateCommunityStats(rawCommunityStats), []);

  // Calculate community streak (2024-2025)
  const communityStreak = useMemo(
    () => calculateCommunityStreak(rawCommunityStats.games2024, rawCommunityStats.games2025),
    []
  );

  // Calculate peak performance (consecutive community games) - same as Stories
  const peakPerformance = useMemo(
    () => calculatePeakPerformance(player.dates2025 || [], rawCommunityStats.games2025),
    [player.dates2025]
  );

  // Format date to dd.mm EU format
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

  // All community game dates (played games only) and player dates set
  const allCommunityGameDates = useMemo(() => {
    return rawCommunityStats.games2025
      .filter(g => g.played)
      .map(g => g.date)
      .sort((a, b) => {
        const [dayA, monthA] = a.split('/').map(Number);
        const [dayB, monthB] = b.split('/').map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });
  }, []);

  const playerDatesSet = useMemo(() => new Set(player.dates2025 || []), [player.dates2025]);

  // Calculate streak ranking once and derive player rank from it
  const { streakRanking, playerStreakRank } = useMemo(() => {
    const playersWithStreak = allPlayers.map(p => ({
      ...p,
      calculatedStreak: calculatePeakPerformance(p.dates2025 || [], rawCommunityStats.games2025).streakLength
    }));
    const sorted = playersWithStreak
      .filter(p => p.calculatedStreak > 0)
      .sort((a, b) => b.calculatedStreak - a.calculatedStreak);
    const rank = sorted.findIndex(p => p.name === player.name) + 1;
    return { streakRanking: sorted, playerStreakRank: rank };
  }, [allPlayers, player.name]);

  // Games ranking (ALL players by total games 2025)
  const gamesRanking = useMemo(() => {
    return [...allPlayers]
      .filter(p => p.total2025 > 0)
      .sort((a, b) => b.total2025 - a.total2025);
  }, [allPlayers]);

  const bestWorst = getBestWorstMonths(player.games2025);
  const seasons = getBestSeason(player.games2025);
  const percentile = getPercentile(player.rank2025, totalPlayers);
  const futureGames = getFutureProjection(player.total2025);
  const gamesDiff = player.total2025 - player.total2024;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Results Button */}
        {quizResults && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => setShowQuizResults(true)}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '2px solid var(--color-accent-green)',
                color: 'var(--color-text-primary)'
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: 'var(--color-accent-green)',
                color: 'var(--color-bg-primary)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">📝</span>
              <span>{t('quiz.results.showResults')}</span>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: quizResults.totalCorrect >= 5
                    ? 'var(--color-accent-green)'
                    : quizResults.totalCorrect >= 3
                    ? 'var(--color-accent-gold)'
                    : 'var(--color-accent-red)',
                  color: 'var(--color-bg-primary)'
                }}
              >
                {quizResults.totalCorrect}/{quizResults.totalQuestions}
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* Monthly breakdown chart */}
        <StatCard>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
            {t('scroll.monthlyBreakdown')}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            📊 {player.name}
          </p>
          <MonthlyChart data={player.games2025} year="2025" />
        </StatCard>

        {/* Comparison with 2024 */}
        <StatCard delay={0.1}>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
            {t('scroll.comparison2024')}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            📈 {player.name}
          </p>
          <ComparisonChart
            data2024={player.games2024}
            data2025={player.games2025}
          />
        </StatCard>

        {/* Cumulative Growth Chart */}
        <StatCard delay={0.15}>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-green)' }}>
            {t('scroll.cumulativeGrowth')}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            📈 {t('scroll.cumulativeSubtitle')}
          </p>
          <CumulativeChart
            data2024={player.games2024}
            data2025={player.games2025}
          />
        </StatCard>

        {/* Year Heatmaps */}
        <StatCard delay={0.18}>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
            {t('scroll.yearCalendar')}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            📅 {t('scroll.yearCalendarSubtitle')}
          </p>
          <div className="space-y-8">
            <YearHeatmap
              year={2025}
              playerDates={player.dates2025 || []}
              communityGames={rawCommunityStats.games2025}
            />
            <YearHeatmap
              year={2024}
              playerDates={player.dates2024 || []}
              communityGames={rawCommunityStats.games2024}
            />
          </div>
        </StatCard>

        {/* Best and worst months */}
        <StatCard delay={0.2} asGift={true} giftTheme="blue">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-green)' }}>
            🏆 {t('scroll.bestMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.best.map(([month, games]) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                  {formatMonthName(month as MonthKey, i18n.language as 'bg' | 'en')}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {games} {t('story.games')}
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard delay={0.3} asGift={true} giftTheme="red">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-red)' }}>
            📉 {t('scroll.worstMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.worst.map(([month, games]) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">📉</div>
                <div className="text-2xl font-bold">
                  {formatMonthName(month as MonthKey, i18n.language as 'bg' | 'en')}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {games} {t('story.games')}
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Best and worst seasons */}
        <StatCard delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-accent-green)' }}>
                🌍 {t('scroll.bestSeason')}
              </h3>
              <div className="text-6xl mb-3">{getSeasonEmoji(seasons.best[0] as SeasonKey)}</div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {formatSeasonName(seasons.best[0] as SeasonKey, i18n.language as 'bg' | 'en')}
              </div>
              <div className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {seasons.best[1]} {t('story.games')}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-accent-red)' }}>
                🌍 {t('scroll.worstSeason')}
              </h3>
              <div className="text-6xl mb-3">{getSeasonEmoji(seasons.worst[0] as SeasonKey)}</div>
              <div className="text-3xl font-bold">
                {formatSeasonName(seasons.worst[0] as SeasonKey, i18n.language as 'bg' | 'en')}
              </div>
              <div className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {seasons.worst[1]} {t('story.games')}
              </div>
            </div>
          </div>
        </StatCard>

        {/* Achievements */}
        <StatCard delay={0.5} asGift={true} giftTheme="yellow">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-accent-gold)' }}>
            🎯 {t('scroll.achievements')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementBadge
              icon="🎯"
              text={t('achievements.moreGames', { percent: percentile })}
              delay={0.1}
            />
            <AchievementBadge
              icon="🔥"
              text={t('achievements.longestStreak', { streak: peakPerformance.streakLength })}
              delay={0.2}
            />
            <AchievementBadge
              icon="🚀"
              text={t('achievements.futureProjection', { games: futureGames })}
              delay={0.3}
            />
            {gamesDiff > 0 && (
              <AchievementBadge
                icon="📈"
                text={t('achievements.moreThanLastYear', { diff: gamesDiff })}
                delay={0.4}
              />
            )}
            {gamesDiff < 0 && (
              <AchievementBadge
                icon="📉"
                text={t('achievements.lessThanLastYear', { diff: Math.abs(gamesDiff) })}
                delay={0.4}
              />
            )}
            {gamesDiff === 0 && (
              <AchievementBadge
                icon="🟰"
                text={t('achievements.sameAsLastYear')}
                delay={0.4}
              />
            )}
          </div>
        </StatCard>

        {/* Your Games Card */}
        <StatCard delay={0.5}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-accent-green)' }}>
            ⚽ {t('scroll.yourGames')}
          </h2>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
              {player.total2025}
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              {t('scroll.gamesPlayed')}
            </div>
            <div className="mt-2 text-lg" style={{ color: 'var(--color-accent-green)' }}>
              #{player.rank2025} {t('scroll.outOfPlayers', { total: totalPlayers })}
            </div>
          </div>

          {/* Show Dates Button */}
          {player.dates2025 && player.dates2025.length > 0 && (
            <div className="text-center mb-4">
              {!showGameDates ? (
                <motion.button
                  className="px-6 py-3 rounded-full text-lg font-semibold"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-accent-green)',
                    border: '2px solid var(--color-accent-green)'
                  }}
                  onClick={() => setShowGameDates(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📅 {t('scroll.showGameDates')}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  {/* Season Legend */}
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
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
                  </div>

                  {/* Calendar View */}
                  <div
                    className="max-h-64 overflow-y-auto px-4 py-3 rounded-xl mb-3"
                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                  >
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {allCommunityGameDates.map((date) => {
                        const played = playerDatesSet.has(date);
                        const season = getSeasonFromDate(date);
                        const colors = seasonColors[season];
                        return (
                          <span
                            key={date}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: played ? colors.bg : '#4b5563',
                              color: played ? colors.text : '#9ca3af',
                              opacity: played ? 1 : 0.6
                            }}
                          >
                            {formatDateEU(date)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Legend + Back Button */}
                  <div className="flex items-center justify-center gap-4">
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
                      onClick={() => setShowGameDates(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← {t('scroll.hideDates')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Show Ranking Button */}
          <div className="text-center">
            {!showGamesRanking ? (
              <motion.button
                className="px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-accent-gold)',
                  border: '2px solid var(--color-accent-gold)'
                }}
                onClick={() => setShowGamesRanking(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏆 {t('scroll.showGamesRanking')}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-accent-gold)' }}>
                  🏆 {t('scroll.gamesLeaderboard')}
                </h3>
                <div className="max-h-80 overflow-y-auto space-y-2 mb-4 pr-2">
                  {gamesRanking.map((p, index) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: p.name === player.name
                          ? 'var(--color-accent-green)'
                          : 'var(--color-bg-card)',
                        color: p.name === player.name
                          ? 'var(--color-bg-primary)'
                          : 'var(--color-text-primary)'
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-bold">#{index + 1}</span>
                        <span>{p.name}</span>
                      </span>
                      <span className="font-bold">{p.total2025}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  className="px-4 py-2 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text-secondary)'
                  }}
                  onClick={() => setShowGamesRanking(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← {t('scroll.hideRanking')}
                </motion.button>
              </motion.div>
            )}
          </div>
        </StatCard>

        {/* Longest Streak Details */}
        {peakPerformance.streakLength > 0 && (
          <StatCard delay={0.6}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-accent-green)' }}>
              🔥 {t('scroll.yourStreak')}
            </h2>

            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-2" style={{ color: 'var(--color-accent-gold)' }}>
                {peakPerformance.streakLength}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.consecutiveGames')}
              </div>
              {playerStreakRank > 0 && (
                <div className="mt-2 text-lg" style={{ color: 'var(--color-accent-green)' }}>
                  #{playerStreakRank} {t('scroll.inStreakRanking')}
                </div>
              )}
            </div>

            {/* Show Dates Button */}
            {peakPerformance.dates && peakPerformance.dates.length > 0 && (
              <div className="text-center mb-4">
                {!showStreakDates ? (
                  <motion.button
                    className="px-6 py-3 rounded-full text-lg font-semibold"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-accent-green)',
                      border: '2px solid var(--color-accent-green)'
                    }}
                    onClick={() => setShowStreakDates(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📅 {t('scroll.showStreakDates')}
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4"
                  >
                    <div className="text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {peakPerformance.startDate && peakPerformance.endDate && (
                        <span>
                          {formatDateEU(peakPerformance.startDate)} → {formatDateEU(peakPerformance.endDate)}
                        </span>
                      )}
                    </div>
                    <div
                      className="max-h-40 overflow-y-auto px-4 py-3 rounded-xl mb-4"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div className="flex flex-wrap gap-2 justify-center">
                        {peakPerformance.dates.map((date, index) => (
                          <motion.span
                            key={date}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: 'var(--color-accent-green)',
                              color: 'var(--color-bg-primary)'
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {formatDateEU(date)}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      className="px-4 py-2 rounded-full text-sm"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-secondary)'
                      }}
                      onClick={() => setShowStreakDates(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← {t('scroll.hideDates')}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Show Ranking Button */}
            <div className="text-center">
              {!showStreakRanking ? (
                <motion.button
                  className="px-6 py-3 rounded-full text-lg font-semibold"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-accent-gold)',
                    border: '2px solid var(--color-accent-gold)'
                  }}
                  onClick={() => setShowStreakRanking(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏆 {t('scroll.showStreakRanking')}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-accent-gold)' }}>
                    🏆 {t('scroll.streakLeaderboard')}
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-2 mb-4 pr-2">
                    {streakRanking.map((p, index) => (
                      <div
                        key={p.name}
                        className="flex justify-between items-center px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: p.name === player.name
                            ? 'var(--color-accent-green)'
                            : 'var(--color-bg-card)',
                          color: p.name === player.name
                            ? 'var(--color-bg-primary)'
                            : 'var(--color-text-primary)'
                        }}
                      >
                        <span className="font-semibold">
                          #{index + 1} {p.name}
                        </span>
                        <span className="font-bold">
                          🔥 {p.calculatedStreak}
                        </span>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-full text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onClick={() => setShowStreakRanking(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← {t('scroll.hideRanking')}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </StatCard>
        )}

        {/* Community Stats Section */}
        <StatCard delay={0.7}>
          <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--color-accent-green)' }}>
            📊 {t('scroll.communityStats')}
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {t('scroll.communityGamesComparison')}
          </p>
          <CommunityChart
            gamesPerMonth2023={gamesPerMonth2023}
            gamesPerMonth2024={communityStats.gamesPerMonth2024}
            gamesPerMonth2025={communityStats.gamesPerMonth2025}
          />

          {/* Community stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {communityStats.gamesPlayed2025}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.games2025')}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-blue)' }}>
                {communityStats.gamesPlayed2024}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.games2024')}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: '#9b59b6' }}>
                {totalGames2023}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.games2023')}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                {communityStats.avgPlayers2025}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.avgPlayers2025')}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: communityStats.gamesChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                {communityStats.gamesChange >= 0 ? '+' : ''}{communityStats.gamesChange}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.changeVs2024')}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-green)' }}>
                🔥 {communityStreak.streakLength}{communityStreak.spansYears ? '*' : ''}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.longestStreak')}
              </div>
            </div>
          </div>
          {communityStreak.spansYears && (
            <div className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              * {t('scroll.streakSpansYears')}
            </div>
          )}
        </StatCard>

        {/* Summary Card */}
        <SummaryCard player={player} totalPlayers={totalPlayers} />
      </div>

      {/* Quiz Results Modal */}
      {quizResults && (
        <QuizResultsModal
          results={quizResults}
          isOpen={showQuizResults}
          onClose={() => setShowQuizResults(false)}
        />
      )}
    </div>
  );
};

export default ScrollSection;
