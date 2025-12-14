import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ScrollSectionProps, MonthKey, SeasonKey, CommunityStatsRaw } from '../types';
import StatCard from './StatCard';
import AchievementBadge from './AchievementBadge';
import MonthlyChart from './MonthlyChart';
import ComparisonChart from './ComparisonChart';
import CommunityChart from './CommunityChart';
import SummaryCard from './SummaryCard';
import ScrollToTop from './ScrollToTop';
import YearHeatmap from './YearHeatmap';
import CumulativeChart from './CumulativeChart';
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

const rawCommunityStats = communityStatsRaw as CommunityStatsRaw;

const ScrollSection: React.FC<ScrollSectionProps> = ({ player, totalPlayers, allPlayers }) => {
  const { t, i18n } = useTranslation();
  const [showStreakDates, setShowStreakDates] = useState<boolean>(false);
  const [showStreakRanking, setShowStreakRanking] = useState<boolean>(false);

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

  // Calculate streak for all players and rank them
  const streakRanking = useMemo(() => {
    const playersWithStreak = allPlayers.map(p => ({
      ...p,
      calculatedStreak: calculatePeakPerformance(p.dates2025 || [], rawCommunityStats.games2025).streakLength
    }));
    return playersWithStreak
      .filter(p => p.calculatedStreak > 0)
      .sort((a, b) => b.calculatedStreak - a.calculatedStreak)
      .slice(0, 10);
  }, [allPlayers]);

  // Find current player's rank in streak leaderboard
  const playerStreakRank = useMemo(() => {
    const playersWithStreak = allPlayers.map(p => ({
      name: p.name,
      streak: calculatePeakPerformance(p.dates2025 || [], rawCommunityStats.games2025).streakLength
    }));
    const sorted = playersWithStreak
      .filter(p => p.streak > 0)
      .sort((a, b) => b.streak - a.streak);
    return sorted.findIndex(p => p.name === player.name) + 1;
  }, [allPlayers, player.name]);

  const bestWorst = getBestWorstMonths(player.games2025);
  const seasons = getBestSeason(player.games2025);
  const percentile = getPercentile(player.rank2025, totalPlayers);
  const futureGames = getFutureProjection(player.total2025);
  const gamesDiff = player.total2025 - player.total2024;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
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
                  <div className="space-y-2">
                    {streakRanking.map((p, index) => (
                      <motion.div
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="font-semibold">
                          {index + 1}. {p.name}
                        </span>
                        <span className="font-bold">
                          🔥 {p.calculatedStreak}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    className="mt-4 px-4 py-2 rounded-full text-sm"
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
            gamesPerMonth2024={communityStats.gamesPerMonth2024}
            gamesPerMonth2025={communityStats.gamesPerMonth2025}
          />

          {/* Community stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
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

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default ScrollSection;
